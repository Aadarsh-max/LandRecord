import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, SearchX, Sparkles, Type, Brain, ListChecks } from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import SemanticSearchBar from "../components/search/SemanticSearchBar";
import EmptyState from "../components/common/EmptyState";

const EXAMPLE_QUERIES = [
  "agricultural land near Ahmednagar",
  "residential plots in Coimbatore",
  "records with approved mutation status"
];

const HOW_IT_WORKS = [
  { icon: Type, title: "Type naturally", desc: "No need for exact survey numbers — describe what you're looking for." },
  { icon: Brain, title: "AI understands meaning", desc: "Semantic embeddings match the intent of your query, not just keywords." },
  { icon: ListChecks, title: "Only relevant results", desc: "Weak or unrelated matches are automatically filtered out." }
];

export default function SearchRecords() {
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);

  function handleResults(matches) {
    setResults(matches);
    setSearched(true);
  }

  return (
    <div className="flex min-h-screen bg-base-bg pb-24 md:pb-0">
      <Sidebar />

      <div className="flex-1 px-5 py-8 sm:px-10">
        <h1 className="text-2xl font-semibold text-ink-primary">Search records</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Search using plain language — powered by semantic AI matching
        </p>

        <div className="mt-6 max-w-2xl">
          <SemanticSearchBar onResults={handleResults} />

          {!searched && (
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((example) => (
                <span
                  key={example}
                  className="rounded-full bg-base-surface px-3 py-1.5 text-xs text-ink-secondary shadow-claySm"
                >
                  {example}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          {!searched && (
            <>
              <EmptyState
                icon={Sparkles}
                title="Search across all digitized records"
                subtitle="Try a natural-language query like 'agricultural land near Ahmednagar' — no need for exact survey numbers."
              />

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {HOW_IT_WORKS.map(({ icon: Icon, title, desc }) => (
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

          {searched && results?.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="No closely matching records"
              subtitle="We only show results that are genuinely relevant. Try a broader or different search query."
            />
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