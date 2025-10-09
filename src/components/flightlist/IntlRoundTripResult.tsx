import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Row, FareOption } from "./OnewayResult";

/** ======== small utils (local copy; same feel as ResultList) ======== */
const Money = ({ v, currency = "INR" as const, fractionDigits = 2 }:{
  v: number; currency?: "INR" | "USD"; fractionDigits?: number;
}) => (
  <>{new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency", currency, maximumFractionDigits: fractionDigits
  }).format(v)}</>
);

const minsToLabel = (m?: number) => {
  if (m == null) return "";
  const h = Math.floor(m / 60); const mm = m % 60;
  return `${h}h ${String(mm).padStart(2, "0")}m`;
};

/** ======== airline logo (image URL) ======== */
const AirlineLogo = ({ src, alt }: { src?: string; alt: string }) => (
  <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-black/5">
    {src ? (
      <img
        src={src}
        alt={alt}
        className="h-9 w-9 object-contain"
        loading="lazy"
      />
    ) : (
      <div className="grid h-9 w-9 place-items-center text-[10px] font-semibold text-gray-600">
        {alt?.slice(0,2)?.toUpperCase() ?? "AL"}
      </div>
    )}
  </div>
);

const TAKEOFF_ICON = "https://cdn-icons-png.flaticon.com/128/8943/8943898.png";
const LANDING_ICON = "https://cdn-icons-png.flaticon.com/128/6591/6591567.png";

const Arc = ({ label }: { label: string }) => (
  <div className="relative flex items-center justify-center">
    <svg width="220" height="40" viewBox="0 0 220 40" className="text-gray-300">
      <g transform="translate(16,26)"><image href={TAKEOFF_ICON} width="14" height="14" x="-7" y="-7" /></g>
      <g transform="translate(204,26)"><image href={LANDING_ICON} width="14" height="14" x="-7" y="-7" /></g>
      <path d="M16 26 Q110 6 204 26" stroke="currentColor" strokeDasharray="4 6" strokeWidth="2" fill="none" />
      <circle cx="110" cy="14" r="5" fill="white" stroke="currentColor" strokeWidth="1.5" />
    </svg>
    <div className="absolute -top-0 text-[11px] font-medium text-gray-600">{label}</div>
  </div>
);

/** ======== local fare picker (compact) ======== */
function FarePicker({
  fares, selected, onSelect, name,
}:{
  fares: FareOption[]; selected: FareOption | null;
  onSelect: (f: FareOption) => void; name: string;
}) {
  const [open, setOpen] = useState(false);
  const badgeTone = selected?.badge?.tone === "offer"
    ? "bg-pink-50 text-pink-700 ring-pink-200"
    : "bg-amber-50 text-amber-800 ring-amber-200";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex max-w-full items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-left text-[12px] hover:bg-gray-50"
        title="Change fare"
      >
        <span className={`h-3.5 w-3.5 rounded-full border ${selected ? "border-gray-800" : "border-gray-400"} grid place-items-center`}>
          {selected && <span className="h-2 w-2 rounded-full bg-gray-800" />}
        </span>
        {selected
          ? (
            <div className="flex min-w-0 items-center gap-2">
              {selected.refNo != null && <span className="text-[10px] text-gray-500 -translate-y-[2px]">{selected.refNo}</span>}
              <span className="whitespace-nowrap text-[14px] font-bold text-gray-900"><Money v={selected.price} /></span>
              {selected.badge?.text && (<span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${badgeTone}`}>{selected.badge.text}</span>)}
              <span className="truncate text-[12px] text-gray-700">
                {(selected.cabin || "Economy")}{selected.meal ? `, ${selected.meal}` : ""},{" "}
                <span className={selected.refundable === "Refundable" ? "text-emerald-700 font-medium" : "text-rose-700 font-medium"}>{selected.refundable}</span>
              </span>
            </div>
          )
          : <span className="text-[12px] text-gray-600">Select fare</span>}
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500"><path d="M7 10l5 5 5-5" fill="currentColor" /></svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[28rem] max-w-[90vw] overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl">
          {fares.map((f, i) => {
            const badgeToneRow = f.badge?.tone === "offer" ? "bg-pink-50 text-pink-700 ring-pink-200" : "bg-amber-50 text-amber-800 ring-amber-200";
            const refundableTone = f.refundable === "Refundable" ? "text-emerald-700" : "text-rose-700";
            return (
              <label key={f.code} className={`grid cursor-pointer grid-cols-[18px_1fr] items-center gap-2 px-2 py-2 ${i < fares.length - 1 ? "border-b border-gray-100" : ""}`}>
                <input
                  type="radio"
                  name={name}
                  value={f.code}
                  checked={selected?.code === f.code}
                  onChange={() => { onSelect(f); setOpen(false); }}
                  className="h-3.5 w-3.5 accent-gray-800"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {f.refNo != null && <span className="text-[10px] text-gray-500 -translate-y-[2px]">{f.refNo}</span>}
                    <span className="text-[15px] font-semibold text-gray-900"><Money v={f.price} /></span>
                    {f.badge?.text && <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${badgeToneRow}`}>{f.badge.text}</span>}
                    <span className="truncate text-[12px] text-gray-700">
                      {(f.cabin || "Economy")}{f.meal ? `, ${f.meal}` : ""},{" "}
                      <span className={`${refundableTone} font-medium`}>{f.refundable}</span>
                    </span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** ======== types & helpers ======== */
type Combo = {
  id: string;
  out: Row;
  back: Row;
  outMin: number;
  backMin: number;
  total: number;
};

const minFare = (r: Row) => Math.min(...r.fares.map(f => f.price));

/** ======== MAIN: IntlRoundTripResult ======== */
type Props = {
  /** use these prop names (NOT goRows/backRows) */
  outbound: Row[];
  inbound: Row[];
};

export default function IntlRoundTripResult({ outbound, inbound }: Props) {
  const nav = useNavigate();

  const combos: Combo[] = useMemo(() => {
    const arr: Combo[] = [];
    outbound.forEach(o => {
      inbound.forEach(i => {
        const outMin = minFare(o);
        const backMin = minFare(i);
        arr.push({
          id: `${o.id}__${i.id}`,
          out: o,
          back: i,
          outMin,
          backMin,
          total: outMin + backMin,
        });
      });
    });
    return arr.sort((a, b) => a.total - b.total);
  }, [outbound, inbound]);

  const [selectedFareOut, setSelectedFareOut] = useState<Record<string, FareOption | null>>({});
  const [selectedFareBack, setSelectedFareBack] = useState<Record<string, FareOption | null>>({});

  const bookCombo = (c: Combo) => {
    const sOut = selectedFareOut[c.id] ?? c.out.fares.find(f => f.price === c.outMin)!;
    const sBack = selectedFareBack[c.id] ?? c.back.fares.find(f => f.price === c.backMin)!;

    const qs = new URLSearchParams({
      out: c.out.id,
      in: c.back.id,
      outFare: sOut.code,
      inFare: sBack.code,
    }).toString();

    nav(`/flights/itinerary?${qs}`, {
      state: {
        itineraryType: "international-roundtrip",
        outRow: c.out, inRow: c.back,
        selectedOut: sOut, selectedIn: sBack,
        totalINR: (sOut?.price ?? c.outMin) + (sBack?.price ?? c.backMin),
      }
    });
  };

  if (!outbound?.length || !inbound?.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
        {(!outbound?.length && !inbound?.length) && "No international flights found for both directions."}
        {!!outbound?.length && !inbound?.length && "Inbound (return) flights not found for selected date/route."}
        {!outbound?.length && !!inbound?.length && "Outbound flights not found for selected date/route."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {combos.map((c) => {
        const selOut = selectedFareOut[c.id] ?? null;
        const selIn  = selectedFareBack[c.id] ?? null;
        const totalNow = (selOut?.price ?? c.outMin) + (selIn?.price ?? c.backMin);

        return (
          <div key={c.id} className="rounded-2xl border border-gray-200 bg-white p-3">
            {/* header: total */}
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[15px] font-semibold text-gray-900">
                Total (2 flights): <span className="text-[17px]"><Money v={totalNow} /></span>
                <span className="ml-2 text-[12px] text-gray-600">per passenger</span>
              </div>
              <button
                onClick={() => bookCombo(c)}
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white shadow hover:opacity-95"
              >
                Book Round Trip
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {/* OUTBOUND */}
              <div className="rounded-xl border border-gray-200 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <AirlineLogo src={c.out.logo} alt={c.out.airline} />
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold text-gray-900">{c.out.airline}</div>
                    <div className="truncate text-xs text-gray-600">
                      {c.out.fromCity} ({c.out.fromIata}) → {c.out.toCity} ({c.out.toIata})
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-x-4">
                  <div className="text-right">
                    <div className="text-[13px] text-gray-700">
                      {c.out.fromCity} ({c.out.fromIata}) <span className="font-semibold text-gray-900">{c.out.departTime}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">{c.out.departDate}</div>
                  </div>
                  <Arc label={c.out.stopLabel} />
                  <div className="text-left">
                    <div className="text-[13px] text-gray-700">
                      {c.out.toCity} ({c.out.toIata}) <span className="font-semibold text-gray-900">{c.out.arriveTime}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">{c.out.arriveDate}</div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-[12px] text-gray-600">
                    Duration: <span className="font-medium text-gray-800">{minsToLabel(c.out.durationMin)}</span>
                  </div>
                  <div className="text-[13px] font-semibold text-gray-900">
                    From <Money v={c.outMin} />
                  </div>
                </div>

                <div className="mt-2">
                  <FarePicker
                    fares={c.out.fares}
                    selected={selOut}
                    onSelect={(f) => setSelectedFareOut(prev => ({ ...prev, [c.id]: f }))}
                    name={`${c.id}-out`}
                  />
                </div>
              </div>

              {/* INBOUND */}
              <div className="rounded-xl border border-gray-200 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <AirlineLogo src={c.back.logo} alt={c.back.airline} />
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold text-gray-900">{c.back.airline}</div>
                    <div className="truncate text-xs text-gray-600">
                      {c.back.fromCity} ({c.back.fromIata}) → {c.back.toCity} ({c.back.toIata})
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-x-4">
                  <div className="text-right">
                    <div className="text-[13px] text-gray-700">
                      {c.back.fromCity} ({c.back.fromIata}) <span className="font-semibold text-gray-900">{c.back.departTime}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">{c.back.departDate}</div>
                  </div>
                  <Arc label={c.back.stopLabel} />
                  <div className="text-left">
                    <div className="text-[13px] text-gray-700">
                      {c.back.toCity} ({c.back.toIata}) <span className="font-semibold text-gray-900">{c.back.arriveTime}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">{c.back.arriveDate}</div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-[12px] text-gray-600">
                    Duration: <span className="font-medium text-gray-800">{minsToLabel(c.back.durationMin)}</span>
                  </div>
                  <div className="text-[13px] font-semibold text-gray-900">
                    From <Money v={c.backMin} />
                  </div>
                </div>

                <div className="mt-2">
                  <FarePicker
                    fares={c.back.fares}
                    selected={selIn}
                    onSelect={(f) => setSelectedFareBack(prev => ({ ...prev, [c.id]: f }))}
                    name={`${c.id}-back`}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {combos.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
          No round-trip combinations found.
        </div>
      )}
    </div>
  );
}
