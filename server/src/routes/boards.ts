import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { serializeLeads } from "../lib/serialize.js";

export const boardsRouter = Router();

// Lijst van alle borden (zonder leads)
boardsRouter.get("/", async (_req, res) => {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: "asc" },
    include: { stages: { orderBy: { order: "asc" } } },
  });
  res.json(boards);
});

// Default board (handig voor de UI om mee te starten)
boardsRouter.get("/default", async (_req, res) => {
  const board = await getFullBoard({ isDefault: true });
  if (!board) return res.status(404).json({ error: "Geen default board gevonden" });
  res.json(board);
});

// Eén board incl. fases + leads
boardsRouter.get("/:id", async (req, res) => {
  const board = await getFullBoard({ id: req.params.id });
  if (!board) return res.status(404).json({ error: "Board niet gevonden" });
  res.json(board);
});

async function getFullBoard(where: { id?: string; isDefault?: boolean }) {
  const board = await prisma.board.findFirst({
    where,
    include: {
      stages: {
        orderBy: { order: "asc" },
        include: { automations: true },
      },
      leads: { orderBy: { order: "asc" } },
    },
  });
  if (!board) return null;
  return { ...board, leads: serializeLeads(board.leads) };
}
