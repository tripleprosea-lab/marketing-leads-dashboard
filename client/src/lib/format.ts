import type { LeadSource } from "./types.js";

export function formatCurrency(value?: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export const SOURCE_STYLES: Record<LeadSource, { label: string; className: string }> = {
  SEO: { label: "SEO", className: "bg-emerald-100 text-emerald-700" },
  SEA: { label: "SEA", className: "bg-amber-100 text-amber-700" },
  SOCIAL: { label: "Social", className: "bg-sky-100 text-sky-700" },
  DIRECT: { label: "Direct", className: "bg-slate-200 text-slate-700" },
};

export const ENRICHMENT_LABELS: Record<string, string> = {
  PENDING: "Verrijken…",
  DONE: "Verrijkt",
  FAILED: "Verrijking mislukt",
  SKIPPED: "Niet verrijkt",
};
