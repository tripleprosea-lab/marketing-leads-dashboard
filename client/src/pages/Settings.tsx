import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { StageEditor } from "../components/StageEditor.js";
import { PageHeader } from "../components/PageHeader.js";

export function Settings() {
  const queryClient = useQueryClient();
  const { data: board, isLoading } = useQuery({ queryKey: ["board"], queryFn: api.getDefaultBoard });
  const { data: integrations } = useQuery({ queryKey: ["integrations"], queryFn: api.getIntegrations });

  const [newStage, setNewStage] = useState("");

  const createStage = useMutation({
    mutationFn: (name: string) => api.createStage({ boardId: board!.id, name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board"] }),
  });

  if (isLoading || !board) return <div className="p-8 text-slate-500">Laden…</div>;

  const connections = [
    { key: "exa", label: "Exa (verrijking)", on: integrations?.exa },
    { key: "anthropic", label: "Anthropic / Claude (verrijking)", on: integrations?.anthropic },
    { key: "activecampaign", label: "ActiveCampaign (e-mail)", on: integrations?.activecampaign },
    { key: "zapier", label: "Zapier (WhatsApp)", on: integrations?.zapier },
    { key: "wordpressSecret", label: "WordPress webhook-secret", on: integrations?.wordpressSecret },
  ];

  return (
    <div>
      <PageHeader title="Instellingen" subtitle="Fases en koppelingen beheren" />
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        {/* Fasebeheer */}
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Fases ({board.name})</h2>
          <div className="space-y-3">
            {board.stages.map((stage) => (
              <StageEditor key={stage.id} stage={stage} />
            ))}
          </div>
          <div className="mt-4 flex gap-2">
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
        </section>

        {/* Koppelingen */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Koppelingen</h2>
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
            {connections.map((c) => (
              <div key={c.key} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{c.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    c.on ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {c.on ? "Gekoppeld" : "Niet gekoppeld"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Koppelingen stel je in via het <code>.env</code>-bestand. Zonder koppeling worden
            verrijking en automatiseringen netjes overgeslagen.
          </p>
        </section>
      </div>
    </div>
  );
}
