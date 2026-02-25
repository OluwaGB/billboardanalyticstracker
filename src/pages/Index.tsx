import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, QrCode, MapPin, TrendingUp, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { billboards } from "@/lib/data";
import { getScanEvents, getBillboardStats } from "@/lib/scanStore";
import { useMemo } from "react";
import Footer from "@/components/Footer";

export default function Index() {
  const { totalScans, totalConversions, activeCount } = useMemo(() => {
    const events = getScanEvents();
    let totalScans = 0;
    let totalConversions = 0;
    billboards.forEach((bb) => {
      const stats = getBillboardStats(bb.id, events);
      totalScans += stats.validScans;
      totalConversions += stats.conversions;
    });
    return {
      totalScans,
      totalConversions,
      activeCount: billboards.filter((b) => b.status === "active").length,
    };
  }, []);

  const cities = [...new Set(billboards.map((b) => b.city))].length;

  const stats = [
    { label: "Total Billboards", value: billboards.length, suffix: "" },
    { label: "Total Scans", value: totalScans.toLocaleString(), suffix: "" },
    { label: "Active Campaigns", value: activeCount, suffix: "" },
    { label: "Cities Covered", value: cities, suffix: "" },
  ];

  const features = [
    {
      icon: QrCode,
      title: "QR Code Tracking",
      description: "Each billboard has a unique QR code. Every scan is logged with timestamp, location context, and enrichment data.",
      color: "electric-blue",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Live dashboard with scan trends, conversion funnels, and billboard performance comparisons across Lagos and Abuja.",
      color: "success-green",
    },
    {
      icon: TrendingUp,
      title: "Traffic Enrichment",
      description: "Scan data is enriched with traffic volume and weather context — revealing peak engagement windows on Nigerian routes.",
      color: "amber-alert",
    },
    {
      icon: Shield,
      title: "ARCON Compliant",
      description: "All tracking adheres to ARCON and LASAA regulations. Bot filtering and deduplication ensure data quality.",
      color: "neon-cyan",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20">
        {/* Background grid effect */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(hsl(var(--electric-blue)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--electric-blue)) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, hsl(var(--electric-blue)), transparent 70%)" }} />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-electric-blue/30 bg-electric-blue/10 px-4 py-1.5 text-xs font-medium text-electric-blue mb-6">
              <Zap className="h-3 w-3" />
              Nigeria's First OOH Analytics Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              OOH Analytics —{" "}
              <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Nigeria's Billboard
              </span>{" "}
              Intelligence Platform
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Bridging the measurement gap in Out-of-Home advertising. Each billboard carries a unique QR code that tracks real engagement, enriched with traffic and weather context from routes like Third Mainland Bridge and Lekki-Epe Expressway.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-electric-blue hover:bg-electric-blue/90 text-primary-foreground px-8 gap-2">
                <Link to="/dashboard">
                  View Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border hover:bg-accent px-8 gap-2">
                <Link to="/billboards">
                  <QrCode className="h-4 w-4" />
                  Explore Billboards
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border bg-card/50">
        <div className="container py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-electric-blue mb-1">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A seamless bridge between physical billboards and the digital analytics world.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { step: "01", title: "Billboard Scan", desc: "Pedestrian or driver scans the unique QR code on a physical billboard using their phone." },
            { step: "02", title: "Event Logged", desc: "The scan is recorded with timestamp, billboard ID, weather, and traffic context in real-time." },
            { step: "03", title: "Analytics Updated", desc: "Dashboard KPIs, charts, and campaign metrics update instantly to reflect the new engagement." },
          ].map((item) => (
            <div key={item.step} className="relative rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="text-4xl font-black text-electric-blue/20 mb-3 transition-transform duration-300 hover:animate-bounce cursor-default inline-block">{item.step}</div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Platform Features</h2>
          <p className="text-muted-foreground">Built for Nigeria's unique advertising landscape.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex gap-4 rounded-xl border border-border bg-card p-5 hover:border-electric-blue/30 transition-colors" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-${f.color}/10`}>
                  <Icon className={`h-5 w-5 text-${f.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="rounded-2xl border border-electric-blue/20 p-10 text-center"
          style={{ background: "linear-gradient(135deg, hsl(var(--electric-blue) / 0.08), hsl(var(--card)))" }}>
          <MapPin className="h-8 w-8 text-electric-blue mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">
            8 Billboards. 2 Cities. Fully Tracked.
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            From Third Mainland Bridge to Wuse II, every billboard has a QR code ready to measure real engagement.
          </p>
          <Button asChild size="lg" className="bg-electric-blue hover:bg-electric-blue/90 text-primary-foreground gap-2">
            <Link to="/billboards">
              View All Billboards <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
