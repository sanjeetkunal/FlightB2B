// src/components/flightlist/RoundTripResultList.tsx
import React, { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

/* ===== Types (ROUNDTRIP-only) ===== */
export type FareRT = {
  code: string;
  label: string; // e.g. SAVER / FLEX
  price: number;
  refundable: "Refundable" | "Non Refundable";
  cabin: string; // Economy / Business
  meal: string; // Free Meal / Paid Meal
  badge?: { text: string; tone: "published" | "offer" };
  baggage?: { handKg?: number; checkKg?: number };
  seat?: string;

  // agent side (fare-level)
  commissionINR?: number;
  agentFareINR?: number;
};

export type RowRT = {
  id: string;
  airline: string;
  logo: string;
  flightNos: string;
  fromCity: string;
  fromIata: string;
  toCity: string;
  toIata: string;
  departTime: string;
  departDate?: string; // "16 Nov, Sun"
  arriveTime: string;
  arriveDate?: string; // "16 Nov, Sun"
  stops: number;
  stopLabel?: string; // "1 Stop BLR"
  durationMin: number; // 205 -> "3h 25m"
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

  fromIata?: string;
  toIata?: string;
  departDate?: string;
  returnDate?: string;
  cabin?: string;
  pax?: number;

  emptyOutboundNode?: ReactNode;
  emptyReturnNode?: ReactNode;

  /** control from page header (Agent Commission toggle) */
  showCommission?: boolean;
};

/* ===== Small utils ===== */
const nfIN = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const Money = ({ v }: { v: number }) => <>{nfIN.format(isFinite(v) ? v : 0)}</>;
const hhmm = (min: number) => `${Math.floor(min / 60)}h ${min % 60}m`;

/* helper: compute agent net & commission from fare */
function getAgentInfo(
  fare?: FareRT | null
): { agentNet?: number; commission?: number } {
  if (!fare) return {};
  let commission = fare.commissionINR;
  if (commission == null && fare.agentFareINR != null) {
    commission = fare.price - fare.agentFareINR;
  }
  let agentNet = fare.agentFareINR;
  if (agentNet == null && commission != null) {
    agentNet = fare.price - commission;
  }
  return { agentNet, commission };
}

/* ===== One leg card ===== */
function LegCard({
  row,
  selected,
  onPickFare,
  showCommission,
}: {
  row: RowRT;
  selected: Selected;
  onPickFare: (fare: FareRT) => void;
  showCommission: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Jo fare select hai wo, warna pehla fare as default
  const currentFare: FareRT | undefined =
    selected?.flightId === row.id
      ? selected.fare
      : row.fares && row.fares.length > 0
      ? row.fares[0]
      : undefined;

  const { agentNet, commission } = getAgentInfo(currentFare);

  const handleFareChange = (code: string) => {
    const fare = row.fares.find((f) => f.code === code);
    if (fare) {
      onPickFare(fare);
    }
  };

  const cancellationText =
    typeof row.cancellation === "string"
      ? row.cancellation
      : row.cancellation
      ? JSON.stringify(row.cancellation, null, 2)
      : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      {/* Top line: logo + airline + flightNo + times + stops */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={row.logo}
            alt={row.airline}
            className="h-8 w-8 rounded object-contain"
          />
          <div>
            <div className="text-[15px] font-semibold leading-tight">
              {row.airline}
            </div>
            <div className="text-xs text-gray-500">{row.flightNos}</div>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center gap-6 sm:flex">
          <div className="text-right">
            <div className="text-[18px] font-semibold leading-none">
              {row.departTime}
            </div>
            <div className="text-xs text-gray-500">
              {row.fromCity} ({row.fromIata})
            </div>
            {row.departDate && (
              <div className="text-[11px] text-gray-400">{row.departDate}</div>
            )}
          </div>

          <div className="text-center text-[12px] text-gray-600">
            <div className="font-medium">{hhmm(row.durationMin)}</div>
            <div>
              {row.stopLabel ??
                (row.stops === 0 ? "Non-stop" : `${row.stops} Stop`)}
            </div>
          </div>

          <div>
            <div className="text-[18px] font-semibold leading-none">
              {row.arriveTime}
            </div>
            <div className="text-xs text-gray-500">
              {row.toCity} ({row.toIata})
            </div>
            {row.arriveDate && (
              <div className="text-[11px] text-gray-400">{row.arriveDate}</div>
            )}
          </div>
        </div>
      </div>

      {/* Fare selector + price block */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-gray-500">
            Fare type
          </span>
          <select
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            value={currentFare?.code ?? ""}
            onChange={(e) => handleFareChange(e.target.value)}
          >
            {row.fares.map((f) => (
              <option key={f.code} value={f.code}>
                {f.label} • {nfIN.format(f.price)}
              </option>
            ))}
          </select>
        </div>

        {currentFare && (
          <div className="text-right">
            <div className="text-lg font-semibold leading-tight">
              <Money v={currentFare.price} />
            </div>
            <div className="text-[11px] text-gray-600">
              {currentFare.refundable} • {currentFare.cabin}
            </div>
            {currentFare.badge && (
              <div className="mt-0.5">
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${
                    currentFare.badge.tone === "published"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  }`}
                >
                  {currentFare.badge.text}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick baggage line */}
      <div className="mt-2 text-xs text-gray-500">
        Baggage: {row.baggage?.handKg ?? 0}kg hand •{" "}
        {row.baggage?.checkKg ?? 0}kg check-in
        {row.baggage?.piece ? ` (${row.baggage.piece})` : ""}
      </div>

      {/* Commission line (per leg, for selected fare) */}
      {showCommission &&
        currentFare &&
        (agentNet != null || commission != null) && (
          <div className="mt-1 text-[11px] text-gray-700">
            {agentNet != null && (
              <>
                Agent Net:{" "}
                <span className="font-semibold text-emerald-700">
                  <Money v={agentNet} />
                </span>
              </>
            )}
            {commission != null && (
              <>
                {" • "}Your Commission:{" "}
                <span className="font-semibold text-orange-700">
                  <Money v={commission} />
                </span>
              </>
            )}
          </div>
        )}

      {/* Details toggle + panel */}
      <div className="mt-2 border-t border-dashed pt-2">
        <button
          type="button"
          onClick={() => setShowDetails((s) => !s)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500"
        >
          <span>{showDetails ? "Hide details" : "View details"}</span>
          <span
            className={`inline-block transform text-[10px] transition-transform ${
              showDetails ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {showDetails && (
          <div className="mt-2 space-y-2 text-[11px] text-gray-700">
            {/* Flight details */}
            <div>
              <div className="font-semibold text-gray-800">
                Flight details
              </div>
              <div>
                {row.fromCity} ({row.fromIata}) → {row.toCity} ({row.toIata}) •{" "}
                {hhmm(row.durationMin)} •{" "}
                {row.stopLabel ??
                  (row.stops === 0 ? "Non-stop" : `${row.stops} Stop`)}
              </div>
              {row.departDate && row.arriveDate && (
                <div className="text-gray-500">
                  Depart: {row.departDate} · Arrive: {row.arriveDate}
                </div>
              )}
            </div>

            {/* Fare details */}
            {currentFare && (
              <div>
                <div className="font-semibold text-gray-800">
                  Fare details
                </div>
                <div>
                  {currentFare.refundable} • {currentFare.cabin} •{" "}
                  {currentFare.meal}
                </div>
                {currentFare.seat && (
                  <div className="text-gray-600">{currentFare.seat}</div>
                )}
              </div>
            )}

            {/* Baggage full details */}
            <div>
              <div className="font-semibold text-gray-800">Baggage</div>
              <div>
                Hand baggage: {row.baggage?.handKg ?? 0} kg · Check-in:{" "}
                {row.baggage?.checkKg ?? 0} kg{" "}
                {row.baggage?.piece ? `(${row.baggage.piece})` : ""}
              </div>
            </div>

            {/* Cancellation / change rules */}
            {cancellationText && (
              <div>
                <div className="font-semibold text-gray-800">
                  Cancellation / Change rules
                </div>
                <div className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 p-2 text-[10px] text-gray-700 whitespace-pre-wrap">
                  {cancellationText}
                </div>
              </div>
            )}
          </div>
        )}
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
  showCommission,
}: {
  title: string;
  rows: RowRT[];
  selected: Selected;
  onSelect: (rowId: string, fare: FareRT) => void;
  emptyNode?: ReactNode;
  showCommission: boolean;
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
              showCommission={showCommission}
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
  showCommission = false,
}: Props) {
  const navigate = useNavigate();

  const outPrice = useMemo(
    () => selectedOutbound?.fare.price ?? 0,
    [selectedOutbound]
  );
  const inPrice = useMemo(
    () => selectedReturn?.fare.price ?? 0,
    [selectedReturn]
  );
  const total = useMemo(() => outPrice + inPrice, [outPrice, inPrice]);
  const canBook = Boolean(selectedOutbound && selectedReturn);

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

  // agent totals for sticky footer (only when toggle ON)
  const outAgentInfo = useMemo(
    () => getAgentInfo(selectedOutbound?.fare),
    [selectedOutbound]
  );
  const inAgentInfo = useMemo(
    () => getAgentInfo(selectedReturn?.fare),
    [selectedReturn]
  );

  const totalAgentNet =
    (outAgentInfo.agentNet ?? 0) + (inAgentInfo.agentNet ?? 0);
  const totalCommission =
    (outAgentInfo.commission ?? 0) + (inAgentInfo.commission ?? 0);

  return (
    <div className="relative">
      {/* Two side-by-side columns matching the screenshot */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-6">
          <LegSection
            title={outHeader}
            rows={outboundRows}
            selected={selectedOutbound}
            onSelect={onSelectOutboundFare}
            emptyNode={emptyOutboundNode}
            showCommission={showCommission}
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <LegSection
            title={inHeader}
            rows={returnRows}
            selected={selectedReturn}
            onSelect={onSelectReturnFare}
            emptyNode={emptyReturnNode}
            showCommission={showCommission}
          />
        </div>
      </div>

      {/* Sticky footer like your design */}
      <div className="sticky bottom-0 z-20 mt-4">
        <div className="mx-auto max-w-5xl border border-gray-200 bg-white/90 px-3 py-2 shadow backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex flex-wrap items-center gap-3">
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

              {showCommission &&
                (totalAgentNet > 0 || totalCommission > 0) && (
                  <div className="mt-1 text-[11px] text-gray-700">
                    Agent Net Total:{" "}
                    <span className="font-semibold text-emerald-700">
                      <Money v={totalAgentNet} />
                    </span>
                    {" • "}
                    Your Commission Total:{" "}
                    <span className="font-semibold text-orange-700">
                      <Money v={totalCommission} />
                    </span>
                  </div>
                )}
            </div>

            <button
              onClick={handleBook}
              disabled={!canBook}
              title={
                canBook
                  ? "Proceed to checkout"
                  : "Select one outbound and one return fare"
              }
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow ${
                canBook
                  ? "bg-gray-900 hover:opacity-95"
                  : "cursor-not-allowed bg-gray-400 opacity-60"
              }`}
            >
              Book Round Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
