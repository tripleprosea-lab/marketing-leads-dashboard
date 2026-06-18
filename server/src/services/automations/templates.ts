/** Vervangt {{veld}} placeholders door waarden uit de lead. */
export function renderTemplate(template: string | null | undefined, lead: Record<string, any>): string {
  if (!template) return "";
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const value = key.split(".").reduce((acc: any, k: string) => acc?.[k], lead);
    return value == null ? "" : String(value);
  });
}
