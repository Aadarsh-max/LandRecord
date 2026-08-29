import { NavLink } from "react-router-dom";
import { LayoutGrid, Upload, ClipboardCheck, LogOut, Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const links = [
  { to: "/search", label: "Search", icon: Search },
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/verification", label: "Verification", icon: ClipboardCheck }
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen w-60 flex-col justify-between rounded-r-clay bg-base-surfaceLight p-5 shadow-clay">
      <div>
        <p className="mb-8 px-2 text-sm font-semibold uppercase tracking-widest text-blue-600">BhuLekh AI</p>
        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-claySm px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-clay"
                    : "text-ink-secondary hover:bg-base-surface"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-ink-muted/10 pt-4">
        <p className="px-2 text-sm font-medium text-ink-primary">{user?.name}</p>
        <p className="px-2 text-xs text-ink-muted capitalize">{user?.role}</p>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center gap-2 rounded-claySm px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-base-surface hover:text-red-500"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );
}