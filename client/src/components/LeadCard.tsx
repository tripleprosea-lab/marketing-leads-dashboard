import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lead } from "../lib/types.js";
import { formatCurrency, ENRICHMENT_LABELS } from "../lib/format.js";
import { SourceBadge } from "./SourceBadge.js";

interface Props {
  lead: Lead;
  onOpen: (lead: Lead) => void;
}

export function LeadCard({ lead, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: "lead", lead },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || lead.email || "Naamloze lead";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(lead)}
      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300 hover:shadow"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800">{name}</span>
        <SourceBadge source={lead.source} />
      </div>
      {lead.companyName && <div className="text-xs text-slate-500">{lead.companyName}</div>}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">
          {lead.dealValue != null ? formatCurrency(lead.dealValue) : "Geen waarde"}
        </span>
        {lead.expectedRevenue != null && (
          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
            verw. {formatCurrency(lead.expectedRevenue)}
          </span>
        )}
      </div>
      <div className="mt-1 text-[10px] text-slate-400">{ENRICHMENT_LABELS[lead.enrichmentStatus]}</div>
    </div>
  );
}
