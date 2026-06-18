import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Lead } from "../lib/types.js";
import { api } from "../lib/api.js";
import { formatCurrency, ENRICHMENT_LABELS } from "../lib/format.js";
import { SourceBadge } from "./SourceBadge.js";

interface Props {
  leadId: string;
  onClose: () => void;
}

const FIELDS: { key: keyof Lead; label: string }[] = [
  { key: "firstName", label: "Voornaam" },
  { key: "lastName", label: "Achternaam" },
  { key: "email", label: "E-mail" },
  { key: "phone", label: "Telefoon" },
  { key: "jobTitle", label: "Functie" },
  { key: "companyName", label: "Bedrijf" },
  { key: "companyDomain", label: "Domein" },
  { key: "industry", label: "Sector" },
  { key: "companySize", label: "Bedrijfsgrootte" },
  { key: "companyLocation", label: "Locatie" },
];

export function LeadDetailDrawer({ leadId, onClose }: Props) {
  const queryClient = useQueryClient();
  const { data: lead } = useQuery({ queryKey: ["lead", leadId], queryFn: () => api.getLead(leadId) });
  const [form, setForm] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (lead) setForm(lead);
  }, [lead]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    queryClient.invalidateQueries({ queryKey: ["board"] });
  };

  const save = useMutation({
    mutationFn: (data: Partial<Lead>) => api.updateLead(leadId, data),
    onSuccess: invalidate,
  });
  const enrich = useMutation({ mutationFn: () => api.enrichLead(leadId), onSuccess: invalidate });
  const remove = useMutation({
    mutationFn: () => api.deleteLead(leadId),
    onSuccess: () => {
      invalidate();
      onClose();
    },
  });

  if (!lead) return null;

  function handleSave() {
    const payload: Partial<Lead> = {};
    for (const { key } of FIELDS) (payload as any)[key] = (form as any)[key] ?? null;
    payload.dealValue = form.dealValue != null ? Number(form.dealValue) : null;
    payload.notes = form.notes ?? null;
    save.mutate(payload);
  }

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-800">Lead bewerken</h2>
            <SourceBadge source={lead.source} />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="mb-3 flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span>{ENRICHMENT_LABELS[lead.enrichmentStatus]}</span>
          <button
            onClick={() => enrich.mutate()}
            className="rounded bg-indigo-600 px-2 py-1 text-white hover:bg-indigo-700"
          >
            {enrich.isPending ? "Bezig…" : "Verrijk opnieuw"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map(({ key, label }) => (
            <label key={key} className="text-xs text-slate-500">
              {label}
              <input
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-800"
                value={(form[key] as string) ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}
          <label className="text-xs text-slate-500">
            Dealwaarde (€)
            <input
              type="number"
              className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-800"
              value={form.dealValue ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, dealValue: e.target.value === "" ? null : Number(e.target.value) }))
              }
            />
          </label>
          <div className="text-xs text-slate-500">
            Verwachte omzet
            <div className="mt-0.5 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-semibold text-indigo-700">
              {formatCurrency(lead.expectedRevenue)}
            </div>
          </div>
        </div>

        <label className="mt-3 block text-xs text-slate-500">
          Notities
          <textarea
            className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-800"
            rows={3}
            value={form.notes ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </label>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-900"
          >
            {save.isPending ? "Opslaan…" : "Opslaan"}
          </button>
          <button
            onClick={() => remove.mutate()}
            className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Verwijderen
          </button>
        </div>

        {lead.activities && lead.activities.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Activiteiten</h3>
            <ul className="space-y-1 text-xs text-slate-500">
              {lead.activities.map((a) => (
                <li key={a.id} className="rounded bg-slate-50 px-2 py-1">
                  <span className="font-medium text-slate-600">{a.type}</span> — {a.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
