import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Stage } from "../lib/types.js";
import { api } from "../lib/api.js";
import { AutomationEditor } from "./AutomationEditor.js";

interface Props {
  stage: Stage;
  /** Toon de automatiseringen-sectie binnen de fasekaart (standaard true). */
  showAutomations?: boolean;
}

/** Bewerkt één fase: naam, kleur, win-kans, gewonnen/verloren + (optioneel) automatiseringen. */
export function StageEditor({ stage, showAutomations = true }: Props) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["board"] });

  const update = useMutation({
    mutationFn: (data: Partial<Stage>) => api.updateStage(stage.id, data),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: () => api.deleteStage(stage.id),
    onSuccess: invalidate,
  });

  return (
    <div className="rounded-lg border border-slate-200 p-3" style={{ borderLeft: `4px solid ${stage.color}` }}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm font-medium"
          defaultValue={stage.name}
          onBlur={(e) => e.target.value !== stage.name && update.mutate({ name: e.target.value })}
        />
        <label className="flex items-center gap-1 text-xs text-slate-500">
          Kleur
          <input
            type="color"
            defaultValue={stage.color}
            onChange={(e) => update.mutate({ color: e.target.value })}
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
            onBlur={(e) => update.mutate({ probability: Math.min(100, Math.max(0, Number(e.target.value))) / 100 })}
            className="w-16 rounded border border-slate-300 px-1 py-0.5 text-sm"
          />
        </label>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-slate-600">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={stage.isWon}
            onChange={(e) => update.mutate({ isWon: e.target.checked, ...(e.target.checked ? { color: "#22c55e" } : {}) })}
          />
          Gewonnen (groen)
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={stage.isLost} onChange={(e) => update.mutate({ isLost: e.target.checked })} />
          Verloren
        </label>
        <button onClick={() => remove.mutate()} className="ml-auto text-red-500 hover:underline">
          Verwijderen
        </button>
      </div>
      {showAutomations && <AutomationEditor stage={stage} />}
    </div>
  );
}
