import { useEffect, useState } from "react";
import { AlertOctagon } from "lucide-react";
import api from "../../services/api";

const LEVEL_STYLES = {
  low: "bg-green-500/15 text-green-600",
  medium: "bg-amia-500/15 text-amia-600",
  high: "bg-red-500/15 text-red-500"
};

export default function RiskScoreWidget({ recordId }) {
  const [risk, setRisk] = useState(null);

  useEffect(() => {
    if (!recordId) return;
    api.get(`/risk/${recordId}`).then((response) => setRisk(response.data));
  }, [recordId]);

  if (!risk) return null;

  return (
    <div className="rounded-clay bg-base-surfaceLight p-5 shadow-clay">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-ink-muted" />
          <p className="text-sm font-medium text-ink-primary">Dispute Risk</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${LEVEL_STYLES[risk.risk_level]}`}>
          {risk.risk_level} · {risk.risk_score}
        </span>
      </div>
      {risk.reasons.length > 0 && (
        <ul className="mt-3 space-y-1">
          {risk.reasons.map((reason, index) => (
            <li key={index} className="text-xs text-ink-secondary">• {reason}</li>
          ))}
        </ul>
      )}
    </div>
  );
}