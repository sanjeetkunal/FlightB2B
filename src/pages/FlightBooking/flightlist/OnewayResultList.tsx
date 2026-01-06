import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FareCalendarStrip, { FareDay } from "./FareCalendarStrip";
import { ShieldCheck, ShieldX } from "lucide-react";

/** ==== TYPES ==== */
export type FareOption = {
  code: string;
  label: string;
  price: number; // INR
  refundable: "Refundable" | "Non-Refundable";
  cabin?: string;
  meal?: string;
  badge?: { text: string; tone?: "offer" | "published" };
  refNo?: number;
  baggage?: { handKg?: number; checkKg?: number };
  seat?: string;

  commissionINR?: number;
  agentFareINR?: number;

  perks?: string[];
};

export type Segment = {
  fromCity: string;
  fromIata: string;
  departTime: string;
  departDate: string;
  toCity: string;
  toIata: string;
  arriveTime: string;
  arriveDate: string;
  carrier: string;
  flightNo: string;
  durationMin: number;
  layoverAt?: string;
  layoverMin?: number;
  fromTerminal?: string;
  toTerminal?: string;
  aircraft?: string;
  layout?: string;
  beverage?: boolean;
  seatType?: string;
  legroomInch?: number;
};

export type PolicyRule = { when: string; feeUSD: number; note?: string };

export type Row = {
  id: string;
  airline: string;
  logo: string;
  flightNos: string;
  fromCity: string;
  fromIata: string;
  departTime: string;
  departDate: string;
  toCity: string;
  toIata: string;
  arriveTime: string;
  arriveDate: string;
  stops: number;
  stopLabel: string;
  durationMin: number;
  totalFareINR: number;

  commissionUSD: number; // treat as INR for UI (fallback)
  agentFareUSD: number; // treat as INR for UI (fallback)

  refundable: "Refundable" | "Non-Refundable";
  extras?: string[];
  segments: Segment[];
  baggage: { handKg?: number; checkKg?: number; piece?: string };
  cancellation: {
    refund: PolicyRule[];
    change: PolicyRule[];
    noShowUSD?: number;
  };
  fares: FareOption[];
};

export type PaxConfig = { adults: number; children: number; infants: number };

export type SelectedFlightPayload = {
  id: string;
  airline: string;
  logo: string;
  flightNos: string;
  fromCity: string;
  fromIata: string;
  toCity: string;
  toIata: string;
  departTime: string;
  arriveTime: string;
  departDate: string;
  arriveDate: string;
  cabin: string;
  refundable: "Refundable" | "Non-Refundable";
  segments: Segment[];
  baggage: Row["baggage"];
};

export function adaptRowToSelectedFlight(r: Row, f: FareOption): SelectedFlightPayload {
  return {
    id: r.id,
    airline: r.airline,
    logo: r.logo,
    flightNos: r.flightNos,
    fromCity: r.fromCity,
    fromIata: r.fromIata,
    toCity: r.toCity,
    toIata: r.toIata,
    departTime: r.departTime,
    arriveTime: r.arriveTime,
    departDate: r.departDate,
    arriveDate: r.arriveDate,
    cabin: f.cabin ?? "Economy",
    refundable: f.refundable,
    segments: r.segments,
    baggage: r.baggage,
  };
}

/* ================== Theme Vars (no static colors) ================== */
const VAR = {
  surface: "var(--surface, rgba(255,255,255,0.92))",
  surface2: "var(--surface2, rgba(248,250,252,0.92))",
  border: "var(--border, rgba(15,23,42,0.12))",
  text: "var(--text, rgba(15,23,42,0.92))",
  muted: "var(--muted, rgba(71,85,105,0.9))",
  subtle: "var(--subtle, rgba(100,116,139,0.85))",
  primary: "var(--primary, rgb(37,99,235))",
  onPrimary: "var(--onPrimary, rgba(255,255,255,1))", // ✅ add
  primarySoft: "var(--primarySoft, rgba(37,99,235,0.14))",
  accent: "var(--accent, rgb(16,182,217))",
  accentSoft: "var(--accentSoft, rgba(16,182,217,0.12))",
  success: "var(--success, rgb(34,197,94))",
  danger: "var(--danger, rgb(244,63,94))",
  warn: "var(--warn, rgb(245,158,11))",
};


/* ================== small utils ================== */
const Money = ({ v, fractionDigits = 0 }: { v: number; fractionDigits?: number }) => (
  <>
    {new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: fractionDigits,
    }).format(Number.isFinite(v) ? v : 0)}
  </>
);

const CALENDAR_DAYS: FareDay[] = [
  { date: "2026-01-14", price: 15702, trend: "normal" },
  { date: "2026-01-15", price: 14962, trend: "normal" },
  { date: "2026-01-16", price: 14342, trend: "deal" },
  { date: "2026-01-17", price: 14962, trend: "normal" },
  { date: "2026-01-18", price: 14342, trend: "deal" },
  { date: "2026-01-19", price: 13392, trend: "deal" },
  { date: "2026-01-20", price: 14342, trend: "deal" },
  { date: "2026-01-21", price: 13817, trend: "deal" },
];

function inferStopsFromLabel(label?: string): number | null {
  if (!label) return null;
  const s = label.toLowerCase().trim();
  if (s.includes("non-stop") || s.includes("non stop") || s.includes("direct")) return 0;
  const m = s.match(/(\d+)\s*stop/);
  if (m?.[1]) {
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

const minsToLabel = (m?: number | null) => {
  if (m == null) return "—";
  if (!Number.isFinite(m)) return "—";
  const mmSafe = Math.max(0, Math.round(m));
  const h = Math.floor(mmSafe / 60);
  const mm = mmSafe % 60;
  return `${h}h ${String(mm).padStart(2, "0")}m`;
};

/** ✅ treat only fallback row values 0 as "missing" */
const fallbackOrUndef = (n: unknown) => {
  if (typeof n !== "number") return undefined;
  if (!Number.isFinite(n)) return undefined;
  // row fallback fields sometimes come as 0; treat as missing
  if (n <= 0) return undefined;
  return n;
};

/* ================== tiny atoms ================== */
const ImageLogo = ({ src, alt }: { src: string; alt: string }) => (
  <div className="grid h-11 w-11 place-items-center overflow-hidden">
    <img src={src} alt={alt} className="h-full w-full object-contain p-1" />
  </div>
);

const SmallImageLogo = ({ src, alt }: { src: string; alt: string }) => (
  <span
    className="inline-grid h-5 w-5 place-items-center rounded-full overflow-hidden"
    style={{
      background: VAR.surface,
      border: `1px solid ${VAR.border}`,
    }}
  >
    <img src={src} alt={alt} className="h-full w-full object-contain p-0.5" />
  </span>
);

/* === straight timeline === */
const TAKEOFF_ICON = "https://cdn-icons-png.flaticon.com/128/8943/8943898.png";
const LANDING_ICON = "https://cdn-icons-png.flaticon.com/128/6591/6591567.png";

const StraightTimeline = ({
  label,
  durationMin,
  leftIcon = TAKEOFF_ICON,
  rightIcon = LANDING_ICON,
}: {
  label: string;
  durationMin: number;
  leftIcon?: string;
  rightIcon?: string;
}) => (
  <div className="relative flex items-center justify-center px-1">
    <div className="absolute -top-3 whitespace-nowrap text-[11px] font-medium" style={{ color: VAR.subtle }}>
      {label}
    </div>
    <div className="absolute -bottom-3 whitespace-nowrap text-[11px] font-medium" style={{ color: VAR.muted }}>
      {minsToLabel(durationMin)}
    </div>
    <svg width="260" height="28" viewBox="0 0 260 28" style={{ color: VAR.border }}>
      <image href={leftIcon} width="16" height="16" x="8" y="6" />
      <line x1="24" y1="14" x2="236" y2="14" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
      <circle cx="130" cy="14" r="5" fill="transparent" stroke="currentColor" strokeWidth="1.5" />
      <image href={rightIcon} width="16" height="16" x="236" y="6" />
    </svg>
  </div>
);

/* =============== details panels =============== */
const AmenIconLayout = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" style={{ color: VAR.subtle }}>
    <path d="M3 7h18v2H3zm0 4h18v2H3zm0 4h18v2H3z" fill="currentColor" />
  </svg>
);
const AmenIconDrink = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" style={{ color: VAR.subtle }}>
    <path d="M4 3h16l-2 5h-4l1 11H9l1-11H6L4 3z" fill="currentColor" />
  </svg>
);
const AmenIconSeat = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" style={{ color: VAR.subtle }}>
    <path d="M7 3h7v9h5v9h-2v-7h-5V5H9v16H7V3z" fill="currentColor" />
  </svg>
);

function SegmentCard({
  s,
  logo,
  airline,
  rowBaggage,
}: {
  s: Segment;
  logo: string;
  airline: string;
  rowBaggage: { handKg?: number; checkKg?: number; piece?: string };
}) {
  const dur = minsToLabel(s.durationMin);
  const piece = rowBaggage.piece || "1 piece only";
  const hand = rowBaggage.handKg ?? 0;
  const check = rowBaggage.checkKg ?? 0;

  return (
    <div className="rounded-md p-3" style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SmallImageLogo src={logo} alt={airline} />
          <div className="text-sm font-semibold" style={{ color: VAR.text }}>
            {airline} {s.carrier}-{s.flightNo}
          </div>
        </div>
        {s.aircraft && (
          <span
            className="rounded-full px-2 py-1 text-[11px]"
            style={{ background: VAR.surface2, color: VAR.muted, border: `1px solid ${VAR.border}` }}
          >
            {s.aircraft}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.1fr_auto_1.1fr_auto_auto_auto] md:items-start">
        <div>
          <div className="text-lg font-semibold" style={{ color: VAR.text }}>
            {s.departTime}
          </div>
          <div className="text-xs" style={{ color: VAR.subtle }}>
            {s.departDate}
          </div>
          <div className="mt-1 text-sm" style={{ color: VAR.muted }}>
            {s.fromCity}, {s.fromIata}
          </div>
          {s.fromTerminal && (
            <div className="text-xs" style={{ color: VAR.subtle }}>
              Terminal {s.fromTerminal}
            </div>
          )}
        </div>

        <div className="mx-1 grid place-items-center">
          <div className="text-[12px] font-medium" style={{ color: VAR.muted }}>
            {String(dur).replace("h", "h ").replace("m", " m")}
          </div>
          <div className="mt-1 h-1.5 w-14 rounded" style={{ background: VAR.border }}>
            <div className="h-1.5 w-2/3 rounded" style={{ background: VAR.accent }} />
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold" style={{ color: VAR.text }}>
            {s.arriveTime}
          </div>
          <div className="text-xs" style={{ color: VAR.subtle }}>
            {s.arriveDate}
          </div>
          <div className="mt-1 text-sm" style={{ color: VAR.muted }}>
            {s.toCity}, {s.toIata}
          </div>
          {s.toTerminal && (
            <div className="text-xs" style={{ color: VAR.subtle }}>
              Terminal {s.toTerminal}
            </div>
          )}
        </div>

        <div className="hidden text-right md:block">
          <div className="text-[11px] font-semibold" style={{ color: VAR.subtle }}>
            BAGGAGE :
          </div>
          <div className="text-[11px] font-semibold" style={{ color: VAR.text }}>
            ADULT
          </div>
        </div>
        <div className="hidden md:block">
          <div className="text-[11px] font-semibold" style={{ color: VAR.subtle }}>
            CHECK IN
          </div>
          <div className="text-[12px]" style={{ color: VAR.text }}>
            {check} Kgs ({piece})
          </div>
        </div>
        <div className="hidden md:block">
          <div className="text-[11px] font-semibold" style={{ color: VAR.subtle }}>
            CABIN
          </div>
          <div className="text-[12px]" style={{ color: VAR.text }}>
            {hand} Kgs ({piece})
          </div>
        </div>
      </div>

      <div
        className="mt-3 grid grid-cols-1 gap-2 border-t border-dashed pt-2 text-[12px] md:grid-cols-3"
        style={{ borderColor: VAR.border, color: VAR.muted }}
      >
        <div className="flex items-center gap-2">
          <AmenIconLayout /> {s.layout || "3-3 Layout"}
        </div>
        <div className="flex items-center gap-2">
          <AmenIconDrink /> {s.beverage !== false ? "Beverage Available" : "No Beverage"}
        </div>
        <div className="flex items-center gap-2">
          <AmenIconSeat /> {s.seatType || "Standard Recliner"} ({s.legroomInch ?? 28}" Legroom)
        </div>
      </div>
    </div>
  );
}

/* ✅ Proper stop/layover details card (shown between segments) */
function LayoverDetailsCard({
  atIata,
  atCity,
  layoverMin,
  arrDate,
  arrTime,
  depDate,
  depTime,
  terminalArr,
  terminalDep,
}: {
  atIata: string;
  atCity?: string;
  layoverMin: number | null;
  arrDate: string;
  arrTime: string;
  depDate: string;
  depTime: string;
  terminalArr?: string;
  terminalDep?: string;
}) {
  return (
    <div className="my-3 overflow-hidden rounded-md" style={{ border: `1px dashed ${VAR.border}`, background: VAR.surface }}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2" style={{ background: VAR.accentSoft }}>
        <div className="text-[12px] font-semibold" style={{ color: VAR.text }}>
          Stop / Layover in <span className="font-extrabold">{atIata || "—"}</span>
          {atCity ? <span style={{ color: VAR.muted }}> • {atCity}</span> : null}
        </div>

        <span
          className="rounded-full px-2 py-1 text-[11px] font-semibold"
          style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2, color: VAR.text }}
        >
          {minsToLabel(layoverMin)} Layover
        </span>
      </div>

      <div className="grid gap-2 p-3 md:grid-cols-2">
        <div className="rounded-md p-3" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2 }}>
          <div className="text-[11px] font-semibold" style={{ color: VAR.subtle }}>
            Arrival
          </div>
          <div className="mt-0.5 text-sm font-bold" style={{ color: VAR.text }}>
            {arrTime} <span className="text-[12px] font-medium" style={{ color: VAR.muted }}>({arrDate})</span>
          </div>
          <div className="mt-0.5 text-[12px]" style={{ color: VAR.muted }}>
            {terminalArr ? `Terminal ${terminalArr}` : "Terminal —"}
          </div>
        </div>

        <div className="rounded-md p-3" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2 }}>
          <div className="text-[11px] font-semibold" style={{ color: VAR.subtle }}>
            Next Departure
          </div>
          <div className="mt-0.5 text-sm font-bold" style={{ color: VAR.text }}>
            {depTime} <span className="text-[12px] font-medium" style={{ color: VAR.muted }}>({depDate})</span>
          </div>
          <div className="mt-0.5 text-[12px]" style={{ color: VAR.muted }}>
            {terminalDep ? `Terminal ${terminalDep}` : "Terminal —"}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 text-[11px]" style={{ color: VAR.subtle }}>
        Note: Layover time is calculated using arrival/departure timings (fallbacks applied if date format is non-ISO).
      </div>
    </div>
  );
}

/* ================== DROP-IN: UTC SAFE TIME UTILS ================== */

function normDate10(d?: string): string {
  if (!d) return "";
  const s = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function normTimeHHMM(t?: string): string {
  if (!t) return "";
  const s = String(t).trim();
  if (/^\d{1,2}:\d{2}/.test(s)) return s.slice(0, 5);
  return s;
}

function toUtcMs(dateStr: string, timeStr: string): number | null {
  const d = normDate10(dateStr);
  const t = normTimeHHMM(timeStr);

  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, da] = d.split("-").map(Number);
    const [hh, mm] = (t || "00:00").split(":").map(Number);
    if (![y, m, da].every(Number.isFinite)) return null;
    return Date.UTC(y, m - 1, da, hh || 0, mm || 0, 0, 0);
  }

  const native = new Date(`${d} ${t}`.trim());
  if (!Number.isFinite(native.getTime())) return null;

  return Date.UTC(
    native.getFullYear(),
    native.getMonth(),
    native.getDate(),
    native.getHours(),
    native.getMinutes(),
    0,
    0
  );
}

function diffMinUtc(aDate: string, aTime: string, bDate: string, bTime: string): number | null {
  const a = toUtcMs(aDate, aTime);
  const b = toUtcMs(bDate, bTime);
  if (a == null || b == null) return null;
  return Math.max(0, Math.round((b - a) / 60000));
}

function buildStopSummary(segs: Segment[] | undefined, fallback?: { stops: number; stopLabel: string }) {
  const list = Array.isArray(segs) ? segs : [];

  const inferredStops = fallback
    ? Number.isFinite(fallback.stops) && fallback.stops > 0
      ? fallback.stops
      : inferStopsFromLabel(fallback.stopLabel) ?? 0
    : 0;

  if (list.length <= 1) {
    if (fallback && (inferredStops > 0 || fallback.stopLabel)) {
      return {
        stops: inferredStops,
        items: [],
        fallbackOnly: true as const,
        fallbackLabel: fallback.stopLabel || (inferredStops === 0 ? "Non-stop" : `${inferredStops} stops`),
      };
    }
    return null;
  }

  const items: any[] = [];
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i];
    const b = list[i + 1];

    let mins =
      typeof a.layoverMin === "number"
        ? a.layoverMin
        : diffMinUtc(a.arriveDate, a.arriveTime, b.departDate, b.departTime);

    items.push({
      at: a.layoverAt || a.toIata,
      city: a.toCity,
      mins,
      arrDate: a.arriveDate,
      arrTime: a.arriveTime,
      depDate: b.departDate,
      depTime: b.departTime,
      terminalArr: a.toTerminal,
      terminalDep: b.fromTerminal,
    });
  }

  return { stops: items.length, items, fallbackOnly: false as const };
}

function ItineraryPanel({
  segs,
  logo,
  airline,
  rowBaggage,
  rowStops,
  rowStopLabel,
}: {
  segs: Segment[];
  logo: string;
  airline: string;
  rowBaggage: { handKg?: number; checkKg?: number; piece?: string };
  rowStops: number;
  rowStopLabel: string;
}) {
  const summary = useMemo(() => buildStopSummary(segs, { stops: rowStops, stopLabel: rowStopLabel }), [segs, rowStops, rowStopLabel]);

  return (
    <div className="space-y-3">
      {summary && (
        <div className="rounded-md p-3 text-sm" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-semibold" style={{ color: VAR.text }}>
              Stops: {summary.stops} {summary.stops === 1 ? "stop" : "stops"}
            </div>

            {!summary.fallbackOnly && summary.items.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summary.items.map((x, idx) => (
                  <span
                    key={`${x.at}-${idx}`}
                    className="rounded-md px-2 py-1 text-[12px]"
                    style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.muted }}
                    title={
                      x.mins != null
                        ? `${x.city ? `${x.city} (${x.at})` : x.at} • ${minsToLabel(x.mins)} • Arr ${x.arrTime} • Dep ${x.depTime}`
                        : `${x.city ? `${x.city} (${x.at})` : x.at} • Layover time not available`
                    }
                  >
                    {x.at} • {x.mins != null ? minsToLabel(x.mins) : "—"}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[12px]" style={{ color: VAR.muted }}>
                {(summary as any).fallbackLabel}
              </div>
            )}
          </div>

          {(summary as any).fallbackOnly && (
            <div className="mt-2 text-[11px]" style={{ color: VAR.subtle }}>
              Stop details not available.
            </div>
          )}
        </div>
      )}

      {segs?.map((s, i) => {
        const next = segs[i + 1];
        return (
          <div key={`${s.carrier}-${s.flightNo}-${i}`}>
            <SegmentCard s={s} logo={logo} airline={airline} rowBaggage={rowBaggage} />

            {next &&
              (() => {
                const atIata = s.layoverAt || s.toIata;
                const atCity = s.toCity;

                let layoverMin: number | null =
                  typeof s.layoverMin === "number"
                    ? s.layoverMin
                    : diffMinUtc(s.arriveDate, s.arriveTime, next.departDate, next.departTime);

                return (
                  <LayoverDetailsCard
                    atIata={atIata}
                    atCity={atCity}
                    layoverMin={layoverMin ?? 0}
                    arrDate={s.arriveDate}
                    arrTime={s.arriveTime}
                    depDate={next.departDate}
                    depTime={next.departTime}
                    terminalArr={s.toTerminal}
                    terminalDep={next.fromTerminal}
                  />
                );
              })()}
          </div>
        );
      })}
    </div>
  );
}

function BaggagePanel({ hand, check, piece }: { hand?: number; check?: number; piece?: string }) {
  return (
    <div className="overflow-hidden rounded-md" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
      <div className="grid grid-cols-3 text-xs font-semibold" style={{ background: VAR.surface2, color: VAR.muted }}>
        <div className="border-r p-2" style={{ borderColor: VAR.border }}>
          Cabin
        </div>
        <div className="border-r p-2" style={{ borderColor: VAR.border }}>
          Check-in
        </div>
        <div className="p-2">Policy</div>
      </div>
      <div className="grid grid-cols-3 text-sm" style={{ color: VAR.text }}>
        <div className="border-r p-3" style={{ borderColor: VAR.border }}>
          {hand ?? 0} kg
        </div>
        <div className="border-r p-3" style={{ borderColor: VAR.border }}>
          {check ?? 0} kg
        </div>
        <div className="p-3">{piece || "As per airline allowance"}</div>
      </div>
    </div>
  );
}

function CancellationPanel({ refund, change, noShowUSD }: { refund: PolicyRule[]; change: PolicyRule[]; noShowUSD?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-md p-3" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
        <div className="mb-2 text-sm font-semibold" style={{ color: VAR.text }}>
          Refund rules
        </div>
        <ul className="space-y-1 text-sm" style={{ color: VAR.muted }}>
          {refund.map((r, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <span>{r.when}</span>
              <span className="font-medium" style={{ color: VAR.text }}>
                ₹{r.feeUSD}
              </span>
            </li>
          ))}
        </ul>
        {typeof noShowUSD === "number" && (
          <div className="mt-2 text-xs" style={{ color: VAR.subtle }}>
            No-show fee:{" "}
            <span className="font-semibold" style={{ color: VAR.text }}>
              ₹{noShowUSD}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-md p-3" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
        <div className="mb-2 text-sm font-semibold" style={{ color: VAR.text }}>
          Change rules
        </div>
        <ul className="space-y-1 text-sm" style={{ color: VAR.muted }}>
          {change.map((r, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <span>
                {r.when}
                {r.note ? ` — ${r.note}` : ""}
              </span>
              <span className="font-medium" style={{ color: VAR.text }}>
                ₹{r.feeUSD}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ========== TABs ========== */
type PriceMode = "SELL" | "AGENT_NET" | "COMMISSION";

type DetailsTab = "itinerary" | "baggage" | "cancellation" | "fare";
type AgentMode = "SELL" | "NET" | "COMM" | "BOTH";

function RowTabs({ active, onChange }: { active: DetailsTab; onChange: (t: DetailsTab) => void }) {
  const tabs: { id: DetailsTab; label: string }[] = [
    { id: "itinerary", label: "FLIGHT DETAILS" },
    { id: "fare", label: "FARE SUMMARY" },
    { id: "cancellation", label: "CANCELLATION" },
    { id: "baggage", label: "BAGGAGE" },
  ];

  return (
    <div className="inline-flex max-w-full overflow-x-auto rounded" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
      {tabs.map((t, i) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className="shrink-0 px-4 py-2 text-xs font-semibold tracking-wide uppercase transition"
            style={{
              background: isActive ? VAR.primary : "transparent",
              color: isActive ? VAR.onPrimary : VAR.text,
              borderLeft: i !== 0 ? `1px solid ${VAR.border}` : undefined,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function AgentModeToggle({
  value,
  onChange,
}: {
  value: AgentMode;
  onChange: (v: AgentMode) => void;
}) {
  const opts: { id: AgentMode; label: string }[] = [
    { id: "SELL", label: "Sell" },
    { id: "NET", label: "Net" },
    { id: "COMM", label: "Comm" },
    { id: "BOTH", label: "Both" },
  ];

  return (
    <div className="inline-flex overflow-hidden rounded-md" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
      {opts.map((o, idx) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="px-3 py-1.5 text-[12px] font-semibold transition"
            style={{
              background: active ? VAR.primary : "transparent",
              color: active ? VAR.onPrimary : VAR.text,
              borderLeft: idx ? `1px solid ${VAR.border}` : undefined,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SelectedFarePanel({
  fare,
  agentMode,
  agentNetFallback,
  commissionFallback,
  paxTotal,
  fareView,
}: {
  fare: FareOption;
  agentMode: AgentMode;
  agentNetFallback?: number;
  commissionFallback?: number;
  paxTotal: number;
  fareView: "SINGLE" | "FULL";
}) {
  const refundableTone = fare.refundable === "Refundable" ? VAR.success : VAR.danger;

  // per pax values
  const netPerPax = typeof fare.agentFareINR === "number" ? fare.agentFareINR : agentNetFallback;
  const commPerPax = typeof fare.commissionINR === "number" ? fare.commissionINR : commissionFallback;

  const net = netPerPax != null ? (fareView === "FULL" ? netPerPax * paxTotal : netPerPax) : undefined;
  const comm = commPerPax != null ? (fareView === "FULL" ? commPerPax * paxTotal : commPerPax) : undefined;

  const showNet = agentMode === "NET" || agentMode === "BOTH";
  const showComm = agentMode === "COMM" || agentMode === "BOTH";

  return (
    <div className="rounded-md p-3" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="text-[13px]" style={{ color: VAR.subtle }}>
          Selected Fare
        </div>
        <div className="text-[18px] font-bold" style={{ color: VAR.text }}>
          <Money v={fare.price} />
        </div>
        <span className="text-[12px] font-medium" style={{ color: refundableTone }}>
          {fare.refundable}
        </span>
      </div>

      <div className="text-[12px]" style={{ color: VAR.muted }}>
        {fare.label || "—"}
        {fare.cabin ? ` • ${fare.cabin}` : ""}
        {fare.meal ? `, ${fare.meal}` : ""}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
          <div className="text-[11px]" style={{ color: VAR.subtle }}>
            Baggage
          </div>
          <div className="mt-0.5 text-sm font-medium" style={{ color: VAR.text }}>
            {(fare.baggage?.handKg ?? "—")}kg cabin • {(fare.baggage?.checkKg ?? "—")}kg check-in
          </div>
        </div>
        <div className="rounded-md p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
          <div className="text-[11px]" style={{ color: VAR.subtle }}>
            Seat
          </div>
          <div className="mt-0.5 text-sm font-medium" style={{ color: VAR.text }}>
            {fare.seat || "Seat selection (paid)"}
          </div>
        </div>
      </div>

      {(showNet || showComm) && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {showNet && (
            <div className="rounded-md p-3" style={{ background: VAR.primarySoft, border: `1px solid ${VAR.border}` }}>
              <div className="text-[11px]" style={{ color: VAR.muted }}>
                Agent Net {fareView === "FULL" ? "(Total)" : "(Per Pax)"}
              </div>
              <div className="mt-0.5 text-sm font-semibold" style={{ color: VAR.text }}>
                {net != null ? <Money v={net} /> : "—"}
              </div>
            </div>
          )}

          {showComm && (
            <div className="rounded-md p-3" style={{ background: VAR.accentSoft, border: `1px solid ${VAR.border}` }}>
              <div className="text-[11px]" style={{ color: VAR.muted }}>
                Commission {fareView === "FULL" ? "(Total)" : "(Per Pax)"}
              </div>
              <div className="mt-0.5 text-sm font-semibold" style={{ color: VAR.text }}>
                {comm != null ? <Money v={comm} /> : "—"}
              </div>
            </div>
          )}

          {net == null && comm == null && (
            <div className="col-span-full text-[11px]" style={{ color: VAR.subtle }}>
              Agent Net / Commission info not available for this fare.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ====== SHARE HELPERS (WhatsApp + Email + Copy) ====== */
function buildShareText(rows: Row[], fareByRowId: Map<string, FareOption>) {
  const nfIN = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  const lines: string[] = [];
  lines.push("✈️ *Flight Options (One Way)*");

  rows.forEach((r, idx) => {
    const f = fareByRowId.get(r.id);
    lines.push("");
    lines.push(`${idx + 1}) ${r.airline} ${r.flightNos}`);
    lines.push(`${r.fromIata} → ${r.toIata}`);
    lines.push(`Time: ${r.departTime} - ${r.arriveTime} | Stops: ${r.stops} (${r.stopLabel})`);
    if (f) {
      lines.push(`Fare: ${f.label || "—"} | ${f.refundable}`);
      lines.push(`Price: ${nfIN.format(f.price)}`);
    } else {
      lines.push(`From: ${nfIN.format(r.totalFareINR)}`);
    }
  });

  lines.push("");
  lines.push(`Link: ${window.location.href}`);
  return lines.join("\n");
}

function openWhatsAppShare(text: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function openEmailShare(subject: string, body: string) {
  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* ====== SHARE ICONS (SVG) ====== */
function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a9.5 9.5 0 0 0-8.22 14.25L3 22l5.92-1.55A9.5 9.5 0 1 0 12 2zm0 17.3a7.8 7.8 0 0 1-3.96-1.08l-.28-.17-3.5.92.94-3.4-.19-.3A7.8 7.8 0 1 1 12 19.3z" />
      <path d="M16.62 13.9c-.2-.1-1.18-.58-1.36-.65-.18-.07-.31-.1-.44.1-.13.2-.5.65-.62.79-.11.13-.22.15-.42.05-.2-.1-.85-.31-1.62-1-.6-.54-1-1.2-1.12-1.4-.11-.2-.01-.3.09-.4.09-.09.2-.22.3-.33.1-.11.13-.19.2-.32.07-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.46-.16-.38-.32-.33-.44-.33h-.38c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.66 0 .98.72 1.93.82 2.06.1.13 1.41 2.15 3.42 3.02.48.21.85.33 1.14.42.48.15.92.13 1.26.08.39-.06 1.18-.48 1.35-.95.17-.47.17-.88.12-.95-.05-.08-.18-.13-.38-.23z" />
    </svg>
  );
}

function MailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm8 7L3.5 8.2V18a.5.5 0 0 0 .5.5h16a.5.5 0 0 0 .5-.5V8.2L12 13z" />
      <path d="M20.2 7.5H3.8L12 12.8l8.2-5.3z" />
    </svg>
  );
}

function CopyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V7z" />
      <path d="M5 4a2 2 0 0 1 2-2h9v2H7a2 2 0 0 0-2 2v11H3V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M9.2 16.6 4.9 12.3l1.4-1.4 2.9 2.9 8.5-8.5 1.4 1.4-9.9 9.9z" />
    </svg>
  );
}

function IconBtn({
  onClick,
  title,
  children,
  tone = "default",
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "whatsapp" | "email";
}) {
  const base = "inline-flex h-9 w-9 items-center justify-center rounded-full border transition";
  const style: React.CSSProperties =
    tone === "whatsapp"
      ? { borderColor: VAR.border, background: "var(--successSoft, rgba(34,197,94,0.12))", color: VAR.text }
      : tone === "email"
        ? { borderColor: VAR.border, background: VAR.primarySoft, color: VAR.text }
        : { borderColor: VAR.border, background: VAR.surface, color: VAR.text };

  return (
    <button type="button" onClick={onClick} className={base} style={style} title={title} aria-label={title}>
      {children}
    </button>
  );
}

function RefundablePill({ value }: { value: "Refundable" | "Non-Refundable" | string }) {
  const isRefundable = String(value).toLowerCase().includes("refundable") && !String(value).toLowerCase().includes("non");
  const label = isRefundable ? "Refundable" : "Non-Refundable";
  const Icon = isRefundable ? ShieldCheck : ShieldX;

  const tone = isRefundable ? VAR.success : VAR.danger;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none"
      style={{
        background: `color-mix(in srgb, ${tone} 14%, ${VAR.surface})`,
        border: `1px solid color-mix(in srgb, ${tone} 28%, ${VAR.border})`,
        color: `color-mix(in srgb, ${tone} 88%, ${VAR.text})`,
      }}
      title={label}
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}


/* =============== SINGLE ROW =============== */
function B2BRow({
  r,
  expanded,
  onToggle,
  selectedFare,
  onSelectFare,
  paxConfig,
  showCommission,
  fareView,
  shareMode,
  selectedIds,
  onToggleSelect,
  agentMode,
}: {
  r: Row;
  expanded: boolean;
  onToggle: () => void;
  selectedFare: FareOption | null;
  onSelectFare: (rowId: string, fare: FareOption) => void;
  paxConfig?: PaxConfig;
  showCommission: boolean;
  fareView: "SINGLE" | "FULL";
  shareMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (rowId: string) => void;
  agentMode: AgentMode;
}) {
  const nav = useNavigate();
  const [tab, setTab] = useState<DetailsTab>("itinerary");

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  const minFareObj = useMemo(() => {
    if (!r.fares || r.fares.length === 0) {
      return { code: "NA", label: "NA", price: 0, refundable: r.refundable } as FareOption;
    }
    return r.fares.reduce((m, f) => (f.price < m.price ? f : m), r.fares[0]);
  }, [r.fares, r.refundable]);

  const [localFare, setLocalFare] = useState<FareOption>(selectedFare ?? minFareObj);
  useEffect(() => setLocalFare(selectedFare ?? minFareObj), [selectedFare, minFareObj]);

  const effFare = localFare;

  const totalPax = (paxConfig?.adults ?? 1) + (paxConfig?.children ?? 0) + (paxConfig?.infants ?? 0);
  const singleSell = effFare.price;
  const totalSell = effFare.price * totalPax;
  const sellDisplay = fareView === "FULL" ? totalSell : singleSell;

  // ✅ get per-pax net/comm from fare first, else from row fallback (but treat 0 fallback as missing)
  const netPerPax = typeof effFare.agentFareINR === "number" ? effFare.agentFareINR : fallbackOrUndef(r.agentFareUSD);
  const commPerPax = typeof effFare.commissionINR === "number" ? effFare.commissionINR : fallbackOrUndef(r.commissionUSD);

  const netDisplay = netPerPax != null ? (fareView === "FULL" ? netPerPax * totalPax : netPerPax) : undefined;
  const commDisplay = commPerPax != null ? (fareView === "FULL" ? commPerPax * totalPax : commPerPax) : undefined;

  const mainLabel =
    !showCommission || agentMode === "SELL"
      ? fareView === "FULL"
        ? "Total"
        : "Per Pax"
      : agentMode === "NET"
        ? fareView === "FULL"
          ? "Net (Total)"
          : "Net (Per Pax)"
        : agentMode === "COMM"
          ? fareView === "FULL"
            ? "Commission (Total)"
            : "Commission (Per Pax)"
          : fareView === "FULL"
            ? "Total"
            : "Per Pax";

  const mainValue =
    !showCommission || agentMode === "SELL"
      ? sellDisplay
      : agentMode === "NET"
        ? (netDisplay ?? sellDisplay)
        : agentMode === "COMM"
          ? (commDisplay ?? sellDisplay)
          : sellDisplay;

  const chooseFare = (f: FareOption) => {
    setLocalFare(f);
    onSelectFare(r.id, f);
  };

  const onBook = () => {
    const pax = {
      adults: paxConfig?.adults ?? 1,
      children: paxConfig?.children ?? 0,
      infants: paxConfig?.infants ?? 0,
    };
    const totalTravellers = pax.adults + pax.children + pax.infants;

    const selectedFlight = adaptRowToSelectedFlight(r, effFare);

    // book ctx should store per pax values if available
    const agentNetPerPax = typeof effFare.agentFareINR === "number" ? effFare.agentFareINR : fallbackOrUndef(r.agentFareUSD) ?? null;
    const commissionPerPax = typeof effFare.commissionINR === "number" ? effFare.commissionINR : fallbackOrUndef(r.commissionUSD) ?? null;

    const sellPerPax = effFare.price;

    const pricing = {
      currency: "INR",
      perTraveller: sellPerPax,
      totalFare: sellPerPax * totalTravellers,
      pax,

      agentNetPerPax: agentNetPerPax ?? undefined,
      agentNetTotal: agentNetPerPax != null ? agentNetPerPax * totalTravellers : undefined,

      commissionPerPax: commissionPerPax ?? undefined,
      commissionTotal: commissionPerPax != null ? commissionPerPax * totalTravellers : undefined,

      marginPerPax: agentNetPerPax != null ? Math.max(0, sellPerPax - agentNetPerPax) : undefined,
      marginTotal: agentNetPerPax != null ? Math.max(0, (sellPerPax - agentNetPerPax) * totalTravellers) : undefined,
    };

    const ctx = {
      selectedFlight,
      selectedFare: effFare,
      pricing,
      paxConfig: pax,
      createdAt: Date.now(),
    };

    sessionStorage.setItem("BOOKING_CTX_V1", JSON.stringify(ctx));
    nav("/flights/passenger-details", { state: ctx });
  };

  // fares rendering rules
  const [showAllFaresDesktop, setShowAllFaresDesktop] = useState(false);
  useEffect(() => {
    if (isMobile) setShowAllFaresDesktop(false);
  }, [isMobile]);

  const MIN_VISIBLE_DESKTOP = 2;
  const visibleFaresDesktop = r.fares.slice(0, MIN_VISIBLE_DESKTOP);
  const extraFaresDesktop = r.fares.slice(MIN_VISIBLE_DESKTOP);
  const faresToRenderDesktop = showAllFaresDesktop ? r.fares : visibleFaresDesktop;
  const faresToRenderMobile = r.fares;

  const themeFx = useMemo(
    () => ({
      leftWash: `radial-gradient(70% 110% at 0% 40%, ${VAR.primarySoft}, transparent 65%)`,
      rightWash: `radial-gradient(70% 110% at 100% 50%, ${VAR.accentSoft}, transparent 62%)`,
      bottom: `linear-gradient(to top, var(--shadowSoft, rgba(2,6,23,0.04)), transparent 60%)`,
    }),
    []
  );

  const refundableColor = effFare.refundable === "Refundable" ? VAR.success : VAR.danger;

  return (
    <div
      className="relative overflow-hidden rounded-md p-3 transition-shadow hover:shadow-lg"
      style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}
    >
      {/* <div className="pointer-events-none absolute inset-0" style={{ background: themeFx.leftWash }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: themeFx.rightWash }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2" style={{ background: themeFx.bottom }} /> */}

      {shareMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(r.id);
          }}
          className="absolute left-3 top-3 z-10 grid h-6 w-6 place-items-center rounded-md border text-xs font-bold"
          style={{
            borderColor: VAR.border,
            background: selectedIds.has(r.id) ? VAR.primary : VAR.surface,
            color: selectedIds.has(r.id) ? VAR.onPrimary : VAR.subtle,
          }}
          aria-label="Select to share"
          title="Select to share"
        >
          ✓
        </button>
      )}

      {/* ===================== MOBILE LAYOUT ===================== */}
      <div className="md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <ImageLogo src={r.logo} alt={r.airline} />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold" style={{ color: VAR.text }}>
                {r.airline}
              </div>
              <div className="text-[11px]" style={{ color: VAR.subtle }}>
                {r.flightNos}
              </div>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-[11px]" style={{ color: VAR.subtle }}>
              {mainLabel}
            </div>
            <div className="text-[18px] font-extrabold leading-tight" style={{ color: VAR.text }}>
              <Money v={mainValue} />
            </div>

            {/* ✅ when BOTH, show net + comm chips under main sell */}
            {showCommission && agentMode === "BOTH" && (
              <div className="mt-1 flex flex-wrap justify-end gap-1 text-[10px]">
                <span className="rounded px-2 py-0.5" style={{ background: VAR.primarySoft, border: `1px solid ${VAR.border}`, color: VAR.text }}>
                  Net: {netDisplay != null ? <Money v={netDisplay} /> : "—"}
                </span>
                <span className="rounded px-2 py-0.5" style={{ background: VAR.accentSoft, border: `1px solid ${VAR.border}`, color: VAR.text }}>
                  Comm: {commDisplay != null ? <Money v={commDisplay} /> : "—"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 rounded-md p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[18px] font-bold" style={{ color: VAR.text }}>
                {r.departTime}
              </div>
              <div className="text-[11px]" style={{ color: VAR.subtle }}>
                {r.departDate}
              </div>
              <div className="text-[12px] font-medium" style={{ color: VAR.text }}>
                {r.fromCity} <span style={{ color: VAR.subtle }}>({r.fromIata})</span>
              </div>
            </div>

            <div className="px-2 text-center">
              <div className="text-[11px] font-semibold" style={{ color: VAR.muted }}>
                {r.stopLabel}
              </div>
              <div className="text-[11px]" style={{ color: VAR.subtle }}>
                {minsToLabel(r.durationMin)}
              </div>
              <div className="mt-1 h-1 w-20 overflow-hidden rounded" style={{ background: VAR.border }}>
                <div className="h-1 w-2/3 rounded" style={{ background: VAR.text }} />
              </div>
            </div>

            <div className="text-right">
              <div className="text-[18px] font-bold" style={{ color: VAR.text }}>
                {r.arriveTime}
              </div>
              <div className="text-[11px]" style={{ color: VAR.subtle }}>
                {r.arriveDate}
              </div>
              <div className="text-[12px] font-medium" style={{ color: VAR.text }}>
                {r.toCity} <span style={{ color: VAR.subtle }}>({r.toIata})</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <RefundablePill value={effFare.refundable} />
          </div>

          <div className="mt-3 grid gap-2">
            {faresToRenderMobile.map((f) => {
              const active = effFare.code === f.code;
              return (
                <label
                  key={f.code}
                  className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition"
                  style={{
                    borderColor: active ? VAR.primary : VAR.border,
                    background: active ? VAR.primarySoft : VAR.surface,
                  }}
                >
                  <input
                    type="radio"
                    name={`fare-m-${r.id}`}
                    checked={active}
                    onChange={() => chooseFare(f)}
                    style={{ accentColor: "var(--primary, rgb(37,99,235))" }}
                  />
                  <div className="font-extrabold" style={{ color: VAR.text }}>
                    <Money v={f.price} />
                  </div>

                  <span
                    className="ml-auto max-w-[55%] truncate rounded px-2 py-0.5 text-[11px] font-semibold"
                    style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2, color: VAR.muted }}
                    title={f.label}
                  >
                    {f.label}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border px-3 py-2 text-xs font-semibold"
              style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
            >
              Details
              <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}>
                <path d="M7 10l5 5 5-5" fill="currentColor" />
              </svg>
            </button>

            <button
              onClick={onBook}
              className="flex-1 cursor-pointer rounded-md px-4 py-2 text-xs font-semibold
                         bg-[color:var(--primary)] text-[color:var(--onPrimary)]
                         hover:opacity-95"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* ===================== DESKTOP LAYOUT ===================== */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <div className="flex items-center gap-2">
            <ImageLogo src={r.logo} alt={r.airline} />
            <div className="min-w-0">
              <div className="truncate text-[16px] font-semibold" style={{ color: VAR.text }}>
                {r.airline}
              </div>
              <div className="text-[11px]" style={{ color: VAR.subtle }}>
                {r.flightNos}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-4">
            <div className="text-right">
              <div className="text-[13px]" style={{ color: VAR.muted }}>
                <span className="text-[18px] font-bold" style={{ color: VAR.text }}>
                  {r.departTime}
                </span>
              </div>
              <div className="text-[12px]" style={{ color: VAR.text }}>
                {r.fromCity}
              </div>
              <div className="text-[11px]" style={{ color: VAR.subtle }}>
                {r.departDate}
              </div>
            </div>

            <StraightTimeline label={r.stopLabel} durationMin={r.durationMin} />

            <div className="text-left">
              <div className="text-[13px]" style={{ color: VAR.muted }}>
                <span className="text-[18px] font-bold" style={{ color: VAR.text }}>
                  {r.arriveTime}
                </span>
              </div>
              <div className="text-[12px]" style={{ color: VAR.text }}>
                {r.toCity}
              </div>
              <div className="text-[11px]" style={{ color: VAR.subtle }}>
                {r.arriveDate}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {faresToRenderDesktop.map((f) => {
              const active = effFare.code === f.code;
              return (
                <label
                  key={f.code}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1 text-sm transition"
                  style={{
                    background: active ? VAR.primarySoft : "transparent",
                    color: VAR.text,
                    border: `1px solid ${active ? VAR.primary : "transparent"}`,
                  }}
                >
                  <input
                    type="radio"
                    name={`fare-${r.id}`}
                    checked={active}
                    onChange={() => chooseFare(f)}
                    style={{ accentColor: "var(--primary, rgb(37,99,235))" }}
                  />

                  <div className="font-bold" style={{ color: VAR.text }}>
                    <Money v={f.price} />
                  </div>

                  <span
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: VAR.accentSoft, color: VAR.text, border: `1px solid ${VAR.border}` }}
                  >
                    i
                  </span>

                  <span
                    className="truncate rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2, color: VAR.muted }}
                  >
                    {f.label}
                  </span>

                  {f.badge?.text ? (
                    <span
                      className="rounded px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.muted }}
                    >
                      {f.badge.text}
                    </span>
                  ) : null}
                </label>
              );
            })}

            {extraFaresDesktop.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAllFaresDesktop((s) => !s)}
                className="self-start text-[12px] hover:underline"
                style={{ color: VAR.primary }}
              >
                {showAllFaresDesktop ? "Show less fares" : `+${extraFaresDesktop.length} more fares`}
              </button>
            )}
          </div>
        </div>

        <hr className="my-2 border-t border-dashed" style={{ borderColor: VAR.border }} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
  <RefundablePill value={effFare.refundable} />
</div>

          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs"
              style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
            >
              Details
              <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}>
                <path d="M7 10l5 5 5-5" fill="currentColor" />
              </svg>
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-right">
                <div className="text-[12px]" style={{ color: VAR.subtle }}>
                  {mainLabel}
                </div>
                <div className="text-[18px] font-bold" style={{ color: VAR.text }}>
                  <Money v={mainValue} />
                </div>

                {showCommission && agentMode === "BOTH" && (
                  <div className="mt-1 flex flex-wrap justify-end gap-1 text-[10px]">
                    <span className="rounded px-2 py-0.5" style={{ background: VAR.primarySoft, border: `1px solid ${VAR.border}`, color: VAR.text }}>
                      Net: {netDisplay != null ? <Money v={netDisplay} /> : "—"}
                    </span>
                    <span className="rounded px-2 py-0.5" style={{ background: VAR.accentSoft, border: `1px solid ${VAR.border}`, color: VAR.text }}>
                      Comm: {commDisplay != null ? <Money v={commDisplay} /> : "—"}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={onBook}
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-semibold
                           bg-[color:var(--primary)] text-[color:var(--onPrimary)]
                           hover:opacity-95"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== details panel (shared) ===== */}
      {expanded && (
        <div className="mt-2 rounded-md p-3" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2 }}>
          <div className="mb-2">
            <RowTabs active={tab} onChange={setTab} />
          </div>

          {tab === "itinerary" && (
            <ItineraryPanel
              segs={r.segments}
              logo={r.logo}
              airline={r.airline}
              rowBaggage={r.baggage}
              rowStops={(Number.isFinite(r.stops) && r.stops > 0) ? r.stops : (inferStopsFromLabel(r.stopLabel) ?? 0)}
              rowStopLabel={r.stopLabel}
            />
          )}

          {tab === "baggage" && <BaggagePanel hand={r.baggage.handKg} check={r.baggage.checkKg} piece={r.baggage.piece} />}

          {tab === "cancellation" && (
            <CancellationPanel refund={r.cancellation.refund} change={r.cancellation.change} noShowUSD={r.cancellation.noShowUSD} />
          )}

          {tab === "fare" && (
            <SelectedFarePanel
              fare={effFare}
              agentMode={showCommission ? agentMode : "SELL"}
              agentNetFallback={fallbackOrUndef(r.agentFareUSD)}
              commissionFallback={fallbackOrUndef(r.commissionUSD)}
              paxTotal={totalPax}
              fareView={fareView}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* =============== LIST WRAPPER =============== */
export default function OnewayResultList({
  rows,
  selectedGlobal,
  onSelectFare,
  onEmpty,
  paxConfig,
  showCommission = false,
  fareView,
}: {
  rows: Row[];
  selectedGlobal: { flightId: string; fare: FareOption } | null;
  onSelectFare: (rowId: string, fare: FareOption) => void;
  onEmpty?: React.ReactNode;
  paxConfig?: PaxConfig;
  showCommission?: boolean;
  fareView: "SINGLE" | "FULL";
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ✅ Share state
  const [shareMode, setShareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // ✅ Agent view mode (Sell / Net / Comm / Both)
  const [agentMode, setAgentMode] = useState<AgentMode>(showCommission ? "NET" : "SELL");
  useEffect(() => {
    if (!showCommission) setAgentMode("SELL");
    else if (agentMode === "SELL") setAgentMode("NET");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCommission]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2026-01-17"));

  const clearSelection = () => setSelectedIds(new Set());
  const selectAll = () => setSelectedIds(new Set(rows.map((r) => r.id)));

  const selectedRows = useMemo(() => rows.filter((r) => selectedIds.has(r.id)), [rows, selectedIds]);

  const fareByRowId = useMemo(() => {
    const map = new Map<string, FareOption>();
    for (const r of rows) {
      let f: FareOption | undefined;
      if (selectedGlobal?.flightId === r.id) f = selectedGlobal.fare;
      else if (r.fares?.length) f = r.fares.reduce((m, x) => (x.price < m.price ? x : m), r.fares[0]);
      if (f) map.set(r.id, f);
    }
    return map;
  }, [rows, selectedGlobal]);

  const shareText = useMemo(() => (selectedRows.length === 0 ? "" : buildShareText(selectedRows, fareByRowId)), [selectedRows, fareByRowId]);
  const canShareNow = shareMode && selectedRows.length > 0;

  const onShareWhatsApp = () => {
    if (shareText) openWhatsAppShare(shareText);
  };
  const onShareEmail = () => {
    if (shareText) openEmailShare("Flight Options", shareText);
  };
  const onCopy = async () => {
    if (!shareText) return;
    const ok = await copyToClipboard(shareText);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1200);
  };

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-md p-6 text-center text-sm" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface, color: VAR.muted }}>
        {onEmpty ?? "No results. Modify your search or adjust filters."}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* ✅ Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-semibold" style={{ color: VAR.text }}>
            Flight Results
          </div>

          {/* ✅ Separate option to view: Sell / Net / Comm / Both */}
          {showCommission && (
            <div className="ml-1">
              <AgentModeToggle value={agentMode} onChange={setAgentMode} />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShareMode((s) => !s);
              clearSelection();
            }}
            className="rounded-md border px-3 py-1.5 text-xs font-semibold"
            style={{
              borderColor: VAR.border,
              background: shareMode ? VAR.primary : VAR.surface,
              color: shareMode ? VAR.onPrimary : VAR.text,
            }}
          >
            {shareMode ? "Exit Share Mode" : "Share"}
          </button>

          {shareMode && (
            <>
              <div className="text-xs" style={{ color: VAR.muted }}>
                Selected:{" "}
                <span className="font-semibold" style={{ color: VAR.text }}>
                  {selectedRows.length}
                </span>
              </div>

              <button
                type="button"
                onClick={selectAll}
                className="rounded-md border px-3 py-1.5 text-xs font-semibold"
                style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
              >
                Select All
              </button>

              <button
                type="button"
                onClick={clearSelection}
                className="rounded-md border px-3 py-1.5 text-xs font-semibold"
                style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
              >
                Clear
              </button>

              {canShareNow && (
                <div className="ml-1 flex items-center gap-2">
                  <IconBtn onClick={onShareWhatsApp} title="Share via WhatsApp" tone="whatsapp">
                    <WhatsAppIcon />
                  </IconBtn>

                  <IconBtn onClick={onShareEmail} title="Share via Email" tone="email">
                    <MailIcon />
                  </IconBtn>

                  <IconBtn onClick={onCopy} title={copied ? "Copied!" : "Copy"} tone="default">
                    {copied ? <CheckIcon /> : <CopyIcon />}
                  </IconBtn>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fare calendar */}
      <FareCalendarStrip
        items={CALENDAR_DAYS}
        value={selectedDate}
        onChange={(d) => {
          setSelectedDate(d);
          // ✅ yahan aap API refetch / filter by date kar sakte ho
        }}
      />

      {rows.map((r) => (
        <B2BRow
          key={r.id}
          r={r}
          expanded={expandedId === r.id}
          onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
          selectedFare={selectedGlobal?.flightId === r.id ? selectedGlobal.fare : null}
          onSelectFare={onSelectFare}
          paxConfig={paxConfig}
          showCommission={showCommission}
          fareView={fareView}
          shareMode={shareMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          agentMode={agentMode}
        />
      ))}
    </div>
  );
}
