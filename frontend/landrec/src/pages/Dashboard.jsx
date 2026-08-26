import { useEffect, useState } from "react";
import { FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then((response) => setStats(response.data));
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

  return (
    <div className="flex min-h-screen bg-base-bg">
      <Sidebar />

      <div className="flex-1 px-10 py-10">
        <h1 className="text-2xl font-semibold text-ink-primary">Digitization overview</h1>
        <p className="mt-1 text-sm text-ink-secondary">Live status across all districts</p>

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
      </div>
    </div>
  );
}