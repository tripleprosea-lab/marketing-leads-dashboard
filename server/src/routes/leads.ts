import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { serializeLead } from "../lib/serialize.js";
import { computeExpectedRevenue } from "../lib/revenue.js";
import { runStageEnterAutomations } from "../services/automations/index.js";
import { enrichLead } from "../services/enrichment.js";

export const leadsRouter = Router();

const baseFields = {
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  companyDomain: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  companySize: z.string().optional().nullable(),
  companyLocation: z.string().optional().nullable(),
  dealValue: z.number().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
  source: z.enum(["SEO", "SEA", "SOCIAL", "DIRECT"]).optional(),
};

const createSchema = z.object({
  boardId: z.string(),
  stageId: z.string().optional(),
  ...baseFields,
});

leadsRouter.get("/:id", async (req, res) => {
  const lead = await prisma.lead.findUnique({
    where: { id: req.params.id },
    include: { activities: { orderBy: { createdAt: "desc" } } },
  });
  if (!lead) return res.status(404).json({ error: "Lead niet gevonden" });
  res.json(serializeLead(lead));
});

leadsRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { boardId, stageId, dealValue, ...rest } = parsed.data;
  const stage = stageId
    ? await prisma.stage.findUnique({ where: { id: stageId } })
    : await prisma.stage.findFirst({ where: { boardId }, orderBy: { order: "asc" } });
  if (!stage) return res.status(400).json({ error: "Geen geldige fase" });

  const count = await prisma.lead.count({ where: { stageId: stage.id } });
  const lead = await prisma.lead.create({
    data: {
      boardId,
      stageId: stage.id,
      order: count,
      dealValue: dealValue ?? undefined,
      expectedRevenue: computeExpectedRevenue(dealValue ?? null, stage.probability) ?? undefined,
      ...rest,
    },
  });
  res.status(201).json(serializeLead(lead));
});

const updateSchema = z.object(baseFields);

leadsRouter.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.lead.findUnique({ where: { id: req.params.id }, include: { stage: true } });
  if (!existing) return res.status(404).json({ error: "Lead niet gevonden" });

  const { dealValue, ...rest } = parsed.data;
  const newDealValue = dealValue !== undefined ? dealValue : existing.dealValue != null ? Number(existing.dealValue) : null;

  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      dealValue: dealValue !== undefined ? (dealValue ?? null) : undefined,
      expectedRevenue: computeExpectedRevenue(newDealValue, existing.stage.probability) ?? null,
    },
  });
  res.json(serializeLead(lead));
});

const moveSchema = z.object({
  stageId: z.string(),
  order: z.number().int().optional(),
});

leadsRouter.patch("/:id/move", async (req, res) => {
  const parsed = moveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) return res.status(404).json({ error: "Lead niet gevonden" });

  const targetStage = await prisma.stage.findUnique({ where: { id: parsed.data.stageId } });
  if (!targetStage) return res.status(400).json({ error: "Doelfase bestaat niet" });

  const stageChanged = lead.stageId !== targetStage.id;
  const order = parsed.data.order ?? (await prisma.lead.count({ where: { stageId: targetStage.id } }));

  const updated = await prisma.lead.update({
    where: { id: lead.id },
    data: {
      stageId: targetStage.id,
      order,
      expectedRevenue:
        computeExpectedRevenue(lead.dealValue != null ? Number(lead.dealValue) : null, targetStage.probability) ??
        null,
    },
  });

  if (stageChanged) {
    await prisma.activityLog.create({
      data: { leadId: lead.id, type: "move", message: `Verplaatst naar "${targetStage.name}".` },
    });
    // Automatiseringen op de achtergrond uitvoeren
    runStageEnterAutomations(lead.id, targetStage.id).catch((e) =>
      console.error("Automatisering-fout:", e),
    );
  }

  res.json(serializeLead(updated));
});

leadsRouter.post("/:id/enrich", async (req, res) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) return res.status(404).json({ error: "Lead niet gevonden" });
  await prisma.lead.update({ where: { id: lead.id }, data: { enrichmentStatus: "PENDING" } });
  enrichLead(lead.id).catch((e) => console.error("Verrijking-fout:", e));
  res.json({ ok: true, status: "PENDING" });
});

leadsRouter.delete("/:id", async (req, res) => {
  await prisma.lead.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
