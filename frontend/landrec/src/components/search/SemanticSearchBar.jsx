import { useState } from "react";
import { Search } from "lucide-react";
import api from "../../services/api";

export default function SemanticSearchBar({ onResults }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      await api.post("/search/reindex");
      const response = await api.post("/search/query", { query, top_k: 5 });
      onResults(response.data.matches);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try: agricultural land near Ahmednagar"
        className="w-full rounded-claySm bg-base-surface py-3 pl-11 pr-24 text-sm text-ink-primary shadow-clayInset focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}