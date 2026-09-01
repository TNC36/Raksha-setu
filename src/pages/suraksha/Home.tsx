import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { AlertTriangle, MapPin, BookOpen, Phone, ArrowRight, Shield } from "lucide-react";
import { loadAlerts } from "../../utils/storage";
import { loadZones } from "../../utils/storage";
import { loadGuides } from "../../utils/storage";
import { loadHelplines } from "../../utils/storage";
import { DISASTER_TYPES, DISASTER_META } from "../../data/disasters";
import AlertCard from "../../components/suraksha/AlertCard";
import GuideCard from "../../components/suraksha/GuideCard";
import StatCard from "../../components/suraksha/StatCard";

export default function Home() {
  const { t } = useTranslation();
  const alerts = loadAlerts();
  const zones = loadZones();
  const guides = loadGuides();
  const helplines = loadHelplines();

  const activeAlerts = alerts.length;
  const criticalAlerts = alerts.filter(
    (a) => a.severity === "Critical" || a.severity === "High"
  );
  const availableZones = zones.filter((z) => z.status !== "Closed").length;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-neutral-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.03),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-neutral-300 mb-6">
              <Shield className="w-3 h-3" />
              {t("app.tagline")}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              {t("home.heroTitle")}
            </h1>
            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed mb-8 max-w-lg">
              {t("home.heroDescription")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/alerts"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-100 transition-colors no-underline"
              >
                {t("home.viewAlerts")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/safe-zones"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors no-underline"
              >
                <MapPin className="w-4 h-4" />
                {t("home.findSafeZones")}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={AlertTriangle}
            label={t("home.activeAlerts")}
            value={activeAlerts}
          />
          <StatCard
            icon={MapPin}
            label={t("home.safeZonesCount")}
            value={availableZones}
          />
          <StatCard
            icon={BookOpen}
            label={t("home.safetyGuides")}
            value={guides.length}
          />
          <StatCard
            icon={Phone}
            label={t("home.emergencyHelplines")}
            value={helplines.length}
          />
        </div>
      </section>

      {/* Safety Status Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-neutral-900">
              {t("home.safetyStatus")} — {criticalAlerts.length} {t("home.alertsActive")}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {t("home.heroDescription")}
            </p>
          </div>
          <Link
            to="/alerts"
            className="text-xs text-neutral-600 hover:text-neutral-900 font-medium no-underline flex items-center gap-1"
          >
            {t("home.viewAll")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </section>

      {/* Disaster Types */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <h2 className="text-lg font-semibold text-neutral-900 mb-1">
          {t("safeZones.title")}
        </h2>
        <p className="text-xs text-neutral-400 mb-6">
          {t("safeZones.subtitle")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DISASTER_TYPES.map((dt) => {
            const meta = DISASTER_META[dt];
            return (
              <Link
                key={dt}
                to={`/safe-zones?disaster=${dt}`}
                className="bg-white border border-neutral-200 rounded-xl p-4 text-center hover:border-neutral-300 transition-colors no-underline group"
              >
                <div className="text-2xl mb-2">{meta.icon}</div>
                <p className="text-xs font-medium text-neutral-700 group-hover:text-neutral-900">
                  {dt}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  {meta.safeZoneLabel}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Latest Alerts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">
              {t("home.latestAlerts")}
            </h2>
            <p className="text-xs text-neutral-400">
              {t("alerts.subtitle")}
            </p>
          </div>
          <Link
            to="/alerts"
            className="text-xs text-neutral-600 hover:text-neutral-900 font-medium no-underline flex items-center gap-1"
          >
            {t("home.viewAll")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.slice(0, 3).map((alert) => (
            <AlertCard key={alert.id} alert={alert} compact />
          ))}
        </div>
      </section>

      {/* Safety Guides Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 mb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">
              {t("home.recentGuides")}
            </h2>
            <p className="text-xs text-neutral-400">
              {t("guides.subtitle")}
            </p>
          </div>
          <Link
            to="/guides"
            className="text-xs text-neutral-600 hover:text-neutral-900 font-medium no-underline flex items-center gap-1"
          >
            {t("home.viewAll")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {guides.slice(0, 3).map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>
    </div>
  );
}
