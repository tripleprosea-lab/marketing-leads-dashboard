import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { computeExpectedRevenue } from "../lib/revenue.js";

export const stagesRouter = Router();

const createSchema = z.object({
  boardId: z.string(),
  name: z.string().min(1),
  color: z.string().optional(),
  probability: z.number().min(0).max(1).optional(),
  isWon: z.boolean().optional(),
  isLost: z.boolean().optional(),
});

stagesRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { boardId } = parsed.data;

  const count = await prisma.stage.count({ where: { boardId } });
  const stage = await prisma.stage.create({
    data: { ...parsed.data, order: count },
  });
  res.status(201).json(stage);
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  probability: z.number().min(0).max(1).optional(),
  isWon: z.boolean().optional(),
  isLost: z.boolean().optional(),
});

stagesRouter.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const stage = await prisma.stage.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  // Win-kans gewijzigd -> verwachte omzet van leads in deze fase herberekenen
  if (parsed.data.probability != null) {
    const leads = await prisma.lead.findMany({ where: { stageId: stage.id } });
    await Promise.all(
      leads.map((l) =>
        prisma.lead.update({
          where: { id: l.id },
          data: {
            expectedRevenue:
              computeExpectedRevenue(l.dealValue != null ? Number(l.dealValue) : null, stage.probability) ??
              undefined,
          },
        }),
      ),
    );
  }

  res.json(stage);
});

// Herorden fases: { order: [stageId, stageId, ...] }
const reorderSchema = z.object({ order: z.array(z.string()) });

stagesRouter.patch("/reorder/apply", async (req, res) => {
  const parsed = reorderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  await prisma.$transaction(
    parsed.data.order.map((id, index) =>
      prisma.stage.update({ where: { id }, data: { order: index } }),
    ),
  );
  res.json({ ok: true });
});

stagesRouter.delete("/:id", async (req, res) => {
  const leadCount = await prisma.lead.count({ where: { stageId: req.params.id } });
  if (leadCount > 0) {
    return res.status(409).json({ error: "Verplaats eerst de leads uit deze fase." });
  }
  await prisma.stage.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
