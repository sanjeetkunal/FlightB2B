// HomeHero.jsx
import { motion } from "framer-motion";
import { useEffect, useMemo, useState, useCallback } from "react";

import FromToBar from "./flightsearch/FromToBar";
import RecentSearches from "./flightsearch/RecentSearches";
import QuickActions from "../pages/FlightBooking/quickaction/QuickActions";
import RecentBookings from "../pages/FlightBooking/quickaction/RecentBookings";
import { AgentAlerts } from "../pages/FlightBooking/quickaction/AgentAlerts";

import heroBg from "../assets/media/hero-bg.jpg";

/* ---------- helpers (theme vars -> rgba) ---------- */
function clampHex(hex) {
  if (!hex) return null;
  let h = String(hex).trim();
  if (!h) return null;
  if (!h.startsWith("#")) h = `#${h}`;
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h)) return null;
  if (h.length === 4) {
    const r = h[1], g = h[2], b = h[3];
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
  const c = rgb || { r: 0, g: 0, b: 0 };
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
}

function getVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ---------- UI bits ---------- */
function Pill({ active, children, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
        "focus:outline-none focus:ring-2",
        active ? "shadow-[0_10px_22px_rgba(2,6,23,0.10)]" : "hover:bg-[var(--surface2)]",
      ].join(" ")}
      style={{
        borderColor: active ? "var(--primary)" : "var(--border)",
        background: active ? "var(--primarySoft)" : "var(--surface)",
        color: "var(--text)",
        // ring theme-based (inline)
        boxShadow: active ? "0 10px 22px rgba(2,6,23,0.10)" : undefined,
      }}
    >
      {Icon ? (
        <span
          className="grid h-8 w-8 place-items-center rounded-lg border transition"
          style={{
            borderColor: active ? "var(--primary)" : "var(--border)",
            background: "var(--surface)",
          }}
        >
          <Icon className="h-4 w-4" style={{ color: active ? "var(--primary)" : "var(--muted)" }} />
        </span>
      ) : null}
      <span className="leading-tight">{children}</span>
    </button>
  );
}

export default function HomeHero() {
  const onSearch = (payload) => {
    console.log("SEARCH →", payload);
  };

  const [farePreset, setFarePreset] = useState("regular");
  const [heroCss, setHeroCss] = useState({
    overlay: "linear-gradient(to bottom, rgba(2,6,23,0.72), rgba(2,6,23,0.45), rgba(2,6,23,0.80))",
    glow1: "rgba(16,182,217,0.18)",
    glow2: "rgba(16,182,217,0.12)",
    cardBg: "rgba(255,255,255,0.92)",
    cardBorder: "rgba(255,255,255,0.22)",
    cardInner: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.98) 40%, rgba(16,182,217,0.14) 100%)",
    cardBottom: "linear-gradient(to top, rgba(16,182,217,0.22), rgba(16,182,217,0.10), transparent)",
  });

  const recompute = useCallback(() => {
    const surface = parseCssColor(getVar("--surface")) || parseCssColor("#ffffff");
    const text = parseCssColor(getVar("--text")) || parseCssColor("#0b1220");
    const primary = parseCssColor(getVar("--primary")) || parseCssColor("#10b6d9");
    const primarySoftVar = getVar("--primarySoft");
    const primarySoftRgb = parseCssColor(primarySoftVar) || primary;

    const isDark =
      surface && surface.r < 40 && surface.g < 40 && surface.b < 60;

    // overlay strength based on theme
    const o1 = isDark ? 0.78 : 0.70;
    const o2 = isDark ? 0.52 : 0.45;
    const o3 = isDark ? 0.86 : 0.80;

    // card bg based on surface
    const cardBg = rgba(surface, isDark ? 0.86 : 0.92);
    const cardBorder = isDark ? rgba(text, 0.14) : "rgba(255,255,255,0.22)";

    setHeroCss({
      overlay: `linear-gradient(to bottom, rgba(2,6,23,${o1}), rgba(2,6,23,${o2}), rgba(2,6,23,${o3}))`,
      glow1: rgba(primarySoftRgb, isDark ? 0.32 : 0.22),
      glow2: rgba(primarySoftRgb, isDark ? 0.22 : 0.14),
      cardBg,
      cardBorder,
      cardInner: `linear-gradient(
        135deg,
        ${rgba(surface, isDark ? 0.88 : 0.92)} 0%,
        ${rgba(surface, isDark ? 0.94 : 0.98)} 40%,
        ${rgba(primary, isDark ? 0.22 : 0.14)} 100%
      )`,
      cardBottom: `linear-gradient(
        to top,
        ${rgba(primary, isDark ? 0.26 : 0.22)} 0%,
        ${rgba(primary, isDark ? 0.14 : 0.10)} 40%,
        transparent 100%
      )`,
    });
  }, []);

  useEffect(() => {
    recompute();
    const root = document.documentElement;
    const obs = new MutationObserver(() => recompute());
    obs.observe(root, { attributes: true, attributeFilter: ["style", "class"] });

    const onStorage = (e) => {
      if (e.key && String(e.key).includes("theme")) recompute();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      obs.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, [recompute]);

  const presetHint = useMemo(() => {
    switch (farePreset) {
      case "work":
        return "Corporate-friendly preference • GST invoice ready";
      case "student":
        return "Student benefits • extra baggage (airline rules)";
      case "senior":
        return "Senior citizen fares (as per eligibility)";
      case "defence":
        return "Defence fares (availability based)";
      default:
        return "Best available published fares";
    }
  }, [farePreset]);

  const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  return (
    <section className="relative overflow-hidden">
      <div className="relative">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${heroBg})` }}
        />

        {/* ✅ Theme-driven overlay (no slate hardcode) */}
        <div className="absolute inset-0" style={{ backgroundImage: heroCss.overlay }} />

        {/* ✅ Theme-driven glows */}
        <div
          className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full blur-3xl"
          style={{ background: heroCss.glow1 }}
        />
        <div
          className="pointer-events-none absolute top-10 right-10 h-72 w-72 rounded-full blur-3xl"
          style={{ background: heroCss.glow2 }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-10 pb-[calc(120px+env(safe-area-inset-bottom))]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="relative mx-auto rounded-[22px] backdrop-blur"
            style={{
              border: `1px solid ${heroCss.cardBorder}`,
              background: heroCss.cardBg,
              boxShadow: "0 26px 60px rgba(2,6,23,0.22)",
            }}
          >
            {/* inner gradient */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[22px]"
              style={{ backgroundImage: heroCss.cardInner, opacity: 0.95 }}
            />

            {/* bottom wash */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/2 rounded-b-[22px]"
              style={{ backgroundImage: heroCss.cardBottom, opacity: 0.9 }}
            />

            <div className="relative p-4 sm:p-5">
              <FromToBar onSearch={onSearch} />
            </div>
          </motion.div>
        </div>

        {/* Scroll hint (white ok - photo area) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex flex-col items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="text-[11px] font-extrabold tracking-wide text-white/80">
              Scroll to explore
            </div>
            <div className="mt-1 grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur animate-bounce">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white">
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* BELOW CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10">
        <RecentSearches />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActions disabledKeys={["book_hold"]} />
          <RecentBookings />
          <AgentAlerts />
        </div>
      </div>
    </section>
  );
}
