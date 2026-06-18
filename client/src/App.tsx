import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Lead } from "./lib/types.js";
import { api } from "./lib/api.js";
import { formatCurrency } from "./lib/format.js";
import { KanbanBoard } from "./components/KanbanBoard.js";
import { LeadDetailDrawer } from "./components/LeadDetailDrawer.js";
import { BoardSettings } from "./components/BoardSettings.js";

export default function App() {
  const queryClient = useQueryClient();
  const { data: board, isLoading, error } = useQuery({
    queryKey: ["board"],
    queryFn: api.getDefaultBoard,
  });

  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const addLead = useMutation({
    mutationFn: () => api.createLead({ boardId: board!.id, firstName: "Nieuwe", lastName: "lead" }),
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
      setOpenLeadId(lead.id);
    },
  });

  const totals = useMemo(() => {
    if (!board) return { expected: 0, won: 0, open: 0 };
    const wonStageIds = new Set(board.stages.filter((s) => s.isWon).map((s) => s.id));
    let expected = 0;
    let won = 0;
    let open = 0;
    for (const lead of board.leads) {
      if (wonStageIds.has(lead.stageId)) won += lead.dealValue ?? 0;
      else {
        expected += lead.expectedRevenue ?? 0;
        open += 1;
      }
    }
    return { expected, won, open };
  }, [board]);

  if (isLoading) return <div className="p-8 text-slate-500">Laden…</div>;
  if (error || !board)
    return (
      <div className="p-8 text-red-600">
        Kon het bord niet laden. Draait de server en is de database geseed?
      </div>
    );

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{board.name}</h1>
            <p className="text-xs text-slate-500">Marketing leads dashboard</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Stat label="Open leads" value={String(totals.open)} />
            <Stat label="Verwachte omzet" value={formatCurrency(totals.expected)} accent="indigo" />
            <Stat label="Gewonnen omzet" value={formatCurrency(totals.won)} accent="green" />
            <button
              onClick={() => addLead.mutate()}
              className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-900"
            >
              + Lead
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              ⚙ Bord instellen
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <KanbanBoard board={board} onOpenLead={(l: Lead) => setOpenLeadId(l.id)} />
      </main>

      {openLeadId && <LeadDetailDrawer leadId={openLeadId} onClose={() => setOpenLeadId(null)} />}
      {settingsOpen && <BoardSettings board={board} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "indigo" | "green" }) {
  const color = accent === "indigo" ? "text-indigo-700" : accent === "green" ? "text-green-700" : "text-slate-700";
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}
