import React, { useState, type ReactNode } from "react";

/* ================= TYPES ================= */

export type FareRT = {
  code: string;
  label: string;
  price: number;
  refundable: "Refundable" | "Non Refundable";
  cabin: string;
  meal: string;
  badge?: { text: string; tone: "published" | "offer" };
  baggage?: { handKg?: number; checkKg?: number };
  seat?: string;

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
  arriveTime: string;
  departDate?: string;
  arriveDate?: string;

  stops: number;
  stopLabel?: string;
  durationMin: number;

  totalFareINR: number;
  refundable: "Refundable" | "Non Refundable";

  fares: FareRT[];
  baggage?: { handKg?: number; checkKg?: number; piece?: string };

  extras?: string[];        // ✅🔥 ADD THIS
  sector: "DOM" | "INTL";
};


type Selected = { flightId: string; fare: FareRT } | null;

type Props = {
  outboundRows: RowRT[];
  returnRows: RowRT[];

  selectedOutbound: Selected;
  selectedReturn: Selected;

  onSelectOutboundFare: (rowId: string, fare: FareRT) => void;
  onSelectReturnFare: (rowId: string, fare: FareRT) => void;

  emptyOutboundNode?: ReactNode;
  emptyReturnNode?: ReactNode;

  showCommission?: boolean;
};

/* ================= UTILS ================= */

const nfIN = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const Money = ({ v }: { v: number }) => <>{nfIN.format(v)}</>;

const hhmm = (min: number) =>
  `${Math.floor(min / 60)}h ${min % 60}m`;

function getAgentInfo(fare?: FareRT | null) {
  if (!fare) return {};
  let commission = fare.commissionINR;
  let agentNet = fare.agentFareINR;

  if (commission == null && agentNet != null) {
    commission = fare.price - agentNet;
  }
  if (agentNet == null && commission != null) {
    agentNet = fare.price - commission;
  }
  return { agentNet, commission };
}

/* ================= LEG CARD ================= */

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

  const isIntl = row.sector === "INTL";

  const currentFare =
    selected?.flightId === row.id
      ? selected.fare
      : row.fares[0];

  const { agentNet, commission } = getAgentInfo(currentFare);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3">
        <img src={row.logo} className="h-8 w-8 object-contain" />
        <div>
          <div className="font-semibold">{row.airline}</div>
          <div className="text-xs text-gray-500">{row.flightNos}</div>
        </div>

        {isIntl && (
          <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            INTERNATIONAL
          </span>
        )}
      </div>

      {/* Route */}
      <div className="mt-2 flex justify-between text-sm">
        <div>
          <div className="text-lg font-bold">{row.departTime}</div>
          <div className="text-xs">
            {row.fromCity} ({row.fromIata})
          </div>
        </div>

        <div className="text-center text-xs text-gray-600">
          {hhmm(row.durationMin)}
          <br />
          {row.stopLabel ??
            (row.stops === 0 ? "Non-stop" : `${row.stops} Stop`)}
        </div>

        <div>
          <div className="text-lg font-bold">{row.arriveTime}</div>
          <div className="text-xs">
            {row.toCity} ({row.toIata})
          </div>
        </div>
      </div>

      {/* Fare */}
      <div className="mt-3 flex items-center justify-between">
        <select
          value={currentFare.code}
          onChange={(e) => {
            const f = row.fares.find(
              (x) => x.code === e.target.value
            );
            if (f) onPickFare(f);
          }}
          className="rounded border px-2 py-1 text-sm"
        >
          {row.fares.map((f) => (
            <option key={f.code} value={f.code}>
              {f.label} • ₹{f.price}
            </option>
          ))}
        </select>

        <div className="text-right">
          <div className="text-lg font-bold">
            <Money v={currentFare.price} />
          </div>
          <div className="text-xs text-gray-600">
            {currentFare.refundable}
          </div>
        </div>
      </div>

      {/* Baggage */}
      <div className="mt-2 text-xs text-gray-500">
        Baggage: {row.baggage?.handKg ?? 0}kg hand •{" "}
        {row.baggage?.checkKg ?? 0}kg check-in
      </div>

      {/* INTL INFO */}
      {isIntl && (
        <div className="mt-1 rounded bg-blue-50 px-2 py-1 text-[11px] text-blue-700">
          Passport & Visa required • International baggage rules apply
        </div>
      )}

      {/* Commission */}
      {showCommission && (agentNet || commission) && (
        <div className="mt-1 text-[11px]">
          {agentNet && (
            <span className="font-semibold text-emerald-700">
              Net: <Money v={agentNet} />
            </span>
          )}
          {commission && (
            <span className="ml-2 font-semibold text-orange-700">
              Comm: <Money v={commission} />
            </span>
          )}
        </div>
      )}

      {/* Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-2 text-xs font-semibold text-blue-600"
      >
        {showDetails ? "Hide details" : "View details"}
      </button>

      {showDetails && (
        <div className="mt-2 text-xs text-gray-700">
          Duration: {hhmm(row.durationMin)}
        </div>
      )}
    </div>
  );
}

/* ================= MAIN ================= */

export default function RoundTripResultList({
  outboundRows,
  returnRows,
  selectedOutbound,
  selectedReturn,
  onSelectOutboundFare,
  onSelectReturnFare,
  emptyOutboundNode,
  emptyReturnNode,
  showCommission = false,
}: Props) {
  return (
    <div className="grid grid-cols-12 gap-5">
      {/* OUTBOUND */}
      <div className="col-span-12 md:col-span-6 space-y-3">
        <h2 className="font-semibold">Departure</h2>

        {outboundRows.length === 0 && emptyOutboundNode}

        {outboundRows.map((r) => (
          <LegCard
            key={r.id}
            row={r}
            selected={selectedOutbound}
            onPickFare={(f) =>
              onSelectOutboundFare(r.id, f)
            }
            showCommission={showCommission}
          />
        ))}
      </div>

      {/* RETURN */}
      <div className="col-span-12 md:col-span-6 space-y-3">
        <h2 className="font-semibold">Return</h2>

        {returnRows.length === 0 && emptyReturnNode}

        {returnRows.map((r) => (
          <LegCard
            key={r.id}
            row={r}
            selected={selectedReturn}
            onPickFare={(f) =>
              onSelectReturnFare(r.id, f)
            }
            showCommission={showCommission}
          />
        ))}
      </div>
    </div>
  );
}
