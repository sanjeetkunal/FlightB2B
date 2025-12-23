import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlaneTakeoff, Trash2, Star, Sparkles } from "lucide-react";

const RECENT_KEY = "flight_recent_searches";
const MAX_ITEMS = 5;

/**
 * @typedef {Object} RecentSearchItem
 * @property {string} params
 * @property {string} from
 * @property {string} to
 * @property {string} [dateLabel]
 * @property {"oneway"|"roundtrip"} [trip]
 * @property {"dom"|"intl"} [sector]
 * @property {number} [count]
 */

/** @returns {RecentSearchItem[]} */
const getRecentSearches = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
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

      withCount.sort((a, b) => (b.count || 0) - (a.count || 0));

      setItems(withCount.slice(0, MAX_ITEMS));
      setLoading(false);
    }, 350);

    return () => clearTimeout(t);
  }, []);

  const isEmpty = useMemo(() => !loading && items.length === 0, [loading, items]);

  if (isEmpty) {
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
    <div
      className="
        relative mt-4 overflow-hidden rounded-2xl border border-gray-200
        bg-white p-4
        shadow-[0_10px_25px_rgba(0,0,0,0.06)]
      "
    >
      {/* Enterprise gradient aura (behind) */}
      <div
        className="
          pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full
          bg-gradient-to-br from-blue-200/60 via-indigo-200/40 to-purple-200/50
          blur-3xl
        "
      />
      <div
        className="
          pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full
          bg-gradient-to-tr from-emerald-200/45 via-cyan-200/30 to-blue-200/45
          blur-3xl
        "
      />

      {/* subtle top border gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 opacity-60" />

      {/* Header */}
      <div className="relative mb-3 flex items-center justify-between">
        <div className="flex items-start gap-2">
          <div
            className="
              mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl
              bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm
            "
          >
            <Sparkles className="h-4 w-4" />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900">Recent Searches</h4>
            <div className="text-[11px] text-gray-500">
              Quick re-search in one click
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            clearRecentSearches();
            setItems([]);
          }}
          className="
            inline-flex items-center gap-1.5 rounded-lg border border-gray-200
            bg-white/70 px-2.5 py-1.5 text-xs text-gray-600
            hover:bg-red-50 hover:text-red-700
            transition
            backdrop-blur
          "
          title="Clear recent searches"
          type="button"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {/* Skeleton */}
      {loading ? (
        <div className="relative grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="
                h-[78px] rounded-xl border border-gray-200
                bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50
                animate-pulse
              "
            />
          ))}
        </div>
      ) : (
        <div className="relative grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {items.map((r, i) => (
            <button
              key={`${r.params}-${i}`}
              type="button"
              onClick={() => navigate(`/flight-results?${r.params}`)}
              className="
                group relative w-full overflow-hidden text-left
                rounded-xl border border-gray-200
                bg-gradient-to-br from-white via-white to-gray-50
                px-3 py-2
                shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]
                hover:border-blue-200
                hover:shadow-[0_14px_30px_rgba(0,0,0,0.10)]
                transition cursor-pointer
              "
              title="Search again"
            >
              {/* hover gradient wash */}
              <div
                className="
                  pointer-events-none absolute inset-0 opacity-0
                  bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-emerald-50/70
                  group-hover:opacity-100 transition
                "
              />

              {/* glossy highlight */}
              <div
                className="
                  pointer-events-none absolute -top-10 -left-10 h-24 w-24 rounded-full
                  bg-white/50 blur-2xl opacity-60
                "
              />

              {/* Top row: sector + trip */}
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {i === 0 && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-100">
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                      TOP
                    </span>
                  )}

                  <span
                    className={[
                      "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border",
                      (r.sector || "dom") === "intl"
                        ? "bg-purple-50 text-purple-700 border-purple-100"
                        : "bg-emerald-50 text-emerald-700 border-emerald-100",
                    ].join(" ")}
                  >
                    {(r.sector || "dom").toUpperCase()}
                  </span>
                </div>

                <span
                  className="
                    inline-flex items-center rounded-md
                    bg-gray-900/5 px-1.5 py-0.5 text-[10px]
                    font-semibold text-gray-700 border border-gray-200
                  "
                >
                  {r.trip === "roundtrip" ? "ROUND" : "ONEWAY"}
                </span>
              </div>

              {/* Route */}
              <div className="relative mt-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{r.from}</span>

                <span
                  className="
                    inline-flex h-8 w-8 items-center justify-center rounded-xl
                    border border-blue-100 bg-gradient-to-br from-blue-600 to-indigo-600
                    text-white shadow-sm
                    group-hover:scale-[1.03] transition
                  "
                >
                  <PlaneTakeoff className="h-4 w-4 -rotate-12 group-hover:translate-x-0.5 transition" />
                </span>

                <span className="text-sm font-semibold text-gray-900">{r.to}</span>
              </div>

              {/* Date */}
              <div className="relative mt-1 text-[11px] font-medium text-gray-600 truncate">
                {r.dateLabel || "—"}
              </div>

              {/* subtle bottom bar */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-indigo-600 group-hover:to-emerald-500 transition" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
