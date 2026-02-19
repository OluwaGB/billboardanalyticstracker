import { useParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, Calendar, Users, TrendingUp, QrCode, ExternalLink, Smartphone, Monitor, Tablet } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { billboards } from "@/lib/data";
import { getScanEvents, getBillboardStats, getDailyScanData, getHourlyScanData, getRecentRealScans, getDeviceBreakdown } from "@/lib/scanStore";
import Footer from "@/components/Footer";

export default function BillboardDetail() {
  const { id } = useParams<{ id: string }>();
  const billboard = billboards.find((b) => b.id === id);
  const [chartMode, setChartMode] = useState<"daily" | "hourly">("daily");

  const events = useMemo(() => getScanEvents(), []);
  const stats = useMemo(() => (billboard ? getBillboardStats(billboard.id, events) : null), [billboard, events]);
  const dailyData = useMemo(() => (billboard ? getDailyScanData(billboard.id) : []), [billboard]);
  const hourlyData = useMemo(() => (billboard ? getHourlyScanData(billboard.id, 1) : []), [billboard]);
  const chartData = chartMode === "daily" ? dailyData : hourlyData;
  const recentScans = useMemo(() => (billboard ? getRecentRealScans(billboard.id, 15) : []), [billboard]);
  const deviceBreakdown = useMemo(() => (billboard ? getDeviceBreakdown(billboard.id) : []), [billboard]);

  // Conversion funnel
  const funnelData = stats
    ? [
        { stage: "Raw Scans", value: stats.totalScans, fill: "hsl(210 100% 56%)" },
        { stage: "Valid Scans", value: stats.validScans, fill: "hsl(187 100% 50%)" },
        { stage: "Conversions", value: stats.conversions, fill: "hsl(142 71% 45%)" },
      ]
    : [];

  if (!billboard || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">Billboard not found</h2>
          <Button asChild variant="outline"><Link to="/billboards"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
        </div>
      </div>
    );
  }

  const { campaign } = billboard;

  const getDeviceIcon = (device: string) => {
    if (device.includes("iPhone") || device.includes("Android Phone") || device.includes("Windows Phone")) return Smartphone;
    if (device.includes("iPad") || device.includes("Tablet")) return Tablet;
    return Monitor;
  };

  const scanUrl = `${window.location.protocol}//${window.location.host}/scan/${billboard.id}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container pt-24 pb-8">
        {/* Back */}
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground mb-6 -ml-2">
          <Link to="/billboards"><ArrowLeft className="h-4 w-4 mr-1.5" /> All Billboards</Link>
        </Button>

        {/* Hero header */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-electric-blue uppercase tracking-wide">{billboard.city}</span>
              <Badge variant="outline" className="bg-success-green/10 text-success-green border-success-green/20 text-[10px]">
                {billboard.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{billboard.name}</h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
              <MapPin className="h-4 w-4" />
              {billboard.location}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                ~{(billboard.dailyTraffic / 1000).toFixed(0)}k daily traffic
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <QrCode className="h-3.5 w-3.5" />
                Size: {billboard.size}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Installed: {new Date(billboard.installedDate).toLocaleDateString("en-NG", { month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="shrink-0 rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-3" style={{ boxShadow: "var(--shadow-glow)" }}>
            <div className="text-xs text-muted-foreground font-medium">Scan to engage</div>
            <div className="rounded-lg border border-electric-blue/20 bg-background p-3">
              <QRCodeSVG
                value={scanUrl}
                size={140}
                bgColor="transparent"
                fgColor="hsl(210 100% 56%)"
                level="M"
              />
            </div>
            <div className="text-[10px] font-mono text-muted-foreground text-center">{billboard.id}</div>
            <Button asChild size="sm" variant="outline" className="text-xs border-electric-blue/30 text-electric-blue hover:bg-electric-blue/10">
              <a href={scanUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1.5" />
                Open Scan Page
              </a>
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Valid Scans", value: stats.validScans.toLocaleString(), color: "electric-blue" },
            { label: "Conversions", value: stats.conversions.toLocaleString(), color: "success-green" },
            { label: "Conv. Rate", value: `${stats.conversionRate.toFixed(1)}%`, color: "amber-alert" },
            { label: "Today", value: stats.scansToday.toString(), color: "neon-cyan" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className={`text-2xl font-bold text-${s.color} mb-1`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {/* Scan history */}
          <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground text-sm">Scan History</h2>
                <p className="text-xs text-muted-foreground">{chartMode === "daily" ? "Last 30 days" : "Today by hour"}</p>
              </div>
              <div className="flex gap-1">
                {(["daily", "hourly"] as const).map((m) => (
                  <button key={m} onClick={() => setChartMode(m)}
                    className={`rounded px-2 py-1 text-xs font-medium ${chartMode === m ? "bg-electric-blue text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bbGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210 100% 56%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(210 100% 56%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey={chartMode === "daily" ? "date" : "hour"} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="scans" stroke="hsl(210 100% 56%)" fill="url(#bbGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion funnel */}
          <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="mb-4">
              <h2 className="font-semibold text-foreground text-sm">Conversion Funnel</h2>
              <p className="text-xs text-muted-foreground">From raw scans to advertiser visits</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickLine={false} width={70} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Info */}
        <div className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-electric-blue" />
            Campaign Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Campaign Name</div>
                <div className="text-sm font-medium text-foreground">{campaign.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Advertiser</div>
                <div className="text-sm font-medium text-foreground">{campaign.advertiser}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Product</div>
                <div className="text-sm font-medium text-foreground">{campaign.product}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Ad Creative</div>
                <div className="text-sm font-semibold text-electric-blue">"{campaign.creative}"</div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Campaign Period</div>
                <div className="text-sm font-medium text-foreground">
                  {new Date(campaign.startDate).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })} – {new Date(campaign.endDate).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Budget</div>
                <div className="text-sm font-medium text-foreground">₦{campaign.budget.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Cost Per Scan</div>
                <div className="text-sm font-bold text-amber-alert">₦{stats.costPerScan.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Campaign Description</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{campaign.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Device Breakdown + Recent Real Scans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8">
          {/* Device Breakdown */}
          <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-electric-blue" />
              Device Breakdown
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Device types detected from real QR scans</p>
            {deviceBreakdown.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6">
                No real scan data yet. Use "Simulate Scan" or scan the QR code to capture device data.
              </div>
            ) : (
              <div className="space-y-2">
                {deviceBreakdown
                  .sort((a, b) => b.count - a.count)
                  .map(({ device, count }) => {
                    const Icon = getDeviceIcon(device);
                    const total = deviceBreakdown.reduce((s, d) => s + d.count, 0);
                    const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
                    return (
                      <div key={device} className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-foreground font-medium">{device}</span>
                            <span className="text-muted-foreground">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-electric-blue rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Recent Real Scans */}
          <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="font-semibold text-foreground text-sm mb-1">Recent Scan Events</h2>
            <p className="text-xs text-muted-foreground mb-4">Live scan log from QR and simulated interactions</p>
            {recentScans.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6">
                No real scans recorded yet. Scan the QR code or click "Simulate Scan" to see live data.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {recentScans.map((scan) => {
                  const Icon = getDeviceIcon(scan.deviceType || "");
                  return (
                    <div key={scan.id} className="flex items-start gap-3 rounded-lg bg-secondary/40 border border-border/50 p-2.5">
                      <Icon className="h-4 w-4 text-electric-blue shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-foreground">{scan.deviceType || "Unknown Device"}</span>
                          <span className={`text-[10px] font-medium ${scan.isConversion ? "text-success-green" : "text-muted-foreground"}`}>
                            {scan.isConversion ? "✓ Converted" : scan.source === "qr" ? "QR Scan" : "Simulated"}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(scan.timestamp).toLocaleString("en-NG", {
                            month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit", second: "2-digit"
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
