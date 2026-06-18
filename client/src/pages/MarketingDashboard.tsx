import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { PageHeader } from "../components/PageHeader.js";
import {
  gaKpis,
  gaDaily,
  gaChannels,
  seoKpis,
  seoDaily,
  seoTopQueries,
  metaPaidKpis,
  metaOrganicKpis,
  metaDaily,
  seaKpis,
  seaDaily,
} from "../lib/marketingData.js";

const eur = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const num = (n: number) => new Intl.NumberFormat("nl-NL").format(n);

export function MarketingDashboard() {
  return (
    <div>
      <PageHeader title="Marketing dashboard" subtitle="Fictieve data · laatste 30 dagen" />

      <div className="space-y-8 p-6">
        {/* Google Analytics */}
        <Section title="Google Analytics" badge="GA4">
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            <Kpi label="Sessies" value={num(gaKpis.sessions)} />
            <Kpi label="Gebruikers" value={num(gaKpis.users)} />
            <Kpi label="Bouncepercentage" value={`${gaKpis.bounceRate}%`} />
            <Kpi label="Gem. sessieduur" value={`${Math.floor(gaKpis.avgSessionSec / 60)}m ${gaKpis.avgSessionSec % 60}s`} />
            <Kpi label="Conversies" value={num(gaKpis.conversions)} accent="green" />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="Sessies & gebruikers" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={gaDaily} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sessies" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="gebruikers" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Verkeer per kanaal">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={gaChannels} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {gaChannels.map((c) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </Section>

        {/* SEO / Search Console */}
        <Section title="SEO — Search Console" badge="Organisch zoeken">
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Clicks" value={num(seoKpis.clicks)} />
            <Kpi label="Impressies" value={num(seoKpis.impressions)} />
            <Kpi label="CTR" value={`${seoKpis.ctr}%`} />
            <Kpi label="Gem. positie" value={seoKpis.position.toFixed(1)} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Clicks & impressies">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={seoDaily} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="l" type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line yAxisId="r" type="monotone" dataKey="impressies" stroke="#94a3b8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Top zoekopdrachten">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-2 font-medium">Zoekopdracht</th>
                    <th className="pb-2 text-right font-medium">Clicks</th>
                    <th className="pb-2 text-right font-medium">CTR</th>
                    <th className="pb-2 text-right font-medium">Pos.</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {seoTopQueries.map((q) => (
                    <tr key={q.query} className="border-t border-slate-100">
                      <td className="py-1.5">{q.query}</td>
                      <td className="py-1.5 text-right">{num(q.clicks)}</td>
                      <td className="py-1.5 text-right">{q.ctr}%</td>
                      <td className="py-1.5 text-right">{q.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ChartCard>
          </div>
        </Section>

        {/* META Ads */}
        <Section title="META Ads" badge="Betaald + organisch">
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
            <Kpi label="Spend" value={eur(metaPaidKpis.spend)} />
            <Kpi label="Bereik (betaald)" value={num(metaPaidKpis.reach)} />
            <Kpi label="CTR" value={`${metaPaidKpis.ctr}%`} />
            <Kpi label="ROAS" value={`${metaPaidKpis.roas}x`} accent="green" />
            <Kpi label="Bereik (organisch)" value={num(metaOrganicKpis.reach)} />
            <Kpi label="Interacties" value={num(metaOrganicKpis.engagement)} />
          </div>
          <ChartCard title="Adspend & bereik (betaald)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={metaDaily} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="l" dataKey="spend" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="r" dataKey="bereik" fill="#bae6fd" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Section>

        {/* SEA / Google Ads */}
        <Section title="SEA — Google Ads" badge="Betaald zoeken">
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Spend" value={eur(seaKpis.spend)} />
            <Kpi label="Clicks" value={num(seaKpis.clicks)} />
            <Kpi label="Impressies" value={num(seaKpis.impressions)} />
            <Kpi label="Gem. CPC" value={eur(seaKpis.cpc)} />
            <Kpi label="Conversies" value={num(seaKpis.conversions)} />
            <Kpi label="ROAS" value={`${seaKpis.roas}x`} accent="green" />
          </div>
          <ChartCard title="Spend & conversies">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={seaDaily} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="l" type="monotone" dataKey="spend" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line yAxisId="r" type="monotone" dataKey="conversies" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {badge && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{badge}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: "green" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1 text-lg font-bold ${accent === "green" ? "text-green-700" : "text-slate-800"}`}>
        {value}
      </div>
    </div>
  );
}

function ChartCard({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 ${className ?? ""}`}>
      <h3 className="mb-2 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}
