// Fictieve marketingdata voor het Marketing dashboard.
// Centraal en getypeerd, zodat dit later vervangen kan worden door echte koppelingen
// (Google Analytics, Search Console, META Ads, Google Ads) via de backend/MCP.

export interface DailyPoint {
  date: string;
  [key: string]: number | string;
}

function lastDays(n: number): string[] {
  const out: string[] = [];
  const today = new Date("2026-06-18");
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(`${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

// Deterministische "ruis" zodat grafieken er natuurlijk uitzien (geen echte randomness).
function wave(i: number, base: number, amp: number, period = 7) {
  return Math.round(base + amp * Math.sin((i / period) * Math.PI * 2) + amp * 0.3 * Math.sin(i / 2));
}

const DAYS30 = lastDays(30);

/* ---------- Google Analytics ---------- */
export const gaKpis = {
  sessions: 18432,
  users: 12876,
  bounceRate: 41.3, // %
  avgSessionSec: 168,
  conversions: 642,
};

export const gaDaily: DailyPoint[] = DAYS30.map((date, i) => ({
  date,
  sessies: wave(i, 600, 140),
  gebruikers: wave(i, 420, 100),
}));

export const gaChannels = [
  { name: "Organisch", value: 7200, color: "#22c55e" },
  { name: "Betaald (SEA)", value: 4100, color: "#f59e0b" },
  { name: "Social", value: 3300, color: "#0ea5e9" },
  { name: "Direct", value: 2600, color: "#64748b" },
  { name: "Referral", value: 1232, color: "#a855f7" },
];

/* ---------- SEO / Search Console ---------- */
export const seoKpis = {
  clicks: 9120,
  impressions: 284500,
  ctr: 3.2, // %
  position: 12.4,
};

export const seoDaily: DailyPoint[] = DAYS30.map((date, i) => ({
  date,
  clicks: wave(i, 300, 70),
  impressies: wave(i, 9000, 1800),
}));

export const seoTopQueries = [
  { query: "marketing automation software", clicks: 412, impressions: 9800, ctr: 4.2, position: 6.1 },
  { query: "leads dashboard", clicks: 388, impressions: 7200, ctr: 5.4, position: 4.8 },
  { query: "crm voor mkb", clicks: 274, impressions: 11200, ctr: 2.4, position: 9.3 },
  { query: "wordpress leads koppelen", clicks: 201, impressions: 5400, ctr: 3.7, position: 7.0 },
  { query: "whatsapp marketing", clicks: 176, impressions: 8900, ctr: 2.0, position: 14.2 },
];

/* ---------- META Ads (betaald + organisch) ---------- */
export const metaPaidKpis = {
  spend: 6450, // EUR
  reach: 142000,
  impressions: 318000,
  ctr: 1.8, // %
  roas: 3.4,
};

export const metaOrganicKpis = {
  reach: 38400,
  engagement: 5120,
  followers: 8740,
  posts: 22,
};

export const metaDaily: DailyPoint[] = DAYS30.map((date, i) => ({
  date,
  spend: wave(i, 210, 60),
  bereik: wave(i, 4600, 1200),
}));

/* ---------- SEA / Google Ads ---------- */
export const seaKpis = {
  spend: 8230, // EUR
  clicks: 5640,
  impressions: 196000,
  cpc: 1.46, // EUR
  conversions: 318,
  roas: 4.1,
};

export const seaDaily: DailyPoint[] = DAYS30.map((date, i) => ({
  date,
  spend: wave(i, 270, 70),
  conversies: wave(i, 10, 5, 5),
}));
