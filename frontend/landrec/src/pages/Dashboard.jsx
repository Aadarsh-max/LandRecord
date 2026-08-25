import { FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import FloatingBackground from "../components/common/FloatingBackground";

const stats = [
  { label: "Documents processed", value: "12,480", icon: FileText, tone: "blue" },
  { label: "Verified records", value: "10,910", icon: CheckCircle2, tone: "green" },
  { label: "Pending verification", value: "842", icon: Clock, tone: "amia" },
  { label: "Flagged for review", value: "63", icon: AlertTriangle, tone: "blue" }
];

const toneStyles = {
  blue: "bg-gradient-to-br from-blue-500 to-blue-600",
  green: "bg-gradient-to-br from-green-500 to-green-600",
  amia: "bg-gradient-to-br from-amia-500 to-amia-600"
};

export default function Dashboard() {
  return (
    <div className="relative min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <FloatingBackground />

      <h1 className="text-2xl font-semibold text-ink-primary">Digitization overview</h1>
      <p className="mt-1 text-sm text-ink-secondary">Live status across all districts</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
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
        <div className="rounded-clay bg-base-surfaceLight p-6 shadow-clay lg:col-span-2 lg:row-span-2">
          <h2 className="text-lg font-medium text-ink-primary">District-wise progress</h2>
          <p className="mt-1 text-sm text-ink-secondary">Chart component goes here</p>
          <div className="mt-6 h-64 rounded-claySm bg-base-surface shadow-clayInset" />
        </div>

        <div className="rounded-clay bg-base-surfaceLight p-6 shadow-clay">
          <h2 className="text-lg font-medium text-ink-primary">Extraction accuracy</h2>
          <p className="mt-4 text-3xl font-semibold text-green-600">97.2%</p>
          <p className="text-sm text-ink-secondary">Last 30 days average</p>
        </div>

        <div className="rounded-clay bg-base-surfaceLight p-6 shadow-clay">
          <h2 className="text-lg font-medium text-ink-primary">Dispute risk flags</h2>
          <p className="mt-4 text-3xl font-semibold text-blue-600">18</p>
          <p className="text-sm text-ink-secondary">High-risk parcels this week</p>
        </div>
      </div>
    </div>
  );
}