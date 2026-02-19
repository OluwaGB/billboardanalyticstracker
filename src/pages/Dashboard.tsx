import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, TrendingUp, QrCode, Target, ChevronRight, AlertTriangle, CheckCircle2, Cloud, Car, Smartphone, Monitor, Tablet } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { billboards } from "@/lib/data";
import { getScanEvents, getBillboardStats, getDailyScanData, getHourlyScanData, getDeviceBreakdown } from "@/lib/scanStore";
import Footer from "@/components/Footer";

type TimeRange = "hourly" | "daily";
type CityFilter = "all" | "Lagos" | "Abuja";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [cityFilter, setCityFilter] = useState<CityFilter>("all");

  const events = useMemo(() => getScanEvents(), []);

  const filteredBillboards = useMemo(
    () => billboards.filter((b) => cityFilter === "all" || b.city === cityFilter),
    [cityFilter]
  );

  const allStats = useMemo(
    () => filteredBillboards.map((bb) => ({ bb, stats: getBillboardStats(bb.id, events) })),
    [filteredBillboards, events]
  );

  // KPI aggregates
  const kpis = useMemo(() => {
    const totalScans = allStats.reduce((s, x) => s + x.stats.validScans, 0);
    const totalConversions = allStats.reduce((s, x) => s + x.stats.conversions, 0);
    const scansToday = allStats.reduce((s, x) => s + x.stats.scansToday, 0);
    const topBillboard = [...allStats].sort((a, b) => b.stats.validScans - a.stats.validScans)[0];
    const convRate = totalScans > 0 ? ((totalConversions / totalScans) * 100).toFixed(1) : "0.0";
    const botEvents = events.filter((e) => e.isBot).length;
    const dupEvents = events.filter((e) => e.isDuplicate).length;
    const totalRaw = events.length;
    const dataQuality = totalRaw > 0 ? (((totalRaw - botEvents - dupEvents) / totalRaw) * 100).toFixed(1) : "100.0";
    return { totalScans, totalConversions, scansToday, topBillboard, convRate, botEvents, dupEvents, dataQuality };
  }, [allStats, events]);

  // Chart data
  const chartData = useMemo(
    () => timeRange === "daily" ? getDailyScanData() : getHourlyScanData(undefined, 1),
    [timeRange]
  );

  const barData = useMemo(
    () =>
      allStats
        .map(({ bb, stats }) => ({
          name: bb.name.split(" ").slice(0, 2).join(" "),
          scans: stats.validScans,
          conversions: stats.conversions,
        }))
        .sort((a, b) => b.scans - a.scans),
    [allStats]
  );

  const deviceData = useMemo(() => getDeviceBreakdown(), []);
  const DEVICE_COLORS = ["hsl(210 100% 56%)", "hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(187 100% 50%)", "hsl(270 60% 60%)"];
  const getDeviceIcon = (device: string) => {
    if (device.includes("iPhone") || device.includes("Android Phone") || device.includes("Windows Phone")) return Smartphone;
    if (device.includes("iPad") || device.includes("Tablet")) return Tablet;
    return Monitor;
  };

  // Traffic & Weather enrichment (simulated)
  const enrichmentInsights = [
    { icon: Car, color: "amber-alert", text: "Third Mainland Bridge: 3× scan spike during 7–9AM morning gridlock. 285k daily traffic." },
    { icon: Car, color: "electric-blue", text: "Lekki-Epe Expressway: Peak scans at 6PM evening rush — Admiralty Junction highest dwell time." },
    { icon: Cloud, color: "success-green", text: "Sunny weather days average 22% more scans across Lagos billboards vs rainy days." },
    { icon: Car, color: "amber-alert", text: "Abuja Airport Road: Consistent scan rate 8AM–10AM correlating with business travel arrivals." },
  ];

  const kpiCards = [
    { label: "Total Scans Today", value: kpis.scansToday.toLocaleString(), sub: "Valid, deduplicated", color: "electric-blue", icon: QrCode },
    { label: "Total Conversions", value: kpis.totalConversions.toLocaleString(), sub: "Advertiser link clicks", color: "success-green", icon: Target },
    { label: "Scan-to-Conversion Rate", value: `${kpis.convRate}%`, sub: "Across all campaigns", color: "amber-alert", icon: TrendingUp },
    { label: "Total Valid Scans", value: kpis.totalScans.toLocaleString(), sub: "30-day rolling total", color: "neon-cyan", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Analytics Dashboard</h1>
            <p className="text-muted-foreground text-sm">Real-time OOH campaign performance across Nigeria</p>
          </div>
          {/* City filter */}
          <div className="flex items-center gap-2">
            {(["all", "Lagos", "Abuja"] as CityFilter[]).map((c) => (
              <button key={c} onClick={() => setCityFilter(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  cityFilter === c
                    ? "bg-electric-blue text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-accent"
                }`}>
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${kpi.color}/10 mb-3`}>
                  <Icon className={`h-4 w-4 text-${kpi.color}`} />
                </div>
                <div className={`text-2xl font-bold text-${kpi.color} mb-1`}>{kpi.value}</div>
                <div className="text-xs font-medium text-foreground">{kpi.label}</div>
                <div className="text-[11px] text-muted-foreground">{kpi.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {/* Scan over time */}
          <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground text-sm">Scans Over Time</h2>
                <p className="text-xs text-muted-foreground">{timeRange === "daily" ? "Last 30 days" : "Today by hour"}</p>
              </div>
              <div className="flex gap-1">
                {(["daily", "hourly"] as TimeRange[]).map((t) => (
                  <button key={t} onClick={() => setTimeRange(t)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      timeRange === t ? "bg-electric-blue text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                    }`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210 100% 56%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(210 100% 56%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey={timeRange === "daily" ? "date" : "hour"}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  itemStyle={{ color: "hsl(210 100% 56%)" }}
                />
                <Area type="monotone" dataKey="scans" stroke="hsl(210 100% 56%)" fill="url(#scanGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Scans per billboard */}
          <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="mb-4">
              <h2 className="font-semibold text-foreground text-sm">Scans by Billboard</h2>
              <p className="text-xs text-muted-foreground">Top performers ranked by valid scans</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="scans" fill="hsl(210 100% 56%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversions" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Billboard performance table */}
        <div className="rounded-xl border border-border bg-card mb-8 overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm">Billboard Performance</h2>
            <p className="text-xs text-muted-foreground">Scan counts, conversion rates, and campaign ROI</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Billboard", "City", "Campaign", "Valid Scans", "Conv. Rate", "Today", "Cost/Scan", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allStats
                  .sort((a, b) => b.stats.validScans - a.stats.validScans)
                  .map(({ bb, stats }) => (
                    <tr key={bb.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{bb.name}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{bb.city}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap max-w-[140px] truncate">{bb.campaign.name}</td>
                      <td className="px-4 py-3 font-mono font-bold text-electric-blue">{stats.validScans.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${stats.conversionRate >= 15 ? "text-success-green" : stats.conversionRate >= 10 ? "text-amber-alert" : "text-muted-foreground"}`}>
                          {stats.conversionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neon-cyan font-medium">{stats.scansToday}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        ₦{stats.costPerScan.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/billboard/${bb.id}`} className="text-electric-blue hover:text-electric-blue/80 transition-colors">
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic & Weather enrichment + Data Quality (two columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {/* Traffic & Weather */}
          <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="font-semibold text-foreground text-sm mb-1">Traffic & Weather Enrichment</h2>
            <p className="text-xs text-muted-foreground mb-4">Contextual insights correlating scan spikes with physical conditions</p>
            <div className="flex flex-col gap-3">
              {enrichmentInsights.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`flex gap-3 rounded-lg border border-${item.color}/20 bg-${item.color}/5 p-3`}>
                    <Icon className={`h-4 w-4 text-${item.color} shrink-0 mt-0.5`} />
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Quality Panel */}
          <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="font-semibold text-foreground text-sm mb-1">Data Quality Panel</h2>
            <p className="text-xs text-muted-foreground mb-4">Bot filtering and deduplication metrics</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 border border-border p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-green" />
                  <span className="text-sm text-foreground">Data Quality Score</span>
                </div>
                <span className="text-success-green font-bold">{kpis.dataQuality}%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 border border-border p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-foreground">Bot Events Filtered</span>
                </div>
                <span className="text-destructive font-bold">{kpis.botEvents.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 border border-border p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-alert" />
                  <span className="text-sm text-foreground">Duplicate Events Removed</span>
                </div>
                <span className="text-amber-alert font-bold">{kpis.dupEvents.toLocaleString()}</span>
              </div>
              <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground leading-relaxed">
                Total raw events: <span className="text-foreground font-medium">{events.length.toLocaleString()}</span> · 
                Valid after cleaning: <span className="text-success-green font-medium">{kpis.totalScans.toLocaleString()}</span> · 
                Attribution algorithm: last-touch model
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Performance Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm">Campaign Performance</h2>
            <p className="text-xs text-muted-foreground">Advertiser-level summary with cost efficiency metrics</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Campaign", "Advertiser", "Billboard", "Budget (₦)", "Scans", "Conversions", "Cost/Scan"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allStats.map(({ bb, stats }) => (
                  <tr key={bb.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{bb.campaign.name}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{bb.campaign.advertiser}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{bb.name.split(" ").slice(0, 3).join(" ")}</td>
                    <td className="px-4 py-3 text-muted-foreground">₦{(bb.campaign.budget / 1_000_000).toFixed(1)}M</td>
                    <td className="px-4 py-3 font-mono text-electric-blue font-bold">{stats.validScans.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-success-green font-bold">{stats.conversions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">₦{stats.costPerScan.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Type Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5 mt-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <h2 className="font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-electric-blue" />
            Scanner Device Types
          </h2>
          <p className="text-xs text-muted-foreground mb-5">Device breakdown from real QR scans and simulated events</p>
          {deviceData.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No real scan data yet. Use "Simulate Scan" on the Billboards page or scan a QR code to populate this chart.
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    dataKey="count"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ device, percent }: { device: string; percent: number }) => `${device} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {deviceData.map((_, i) => (
                      <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 min-w-[200px]">
                {[...deviceData].sort((a, b) => b.count - a.count).map(({ device, count }, i) => {
                  const Icon = getDeviceIcon(device);
                  return (
                    <div key={device} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ background: DEVICE_COLORS[i % DEVICE_COLORS.length] }} />
                      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground flex-1">{device}</span>
                      <span className="text-sm font-bold text-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
