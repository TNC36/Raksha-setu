import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Shield, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { isAdminLoggedIn, adminLogout } from "../../utils/storage";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/alerts", label: "Alerts" },
  { to: "/safe-zones", label: "Safe Zones" },
  { to: "/guides", label: "Guides" },
  { to: "/helplines", label: "Helplines" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const loggedIn = isAdminLoggedIn();

  function handleLogout() {
    adminLogout();
    setMobileOpen(false);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <Shield className="w-6 h-6 text-neutral-900" strokeWidth={1.8} />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-neutral-900 tracking-tight">
                Suraksha Setu
              </span>
              <span className="text-[10px] text-neutral-400 tracking-wide uppercase">
                Disaster Safety Platform
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
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {loggedIn ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 text-sm rounded-md no-underline transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith("/admin")
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm rounded-md text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className={`px-3 py-1.5 text-sm rounded-md no-underline transition-colors ${
                  location.pathname === "/admin/login"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-neutral-600 hover:bg-neutral-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-neutral-100 pt-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 text-sm rounded-md no-underline ${
                  location.pathname === link.to
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {loggedIn ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm rounded-md no-underline text-neutral-600 hover:bg-neutral-100 flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Admin Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm rounded-md text-left text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm rounded-md no-underline text-neutral-600 hover:bg-neutral-100"
              >
                Admin Login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
