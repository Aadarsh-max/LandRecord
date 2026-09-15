import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import api from "../../services/api";

export default function EkycWidget({ record }) {
  const [ekyc, setEkyc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!record?.landowner_name) return;

    setLoading(true);
    api.post("/ekyc/verify", {
      owner_name: record.landowner_name,
      survey_number: record.survey_number
    })
      .then((response) => setEkyc(response.data))
      .catch(() => setEkyc(null))
      .finally(() => setLoading(false));
  }, [record]);

  if (loading) {
    return (
      <div className="rounded-clay bg-base-surfaceLight p-5 shadow-clay">
        <p className="text-sm text-ink-secondary">Checking identity records...</p>
      </div>
    );
  }

  if (!ekyc) {
    return (
      <div className="rounded-clay bg-base-surfaceLight p-5 shadow-clay">
        <p className="text-sm text-ink-secondary">e-KYC check unavailable for this record.</p>
      </div>
    );
  }

  const identityFound = ekyc.identity_lookup?.found;
  const consistencyStatus = ekyc.ownership_consistency?.status;

  const statusConfig = {
    verified: { icon: ShieldCheck, color: "text-green-600", bg: "bg-green-500/15", label: "Ownership Verified" },
    mismatch: { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/15", label: "Ownership Mismatch" },
    no_prior_record: { icon: ShieldQuestion, color: "text-blue-600", bg: "bg-blue-500/15", label: "First Record" },
    unverified: { icon: ShieldQuestion, color: "text-amia-600", bg: "bg-amia-500/15", label: "Unverified" },
    unavailable: { icon: ShieldQuestion, color: "text-ink-muted", bg: "bg-base-surface", label: "Unavailable" }
  };

  const config = statusConfig[consistencyStatus] || statusConfig.unverified;
  const Icon = config.icon;

  return (
    <div className="rounded-clay bg-base-surfaceLight p-5 shadow-clay">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.color}`} />
          <p className="text-sm font-medium text-ink-primary">e-KYC Ownership Check</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.color}`}>
          {config.label}
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        <p className="text-xs text-ink-secondary">
          Identity lookup:{" "}
          {identityFound ? (
            <span className="font-medium text-green-600">Found — ID {ekyc.identity_lookup.id_number_masked}</span>
          ) : (
            <span className="font-medium text-ink-muted">Not found in identity registry</span>
          )}
        </p>

        {consistencyStatus === "mismatch" && (
          <p className="text-xs text-red-500">
            Current owner "{ekyc.ownership_consistency.current_owner}" differs from previously verified owner "{ekyc.ownership_consistency.prior_owner}" for this survey number.
          </p>
        )}

        <p className="text-[11px] italic text-ink-muted">{ekyc.note}</p>
      </div>
    </div>
  );
}