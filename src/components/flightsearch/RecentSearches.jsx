import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlaneTakeoff, Trash2, Star, Sparkles } from "lucide-react";

const RECENT_KEY = "flight_recent_searches";
const MAX_ITEMS = 5;

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
      const withCount = data.map((r) => ({ ...r, count: r.count || 1 }));
      withCount.sort((a, b) => (b.count || 0) - (a.count || 0));
      setItems(withCount.slice(0, MAX_ITEMS));
      setLoading(false);
    }, 350);

    return () => clearTimeout(t);
  }, []);

  const isEmpty = useMemo(() => !loading && items.length === 0, [loading, items]);

  if (isEmpty) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/85 p-4 backdrop-blur shadow-[0_10px_25px_rgba(2,6,23,0.06)]">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900">Recent Searches</h4>
        </div>
        <div className="mt-2 text-xs text-slate-500">No recent searches yet.</div>
      </div>
    );
  }

  return (
    <div
      className="
        relative mt-8 overflow-hidden rounded-2xl
        border border-slate-200/70 bg-white/80 p-4 backdrop-blur
        shadow-[0_12px_30px_rgba(2,6,23,0.08)]
      "
    >
      {/* Logo-theme aura blobs */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-gradient-to-br from-cyan-200/60 via-sky-200/35 to-purple-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-200/45 via-teal-200/30 to-cyan-200/40 blur-3xl" />

      {/* Header */}
      <div className="relative mb-3 flex items-center justify-between">
        <div className="flex items-start gap-2">
          <div
            className="
              mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl
              bg-gradient-to-br from-cyan-600 via-sky-600 to-emerald-500 text-white
              shadow-[0_8px_18px_rgba(14,165,233,0.25)]
            "
          >
            <Sparkles className="h-4 w-4" />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Recent Searches</h4>
            <div className="text-[11px] text-slate-500">Quick re-search in one click</div>
          </div>
        </div>

        <button
          onClick={() => {
            clearRecentSearches();
            setItems([]);
          }}
          className="
            inline-flex items-center gap-1.5 rounded-lg
            border border-slate-200/80 bg-white/70 px-2.5 py-1.5
            text-xs text-slate-600 backdrop-blur
            hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200
            transition
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
                h-[78px] rounded-xl border border-slate-200/70
                bg-gradient-to-br from-white via-slate-50 to-white
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
                rounded-xl border border-slate-200/70
                bg-white/75 backdrop-blur
                px-3 py-2
                shadow-[0_1px_0_rgba(255,255,255,0.85)_inset]
                hover:border-cyan-200
                hover:shadow-[0_16px_34px_rgba(2,6,23,0.12)]
                transition cursor-pointer
              "
              title="Search again"
            >
              {/* hover wash (logo palette) */}
              <div className="pointer-events-none absolute inset-0 opacity-0 bg-gradient-to-br from-cyan-50/90 via-sky-50/45 to-emerald-50/80 group-hover:opacity-100 transition" />

              {/* glossy highlight */}
              <div className="pointer-events-none absolute -top-10 -left-10 h-24 w-24 rounded-full bg-white/55 blur-2xl opacity-60" />

              {/* Top row */}
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {i === 0 && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-100">
                      <Star className="h-3.5 w-3.5 text-purple-500" />
                      TOP
                    </span>
                  )}

                  <span
                    className={[
                      "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border",
                      (r.sector || "dom") === "intl"
                        ? "bg-purple-50 text-purple-700 border-purple-100"
                        : "bg-teal-50 text-teal-700 border-teal-100",
                    ].join(" ")}
                  >
                    {(r.sector || "dom").toUpperCase()}
                  </span>
                </div>

                <span
                  className="
                    inline-flex items-center rounded-md
                    bg-slate-900/5 px-1.5 py-0.5 text-[10px]
                    font-semibold text-slate-700 border border-slate-200/80
                  "
                >
                  {r.trip === "roundtrip" ? "ROUND" : "ONEWAY"}
                </span>
              </div>

              {/* Route */}
              <div className="relative mt-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{r.from}</span>

                <span
                  className="
                    inline-flex h-8 w-8 items-center justify-center rounded-xl
                    border border-cyan-100
                    bg-gradient-to-br from-cyan-600 via-sky-600 to-emerald-500
                    text-white shadow-[0_10px_22px_rgba(6,182,212,0.22)]
                    group-hover:scale-[1.03] transition
                  "
                >
                  <PlaneTakeoff className="h-4 w-4 -rotate-12 group-hover:translate-x-0.5 transition" />
                </span>

                <span className="text-sm font-semibold text-slate-900">{r.to}</span>
              </div>

              {/* Date */}
              <div className="relative mt-1 text-[11px] font-medium text-slate-600 truncate">
                {r.dateLabel || "—"}
              </div>

              {/* bottom active line (logo palette) */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:via-sky-600 group-hover:to-emerald-500 transition" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
