import { prisma } from "../../lib/prisma.js";
import { runEmailAutomation } from "./email.js";
import { runWhatsappAutomation } from "./whatsapp.js";

/**
 * Voert alle ingeschakelde ON_ENTER-automatiseringen uit voor de fase
 * waar de lead naartoe is verplaatst. Resultaten worden gelogd in ActivityLog.
 */
export async function runStageEnterAutomations(leadId: string, stageId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  const rules = await prisma.automationRule.findMany({
    where: { stageId, trigger: "ON_ENTER", enabled: true },
  });

  for (const rule of rules) {
    const result =
      rule.type === "EMAIL"
        ? await runEmailAutomation(lead as any, rule)
        : await runWhatsappAutomation(lead as any, rule);

    await prisma.activityLog.create({
      data: {
        leadId,
        type: `automation:${rule.type.toLowerCase()}`,
        message: `[${result.status}] ${result.message}`,
      },
    });
  }
}
