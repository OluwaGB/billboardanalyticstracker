import { Link, useLocation } from "react-router-dom";
import { BarChart3, MapPin, Home, Activity, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/billboards", label: "Billboards", icon: MapPin },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric-blue">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="leading-none">
            <div className="text-sm font-bold text-foreground">OOH Analytics</div>
            <div className="text-[10px] text-muted-foreground">Nigeria Billboard Intelligence</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-electric-blue/10 text-electric-blue"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ARCON badge + mobile toggle */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-alert/30 bg-amber-alert/10 px-2.5 py-1 text-[10px] font-medium text-amber-alert">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-alert" />
            ARCON Compliant
          </span>
          <button
            className="md:hidden rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-electric-blue/10 text-electric-blue"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
