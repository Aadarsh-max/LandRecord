import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import FieldReviewCard from "../components/review/FieldReviewCard";
import api from "../services/api";
import RiskScoreWidget from "../components/dashboard/RiskScoreWidget";
import ParcelMap from "../components/map/ParcelMap";

export default function VerificationQueue() {
  const location = useLocation();
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    setLoading(true);
    const response = await api.get("/records");
    setRecords(response.data.records);

    const targetId = location.state?.recordId;
    const target = targetId
      ? response.data.records.find((record) => record.id === targetId)
      : response.data.records[0];

    if (target) {
      loadRecordDetail(target.id);
    }
    setLoading(false);
  }

  async function loadRecordDetail(recordId) {
    const response = await api.get(`/records/${recordId}`);
    setSelectedRecord(response.data.record);
  }

  async function handleVerify(fieldName, correctedValue) {
    if (!selectedRecord) return;
    await api.post(`/records/${selectedRecord.id}/verify`, {
      fieldName,
      correctedValue,
    });
    loadRecordDetail(selectedRecord.id);
  }

  function getConfidence(fieldName) {
    const entry = selectedRecord?.field_confidence?.find(
      (f) => f.field_name === fieldName,
    );
    return entry?.confidence_score ?? 0;
  }

  function isVerified(fieldName) {
    const entry = selectedRecord?.field_confidence?.find(
      (f) => f.field_name === fieldName,
    );
    return entry?.is_verified ?? false;
  }

  const displayFields = selectedRecord
    ? Object.keys(selectedRecord).filter((key) =>
        [
          "landowner_name",
          "survey_number",
          "khasra_number",
          "khata_number",
          "plot_area",
          "village",
          "tehsil",
          "district",
          "land_classification",
          "ownership_type",
          "mutation_status",
          "registration_number",
        ].includes(key),
      )
    : [];

  return (
    <div className="flex min-h-screen bg-base-bg">
      <Sidebar />

      <div className="flex flex-1">
        <div className="w-72 border-r border-ink-muted/10 px-5 py-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Records
          </h2>
          <div className="space-y-2">
            {records.map((record) => (
              <button
                key={record.id}
                onClick={() => loadRecordDetail(record.id)}
                className={`w-full rounded-claySm p-3 text-left text-sm transition-all ${
                  selectedRecord?.id === record.id
                    ? "bg-blue-500/10 font-medium text-blue-600"
                    : "text-ink-secondary hover:bg-base-surface"
                }`}
              >
                {record.landowner_name || "Unnamed record"}
                <p className="text-xs text-ink-muted">
                  {record.survey_number || "No survey no."}
                </p>
              </button>
            ))}
            {!loading && records.length === 0 && (
              <p className="text-sm text-ink-muted">
                No records yet. Upload a document to get started.
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 px-10 py-8">
          {selectedRecord ? (
            <>
              <h1 className="text-2xl font-semibold text-ink-primary">
                {selectedRecord.landowner_name || "Unverified record"}
              </h1>
              <p className="mt-1 text-sm text-ink-secondary">
                Survey {selectedRecord.survey_number} · {selectedRecord.village}
                , {selectedRecord.district}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {displayFields.map((fieldName) => (
                  <FieldReviewCard
                    key={fieldName}
                    fieldName={fieldName}
                    value={selectedRecord[fieldName]}
                    confidence={getConfidence(fieldName)}
                    isVerified={isVerified(fieldName)}
                    onVerify={handleVerify}
                  />
                ))}
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <RiskScoreWidget recordId={selectedRecord.id} />
                <ParcelMap record={selectedRecord} />
              </div>
            </>
          ) : (
            <p className="text-ink-secondary">
              Select a record to review, or upload a new document.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
