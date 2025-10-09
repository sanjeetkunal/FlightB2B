// src/components/flightlist/RoundTripResultList.tsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import OnewayResult, { type Row as OnewayRow, type FareOption } from "./OnewayResult";

/* small money util (same locale as ResultList) */
const Money = ({ v }: { v: number }) => (
  <>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v)}</>
);

type Selected = { flightId: string; fare: FareOption } | null;

type Props = {
  /* data for each leg */
  outboundRows: OnewayRow[];
  returnRows: OnewayRow[];

  /* selection state */
  selectedOutbound: Selected;
  selectedReturn: Selected;

  /* selection handlers (per leg) */
  onSelectOutboundFare: (rowId: string, fare: FareOption) => void;
  onSelectReturnFare: (rowId: string, fare: FareOption) => void;

  /* optional booking handler; if not given, we navigate to a checkout */
  onBookRoundTrip?: (sel: { outbound: Selected; ret: Selected }) => void;

  /* nice headers */
  fromIata?: string;
  toIata?: string;
  departDate?: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  cabin?: string;
  pax?: number;
};

export default function RoundTripResultList({
  outboundRows,
  returnRows,
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
}: Props) {
  const navigate = useNavigate();

  const outPrice = selectedOutbound?.fare.price ?? 0;
  const inPrice  = selectedReturn?.fare.price ?? 0;
  const total    = outPrice + inPrice;

  const canBook = !!(selectedOutbound && selectedReturn);

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
    // default navigation to a round-trip checkout with state + query
    const qs = new URLSearchParams({
      trip: "round",
      from: fromIata ?? "",
      to: toIata ?? "",
      date: departDate ?? "",
      ret: returnDate ?? "",
      cabin: cabin,
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
      },
    });
  };

  return (
    <div className="relative">
      {/* Top summary chips (selected fares) */}
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

      {/* Two columns (stack on mobile) */}
      <div className="grid grid-cols-12 gap-5">
        {/* OUTBOUND */}
        <div className="col-span-12 md:col-span-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-gray-900">{outHeader}</h2>
          </div>
          <OnewayResult
            rows={outboundRows}
            selectedGlobal={selectedOutbound}
            onSelectFare={onSelectOutboundFare}
            onEmpty={
              <div className="text-center text-gray-600">
                No outbound results. Try changing the date or filters.
              </div>
            }
          />
        </div>

        {/* RETURN */}
        <div className="col-span-12 md:col-span-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-gray-900">{inHeader}</h2>
          </div>
          <OnewayResult
            rows={returnRows}
            selectedGlobal={selectedReturn}
            onSelectFare={onSelectReturnFare}
            onEmpty={
              <div className="text-center text-gray-600">
                No return results. Try changing the date or filters.
              </div>
            }
          />
        </div>
      </div>

      {/* Sticky footer summary + CTA */}
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
