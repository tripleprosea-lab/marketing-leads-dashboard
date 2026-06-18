import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const automationsRouter = Router();

// Lijst automatiseringen van een fase
automationsRouter.get("/stage/:stageId", async (req, res) => {
  const rules = await prisma.automationRule.findMany({ where: { stageId: req.params.stageId } });
  res.json(rules);
});

const createSchema = z.object({
  stageId: z.string(),
  type: z.enum(["EMAIL", "WHATSAPP"]),
  enabled: z.boolean().optional(),
  subject: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
});

automationsRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const rule = await prisma.automationRule.create({ data: { ...parsed.data, trigger: "ON_ENTER" } });
  res.status(201).json(rule);
});

const updateSchema = z.object({
  type: z.enum(["EMAIL", "WHATSAPP"]).optional(),
  enabled: z.boolean().optional(),
  subject: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
});

automationsRouter.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const rule = await prisma.automationRule.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(rule);
});

automationsRouter.delete("/:id", async (req, res) => {
  await prisma.automationRule.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
