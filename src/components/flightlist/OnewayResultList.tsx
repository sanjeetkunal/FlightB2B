// src/components/flightlist/OnewayResultList.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/** ==== TYPES ==== */
export type FareOption = {
  code: string;
  label: string;
  price: number; // INR
  refundable: "Refundable" | "Non Refundable";
  cabin?: string;
  meal?: string;
  badge?: { text: string; tone?: "offer" | "published" };
  refNo?: number;
  baggage?: { handKg?: number; checkKg?: number };
  seat?: string;

  // agent-side (fare level)
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
  logo: string; // PNG logo URL
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

  // row-level agent side (fallback)
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

/** ==== PAX CONFIG ==== */
export type PaxConfig = {
  adults: number;
  children: number;
  infants: number;
};

/** ==== CLEAN FLIGHT PAYLOAD passenger page ke liye ==== */
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

/** Row + Fare → passenger page ke liye clean object */
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
    refundable: r.refundable, // row se
    segments: r.segments,
    baggage: r.baggage,
  };
}

/* ================== small utils ================== */
const Money = ({
  v,
  fractionDigits = 2,
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
const dotNeutral = "bg-gray-400";

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

function DetailsHeader({
  airline,
  logo,
  flightNos,
}: {
  airline: string;
  logo: string;
  flightNos: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <ImageLogo src={logo} alt={airline} />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-gray-900">
            {airline}
          </div>
          <div className="truncate text-xs text-gray-600">
            Flight(s): <span className="font-medium">{flightNos}</span>
          </div>
        </div>
      </div>
      <div className="hidden items-center gap-2 sm:flex text-xs text-gray-600">
        Aircraft • Economy
      </div>
    </div>
  );
}

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
        {/* from */}
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

        {/* duration */}
        <div className="mx-1 grid place-items-center">
          <div className="text-[12px] font-medium text-gray-700">
            {dur.replace("h", "h ").replace("m", " m")}
          </div>
          <div className="mt-1 h-1.5 w-14 rounded bg-gray-200">
            <div className="h-1.5 w-2/3 rounded bg-emerald-500" />
          </div>
        </div>

        {/* to */}
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

        {/* baggage summary */}
        <div className="hidden text-right md:block">
          <div className="text-[11px] font-semibold text-gray-600">
            BAGGAGE :
          </div>
          <div className="text-[11px] font-semibold text-gray-800">ADULT</div>
        </div>
        <div className="hidden md:block">
          <div className="text-[11px] font-semibold text-gray-600">
            CHECK IN
          </div>
          <div className="text-[12px] text-gray-800">
            {check} Kgs ({piece})
          </div>
        </div>
        <div className="hidden md:block">
          <div className="text-[11px] font-semibold text-gray-600">
            CABIN
          </div>
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
            No-show fee:{" "}
            <span className="font-semibold">₹{noShowUSD}</span>
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
    <div className="inline-flex overflow-hidden rounded border border-gray-200">
      {tabs.map((t, i) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={[
            "px-4 py-2 text-xs font-semibold tracking-wide uppercase transition",
            active === t.id
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-800 sbg-gray-50",
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

/* ==== Selected fare panel ==== */
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
    fare.refundable === "Refundable"
      ? "text-emerald-700"
      : "text-rose-700";

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
            <div className="text-[11px] text-emerald-700">
              Agent Net Fare
            </div>
            <div className="mt-0.5 text-sm font-semibold text-emerald-800">
              {agentNet != null ? <Money v={agentNet} /> : "—"}
            </div>
          </div>
          <div className="rounded-lg bg-orange-50 p-3">
            <div className="text-[11px] text-orange-700">
              Your Commission
            </div>
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

/* =============== fare pickers =============== */
function FareOneLine({
  fare,
  placeholder,
  onClick,
}: {
  fare: FareOption | null;
  placeholder: string;
  onClick: () => void;
}) {
  const display = fare ? `${fare.label}` : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex max-w-full items-center gap-2 rounded-md bg-white px-3 py-1.5 text-left text-[12px] hover:bg-gray-50"
      title="Change fare"
    >
      <span
        className={`h-3.5 w-3.5 rounded-full border ${
          fare ? "border-gray-800" : "border-gray-400"
        } grid place-items-center`}
      >
        {fare && <span className="h-2 w-2 rounded-full bg-gray-800" />}
      </span>

      {fare ? (
        <div className="flex min-w-0 items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotNeutral}`} />
          <span className="whitespace-nowrap text-[14px] font-bold text-gray-900">
            <Money v={fare.price} />
          </span>

          {/* (i) tooltip */}
          <span className="relative group">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700">
              i
            </span>
            <div className="pointer-events-none absolute left-1/2 z-30 mt-2 w-72 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 opacity-0 shadow-2xl transition group-hover:opacity-100">
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="font-semibold">
                  {fare.label} • {fare.cabin || "—"}
                </span>
                <span className="font-semibold">
                  <Money v={fare.price} />
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-gray-50 p-2">
                  <div className="text-[11px] text-gray-500">Baggage</div>
                  <div className="mt-0.5 font-medium">
                    {fare.baggage?.handKg != null
                      ? `${fare.baggage.handKg}kg cabin`
                      : "Cabin: airline"}
                    <br />
                    {fare.baggage?.checkKg != null
                      ? `${fare.baggage.checkKg}kg check-in`
                      : "Check-in: airline"}
                  </div>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                  <div className="text-[11px] text-gray-500">Seat</div>
                  <div className="mt-0.5 font-medium">
                    {fare.seat || "Seat selection (paid)"}
                  </div>
                </div>
              </div>
              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-gray-200 bg-white" />
            </div>
          </span>

          <span
            className={`truncate rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 border ${chipNeutral}`}
          >
            {display}
          </span>
        </div>
      ) : (
        <span className="text-[12px] text-gray-600">{placeholder}</span>
      )}

      <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500">
        <path d="M7 10l5 5 5-5" fill="currentColor" />
      </svg>
    </button>
  );
}

function FareListRows({
  fares,
  name,
  selectedCode,
  onSelect,
}: {
  fares: FareOption[];
  name: string;
  selectedCode?: string;
  onSelect: (f: FareOption) => void;
}) {
  const row = (f: FareOption, last: boolean) => {
    const refundableTone =
      f.refundable === "Refundable"
        ? "text-emerald-700"
        : "text-rose-700";
    const display = `${f.label}`;

    return (
      <label
        key={f.code}
        className={`grid cursor-pointer grid-cols-[18px_1fr] items-center gap-2 px-2 py-2 ${
          !last ? "border-b border-gray-100" : ""
        }`}
      >
        <input
          type="radio"
          name={name}
          value={f.code}
          checked={selectedCode === f.code}
          onChange={() => onSelect(f)}
          className="h-3.5 w-3.5 accent-gray-800"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotNeutral}`} />
            <span className="text-[15px] font-semibold text-gray-900">
              <Money v={f.price} />
            </span>

            {/* (i) tooltip */}
            <span className="relative group">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700">
                i
              </span>
              <div className="pointer-events-none absolute left-0 z-30 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 opacity-0 shadow-2xl transition group-hover:opacity-100">
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="font-semibold">
                    {f.label} • {f.cabin || "—"}
                  </span>
                  <span className="font-semibold">
                    <Money v={f.price} />
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-gray-50 p-2">
                    <div className="text-[11px] text-gray-500">Baggage</div>
                    <div className="mt-0.5 font-medium">
                      {f.baggage?.handKg != null
                        ? `${f.baggage.handKg}kg cabin`
                        : "Cabin: airline"}
                      <br />
                      {f.baggage?.checkKg != null
                        ? `${f.baggage.checkKg}kg check-in`
                        : "Check-in: airline"}
                    </div>
                  </div>
                  <div className="rounded-md bg-gray-50 p-2">
                    <div className="text-[11px] text-gray-500">Seat</div>
                    <div className="mt-0.5 font-medium">
                      {f.seat || "Seat selection (paid)"}
                    </div>
                  </div>
                </div>
                <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 border-l border-t border-gray-200 bg-white" />
              </div>
            </span>

            {/* fare chip */}
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 border ${chipNeutral}`}
            >
              {display}
            </span>

            <span className="truncate text-[12px] text-gray-700">
              {f.cabin || "Economy"}
              {f.meal ? `, ${f.meal}` : ""},{" "}
              <span className={`${refundableTone} font-medium`}>
                {f.refundable}
              </span>
            </span>
          </div>
        </div>
      </label>
    );
  };

  return (
    <div className="w-[28rem] max-w-[90vw] overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl">
      {fares.map((f, i) => row(f, i === fares.length - 1))}
    </div>
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
}: {
  r: Row;
  expanded: boolean;
  onToggle: () => void;
  selectedFare: FareOption | null;
  onSelectFare: (rowId: string, fare: FareOption) => void;
  paxConfig?: PaxConfig;
  showCommission: boolean;
}) {
  const nav = useNavigate();
  const [tab, setTab] = useState<DetailsTab>("itinerary");
  const [showFareMenu, setShowFareMenu] = useState(false);

  const minFareObj = useMemo(
    () =>
      r.fares.reduce((m, f) => (f.price < m.price ? f : m), r.fares[0]),
    [r.fares]
  );

  const [localFare, setLocalFare] = useState<FareOption>(
    selectedFare ?? minFareObj
  );

  useEffect(() => {
    setLocalFare(selectedFare ?? minFareObj);
  }, [selectedFare, minFareObj]);

  const effFare = localFare;

  // total pax
  const totalPax =
    (paxConfig?.adults ?? 1) +
    (paxConfig?.children ?? 0) +
    (paxConfig?.infants ?? 0);

  // agent details with fallback (fare → row)
  const agentNetDisplay =
    effFare.agentFareINR != null
      ? effFare.agentFareINR
      : r.agentFareUSD ?? undefined;

  const commissionDisplay =
    effFare.commissionINR != null
      ? effFare.commissionINR
      : r.commissionUSD ?? undefined;

  const onBook = () => {
    const f = effFare;

    const pricing = {
      currency: "INR" as const,
      total: f.price,
      perTraveller:
        totalPax > 0
          ? Math.round((f.price / totalPax) * 100) / 100
          : f.price,
      pax: {
        adults: paxConfig?.adults ?? totalPax,
        children: paxConfig?.children ?? 0,
        infants: paxConfig?.infants ?? 0,
      },
    };

    const selectedFlight = adaptRowToSelectedFlight(r, f);

    nav("/flights/passenger-details", {
      state: {
        selectedFlight,
        fare: f,
        row: r,
        pricing,
        paxConfig: pricing.pax,
      },
    });
  };

  const chooseFare = (f: FareOption) => {
    setLocalFare(f);
    onSelectFare(r.id, f);
    setShowFareMenu(false);
  };

  const effFareDisplay = `${effFare.label}`;

  return (
    <div className="border border-gray-200 bg-white p-3 rounded-2xl">
      {/* summary */}
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

        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-x-4">
          <div className="text-right">
            <div className="text-[13px] text-gray-700">
              <span className="text-[18px] font-bold text-gray-900">
                {r.departTime}
              </span>
            </div>
            <div className="text-[12px]">{r.fromCity}</div>
            <div className="text-[11px] text-gray-500">{r.departDate}</div>
          </div>

          <StraightTimeline
            label={r.stopLabel}
            durationMin={r.durationMin}
          />

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

        {/* Right: price + Book + commission */}
        <div className="ml-2 text-left sm:text-right">
          <span className="text-[12px] text-gray-600">Selected fare</span>
          <br />
          <div className="inline-flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotNeutral}`} />
            <span className="text-[18px] font-bold text-gray-900">
              <Money v={effFare.price} />
            </span>
          </div>
          {/* <div className="mt-1 text-[11px] text-gray-600">
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 border ${chipNeutral}`}
            >
              {effFareDisplay}
            </span>
          </div> */}

         

          <div className="mt-2">
            <button
              type="button"
              onClick={onBook}
              className="rounded-2xl bg-blue-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:opacity-95"
              title="Proceed to book"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      <hr className="my-2 border-t border-dashed border-gray-200" />

      {/* actions line */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-[12px]">
          <span
            className={`${
              r.refundable === "Refundable"
                ? "text-emerald-700"
                : "text-rose-700"
            } font-medium`}
          >
            {r.refundable}
          </span>
          {r.extras?.map((x) => (
            <span
              key={x}
              className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700"
            >
              {x}
            </span>
          ))}


           {showCommission &&
            (agentNetDisplay != null || commissionDisplay != null) && (
              <div className="mt-1 space-y-0.5 text-[11px] text-gray-700 px-3 py-1.5 bg-gray-50">
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
          <FareOneLine
            fare={effFare}
            placeholder="Select fare"
            onClick={() => setShowFareMenu((s) => !s)}
          />
          {showFareMenu && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-50">
              <FareListRows
                fares={r.fares}
                name={`fare-${r.id}`}
                selectedCode={effFare.code}
                onSelect={chooseFare}
              />
            </div>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 hover:bg-gray-50"
          >
            Details
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            >
              <path d="M7 10l5 5 5-5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* details card */}
      {expanded && (
        <div className="mt-2 rounded-xl border border-gray-200 p-3">
          <DetailsHeader
            airline={r.airline}
            logo={r.logo}
            flightNos={r.flightNos}
          />
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
  showCommission = false, // parent se control
}: {
  rows: Row[];
  selectedGlobal: { flightId: string; fare: FareOption } | null;
  onSelectFare: (rowId: string, fare: FareOption) => void;
  onEmpty?: React.ReactNode;
  paxConfig?: PaxConfig;
  showCommission?: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
        {onEmpty ?? "No results. Modify your search or adjust filters."}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <B2BRow
          key={r.id}
          r={r}
          expanded={expandedId === r.id}
          onToggle={() =>
            setExpandedId(expandedId === r.id ? null : r.id)
          }
          selectedFare={
            selectedGlobal?.flightId === r.id
              ? selectedGlobal.fare
              : null
          }
          onSelectFare={onSelectFare}
          paxConfig={paxConfig}
          showCommission={showCommission}
        />
      ))}
    </div>
  );
}
