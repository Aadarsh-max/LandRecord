import { useState } from "react";
import { CheckCircle2, Pencil } from "lucide-react";
import ConfidenceBadge from "./ConfidenceBadge";

const FIELD_LABELS = {
  landowner_name: "Landowner Name",
  survey_number: "Survey Number",
  khasra_number: "Khasra Number",
  khata_number: "Khata Number",
  plot_area: "Plot Area",
  village: "Village",
  tehsil: "Tehsil",
  district: "District",
  land_classification: "Land Classification",
  ownership_type: "Ownership Type",
  mutation_status: "Mutation Status",
  registration_number: "Registration Number"
};

export default function FieldReviewCard({ fieldName, value, confidence, isVerified, onVerify }) {
  const [editing, setEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value ?? "");

  function handleSave() {
    onVerify(fieldName, draftValue);
    setEditing(false);
  }

  return (
    <div className="rounded-claySm bg-base-surface p-4 shadow-clayInset">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {FIELD_LABELS[fieldName] || fieldName}
        </p>
        <div className="flex items-center gap-2">
          {isVerified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          <ConfidenceBadge confidence={confidence} />
        </div>
      </div>

      {editing ? (
        <div className="mt-2 flex gap-2">
          <input
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            className="flex-1 rounded-lg bg-base-surfaceLight px-3 py-1.5 text-sm text-ink-primary shadow-clayInset focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-medium text-ink-primary">{value || "— not extracted —"}</p>
          <button
            onClick={() => setEditing(true)}
            className="text-ink-muted transition-colors hover:text-blue-600"
            aria-label="Edit field"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}