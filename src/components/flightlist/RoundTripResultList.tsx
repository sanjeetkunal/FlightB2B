import React, { useEffect, useMemo, useState, type ReactNode } from "react";

/* ================= TYPES ================= */

export type FareRT = {
  code: string;
  label: string;
  price: number;
  refundable: "Refundable" | "Non-Refundable";
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
  refundable: "Refundable" | "Non-Refundable";

  fares: FareRT[];
  baggage?: { handKg?: number; checkKg?: number; piece?: string };

  extras?: string[];
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

/* ================= ASSETS ================= */

const TAKEOFF_ICON = "https://cdn-icons-png.flaticon.com/128/8943/8943898.png";
const LANDING_ICON = "https://cdn-icons-png.flaticon.com/128/6591/6591567.png";

/* ================= UTILS ================= */

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

const nfIN = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const Money = ({ v }: { v: number }) => <>{nfIN.format(v)}</>;

const hhmm = (min: number) => `${Math.floor(min / 60)}h ${min % 60}m`;

function getAgentInfo(fare?: FareRT | null) {
  if (!fare) return {};
  let commission = fare.commissionINR;
  let agentNet = fare.agentFareINR;

  if (commission == null && agentNet != null) commission = fare.price - agentNet;
  if (agentNet == null && commission != null) agentNet = fare.price - commission;

  return { agentNet, commission };
}

function safeStopsLabel(row: RowRT) {
  if (row.stopLabel) return row.stopLabel;
  return row.stops === 0 ? "Non-stop" : row.stops === 1 ? "1 Stop" : `${row.stops} Stops`;
}

function pickCurrentFare(row: RowRT, selected: Selected) {
  if (selected?.flightId === row.id) return selected.fare;
  // ✅ intentionally NO default selection per card
  return undefined;
}

function mergeBaggage(row: RowRT, fare?: FareRT | null) {
  const hand = row.baggage?.handKg ?? fare?.baggage?.handKg;
  const check = row.baggage?.checkKg ?? fare?.baggage?.checkKg;
  const piece = row.baggage?.piece;
  return { hand, check, piece };
}

function fareTooltip(row: RowRT, fare?: FareRT | null) {
  if (!fare) return "";
  const bag = mergeBaggage(row, fare);
  const bagText = [
    bag.hand != null ? `${bag.hand}kg hand` : "— hand",
    bag.check != null ? `${bag.check}kg check` : "— check",
    bag.piece ? `(${bag.piece})` : "",
  ]
    .filter(Boolean)
    .join(" • ");

  return [
    `Fare: ${fare.label} (${fare.code})`,
    `Refundable: ${fare.refundable}`,
    `Cabin: ${fare.cabin}`,
    `Meal: ${fare.meal}`,
    `Baggage: ${bagText}`,
    `Seat: ${fare.seat ?? "—"}`,
  ].join("\n");
}

/* ================= SMALL UI ================= */

function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{k}</div>
      <div className="text-[12px] font-medium text-gray-900 text-right">{v}</div>
    </div>
  );
}

function InfoDot({ title }: { title: string }) {
  return (
    <span
      title={title}
      className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-600"
      aria-label="Info"
    >
      i
    </span>
  );
}

/* ================= TIMELINE (SCREENSHOT STYLE) ================= */

function StopsRail({ stops }: { stops: number }) {
  // ✅ Non-stop => NO dot
  if (stops <= 0) {
    return (
      <div className="relative flex items-center justify-center">
        <div className="h-px w-full border-t border-dashed border-gray-300" />
      </div>
    );
  }

  const dotCount = Math.min(stops, 3);
  const extra = stops - dotCount;

  return (
    <div className="relative flex items-center justify-center">
      <div className="h-px w-full border-t border-dashed border-gray-300" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-3">
          {Array.from({ length: dotCount }).map((_, i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-full border border-gray-300 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            />
          ))}
          {extra > 0 && (
            <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
              +{extra}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineRow({ row }: { row: RowRT }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      {/* Left */}
      <div className="shrink-0">
        <div className="text-[12px] leading-none font-extrabold text-gray-900">{row.departTime}</div>
        <div className="mt-1 text-[12px] text-gray-700">
          <span className="font-semibold">{row.fromCity}</span>
        </div>
        {row.departDate && <div className="mt-0.5 text-[11px] text-gray-500">{row.departDate}</div>}
      </div>

      {/* Middle */}
      <div className="min-w-[140px] flex-1">
        <div className="text-center">
          <div className="text-[11px] font-semibold text-gray-700">{safeStopsLabel(row)}</div>

          <div className="flex items-center gap-2">
            <img src={TAKEOFF_ICON} alt="" className="h-4 w-4 object-contain opacity-80" />
            <div className="flex-1">
              <StopsRail stops={row.stops} />
            </div>
            <img src={LANDING_ICON} alt="" className="h-4 w-4 object-contain opacity-80" />
          </div>

          <div className="text-[11px] text-gray-500">{hhmm(row.durationMin)}</div>
        </div>
      </div>

      {/* Right */}
      <div className="shrink-0 text-right">
        <div className="text-[12px] leading-none font-extrabold text-gray-900">{row.arriveTime}</div>
        <div className="mt-1 text-[12px] text-gray-700">
          <span className="font-semibold">{row.toCity}</span>
        </div>
        {row.arriveDate && <div className="mt-0.5 text-[11px] text-gray-500">{row.arriveDate}</div>}
      </div>
    </div>
  );
}

/* ================= FARE RADIO LIST ================= */

function FareRadioList({
  row,
  currentFare,
  onPickFare,
  limit = 4,
}: {
  row: RowRT;
  currentFare?: FareRT | null;
  onPickFare: (fare: FareRT) => void;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const fares = row.fares ?? [];
  const visible = expanded ? fares : fares.slice(0, Math.min(limit, fares.length));

  return (
    <div>
      <div className="space-y-2">
        {visible.map((f) => {
          const checked = currentFare?.code === f.code;

          return (
            <label
              key={f.code}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-lg transition",
                checked ? "bg-gray-50" : "hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name={`fare-${row.id}`}
                  checked={checked}
                  onChange={() => onPickFare(f)}
                  className="h-4 w-4"
                />
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-extrabold text-gray-900">{nfIN.format(f.price)}</div>
                  <InfoDot title={fareTooltip(row, f)} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-800">
                  {f.label}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      {fares.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 w-full rounded-lg px-2 py-1.5 text-left text-[12px] font-semibold text-blue-700 hover:bg-blue-50"
        >
          {expanded ? "Show less fares" : "Show more fares"}
        </button>
      )}
    </div>
  );
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
  const [open, setOpen] = useState(false);

  const currentFare = pickCurrentFare(row, selected);
  const { agentNet, commission } = getAgentInfo(currentFare);

  const bag = mergeBaggage(row, currentFare);
  const baggageText = [
    bag.hand != null ? `${bag.hand}kg hand` : "— hand",
    bag.check != null ? `${bag.check}kg check` : "— check",
    bag.piece ? `(${bag.piece})` : "",
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <img src={row.logo} className="h-9 w-9 object-contain" alt={row.airline} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900">{row.airline}</div>
              <div className="text-[12px] text-gray-500">{row.flightNos}</div>
            </div>
          </div>

          {/* timeline in header area (as per your current UI) */}
          <div className="min-w-0">
            <TimelineRow row={row} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-12 gap-4 items-start">
          {/* Left: fare radios (only 2 visible by default) */}
          <div className="col-span-12 lg:col-span-7">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Fare option</div>

            <FareRadioList row={row} currentFare={currentFare} onPickFare={onPickFare} limit={2} />
          </div>

          {/* Right: Refundable + View details (+ B2B) */}
          <div className="col-span-12 lg:col-span-5">
            <div className="flex items-start justify-between gap-3 lg:flex-col lg:items-end">
              <div className="w-full lg:w-auto lg:text-right">
                <div className="mt-1 space-y-1 text-[12px] font-medium text-gray-700">
                  <div>
                    <span
                      className={cn(
                        "font-semibold",
                        (currentFare?.refundable ?? row.refundable) === "Refundable"
                          ? "text-emerald-700"
                          : "text-red-600"
                      )}
                    >
                      {currentFare?.refundable ?? row.refundable}
                    </span>
                  </div>

                  {/* (as per your last instruction, meal/baggage can be added here later if you want;
                      right now we keep UI same and only removed unused code) */}
                </div>

                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold text-gray-800 hover:bg-gray-50"
                >
                  {open ? "Hide details" : "View details"}
                  <span className={cn("transition-transform", open && "rotate-180")}>▾</span>
                </button>
              </div>
            </div>

            {showCommission && (agentNet != null || commission != null) && (
              <div className="mt-3 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 lg:w-auto">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">B2B</div>
                <div className="mt-1 flex flex-col gap-1 text-[12px]">
                  {agentNet != null && (
                    <span className="font-semibold text-emerald-700">
                      Net: <Money v={agentNet} />
                    </span>
                  )}
                  {commission != null && (
                    <span className="font-semibold text-orange-700">
                      Comm: <Money v={commission} />
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details panel */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-[12px] font-semibold text-gray-900">Flight details</div>
              <div className="mt-3 space-y-2.5">
                <KV k="Route" v={`${row.fromCity} (${row.fromIata}) → ${row.toCity} (${row.toIata})`} />
                <KV k="Duration" v={hhmm(row.durationMin)} />
                <KV k="Stops" v={safeStopsLabel(row)} />
                <KV k="Carrier" v={row.airline} />
                <KV k="Flight no." v={row.flightNos} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-[12px] font-semibold text-gray-900">Fare details</div>
              <div className="mt-3 space-y-2.5">
                <KV k="Fare" v={`${currentFare?.label ?? "—"}${currentFare?.code ? ` (${currentFare.code})` : ""}`} />
                <KV k="Refundable" v={currentFare?.refundable ?? row.refundable} />
                <KV k="Cabin" v={currentFare?.cabin ?? "—"} />
                <KV k="Meal" v={currentFare?.meal ?? "—"} />
                <KV k="Baggage" v={baggageText} />
                <KV k="Seat" v={currentFare?.seat ?? "—"} />
              </div>
            </div>
          </div>

          {row.sector === "INTL" && (
            <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-[12px] font-medium text-blue-900">
              Passport & visa may be required. International baggage rules can differ by carrier/sector.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= BOTTOM SUMMARY ================= */

type SummaryBarProps = {
  out?: { row: RowRT; fare: FareRT };
  inn?: { row: RowRT; fare: FareRT };
  showCommission: boolean;
  onBookNow?: () => void;
  onLockPrice?: () => void;
};

type TabKey = "flight" | "fare" | "cancel" | "date";

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-2 text-[12px] font-semibold border-b-2 transition",
        active ? "border-sky-400 text-white" : "border-transparent text-slate-300 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function SegmentCard({ title, seg }: { title: string; seg?: { row: RowRT; fare: FareRT } }) {
  const row = seg?.row;
  const fare = seg?.fare;

  const from = row ? `${row.fromCity}` : "—";
  const to = row ? `${row.toCity}` : "—";

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-slate-200">{title}</div>
          <div className="mt-1 text-[13px] font-semibold text-white truncate">
            {row ? `${from} to ${to}${row.departDate ? `, ${row.departDate}` : ""}` : "—"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[12px] text-slate-300">Fare</div>
          <div className="text-[14px] font-extrabold text-white">{fare ? nfIN.format(fare.price) : "—"}</div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/30 p-3">
        <div className="flex items-center gap-3">
          {row?.logo ? (
            <img src={row.logo} alt={row.airline} className="h-8 w-8 object-contain rounded" />
          ) : (
            <div className="h-8 w-8 rounded bg-slate-800" />
          )}

          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-white truncate">
              {row ? row.airline : "—"}{" "}
              {row?.flightNos ? <span className="text-slate-300 font-medium">| {row.flightNos}</span> : null}
            </div>
            <div className="mt-0.5 text-[12px] text-slate-300">{fare?.refundable ?? row?.refundable ?? "—"}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-3 items-center">
          <div className="col-span-5">
            <div className="text-[20px] font-extrabold text-white leading-none">{row?.departTime ?? "—"}</div>
            <div className="mt-1 text-[12px] text-slate-300">
              {row?.fromIata ?? "—"} {row?.fromCity ? `• ${row.fromCity}` : ""}
            </div>
          </div>

          <div className="col-span-2 text-center">
            <div className="text-[12px] font-semibold text-slate-200">{row ? hhmm(row.durationMin) : "—"}</div>
            <div className="mt-1 text-[12px] text-slate-400">
              {row?.stopLabel ?? (row ? (row.stops === 0 ? "Non-stop" : `${row.stops} stop(s)`) : "")}
            </div>
          </div>

          <div className="col-span-5 text-right">
            <div className="text-[20px] font-extrabold text-white leading-none">{row?.arriveTime ?? "—"}</div>
            <div className="mt-1 text-[12px] text-slate-300">
              {row?.toIata ?? "—"} {row?.toCity ? `• ${row.toCity}` : ""}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
          <div>
            <div className="text-slate-400 font-semibold uppercase tracking-wide text-[11px]">Baggage</div>
            <div className="mt-1 text-slate-200">
              {(() => {
                const hand = row?.baggage?.handKg ?? fare?.baggage?.handKg;
                const check = row?.baggage?.checkKg ?? fare?.baggage?.checkKg;
                if (hand == null && check == null) return "—";
                return `${hand ?? "—"}kg / ${check ?? "—"}kg`;
              })()}
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-semibold uppercase tracking-wide text-[11px]">Meal</div>
            <div className="mt-1 text-slate-200">{fare?.meal ?? "—"}</div>
          </div>

          <div>
            <div className="text-slate-400 font-semibold uppercase tracking-wide text-[11px]">Cabin</div>
            <div className="mt-1 text-slate-200">{fare?.cabin ?? "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SummaryBar({ out, inn, showCommission, onBookNow, onLockPrice }: SummaryBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<TabKey>("flight");

  const total = (out?.fare?.price ?? 0) + (inn?.fare?.price ?? 0);

  const outAgent = useMemo(() => getAgentInfo(out?.fare), [out?.fare]);
  const inAgent = useMemo(() => getAgentInfo(inn?.fare), [inn?.fare]);

  const totalNet = (outAgent.agentNet ?? 0) + (inAgent.agentNet ?? 0);
  const totalComm = (outAgent.commission ?? 0) + (inAgent.commission ?? 0);

  return (
    <div className="sticky bottom-0 z-30 mt-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 text-white shadow-lg overflow-hidden">
        {expanded && (
          <div className="border-b border-slate-800 bg-slate-900/95">
            <div className="flex items-center justify-between px-4 pt-3">
              <div className="flex items-center gap-2">
                <TabButton active={tab === "flight"} onClick={() => setTab("flight")}>
                  FLIGHT DETAILS
                </TabButton>
                <TabButton active={tab === "fare"} onClick={() => setTab("fare")}>
                  FARE SUMMARY
                </TabButton>
                <TabButton active={tab === "cancel"} onClick={() => setTab("cancel")}>
                  CANCELLATION
                </TabButton>
                <TabButton active={tab === "date"} onClick={() => setTab("date")}>
                  DATE CHANGE
                </TabButton>
              </div>

              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-[12px] font-semibold text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="px-4 pb-4 pt-3">
              {tab === "flight" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SegmentCard title="Outbound" seg={out} />
                  <SegmentCard title="Inbound" seg={inn} />
                </div>
              )}

              {tab === "fare" && (
                <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4 text-[13px] text-slate-200">
                  <div className="font-semibold text-white">Fare Summary</div>
                  <div className="mt-2">
                    Outbound: <span className="text-white font-semibold">{out ? nfIN.format(out.fare.price) : "—"}</span>
                  </div>
                  <div>
                    Inbound: <span className="text-white font-semibold">{inn ? nfIN.format(inn.fare.price) : "—"}</span>
                  </div>
                  <div className="mt-2">
                    Total: <span className="text-white font-extrabold">{nfIN.format(total)}</span>
                  </div>
                </div>
              )}

              {tab === "cancel" && (
                <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4 text-[13px] text-slate-200">
                  <div className="font-semibold text-white">Cancellation</div>
                  <div className="mt-2 text-slate-300">Hook your real cancellation rules here (dynamic).</div>
                </div>
              )}

              {tab === "date" && (
                <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4 text-[13px] text-slate-200">
                  <div className="font-semibold text-white">Date Change</div>
                  <div className="mt-2 text-slate-300">Hook your date change policy here (dynamic).</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 items-center gap-0">
          <div className="col-span-12 md:col-span-4 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-800">
            <div className="text-[12px] font-semibold text-slate-200">
              Departure <span className="text-slate-400">•</span>{" "}
              <span className="text-slate-100">{out?.row.airline ?? "—"}</span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-[14px] font-extrabold">
              <span>{out?.row.departTime ?? "—"}</span>
              <span className="text-slate-400">→</span>
              <span>{out?.row.arriveTime ?? "—"}</span>
              <span className="ml-auto text-[14px] font-extrabold">{out ? nfIN.format(out.fare.price) : "—"}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setExpanded(true);
                setTab("flight");
              }}
              className="mt-1 text-[12px] font-semibold text-sky-300 hover:text-sky-200"
            >
              Flight Details
            </button>
          </div>

          <div className="col-span-12 md:col-span-4 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-800">
            <div className="text-[12px] font-semibold text-slate-200">
              Return <span className="text-slate-400">•</span>{" "}
              <span className="text-slate-100">{inn?.row.airline ?? "—"}</span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-[14px] font-extrabold">
              <span>{inn?.row.departTime ?? "—"}</span>
              <span className="text-slate-400">→</span>
              <span>{inn?.row.arriveTime ?? "—"}</span>
              <span className="ml-auto text-[14px] font-extrabold">{inn ? nfIN.format(inn.fare.price) : "—"}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setExpanded(true);
                setTab("flight");
              }}
              className="mt-1 text-[12px] font-semibold text-sky-300 hover:text-sky-200"
            >
              Flight Details
            </button>
          </div>

          <div className="col-span-12 md:col-span-4 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold text-slate-200">Grand Total</div>
                <div className="text-[22px] leading-none font-extrabold">{nfIN.format(total)}</div>

                {showCommission && (totalNet > 0 || totalComm > 0) && (
                  <div className="mt-1 text-[12px] font-semibold">
                    {totalNet > 0 && <span className="text-emerald-300">Net: {nfIN.format(totalNet)}</span>}
                    {totalComm > 0 && <span className="ml-2 text-orange-300">Comm: {nfIN.format(totalComm)}</span>}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setExpanded(true);
                    setTab("fare");
                  }}
                  className="mt-1 block text-[12px] font-semibold text-sky-300 hover:text-sky-200"
                >
                  Fare Details
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={onBookNow}
                    className="rounded-full bg-sky-500 px-4 py-2 text-[12px] font-extrabold text-white hover:bg-sky-400"
                  >
                    BOOK NOW
                  </button>
                  <button
                    type="button"
                    onClick={onLockPrice}
                    className="rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-[12px] font-extrabold text-white hover:bg-slate-700"
                  >
                    LOCK PRICE
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="h-9 w-9 rounded-full border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 grid place-items-center"
                  aria-label={expanded ? "Collapse" : "Expand"}
                >
                  <span className={cn("transition-transform", expanded && "rotate-180")}>▴</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* end */}
      </div>
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
  // ✅ Default select ONLY first result fare (outbound + inbound)
  useEffect(() => {
    if (!selectedOutbound && outboundRows.length && outboundRows[0]?.fares?.length) {
      onSelectOutboundFare(outboundRows[0].id, outboundRows[0].fares[0]);
    }
  }, [outboundRows, selectedOutbound, onSelectOutboundFare]);

  useEffect(() => {
    if (!selectedReturn && returnRows.length && returnRows[0]?.fares?.length) {
      onSelectReturnFare(returnRows[0].id, returnRows[0].fares[0]);
    }
  }, [returnRows, selectedReturn, onSelectReturnFare]);

  const pickedOut = useMemo(() => {
    if (!selectedOutbound) return undefined;
    const row = outboundRows.find((r) => r.id === selectedOutbound.flightId);
    if (!row) return undefined;
    return { row, fare: selectedOutbound.fare };
  }, [outboundRows, selectedOutbound]);

  const pickedIn = useMemo(() => {
    if (!selectedReturn) return undefined;
    const row = returnRows.find((r) => r.id === selectedReturn.flightId);
    if (!row) return undefined;
    return { row, fare: selectedReturn.fare };
  }, [returnRows, selectedReturn]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6 space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Departure (Outbound)</h2>
              <div className="mt-0.5 text-[12px] text-gray-500">Choose your onward flight</div>
            </div>
            <span className="text-[11px] text-gray-500">{outboundRows.length} option(s)</span>
          </div>

          {outboundRows.length === 0 &&
            (emptyOutboundNode ?? (
              <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                No outbound flights found.
              </div>
            ))}

          {outboundRows.map((r) => (
            <LegCard
              key={r.id}
              row={r}
              selected={selectedOutbound}
              onPickFare={(f) => onSelectOutboundFare(r.id, f)}
              showCommission={showCommission}
            />
          ))}
        </div>

        <div className="col-span-12 md:col-span-6 space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Return (Inbound)</h2>
              <div className="mt-0.5 text-[12px] text-gray-500">Choose your return flight</div>
            </div>
            <span className="text-[11px] text-gray-500">{returnRows.length} option(s)</span>
          </div>

          {returnRows.length === 0 &&
            (emptyReturnNode ?? (
              <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                No return flights found.
              </div>
            ))}

          {returnRows.map((r) => (
            <LegCard
              key={r.id}
              row={r}
              selected={selectedReturn}
              onPickFare={(f) => onSelectReturnFare(r.id, f)}
              showCommission={showCommission}
            />
          ))}
        </div>
      </div>

      <SummaryBar out={pickedOut} inn={pickedIn} showCommission={showCommission} />
    </div>
  );
}
