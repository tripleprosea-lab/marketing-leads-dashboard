import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import { resolveSource } from "../lib/source.js";
import { enrichLead } from "../services/enrichment.js";

export const webhooksRouter = Router();

/** Haalt een veld uit een payload met meerdere mogelijke sleutelnamen. */
function pick(payload: Record<string, any>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = payload[k] ?? payload[k.toLowerCase()] ?? payload[k.toUpperCase()];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return undefined;
}

function splitName(full?: string): { firstName?: string; lastName?: string } {
  if (!full) return {};
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/**
 * WordPress-intake. Accepteert formulier-submits (Contact Form 7 / WPForms /
 * Gravity Forms) als flat JSON. Beveiligd met X-Webhook-Secret indien geconfigureerd.
 */
webhooksRouter.post("/wordpress", async (req, res) => {
  if (env.wordpressSecret) {
    const provided = req.header("X-Webhook-Secret");
    if (provided !== env.wordpressSecret) {
      return res.status(401).json({ error: "Ongeldig webhook-secret" });
    }
  }

  const p = req.body ?? {};

  const board = await prisma.board.findFirst({ where: { isDefault: true } });
  if (!board) return res.status(500).json({ error: "Geen default board geconfigureerd" });
  const firstStage = await prisma.stage.findFirst({
    where: { boardId: board.id },
    orderBy: { order: "asc" },
  });
  if (!firstStage) return res.status(500).json({ error: "Board heeft geen fases" });

  const fullName = pick(p, ["name", "your-name", "full_name", "fullname"]);
  const { firstName, lastName } = fullName
    ? splitName(fullName)
    : { firstName: pick(p, ["first_name", "firstName"]), lastName: pick(p, ["last_name", "lastName"]) };

  const email = pick(p, ["email", "your-email", "email_address"]);
  const phone = pick(p, ["phone", "tel", "telephone", "your-phone"]);
  const companyName = pick(p, ["company", "company_name", "organisation", "bedrijf"]);
  const notes = pick(p, ["message", "your-message", "comments", "bericht"]);

  const source = resolveSource({
    utmSource: pick(p, ["utm_source"]),
    utmMedium: pick(p, ["utm_medium"]),
    gclid: pick(p, ["gclid"]),
    fbclid: pick(p, ["fbclid"]),
    referrer: pick(p, ["referrer", "referer", "http_referer"]),
  });

  const count = await prisma.lead.count({ where: { stageId: firstStage.id } });
  const lead = await prisma.lead.create({
    data: {
      boardId: board.id,
      stageId: firstStage.id,
      order: count,
      firstName,
      lastName,
      email,
      phone,
      companyName,
      notes,
      source,
      originBron: "wordpress",
      enrichmentStatus: "PENDING",
      rawPayload: p,
    },
  });

  await prisma.activityLog.create({
    data: { leadId: lead.id, type: "intake", message: `Binnengekomen via WordPress (bron: ${source}).` },
  });

  // Verrijking op de achtergrond
  enrichLead(lead.id).catch((e) => console.error("Verrijking-fout:", e));

  res.status(201).json({ ok: true, id: lead.id, source });
});
