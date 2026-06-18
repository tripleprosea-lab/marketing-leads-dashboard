/** Zet Prisma Decimal-velden om naar gewone numbers voor JSON-respons. */
export function serializeLead<T extends { dealValue?: any; expectedRevenue?: any }>(lead: T): T {
  return {
    ...lead,
    dealValue: lead.dealValue != null ? Number(lead.dealValue) : null,
    expectedRevenue: lead.expectedRevenue != null ? Number(lead.expectedRevenue) : null,
  };
}

export function serializeLeads<T extends { dealValue?: any; expectedRevenue?: any }>(leads: T[]): T[] {
  return leads.map(serializeLead);
}
