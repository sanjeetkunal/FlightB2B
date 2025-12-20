import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlaneTakeoff, Trash2, Star } from "lucide-react";

const RECENT_KEY = "flight_recent_searches";
const MAX_ITEMS = 5;

/* ---------- helpers ---------- */
const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
};

const clearRecentSearches = () => {
  localStorage.removeItem(RECENT_KEY);
};

export default function RecentSearches() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // skeleton feel
    setTimeout(() => {
      const data = getRecentSearches();

      // auto-pin most used route
      const withCount = data.map((r) => ({
        ...r,
        count: r.count || 1,
      }));

      withCount.sort((a, b) => b.count - a.count);

      setItems(withCount.slice(0, MAX_ITEMS));
      setLoading(false);
    }, 500);
  }, []);

  if (!loading && !items.length) {
    return (
      <div className="mt-4 rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">
          Recent Searches
        </h4>
        <div className="text-xs text-gray-500">
          No recent searches yet.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">
          Recent Searches
        </h4>

        <button
          onClick={() => {
            clearRecentSearches();
            setItems([]);
          }}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition"
          title="Clear recent searches"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {/* Skeleton */}
      {loading ? (
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-7 w-32 rounded-lg bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pb-1 scrollbar-hide">
          {items.map((r, i) => (
            <button
              key={i}
              onClick={() => navigate(`/flight-results?${r.params}`)}
              title="Search again"
              className="
                group relative flex shrink-0 items-center gap-2
                rounded-lg bg-gray-50 px-3 py-1.5
                text-xs text-gray-700
                hover:bg-blue-50 transition
              "
            >
              {/* Star for most-used */}
              {i === 0 && (
                <Star className="h-3 w-3 text-amber-400" />
              )}

              {/* Route */}
              <span className="flex items-center gap-1 font-medium">
                {r.from}
                <PlaneTakeoff
                  className="
                    h-3 w-3 text-blue-500 -rotate-12
                    transition group-hover:translate-x-0.5
                  "
                />
                {r.to}
              </span>

              {/* Divider */}
              <span className="h-3 w-px bg-gray-300" />

              {/* Date */}
              <span className="text-gray-500 whitespace-nowrap">
                {r.dateLabel}
              </span>

              {/* Trip */}
              <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-700">
                {r.trip === "roundtrip" ? "RT" : "OW"}
              </span>

              {/* Sector */}
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  r.sector === "intl"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {r.sector.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
