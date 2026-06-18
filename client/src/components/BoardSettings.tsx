import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Board, Stage, AutomationRule } from "../lib/types.js";
import { api } from "../lib/api.js";

interface Props {
  board: Board;
  onClose: () => void;
}

export function BoardSettings({ board, onClose }: Props) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["board"] });

  const updateStage = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Stage> }) => api.updateStage(id, data),
    onSuccess: invalidate,
  });
  const deleteStage = useMutation({
    mutationFn: (id: string) => api.deleteStage(id),
    onSuccess: invalidate,
  });
  const createStage = useMutation({
    mutationFn: (name: string) => api.createStage({ boardId: board.id, name }),
    onSuccess: invalidate,
  });

  const [newStage, setNewStage] = useState("");

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Bord instellen</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="space-y-4">
          {board.stages.map((stage) => (
            <StageEditor
              key={stage.id}
              stage={stage}
              onUpdate={(data) => updateStage.mutate({ id: stage.id, data })}
              onDelete={() => deleteStage.mutate(stage.id)}
              invalidate={invalidate}
            />
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <input
            className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="Nieuwe fase…"
            value={newStage}
            onChange={(e) => setNewStage(e.target.value)}
          />
          <button
            onClick={() => {
              if (newStage.trim()) {
                createStage.mutate(newStage.trim());
                setNewStage("");
              }
            }}
            className="rounded bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-900"
          >
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}

function StageEditor({
  stage,
  onUpdate,
  onDelete,
  invalidate,
}: {
  stage: Stage;
  onUpdate: (data: Partial<Stage>) => void;
  onDelete: () => void;
  invalidate: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3" style={{ borderLeft: `4px solid ${stage.color}` }}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm font-medium"
          defaultValue={stage.name}
          onBlur={(e) => e.target.value !== stage.name && onUpdate({ name: e.target.value })}
        />
        <label className="flex items-center gap-1 text-xs text-slate-500">
          Kleur
          <input
            type="color"
            defaultValue={stage.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-6 w-8 rounded border"
          />
        </label>
        <label className="flex items-center gap-1 text-xs text-slate-500">
          Win-kans %
          <input
            type="number"
            min={0}
            max={100}
            defaultValue={Math.round(stage.probability * 100)}
            onBlur={(e) => onUpdate({ probability: Math.min(100, Math.max(0, Number(e.target.value))) / 100 })}
            className="w-16 rounded border border-slate-300 px-1 py-0.5 text-sm"
          />
        </label>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-slate-600">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={stage.isWon}
            onChange={(e) => onUpdate({ isWon: e.target.checked, ...(e.target.checked ? { color: "#22c55e" } : {}) })}
          />
          Gewonnen (groen)
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={stage.isLost} onChange={(e) => onUpdate({ isLost: e.target.checked })} />
          Verloren
        </label>
        <button onClick={onDelete} className="ml-auto text-red-500 hover:underline">
          Verwijderen
        </button>
      </div>
      <AutomationEditor stage={stage} invalidate={invalidate} />
    </div>
  );
}

function AutomationEditor({ stage, invalidate }: { stage: Stage; invalidate: () => void }) {
  const create = useMutation({
    mutationFn: (type: "EMAIL" | "WHATSAPP") => api.createAutomation({ stageId: stage.id, type }),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AutomationRule> }) => api.updateAutomation(id, data),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: string) => api.deleteAutomation(id), onSuccess: invalidate });

  return (
    <div className="mt-3 rounded bg-slate-50 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">Automatiseringen bij binnenkomst</span>
        <div className="flex gap-1">
          <button onClick={() => create.mutate("EMAIL")} className="rounded bg-white px-2 py-0.5 text-xs hover:bg-slate-100">
            + E-mail
          </button>
          <button onClick={() => create.mutate("WHATSAPP")} className="rounded bg-white px-2 py-0.5 text-xs hover:bg-slate-100">
            + WhatsApp
          </button>
        </div>
      </div>
      {(stage.automations ?? []).map((rule) => (
        <div key={rule.id} className="mb-2 rounded border border-slate-200 bg-white p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">{rule.type}</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[10px] text-slate-500">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={(e) => update.mutate({ id: rule.id, data: { enabled: e.target.checked } })}
                />
                actief
              </label>
              <button onClick={() => remove.mutate(rule.id)} className="text-red-500 text-xs hover:underline">
                ✕
              </button>
            </div>
          </div>
          {rule.type === "EMAIL" && (
            <input
              className="mb-1 w-full rounded border border-slate-200 px-1.5 py-0.5 text-xs"
              placeholder="Onderwerp (gebruik {{firstName}})"
              defaultValue={rule.subject ?? ""}
              onBlur={(e) => update.mutate({ id: rule.id, data: { subject: e.target.value } })}
            />
          )}
          <textarea
            className="w-full rounded border border-slate-200 px-1.5 py-0.5 text-xs"
            rows={2}
            placeholder={`Bericht (gebruik {{firstName}}, {{companyName}})`}
            defaultValue={rule.body ?? ""}
            onBlur={(e) => update.mutate({ id: rule.id, data: { body: e.target.value } })}
          />
        </div>
      ))}
    </div>
  );
}
