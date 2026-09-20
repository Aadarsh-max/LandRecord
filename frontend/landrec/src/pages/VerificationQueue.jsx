import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ClipboardList, MousePointerClick, Sparkles, ShieldCheck, MapPin, Upload } from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import FieldReviewCard from "../components/review/FieldReviewCard";
import EmptyState from "../components/common/EmptyState";
import api from "../services/api";
import RiskScoreWidget from "../components/dashboard/RiskScoreWidget";
import EkycWidget from "../components/dashboard/EkycWidget";
import ParcelMap from "../components/map/ParcelMap";

const FEATURE_STRIP = [
  { icon: Sparkles, title: "AI Field Extraction", desc: "All 12 fields extracted automatically, across Indian languages." },
  { icon: ShieldCheck, title: "Confidence Scoring", desc: "Only low-confidence fields need your review." },
  { icon: MapPin, title: "GIS Mapping", desc: "Every record is plotted on a live map by village." }
];

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
    await api.post(`/records/${selectedRecord.id}/verify`, { fieldName, correctedValue });
    loadRecordDetail(selectedRecord.id);
  }

  async function handleMarkVerified() {
    if (!selectedRecord) return;
    await api.post(`/documents/${selectedRecord.document_id}/mark-verified`);
    loadRecordDetail(selectedRecord.id);
    fetchRecords();
  }

  function getConfidence(fieldName) {
    const entry = selectedRecord?.field_confidence?.find((f) => f.field_name === fieldName);
    return entry?.confidence_score ?? 0;
  }

  function isVerified(fieldName) {
    const entry = selectedRecord?.field_confidence?.find((f) => f.field_name === fieldName);
    return entry?.is_verified ?? false;
  }

  const displayFields = selectedRecord
    ? Object.keys(selectedRecord).filter((key) =>
        [
          "landowner_name", "survey_number", "khasra_number", "khata_number",
          "plot_area", "village", "tehsil", "district", "land_classification",
          "ownership_type", "mutation_status", "registration_number"
        ].includes(key)
      )
    : [];

  return (
    <div className="flex min-h-screen bg-base-bg pb-24 md:pb-0">
      <Sidebar />

      <div className="flex flex-1 flex-col md:flex-row">
        <div className="border-b border-ink-muted/10 px-5 py-6 md:w-72 md:border-b-0 md:border-r md:py-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">Records</h2>

          {!loading && records.length === 0 ? (
            <div className="rounded-clay bg-base-surfaceLight p-6 text-center shadow-clayInset">
              <ClipboardList className="mx-auto mb-3 h-8 w-8 text-ink-muted" />
              <p className="text-sm font-medium text-ink-primary">No records yet</p>
              <p className="mt-1 text-xs text-ink-secondary">Upload a document to see it here for review.</p>
            </div>
          ) : (
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
                  <p className="text-xs text-ink-muted">{record.survey_number || "No survey no."}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 px-5 py-8 sm:px-10">
          {selectedRecord ? (
            <>
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-2xl font-semibold text-ink-primary">
                    {selectedRecord.landowner_name || "Unverified record"}
                  </h1>
                  <p className="mt-1 text-sm text-ink-secondary">
                    Survey {selectedRecord.survey_number} · {selectedRecord.village}, {selectedRecord.district}
                  </p>
                </div>

                {selectedRecord.document_status !== "verified" ? (
                  <button
                    onClick={handleMarkVerified}
                    className="rounded-claySm bg-gradient-to-br from-green-500 to-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-clay transition-all hover:-translate-y-0.5 hover:shadow-claySm"
                  >
                    Mark Record as Verified
                  </button>
                ) : (
                  <span className="inline-block rounded-full bg-green-500/15 px-4 py-1.5 text-sm font-medium text-green-600">
                    ✓ Verified
                  </span>
                )}
              </div>

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
                <EkycWidget record={selectedRecord} />
              </div>
              <div className="mt-4">
                <ParcelMap record={selectedRecord} />
              </div>
            </>
          ) : (
            <>
              <EmptyState
                icon={MousePointerClick}
                title="Select a record to review"
                subtitle="Choose a record from the list, or upload a new document to get started."
                actionLabel="Upload a document"
                actionTo="/upload"
              />

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {FEATURE_STRIP.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="rounded-clay bg-base-surfaceLight p-5 shadow-clay">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-claySm bg-gradient-to-br from-blue-500 to-green-500 text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-ink-primary">{title}</p>
                    <p className="mt-1 text-xs text-ink-secondary">{desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}