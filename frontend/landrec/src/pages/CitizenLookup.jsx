import { useState } from "react";
import { Search } from "lucide-react";
import FloatingBackground from "../components/common/FloatingBackground";
import TextInput from "../components/common/TextInput";
import Button from "../components/common/Button";
import api from "../services/api";

export default function CitizenLookup() {
  const [surveyNumber, setSurveyNumber] = useState("");
  const [village, setVillage] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.get("/public/records/lookup", {
        params: { survey_number: surveyNumber, village: village || undefined }
      });
      setResults(response.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-base-bg px-4 py-16">
      <FloatingBackground />
      <div className="mx-auto max-w-xl rounded-clay bg-base-surfaceLight p-8 shadow-clay">
        <h1 className="text-2xl font-semibold text-ink-primary">Check Your Land Record Status</h1>
        <p className="mt-1 text-sm text-ink-secondary">Enter your survey number to check digitization status.</p>

        <form onSubmit={handleSearch} className="mt-6 space-y-4">
          <TextInput id="survey" label="Survey Number" value={surveyNumber} onChange={(e) => setSurveyNumber(e.target.value)} required />
          <TextInput id="village" label="Village (optional)" value={village} onChange={(e) => setVillage(e.target.value)} />
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {results && !results.found && (
          <p className="mt-6 text-sm text-ink-secondary">No record found for this survey number.</p>
        )}

        {results?.found && results.records.map((record, i) => (
          <div key={i} className="mt-4 rounded-claySm bg-base-surface p-4 shadow-clayInset">
            <p className="font-medium text-ink-primary">{record.landowner_name}</p>
            <p className="text-sm text-ink-secondary">{record.village}, {record.tehsil}, {record.district}</p>
            <p className="mt-1 text-xs text-ink-muted">Status: {record.mutation_status || "Processing"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}