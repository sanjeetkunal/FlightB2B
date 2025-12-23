// src/components/flightlist/SpecialRoundTripResult.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ========= Types borrowed from oneway style ========= */

export type FareOption = {
  code: string;
  label: string;
  price: number; // INR (selling price)
  refundable: "Refundable" | "Non Refundable" | "Non-Refundable";
  cabin?: string;
  meal?: string;
  badge?: { text: string; tone?: "offer" | "published" };
  refNo?: number;
  baggage?: { handKg?: number; checkKg?: number };
  seat?: string;
  commissionINR?: number; // agent commission
  agentFareINR?: number; // agent net fare (if given separately)
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

export type PaxConfig = {
  adults: number;
  children: number;
  infants: number;
};

/* === Round-trip row: 2 legs in one row === */

export type LegSummary = {
  fromCity: string;
  fromIata: string;
  departTime: string;
  departDate: string;
  toCity: string;
  toIata: string;
  arriveTime: string;
  arriveDate: string;
  stopLabel: string;
  durationMin: number;
  segments: Segment[];
  baggage: { handKg?: number; checkKg?: number; piece?: string };
};

export type SpecialRTRow = {
  id: string;
  airline: string;
  logo: string;
  refundable: "Refundable" | "Non-Refundable";
  extras?: string[];

  totalFareINR: number; // RT combo price

  outbound: LegSummary;
  inbound: LegSummary;

  cancellation: {
    refund: PolicyRule[];
    change: PolicyRule[];
    noShowUSD?: number;
  };

  fares: FareOption[];
};

/* ==== Payload passenger-details page ke liye ==== */

export type SelectedIntlRTFlightPayload = {
  id: string;
  airline: string;
  logo: string;
  refundable: "Refundable" | "Non-Refundable";
  cabin: string;
  outbound: {
    fromCity: string;
    fromIata: string;
    toCity: string;
    toIata: string;
    departTime: string;
    arriveTime: string;
    departDate: string;
    arriveDate: string;
    segments: Segment[];
    baggage: LegSummary["baggage"];
  };
  inbound: {
    fromCity: string;
    fromIata: string;
    toCity: string;
    toIata: string;
    departTime: string;
    arriveTime: string;
    departDate: string;
    arriveDate: string;
    segments: Segment[];
    baggage: LegSummary["baggage"];
  };
};

export function adaptIntlRowToSelectedFlight(
  r: SpecialRTRow,
  f: FareOption
): SelectedIntlRTFlightPayload {
  return {
    id: r.id,
    airline: r.airline,
    logo: r.logo,
    refundable: r.refundable,
    cabin: f.cabin ?? "Economy",
    outbound: {
      fromCity: r.outbound.fromCity,
      fromIata: r.outbound.fromIata,
      toCity: r.outbound.toCity,
      toIata: r.outbound.toIata,
      departTime: r.outbound.departTime,
      arriveTime: r.outbound.arriveTime,
      departDate: r.outbound.departDate,
      arriveDate: r.outbound.arriveDate,
      segments: r.outbound.segments,
      baggage: r.outbound.baggage,
    },
    inbound: {
      fromCity: r.inbound.fromCity,
      fromIata: r.inbound.fromIata,
      toCity: r.inbound.toCity,
      toIata: r.inbound.toIata,
      departTime: r.inbound.departTime,
      arriveTime: r.inbound.arriveTime,
      departDate: r.inbound.departDate,
      arriveDate: r.inbound.arriveDate,
      segments: r.inbound.segments,
      baggage: r.inbound.baggage,
    },
  };
}

/* ========= Small utils ========= */

const Money = ({
  v,
  currency = "INR" as const,
  fractionDigits = 2,
}: {
  v: number;
  currency?: "INR" | "USD";
  fractionDigits?: number;
}) => (
  <>
    {new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
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

const chipNeutral = "bg-slate-100 text-slate-800 ring-slate-300 border-slate-200";
const dotNeutral = "bg-gray-400";

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
    <div className="absolute -top-3 whitespace-nowrap text-[11px] font-medium text-gray-600">{label}</div>
    <div className="absolute -bottom-3 whitespace-nowrap text-[11px] font-medium text-gray-700">
      {minsToLabel(durationMin)}
    </div>
    <svg width="260" height="28" viewBox="0 0 260 28" className="text-gray-300">
      <image href={leftIcon} width="16" height="16" x="8" y="6" />
      <line x1="24" y1="14" x2="236" y2="14" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
      <circle cx="130" cy="14" r="5" fill="white" stroke="currentColor" strokeWidth="1.5" />
      <image href={rightIcon} width="16" height="16" x="236" y="6" />
    </svg>
  </div>
);

/* ========= Details atoms (similar to oneway) ========= */

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
  bag,
}: {
  s: Segment;
  logo: string;
  airline: string;
  bag: { handKg?: number; checkKg?: number; piece?: string };
}) {
  const dur = minsToLabel(s.durationMin);
  const piece = bag.piece || "1 piece only";
  const hand = bag.handKg ?? 0;
  const check = bag.checkKg ?? 0;

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
          <div className="text-lg font-semibold text-gray-900">{s.departTime}</div>
          <div className="text-xs text-gray-500">{s.departDate}</div>
          <div className="mt-1 text-sm text-gray-700">
            {s.fromCity}, {s.fromIata}
          </div>
          {s.fromTerminal && <div className="text-xs text-gray-500">Terminal {s.fromTerminal}</div>}
        </div>

        <div className="mx-1 grid place-items-center">
          <div className="text-[12px] font-medium text-gray-700">{dur.replace("h", "h ").replace("m", " m")}</div>
          <div className="mt-1 h-1.5 w-14 rounded bg-gray-200">
            <div className="h-1.5 w-2/3 rounded bg-emerald-500" />
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold text-gray-900">{s.arriveTime}</div>
          <div className="text-xs text-gray-500">{s.arriveDate}</div>
          <div className="mt-1 text-sm text-gray-700">
            {s.toCity}, {s.toIata}
          </div>
          {s.toTerminal && <div className="text-xs text-gray-500">Terminal {s.toTerminal}</div>}
        </div>

        <div className="hidden text-right md:block">
          <div className="text-[11px] font-semibold text-gray-600">BAGGAGE :</div>
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
          <AmenIconDrink /> {s.beverage !== false ? "Beverage Available" : "No Beverage"}
        </div>
        <div className="flex items-center gap-2">
          <AmenIconSeat /> {s.seatType || "Standard Recliner"} ({s.legroomInch ?? 28}" Legroom)
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

function ItineraryLeg({
  title,
  leg,
  logo,
  airline,
}: {
  title: string;
  leg: LegSummary;
  logo: string;
  airline: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-gray-500 uppercase">{title}</div>
      {leg.segments.map((s, i) => (
        <div key={i}>
          <SegmentCard s={s} logo={logo} airline={airline} bag={leg.baggage} />
          {s.layoverAt && s.layoverMin != null && (
            <LayoverBadge text={`Change of planes • ${minsToLabel(s.layoverMin)} Layover in ${s.layoverAt}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function BaggagePanelRT({ outbound, inbound }: { outbound: LegSummary; inbound: LegSummary }) {
  const render = (title: string, b: LegSummary["baggage"]) => (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">{title}</div>
      <div className="grid grid-cols-3 bg-gray-50 text-[11px] font-semibold text-gray-700 border-t border-gray-200">
        <div className="border-r border-gray-200 p-2">Cabin</div>
        <div className="border-r border-gray-200 p-2">Check-in</div>
        <div className="p-2">Policy</div>
      </div>
      <div className="grid grid-cols-3 text-sm">
        <div className="border-r border-gray-200 p-3">{b.handKg ?? 0} kg</div>
        <div className="border-r border-gray-200 p-3">{b.checkKg ?? 0} kg</div>
        <div className="p-3">{b.piece || "As per airline allowance"}</div>
      </div>
    </div>
  );

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {render("Departure leg", outbound.baggage)}
      {render("Return leg", inbound.baggage)}
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

type DetailsTab = "itinerary" | "fare" | "cancellation" | "baggage";

function RowTabs({ active, onChange }: { active: DetailsTab; onChange: (t: DetailsTab) => void }) {
  const tabs: { id: DetailsTab; label: string }[] = [
    { id: "itinerary", label: "FLIGHT DETAILS" },
    { id: "fare", label: "FARE SUMMARY" },
    { id: "cancellation", label: "CANCELLATION" },
    { id: "baggage", label: "BAGGAGE" },
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
            active === t.id ? "bg-blue-500 text-white" : "bg-white text-gray-800 hover:bg-gray-50",
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

function SelectedFarePanelRT({ fare, showCommission }: { fare: FareOption; showCommission: boolean }) {
  const refundableTone = fare.refundable === "Refundable" ? "text-emerald-700" : "text-rose-700";

  const commission =
    fare.commissionINR ?? (fare.agentFareINR != null ? fare.price - fare.agentFareINR : undefined);

  const agentNet = fare.agentFareINR ?? (commission != null ? fare.price - commission : undefined);

  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="text-[13px] text-gray-600">Selected RT Fare</div>
        <div className="text-[18px] font-bold text-gray-900">
          <Money v={fare.price} />
        </div>
        <span className={`text-[12px] ${refundableTone} font-medium`}>{fare.refundable}</span>
      </div>
      <div className="text-[12px] text-gray-700">
        {fare.label || "—"}
        {fare.cabin ? ` • ${fare.cabin}` : ""}
        {fare.meal ? `, ${fare.meal}` : ""}
      </div>

      {showCommission && (
        <div className="mt-3 rounded-lg bg-emerald-50 p-2 text-[12px] text-emerald-800 border border-emerald-200">
          {agentNet != null && commission != null ? (
            <>
              Agent Net: <span className="font-semibold"><Money v={agentNet} /></span>
              {" • "}
              Commission: <span className="font-semibold"><Money v={commission} /></span>
            </>
          ) : (
            <>Commission info not available</>
          )}
        </div>
      )}
    </div>
  );
}

/* =============== Fare picker (same UX as oneway) =============== */

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
          <span className={`truncate rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 border ${chipNeutral}`}>
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
    const refundableTone = f.refundable === "Refundable" ? "text-emerald-700" : "text-rose-700";
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
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 border ${chipNeutral}`}>
              {display}
            </span>
            <span className="truncate text-[12px] text-gray-700">
              {f.cabin || "Economy"}
              {f.meal ? `, ${f.meal}` : ""},{" "}
              <span className={`${refundableTone} font-medium`}>{f.refundable}</span>
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

/* ================= SHARE HELPERS (Icons: WhatsApp + Email + Copy) ================= */

function buildShareTextRT(rows: SpecialRTRow[], fareByRowId: Map<string, FareOption>) {
  const nfIN = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const lines: string[] = [];
  lines.push("✈️ Special Round Trip Options");

  rows.forEach((r, idx) => {
    const f = fareByRowId.get(r.id);

    lines.push("");
    lines.push(`${idx + 1}) ${r.airline}`);
    lines.push(`Outbound: ${r.outbound.fromIata} → ${r.outbound.toIata}`);
    lines.push(`Time: ${r.outbound.departTime} - ${r.outbound.arriveTime} | ${r.outbound.stopLabel}`);
    if (r.outbound.departDate) lines.push(`Date: ${r.outbound.departDate}`);

    lines.push(`Return: ${r.inbound.fromIata} → ${r.inbound.toIata}`);
    lines.push(`Time: ${r.inbound.departTime} - ${r.inbound.arriveTime} | ${r.inbound.stopLabel}`);
    if (r.inbound.departDate) lines.push(`Date: ${r.inbound.departDate}`);

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

/* simple icon buttons */
function IconBtn({
  title,
  onClick,
  children,
  className = "",
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "h-9 w-9 grid place-items-center rounded-full border border-gray-300 bg-white hover:bg-gray-50",
        className,
      ].join(" ")}
      aria-label={title}
    >
      {children}
    </button>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.16 6.42 2.16 11.88c0 1.92.5 3.79 1.46 5.43L2 22l4.82-1.58c1.58.86 3.35 1.31 5.22 1.31 5.46 0 9.88-4.42 9.88-9.88C21.92 6.42 17.5 2 12.04 2zm5.76 14.3c-.24.68-1.18 1.28-1.92 1.44-.5.1-1.14.18-1.86-.06-.44-.14-1.02-.34-1.76-.66-3.08-1.34-5.08-4.44-5.24-4.64-.16-.22-1.24-1.66-1.24-3.16 0-1.5.78-2.24 1.06-2.54.28-.3.6-.38.8-.38.2 0 .4 0 .58.02.18.02.42-.08.66.5.24.58.82 2.02.9 2.16.08.14.12.32.04.5-.08.18-.12.32-.26.5-.14.18-.3.4-.42.54-.14.16-.28.34-.12.64.16.3.7 1.16 1.5 1.88 1.04.92 1.92 1.2 2.22 1.34.3.14.48.12.66-.08.18-.2.76-.88.96-1.18.2-.3.4-.24.68-.14.28.1 1.76.82 2.06.98.3.16.5.24.58.36.08.12.08.7-.16 1.38z"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm4 4H8c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 18H8V7h12v16z"
      />
    </svg>
  );
}

/* =============== SINGLE INTL RT ROW =============== */

function IntlB2BRow({
  r,
  expanded,
  onToggle,
  selectedFare,
  onSelectFare,
  paxConfig,
  showCommission,

  // ✅ Share props
  shareMode,
  selectedIds,
  onToggleSelect,
}: {
  r: SpecialRTRow;
  expanded: boolean;
  onToggle: () => void;
  selectedFare: FareOption | null;
  onSelectFare: (rowId: string, fare: FareOption) => void;
  paxConfig?: PaxConfig;
  showCommission: boolean;

  shareMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (rowId: string) => void;
}) {
  const nav = useNavigate();
  const [tab, setTab] = useState<DetailsTab>("itinerary");
  const [showFareMenu, setShowFareMenu] = useState(false);

  const minFareObj = useMemo(
    () => r.fares.reduce((m, f) => (f.price < m.price ? f : m), r.fares[0]),
    [r.fares]
  );

  const [localFare, setLocalFare] = useState<FareOption>(selectedFare ?? minFareObj);

  React.useEffect(() => {
    setLocalFare(selectedFare ?? minFareObj);
  }, [selectedFare, minFareObj]);

  const effFare = localFare;

  const totalPax = (paxConfig?.adults ?? 1) + (paxConfig?.children ?? 0) + (paxConfig?.infants ?? 0);

  const onBook = () => {
    const f = effFare;

    const pricing = {
      currency: "INR" as const,
      total: f.price,
      perTraveller: totalPax > 0 ? Math.round((f.price / totalPax) * 100) / 100 : f.price,
      pax: {
        adults: paxConfig?.adults ?? totalPax,
        children: paxConfig?.children ?? 0,
        infants: paxConfig?.infants ?? 0,
      },
    };

    const selectedFlight = adaptIntlRowToSelectedFlight(r, f);

    nav("/flights/passenger-details", {
      state: {
        tripType: "intl-rt",
        selectedFlightRT: selectedFlight,
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

  const commission =
    effFare.commissionINR ?? (effFare.agentFareINR != null ? effFare.price - effFare.agentFareINR : undefined);

  const agentNet = effFare.agentFareINR ?? (commission != null ? effFare.price - commission : undefined);

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
            selectedIds.has(r.id) ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-white text-gray-300",
          ].join(" ")}
          aria-label="Select to share"
          title="Select to share"
        >
          ✓
        </button>
      )}

      {/* ===== SUMMARY (Outbound + Return) ===== */}
      <div className="flex gap-3">
        <div className="border-r border-gray-200">
          {/* OUTBOUND ROW */}
          <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3 mt-3">
            <div className="flex items-center gap-2">
              <ImageLogo src={r.logo} alt={r.airline} />
              <div className="min-w-0">
                <div className="truncate text-[16px] font-semibold text-gray-900">{r.airline}</div>
                <div className="text-[11px] text-gray-500">Special Intl RT B2B Fare</div>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-x-4">
              <div className="text-right">
                <div className="text-[13px] text-gray-700">
                  <span className="text-[18px] font-bold text-gray-900">{r.outbound.departTime}</span>
                </div>
                <div className="text-[12px]">{r.outbound.fromCity}</div>
                <div className="text-[11px] text-gray-500">{r.outbound.departDate}</div>
              </div>

              <StraightTimeline label={r.outbound.stopLabel} durationMin={r.outbound.durationMin} />

              <div className="text-left">
                <div className="text-[13px] text-gray-700">
                  <span className="text-[18px] font-bold text-gray-900">{r.outbound.arriveTime}</span>
                </div>
                <div className="text-[12px]">{r.outbound.toCity}</div>
                <div className="text-[11px] text-gray-500">{r.outbound.arriveDate}</div>
              </div>
            </div>
          </div>

          <div className="my-2 border-t border-gray-200" />

          {/* RETURN ROW */}
          <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3 mt-3">
            <div className="flex items-center gap-2">
              <ImageLogo src={r.logo} alt={r.airline} />
              <div className="min-w-0">
                <div className="truncate text-[16px] font-semibold text-gray-900">{r.airline}</div>
                <div className="text-[11px] text-gray-500">Special Intl RT B2B Fare</div>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-x-4">
              <div className="text-right">
                <div className="text-[13px] text-gray-700">
                  <span className="text-[18px] font-bold text-gray-900">{r.inbound.departTime}</span>
                </div>
                <div className="text-[12px]">
                  {r.inbound.fromCity}
                  <div className="text-[11px] text-gray-500">{r.inbound.fromIata}</div>
                </div>
              </div>

              <StraightTimeline label={r.inbound.stopLabel} durationMin={r.inbound.durationMin} />

              <div className="text-left">
                <div className="text-[13px] text-gray-700">
                  <span className="text-[18px] font-bold text-gray-900">{r.inbound.arriveTime}</span>
                </div>
                <div className="text-[12px]">
                  {r.inbound.toCity}
                  <div className="text-[11px] text-gray-500">{r.inbound.toIata}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: RT Fare Option dropdown + Commission */}
        <div className="ml-2 text-left sm:text-right">
          <div className="text-[12px] text-gray-600">RT Fare Option</div>

          <div className="relative mt-1 inline-flex justify-end">
            <FareOneLine fare={effFare} placeholder="Select RT fare" onClick={() => setShowFareMenu((s) => !s)} />
            {showFareMenu && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-50">
                <FareListRows
                  fares={r.fares}
                  name={`rtfare-${r.id}`}
                  selectedCode={effFare.code}
                  onSelect={chooseFare}
                />
              </div>
            )}
          </div>

          {showCommission && (
            <div className="mt-1 text-[11px] text-emerald-700">
              {agentNet != null && commission != null ? (
                <>
                  Agent Net: <span className="font-semibold"><Money v={agentNet} /></span>
                  {" • "}
                  Comm: <span className="font-semibold"><Money v={commission} /></span>
                </>
              ) : (
                <>Commission not available</>
              )}
            </div>
          )}
        </div>
      </div>

      <hr className="my-2 border-t border-dashed border-gray-200" />

      {/* ===== BOTTOM BAR (Selected fare + Details + Book) ===== */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-[12px]">
          <span className={`${r.refundable === "Refundable" ? "text-emerald-700" : "text-rose-700"} font-medium`}>
            {r.refundable}
          </span>

          {r.extras?.map((x) => (
            <span key={x} className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">
              {x}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
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

          <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotNeutral}`} />
            <span className="text-[16px] font-bold text-gray-900">
              <Money v={effFare.price} />
            </span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 border ${chipNeutral}`}>
              {effFare.label}
            </span>
          </div>

          <button
            type="button"
            onClick={onBook}
            className="rounded-sm bg-blue-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:opacity-95"
            title="Proceed to book"
          >
            Book RT Fare
          </button>
        </div>
      </div>

      {/* details card */}
      {expanded && (
        <div className="mt-2 rounded-xl border border-gray-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageLogo src={r.logo} alt={r.airline} />
              <div>
                <div className="text-[15px] font-semibold text-gray-900">{r.airline}</div>
                <div className="text-[11px] text-gray-500">Intl round-trip itinerary</div>
              </div>
            </div>
            <RowTabs active={tab} onChange={setTab} />
          </div>

          {tab === "itinerary" && (
            <div className="space-y-4">
              <ItineraryLeg title="Departure flight" leg={r.outbound} logo={r.logo} airline={r.airline} />
              <div className="border-t border-dashed border-gray-200" />
              <ItineraryLeg title="Return flight" leg={r.inbound} logo={r.logo} airline={r.airline} />
            </div>
          )}
          {tab === "baggage" && <BaggagePanelRT outbound={r.outbound} inbound={r.inbound} />}
          {tab === "cancellation" && (
            <CancellationPanel refund={r.cancellation.refund} change={r.cancellation.change} noShowUSD={r.cancellation.noShowUSD} />
          )}
          {tab === "fare" && <SelectedFarePanelRT fare={effFare} showCommission={showCommission} />}
        </div>
      )}
    </div>
  );
}

/* =============== LIST WRAPPER (showCommission parent se aayega) =============== */

export default function SpecialRoundTripResult({
  rows,
  selectedGlobal,
  onSelectFare,
  onEmpty,
  paxConfig,
  showCommission = false,
}: {
  rows: SpecialRTRow[];
  selectedGlobal: { flightId: string; fare: FareOption } | null;
  onSelectFare: (rowId: string, fare: FareOption) => void;
  onEmpty?: React.ReactNode;
  paxConfig?: PaxConfig;
  showCommission?: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ✅ Share state (icons)
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

  const selectedRows = useMemo(() => rows.filter((r) => selectedIds.has(r.id)), [rows, selectedIds]);

  // choose fare per row for share:
  // - if global selection matches row, use it
  // - else min fare in that row
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
    return buildShareTextRT(selectedRows, fareByRowId);
  }, [selectedRows, fareByRowId]);

  const canShareNow = shareMode && selectedRows.length > 0;

  const onShareWhatsApp = () => {
    if (!shareText) return;
    openWhatsAppShare(shareText);
  };

  const onShareEmail = () => {
    if (!shareText) return;
    openEmailShare("Special Round Trip Options", shareText);
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
        {onEmpty ?? "No international round-trip results. Modify search or filters."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ✅ Share top bar (icons, no dropdown) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
        <div className="text-sm font-semibold text-gray-900">Special Round Trip Results</div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShareMode((s) => !s);
              clearSelection();
            }}
            className={[
              "rounded-lg border px-3 py-1.5 text-xs font-semibold",
              shareMode ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
            ].join(" ")}
          >
            {shareMode ? "Exit Share Mode" : "Share"}
          </button>

          {shareMode && (
            <>
              <div className="text-xs text-gray-600">
                Selected: <span className="font-semibold">{selectedRows.length}</span>
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

              {/* ✅ show icons only when at least 1 selected */}
              {canShareNow && (
                <div className="ml-1 flex items-center gap-2">
                  <IconBtn title="Share via WhatsApp" onClick={onShareWhatsApp} className="text-emerald-700">
                    <WhatsAppIcon />
                  </IconBtn>
                  <IconBtn title="Share via Email" onClick={onShareEmail} className="text-blue-700">
                    <EmailIcon />
                  </IconBtn>
                  <IconBtn title={copied ? "Copied!" : "Copy"} onClick={onCopy} className={copied ? "text-emerald-700" : "text-gray-800"}>
                    <CopyIcon />
                  </IconBtn>
                  {copied && <span className="text-xs font-semibold text-emerald-700">Copied!</span>}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {rows.map((r) => (
        <IntlB2BRow
          key={r.id}
          r={r}
          expanded={expandedId === r.id}
          onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
          selectedFare={selectedGlobal?.flightId === r.id ? selectedGlobal.fare : null}
          onSelectFare={onSelectFare}
          paxConfig={paxConfig}
          showCommission={showCommission}
          shareMode={shareMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />
      ))}
    </div>
  );
}
