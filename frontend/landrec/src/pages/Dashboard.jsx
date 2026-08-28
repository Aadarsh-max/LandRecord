import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, CheckCircle2, Clock, AlertTriangle, Upload, ClipboardCheck, Search } from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import DistrictChart from "../components/dashboard/DistrictChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get("/dashboard/stats").then((response) => setStats(response.data));
    api.get("/dashboard/breakdown").then((response) => setBreakdown(response.data));
    api.get("/dashboard/recent").then((response) => setRecent(response.data.recent));
  }, []);

  const statCards = [
    { label: "Documents processed", value: stats?.total_documents ?? "—", icon: FileText, tone: "blue" },
    { label: "Verified records", value: stats?.verified_records ?? "—", icon: CheckCircle2, tone: "green" },
    { label: "Pending verification", value: stats?.pending_verification ?? "—", icon: Clock, tone: "amia" },
    { label: "Flagged for review", value: stats?.flagged_for_review ?? "—", icon: AlertTriangle, tone: "blue" }
  ];

  const toneStyles = {
    blue: "bg-gradient-to-br from-blue-500 to-blue-600",
    green: "bg-gradient-to-br from-green-500 to-green-600",
    amia: "bg-gradient-to-br from-amia-500 to-amia-600"
  };

  const quickActions = [
    { to: "/upload", label: "Upload Document", icon: Upload, variant: "primary" },
    { to: "/verification", label: "Review Queue", icon: ClipboardCheck, variant: "secondary" },
    { to: "/search", label: "Search Records", icon: Search, variant: "ghost" }
  ];

  return (
    <div className="flex min-h-screen bg-base-bg">
      <Sidebar />

      <div className="flex-1 px-10 py-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink-primary">Digitization overview</h1>
            <p className="mt-1 text-sm text-ink-secondary">Live status across all districts</p>
          </div>

          <div className="flex gap-2">
            {quickActions.map(({ to, label, icon: Icon, variant }) => {
              const styleMap = {
                primary: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-clay hover:shadow-claySm",
                secondary: "bg-gradient-to-br from-amia-500 to-green-500 text-white shadow-clay hover:shadow-claySm",
                ghost: "bg-base-surfaceLight text-ink-primary shadow-clay hover:shadow-clayInset"
              };
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-claySm px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${styleMap[variant]}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-clay bg-base-surfaceLight p-6 shadow-clay transition-transform duration-300 hover:-translate-y-1">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-claySm text-white ${toneStyles[tone]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-ink-primary">{value}</p>
              <p className="text-sm text-ink-secondary">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-clay bg-base-surfaceLight p-6 shadow-clay lg:col-span-2">
            <h2 className="text-lg font-medium text-ink-primary">District-wise records</h2>
            <p className="mt-1 text-sm text-ink-secondary">Number of land records digitized per district</p>
            <div className="mt-4">
              <DistrictChart data={breakdown?.by_district} />
            </div>
          </div>

          <div className="rounded-clay bg-base-surfaceLight p-6 shadow-clay">
            <h2 className="text-lg font-medium text-ink-primary">Recent uploads</h2>
            <p className="mt-1 text-sm text-ink-secondary">Latest documents processed</p>
            <div className="mt-4">
              <RecentActivity items={recent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}