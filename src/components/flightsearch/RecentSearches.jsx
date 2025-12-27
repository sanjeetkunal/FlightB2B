// src/components/flightsearch/RecentSearches.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {}
};

/* ---------------- Theme helpers ---------------- */
function clampHex(hex) {
  if (!hex) return null;
  let h = String(hex).trim();
  if (!h) return null;
  if (!h.startsWith("#")) h = `#${h}`;
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h)) return null;
  if (h.length === 4) {
    const r = h[1],
      g = h[2],
      b = h[3];
    h = `#${r}${r}${g}${g}${b}${b}`;
  }
  return h.toLowerCase();
}

function parseCssColor(input) {
  const s = String(input || "").trim();
  if (!s) return null;

  const hx = clampHex(s);
  if (hx) {
    const h = hx.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  const m = s.match(
    /rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+)\s*)?\)/
  );
  if (m) {
    return {
      r: Math.max(0, Math.min(255, Number(m[1]))),
      g: Math.max(0, Math.min(255, Number(m[2]))),
      b: Math.max(0, Math.min(255, Number(m[3]))),
    };
  }

  return null;
}

function rgba(rgb, a) {
  if (!rgb) return `rgba(0,0,0,${a})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

function getVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ---------------- Component ---------------- */
export default function RecentSearches() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  // theme-driven aura gradients
  const [aura, setAura] = useState({
    left: "",
    right: "",
    bottom: "",
    icon: "",
    chipBg: "",
    tagBg: "",
    tagBorder: "",
    tagText: "",
  });

  const recomputeAura = useCallback(() => {
    const primary = parseCssColor(getVar("--primary")) || parseCssColor("#06b6d4");
    const accent = parseCssColor(getVar("--accent")) || primary;
    const surface = parseCssColor(getVar("--surface")) || parseCssColor("#ffffff");

    const isDark = surface && surface.r < 40 && surface.g < 40 && surface.b < 60;

    const L = isDark ? 0.20 : 0.14;
    const R = isDark ? 0.18 : 0.12;
    const B = isDark ? 0.08 : 0.035;

    setAura({
      left: `radial-gradient(75% 95% at 0% 50%, ${rgba(primary, L)}, transparent 66%)`,
      right: `radial-gradient(75% 95% at 100% 50%, ${rgba(accent, R)}, transparent 64%)`,
      bottom: `linear-gradient(to top, rgba(2,6,23,${B}), transparent 55%)`,
      icon: `linear-gradient(135deg, ${rgba(primary, 1)}, ${rgba(accent, 1)})`,
      chipBg: isDark ? "rgba(231,238,252,0.10)" : "rgba(2,6,23,0.05)",
      tagBg: isDark ? "rgba(231,238,252,0.08)" : "rgba(2,6,23,0.04)",
      tagBorder: isDark ? "rgba(231,238,252,0.16)" : "rgba(15,23,42,0.12)",
      tagText: isDark ? "rgba(231,238,252,0.88)" : "rgba(2,6,23,0.72)",
    });
  }, []);

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

  // recompute aura on mount + whenever theme vars change
  useEffect(() => {
    recomputeAura();

    const root = document.documentElement;
    const obs = new MutationObserver(() => recomputeAura());
    obs.observe(root, { attributes: true, attributeFilter: ["style", "class"] });

    const onStorage = (e) => {
      if (e.key && String(e.key).includes("theme")) recomputeAura();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      obs.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, [recomputeAura]);

  const isEmpty = useMemo(() => !loading && items.length === 0, [loading, items]);

  if (isEmpty) {
    return (
      <div
        className="
          mt-8 rounded-2xl border p-4 backdrop-blur
          bg-[var(--surface)]/90 border-[var(--border)]
          shadow-[0_10px_25px_rgba(2,6,23,0.06)]
        "
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[var(--text)]">Recent Searches</h4>
        </div>
        <div className="mt-2 text-xs text-[var(--muted)]">No recent searches yet.</div>
      </div>
    );
  }

  return (
    <div
      className="
        relative mt-8 overflow-hidden rounded-2xl
        border p-4 backdrop-blur
        bg-[var(--surface)]/85 border-[var(--border)]
        shadow-[0_12px_30px_rgba(2,6,23,0.08)]
      "
    >
      {/* ✅ BOTH SIDES theme wash */}
      <div className="pointer-events-none absolute inset-0" style={{ background: aura.left }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: aura.right }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2" style={{ background: aura.bottom }} />

      {/* Header */}
      <div className="relative mb-3 flex items-center justify-between">
        <div className="flex items-start gap-2">
          <div
            className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl text-white"
            style={{
              backgroundImage: aura.icon,
              boxShadow: "0 8px 18px rgba(2,6,23,0.10)",
            }}
          >
            <Sparkles className="h-4 w-4" />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text)]">Recent Searches</h4>
            <div className="text-[11px] text-[var(--muted)]">Quick re-search in one click</div>
          </div>
        </div>

        <button
          onClick={() => {
            clearRecentSearches();
            setItems([]);
          }}
          className="
            inline-flex items-center gap-1.5 rounded-lg
            border px-2.5 py-1.5 text-xs backdrop-blur transition
            border-[var(--border)] bg-[var(--surface)]/70 text-[var(--muted)]
            hover:bg-[var(--surface2)] hover:text-[var(--text)]
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
              className="h-[78px] rounded-xl border animate-pulse"
              style={{
                borderColor: "var(--border)",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.65), rgba(255,255,255,0.35))",
              }}
            />
          ))}
        </div>
      ) : (
        <div className="relative grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {items.map((r, i) => {
            const primary = parseCssColor(getVar("--primary"));
            const accent = parseCssColor(getVar("--accent")) || primary;

            return (
              <button
                key={`${r.params}-${i}`}
                type="button"
                onClick={() => navigate(`/flight-results?${r.params}`)}
                className="
                  group relative w-full overflow-hidden text-left
                  rounded-xl border px-3 py-2 backdrop-blur transition cursor-pointer
                  bg-[var(--surface)]/75 border-[var(--border)]
                  hover:shadow-[0_16px_34px_rgba(2,6,23,0.12)]
                "
                title="Search again"
                style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.75) inset" }}
              >
                {/* hover wash: primary + accent */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                  style={{
                    background: `linear-gradient(135deg, ${rgba(primary, 0.10)}, ${rgba(
                      accent,
                      0.08
                    )} 45%, transparent 70%)`,
                  }}
                />

                {/* Top row */}
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {i === 0 && (
                      <span
                        className="inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[10px] font-semibold border"
                        style={{
                          background: rgba(accent, 0.10),
                          color: "var(--text)",
                          borderColor: rgba(accent, 0.18),
                        }}
                      >
                        <Star className="h-3.5 w-3.5" />
                        TOP
                      </span>
                    )}

                    <span
                      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border"
                      style={{
                        background: rgba(primary, 0.10),
                        color: "var(--text)",
                        borderColor: rgba(primary, 0.18),
                      }}
                    >
                      {(r.sector || "dom").toUpperCase()}
                    </span>
                  </div>

                  <span
                    className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border"
                    style={{
                      background: aura.chipBg,
                      color: "var(--text)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {r.trip === "roundtrip" ? "ROUND" : "ONEWAY"}
                  </span>
                </div>

                {/* Route */}
                <div className="relative mt-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text)]">{r.from}</span>

                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-white"
                    style={{
                      border: `1px solid ${rgba(primary, 0.22)}`,
                      backgroundImage: aura.icon,
                      boxShadow: "0 10px 22px rgba(2,6,23,0.10)",
                      transform: "translateZ(0)",
                    }}
                  >
                    <PlaneTakeoff className="h-4 w-4 -rotate-12 group-hover:translate-x-0.5 transition" />
                  </span>

                  <span className="text-sm font-semibold text-[var(--text)]">{r.to}</span>
                </div>

                {/* Date */}
                <div className="relative mt-1 text-[11px] font-medium text-[var(--muted)] truncate">
                  {r.dateLabel || "—"}
                </div>

                {/* bottom active line */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 opacity-0 group-hover:opacity-100 transition"
                  style={{
                    background: `linear-gradient(90deg, var(--primary), var(--accent))`,
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
