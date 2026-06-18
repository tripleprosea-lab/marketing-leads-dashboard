import type { Board, Lead, Stage, AutomationRule } from "./types.js";

async function http<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ? JSON.stringify(body.error) : `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getDefaultBoard: () => http<Board>("/api/boards/default"),

  // Leads
  createLead: (data: Partial<Lead> & { boardId: string }) =>
    http<Lead>("/api/leads", { method: "POST", body: JSON.stringify(data) }),
  updateLead: (id: string, data: Partial<Lead>) =>
    http<Lead>(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  moveLead: (id: string, stageId: string, order?: number) =>
    http<Lead>(`/api/leads/${id}/move`, { method: "PATCH", body: JSON.stringify({ stageId, order }) }),
  enrichLead: (id: string) => http<{ ok: boolean }>(`/api/leads/${id}/enrich`, { method: "POST" }),
  getLead: (id: string) => http<Lead>(`/api/leads/${id}`),
  deleteLead: (id: string) => http<{ ok: boolean }>(`/api/leads/${id}`, { method: "DELETE" }),

  // Stages
  createStage: (data: { boardId: string; name: string; color?: string; probability?: number }) =>
    http<Stage>("/api/stages", { method: "POST", body: JSON.stringify(data) }),
  updateStage: (id: string, data: Partial<Stage>) =>
    http<Stage>(`/api/stages/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  reorderStages: (order: string[]) =>
    http<{ ok: boolean }>("/api/stages/reorder/apply", { method: "PATCH", body: JSON.stringify({ order }) }),
  deleteStage: (id: string) => http<{ ok: boolean }>(`/api/stages/${id}`, { method: "DELETE" }),

  // Automations
  createAutomation: (data: Partial<AutomationRule> & { stageId: string; type: string }) =>
    http<AutomationRule>("/api/automations", { method: "POST", body: JSON.stringify(data) }),
  updateAutomation: (id: string, data: Partial<AutomationRule>) =>
    http<AutomationRule>(`/api/automations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAutomation: (id: string) =>
    http<{ ok: boolean }>(`/api/automations/${id}`, { method: "DELETE" }),
};
