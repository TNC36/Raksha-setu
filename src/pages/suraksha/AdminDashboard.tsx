import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
  AlertTriangle,
  MapPin,
  BookOpen,
  Phone,
  LayoutDashboard,
  Globe,
  Volume2,
} from "lucide-react";
import { isAdminLoggedIn } from "../../utils/storage";
import { loadAlerts, loadZones, loadGuides, loadHelplines } from "../../utils/storage";
import StatCard from "../../components/suraksha/StatCard";

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  const alerts = loadAlerts();
  const zones = loadZones();
  const guides = loadGuides();
  const helplines = loadHelplines();

  const highCritical = alerts.filter(
    (a) => a.severity === "Critical" || a.severity === "High"
  ).length;

  const managementLinks = [
    {
      to: "/admin/alerts",
      label: "Manage Alerts",
      icon: AlertTriangle,
      count: alerts.length,
    },
    {
      to: "/admin/zones",
      label: "Manage Safe Zones",
      icon: MapPin,
      count: zones.length,
    },
    {
      to: "/admin/guides",
      label: "Manage Guides",
      icon: BookOpen,
      count: guides.length,
    },
    {
      to: "/admin/helplines",
      label: "Manage Helplines",
      icon: Phone,
      count: helplines.length,
    },
  ];

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <LayoutDashboard className="w-5 h-5 text-neutral-600" />
          <h1 className="text-xl font-semibold text-neutral-900">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-sm text-neutral-500">
          Raksha Setu administration — manage alerts, safe zones, guides, and
          helplines.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard icon={AlertTriangle} label="Total Alerts" value={alerts.length} />
        <StatCard icon={AlertTriangle} label="High / Critical" value={highCritical} />
        <StatCard icon={MapPin} label="Safe Zones" value={zones.length} />
        <StatCard icon={BookOpen} label="Guides" value={guides.length} />
      </div>

      {/* System Status */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-900 mb-3">
          System Status
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatusCard icon={Globe} label="Public Platform" status="Active" />
          <StatusCard icon={AlertTriangle} label="Alert System" status="Active" />
          <StatusCard icon={MapPin} label="Safe Zone System" status="Active" />
          <StatusCard icon={Volume2} label="Read Aloud" status="Active" />
        </div>
      </div>

      {/* Management Links */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-900 mb-3">
          Management
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {managementLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4 hover:border-neutral-300 transition-colors no-underline group"
            >
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
                <link.icon
                  className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors"
                  strokeWidth={1.8}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">
                  {link.label}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {link.count} items
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
  icon: any;
  label: string;
  status: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
      <Icon className="w-4 h-4 text-neutral-400" strokeWidth={1.8} />
      <div className="flex-1">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-xs font-medium text-green-600 flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          {status}
        </p>
      </div>
    </div>
  );
}
