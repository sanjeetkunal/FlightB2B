// FromToBar.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AIRPORTS } from "../../data/airports";
import AirportSelect from "./AirportSelect";
import DateField from "./DateField";
import TravellersField from "./TravellersField";
import TravellerClassPicker from "./TravellerClassPicker";

import {
  BadgePercent,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Radar,
  UserPlus,
  RotateCcw,
  Armchair,
  Baby,
  Search as SearchIcon,
} from "lucide-react";

/* ---------------- RECENT SEARCH HELPERS ---------------- */
const RECENT_KEY = "flight_recent_searches";

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveRecentSearch = (item) => {
  const prev = getRecentSearches();
  const filtered = prev.filter(
    (x) =>
      !(
        x.from === item.from &&
        x.to === item.to &&
        x.dateLabel === item.dateLabel &&
        x.trip === item.trip
      )
  );
  const updated = [item, ...filtered].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
};

/* ---------------- DATE HELPERS ---------------- */
const parseYMD = (v) => {
  if (!v) return null;
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toYMD = (d) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDaysYMD = (ymd, n) => {
  const d = parseYMD(ymd);
  if (!d) return "";
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return toYMD(d);
};

const isBeforeOrSame = (aYmd, bYmd) => {
  const a = parseYMD(aYmd);
  const b = parseYMD(bYmd);
  if (!a || !b) return false;
  return a.getTime() <= b.getTime();
};

/* ---------------- PAX RULE HELPERS ---------------- */
const MAX_PAX = 9;

const normalizePax = (next) => {
  let adults = Math.max(1, Number(next.adults || 1));
  let children = Math.max(0, Number(next.children || 0));
  let infants = Math.max(0, Number(next.infants || 0));

  // Rule 1: infants <= adults
  if (infants > adults) infants = adults;

  // Rule 2: total pax <= 9
  let total = adults + children + infants;
  if (total > MAX_PAX) {
    let extra = total - MAX_PAX;

    // reduce in order: children → infants
    const reduceChildren = Math.min(children, extra);
    children -= reduceChildren;
    extra -= reduceChildren;

    if (extra > 0) {
      const reduceInfants = Math.min(infants, extra);
      infants -= reduceInfants;
    }
  }

  return {
    ...next,
    adults,
    children,
    infants,
  };
};

const paxErrorMessage = (tc) => {
  const total = tc.adults + tc.children + tc.infants;
  if (total > MAX_PAX) return `Maximum ${MAX_PAX} passengers allowed per booking.`;
  if (tc.infants > tc.adults) return "Number of infants cannot exceed adults.";
  return "";
};

/* ---------------- UI BITS ---------------- */
function Pill({ active, children, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
        "focus:outline-none focus:ring-2 focus:ring-emerald-200",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-[0_10px_22px_rgba(16,185,129,0.14)]"
          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/40",
      ].join(" ")}
    >
      {Icon ? (
        <span
          className={[
            "grid h-8 w-8 place-items-center rounded-lg border transition",
            active
              ? "border-emerald-200 bg-white"
              : "border-slate-200 bg-white group-hover:border-emerald-200",
          ].join(" ")}
        >
          <Icon
            className={
              active ? "h-4 w-4 text-emerald-700" : "h-4 w-4 text-slate-600"
            }
          />
        </span>
      ) : null}
      <span className="leading-tight">{children}</span>
    </button>
  );
}

function Chip({ active, children, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition",
        "focus:outline-none focus:ring-2 focus:ring-emerald-200",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/40",
      ].join(" ")}
      title={typeof children === "string" ? children : undefined}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}

function QuickBtn({ children, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex items-center gap-2
        rounded-xl border border-slate-200 bg-white
        px-3 py-2 text-xs font-extrabold text-slate-800
        hover:border-emerald-200 hover:bg-emerald-50/40
        transition
        focus:outline-none focus:ring-2 focus:ring-emerald-200
      "
    >
      {Icon ? <Icon className="h-4 w-4 text-emerald-700" /> : null}
      {children}
    </button>
  );
}

/* ---------- Mobile compact display chips ---------- */
function CompactBox({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full text-left
        rounded-2xl border border-slate-200 bg-white/90 backdrop-blur
        px-4 py-3
        shadow-[0_10px_22px_rgba(2,6,23,0.06)]
        hover:border-emerald-200 hover:bg-emerald-50/30
        transition
        focus:outline-none focus:ring-2 focus:ring-emerald-200
      "
    >
      <div className="text-[11px] font-extrabold text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-black text-slate-900 tracking-tight">
        {value}
      </div>
    </button>
  );
}

export default function FromToBar({ onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- STATES ---------------- */
  const [trip, setTrip] = useState("oneway"); // oneway | round
  const [sector, setSector] = useState("dom"); // dom | intl

  const [fromAP, setFromAP] = useState(
    AIRPORTS.find((a) => a.code === "DEL") || null
  );
  const [toAP, setToAP] = useState(
    AIRPORTS.find((a) => a.code === "BOM") || null
  );

  const [depart, setDepart] = useState("");
  const [ret, setRet] = useState("");

  const [tc, setTc] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    cabin: "Economy",
  });
  const [openTC, setOpenTC] = useState(false);

  const [specialFare, setSpecialFare] = useState(false);
  const [farePreset, setFarePreset] = useState("regular"); // regular | work | student | senior | defence
  const [errorMsg, setErrorMsg] = useState("");

  /* ---------------- DERIVED ---------------- */
  const total = tc.adults + tc.children + tc.infants;

  const travellersLabel = useMemo(
    () => `${total} Traveller${total > 1 ? "s" : ""}, ${tc.cabin}`,
    [total, tc.cabin]
  );

  // ✅ detect Modify Search (URL has query params)
  const isModifySearch = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    return [...qs.keys()].length > 0;
  }, [location.search]);

  const INDIA_IATAS = [
    "DEL",
    "BOM",
    "BLR",
    "MAA",
    "HYD",
    "CCU",
    "AMD",
    "COK",
    "GOI",
    "PNQ",
    "GAU",
    "TRV",
  ];

  const isInternational = useMemo(() => {
    if (!fromAP || !toAP) return false;
    return (
      !INDIA_IATAS.includes(fromAP.code) || !INDIA_IATAS.includes(toAP.code)
    );
  }, [fromAP, toAP]);

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

  // ✅ Return min date = (depart + 1 day) when round
  const returnMinDate = useMemo(() => {
    if (trip !== "round") return new Date();
    const d = parseYMD(depart);
    if (!d) return new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [trip, depart]);

  /* ---------------- EFFECTS ---------------- */
  // ✅ Hydrate from URL (Modify Search)
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    if (![...qs.keys()].length) return;

    const tripParam = qs.get("trip"); // oneway | roundtrip
    const isRound = tripParam === "roundtrip";
    setTrip(isRound ? "round" : "oneway");

    const from = qs.get("from");
    const to = qs.get("to");
    const fromObj = from ? AIRPORTS.find((a) => a.code === from) : null;
    const toObj = to ? AIRPORTS.find((a) => a.code === to) : null;
    if (fromObj) setFromAP(fromObj);
    if (toObj) setToAP(toObj);

    if (isRound) {
      setDepart(qs.get("depart") || "");
      setRet(qs.get("return") || "");
    } else {
      setDepart(qs.get("date") || "");
      setRet("");
    }

    const adt = Number(qs.get("adt") || "1");
    const chd = Number(qs.get("chd") || "0");
    const inf = Number(qs.get("inf") || "0");
    const cabin = qs.get("cabin") || "Economy";

    setTc((prev) => ({
      ...prev,
      adults: Number.isFinite(adt) ? adt : 1,
      children: Number.isFinite(chd) ? chd : 0,
      infants: Number.isFinite(inf) ? inf : 0,
      cabin,
    }));

    const sec = qs.get("sector"); // dom|intl
    if (sec === "dom" || sec === "intl") setSector(sec);

    const fare = qs.get("fare"); // "special"
    setSpecialFare(fare === "special");
  }, [location.search]);

  // ✅ Detect sector + auto special fare (intl + round)
  useEffect(() => {
    if (!fromAP || !toAP) return;

    if (isInternational) {
      setSector("intl");
      if (trip === "round") setSpecialFare(true);
    } else {
      setSector("dom");
      setSpecialFare(false);
    }
  }, [fromAP, toAP, trip, isInternational]);

  // ✅ If switch to oneway -> reset return + special fare
  useEffect(() => {
    if (trip !== "round") {
      setRet("");
      setSpecialFare(false);
    }
  }, [trip]);

  // ✅ Auto-set return = depart+1 if needed
  useEffect(() => {
    if (trip !== "round") return;
    if (!depart) return;

    const next = addDaysYMD(depart, 1);

    if (!ret) {
      setRet(next);
      return;
    }

    if (isBeforeOrSame(ret, depart)) {
      setRet(next);
    }
  }, [trip, depart, ret]);

  // ✅ Auto-hide toast
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(""), 2500);
    return () => clearTimeout(t);
  }, [errorMsg]);

  /* ---------------- ACTIONS ---------------- */
  const swap = () => {
    if (!fromAP || !toAP) return;
    setFromAP(toAP);
    setToAP(fromAP);
  };

  const validate = () => {
    if (!fromAP) return "Please select From airport";
    if (!toAP) return "Please select To airport";
    if (fromAP.code === toAP.code) return "From and To cannot be same";
    if (!depart) return "Please select Departure date";
    if (trip === "round" && !ret) return "Please select Return date";

    // Pax validation (final gate)
    const paxMsg = paxErrorMessage(tc);
    if (paxMsg) return paxMsg;

    return "";
  };

  const handleSearch = useCallback(() => {
    const msg = validate();
    if (msg) {
      setErrorMsg(msg);
      return;
    }

    const tripType = trip === "round" ? "roundtrip" : "oneway";

    const params = new URLSearchParams({
      trip: tripType,
      sector,
      from: fromAP.code,
      to: toAP.code,
      adt: String(tc.adults),
      chd: String(tc.children),
      inf: String(tc.infants),
      cabin: tc.cabin,
    });

    let dateLabel = "";
    if (tripType === "roundtrip") {
      params.set("depart", depart);
      params.set("return", ret);
      dateLabel = `${depart} → ${ret}`;
      if (sector === "intl" && specialFare) params.set("fare", "special");
    } else {
      params.set("date", depart);
      dateLabel = depart;
    }

    saveRecentSearch({
      from: fromAP.code,
      to: toAP.code,
      trip: tripType,
      sector,
      dateLabel,
      params: params.toString(),
      searchedAt: new Date().toISOString(),
    });

    onSearch?.({
      trip: tripType,
      from: fromAP,
      to: toAP,
      depart,
      ret,
      ...tc,
      sector,
      farePreset,
      specialFare:
        sector === "intl" && tripType === "roundtrip" ? specialFare : false,
    });

    navigate(`/flight-results?${params.toString()}`);
  }, [
    trip,
    sector,
    fromAP,
    toAP,
    tc,
    depart,
    ret,
    farePreset,
    specialFare,
    navigate,
    onSearch,
  ]);

  // ✅ Enter key = Search (helpful for agents)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter") handleSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSearch]);

  /* ---------------- QUICK AGENT CONTROLS ---------------- */
  const bump = (key, delta) => {
    setTc((prev) => {
      const next = {
        ...prev,
        [key]: (prev[key] || 0) + delta,
      };

      const fixed = normalizePax(next);

      if (fixed.infants !== next.infants) {
        setErrorMsg("Infants cannot be more than Adults.");
      } else if (
        fixed.adults + fixed.children + fixed.infants === MAX_PAX &&
        next.adults + next.children + next.infants > MAX_PAX
      ) {
        setErrorMsg(`Maximum ${MAX_PAX} passengers allowed.`);
      }

      return fixed;
    });
  };

  const resetPax = () => {
    setTc((prev) => ({
      ...prev,
      adults: 1,
      children: 0,
      infants: 0,
    }));
  };

  const setCabin = (c) => setTc((prev) => ({ ...prev, cabin: c }));

  /* ---------------- RENDER ---------------- */
  return (
    <div className="relative">
      {errorMsg && (
        <div className="absolute right-0 top-0 z-50">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow">
            {errorMsg}
          </div>
        </div>
      )}

      {/* Top controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {["oneway", "round"].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTrip(k)}
              className={[
                "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                trip === k
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              {k === "oneway" ? "One Way" : "Round Trip"}
            </button>
          ))}
        </div>

        {trip === "round" && sector === "intl" && (
          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <input
              type="checkbox"
              checked={specialFare}
              onChange={(e) => setSpecialFare(e.target.checked)}
              className="h-4 w-4 accent-emerald-600"
            />
            Special Round Trip Fare
          </label>
        )}

        {/* Quick cabin chips (Agents love this) */}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="hidden sm:inline text-[11px] font-extrabold text-slate-500">
            Cabin:
          </span>
          <Chip
            active={tc.cabin === "Economy"}
            onClick={() => setCabin("Economy")}
            icon={Armchair}
          >
            Economy
          </Chip>
          <Chip
            active={tc.cabin === "Premium Economy"}
            onClick={() => setCabin("Premium Economy")}
          >
            Premium
          </Chip>
          <Chip
            active={tc.cabin === "Business"}
            onClick={() => setCabin("Business")}
          >
            Business
          </Chip>
          <Chip active={tc.cabin === "First"} onClick={() => setCabin("First")}>
            First
          </Chip>
        </div>
      </div>

      {/* Main area */}
      <div className={["mt-3 relative", !isModifySearch ? "pb-14" : ""].join(" ")}>
        {/* =========================
            MOBILE COMPACT LAYOUT
            - From+To in one row showing only "DEL → BOM"
            - Dates in next row together
            - Hide full AirportSelect & DateField on mobile
           ========================= */}
        <div className="md:hidden space-y-3">
          {/* Row 1: FROM-TO compact (only codes) */}
          <div className="grid grid-cols-[1fr_44px_1fr] gap-2 items-stretch">
            <CompactBox
              label="From"
              value={fromAP?.code || "—"}
              onClick={() => {}}
            />
            <button
              type="button"
              onClick={swap}
              title="Swap"
              className="
                h-full rounded-2xl
                border border-slate-200 bg-white/90
                shadow-[0_10px_22px_rgba(2,6,23,0.06)]
                grid place-items-center
                hover:border-emerald-200 hover:bg-emerald-50/30
                transition
                focus:outline-none focus:ring-2 focus:ring-emerald-200
              "
            >
              ⇄
            </button>
            <CompactBox
              label="To"
              value={toAP?.code || "—"}
              onClick={() => {}}
            />
          </div>

          {/* Actually keep selectors available but compact (optional):
              Tap on the compact boxes opens the original selectors below (accordion style) */}
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-2">
            <div className="grid grid-cols-2 gap-2">
              <AirportSelect label="From" value={fromAP} onChange={setFromAP} />
              <AirportSelect label="To" value={toAP} onChange={setToAP} />
            </div>
          </div>

          {/* Row 2: Dates together */}
          <div className="grid grid-cols-2 gap-2">
            <DateField
              label="Departure"
              value={depart}
              onChange={setDepart}
              offsetDays={0}
              minDate={new Date()}
            />
            <DateField
              label="Return"
              value={ret}
              onChange={setRet}
              disabled={trip !== "round"}
              minDate={returnMinDate}
              offsetDays={1}
            />
          </div>

          {/* Row 3: Travellers */}
          <div className="relative">
            <TravellersField
              label="Travellers & Class"
              text={travellersLabel}
              onClick={() => setOpenTC((v) => !v)}
            />
            <TravellerClassPicker
              open={openTC}
              value={tc}
              onChange={(next) => {
                const fixed = normalizePax(next);

                if (next.infants > next.adults) {
                  setErrorMsg("Infants cannot be more than Adults.");
                } else if (next.adults + next.children + next.infants > MAX_PAX) {
                  setErrorMsg(`Maximum ${MAX_PAX} passengers allowed.`);
                }

                setTc(fixed);
              }}
              onClose={() => setOpenTC(false)}
            />
          </div>

          {/* Mobile search button */}
          <button
            type="button"
            onClick={handleSearch}
            className="
              w-full h-11 rounded-2xl
              bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600
              text-white text-sm font-extrabold
              shadow-[0_14px_26px_rgba(16,185,129,0.24)]
              hover:brightness-95 active:scale-[0.99]
              transition
              focus:outline-none focus:ring-4 focus:ring-emerald-200/70
              inline-flex items-center justify-center gap-2
            "
          >
            <SearchIcon className="h-4 w-4" />
            SEARCH
          </button>

          {/* keep home extras on mobile too */}
          {!isModifySearch && (
            <>
              {/* Quick PAX controls */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold text-slate-500">
                  Quick PAX:
                </span>
                <QuickBtn onClick={() => bump("adults", 1)} icon={UserPlus}>
                  +1 Adult
                </QuickBtn>
                <QuickBtn onClick={() => bump("children", 1)} icon={Baby}>
                  +1 Child
                </QuickBtn>
                <QuickBtn onClick={() => bump("infants", 1)} icon={Baby}>
                  +1 Infant
                </QuickBtn>
                <QuickBtn onClick={resetPax} icon={RotateCcw}>
                  Reset
                </QuickBtn>
              </div>

              {/* Fare preferences strip */}
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white/85 backdrop-blur px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 text-white shadow-sm">
                    <BadgePercent className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900">
                      Fare Preferences
                    </div>
                    <div className="text-[11px] font-medium text-slate-500">
                      {presetHint}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill
                    active={farePreset === "regular"}
                    onClick={() => setFarePreset("regular")}
                    icon={BadgePercent}
                  >
                    Regular
                  </Pill>
                  <Pill
                    active={farePreset === "work"}
                    onClick={() => setFarePreset("work")}
                    icon={Briefcase}
                  >
                    Work Travel
                  </Pill>
                  <Pill
                    active={farePreset === "student"}
                    onClick={() => setFarePreset("student")}
                    icon={GraduationCap}
                  >
                    Student
                  </Pill>
                  <Pill
                    active={farePreset === "senior"}
                    onClick={() => setFarePreset("senior")}
                    icon={ShieldCheck}
                  >
                    Senior
                  </Pill>
                  <Pill
                    active={farePreset === "defence"}
                    onClick={() => setFarePreset("defence")}
                    icon={ShieldCheck}
                  >
                    Defence
                  </Pill>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    className="
                      inline-flex items-center gap-2
                      rounded-xl border border-slate-200
                      bg-white px-4 py-2
                      text-sm font-extrabold text-slate-800
                      hover:border-emerald-200 hover:bg-emerald-50/40
                      transition
                      focus:outline-none focus:ring-2 focus:ring-emerald-200
                    "
                    title="Track flights & schedules"
                  >
                    <Radar className="h-4 w-4 text-emerald-700" />
                    Flight Tracker
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* =========================
            DESKTOP / TABLET (your original layout)
           ========================= */}
        <div
          className={[
            "hidden md:grid grid-cols-1 gap-3 items-stretch",
            isModifySearch
              ? "md:grid-cols-[4.6fr_1.25fr_1.25fr_1.7fr_56px]"
              : "md:grid-cols-[4.6fr_1.25fr_1.25fr_1.7fr]",
          ].join(" ")}
        >
          {/* From + To group */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3">
            <AirportSelect label="From" value={fromAP} onChange={setFromAP} />
            <AirportSelect label="To" value={toAP} onChange={setToAP} />

            {/* Overlay swap (no gap) */}
            <button
              type="button"
              onClick={swap}
              title="Swap"
              className="
                absolute left-1/2 top-1/2
                -translate-x-1/2 -translate-y-1/2
                h-9 w-9 rounded-full
                border border-slate-200 bg-white
                shadow-sm hover:shadow-md transition
                hidden md:grid place-items-center
                z-10
              "
            >
              ⇄
            </button>
          </div>

          <DateField
            label="Departure"
            value={depart}
            onChange={setDepart}
            offsetDays={0}
            minDate={new Date()}
          />

          <DateField
            label="Return"
            value={ret}
            onChange={setRet}
            disabled={trip !== "round"}
            minDate={returnMinDate}
            offsetDays={1}
          />

          <div className="relative min-w-0">
            <TravellersField
              label="Travellers & Class"
              text={travellersLabel}
              onClick={() => setOpenTC((v) => !v)}
            />
            <TravellerClassPicker
              open={openTC}
              value={tc}
              onChange={(next) => {
                const fixed = normalizePax(next);

                if (next.infants > next.adults) {
                  setErrorMsg("Infants cannot be more than Adults.");
                } else if (next.adults + next.children + next.infants > MAX_PAX) {
                  setErrorMsg(`Maximum ${MAX_PAX} passengers allowed.`);
                }

                setTc(fixed);
              }}
              onClose={() => setOpenTC(false)}
            />
          </div>

          {/* Modify Search: keep existing icon button */}
          {isModifySearch && (
            <button
              type="button"
              onClick={handleSearch}
              className="
                h-[56px] w-[56px] rounded-2xl
                bg-gradient-to-br from-emerald-600 via-cyan-600 to-teal-600
                text-white
                shadow-[0_10px_20px_rgba(16,185,129,0.25)]
                hover:brightness-95
                transition
                grid place-items-center cursor-pointer
              "
              aria-label="Search"
              title="Search"
            >
              <SearchIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Home only: half-outside button (desktop only) */}
        {!isModifySearch && (
          <div className="hidden md:block">
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold text-slate-500">
                Quick PAX:
              </span>
              <QuickBtn onClick={() => bump("adults", 1)} icon={UserPlus}>
                +1 Adult
              </QuickBtn>
              <QuickBtn onClick={() => bump("children", 1)} icon={Baby}>
                +1 Child
              </QuickBtn>
              <QuickBtn onClick={() => bump("infants", 1)} icon={Baby}>
                +1 Infant
              </QuickBtn>
              <QuickBtn onClick={resetPax} icon={RotateCcw}>
                Reset
              </QuickBtn>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/85 backdrop-blur px-4 py-3">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 text-white shadow-sm">
                      <BadgePercent className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-slate-900">
                        Fare Preferences
                      </div>
                      <div className="text-[11px] font-medium text-slate-500">
                        {presetHint}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill
                      active={farePreset === "regular"}
                      onClick={() => setFarePreset("regular")}
                      icon={BadgePercent}
                    >
                      Regular
                    </Pill>
                    <Pill
                      active={farePreset === "work"}
                      onClick={() => setFarePreset("work")}
                      icon={Briefcase}
                    >
                      Work Travel
                    </Pill>
                    <Pill
                      active={farePreset === "student"}
                      onClick={() => setFarePreset("student")}
                      icon={GraduationCap}
                    >
                      Student
                    </Pill>
                    <Pill
                      active={farePreset === "senior"}
                      onClick={() => setFarePreset("senior")}
                      icon={ShieldCheck}
                    >
                      Senior
                    </Pill>
                    <Pill
                      active={farePreset === "defence"}
                      onClick={() => setFarePreset("defence")}
                      icon={ShieldCheck}
                    >
                      Defence
                    </Pill>
                  </div>
                </div>

                <div className="flex justify-start lg:justify-end">
                  <button
                    type="button"
                    className="
                      inline-flex items-center gap-2
                      rounded-xl border border-slate-200
                      bg-white px-4 py-2
                      text-sm font-extrabold text-slate-800
                      hover:border-emerald-200 hover:bg-emerald-50/40
                      transition
                      focus:outline-none focus:ring-2 focus:ring-emerald-200
                    "
                    title="Track flights & schedules"
                  >
                    <Radar className="h-4 w-4 text-emerald-700" />
                    Flight Tracker
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[98%] z-20">
              <button
                type="button"
                onClick={handleSearch}
                className="
                  group relative
                  h-9 sm:h-10
                  min-w-[160px] sm:min-w-[210px]
                  rounded-full
                  bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600
                  text-white
                  text-sm
                  font-extrabold tracking-wide
                  shadow-[0_14px_26px_rgba(16,185,129,0.24)]
                  hover:brightness-95
                  active:scale-[0.98]
                  transition
                  focus:outline-none focus:ring-4 focus:ring-emerald-200/70
                "
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  <SearchIcon className="h-4 w-4" />
                  SEARCH
                </span>
                <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 bg-white/10 group-hover:opacity-100 transition" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
