import { useNavigate } from "react-router-dom";
import { PlaneTakeoff } from "lucide-react";

const RECENT_KEY = "flight_recent_searches";

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
};

export default function RecentSearches() {
  const navigate = useNavigate();
  const recentSearches = getRecentSearches();

  if (!recentSearches.length) return null;

  return (
    <div
      className="
        mt-4 rounded-2xl bg-white p-4
        shadow-[0_6px_18px_rgba(0,0,0,0.08)]
      "
    >
      {/* Header */}
      <div className="mb-3 text-sm font-semibold text-gray-800">
        Recent Searches
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-2">
        {recentSearches.map((r, i) => (
          <button
            key={i}
            onClick={() => navigate(`/flight-results?${r.params}`)}
            className="
              group flex items-center gap-2
              rounded-lg bg-gray-50 px-3 py-1.5
              text-xs text-gray-700
              hover:bg-blue-50
              transition cursor-pointer border border-gray-200
              hover:border-blue-300
            "
          >
            {/* Route */}
            <span className="flex items-center gap-1 font-medium">
              {r.from}
              <PlaneTakeoff className="h-3 w-3 text-blue-500 -rotate-12" />
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
    </div>
  );
}
