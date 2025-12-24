// HomeHero.jsx
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import FromToBar from "./flightsearch/FromToBar";
import RecentSearches from "./flightsearch/RecentSearches";
import QuickActions from "../pages/FlightBooking/quickaction/QuickActions";
import RecentBookings from "../pages/FlightBooking/quickaction/RecentBookings";

import heroBg from "../assets/media/hero-bg.jpg"; // ✅ your background image
import { BadgePercent, Briefcase, GraduationCap, ShieldCheck, Radar } from "lucide-react";

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
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/10" />

        {/* Soft glows */}
        <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-blue-400/18 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-10 h-72 w-72 rounded-full bg-cyan-300/12 blur-3xl" />

        {/* ✅ space from top */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-10 pb-10">
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
            <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-br from-blue-50/90 via-white to-cyan-50/80 opacity-95" />

            <div className="relative p-4 sm:p-5">
              <FromToBar onSearch={onSearch} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ================= BELOW CONTENT ================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10">
        <RecentSearches />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActions disabledKeys={["book_hold"]} />
          <RecentBookings />
        </div>
      </div>
    </section>
  );
}
