import express from "express";
import cors from "cors";
import { env } from "./lib/env.js";
import { boardsRouter } from "./routes/boards.js";
import { stagesRouter } from "./routes/stages.js";
import { leadsRouter } from "./routes/leads.js";
import { automationsRouter } from "./routes/automations.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { integrationsRouter } from "./routes/integrations.js";

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/boards", boardsRouter);
app.use("/api/stages", stagesRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/automations", automationsRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/integrations", integrationsRouter);

// Generieke foutafhandeling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err?.message ?? "Interne serverfout" });
});

app.listen(env.port, () => {
  console.log(`API draait op http://localhost:${env.port}`);
});
