import { PrismaClient, LeadSource } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_STAGES = [
  { name: "Nieuw", color: "#94a3b8", probability: 0, isWon: false, isLost: false },
  { name: "Contact gelegd", color: "#3b82f6", probability: 0.1, isWon: false, isLost: false },
  { name: "Gekwalificeerd", color: "#8b5cf6", probability: 0.4, isWon: false, isLost: false },
  { name: "Voorstel verstuurd", color: "#f97316", probability: 0.6, isWon: false, isLost: false },
  { name: "Onderhandeling", color: "#eab308", probability: 0.8, isWon: false, isLost: false },
  { name: "Gewonnen", color: "#22c55e", probability: 1, isWon: true, isLost: false },
  { name: "Verloren", color: "#ef4444", probability: 0, isWon: false, isLost: true },
];

async function main() {
  const existing = await prisma.board.findFirst({ where: { isDefault: true } });
  if (existing) {
    console.log("Default board bestaat al, seed overgeslagen.");
    return;
  }

  const board = await prisma.board.create({
    data: {
      name: "Leads pijplijn",
      isDefault: true,
      stages: {
        create: DEFAULT_STAGES.map((s, i) => ({ ...s, order: i })),
      },
    },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  console.log(`Default board "${board.name}" aangemaakt met ${board.stages.length} fases.`);

  // Wat demo-leads zodat het bord niet leeg is
  const stageByName = (name: string) => board.stages.find((s) => s.name === name)!;
  const demo = [
    {
      firstName: "Anna", lastName: "de Vries", email: "anna@acme.nl",
      companyName: "Acme B.V.", companyDomain: "acme.nl", source: LeadSource.SEO,
      stage: "Nieuw", dealValue: null as number | null,
    },
    {
      firstName: "Bram", lastName: "Jansen", email: "bram@globex.com",
      companyName: "Globex", companyDomain: "globex.com", source: LeadSource.SEA,
      stage: "Gekwalificeerd", dealValue: 12000,
    },
    {
      firstName: "Carla", lastName: "Smit", email: "carla@initech.io",
      companyName: "Initech", companyDomain: "initech.io", source: LeadSource.SOCIAL,
      stage: "Voorstel verstuurd", dealValue: 25000,
    },
  ];

  for (const [i, d] of demo.entries()) {
    const stage = stageByName(d.stage);
    const expected =
      d.dealValue != null && stage.probability >= 0.4
        ? d.dealValue * stage.probability
        : null;
    await prisma.lead.create({
      data: {
        boardId: board.id,
        stageId: stage.id,
        order: i,
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        companyName: d.companyName,
        companyDomain: d.companyDomain,
        source: d.source,
        originBron: "seed",
        dealValue: d.dealValue ?? undefined,
        expectedRevenue: expected ?? undefined,
        enrichmentStatus: "DONE",
      },
    });
  }

  console.log(`${demo.length} demo-leads toegevoegd.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
