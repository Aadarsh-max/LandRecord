import { useEffect, useState } from "react";
import { AlertCircle, Copy, TrendingDown } from "lucide-react";
import api from "../../services/api";

export default function ErrorStatsPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/error-stats").then((response) => setStats(response.data));
  }, []);

  if (!stats) return null;

  return (
    <div className="rounded-clay bg-base-surfaceLight p-6 shadow-clay">
      <h2 className="text-lg font-medium text-ink-primary">Error Statistics</h2>
      <p className="mt-1 text-sm text-ink-secondary">System quality diagnostics</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-claySm bg-red-500/10 p-3">
          <p className="text-xl font-semibold text-red-600">{stats.failed_documents}</p>
          <p className="text-xs text-ink-secondary">Failed documents</p>
        </div>
        <div className="rounded-claySm bg-amia-500/10 p-3">
          <p className="text-xl font-semibold text-amia-600">{stats.duplicate_flags_raised}</p>
          <p className="text-xs text-ink-secondary">Duplicate flags raised</p>
        </div>
        <div className="rounded-claySm bg-blue-500/10 p-3">
          <p className="text-xl font-semibold text-blue-600">
            {stats.average_field_confidence ? `${Math.round(stats.average_field_confidence * 100)}%` : "—"}
          </p>
          <p className="text-xs text-ink-secondary">Avg. field confidence</p>
        </div>
        <div className="rounded-claySm bg-green-500/10 p-3">
          <p className="text-xl font-semibold text-green-600">{stats.total_fields_extracted}</p>
          <p className="text-xs text-ink-secondary">Total fields extracted</p>
        </div>
      </div>

      {stats.most_error_prone_fields?.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-primary">
            <TrendingDown className="h-4 w-4 text-red-500" /> Most error-prone fields
          </p>
          <div className="space-y-1.5">
            {stats.most_error_prone_fields.map((field) => (
              <div key={field.field_name} className="flex items-center justify-between text-xs">
                <span className="text-ink-secondary capitalize">{field.field_name.replace(/_/g, " ")}</span>
                <span className="font-medium text-red-500">{field.low_confidence_count} low-confidence</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}