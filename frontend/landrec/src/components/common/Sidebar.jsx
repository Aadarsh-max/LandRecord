import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, Upload, ClipboardCheck, Search, LogOut, ChevronsLeft, ChevronsRight, FileStack, Clock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/verification", label: "Verification", icon: ClipboardCheck },
  { to: "/search", label: "Search", icon: Search }
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [quickStats, setQuickStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then((res) => setQuickStats(res.data)).catch(() => {});
  }, []);

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={`sticky top-0 hidden h-screen flex-col justify-between rounded-r-clay bg-base-surfaceLight shadow-clay transition-all duration-300 md:flex ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="p-4">
          <div className={`mb-6 flex items-center ${collapsed ? "justify-center" : "justify-between"} px-1`}>
            {!collapsed && (
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">BhuLekh AI</p>
            )}
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              className="rounded-full p-1.5 text-ink-muted shadow-claySm transition-colors hover:text-blue-600"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-claySm px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-clay"
                      : "text-ink-secondary hover:bg-base-surface"
                  }`
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && label}
              </NavLink>
            ))}
          </nav>

          {!collapsed && quickStats && (
            <div className="mt-6 space-y-2 rounded-claySm bg-base-surface p-3 shadow-clayInset">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Quick Stats</p>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-ink-secondary">
                  <FileStack className="h-3.5 w-3.5 text-blue-500" /> Documents
                </span>
                <span className="font-semibold text-ink-primary">{quickStats.total_documents}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-ink-secondary">
                  <Clock className="h-3.5 w-3.5 text-amia-600" /> Pending
                </span>
                <span className="font-semibold text-ink-primary">{quickStats.pending_verification}</span>
              </div>
            </div>
          )}

          {!collapsed && (
            <div className="mt-6 rounded-claySm bg-gradient-to-br from-blue-500/10 to-green-500/10 p-4">
              <p className="text-xs font-medium text-ink-primary">AI-powered digitization</p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-secondary">
                Multilingual OCR, confidence scoring, and GIS mapping — built for real government land records.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-ink-muted/10 p-4">
          {!collapsed ? (
            <>
              <p className="truncate text-sm font-medium text-ink-primary">{user?.name}</p>
              <p className="text-xs capitalize text-ink-muted">{user?.role}</p>
              <button
                onClick={logout}
                className="mt-3 flex w-full items-center gap-2 rounded-claySm px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-base-surface hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          ) : (
            <button
              onClick={logout}
              className="flex w-full items-center justify-center rounded-claySm p-2.5 text-ink-secondary transition-colors hover:bg-base-surface hover:text-red-500"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-ink-muted/10 bg-base-surfaceLight py-2 shadow-clay md:hidden">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-claySm px-3 py-1.5 text-[10px] font-medium ${
                isActive ? "text-blue-600" : "text-ink-muted"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
        <button onClick={logout} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium text-ink-muted">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  );
}