import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, MapPin, CheckCircle2, QrCode, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { billboards } from "@/lib/data";
import { logScanEvent, logConversion, detectDeviceType } from "@/lib/scanStore";

export default function ScanLanding() {
  const { id } = useParams<{ id: string }>();
  const billboard = billboards.find((b) => b.id === id);
  const [converted, setConverted] = useState(false);
  const [scanLogged, setScanLogged] = useState(false);

  useEffect(() => {
    if (billboard && !scanLogged) {
      logScanEvent(billboard.id, "qr");
      setScanLogged(true);
    }
  }, [billboard, scanLogged]);

  if (!billboard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Billboard Not Found</h2>
          <p className="text-muted-foreground mb-6">This QR code may be invalid or expired.</p>
          <Button asChild variant="outline">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { campaign } = billboard;

  const handleConversion = () => {
    logConversion(billboard.id);
    setConverted(true);
    setTimeout(() => {
      window.open(campaign.targetUrl, "_blank", "noopener,noreferrer");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Scan confirmation badge */}
      <div className="mb-8 flex items-center gap-2 rounded-full border border-success-green/30 bg-success-green/10 px-4 py-2 text-sm font-medium text-success-green">
        <CheckCircle2 className="h-4 w-4" />
        Scan event logged successfully
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-glow)" }}>
        {/* Advertiser header */}
        <div className="p-6 border-b border-border"
          style={{ background: "linear-gradient(135deg, hsl(var(--electric-blue) / 0.1), hsl(var(--card)))" }}>
          <div className="text-xs text-electric-blue font-medium uppercase tracking-wide mb-1">{campaign.advertiser}</div>
          <h1 className="text-xl font-bold text-foreground mb-1">{campaign.name}</h1>
          <p className="text-sm text-muted-foreground">{campaign.product}</p>
        </div>

        {/* Campaign message */}
        <div className="p-6">
          <blockquote className="text-lg font-semibold text-foreground mb-4 leading-snug border-l-2 border-electric-blue pl-4">
            "{campaign.creative}"
          </blockquote>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {campaign.description}
          </p>

          {/* Billboard context */}
          <div className="rounded-lg bg-secondary/50 border border-border p-3 mb-6 flex items-start gap-2">
            <MapPin className="h-4 w-4 text-electric-blue shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">Billboard: </span>
              {billboard.name} — {billboard.location}
            </div>
          </div>

          {/* CTA */}
          {converted ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-success-green/10 border border-success-green/20 p-3 text-success-green text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Conversion recorded! Opening website…
            </div>
          ) : (
            <Button
              onClick={handleConversion}
              className="w-full bg-electric-blue hover:bg-electric-blue/90 text-primary-foreground gap-2"
              size="lg"
            >
              Visit {campaign.advertiser} <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* QR verification */}
        <div className="px-6 pb-6 flex items-center gap-3">
          <div className="rounded bg-background p-1.5 border border-border">
            <QRCodeSVG
              value={`${window.location.protocol}//${window.location.host}/scan/${billboard.id}`}
              size={48}
              bgColor="transparent"
              fgColor="hsl(210 100% 56%)"
              level="L"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Billboard ID: <span className="font-mono text-foreground">{billboard.id}</span>
            <br />Scan tracked at {new Date().toLocaleTimeString("en-NG")}
            <br />
            <span className="flex items-center gap-1 mt-1">
              <Smartphone className="h-3 w-3" />
              {detectDeviceType()}
            </span>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-6 flex gap-4">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link to="/billboards"><ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> All Billboards</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link to="/dashboard">View Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
