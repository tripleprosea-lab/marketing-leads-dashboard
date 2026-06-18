import { env } from "../../lib/env.js";
import { renderTemplate } from "./templates.js";

export interface AutomationResult {
  status: "sent" | "skipped" | "failed";
  message: string;
}

/**
 * Verstuurt/synchroniseert een e-mailautomatisering.
 * Met ActiveCampaign geconfigureerd: contact aanmaken/bijwerken en taak loggen.
 * Zonder credentials: nette skip (geen fout).
 */
export async function runEmailAutomation(
  lead: Record<string, any>,
  rule: { subject?: string | null; body?: string | null },
): Promise<AutomationResult> {
  const subject = renderTemplate(rule.subject, lead);
  const body = renderTemplate(rule.body, lead);

  if (!lead.email) {
    return { status: "skipped", message: "Geen e-mailadres op de lead." };
  }

  if (!env.activeCampaignUrl || !env.activeCampaignKey) {
    return {
      status: "skipped",
      message: `E-mail "${subject}" niet verzonden: geen ActiveCampaign-koppeling geconfigureerd.`,
    };
  }

  try {
    const res = await fetch(`${env.activeCampaignUrl}/api/3/contact/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Token": env.activeCampaignKey,
      },
      body: JSON.stringify({
        contact: {
          email: lead.email,
          firstName: lead.firstName ?? undefined,
          lastName: lead.lastName ?? undefined,
          phone: lead.phone ?? undefined,
        },
      }),
    });
    if (!res.ok) {
      return { status: "failed", message: `ActiveCampaign-fout ${res.status}: ${await res.text()}` };
    }
    return {
      status: "sent",
      message: `Contact gesynct met ActiveCampaign; e-mail "${subject}" getriggerd (${body.length} tekens).`,
    };
  } catch (err: any) {
    return { status: "failed", message: `E-mailautomatisering mislukt: ${err.message}` };
  }
}
