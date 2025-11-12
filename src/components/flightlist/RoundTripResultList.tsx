// src/components/flightlist/RoundTripResultList.tsx
import React, { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

/* ===== Types (ROUNDTRIP-only) ===== */
export type FareRT = {
  code: string;
  label: string; // e.g. SAVER / FLEX
  price: number;
  refundable: "Refundable" | "Non Refundable";
  cabin: string; // Economy / Business
  meal: string;  // Free Meal / Paid Meal
  badge?: { text: string; tone: "published" | "offer" };
  baggage?: { handKg?: number; checkKg?: number };
  seat?: string;
};

export type RowRT = {
  id: string;
  airline: string;
  logo: string;
  flightNos: string;
  fromCity: string; fromIata: string;
  toCity: string;   toIata: string;
  departTime: string; departDate?: string; // "16 Nov, Sun"
  arriveTime: string; arriveDate?: string; // "16 Nov, Sun"
  stops: number; stopLabel?: string;       // "1 Stop BLR"
  durationMin: number;                     // 205 -> "3h 25m"
  totalFareINR: number;
  refundable: "Refundable" | "Non Refundable";
  extras?: string[];
  segments: any[];
  baggage?: { handKg?: number; checkKg?: number; piece?: string };
  cancellation?: any;
  fares: FareRT[];
};

type Selected = { flightId: string; fare: FareRT } | null;

type Props = {
  outboundRows: RowRT[];
  returnRows: RowRT[];

  selectedOutbound: Selected;
  selectedReturn: Selected;

  onSelectOutboundFare: (rowId: string, fare: FareRT) => void;
  onSelectReturnFare: (rowId: string, fare: FareRT) => void;

  onBookRoundTrip?: (sel: { outbound: Selected; ret: Selected }) => void;

  fromIata?: string; toIata?: string;
  departDate?: string; returnDate?: string;
  cabin?: string; pax?: number;

  emptyOutboundNode?: ReactNode;
  emptyReturnNode?: ReactNode;
};

/* ===== Small utils ===== */
const nfIN = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const Money = ({ v }: { v: number }) => <>{nfIN.format(isFinite(v) ? v : 0)}</>;
const hhmm = (min: number) => `${Math.floor(min / 60)}h ${min % 60}m`;

/* ===== Fare chip like screenshot ===== */
function FareChip({
  fare,
  active,
  onClick,
}: {
  fare: FareRT;
  active: boolean;
  onClick: () => void;
}) {
  const badgeClass =
    fare.badge?.tone === "published"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

  return (
    <button
      onClick={onClick}
      className={[
        "group w-full rounded-lg border px-3 py-2 text-left shadow-sm transition",
        active
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span className={["rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
          active ? "bg-white/10 text-white" : "bg-gray-100 text-gray-700"].join(" ")}>
          {fare.label}
        </span>

        {fare.badge && (
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${badgeClass}`}>
            {fare.badge.text}
          </span>
        )}
      </div>

      <div className="mt-1 text-lg font-semibold leading-tight">
        <Money v={fare.price} />
      </div>

      <div className={["mt-0.5 text-[12px]",
        active ? "text-white/80" : "text-gray-600"].join(" ")}>
        {fare.refundable} • {fare.cabin}
      </div>
    </button>
  );
}

/* ===== One leg card (matches your design) ===== */
function LegCard({
  row,
  selected,
  onPickFare,
}: {
  row: RowRT;
  selected: Selected;
  onPickFare: (fare: FareRT) => void;
}) {
  const isSelected = (f: FareRT) =>
    selected?.flightId === row.id && selected?.fare.code === f.code;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      {/* Top line: logo + airline + flightNo + times + stops */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={row.logo} alt={row.airline} className="h-8 w-8 rounded object-contain" />
          <div>
            <div className="text-[15px] font-semibold leading-tight">{row.airline}</div>
            <div className="text-xs text-gray-500">{row.flightNos}</div>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center gap-6 sm:flex">
          <div className="text-right">
            <div className="text-[18px] font-semibold leading-none">{row.departTime}</div>
            <div className="text-xs text-gray-500">{row.fromCity} ({row.fromIata})</div>
            {row.departDate && <div className="text-[11px] text-gray-400">{row.departDate}</div>}
          </div>

          <div className="text-center text-[12px] text-gray-600">
            <div className="font-medium">{hhmm(row.durationMin)}</div>
            <div>{row.stopLabel ?? (row.stops === 0 ? "Non-stop" : `${row.stops} Stop`)}</div>
          </div>

          <div>
            <div className="text-[18px] font-semibold leading-none">{row.arriveTime}</div>
            <div className="text-xs text-gray-500">{row.toCity} ({row.toIata})</div>
            {row.arriveDate && <div className="text-[11px] text-gray-400">{row.arriveDate}</div>}
          </div>
        </div>
      </div>

      {/* Fare chips row (two like screenshot). Stack on mobile. */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {row.fares.slice(0, 2).map((fare) => (
          <FareChip
            key={fare.code}
            fare={fare}
            active={isSelected(fare)}
            onClick={() => onPickFare(fare)}
          />
        ))}
      </div>

      {/* Baggage line */}
      <div className="mt-2 text-xs text-gray-500">
        Baggage: {row.baggage?.handKg ?? 0}kg hand • {row.baggage?.checkKg ?? 0}kg check-in
      </div>
    </div>
  );
}

/* ===== Section wrapper for a leg ===== */
function LegSection({
  title,
  rows,
  selected,
  onSelect,
  emptyNode,
}: {
  title: string;
  rows: RowRT[];
  selected: Selected;
  onSelect: (rowId: string, fare: FareRT) => void;
  emptyNode?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-gray-900">{title}</h2>
      </div>

      {!rows?.length ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-gray-600">
          {emptyNode ?? "No results for this leg."}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <LegCard
              key={r.id}
              row={r}
              selected={selected}
              onPickFare={(f) => onSelect(r.id, f)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== Main component ===== */
export default function RoundtripList({
  outboundRows = [],
  returnRows = [],
  selectedOutbound,
  selectedReturn,
  onSelectOutboundFare,
  onSelectReturnFare,
  onBookRoundTrip,
  fromIata,
  toIata,
  departDate,
  returnDate,
  cabin = "Economy",
  pax = 1,
  emptyOutboundNode,
  emptyReturnNode,
}: Props) {
  const navigate = useNavigate();

  const outPrice = useMemo(() => selectedOutbound?.fare.price ?? 0, [selectedOutbound]);
  const inPrice  = useMemo(() => selectedReturn?.fare.price ?? 0, [selectedReturn]);
  const total    = useMemo(() => outPrice + inPrice, [outPrice, inPrice]);
  const canBook  = Boolean(selectedOutbound && selectedReturn);

  const outHeader = useMemo(() => {
    if (!fromIata || !toIata || !departDate) return "Departure (Outbound)";
    return `Departure • ${fromIata} → ${toIata} (${departDate})`;
  }, [fromIata, toIata, departDate]);

  const inHeader = useMemo(() => {
    if (!fromIata || !toIata || !returnDate) return "Return (Inbound)";
    return `Return • ${toIata} → ${fromIata} (${returnDate})`;
  }, [fromIata, toIata, returnDate]);

  const handleBook = () => {
    if (!canBook) return;

    if (onBookRoundTrip) {
      onBookRoundTrip({ outbound: selectedOutbound, ret: selectedReturn });
      return;
    }

    const qs = new URLSearchParams({
      trip: "round",
      from: fromIata ?? "",
      to: toIata ?? "",
      date: departDate ?? "",
      ret: returnDate ?? "",
      cabin,
      pax: String(pax),
      out: selectedOutbound!.flightId,
      outFare: selectedOutbound!.fare.code,
      in: selectedReturn!.flightId,
      inFare: selectedReturn!.fare.code,
    }).toString();

    navigate(`/flights/round/checkout?${qs}`, {
      state: {
        selectedOutbound,
        selectedReturn,
        pax,
        cabin,
        fromIata,
        toIata,
        departDate,
        returnDate,
        totalINR: total,
      },
    });
  };

  return (
    <div className="relative">
      {/* Summary chips like your bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-gray-100 px-3 py-1">
          Outbound: {selectedOutbound ? <Money v={outPrice} /> : "— not selected —"}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1">
          Return: {selectedReturn ? <Money v={inPrice} /> : "— not selected —"}
        </span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
          Total: <Money v={total} />
        </span>
      </div>

      {/* Two side-by-side columns matching the screenshot */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-6">
          <LegSection
            title={outHeader}
            rows={outboundRows}
            selected={selectedOutbound}
            onSelect={onSelectOutboundFare}
            emptyNode={emptyOutboundNode}
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <LegSection
            title={inHeader}
            rows={returnRows}
            selected={selectedReturn}
            onSelect={onSelectReturnFare}
            emptyNode={emptyReturnNode}
          />
        </div>
      </div>

      {/* Sticky footer like your design */}
      <div className="sticky bottom-2 z-20 mt-4">
        <div className="mx-auto max-w-5xl rounded-xl border border-gray-200 bg-white/90 px-3 py-2 shadow backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded bg-gray-100 px-2 py-1">
                Out: {selectedOutbound ? <Money v={outPrice} /> : "—"}
              </span>
              <span className="rounded bg-gray-100 px-2 py-1">
                Return: {selectedReturn ? <Money v={inPrice} /> : "—"}
              </span>
              <span className="rounded bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                Total: <Money v={total} />
              </span>
            </div>
            <button
              onClick={handleBook}
              disabled={!canBook}
              title={canBook ? "Proceed to checkout" : "Select one outbound and one return fare"}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow
                ${canBook ? "bg-gray-900 hover:opacity-95" : "bg-gray-400 cursor-not-allowed opacity-60"}`}
            >
              Book Round Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
