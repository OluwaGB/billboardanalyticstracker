import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { QrCode, MapPin, Users, ChevronRight, CheckCircle2, Zap } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { billboards } from "@/lib/data";
import { getBillboardStats, logScanEvent } from "@/lib/scanStore";
import Footer from "@/components/Footer";

type CityFilter = "all" | "Lagos" | "Abuja";

export default function Billboards() {
  const [cityFilter, setCityFilter] = useState<CityFilter>("all");
  const [simulated, setSimulated] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () => billboards.filter((b) => cityFilter === "all" || b.city === cityFilter),
    [cityFilter]
  );

  const baseUrl = window.location.origin;

  const handleSimulate = (billboardId: string) => {
    logScanEvent(billboardId, "simulation");
    setSimulated((prev) => ({ ...prev, [billboardId]: true }));
    setTimeout(() => setSimulated((prev) => ({ ...prev, [billboardId]: false })), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container pt-24 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Billboard Network</h1>
          <p className="text-muted-foreground">
            {billboards.length} active billboards across Lagos and Abuja — each with a unique QR code for real engagement tracking.
          </p>
        </div>

        {/* City filter */}
        <div className="flex items-center gap-2 mb-8">
          {(["all", "Lagos", "Abuja"] as CityFilter[]).map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                cityFilter === city
                  ? "bg-electric-blue text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {city === "all" ? "All Cities" : city}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((bb) => {
            const stats = getBillboardStats(bb.id);
            const scanUrl = `${baseUrl}/scan/${bb.id}`;
            const isSimulated = simulated[bb.id];

            return (
              <div key={bb.id} className="rounded-xl border border-border bg-card overflow-hidden hover:border-electric-blue/30 transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
                {/* Card header */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-xs font-medium text-electric-blue mb-1 uppercase tracking-wide">{bb.city}</div>
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{bb.name}</h3>
                    </div>
                    <Badge
                      className={`shrink-0 text-[10px] ${
                        bb.status === "active"
                          ? "bg-success-green/10 text-success-green border-success-green/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                      variant="outline"
                    >
                      {bb.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {bb.location}
                  </div>
                </div>

                {/* QR Code section */}
                <div className="p-5 flex gap-5">
                  <div className="shrink-0 rounded-lg border border-border bg-background p-2.5">
                    <QRCodeSVG
                      value={scanUrl}
                      size={96}
                      bgColor="transparent"
                      fgColor="hsl(210 100% 56%)"
                      level="M"
                    />
                  </div>

                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Campaign</div>
                      <div className="text-sm font-semibold text-foreground leading-tight mb-1">{bb.campaign.name}</div>
                      <div className="text-xs text-muted-foreground">{bb.campaign.advertiser}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Total Scans</div>
                        <div className="text-sm font-bold text-electric-blue">{stats.validScans.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Conv. Rate</div>
                        <div className="text-sm font-bold text-success-green">{stats.conversionRate.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Traffic badge */}
                <div className="px-5 pb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  ~{(bb.dailyTraffic / 1000).toFixed(0)}k daily traffic · {bb.size}
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 flex gap-2">
                  <Button
                    onClick={() => handleSimulate(bb.id)}
                    disabled={isSimulated}
                    className={`flex-1 gap-2 text-sm ${
                      isSimulated
                        ? "bg-success-green/20 text-success-green border-success-green/30 hover:bg-success-green/20"
                        : "bg-electric-blue/10 text-electric-blue border-electric-blue/30 hover:bg-electric-blue/20"
                    }`}
                    variant="outline"
                  >
                    {isSimulated ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Scan Logged!
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Simulate Scan
                      </>
                    )}
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Link to={`/billboard/${bb.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
