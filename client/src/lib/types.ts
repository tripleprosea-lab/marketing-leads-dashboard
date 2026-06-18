export type LeadSource = "SEO" | "SEA" | "SOCIAL" | "DIRECT";
export type EnrichmentStatus = "PENDING" | "DONE" | "FAILED" | "SKIPPED";
export type AutomationType = "EMAIL" | "WHATSAPP";

export interface AutomationRule {
  id: string;
  stageId: string;
  type: AutomationType;
  trigger: "ON_ENTER";
  enabled: boolean;
  subject?: string | null;
  body?: string | null;
}

export interface Stage {
  id: string;
  boardId: string;
  name: string;
  order: number;
  color: string;
  isWon: boolean;
  isLost: boolean;
  probability: number;
  automations?: AutomationRule[];
}

export interface Lead {
  id: string;
  boardId: string;
  stageId: string;
  order: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  linkedinUrl?: string | null;
  companyName?: string | null;
  companyDomain?: string | null;
  industry?: string | null;
  companySize?: string | null;
  companyLocation?: string | null;
  dealValue?: number | null;
  expectedRevenue?: number | null;
  notes?: string | null;
  source: LeadSource;
  originBron: string;
  enrichmentStatus: EnrichmentStatus;
  enrichmentData?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  activities?: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  leadId: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  isDefault: boolean;
  stages: Stage[];
  leads: Lead[];
}
