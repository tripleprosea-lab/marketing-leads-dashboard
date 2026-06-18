import { Router } from "express";
import { env } from "../lib/env.js";

export const integrationsRouter = Router();

/** Geeft per koppeling terug of die geconfigureerd is (booleans, geen secrets). */
integrationsRouter.get("/", (_req, res) => {
  res.json({
    exa: !!env.exaApiKey,
    anthropic: !!env.anthropicApiKey,
    activecampaign: !!(env.activeCampaignUrl && env.activeCampaignKey),
    zapier: !!env.zapierWhatsappUrl,
    wordpressSecret: !!env.wordpressSecret,
  });
});
