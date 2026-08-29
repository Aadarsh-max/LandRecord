import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import SemanticSearchBar from "../components/search/SemanticSearchBar";

export default function SearchRecords() {
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);

  function handleResults(matches) {
    setResults(matches);
    setSearched(true);
  }

  return (
    <div className="flex min-h-screen bg-base-bg">
      <Sidebar />

      <div className="flex-1 px-10 py-10">
        <h1 className="text-2xl font-semibold text-ink-primary">Search records</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Search using plain language — e.g. "agricultural land near Ahmednagar"
        </p>

        <div className="mt-6 max-w-2xl">
          <SemanticSearchBar onResults={handleResults} />
        </div>

        <div className="mt-8">
          {!searched && (
            <div className="flex flex-col items-center justify-center rounded-clay bg-base-surfaceLight p-16 text-center shadow-clayInset">
              <Search className="mb-3 h-8 w-8 text-ink-muted" />
              <p className="text-sm text-ink-secondary">Run a search to see matching records here.</p>
            </div>
          )}

          {searched && results?.length === 0 && (
            <div className="rounded-clay bg-base-surfaceLight p-10 text-center shadow-clay">
              <p className="text-sm text-ink-secondary">No matching records found. Try a broader query.</p>
            </div>
          )}

          {searched && results?.length > 0 && (
            <div className="space-y-3">
              {results.map((match) => (
                <Link
                  key={match.id}
                  to="/verification"
                  state={{ recordId: match.id }}
                  className="flex items-center justify-between rounded-clay bg-base-surfaceLight p-5 shadow-clay transition-transform hover:-translate-y-0.5"
                >
                  <div>
                    <p className="font-medium text-ink-primary">
                      {match.record?.landowner_name || "Unnamed record"}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                      <MapPin className="h-3 w-3" />
                      {match.record?.village || "Unknown village"}, {match.record?.district || "Unknown district"}
                      {match.record?.survey_number ? ` · Survey ${match.record.survey_number}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600">
                    {Math.round(match.score * 100)}% match
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}