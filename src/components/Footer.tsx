import { Shield, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-sm font-bold text-foreground mb-2">OOH Analytics Nigeria</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A research platform for measuring Out-of-Home advertising effectiveness through QR code tracking and real-time analytics.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground mb-2">Regulatory Compliance</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-success-green" />
                ARCON — Advertising Regulatory Council of Nigeria
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Award className="h-3.5 w-3.5 text-amber-alert" />
                LASAA — Lagos State Signage & Advertisement Agency
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground mb-2">Research Project</div>
            <p className="text-xs text-muted-foreground">
              Final Year Project — Department of Computer Science. Data shown includes both real scan events and seeded demonstration data.
            </p>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-muted-foreground">© 2025 OOH Analytics Nigeria. Academic Research Use.</p>
          <p className="text-xs text-muted-foreground">Built on real Nigerian OOH data patterns</p>
        </div>
      </div>
    </footer>
  );
}
