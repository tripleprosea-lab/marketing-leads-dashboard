import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";

interface EnrichedFields {
  companyName?: string;
  companyDomain?: string;
  industry?: string;
  companySize?: string;
  companyLocation?: string;
  jobTitle?: string;
  linkedinUrl?: string;
}

function domainFromEmail(email?: string | null): string | null {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@")[1]?.toLowerCase();
  const freemail = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "live.nl", "icloud.com"];
  if (!domain || freemail.includes(domain)) return null;
  return domain;
}

/** Exa web-search om context over het bedrijf/contact op te halen. */
async function exaSearch(query: string): Promise<string> {
  if (!env.exaApiKey) throw new Error("EXA_API_KEY ontbreekt");
  const res = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.exaApiKey,
    },
    body: JSON.stringify({
      query,
      numResults: 5,
      type: "auto",
      contents: { text: { maxCharacters: 2000 } },
    }),
  });
  if (!res.ok) throw new Error(`Exa-fout ${res.status}: ${await res.text()}`);
  const data: any = await res.json();
  return (data.results ?? [])
    .map((r: any) => `# ${r.title}\n${r.url}\n${r.text ?? ""}`)
    .join("\n\n");
}

/** LLM structureert ruwe webtekst naar nette bedrijfs-/contactvelden. */
async function structureWithLlm(context: string, lead: any): Promise<EnrichedFields> {
  if (!env.anthropicApiKey) throw new Error("ANTHROPIC_API_KEY ontbreekt");
  const prompt = `Je bent een data-verrijker. Op basis van onderstaande webresultaten, vul de bedrijfs- en contactgegevens aan voor deze lead.

Lead: ${JSON.stringify({
    name: [lead.firstName, lead.lastName].filter(Boolean).join(" "),
    email: lead.email,
    company: lead.companyName,
    domain: lead.companyDomain,
  })}

Webresultaten:
${context.slice(0, 8000)}

Geef UITSLUITEND geldige JSON terug met deze velden (laat weg wat onbekend is):
{"companyName":"","companyDomain":"","industry":"","companySize":"","companyLocation":"","jobTitle":"","linkedinUrl":""}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.enrichmentModel,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic-fout ${res.status}: ${await res.text()}`);
  const data: any = await res.json();
  const text: string = data.content?.[0]?.text ?? "{}";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try {
    return JSON.parse(match[0]);
  } catch {
    return {};
  }
}

/**
 * Verrijkt een lead via Exa-websearch + LLM-structurering.
 * Zonder API-keys wordt de lead op SKIPPED gezet (geen fout).
 */
export async function enrichLead(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  if (!env.exaApiKey || !env.anthropicApiKey) {
    await prisma.lead.update({
      where: { id: leadId },
      data: { enrichmentStatus: "SKIPPED" },
    });
    await prisma.activityLog.create({
      data: {
        leadId,
        type: "enrichment",
        message: "Verrijking overgeslagen: EXA_API_KEY of ANTHROPIC_API_KEY ontbreekt.",
      },
    });
    return;
  }

  try {
    const domain = lead.companyDomain ?? domainFromEmail(lead.email);
    const subject = lead.companyName ?? domain ?? lead.email ?? "";
    if (!subject) {
      await prisma.lead.update({ where: { id: leadId }, data: { enrichmentStatus: "SKIPPED" } });
      return;
    }

    const query = `Bedrijfsinformatie en sector voor ${subject}${domain ? ` (${domain})` : ""}`;
    const context = await exaSearch(query);
    const fields = await structureWithLlm(context, lead);

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        companyName: fields.companyName ?? lead.companyName,
        companyDomain: fields.companyDomain ?? lead.companyDomain ?? domain ?? undefined,
        industry: fields.industry ?? lead.industry,
        companySize: fields.companySize ?? lead.companySize,
        companyLocation: fields.companyLocation ?? lead.companyLocation,
        jobTitle: fields.jobTitle ?? lead.jobTitle,
        linkedinUrl: fields.linkedinUrl ?? lead.linkedinUrl,
        enrichmentData: fields as any,
        enrichmentStatus: "DONE",
      },
    });
    await prisma.activityLog.create({
      data: { leadId, type: "enrichment", message: "Lead verrijkt via Exa + AI." },
    });
  } catch (err: any) {
    await prisma.lead.update({ where: { id: leadId }, data: { enrichmentStatus: "FAILED" } });
    await prisma.activityLog.create({
      data: { leadId, type: "enrichment", message: `Verrijking mislukt: ${err.message}` },
    });
  }
}
