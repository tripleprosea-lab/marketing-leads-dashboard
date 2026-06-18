import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Lead, Stage } from "../lib/types.js";
import { formatCurrency } from "../lib/format.js";
import { LeadCard } from "./LeadCard.js";

interface Props {
  stage: Stage;
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
}

export function KanbanColumn({ stage, leads, onOpenLead }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id, data: { type: "stage", stage } });

  const totalExpected = leads.reduce((sum, l) => sum + (l.expectedRevenue ?? 0), 0);
  const isWon = stage.isWon;

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div
        className="mb-2 flex items-center justify-between rounded-t-lg border-t-4 px-3 py-2"
        style={{ borderColor: stage.color, background: isWon ? "#dcfce7" : "#fff" }}
      >
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${isWon ? "text-green-700" : "text-slate-700"}`}>
            {stage.name}
          </span>
          <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-500">{leads.length}</span>
        </div>
        <span className="text-[10px] text-slate-400">{Math.round(stage.probability * 100)}%</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2 rounded-b-lg p-2 transition-colors ${
          isOver ? "bg-slate-200" : isWon ? "bg-green-50" : "bg-slate-100"
        }`}
      >
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onOpen={onOpenLead} />
          ))}
        </SortableContext>
      </div>

      {totalExpected > 0 && (
        <div className="mt-1 px-1 text-right text-[10px] text-slate-500">
          verw. omzet: <span className="font-semibold">{formatCurrency(totalExpected)}</span>
        </div>
      )}
    </div>
  );
}
