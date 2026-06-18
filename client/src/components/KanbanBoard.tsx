import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Board, Lead } from "../lib/types.js";
import { api } from "../lib/api.js";
import { KanbanColumn } from "./KanbanColumn.js";
import { LeadCard } from "./LeadCard.js";

interface Props {
  board: Board;
  onOpenLead: (lead: Lead) => void;
}

export function KanbanBoard({ board, onOpenLead }: Props) {
  const queryClient = useQueryClient();
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const leadsByStage = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    for (const stage of board.stages) map[stage.id] = [];
    for (const lead of board.leads) (map[lead.stageId] ??= []).push(lead);
    for (const id of Object.keys(map)) map[id].sort((a, b) => a.order - b.order);
    return map;
  }, [board]);

  const moveMutation = useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) => api.moveLead(id, stageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board"] }),
  });

  function handleDragStart(event: DragStartEvent) {
    const lead = event.active.data.current?.lead as Lead | undefined;
    if (lead) setActiveLead(lead);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const lead = active.data.current?.lead as Lead | undefined;
    if (!lead) return;

    // Doelfase: of een stage-droppable, of de fase van de lead waarop gedropt is
    const overData = over.data.current;
    const targetStageId =
      overData?.type === "stage"
        ? (over.id as string)
        : (overData?.lead as Lead | undefined)?.stageId;

    if (!targetStageId || targetStageId === lead.stageId) return;
    moveMutation.mutate({ id: lead.id, stageId: targetStageId });
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {board.stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={leadsByStage[stage.id] ?? []}
            onOpenLead={onOpenLead}
          />
        ))}
      </div>
      <DragOverlay>
        {activeLead ? <LeadCard lead={activeLead} onOpen={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
