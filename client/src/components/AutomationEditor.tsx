import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Stage, AutomationRule } from "../lib/types.js";
import { api } from "../lib/api.js";

/** Beheert de ON_ENTER-automatiseringen (e-mail/WhatsApp) van één fase. */
export function AutomationEditor({ stage }: { stage: Stage }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["board"] });

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
      {(stage.automations ?? []).length === 0 && (
        <p className="px-1 py-1 text-[11px] text-slate-400">Nog geen automatiseringen voor deze fase.</p>
      )}
      {(stage.automations ?? []).map((rule) => (
        <div key={rule.id} className="mb-2 rounded border border-slate-200 bg-white p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              {rule.type === "EMAIL" ? "📧 E-mail" : "💬 WhatsApp"}
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[10px] text-slate-500">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={(e) => update.mutate({ id: rule.id, data: { enabled: e.target.checked } })}
                />
                actief
              </label>
              <button onClick={() => remove.mutate(rule.id)} className="text-xs text-red-500 hover:underline">
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
            placeholder="Bericht (gebruik {{firstName}}, {{companyName}})"
            defaultValue={rule.body ?? ""}
            onBlur={(e) => update.mutate({ id: rule.id, data: { body: e.target.value } })}
          />
        </div>
      ))}
    </div>
  );
}
