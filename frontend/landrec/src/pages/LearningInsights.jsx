import { useEffect, useState } from "react";
import { Brain, TrendingDown, Lightbulb } from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import api from "../services/api";

export default function LearningInsights() {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    api.get("/dashboard/learning-insights").then((response) => setInsights(response.data));
  }, []);

  if (!insights) return null;

  return (
    <div className="flex min-h-screen bg-base-bg">
      <Sidebar />

      <div className="flex-1 px-10 py-10">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-semibold text-ink-primary">AI Learning Insights</h1>
        </div>
        <p className="mt-1 text-sm text-ink-secondary">
          Patterns from verifier corrections — the foundation for improving extraction accuracy over time.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-clay bg-base-surfaceLight p-6 shadow-clay">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-ink-primary">
              <TrendingDown className="h-4 w-4 text-red-500" /> Fields Corrected Most Often
            </h2>
            {insights.correction_patterns.length === 0 ? (
              <p className="text-sm text-ink-muted">No corrections logged yet.</p>
            ) : (
              <div className="space-y-2">
                {insights.correction_patterns.map((pattern) => (
                  <div key={pattern.field_name} className="flex items-center justify-between rounded-claySm bg-base-surface p-3">
                    <span className="text-sm capitalize text-ink-primary">{(pattern.field_name || "unknown").replace(/_/g, " ")}</span>
                    <span className="text-sm font-semibold text-red-500">{pattern.correction_count}× corrected</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-clay bg-base-surfaceLight p-6 shadow-clay">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-ink-primary">
              <Lightbulb className="h-4 w-4 text-amia-600" /> Improvement Recommendations
            </h2>
            {insights.recommendations.length === 0 ? (
              <p className="text-sm text-ink-muted">All fields performing above the reliability threshold.</p>
            ) : (
              <div className="space-y-3">
                {insights.recommendations.map((rec) => (
                  <div key={rec.field} className="rounded-claySm bg-amia-500/10 p-3">
                    <p className="text-sm font-medium capitalize text-ink-primary">{rec.field.replace(/_/g, " ")}</p>
                    <p className="mt-1 text-xs text-ink-secondary">{rec.issue}</p>
                    <p className="mt-1 text-xs italic text-ink-muted">{rec.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-xs italic text-ink-muted">{insights.note}</p>
      </div>
    </div>
  );
}