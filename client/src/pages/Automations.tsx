import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { AutomationEditor } from "../components/AutomationEditor.js";
import { PageHeader } from "../components/PageHeader.js";

export function Automations() {
  const { data: board, isLoading } = useQuery({ queryKey: ["board"], queryFn: api.getDefaultBoard });

  if (isLoading || !board) return <div className="p-8 text-slate-500">Laden…</div>;

  const totalRules = board.stages.reduce((n, s) => n + (s.automations?.length ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Automatiseringen"
        subtitle={`${totalRules} regel(s) verdeeld over ${board.stages.length} fases — uitgevoerd zodra een lead in de fase komt`}
      />
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        {board.stages.map((stage) => (
          <div
            key={stage.id}
            className="rounded-lg border border-slate-200 bg-white p-3"
            style={{ borderTop: `4px solid ${stage.color}` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">{stage.name}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                {stage.automations?.length ?? 0} regel(s)
              </span>
            </div>
            <AutomationEditor stage={stage} />
          </div>
        ))}
      </div>
    </div>
  );
}
