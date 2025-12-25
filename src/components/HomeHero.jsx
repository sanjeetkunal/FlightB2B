// HomeHero.jsx
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import FromToBar from "./flightsearch/FromToBar";
import RecentSearches from "./flightsearch/RecentSearches";
import QuickActions from "../pages/FlightBooking/quickaction/QuickActions";
import RecentBookings from "../pages/FlightBooking/quickaction/RecentBookings";

import heroBg from "../assets/media/hero-bg.jpg"; // ✅ your background image
import { BadgePercent, Briefcase, GraduationCap, ShieldCheck, Radar } from "lucide-react";
import { AgentAlerts } from "../pages/FlightBooking/quickaction/AgentAlerts";

/* ---------- UI bits ---------- */
function Pill({ active, children, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
        "focus:outline-none focus:ring-2 focus:ring-blue-200",
        active
          ? "border-blue-200 bg-blue-50 text-blue-700 shadow-[0_10px_22px_rgba(37,99,235,0.14)]"
          : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/40",
      ].join(" ")}
    >
      {Icon ? (
        <span
          className={[
            "grid h-8 w-8 place-items-center rounded-lg border transition",
            active
              ? "border-blue-200 bg-white"
              : "border-slate-200 bg-white group-hover:border-blue-200",
          ].join(" ")}
        >
          <Icon className={active ? "h-4 w-4 text-blue-700" : "h-4 w-4 text-slate-600"} />
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

  const [farePreset, setFarePreset] = useState("regular"); // regular | work | student | senior | defence

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
      {/* ================= HERO (photo background only) ================= */}
      <div className="relative">
        {/* Background photo */}
        <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${heroBg})` }} />

        {/* Dark overlay gradient (MMT-ish) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/80" />

        {/* Soft glows */}
        <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-blue-400/18 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-10 h-72 w-72 rounded-full bg-cyan-300/12 blur-3xl" />

        {/* ✅ space from top */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-10 pb-[calc(120px+env(safe-area-inset-bottom))]">
          {/* ===== Search Card (top spacing added) ===== */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="
              relative mx-auto
              rounded-[22px]
              border border-white/30
              bg-white/95 backdrop-blur
              shadow-[0_26px_60px_rgba(2,6,23,0.22)]
            "
          >
            {/* subtle inner gradient */}
            <div className="pointer-events-none absolute inset-0 rounded-[22px] 
  bg-gradient-to-br from-blue-50/90 via-white to-cyan-50/80 opacity-95"
            />

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/2 rounded-b-[22px]
  bg-gradient-to-t from-blue-300/30 via-blue-200/10 to-transparent"
            />


            <div className="relative p-4 sm:p-5">
              <FromToBar onSearch={onSearch} />
            </div>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex flex-col items-center gap-2">
          {/* little fade at bottom */}
          {/* <div className="h-10 w-full bg-gradient-to-t from-slate-950/35 to-transparent" /> */}
          <div className="flex flex-col items-center">
            <div className="text-[11px] font-extrabold tracking-wide text-white/80">
              Scroll to explore
            </div>
            <div className="mt-1 grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur animate-bounce">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white">
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BELOW CONTENT ================= */}
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
