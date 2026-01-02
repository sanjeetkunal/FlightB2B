// src/components/flightsearch/FromToBar.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AIRPORTS } from "../../../data/airports";
import AirportSelect from "./AirportSelect";
import DateField from "./DateField";
import TravellersField from "./TravellersField";
import TravellerClassPicker from "./TravellerClassPicker";
import searchbg from "../../../assets/media/search.jpg";

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
  ArrowRight,
  X,
  CalendarDays,
  Users,
  PlaneTakeoff,
  PlaneLanding,
  ChevronRight,
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

  if (infants > adults) infants = adults;

  let total = adults + children + infants;
  if (total > MAX_PAX) {
    let extra = total - MAX_PAX;

    const reduceChildren = Math.min(children, extra);
    children -= reduceChildren;
    extra -= reduceChildren;

    if (extra > 0) {
      const reduceInfants = Math.min(infants, extra);
      infants -= reduceInfants;
    }
  }

  return { ...next, adults, children, infants };
};

const paxErrorMessage = (tc) => {
  const total = tc.adults + tc.children + tc.infants;
  if (total > MAX_PAX) return `Maximum ${MAX_PAX} passengers allowed per booking.`;
  if (tc.infants > tc.adults) return "Number of infants cannot exceed adults.";
  return "";
};

/* ---------------- THEME (NO STATIC COLORS) ---------------- */
const focusRing =
  "focus:outline-none focus:ring-2 focus:ring-[color:var(--primarySoft)]";

const shadowSoft = "0 18px 40px color-mix(in srgb, var(--text) 12%, transparent)";
const shadowHard = "0 26px 60px color-mix(in srgb, var(--text) 18%, transparent)";
const shadowSheet = "0 -18px 60px color-mix(in srgb, var(--text) 18%, transparent)";

const gradientStyle = {
  backgroundImage:
    "linear-gradient(90deg, var(--primary), var(--primaryHover), var(--success))",
};

const gradientSoftFrameStyle = {
  backgroundImage:
    "linear-gradient(135deg, color-mix(in srgb, var(--primary) 22%, transparent), color-mix(in srgb, var(--success) 22%, transparent), color-mix(in srgb, var(--accent) 22%, transparent))",
};

const overlayStyle = {
  background: "color-mix(in srgb, var(--text) 35%, transparent)",
};

/* ---------------- UI BITS ---------------- */
function Pill({ active, children, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition",
        focusRing,
        active
          ? "border-[var(--primary)] bg-[var(--primarySoft)] text-[var(--text)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]",
      ].join(" ")}
    >
      {Icon ? (
        <span
          className={[
            "grid h-8 w-8 place-items-center rounded-md border transition",
            active
              ? "border-[var(--primary)] bg-[var(--surface)]"
              : "border-[var(--border)] bg-[var(--surface)] group-hover:border-[var(--primary)]",
          ].join(" ")}
        >
          <Icon
            className="h-4 w-4"
            style={{ color: active ? "var(--primary)" : "var(--muted)" }}
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
        focusRing,
        active
          ? "border-[var(--primary)] bg-[var(--primarySoft)] text-[var(--text)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]",
      ].join(" ")}
      title={typeof children === "string" ? children : undefined}
    >
      {Icon ? (
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
      ) : null}
      {children}
    </button>
  );
}

function QuickBtn({ children, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-extrabold transition",
        "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]",
        focusRing,
      ].join(" ")}
    >
      {Icon ? <Icon className="h-4 w-4" style={{ color: "var(--primary)" }} /> : null}
      {children}
    </button>
  );
}

/* ---------------- MOBILE SHEET ---------------- */
function MobileSheet({ open, title, subtitle, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[80]">
      {/* backdrop (no bg-black) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute inset-0"
        style={overlayStyle}
      />

      {/* sheet */}
      <div
        className="
          absolute inset-x-0 bottom-0
          rounded-t-[26px]
          border border-[var(--border)]
          bg-[var(--surface)]
          overflow-hidden
        "
        style={{ boxShadow: shadowSheet }}
      >
        <div className="px-4 pt-4 pb-3 border-b border-[var(--border)] bg-[var(--surface2)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-black text-[var(--text)]">{title}</div>
              {subtitle ? (
                <div className="mt-0.5 text-[11px] font-semibold text-[var(--muted)]">
                  {subtitle}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className={[
                "grid h-10 w-10 place-items-center rounded-md border transition",
                "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]",
                focusRing,
              ].join(" ")}
              aria-label="Close sheet"
              title="Close"
            >
              <X className="h-5 w-5" style={{ color: "var(--text)" }} />
            </button>
          </div>

          <div className="mt-3 flex justify-center">
            <div className="h-1.5 w-12 rounded-full" style={{ background: "var(--border)" }} />
          </div>
        </div>

        <div className="max-h-[72vh] overflow-auto px-4 py-4">{children}</div>
      </div>
    </div>
  );
}

function MobileSummaryCard({
  fromAP,
  toAP,
  trip,
  depart,
  ret,
  travellersLabel,
  onOpenRoute,
  onOpenDates,
  onOpenTravellers,
  onSwap,
}) {
  const fromLine = fromAP ? `${fromAP.code}` : "—";
  const toLine = toAP ? `${toAP.code}` : "—";
  const fromCity = fromAP?.city || fromAP?.name || "";
  const toCity = toAP?.city || toAP?.name || "";

  const dateLine =
    trip === "round"
      ? depart && ret
        ? `${depart} → ${ret}`
        : depart
          ? `${depart} → Select return`
          : "Select dates"
      : depart
        ? depart
        : "Select date";

  return (
    <div
      className="
        md:hidden relative
        rounded-md
        border border-[var(--border)]
        bg-[var(--surface)]
        overflow-hidden
      "
      style={{ boxShadow: shadowSoft }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70" style={gradientSoftFrameStyle} />

      <div className="relative">
        {/* Row: From/To */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onOpenRoute}
              className={[
                "flex-1 text-left rounded-md border px-3 py-3 transition",
                "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]",
                focusRing,
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold text-[var(--muted)] flex items-center gap-1">
                    <PlaneTakeoff className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                    From
                  </div>
                  <div className="mt-0.5 text-xl font-black tracking-tight text-[var(--text)]">
                    {fromLine}
                  </div>
                  {fromCity ? (
                    <div className="mt-0.5 text-[11px] font-semibold text-[var(--muted)] truncate">
                      {fromCity}
                    </div>
                  ) : null}
                </div>
                <ChevronRight className="h-5 w-5" style={{ color: "var(--muted)" }} />
              </div>
            </button>

            <button
              type="button"
              onClick={onSwap}
              title="Swap"
              className={[
                "grid h-[64px] w-[52px] place-items-center rounded-md border transition",
                "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]",
                focusRing,
              ].join(" ")}
              style={{ color: "var(--text)" }}
            >
              ⇄
            </button>

            <button
              type="button"
              onClick={onOpenRoute}
              className={[
                "flex-1 text-left rounded-md border px-3 py-3 transition",
                "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]",
                focusRing,
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold text-[var(--muted)] flex items-center gap-1">
                    <PlaneLanding className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                    To
                  </div>
                  <div className="mt-0.5 text-xl font-black tracking-tight text-[var(--text)]">
                    {toLine}
                  </div>
                  {toCity ? (
                    <div className="mt-0.5 text-[11px] font-semibold text-[var(--muted)] truncate">
                      {toCity}
                    </div>
                  ) : null}
                </div>
                <ChevronRight className="h-5 w-5" style={{ color: "var(--muted)" }} />
              </div>
            </button>
          </div>
        </div>

        {/* Row: Dates + Travellers */}
        <div className="px-4 pb-4 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenDates}
              className={[
                "rounded-md border px-3 py-3 text-left transition",
                "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]",
                focusRing,
              ].join(" ")}
            >
              <div className="text-[11px] font-extrabold text-[var(--muted)] flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                Dates
              </div>
              <div className="mt-0.5 text-sm font-black text-[var(--text)]">{dateLine}</div>
            </button>

            <button
              type="button"
              onClick={onOpenTravellers}
              className={[
                "rounded-md border px-3 py-3 text-left transition",
                "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]",
                focusRing,
              ].join(" ")}
            >
              <div className="text-[11px] font-extrabold text-[var(--muted)] flex items-center gap-1">
                <Users className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                Travellers
              </div>
              <div className="mt-0.5 text-sm font-black text-[var(--text)] line-clamp-1">
                {travellersLabel}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FromToBar({ onSearch }) {
  const [openReturnOnce, setOpenReturnOnce] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [trip, setTrip] = useState("oneway"); // oneway | round
  const [sector, setSector] = useState("dom"); // dom | intl

  const [fromAP, setFromAP] = useState(AIRPORTS.find((a) => a.code === "DEL") || null);
  const [toAP, setToAP] = useState(AIRPORTS.find((a) => a.code === "BOM") || null);

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
  const [farePreset, setFarePreset] = useState("regular");
  const [errorMsg, setErrorMsg] = useState("");

  const [mobileSheet, setMobileSheet] = useState(null);

  const openTCDeferred = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (openTC) {
      setOpenTC(false);
      return;
    }
    setTimeout(() => setOpenTC(true), 0);
  };

  const total = tc.adults + tc.children + tc.infants;

  const travellersLabel = useMemo(
    () => `${total} Traveller${total > 1 ? "s" : ""}, ${tc.cabin}`,
    [total, tc.cabin]
  );

  const isModifySearch = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    return [...qs.keys()].length > 0;
  }, [location.search]);

  const INDIA_IATAS = [
    "DEL", "BOM", "BLR", "MAA", "HYD", "CCU", "AMD", "COK", "GOI", "PNQ", "GAU", "TRV",
  ];

  const isInternational = useMemo(() => {
    if (!fromAP || !toAP) return false;
    return (!INDIA_IATAS.includes(fromAP.code) || !INDIA_IATAS.includes(toAP.code));
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

  const returnMinDate = useMemo(() => {
    if (trip !== "round") return new Date();
    const d = parseYMD(depart);
    if (!d) return new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [trip, depart]);

  // hydrate from URL
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    if (![...qs.keys()].length) return;

    const tripParam = qs.get("trip");
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

    const sec = qs.get("sector");
    if (sec === "dom" || sec === "intl") setSector(sec);

    const fare = qs.get("fare");
    setSpecialFare(fare === "special");
  }, [location.search]);

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

  useEffect(() => {
    if (trip !== "round") {
      setRet("");
      setSpecialFare(false);
    }
  }, [trip]);

  useEffect(() => {
    if (trip !== "round") return;
    if (!depart) return;

    const next = addDaysYMD(depart, 1);
    if (!ret) {
      setRet(next);
      return;
    }
    if (isBeforeOrSame(ret, depart)) setRet(next);
  }, [trip, depart, ret]);

  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(""), 2500);
    return () => clearTimeout(t);
  }, [errorMsg]);

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
      specialFare: sector === "intl" && tripType === "roundtrip" ? specialFare : false,
    });

    navigate(`/flight-results?${params.toString()}`);
  }, [trip, sector, fromAP, toAP, tc, depart, ret, farePreset, specialFare, navigate, onSearch]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter") handleSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSearch]);

  const bump = (key, delta) => {
    setTc((prev) => {
      const next = { ...prev, [key]: (prev[key] || 0) + delta };
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
    setTc((prev) => ({ ...prev, adults: 1, children: 0, infants: 0 }));
  };

  const setCabin = (c) => setTc((prev) => ({ ...prev, cabin: c }));
  const closeMobileSheet = () => setMobileSheet(null);

  return (
    <div className="relative">
      {errorMsg && (
        <div className="absolute right-0 top-0 z-50">
          <div
            className="rounded-md border px-4 py-2 text-sm font-semibold"
            style={{
              background: "color-mix(in srgb, var(--danger) 12%, var(--surface))",
              borderColor: "color-mix(in srgb, var(--danger) 28%, var(--border))",
              color: "var(--text)",
              boxShadow: "0 10px 22px color-mix(in srgb, var(--text) 14%, transparent)",
            }}
          >
            {errorMsg}
          </div>
        </div>
      )}

      {/* Top controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm">
          {["oneway", "round"].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTrip(k)}
              className={[
                "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                focusRing,
                trip === k
                  ? "shadow"
                  : "text-[var(--muted)] hover:text-[var(--text)]",
              ].join(" ")}
              style={
                trip === k
                  ? { background: "var(--text)", color: "var(--surface)" }
                  : { color: "var(--muted)" }
              }
            >
              {k === "oneway" ? "One Way" : "Round Trip"}
            </button>
          ))}
        </div>


      </div>

      {/* Main area */}
      <div className={["mt-3 relative", !isModifySearch ? "pb-14" : ""].join(" ")}>
        {/* ================= MOBILE ================= */}
        <div className="md:hidden space-y-3">
          <MobileSummaryCard
            fromAP={fromAP}
            toAP={toAP}
            trip={trip}
            depart={depart}
            ret={ret}
            travellersLabel={travellersLabel}
            onOpenRoute={() => setMobileSheet("route")}
            onOpenDates={() => setMobileSheet("dates")}
            onOpenTravellers={() => setMobileSheet("travellers")}
            onSwap={swap}
          />

          <div className="md:hidden">
            <button
              type="button"
              onClick={handleSearch}
              className={[
                "w-full h-12 rounded-md text-sm font-extrabold",
                "hover:brightness-95 active:scale-[0.99] transition",
                "focus:outline-none focus:ring-4 focus:ring-[color:var(--primarySoft)]",
                "inline-flex items-center justify-center gap-2",
              ].join(" ")}
              style={{
                ...gradientStyle,
                color: "var(--surface)",
                boxShadow: shadowHard,
              }}
            >
              <SearchIcon className="h-4 w-4" />
              SEARCH FLIGHTS
              <ArrowRight className="h-4 w-4" />
            </button>

            {!isModifySearch && (
              <div
                className="mt-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                style={{ boxShadow: shadowSoft }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md"
                    style={{ ...gradientStyle, color: "var(--surface)" }}
                  >
                    <BadgePercent className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-[var(--text)]">
                      Fare Preferences
                    </div>
                    <div className="text-[11px] font-medium text-[var(--muted)]">
                      {presetHint}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <button
                      type="button"
                      onClick={() => setMobileSheet("prefs")}
                      className={[
                        "rounded-md border px-3 py-2 text-xs font-extrabold transition",
                        "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]",
                        focusRing,
                      ].join(" ")}
                    >
                      Change
                    </button>
                  </div>


                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    className={[
                      "inline-flex items-center gap-2 rounded-md border bg-[var(--surface)] px-4 py-2 text-sm font-extrabold transition",
                      "border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface2)]",
                      focusRing,
                    ].join(" ")}
                    title="Track flights & schedules"
                  >
                    <Radar className="h-4 w-4" style={{ color: "var(--primary)" }} />
                    Flight Tracker
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-extrabold text-[var(--muted)]">Cabin:</span>
                  <Chip active={tc.cabin === "Economy"} onClick={() => setCabin("Economy")} icon={Armchair}>
                    Economy
                  </Chip>
                  <Chip active={tc.cabin === "Premium Economy"} onClick={() => setCabin("Premium Economy")}>
                    Premium
                  </Chip>
                  <Chip active={tc.cabin === "Business"} onClick={() => setCabin("Business")}>
                    Business
                  </Chip>
                  <Chip active={tc.cabin === "First"} onClick={() => setCabin("First")}>
                    First
                  </Chip>

                  <span className="mx-1 h-6 w-px" style={{ background: "var(--border)" }} />

                  <span className="text-[11px] font-extrabold text-[var(--muted)]">Quick PAX:</span>
                  <QuickBtn onClick={() => bump("adults", 1)} icon={UserPlus}>+1 Adult</QuickBtn>
                  <QuickBtn onClick={() => bump("children", 1)} icon={Baby}>+1 Child</QuickBtn>
                  <QuickBtn onClick={() => bump("infants", 1)} icon={Baby}>+1 Infant</QuickBtn>
                  <QuickBtn onClick={resetPax} icon={RotateCcw}>Reset</QuickBtn>
                </div>
              </div>
            )}
          </div>

          {/* Route sheet */}
          <MobileSheet
            open={mobileSheet === "route"}
            onClose={closeMobileSheet}
            title="Select Route"
            subtitle="Choose departure & arrival airports"
          >
            <div className="grid grid-cols-1 gap-3">
              <AirportSelect label="From" value={fromAP} onChange={setFromAP} />
              <AirportSelect label="To" value={toAP} onChange={setToAP} />

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={swap}
                  className={[
                    "inline-flex items-center justify-center gap-2 w-full h-11 rounded-md border transition",
                    "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]",
                    focusRing,
                  ].join(" ")}
                >
                  ⇄ Swap From / To
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={closeMobileSheet}
                  className={[
                    "w-full h-11 rounded-md text-sm font-extrabold transition",
                    "focus:outline-none focus:ring-4 focus:ring-[color:var(--primarySoft)]",
                  ].join(" ")}
                  style={{ background: "var(--text)", color: "var(--surface)" }}
                >
                  Done
                </button>
              </div>
            </div>
          </MobileSheet>

          {/* Dates sheet */}
          <MobileSheet
            open={mobileSheet === "dates"}
            onClose={closeMobileSheet}
            title="Select Dates"
            subtitle={trip === "round" ? "Departure & return" : "Departure date"}
          >
            <div className="grid grid-cols-1 gap-3">
              <DateField label="Departure" value={depart} onChange={setDepart} offsetDays={0} minDate={new Date()} />
              <DateField
                label="Return"
                value={ret}
                onChange={setRet}
                disabled={trip !== "round"}
                minDate={returnMinDate}
                offsetDays={1}
                onDisabledClick={() => {
                  setTrip("round");          // ✅ oneway -> round
                  setOpenReturnOnce(true);   // ✅ and open calendar
                }}
                forceOpen={openReturnOnce && trip === "round"}
                onForceOpenConsumed={() => setOpenReturnOnce(false)}
              />
              <div className="pt-2">
                <button
                  type="button"
                  onClick={closeMobileSheet}
                  className={[
                    "w-full h-11 rounded-md text-sm font-extrabold transition",
                    "focus:outline-none focus:ring-4 focus:ring-[color:var(--primarySoft)]",
                  ].join(" ")}
                  style={{ background: "var(--text)", color: "var(--surface)" }}
                >
                  Done
                </button>
              </div>
            </div>
          </MobileSheet>

          {/* Travellers sheet */}
          <MobileSheet
            open={mobileSheet === "travellers"}
            onClose={() => {
              setOpenTC(false);
              closeMobileSheet();
            }}
            title="Travellers & Cabin"
            subtitle="Passengers (max 9) and class"
          >
            <div className="space-y-3">
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="text-xs font-extrabold text-[var(--muted)]">Cabin</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Chip active={tc.cabin === "Economy"} onClick={() => setCabin("Economy")} icon={Armchair}>
                    Economy
                  </Chip>
                  <Chip active={tc.cabin === "Premium Economy"} onClick={() => setCabin("Premium Economy")}>
                    Premium
                  </Chip>
                  <Chip active={tc.cabin === "Business"} onClick={() => setCabin("Business")}>
                    Business
                  </Chip>
                  <Chip active={tc.cabin === "First"} onClick={() => setCabin("First")}>
                    First
                  </Chip>
                </div>
              </div>

              <div className="relative">
                <TravellersField label="Travellers" text={travellersLabel} onClick={openTCDeferred} />
                <TravellerClassPicker
                  open={openTC}
                  value={tc}
                  onChange={(next) => {
                    const fixed = normalizePax(next);
                    if (next.infants > next.adults) setErrorMsg("Infants cannot be more than Adults.");
                    else if (next.adults + next.children + next.infants > MAX_PAX)
                      setErrorMsg(`Maximum ${MAX_PAX} passengers allowed.`);
                    setTc(fixed);
                  }}
                  onClose={() => setOpenTC(false)}
                />
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-2">
                <QuickBtn onClick={() => bump("adults", 1)} icon={UserPlus}>+1 Adult</QuickBtn>
                <QuickBtn onClick={() => bump("children", 1)} icon={Baby}>+1 Child</QuickBtn>
                <QuickBtn onClick={() => bump("infants", 1)} icon={Baby}>+1 Infant</QuickBtn>
                <QuickBtn onClick={resetPax} icon={RotateCcw}>Reset</QuickBtn>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenTC(false);
                    closeMobileSheet();
                  }}
                  className={[
                    "w-full h-11 rounded-md text-sm font-extrabold transition",
                    "focus:outline-none focus:ring-4 focus:ring-[color:var(--primarySoft)]",
                  ].join(" ")}
                  style={{ background: "var(--text)", color: "var(--surface)" }}
                >
                  Done
                </button>
              </div>
            </div>
          </MobileSheet>

          {/* Fare prefs sheet */}
          <MobileSheet
            open={mobileSheet === "prefs"}
            onClose={closeMobileSheet}
            title="Fare Preferences"
            subtitle={presetHint}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Pill active={farePreset === "regular"} onClick={() => setFarePreset("regular")} icon={BadgePercent}>
                  Regular
                </Pill>
                <Pill active={farePreset === "work"} onClick={() => setFarePreset("work")} icon={Briefcase}>
                  Work Travel
                </Pill>
                <Pill active={farePreset === "student"} onClick={() => setFarePreset("student")} icon={GraduationCap}>
                  Student
                </Pill>
                <Pill active={farePreset === "senior"} onClick={() => setFarePreset("senior")} icon={ShieldCheck}>
                  Senior
                </Pill>
                <Pill active={farePreset === "defence"} onClick={() => setFarePreset("defence")} icon={ShieldCheck}>
                  Defence
                </Pill>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={closeMobileSheet}
                  className={[
                    "w-full h-11 rounded-md text-sm font-extrabold transition",
                    "focus:outline-none focus:ring-4 focus:ring-[color:var(--primarySoft)]",
                  ].join(" ")}
                  style={{ background: "var(--text)", color: "var(--surface)" }}
                >
                  Done
                </button>
              </div>
            </div>
          </MobileSheet>
        </div>

        {/* ================= DESKTOP ================= */}
        <div
          className={[
            "hidden md:grid grid-cols-1 gap-3 items-stretch",
            isModifySearch
              ? "md:grid-cols-[4.6fr_1.25fr_1.25fr_1.7fr_56px]"
              : "md:grid-cols-[4.6fr_1.25fr_1.25fr_1.7fr]",
          ].join(" ")}
        >
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3">
            <AirportSelect label="From" value={fromAP} onChange={setFromAP} />
            <AirportSelect label="To" value={toAP} onChange={setToAP} />

            <button
              type="button"
              onClick={swap}
              title="Swap"
              className={[
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full border shadow-sm transition",
                "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] hidden md:grid place-items-center z-10",
                focusRing,
              ].join(" ")}
              style={{ color: "var(--text)" }}
            >
              <img src="https://cdn-icons-png.flaticon.com/128/10520/10520486.png" alt="Swap" className="h-5 w-5" />
            </button>
          </div>

          <DateField label="Departure" value={depart} onChange={setDepart} offsetDays={0} minDate={new Date()} />
          <DateField
            label="Return"
            value={ret}
            onChange={setRet}
            disabled={trip !== "round"}
            minDate={returnMinDate}
            offsetDays={1}
            onDisabledClick={() => {
              setTrip("round");
              setOpenReturnOnce(true);
            }}
            forceOpen={openReturnOnce && trip === "round"}
            onForceOpenConsumed={() => setOpenReturnOnce(false)}
          />


          <div className="relative min-w-0">
            <TravellersField label="Travellers & Class" text={travellersLabel} onClick={() => setOpenTC(true)} />
            <TravellerClassPicker
              open={openTC}
              value={tc}
              onChange={(next) => {
                const fixed = normalizePax(next);
                if (next.infants > next.adults) setErrorMsg("Infants cannot be more than Adults.");
                else if (next.adults + next.children + next.infants > MAX_PAX)
                  setErrorMsg(`Maximum ${MAX_PAX} passengers allowed.`);
                setTc(fixed);
              }}
              onClose={() => setOpenTC(false)}
            />
          </div>

          {isModifySearch && (
            <button
              type="button"
              onClick={handleSearch}
              className={[
                "h-[56px] w-[56px] rounded-md transition grid place-items-center cursor-pointer",
                "hover:brightness-95",
                "focus:outline-none focus:ring-4 focus:ring-[color:var(--primarySoft)]",
              ].join(" ")}
              style={{ ...gradientStyle, color: "var(--surface)", boxShadow: shadowSoft }}
              aria-label="Search"
              title="Search"
            >
              <SearchIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {!isModifySearch && (
          <div className="hidden md:block">
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold text-[var(--muted)]">Quick PAX:</span>
                <QuickBtn onClick={() => bump("adults", 1)} icon={UserPlus}>+1 Adult</QuickBtn>
                <QuickBtn onClick={() => bump("children", 1)} icon={Baby}>+1 Child</QuickBtn>
                <QuickBtn onClick={() => bump("infants", 1)} icon={Baby}>+1 Infant</QuickBtn>
                <QuickBtn onClick={resetPax} icon={RotateCcw}>Reset</QuickBtn>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold text-[var(--muted)]">Cabin:</span>
                <Chip active={tc.cabin === "Economy"} onClick={() => setCabin("Economy")} icon={Armchair}>
                  Economy
                </Chip>
                <Chip active={tc.cabin === "Premium Economy"} onClick={() => setCabin("Premium Economy")}>
                  Premium
                </Chip>
                <Chip active={tc.cabin === "Business"} onClick={() => setCabin("Business")}>
                  Business
                </Chip>
                <Chip active={tc.cabin === "First"} onClick={() => setCabin("First")}>
                  First
                </Chip>
              </div>
            </div>

            <div
              className="relative mt-4 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              style={{ boxShadow: shadowSoft }}
            >
              {/* ===== Right side plane image (FULL opacity) ===== */}
              <div
                className="
      pointer-events-none
      absolute inset-y-0 right-0
      w-[46%] hidden md:block
      bg-no-repeat bg-right bg-contain
    "
                style={{
                  backgroundImage: `url(${searchbg})`,
                  backgroundSize: "cover",
                }}
              />

              {/* ===== Fade mask (this makes it look PART of card) ===== */}
              <div
                className="
      pointer-events-none
      absolute inset-y-0 right-0
      w-[46%] hidden md:block
      bg-gradient-to-l
      from-transparent
      via-[var(--surface)]
      to-[var(--surface)]
    "
              />

              {/* ===== Content ===== */}
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md"
                      style={{ ...gradientStyle, color: "var(--surface)" }}
                    >
                      <BadgePercent className="h-5 w-5" />
                    </span>

                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-[var(--text)]">
                        Fare Preferences
                      </div>
                      <div className="text-[11px] font-medium text-[var(--muted)]">
                        {presetHint}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill active={farePreset === "regular"} onClick={() => setFarePreset("regular")} icon={BadgePercent}>
                      Regular
                    </Pill>
                    <Pill active={farePreset === "work"} onClick={() => setFarePreset("work")} icon={Briefcase}>
                      Work Travel
                    </Pill>
                    <Pill active={farePreset === "student"} onClick={() => setFarePreset("student")} icon={GraduationCap}>
                      Student
                    </Pill>
                    <Pill active={farePreset === "senior"} onClick={() => setFarePreset("senior")} icon={ShieldCheck}>
                      Senior
                    </Pill>
                    <Pill active={farePreset === "defence"} onClick={() => setFarePreset("defence")} icon={ShieldCheck}>
                      Defence
                    </Pill>

                    {trip === "round" && sector === "intl" && (
                      <Pill className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)] shadow-sm">
                        <input
                          type="checkbox"
                          checked={specialFare}
                          onChange={(e) => setSpecialFare(e.target.checked)}
                          className="h-4 w-4"
                          style={{ accentColor: "var(--primary)" }}
                        />
                        Special Round Trip Fare
                      </Pill>
                    )}
                  </div>
                </div>

                {/* <div className="flex justify-start lg:justify-end">
      <button
        type="button"
        className={[
          "inline-flex items-center gap-2 rounded-md border bg-[var(--surface)] px-4 py-2 text-sm font-extrabold transition",
          "border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface2)]",
          focusRing,
        ].join(" ")}
      >
        <Radar className="h-4 w-4" style={{ color: "var(--primary)" }} />
        Flight Tracker
      </button>
    </div> */}
              </div>
            </div>


            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[98%] z-20">
              <button
                type="button"
                onClick={handleSearch}
                className={[
                  "group relative h-9 sm:h-10 min-w-[160px] sm:min-w-[210px] rounded-full text-sm font-bold tracking-wide",
                  "hover:brightness-95 active:scale-[0.98] transition",
                  "focus:outline-none focus:ring-4 focus:ring-[color:var(--primarySoft)]",
                ].join(" ")}
                style={{ ...gradientStyle, color: "var(--surface)", boxShadow: shadowHard }}
              >
                <span className="relative z-10 inline-flex items-center gap-2 mt-2">
                  <SearchIcon className="h-4 w-4" />
                  SEARCH
                </span>
                <span
                  className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition"
                  style={{ background: "color-mix(in srgb, var(--surface) 10%, transparent)" }}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
