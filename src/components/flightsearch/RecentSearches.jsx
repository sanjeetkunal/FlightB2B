import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlaneTakeoff, Trash2, Star } from "lucide-react";

const RECENT_KEY = "flight_recent_searches";
const MAX_ITEMS = 5;

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
    const t = setTimeout(() => {
      const data = getRecentSearches();

      const withCount = data.map((r) => ({
        ...r,
        count: r.count || 1,
      }));

      withCount.sort((a, b) => b.count - a.count);

      setItems(withCount.slice(0, MAX_ITEMS));
      setLoading(false);
    }, 350);

    return () => clearTimeout(t);
  }, []);

  if (!loading && !items.length) {
    return (
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">Recent Searches</h4>
        </div>
        <div className="mt-2 text-xs text-gray-500">No recent searches yet.</div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Recent Searches</h4>
          <div className="text-[11px] text-gray-500">Quick re-search in one click</div>
        </div>

        <button
          onClick={() => {
            clearRecentSearches();
            setItems([]);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-red-50 hover:text-red-700 transition"
          title="Clear recent searches"
          type="button"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {/* Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-[74px] rounded-xl border border-gray-200 bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div
          className="
            grid gap-2
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-5
          "
        >
          {items.map((r, i) => (
            <button
              key={`${r.params}-${i}`}
              type="button"
              onClick={() => navigate(`/flight-results?${r.params}`)}
              className="
                group relative w-full overflow-hidden
                rounded-xl border border-gray-200 bg-white
                px-3 py-2 text-left
                hover:border-blue-200 hover:shadow-[0_10px_20px_rgba(0,0,0,0.06)]
                transition
              "
              title="Search again"
            >
              {/* Top row: sector + trip */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {i === 0 && <Star className="h-3.5 w-3.5 text-amber-400" />}
                  <span
                    className={[
                      "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                      r.sector === "intl"
                        ? "bg-purple-50 text-purple-700 border border-purple-100"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100",
                    ].join(" ")}
                  >
                    {(r.sector || "dom").toUpperCase()}
                  </span>
                </div>

                <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
                  {r.trip === "roundtrip" ? "ROUND" : "ONEWAY"}
                </span>
              </div>

              {/* Route */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{r.from}</span>
                <PlaneTakeoff className="h-4 w-4 text-blue-600 -rotate-12 group-hover:translate-x-0.5 transition" />
                <span className="text-sm font-semibold text-gray-900">{r.to}</span>
              </div>

              {/* Date */}
              <div className="mt-1 text-[11px] font-medium text-gray-500 truncate">
                {r.dateLabel}
              </div>

              {/* subtle hover bar */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-transparent group-hover:bg-blue-600 transition" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
