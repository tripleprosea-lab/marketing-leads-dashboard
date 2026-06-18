import type { LeadSource } from "../lib/types.js";
import { SOURCE_STYLES } from "../lib/format.js";

export function SourceBadge({ source }: { source: LeadSource }) {
  const style = SOURCE_STYLES[source];
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.className}`}>
      {style.label}
    </span>
  );
}
