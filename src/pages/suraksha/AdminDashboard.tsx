import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  AlertTriangle,
  MapPin,
  BookOpen,
  Phone,
  LayoutDashboard,
  Globe,
  Volume2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import StatCard from "../../components/suraksha/StatCard";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const isAdmin = useQuery(api.admin.checkAdmin);
  const currentUser = useQuery(api.admin.getCurrentUser);

  const alerts = useQuery(api.alerts.listAll);
  const zones = useQuery(api.safeZones.list);
  const guides = useQuery(api.guides.list);
  const helplines = useQuery(api.helplines.list);

  useEffect(() => {
    if (isAdmin === false) {
      navigate("/admin/login", { replace: true });
    }
  }, [isAdmin, navigate]);

  if (isAdmin === undefined || alerts === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (isAdmin === false) return null;

  const highCritical = alerts.filter(
    (a) => a.severity === "Critical" || a.severity === "High"
  ).length;

  const liveAlerts = alerts.filter((a) => a.mode === "live").length;
  const demoAlerts = alerts.filter((a) => a.mode === "demo").length;
  const activeAlerts = alerts.filter((a) => a.status === "active").length;

  const managementLinks = [
    {
      to: "/admin/alerts",
      label: "Manage Alerts",
      icon: AlertTriangle,
      count: alerts.length,
      detail: `${activeAlerts} active · ${liveAlerts} live · ${demoAlerts} demo`,
    },
    {
      to: "/admin/zones",
      label: "Manage Safe Zones",
      icon: MapPin,
      count: zones?.length || 0,
    },
    {
      to: "/admin/guides",
      label: "Manage Guides",
      icon: BookOpen,
      count: guides?.length || 0,
    },
    {
      to: "/admin/helplines",
      label: "Manage Helplines",
      icon: Phone,
      count: helplines?.length || 0,
    },
  ];

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Raksha Setu administration — manage alerts, safe zones, guides, and helplines.
        </p>
        {currentUser && (
          <p className="text-xs text-muted-foreground mt-1">
            Signed in as <strong>{currentUser.email || currentUser.name}</strong> · Role: {currentUser.role}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-0.5">
          All data stored in Convex database · Server-side authorization enforced
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard icon={AlertTriangle} label="Total Alerts" value={alerts.length} />
        <StatCard icon={AlertTriangle} label="High / Critical" value={highCritical} />
        <StatCard icon={MapPin} label="Safe Zones" value={zones?.length || 0} />
        <StatCard icon={BookOpen} label="Guides" value={guides?.length || 0} />
      </div>

      {/* System Status */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          System Status
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatusCard icon={Globe} label="Public Platform" status="Active" />
          <StatusCard icon={AlertTriangle} label="Alert System" status="Active" />
          <StatusCard icon={MapPin} label="Safe Zone System" status="Active" />
          <StatusCard icon={Volume2} label="Read Aloud" status="Active" />
        </div>
      </div>

      {/* Data Source Status */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Data Sources
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatusCard icon={Globe} label="Database (Convex)" status="Connected" />
          <StatusCard icon={AlertTriangle} label="USGS Earthquakes" status="Live API" />
          <StatusCard icon={AlertTriangle} label="ReliefWeb" status="Live API" />
          <StatusCard icon={MapPin} label="OSRM Routing" status="Live API" />
        </div>
      </div>

      {/* Management Links */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Management
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {managementLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-card dark:bg-primary border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/50 hover:border-primary/50 transition-colors no-underline group"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary bg-primary flex items-center justify-center group-hover:bg-primary dark:group-hover:bg-secondary transition-colors">
                <link.icon
                  className="w-5 h-5 text-muted-foreground group-hover:text-white dark:group-hover:text-foreground transition-colors"
                  strokeWidth={1.8}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {link.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {link.count} items{link.detail ? ` · ${link.detail}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  status,
}: {
  icon: LucideIcon;
  label: string;
  status: string;
}) {
  return (
    <div className="bg-card dark:bg-primary border border-border rounded-xl p-4 flex items-center gap-3">
      <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs font-medium text-green-600 flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          {status}
        </p>
      </div>
    </div>
  );
}
