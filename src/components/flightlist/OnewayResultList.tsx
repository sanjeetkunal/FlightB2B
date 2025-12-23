import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookingDraft } from "../../booking/flight/bookingDraft";

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
  stops: 0 | 1 | 2;
  stopLabel: string;
  durationMin: number;
  totalFareINR: number;

  commissionUSD: number; // treat as INR for UI
  agentFareUSD: number; // treat as INR for UI

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

export function adaptRowToSelectedFlight(
  r: Row,
  f: FareOption
): SelectedFlightPayload {
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

/* ================== small utils ================== */
const Money = ({
  v,
  fractionDigits = 0,
}: {
  v: number;
  fractionDigits?: number;
}) => (
  <>
    {new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: fractionDigits,
    }).format(v)}
  </>
);

const minsToLabel = (m?: number) => {
  if (m == null) return "";
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${String(mm).padStart(2, "0")}m`;
};

const chipNeutral =
  "bg-slate-100 text-slate-800 ring-slate-300 border-slate-200";

/* ================== tiny atoms ================== */
const ImageLogo = ({ src, alt }: { src: string; alt: string }) => (
  <div className="grid h-11 w-11 place-items-center overflow-hidden">
    <img src={src} alt={alt} className="h-full w-full object-contain p-1" />
  </div>
);

const SmallImageLogo = ({ src, alt }: { src: string; alt: string }) => (
  <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-white ring-1 ring-black/5 overflow-hidden">
    <img src={src} alt={alt} className="h-full w-full object-contain p-0.5" />
  </span>
);

/* === straight timeline === */
const TAKEOFF_ICON =
  "https://cdn-icons-png.flaticon.com/128/8943/8943898.png";
const LANDING_ICON =
  "https://cdn-icons-png.flaticon.com/128/6591/6591567.png";

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
    <div className="absolute -top-3 whitespace-nowrap text-[11px] font-medium text-gray-600">
      {label}
    </div>
    <div className="absolute -bottom-3 whitespace-nowrap text-[11px] font-medium text-gray-700">
      {minsToLabel(durationMin)}
    </div>
    <svg width="260" height="28" viewBox="0 0 260 28" className="text-gray-300">
      <image href={leftIcon} width="16" height="16" x="8" y="6" />
      <line
        x1="24"
        y1="14"
        x2="236"
        y2="14"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 6"
      />
      <circle
        cx="130"
        cy="14"
        r="5"
        fill="white"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <image href={rightIcon} width="16" height="16" x="236" y="6" />
    </svg>
  </div>
);

/* =============== details panels =============== */
const AmenIconLayout = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500">
    <path d="M3 7h18v2H3zm0 4h18v2H3zm0 4h18v2H3z" fill="currentColor" />
  </svg>
);
const AmenIconDrink = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500">
    <path d="M4 3h16l-2 5h-4l1 11H9l1-11H6L4 3z" fill="currentColor" />
  </svg>
);
const AmenIconSeat = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500">
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
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SmallImageLogo src={logo} alt={airline} />
          <div className="text-sm font-semibold text-gray-900">
            {airline} {s.carrier}-{s.flightNo}
          </div>
        </div>
        {s.aircraft && (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700 ring-1 ring-gray-200">
            {s.aircraft}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.1fr_auto_1.1fr_auto_auto_auto] md:items-start">
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {s.departTime}
          </div>
          <div className="text-xs text-gray-500">{s.departDate}</div>
          <div className="mt-1 text-sm text-gray-700">
            {s.fromCity}, {s.fromIata}
          </div>
          {s.fromTerminal && (
            <div className="text-xs text-gray-500">
              Terminal {s.fromTerminal}
            </div>
          )}
        </div>

        <div className="mx-1 grid place-items-center">
          <div className="text-[12px] font-medium text-gray-700">
            {dur.replace("h", "h ").replace("m", " m")}
          </div>
          <div className="mt-1 h-1.5 w-14 rounded bg-gray-200">
            <div className="h-1.5 w-2/3 rounded bg-emerald-500" />
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold text-gray-900">
            {s.arriveTime}
          </div>
          <div className="text-xs text-gray-500">{s.arriveDate}</div>
          <div className="mt-1 text-sm text-gray-700">
            {s.toCity}, {s.toIata}
          </div>
          {s.toTerminal && (
            <div className="text-xs text-gray-500">
              Terminal {s.toTerminal}
            </div>
          )}
        </div>

        <div className="hidden text-right md:block">
          <div className="text-[11px] font-semibold text-gray-600">
            BAGGAGE :
          </div>
          <div className="text-[11px] font-semibold text-gray-800">ADULT</div>
        </div>
        <div className="hidden md:block">
          <div className="text-[11px] font-semibold text-gray-600">CHECK IN</div>
          <div className="text-[12px] text-gray-800">
            {check} Kgs ({piece})
          </div>
        </div>
        <div className="hidden md:block">
          <div className="text-[11px] font-semibold text-gray-600">CABIN</div>
          <div className="text-[12px] text-gray-800">
            {hand} Kgs ({piece})
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 border-t border-dashed border-gray-200 pt-2 text-[12px] text-gray-700 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <AmenIconLayout /> {s.layout || "3-3 Layout"}
        </div>
        <div className="flex items-center gap-2">
          <AmenIconDrink />{" "}
          {s.beverage !== false ? "Beverage Available" : "No Beverage"}
        </div>
        <div className="flex items-center gap-2">
          <AmenIconSeat /> {s.seatType || "Standard Recliner"} (
          {s.legroomInch ?? 28}" Legroom)
        </div>
      </div>
    </div>
  );
}

function LayoverBadge({ text }: { text: string }) {
  return (
    <div className="relative my-3 flex items-center">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="mx-2 rounded-md bg-amber-50 px-2 py-1 text-[12px] font-medium text-amber-800 ring-1 ring-amber-200">
        {text}
      </span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

function ItineraryPanel({
  segs,
  logo,
  airline,
  rowBaggage,
}: {
  segs: Segment[];
  logo: string;
  airline: string;
  rowBaggage: { handKg?: number; checkKg?: number; piece?: string };
}) {
  return (
    <div>
      {segs.map((s, i) => (
        <div key={i}>
          <SegmentCard
            s={s}
            logo={logo}
            airline={airline}
            rowBaggage={rowBaggage}
          />
          {s.layoverAt && s.layoverMin != null && (
            <LayoverBadge
              text={`Change of planes • ${minsToLabel(
                s.layoverMin
              )} Layover in ${s.layoverAt}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function BaggagePanel({
  hand,
  check,
  piece,
}: {
  hand?: number;
  check?: number;
  piece?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="grid grid-cols-3 bg-gray-50 text-xs font-semibold text-gray-700">
        <div className="border-r border-gray-200 p-2">Cabin</div>
        <div className="border-r border-gray-200 p-2">Check-in</div>
        <div className="p-2">Policy</div>
      </div>
      <div className="grid grid-cols-3 text-sm">
        <div className="border-r border-gray-200 p-3">{hand ?? 0} kg</div>
        <div className="border-r border-gray-200 p-3">{check ?? 0} kg</div>
        <div className="p-3">{piece || "As per airline allowance"}</div>
      </div>
    </div>
  );
}

function CancellationPanel({
  refund,
  change,
  noShowUSD,
}: {
  refund: PolicyRule[];
  change: PolicyRule[];
  noShowUSD?: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="mb-2 text-sm font-semibold">Refund rules</div>
        <ul className="space-y-1 text-sm text-gray-700">
          {refund.map((r, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <span>{r.when}</span>
              <span className="font-medium">₹{r.feeUSD}</span>
            </li>
          ))}
        </ul>
        {typeof noShowUSD === "number" && (
          <div className="mt-2 text-xs text-gray-600">
            No-show fee: <span className="font-semibold">₹{noShowUSD}</span>
          </div>
        )}
      </div>
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="mb-2 text-sm font-semibold">Change rules</div>
        <ul className="space-y-1 text-sm text-gray-700">
          {change.map((r, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <span>
                {r.when}
                {r.note ? ` — ${r.note}` : ""}
              </span>
              <span className="font-medium">₹{r.feeUSD}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ========== TABs ========== */
type DetailsTab = "itinerary" | "baggage" | "cancellation" | "fare";

function RowTabs({
  active,
  onChange,
}: {
  active: DetailsTab;
  onChange: (t: DetailsTab) => void;
}) {
  const tabs: { id: DetailsTab; label: string }[] = [
    { id: "itinerary", label: "FLIGHT DETAILS" },
    { id: "fare", label: "FARE SUMMARY" },
    { id: "cancellation", label: "CANCELLATION" },
    { id: "baggage", label: "DATE CHANGE" },
  ];

  return (
    <div className="inline-flex overflow-x-auto max-w-full rounded border border-gray-200">
      {tabs.map((t, i) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={[
            "shrink-0 px-4 py-2 text-xs font-semibold tracking-wide uppercase transition",
            active === t.id
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-800 hover:bg-gray-50",
            i !== 0 && "border-l border-gray-200",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function SelectedFarePanel({
  fare,
  showCommission,
  agentNetFallback,
  commissionFallback,
}: {
  fare: FareOption;
  showCommission: boolean;
  agentNetFallback?: number;
  commissionFallback?: number;
}) {
  const refundableTone =
    fare.refundable === "Refundable" ? "text-emerald-700" : "text-rose-700";

  const agentNet =
    fare.agentFareINR != null ? fare.agentFareINR : agentNetFallback;
  const commission =
    fare.commissionINR != null ? fare.commissionINR : commissionFallback;
  const hasAgentInfo = agentNet != null || commission != null;

  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="text-[13px] text-gray-600">Selected Fare</div>
        <div className="text-[18px] font-bold text-gray-900">
          <Money v={fare.price} />
        </div>
        <span className={`text-[12px] ${refundableTone} font-medium`}>
          {fare.refundable}
        </span>
      </div>

      <div className="text-[12px] text-gray-700">
        {fare.label || "—"}
        {fare.cabin ? ` • ${fare.cabin}` : ""}
        {fare.meal ? `, ${fare.meal}` : ""}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-[11px] text-gray-500">Baggage</div>
          <div className="mt-0.5 text-sm font-medium">
            {(fare.baggage?.handKg ?? "—")}kg cabin •{" "}
            {(fare.baggage?.checkKg ?? "—")}kg check-in
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-[11px] text-gray-500">Seat</div>
          <div className="mt-0.5 text-sm font-medium">
            {fare.seat || "Seat selection (paid)"}
          </div>
        </div>
      </div>

      {showCommission && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-emerald-50 p-3">
            <div className="text-[11px] text-emerald-700">Agent Net Fare</div>
            <div className="mt-0.5 text-sm font-semibold text-emerald-800">
              {agentNet != null ? <Money v={agentNet} /> : "—"}
            </div>
          </div>
          <div className="rounded-lg bg-orange-50 p-3">
            <div className="text-[11px] text-orange-700">Your Commission</div>
            <div className="mt-0.5 text-sm font-semibold text-orange-800">
              {commission != null ? <Money v={commission} /> : "—"}
            </div>
          </div>

          {!hasAgentInfo && (
            <div className="col-span-full text-[11px] text-gray-600">
              Commission info not available for this fare.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ====== SHARE HELPERS (WhatsApp + Email + Copy) ====== */
function buildShareText(rows: Row[], fareByRowId: Map<string, FareOption>) {
  const nfIN = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const lines: string[] = [];
  lines.push("✈️ *Flight Options (One Way)*");

  rows.forEach((r, idx) => {
    const f = fareByRowId.get(r.id);
    lines.push("");
    lines.push(`${idx + 1}) ${r.airline} ${r.flightNos}`);
    lines.push(`${r.fromIata} → ${r.toIata}`);
    lines.push(
      `Time: ${r.departTime} - ${r.arriveTime} | Stops: ${r.stops} (${r.stopLabel})`
    );
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
  const mailto = `mailto:?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
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
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2a9.5 9.5 0 0 0-8.22 14.25L3 22l5.92-1.55A9.5 9.5 0 1 0 12 2zm0 17.3a7.8 7.8 0 0 1-3.96-1.08l-.28-.17-3.5.92.94-3.4-.19-.3A7.8 7.8 0 1 1 12 19.3z" />
      <path d="M16.62 13.9c-.2-.1-1.18-.58-1.36-.65-.18-.07-.31-.1-.44.1-.13.2-.5.65-.62.79-.11.13-.22.15-.42.05-.2-.1-.85-.31-1.62-1-.6-.54-1-1.2-1.12-1.4-.11-.2-.01-.3.09-.4.09-.09.2-.22.3-.33.1-.11.13-.19.2-.32.07-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.46-.16-.38-.32-.33-.44-.33h-.38c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.66 0 .98.72 1.93.82 2.06.1.13 1.41 2.15 3.42 3.02.48.21.85.33 1.14.42.48.15.92.13 1.26.08.39-.06 1.18-.48 1.35-.95.17-.47.17-.88.12-.95-.05-.08-.18-.13-.38-.23z" />
    </svg>
  );
}

function MailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm8 7L3.5 8.2V18a.5.5 0 0 0 .5.5h16a.5.5 0 0 0 .5-.5V8.2L12 13z" />
      <path d="M20.2 7.5H3.8L12 12.8l8.2-5.3z" />
    </svg>
  );
}

function CopyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V7z" />
      <path d="M5 4a2 2 0 0 1 2-2h9v2H7a2 2 0 0 0-2 2v11H3V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
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
  const base =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border transition";
  const cls =
    tone === "whatsapp"
      ? `${base} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`
      : tone === "email"
      ? `${base} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`
      : `${base} border-gray-200 bg-white text-gray-700 hover:bg-gray-50`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cls}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
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
}) {
  const nav = useNavigate();
  const [tab, setTab] = useState<DetailsTab>("itinerary");

  // ✅ detect mobile (<= md)
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
      return {
        code: "NA",
        label: "NA",
        price: 0,
        refundable: r.refundable,
      } as FareOption;
    }
    return r.fares.reduce((m, f) => (f.price < m.price ? f : m), r.fares[0]);
  }, [r.fares, r.refundable]);

  const [localFare, setLocalFare] = useState<FareOption>(
    selectedFare ?? minFareObj
  );

  useEffect(() => {
    setLocalFare(selectedFare ?? minFareObj);
  }, [selectedFare, minFareObj]);

  const effFare = localFare;

  const totalPax =
    (paxConfig?.adults ?? 1) +
    (paxConfig?.children ?? 0) +
    (paxConfig?.infants ?? 0);

  const singleFare = effFare.price;
  const fullFare = effFare.price * totalPax;
  const displayFare = fareView === "FULL" ? fullFare : singleFare;

  const agentNetDisplay =
    effFare.agentFareINR != null
      ? effFare.agentFareINR
      : r.agentFareUSD ?? undefined;

  const commissionDisplay =
    effFare.commissionINR != null
      ? effFare.commissionINR
      : r.commissionUSD ?? undefined;

  const chooseFare = (f: FareOption) => {
    setLocalFare(f);
    onSelectFare(r.id, f);
  };

  // ===== booking draft =====
  const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  function saveDraft(key: string, data: unknown) {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  const onBook = () => {
    const pax = {
      adults: paxConfig?.adults ?? 1,
      children: paxConfig?.children ?? 0,
      infants: paxConfig?.infants ?? 0,
    };

    const totalTravellers = pax.adults + pax.children + pax.infants;

    const pricing = {
      currency: "INR",
      perTraveller: singleFare,
      totalFare: singleFare * totalTravellers,
      pax,
    };

    const selectedFlight = adaptRowToSelectedFlight(r, effFare);

    const draft = {
      selectedFlight,
      selectedFare: effFare,
      pricing,
      paxConfig: pax,
      createdAt: Date.now(),
    };

    const draftId = makeId();
    const storageKey = `BOOKING_DRAFT:${draftId}`;
    saveDraft(storageKey, draft);

    nav(`/flights/passenger-details?draft=${encodeURIComponent(draftId)}`);
  };

  // ✅ fares rendering rules
  const [showAllFaresDesktop, setShowAllFaresDesktop] = useState(false);
  useEffect(() => {
    // whenever switch to mobile, ensure desktop toggle doesn't mess anything
    if (isMobile) setShowAllFaresDesktop(false);
  }, [isMobile]);

  const MIN_VISIBLE_DESKTOP = 2;
  const visibleFaresDesktop = r.fares.slice(0, MIN_VISIBLE_DESKTOP);
  const extraFaresDesktop = r.fares.slice(MIN_VISIBLE_DESKTOP);
  const faresToRenderDesktop = showAllFaresDesktop ? r.fares : visibleFaresDesktop;

  // ✅ on mobile always show all fares
  const faresToRenderMobile = r.fares;

  return (
    <div className="border border-gray-200 bg-white p-3 rounded-2xl relative">
      {/* ✅ share checkbox */}
      {shareMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(r.id);
          }}
          className={[
            "absolute left-3 top-3 z-10 h-6 w-6 rounded-md border grid place-items-center text-xs font-bold",
            selectedIds.has(r.id)
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-gray-300 bg-white text-gray-300",
          ].join(" ")}
          aria-label="Select to share"
          title="Select to share"
        >
          ✓
        </button>
      )}

      {/* ===================== MOBILE LAYOUT (md:hidden) ===================== */}
      <div className="md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <ImageLogo src={r.logo} alt={r.airline} />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold text-gray-900">
                {r.airline}
              </div>
              <div className="text-[11px] text-gray-500">{r.flightNos}</div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[11px] text-gray-600">
              {fareView === "FULL" ? "Total" : "Per Pax"}
            </div>
            <div className="text-[18px] font-extrabold text-gray-900 leading-tight">
              <Money v={displayFare} />
            </div>
            {fareView === "FULL" && totalPax > 1 && (
              <div className="text-[10px] text-gray-500">
                {totalPax} pax total
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[18px] font-bold text-gray-900">
                {r.departTime}
              </div>
              <div className="text-[11px] text-gray-500">{r.departDate}</div>
              <div className="text-[12px] text-gray-800 font-medium">
                {r.fromCity} <span className="text-gray-500">({r.fromIata})</span>
              </div>
            </div>

            <div className="text-center px-2">
              <div className="text-[11px] font-semibold text-gray-700">
                {r.stopLabel}
              </div>
              <div className="text-[11px] text-gray-600">
                {minsToLabel(r.durationMin)}
              </div>
              <div className="mt-1 h-1 w-20 rounded bg-gray-200 overflow-hidden">
                <div className="h-1 w-2/3 rounded bg-gray-900" />
              </div>
            </div>

            <div className="text-right">
              <div className="text-[18px] font-bold text-gray-900">
                {r.arriveTime}
              </div>
              <div className="text-[11px] text-gray-500">{r.arriveDate}</div>
              <div className="text-[12px] text-gray-800 font-medium">
                {r.toCity} <span className="text-gray-500">({r.toIata})</span>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span
              className={[
                effFare.refundable === "Refundable"
                  ? "text-emerald-700"
                  : "text-rose-700",
                "font-semibold",
              ].join(" ")}
            >
              {effFare.refundable}
            </span>

            {r.extras?.map((x) => (
              <span key={x} className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
                {x}
              </span>
            ))}
          </div>

          {/* ✅ MOBILE fares: always show all */}
          <div className="mt-3 grid gap-2">
            {faresToRenderMobile.map((f) => (
              <label
                key={f.code}
                className={[
                  "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition",
                  effFare.code === f.code
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name={`fare-m-${r.id}`}
                  checked={effFare.code === f.code}
                  onChange={() => chooseFare(f)}
                  className="accent-blue-600"
                />
                <div className="font-extrabold text-gray-900">
                  <Money v={f.price} />
                </div>
                <span
                  className={`ml-auto max-w-[55%] truncate rounded px-2 py-0.5 text-[11px] font-semibold ring-1 border ${chipNeutral}`}
                  title={f.label}
                >
                  {f.label}
                </span>
              </label>
            ))}
          </div>

          {showCommission && (agentNetDisplay != null || commissionDisplay != null) && (
            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-[12px]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {agentNetDisplay != null && (
                  <div className="text-gray-700">
                    Net:{" "}
                    <span className="font-semibold text-emerald-700">
                      <Money v={agentNetDisplay} />
                    </span>
                  </div>
                )}
                {commissionDisplay != null && (
                  <div className="text-gray-700">
                    Commission:{" "}
                    <span className="font-semibold text-orange-700">
                      <Money v={commissionDisplay} />
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
            >
              Details
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              >
                <path d="M7 10l5 5 5-5" fill="currentColor" />
              </svg>
            </button>

            <button
              onClick={onBook}
              className="flex-1 bg-gray-900 rounded-lg px-4 py-2 text-xs font-semibold text-white hover:bg-gray-700 cursor-pointer"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* ===================== DESKTOP LAYOUT (hidden md:block) ===================== */}
      <div className="hidden md:block">
        {/* ✅ DESKTOP UI EXACT STYLE - unchanged layout */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <div className="flex items-center gap-2">
            <ImageLogo src={r.logo} alt={r.airline} />
            <div className="min-w-0">
              <div className="truncate text-[16px] font-semibold text-gray-900">
                {r.airline}
              </div>
              <div className="text-[11px] text-gray-500">{r.flightNos}</div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-4">
            <div className="text-right">
              <div className="text-[13px] text-gray-700">
                <span className="text-[18px] font-bold text-gray-900">
                  {r.departTime}
                </span>
              </div>
              <div className="text-[12px]">{r.fromCity}</div>
              <div className="text-[11px] text-gray-500">{r.departDate}</div>
            </div>

            <StraightTimeline label={r.stopLabel} durationMin={r.durationMin} />

            <div className="text-left">
              <div className="text-[13px] text-gray-700">
                <span className="text-[18px] font-bold text-gray-900">
                  {r.arriveTime}
                </span>
              </div>
              <div className="text-[12px]">{r.toCity}</div>
              <div className="text-[11px] text-gray-500">{r.arriveDate}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {faresToRenderDesktop.map((f) => (
              <label
                key={f.code}
                className={[
                  "flex cursor-pointer items-center gap-3 text-sm transition",
                  effFare.code === f.code ? "bg-blue-50" : "bg-white hover:bg-gray-50",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name={`fare-${r.id}`}
                  checked={effFare.code === f.code}
                  onChange={() => chooseFare(f)}
                  className="accent-blue-600"
                />

                <div className="font-bold text-gray-900">
                  <Money v={f.price} />
                </div>

                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700">
                  i
                </span>

                <span
                  className={`truncate rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 border ${chipNeutral}`}
                >
                  {f.label}
                </span>

                {f.badge?.text ? (
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                    {f.badge.text}
                  </span>
                ) : null}
              </label>
            ))}

            {extraFaresDesktop.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAllFaresDesktop((s) => !s)}
                className="self-start text-[12px] text-blue-600 hover:underline"
              >
                {showAllFaresDesktop
                  ? "Show less fares"
                  : `+${extraFaresDesktop.length} more fares`}
              </button>
            )}
          </div>
        </div>

        <hr className="my-2 border-t border-dashed border-gray-200" />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-[12px]">
            <span
              className={[
                effFare.refundable === "Refundable"
                  ? "text-emerald-700"
                  : "text-rose-700",
                "font-medium",
              ].join(" ")}
            >
              {effFare.refundable}
            </span>

            {r.extras?.map((x) => (
              <span
                key={x}
                className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700"
              >
                {x}
              </span>
            ))}

            {showCommission && (agentNetDisplay != null || commissionDisplay != null) && (
              <div className="mt-1 space-y-0.5 text-[11px] text-gray-700 px-3 py-1.5 bg-gray-50 rounded">
                {agentNetDisplay != null && (
                  <span className="mr-2">
                    Net:{" "}
                    <span className="font-semibold text-emerald-700">
                      <Money v={agentNetDisplay} />
                    </span>
                  </span>
                )}
                {commissionDisplay != null && (
                  <span>
                    Your Commission:{" "}
                    <span className="font-semibold text-orange-700">
                      <Money v={commissionDisplay} />
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 hover:bg-gray-50"
            >
              Details
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              >
                <path d="M7 10l5 5 5-5" fill="currentColor" />
              </svg>
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[12px] text-gray-600">
                  Selected Fare {fareView === "FULL" ? "(Total)" : "(Per Pax)"}
                </div>
                <div className="text-[18px] font-bold text-gray-900">
                  <Money v={displayFare} />
                </div>

                {fareView === "FULL" && totalPax > 1 && (
                  <div className="text-[11px] text-gray-600">
                    Total for {totalPax} passengers
                  </div>
                )}
              </div>

              <button
                onClick={onBook}
                className="bg-gray-900 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 cursor-pointer"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== details panel (shared) ===== */}
      {expanded && (
        <div className="mt-2 rounded-xl border border-gray-200 p-3">
          <div className="mb-2">
            <RowTabs active={tab} onChange={setTab} />
          </div>

          {tab === "itinerary" && (
            <ItineraryPanel
              segs={r.segments}
              logo={r.logo}
              airline={r.airline}
              rowBaggage={r.baggage}
            />
          )}
          {tab === "baggage" && (
            <BaggagePanel
              hand={r.baggage.handKg}
              check={r.baggage.checkKg}
              piece={r.baggage.piece}
            />
          )}
          {tab === "cancellation" && (
            <CancellationPanel
              refund={r.cancellation.refund}
              change={r.cancellation.change}
              noShowUSD={r.cancellation.noShowUSD}
            />
          )}
          {tab === "fare" && (
            <SelectedFarePanel
              fare={effFare}
              showCommission={showCommission}
              agentNetFallback={agentNetDisplay}
              commissionFallback={commissionDisplay}
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectAll = () => setSelectedIds(new Set(rows.map((r) => r.id)));

  const selectedRows = useMemo(
    () => rows.filter((r) => selectedIds.has(r.id)),
    [rows, selectedIds]
  );

  const fareByRowId = useMemo(() => {
    const map = new Map<string, FareOption>();
    for (const r of rows) {
      let f: FareOption | undefined;
      if (selectedGlobal?.flightId === r.id) {
        f = selectedGlobal.fare;
      } else if (r.fares?.length) {
        f = r.fares.reduce((m, x) => (x.price < m.price ? x : m), r.fares[0]);
      }
      if (f) map.set(r.id, f);
    }
    return map;
  }, [rows, selectedGlobal]);

  const shareText = useMemo(() => {
    if (selectedRows.length === 0) return "";
    return buildShareText(selectedRows, fareByRowId);
  }, [selectedRows, fareByRowId]);

  const canShareNow = shareMode && selectedRows.length > 0;

  const onShareWhatsApp = () => {
    if (!shareText) return;
    openWhatsAppShare(shareText);
  };

  const onShareEmail = () => {
    if (!shareText) return;
    openEmailShare("Flight Options", shareText);
  };

  const onCopy = async () => {
    if (!shareText) return;
    const ok = await copyToClipboard(shareText);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1200);
  };

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
        {onEmpty ?? "No results. Modify your search or adjust filters."}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* ✅ Share top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
        <div className="text-sm font-semibold text-gray-900">Flight Results</div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShareMode((s) => !s);
              clearSelection();
            }}
            className={[
              "rounded-lg border px-3 py-1.5 text-xs font-semibold",
              shareMode
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
            ].join(" ")}
          >
            {shareMode ? "Exit Share Mode" : "Share"}
          </button>

          {shareMode && (
            <>
              <div className="text-xs text-gray-600">
                Selected:{" "}
                <span className="font-semibold">{selectedRows.length}</span>
              </div>

              <button
                type="button"
                onClick={selectAll}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={clearSelection}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
              >
                Clear
              </button>

              {canShareNow && (
                <div className="ml-1 flex items-center gap-2">
                  <IconBtn
                    onClick={onShareWhatsApp}
                    title="Share via WhatsApp"
                    tone="whatsapp"
                  >
                    <WhatsAppIcon />
                  </IconBtn>

                  <IconBtn
                    onClick={onShareEmail}
                    title="Share via Email"
                    tone="email"
                  >
                    <MailIcon />
                  </IconBtn>

                  <IconBtn
                    onClick={onCopy}
                    title={copied ? "Copied!" : "Copy"}
                    tone="default"
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                  </IconBtn>
                </div>
              )}
            </>
          )}
        </div>
      </div>

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
        />
      ))}
    </div>
  );
}
