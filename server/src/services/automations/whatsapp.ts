import { env } from "../../lib/env.js";
import { renderTemplate } from "./templates.js";
import type { AutomationResult } from "./email.js";

/**
 * Verstuurt een WhatsApp-bericht via een Zapier inbound webhook.
 * Zonder ZAPIER_WHATSAPP_WEBHOOK_URL: nette skip (geen fout).
 */
export async function runWhatsappAutomation(
  lead: Record<string, any>,
  rule: { body?: string | null },
): Promise<AutomationResult> {
  const message = renderTemplate(rule.body, lead);

  if (!lead.phone) {
    return { status: "skipped", message: "Geen telefoonnummer op de lead." };
  }
  if (!env.zapierWhatsappUrl) {
    return {
      status: "skipped",
      message: "WhatsApp niet verzonden: geen Zapier-webhook geconfigureerd.",
    };
  }

  try {
    const res = await fetch(env.zapierWhatsappUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: lead.phone,
        message,
        lead: {
          id: lead.id,
          name: [lead.firstName, lead.lastName].filter(Boolean).join(" "),
          company: lead.companyName,
        },
      }),
    });
    if (!res.ok) {
      return { status: "failed", message: `Zapier-fout ${res.status}: ${await res.text()}` };
    }
    return { status: "sent", message: `WhatsApp-bericht via Zapier getriggerd voor ${lead.phone}.` };
  } catch (err: any) {
    return { status: "failed", message: `WhatsApp-automatisering mislukt: ${err.message}` };
  }
}
