import "dotenv/config";

function get(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

export const env = {
  port: Number(get("PORT") ?? 4000),
  corsOrigin: (get("CORS_ORIGIN") ?? "http://localhost:5173").split(",").map((s) => s.trim()),
  wordpressSecret: get("WORDPRESS_WEBHOOK_SECRET"),

  exaApiKey: get("EXA_API_KEY"),
  anthropicApiKey: get("ANTHROPIC_API_KEY"),
  enrichmentModel: get("ENRICHMENT_MODEL") ?? "claude-opus-4-8",

  activeCampaignUrl: get("ACTIVECAMPAIGN_API_URL"),
  activeCampaignKey: get("ACTIVECAMPAIGN_API_KEY"),

  smtpHost: get("SMTP_HOST"),
  smtpPort: Number(get("SMTP_PORT") ?? 587),
  smtpUser: get("SMTP_USER"),
  smtpPass: get("SMTP_PASS"),
  smtpFrom: get("SMTP_FROM"),

  zapierWhatsappUrl: get("ZAPIER_WHATSAPP_WEBHOOK_URL"),
};
