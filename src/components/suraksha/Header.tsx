import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Shield, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";

const NAV_LINKS = [
  { to: "/", key: "nav.home" },
  { to: "/alerts", key: "nav.alerts" },
  { to: "/safe-zones", key: "nav.safeZones" },
  { to: "/guides", key: "nav.guides" },
  { to: "/helplines", key: "nav.helplines" },
];

export default function Header() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const currentUser = useQuery(
    api.users.currentUser,
    isAuthenticated ? {} : "skip"
  );

  const isAdmin = currentUser?.role === "admin";
  const isSignedIn = isAuthenticated && !authLoading;

  async function handleSignOut() {
    try {
      await signOut();
      setMobileOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <Shield className="w-6 h-6 text-neutral-900 dark:text-neutral-100" strokeWidth={1.8} />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-neutral-900 tracking-tight dark:text-neutral-100">
                {t("app.name")}
              </span>
              <span className="text-[10px] text-neutral-400 tracking-wide uppercase">
                {t("app.tagline")}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-sm rounded-md no-underline transition-colors ${
                  location.pathname === link.to
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}

            {isSignedIn && isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 text-sm rounded-md no-underline transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith("/admin")
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {t("nav.admin")}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-sm rounded-md text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 dark:text-neutral-400 dark:hover:text-red-400 dark:hover:bg-red-950"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t("nav.logout")}
                </button>
              </>
            ) : isSignedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 text-sm rounded-md no-underline transition-colors flex items-center gap-1.5 ${
                    location.pathname === "/dashboard"
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {t("nav.dashboard")}
                </Link>
                {currentUser?.name && (
                  <span className="text-xs text-neutral-400 hidden lg:inline dark:text-neutral-500">
                    {currentUser.name}
                  </span>
                )}
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-sm rounded-md text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 dark:text-neutral-400 dark:hover:text-red-400 dark:hover:bg-red-950"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/admin/login"
                  className={`px-3 py-1.5 text-sm rounded-md no-underline transition-colors ${
                    location.pathname === "/admin/login"
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {t("nav.admin")}
                </Link>
              </>
            )}

            {/* Theme & Language */}
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-neutral-200 dark:border-neutral-700">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-neutral-100 pt-3 flex flex-col gap-1 dark:border-neutral-800">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 text-sm rounded-md no-underline ${
                  location.pathname === link.to
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
            <div className="h-px bg-neutral-100 my-1 dark:bg-neutral-800" />
            {isSignedIn && isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm rounded-md no-underline text-neutral-600 hover:bg-neutral-100 flex items-center gap-1.5 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {t("admin.dashboard")}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 text-sm rounded-md text-left text-red-600 hover:bg-red-50 flex items-center gap-1.5 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t("nav.logout")}
                </button>
              </>
            ) : isSignedIn ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm rounded-md no-underline text-neutral-600 hover:bg-neutral-100 flex items-center gap-1.5 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {t("nav.dashboard")}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 text-sm rounded-md text-left text-red-600 hover:bg-red-50 flex items-center gap-1.5 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t("nav.signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm rounded-md no-underline text-neutral-600 hover:bg-neutral-100 flex items-center gap-1.5 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  {t("nav.admin")}
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
