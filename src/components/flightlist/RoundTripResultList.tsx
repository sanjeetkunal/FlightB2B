// src/components/flightlist/RoundTripResultList.tsx
import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
export type PaxConfig = { adults: number; children: number; infants: number };

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

  paxConfig: PaxConfig;

  // ✅ from FilterPanel (f.fareView)
  fareView?: "SINGLE" | "FULL";
};

/* ================= THEME VARS (no hard colors) ================= */

const VAR = {
  surface: "var(--surface, rgba(255,255,255,0.92))",
  surface2: "var(--surface2, rgba(248,250,252,0.92))",
  border: "var(--border, rgba(15,23,42,0.12))",
  text: "var(--text, rgba(15,23,42,0.92))",
  muted: "var(--muted, rgba(71,85,105,0.9))",
  subtle: "var(--subtle, rgba(100,116,139,0.85))",
  primary: "var(--primary, rgb(37,99,235))",
  onPrimary: "var(--onPrimary, #fff)",
  primarySoft: "var(--primarySoft, rgba(37,99,235,0.14))",
  accent: "var(--accent, rgb(16,182,217))",
  accentSoft: "var(--accentSoft, rgba(16,182,217,0.12))",
  success: "var(--success, rgb(34,197,94))",
  danger: "var(--danger, rgb(244,63,94))",

  // dark summary bar tones (still themeable)
  darkBg: "var(--darkBg, rgba(15,23,42,0.96))",
  onDark: "var(--onDark, rgba(255,255,255,1))",
  onDarkMuted: "var(--onDarkMuted, rgba(255,255,255,0.82))",
  onDarkSubtle: "var(--onDarkSubtle, rgba(255,255,255,0.72))",
  onDarkFaint: "var(--onDarkFaint, rgba(255,255,255,0.35))",
  onDarkBorder: "var(--onDarkBorder, rgba(255,255,255,0.12))",
  onDarkBtnBg: "var(--onDarkBtnBg, rgba(255,255,255,0.08))",
  onDarkBtnBorder: "var(--onDarkBtnBorder, rgba(255,255,255,0.18))",
  onDarkPaneBg: "var(--onDarkPaneBg, rgba(0,0,0,0.15))",
  onDarkCardBg: "var(--onDarkCardBg, rgba(255,255,255,0.06))",
  onDarkCardBorder: "var(--onDarkCardBorder, rgba(255,255,255,0.14))",
  linkOnDark: "var(--linkOnDark, rgba(125,211,252,1))",
  okOnDark: "var(--okOnDark, rgba(110,231,183,1))",
  warnOnDark: "var(--warnOnDark, rgba(251,191,36,1))",
};

/* ================= HELPERS ================= */

const SS_KEY = "BOOKING_CTX_V1";
const SEARCH_KEYS = ["SEARCH_CTX_V1", "FLIGHT_SEARCH_CTX_V1", "BOOKING_CTX_V1"]; // fallback only

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

const nfIN = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const Money = ({ v }: { v: number }) => <>{nfIN.format(Number.isFinite(v) ? v : 0)}</>;

const hhmm = (min: number) => `${Math.floor(min / 60)}h ${min % 60}m`;

function toInt(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.floor(v));
}

function normalizePax(input?: any): PaxConfig {
  const src = input ?? {};

  const adults = toInt(src.adults ?? src.adult ?? src.ADT ?? src.adt ?? src.noOfAdults ?? src.adultCount ?? src.Adults);
  const children = toInt(src.children ?? src.child ?? src.CHD ?? src.chd ?? src.noOfChildren ?? src.childCount ?? src.Children);
  const infants = toInt(src.infants ?? src.infant ?? src.INF ?? src.inf ?? src.noOfInfants ?? src.infantCount ?? src.Infants);

  if (adults + children + infants <= 0) return { adults: 1, children: 0, infants: 0 };
  return { adults, children, infants };
}

/** ✅ seats are only Adults+Children (infants usually not charged same) */
function seatPaxCount(p: PaxConfig) {
  return Math.max(1, (p?.adults || 0) + (p?.children || 0));
}

/** only for display */
function totalPaxCount(p: PaxConfig) {
  return Math.max(1, (p?.adults || 0) + (p?.children || 0) + (p?.infants || 0));
}

function safeStopsLabel(row: RowRT) {
  if (row.stopLabel) return row.stopLabel;
  return row.stops === 0 ? "Non-stop" : row.stops === 1 ? "1 Stop" : `${row.stops} Stops`;
}

function pickCurrentFare(row: RowRT, selected: Selected) {
  if (selected?.flightId === row.id) return selected.fare;
  return undefined;
}

function mergeBaggage(row: RowRT, fare?: FareRT | null) {
  const hand = row.baggage?.handKg ?? fare?.baggage?.handKg;
  const check = row.baggage?.checkKg ?? fare?.baggage?.checkKg;
  const piece = row.baggage?.piece;
  return { hand, check, piece };
}

function getAgentInfo(fare?: FareRT | null) {
  if (!fare) return { agentNet: undefined as number | undefined, commission: undefined as number | undefined };
  let commission = fare.commissionINR;
  let agentNet = fare.agentFareINR;

  if (commission == null && agentNet != null) commission = fare.price - agentNet;
  if (agentNet == null && commission != null) agentNet = fare.price - commission;

  return { agentNet, commission };
}

/** Passenger page expects these keys */
function adaptRowToSelectedFlight(row: RowRT, fare?: FareRT | null) {
  const bag = mergeBaggage(row, fare);
  return {
    id: row.id,
    airline: row.airline,
    logo: row.logo,
    flightNos: row.flightNos,

    fromCity: row.fromCity,
    fromIata: row.fromIata,
    toCity: row.toCity,
    toIata: row.toIata,

    departTime: row.departTime,
    arriveTime: row.arriveTime,
    departDate: row.departDate,
    arriveDate: row.arriveDate,

    stops: row.stops,
    stopLabel: row.stopLabel ?? safeStopsLabel(row),
    durationMin: row.durationMin,

    sector: row.sector,
    refundable: fare?.refundable ?? row.refundable,

    cabin: fare?.cabin ?? "—",
    meal: fare?.meal ?? "—",
    baggage: bag,
  };
}

/* ================= SELECTION SYNC (IMPORTANT) ================= */

function syncSelection(rows: RowRT[], selected: Selected, onSelect: (rowId: string, fare: FareRT) => void) {
  if (!rows?.length) return;

  const first = rows[0];
  const firstFare = first?.fares?.[0];
  if (!firstFare) return;

  if (!selected) {
    onSelect(first.id, firstFare);
    return;
  }

  const row = rows.find((r) => r.id === selected.flightId);
  if (!row) {
    onSelect(first.id, firstFare);
    return;
  }

  const fares = row.fares ?? [];
  if (!fares.length) return;

  const matched = fares.find((f) => f.code === selected.fare?.code);
  if (!matched) {
    onSelect(row.id, fares[0]);
    return;
  }

  const changed =
    matched.price !== selected.fare.price ||
    matched.refundable !== selected.fare.refundable ||
    matched.cabin !== selected.fare.cabin ||
    matched.meal !== selected.fare.meal ||
    matched.label !== selected.fare.label;

  if (changed) onSelect(row.id, matched);
}

/* ================= UI ATOMS ================= */

function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "ok" | "warn" }) {
  const style =
    tone === "ok"
      ? { background: "var(--successSoft, rgba(34,197,94,0.12))", border: `1px solid ${VAR.border}`, color: VAR.text }
      : tone === "warn"
      ? { background: "var(--warnSoft, rgba(245,158,11,0.12))", border: `1px solid ${VAR.border}`, color: VAR.text }
      : { background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.muted };

  return (
    <span className="inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide" style={style}>
      {children}
    </span>
  );
}

function InfoDot({ title }: { title: string }) {
  return (
    <span
      title={title}
      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[11px] font-extrabold"
      style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2, color: VAR.muted }}
    >
      i
    </span>
  );
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

function TimelineRow({ row }: { row: RowRT }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="shrink-0">
        <div className="text-[12px] leading-none font-extrabold" style={{ color: VAR.text }}>
          {row.departTime}
        </div>
        <div className="mt-1 text-[12px]" style={{ color: VAR.muted }}>
          <span className="font-semibold">{row.fromCity}</span>
        </div>
        {row.departDate && (
          <div className="mt-0.5 text-[11px]" style={{ color: VAR.subtle }}>
            {row.departDate}
          </div>
        )}
      </div>

      <div className="min-w-[140px] flex-1">
        <div className="text-center">
          <div className="text-[11px] font-semibold" style={{ color: VAR.muted }}>
            {safeStopsLabel(row)}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <div className="h-px flex-1 border-t border-dashed" style={{ borderColor: VAR.border }} />
            {row.stops > 0 ? (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.muted }}
              >
                {row.stops}
              </span>
            ) : (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: VAR.accentSoft, border: `1px solid ${VAR.border}`, color: VAR.text }}
              >
                Direct
              </span>
            )}
            <div className="h-px flex-1 border-t border-dashed" style={{ borderColor: VAR.border }} />
          </div>

          <div className="text-[11px]" style={{ color: VAR.subtle }}>
            {hhmm(row.durationMin)}
          </div>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="text-[12px] leading-none font-extrabold" style={{ color: VAR.text }}>
          {row.arriveTime}
        </div>
        <div className="mt-1 text-[12px]" style={{ color: VAR.muted }}>
          <span className="font-semibold">{row.toCity}</span>
        </div>
        {row.arriveDate && (
          <div className="mt-0.5 text-[11px]" style={{ color: VAR.subtle }}>
            {row.arriveDate}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= FARE LIST (FULL MODE SUPPORT) ================= */

function FareRadioList({
  row,
  currentFare,
  onPickFare,
  limit = 2,
  groupName,
  seats,
  fareView,
}: {
  row: RowRT;
  currentFare?: FareRT | null;
  onPickFare: (fare: FareRT) => void;
  limit?: number;
  groupName: string;
  seats: number;
  fareView: "SINGLE" | "FULL";
}) {
  const [expanded, setExpanded] = useState(false);
  const fares = row.fares ?? [];
  const visible = expanded ? fares : fares.slice(0, Math.min(limit, fares.length));
  const seatCount = Math.max(1, seats);

  return (
    <div>
      <div className="space-y-2">
        {visible.map((f) => {
          const checked = currentFare?.code === f.code;

          const shown = fareView === "FULL" ? Number(f.price || 0) * seatCount : Number(f.price || 0);
          const subLabel = fareView === "FULL" ? `total • ${seatCount} seat${seatCount > 1 ? "s" : ""}` : "per pax";

          return (
            <label
              key={f.code}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-1 transition"
              style={{
                border: `1px solid ${checked ? VAR.primary : VAR.border}`,
                background: checked ? VAR.primarySoft : VAR.surface,
              }}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name={groupName}
                  checked={checked}
                  onChange={() => onPickFare(f)}
                  style={{ accentColor: "var(--primary, rgb(37,99,235))" }}
                />
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-[14px] font-extrabold leading-none" style={{ color: VAR.text }}>
                      {nfIN.format(shown)}
                    </div>
                    <div className="mt-1 text-[10px] font-semibold" style={{ color: VAR.subtle }}>
                      {subLabel}
                    </div>
                  </div>
                  <InfoDot title={fareTooltip(row, f)} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2, color: VAR.muted }}
                  title={f.label}
                >
                  {f.label}
                </span>
                {f.badge?.text ? (
                  <span
                    className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                    style={{ border: `1px solid ${VAR.border}`, background: VAR.accentSoft, color: VAR.text }}
                  >
                    {f.badge.text}
                  </span>
                ) : null}
              </div>
            </label>
          );
        })}
      </div>

      {fares.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 w-full rounded-md px-3 py-2 text-left text-[12px] font-semibold"
          style={{ border: `1px dashed ${VAR.border}`, background: VAR.surface2, color: VAR.primary }}
        >
          {expanded ? "Show less fares" : `Show more fares (+${fares.length - limit})`}
        </button>
      )}
    </div>
  );
}

/* ================= LEG CARD ================= */

function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-[11px] uppercase tracking-wide" style={{ color: VAR.subtle }}>
        {k}
      </div>
      <div className="text-[12px] font-medium text-right" style={{ color: VAR.text }}>
        {v}
      </div>
    </div>
  );
}

function LegCard({
  row,
  selected,
  onPickFare,
  showCommission,
  groupName,
  shareMode,
  isSelected,
  onToggleSelect,
  seats,
  fareView,
}: {
  row: RowRT;
  selected: Selected;
  onPickFare: (fare: FareRT) => void;
  showCommission: boolean;
  groupName: string;

  shareMode: boolean;
  isSelected: boolean;
  onToggleSelect: (rowId: string) => void;

  seats: number;
  fareView: "SINGLE" | "FULL";
}) {
  const [open, setOpen] = useState(false);

  const currentFare = pickCurrentFare(row, selected);
  const { agentNet, commission } = getAgentInfo(currentFare);
  const refundable = (currentFare?.refundable ?? row.refundable) === "Refundable";

  const bag = mergeBaggage(row, currentFare);
  const baggageText = [
    bag.hand != null ? `${bag.hand}kg hand` : "— hand",
    bag.check != null ? `${bag.check}kg check` : "— check",
    bag.piece ? `(${bag.piece})` : "",
  ]
    .filter(Boolean)
    .join(" • ");

  const seatCount = Math.max(1, seats);

  return (
    <div className="relative overflow-hidden rounded-md shadow-sm" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
      {shareMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(row.id);
          }}
          className="absolute left-3 top-3 z-10 grid h-6 w-6 place-items-center rounded-md text-xs font-extrabold"
          style={{
            border: `1px solid ${VAR.border}`,
            background: isSelected ? VAR.primary : VAR.surface,
            color: isSelected ? VAR.onPrimary : VAR.subtle,
          }}
          aria-label="Select to share"
          title="Select to share"
        >
          ✓
        </button>
      )}

      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${VAR.border}` }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <img src={row.logo} className="h-9 w-9 object-contain" alt={row.airline} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold" style={{ color: VAR.text }}>
                {row.airline}
              </div>
              <div className="text-[12px]" style={{ color: VAR.subtle }}>
                {row.flightNos}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <TimelineRow row={row} />
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Pill tone={refundable ? "ok" : "warn"}>{refundable ? "Refundable" : "Non-Refundable"}</Pill>
          {row.extras?.map((x) => (
            <Pill key={x}>{x}</Pill>
          ))}
          {row.sector === "INTL" ? <Pill>INTL</Pill> : <Pill>DOM</Pill>}
          {fareView === "FULL" ? <Pill>{`FULL • ${seatCount} seat${seatCount > 1 ? "s" : ""}`}</Pill> : <Pill>PER PAX</Pill>}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-12 lg:col-span-8">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: VAR.subtle }}>
              Fare option
            </div>

            <FareRadioList
              row={row}
              currentFare={currentFare}
              onPickFare={onPickFare}
              limit={2}
              groupName={groupName}
              seats={seats}
              fareView={fareView}
            />
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-start justify-between gap-3 lg:flex-col lg:items-end">
              <div className="w-full lg:w-auto lg:text-right">
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="mt-1 inline-flex items-center gap-2 rounded-md px-3 py-2 text-[12px] font-semibold"
                  style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2, color: VAR.text }}
                >
                  {open ? "Hide details" : "View details"}
                  <span className={cn("transition-transform", open && "rotate-180")}>▾</span>
                </button>
              </div>
            </div>

            {showCommission && (agentNet != null || commission != null) && (
              <div className="mt-3 w-full rounded-md px-3 py-2.5" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2 }}>
                <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: VAR.subtle }}>
                  B2B
                </div>
                <div className="mt-1 flex flex-col gap-1 text-[12px]">
                  {agentNet != null && (
                    <span className="font-semibold" style={{ color: VAR.text }}>
                      Net: <Money v={fareView === "FULL" ? agentNet * seatCount : agentNet} />
                    </span>
                  )}
                  {commission != null && (
                    <span className="font-semibold" style={{ color: VAR.text }}>
                      Comm: <Money v={fareView === "FULL" ? commission * seatCount : commission} />
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="px-4 py-4" style={{ borderTop: `1px solid ${VAR.border}`, background: VAR.surface2 }}>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-md p-4" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
              <div className="text-[12px] font-semibold" style={{ color: VAR.text }}>
                Flight details
              </div>
              <div className="mt-3 space-y-2.5">
                <KV k="Route" v={`${row.fromCity} (${row.fromIata}) → ${row.toCity} (${row.toIata})`} />
                <KV k="Duration" v={hhmm(row.durationMin)} />
                <KV k="Stops" v={safeStopsLabel(row)} />
                <KV k="Carrier" v={row.airline} />
                <KV k="Flight no." v={row.flightNos} />
              </div>
            </div>

            <div className="rounded-md p-4" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
              <div className="text-[12px] font-semibold" style={{ color: VAR.text }}>
                Fare details
              </div>
              <div className="mt-3 space-y-2.5">
                <KV k="Fare" v={`${currentFare?.label ?? "—"}${currentFare?.code ? ` (${currentFare.code})` : ""}`} />
                <KV k="Refundable" v={currentFare?.refundable ?? row.refundable} />
                <KV k="Cabin" v={currentFare?.cabin ?? "—"} />
                <KV k="Meal" v={currentFare?.meal ?? "—"} />
                <KV k="Baggage" v={baggageText} />
                <KV k="Seat" v={currentFare?.seat ?? "—"} />
              </div>

              {currentFare?.price != null && (
                <div className="mt-3 rounded-md p-3 text-[12px] font-semibold" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2, color: VAR.text }}>
                  <div className="flex items-center justify-between">
                    <span style={{ color: VAR.subtle }}>{fareView === "FULL" ? `Price (total • ${seatCount} seats)` : "Price (per pax)"}</span>
                    <span style={{ color: VAR.text, fontWeight: 900 }}>
                      {nfIN.format(fareView === "FULL" ? currentFare.price * seatCount : currentFare.price)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {row.sector === "INTL" && (
            <div className="mt-3 rounded-md p-4 text-[12px] font-medium" style={{ border: `1px solid ${VAR.border}`, background: VAR.accentSoft, color: VAR.text }}>
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
  paxConfig: PaxConfig;
  showCommission: boolean;
  onBookNow?: () => void;

  fareView?: "SINGLE" | "FULL";
};

type TabKey = "flight" | "fare" | "cancel" | "date";

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 text-[12px] font-semibold border-b-2 transition"
      style={{
        borderColor: active ? VAR.accent : "transparent",
        color: active ? VAR.onDark : VAR.onDarkSubtle,
      }}
    >
      {children}
    </button>
  );
}

function SegmentMini({
  title,
  seg,
  seats,
  fareView,
}: {
  title: string;
  seg?: { row: RowRT; fare: FareRT };
  seats: number;
  fareView: "SINGLE" | "FULL";
}) {
  const row = seg?.row;
  const fare = seg?.fare;

  const shownFare = useMemo(() => {
    const perPax = Number(fare?.price || 0);
    return fareView === "FULL" ? perPax * Math.max(1, seats) : perPax;
  }, [fare?.price, fareView, seats]);

  return (
    <div className="rounded-md p-4" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold" style={{ color: VAR.muted }}>
            {title}
          </div>
          <div className="mt-1 text-[13px] font-semibold truncate" style={{ color: VAR.text }}>
            {row ? `${row.fromCity} → ${row.toCity}${row.departDate ? ` • ${row.departDate}` : ""}` : "—"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[12px]" style={{ color: VAR.subtle }}>
            {fareView === "FULL"
              ? `Fare (total • ${Math.max(1, seats)} seat${Math.max(1, seats) > 1 ? "s" : ""})`
              : "Fare (per pax)"}
          </div>
          <div className="text-[14px] font-extrabold" style={{ color: VAR.text }}>
            {fare ? nfIN.format(shownFare) : "—"}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-md p-3" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2 }}>
        <div className="flex items-center gap-3">
          {row?.logo ? (
            <img src={row.logo} alt={row.airline} className="h-8 w-8 object-contain rounded" />
          ) : (
            <div className="h-8 w-8 rounded" style={{ background: VAR.surface }} />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold truncate" style={{ color: VAR.text }}>
              {row ? row.airline : "—"}{" "}
              {row?.flightNos ? <span style={{ color: VAR.subtle, fontWeight: 600 }}>| {row.flightNos}</span> : null}
            </div>
            <div className="mt-0.5 text-[12px]" style={{ color: VAR.subtle }}>
              {fare?.refundable ?? row?.refundable ?? "—"}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-12 gap-3 items-center">
          <div className="col-span-5">
            <div className="text-[20px] font-extrabold leading-none" style={{ color: VAR.text }}>
              {row?.departTime ?? "—"}
            </div>
            <div className="mt-1 text-[12px]" style={{ color: VAR.subtle }}>
              {row?.fromIata ?? "—"} {row?.fromCity ? `• ${row.fromCity}` : ""}
            </div>
          </div>

          <div className="col-span-2 text-center">
            <div className="text-[12px] font-semibold" style={{ color: VAR.text }}>
              {row ? hhmm(row.durationMin) : "—"}
            </div>
            <div className="mt-1 text-[12px]" style={{ color: VAR.subtle }}>
              {row?.stopLabel ?? (row ? (row.stops === 0 ? "Non-stop" : `${row.stops} stop(s)`) : "")}
            </div>
          </div>

          <div className="col-span-5 text-right">
            <div className="text-[20px] font-extrabold leading-none" style={{ color: VAR.text }}>
              {row?.arriveTime ?? "—"}
            </div>
            <div className="mt-1 text-[12px]" style={{ color: VAR.subtle }}>
              {row?.toIata ?? "—"} {row?.toCity ? `• ${row.toCity}` : ""}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 text-[12px]">
          <div>
            <div className="font-semibold uppercase tracking-wide text-[11px]" style={{ color: VAR.subtle }}>
              Baggage
            </div>
            <div className="mt-1" style={{ color: VAR.text }}>
              {(() => {
                const hand = row?.baggage?.handKg ?? fare?.baggage?.handKg;
                const check = row?.baggage?.checkKg ?? fare?.baggage?.checkKg;
                if (hand == null && check == null) return "—";
                return `${hand ?? "—"}kg / ${check ?? "—"}kg`;
              })()}
            </div>
          </div>

          <div>
            <div className="font-semibold uppercase tracking-wide text-[11px]" style={{ color: VAR.subtle }}>
              Meal
            </div>
            <div className="mt-1" style={{ color: VAR.text }}>
              {fare?.meal ?? "—"}
            </div>
          </div>

          <div>
            <div className="font-semibold uppercase tracking-wide text-[11px]" style={{ color: VAR.subtle }}>
              Cabin
            </div>
            <div className="mt-1" style={{ color: VAR.text }}>
              {fare?.cabin ?? "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SummaryBar({
  out,
  inn,
  paxConfig,
  showCommission,
  onBookNow,
  fareView = "SINGLE",
}: SummaryBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<TabKey>("flight");

  const pax = useMemo(() => normalizePax(paxConfig), [paxConfig?.adults, paxConfig?.children, paxConfig?.infants]);

  const seats = useMemo(() => seatPaxCount(pax), [pax]);
  const totalPax = useMemo(() => totalPaxCount(pax), [pax]);

  const perPaxTotal = useMemo(
    () => Number(out?.fare?.price || 0) + Number(inn?.fare?.price || 0),
    [out?.fare?.price, inn?.fare?.price]
  );

  const grandTotal = useMemo(() => perPaxTotal * seats, [perPaxTotal, seats]);

  const outShown = useMemo(() => {
    const perPax = Number(out?.fare?.price || 0);
    return fareView === "FULL" ? perPax * seats : perPax;
  }, [out?.fare?.price, fareView, seats]);

  const inShown = useMemo(() => {
    const perPax = Number(inn?.fare?.price || 0);
    return fareView === "FULL" ? perPax * seats : perPax;
  }, [inn?.fare?.price, fareView, seats]);

  const mainTotalShown = useMemo(() => {
    return fareView === "FULL" ? grandTotal : perPaxTotal;
  }, [fareView, grandTotal, perPaxTotal]);

  const outAgent = useMemo(() => getAgentInfo(out?.fare), [out?.fare]);
  const inAgent = useMemo(() => getAgentInfo(inn?.fare), [inn?.fare]);

  const totalNetAll = useMemo(() => {
    const perPaxNet = Number(outAgent.agentNet || 0) + Number(inAgent.agentNet || 0);
    return perPaxNet * seats;
  }, [outAgent.agentNet, inAgent.agentNet, seats]);

  const totalCommAll = useMemo(() => {
    const perPaxComm = Number(outAgent.commission || 0) + Number(inAgent.commission || 0);
    return perPaxComm * seats;
  }, [outAgent.commission, inAgent.commission, seats]);

  const canBook = Boolean(out?.row && out?.fare && inn?.row && inn?.fare);

  return (
    <div className="sticky bottom-0 z-30 mt-6">
      <div
        className="overflow-hidden rounded-md shadow-lg"
        style={{ border: `1px solid ${VAR.border}`, background: VAR.darkBg, color: VAR.onDark }}
      >
        {expanded && (
          <div style={{ borderBottom: `1px solid ${VAR.onDarkBorder}`, background: VAR.onDarkPaneBg }}>
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
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
                style={{ border: `1px solid ${VAR.onDarkBtnBorder}`, background: VAR.onDarkBtnBg, color: VAR.onDark }}
              >
                Close
              </button>
            </div>

            <div className="px-4 pb-4 pt-3">
              {tab === "flight" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SegmentMini title="Outbound" seg={out} seats={seats} fareView={fareView} />
                  <SegmentMini title="Inbound" seg={inn} seats={seats} fareView={fareView} />
                </div>
              )}

              {tab === "fare" && (
                <div className="rounded-md p-4 text-[13px]" style={{ border: `1px solid ${VAR.onDarkCardBorder}`, background: VAR.onDarkCardBg }}>
                  <div className="font-semibold">Fare Summary</div>

                  <div className="mt-2 flex items-center justify-between" style={{ color: VAR.onDarkMuted }}>
                    <span>Outbound ({fareView === "FULL" ? `total • ${seats} seats` : "per pax"})</span>
                    <span className="font-semibold" style={{ color: VAR.onDark }}>
                      {out ? nfIN.format(outShown) : "—"}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between" style={{ color: VAR.onDarkMuted }}>
                    <span>Inbound ({fareView === "FULL" ? `total • ${seats} seats` : "per pax"})</span>
                    <span className="font-semibold" style={{ color: VAR.onDark }}>
                      {inn ? nfIN.format(inShown) : "—"}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 space-y-1" style={{ borderTop: `1px solid ${VAR.onDarkBorder}` }}>
                    <div className="flex items-center justify-between" style={{ color: VAR.onDarkMuted }}>
                      <span>Per pax total</span>
                      <span className="font-extrabold" style={{ color: VAR.onDark }}>
                        {nfIN.format(perPaxTotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between" style={{ color: VAR.onDarkMuted }}>
                      <span>
                        Pax ({pax.adults}A {pax.children}C {pax.infants}I)
                      </span>
                      <span className="font-semibold" style={{ color: VAR.onDark }}>
                        Seats: {seats}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold" style={{ color: VAR.onDarkMuted }}>
                        Grand total
                      </span>
                      <span className="font-extrabold text-[15px]" style={{ color: VAR.onDark }}>
                        {nfIN.format(grandTotal)}
                      </span>
                    </div>

                    {showCommission && (totalNetAll > 0 || totalCommAll > 0) && (
                      <div className="mt-2 text-[12px] font-semibold">
                        {totalNetAll > 0 && <span style={{ color: VAR.okOnDark }}>Net: {nfIN.format(totalNetAll)}</span>}
                        {totalCommAll > 0 && (
                          <span className="ml-2" style={{ color: VAR.warnOnDark }}>
                            Comm: {nfIN.format(totalCommAll)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {totalPax !== seats && (
                    <div className="mt-3 text-[12px]" style={{ color: VAR.onDarkSubtle }}>
                      Note: Infants (I) usually have separate fare rules and are not included in seat fare total here.
                    </div>
                  )}
                </div>
              )}

              {tab === "cancel" && (
                <div className="rounded-md p-4 text-[13px]" style={{ border: `1px solid ${VAR.onDarkCardBorder}`, background: VAR.onDarkCardBg }}>
                  <div className="font-semibold">Cancellation</div>
                  <div className="mt-2" style={{ color: VAR.onDarkMuted }}>
                    API cancellation rules yaha plug kar do.
                  </div>
                </div>
              )}

              {tab === "date" && (
                <div className="rounded-md p-4 text-[13px]" style={{ border: `1px solid ${VAR.onDarkCardBorder}`, background: VAR.onDarkCardBg }}>
                  <div className="font-semibold">Date Change</div>
                  <div className="mt-2" style={{ color: VAR.onDarkMuted }}>
                    API date-change rules yaha plug kar do.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* bottom bar */}
        <div className="grid grid-cols-12 items-center gap-0">
          {/* OUT */}
          <div className="col-span-12 md:col-span-4 px-4 py-3" style={{ borderRight: `1px solid ${VAR.onDarkBorder}` }}>
            <div className="text-[12px] font-semibold" style={{ color: VAR.onDarkMuted }}>
              Departure <span style={{ color: VAR.onDarkFaint }}>•</span>{" "}
              <span style={{ color: VAR.onDark }}>{out?.row.airline ?? "—"}</span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-[14px] font-extrabold">
              <span>{out?.row.departTime ?? "—"}</span>
              <span style={{ color: VAR.onDarkFaint }}>→</span>
              <span>{out?.row.arriveTime ?? "—"}</span>
              <span className="ml-auto">{out ? nfIN.format(outShown) : "—"}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setExpanded(true);
                setTab("flight");
              }}
              className="mt-1 text-[12px] font-semibold"
              style={{ color: VAR.linkOnDark }}
            >
              Flight Details
            </button>
          </div>

          {/* IN */}
          <div className="col-span-12 md:col-span-4 px-4 py-3" style={{ borderRight: `1px solid ${VAR.onDarkBorder}` }}>
            <div className="text-[12px] font-semibold" style={{ color: VAR.onDarkMuted }}>
              Return <span style={{ color: VAR.onDarkFaint }}>•</span>{" "}
              <span style={{ color: VAR.onDark }}>{inn?.row.airline ?? "—"}</span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-[14px] font-extrabold">
              <span>{inn?.row.departTime ?? "—"}</span>
              <span style={{ color: VAR.onDarkFaint }}>→</span>
              <span>{inn?.row.arriveTime ?? "—"}</span>
              <span className="ml-auto">{inn ? nfIN.format(inShown) : "—"}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setExpanded(true);
                setTab("flight");
              }}
              className="mt-1 text-[12px] font-semibold"
              style={{ color: VAR.linkOnDark }}
            >
              Flight Details
            </button>
          </div>

          {/* TOTAL */}
          <div className="col-span-12 md:col-span-4 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold" style={{ color: VAR.onDarkMuted }}>
                  {fareView === "FULL" ? "Grand Total" : "Per Pax Total"}
                </div>

                <div className="text-[22px] leading-none font-extrabold">{nfIN.format(mainTotalShown)}</div>

                <div className="mt-1 text-[12px] font-semibold" style={{ color: VAR.onDarkSubtle }}>
                  {fareView === "FULL"
                    ? `Per pax: ${nfIN.format(perPaxTotal)} • Seats: ${seats} • Pax: ${pax.adults}A ${pax.children}C ${pax.infants}I`
                    : `Grand total: ${nfIN.format(grandTotal)} • Seats: ${seats} • Pax: ${pax.adults}A ${pax.children}C ${pax.infants}I`}
                </div>

                {showCommission && (totalNetAll > 0 || totalCommAll > 0) && (
                  <div className="mt-1 text-[12px] font-semibold">
                    {totalNetAll > 0 && <span style={{ color: VAR.okOnDark }}>Net: {nfIN.format(totalNetAll)}</span>}
                    {totalCommAll > 0 && (
                      <span className="ml-2" style={{ color: VAR.warnOnDark }}>
                        Comm: {nfIN.format(totalCommAll)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onBookNow}
                  disabled={!canBook}
                  className="rounded-md px-4 py-2 text-[12px] font-extrabold"
                  style={{
                    background: canBook ? VAR.primary : "var(--disabledBg, rgba(255,255,255,0.12))",
                    color: VAR.onDark,
                    cursor: canBook ? "pointer" : "not-allowed",
                    opacity: canBook ? 1 : 0.7,
                  }}
                >
                  BOOK NOW
                </button>

                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="h-9 w-9 rounded-full grid place-items-center"
                  style={{ border: `1px solid ${VAR.onDarkBtnBorder}`, background: VAR.onDarkBtnBg, color: VAR.onDark }}
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

/* ================= SHARE HELPERS ================= */

function buildShareText(items: Array<{ leg: "Outbound" | "Inbound"; row: RowRT; fare: FareRT }>) {
  const lines: string[] = [];
  lines.push("✈️ Round Trip Options");

  for (const it of items) {
    const r = it.row;
    const f = it.fare;
    lines.push("");
    lines.push(`— ${it.leg} —`);
    lines.push(`${r.airline} ${r.flightNos}`);
    lines.push(`${r.fromIata} (${r.fromCity}) → ${r.toIata} (${r.toCity})`);
    lines.push(`Time: ${r.departTime} - ${r.arriveTime} | Stops: ${safeStopsLabel(r)}`);
    if (r.departDate) lines.push(`Date: ${r.departDate}`);
    lines.push(`Fare: ${f.label} | ${f.refundable}`);
    lines.push(`Price: ${nfIN.format(f.price)}`);
  }

  return lines.join("\n");
}

function buildShareMessage(text: string, url?: string) {
  const parts = [text.trim(), url ? `\n\nLink: ${url}` : ""].filter(Boolean);
  return parts.join("");
}

function IconButton({
  title,
  onClick,
  children,
  disabled,
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-9 w-9 rounded-md grid place-items-center"
      style={{
        border: `1px solid ${VAR.border}`,
        background: VAR.surface,
        color: VAR.text,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      aria-label={title}
    >
      {children}
    </button>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.7 15l-1.1 4 4.1-1.1A10 10 0 1 0 12 2zm5.8 14.5c-.2.6-1 1.1-1.6 1.2-.4.1-.9.1-1.5-.1-.4-.1-.9-.3-1.6-.6-2.7-1.2-4.4-4-4.5-4.2-.1-.2-1.1-1.4-1.1-2.7 0-1.2.6-1.8.8-2 .2-.2.5-.3.7-.3h.5c.1 0 .3 0 .4.4.2.5.6 1.7.7 1.8.1.2.1.3 0 .5-.1.2-.2.3-.3.4-.2.2-.3.3-.5.5-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.3 2.5 1.5.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.8.3.1.5.2.6.3.1.1.1.6-.1 1.2z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm4 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h12v14z" />
    </svg>
  );
}

function readPaxFromQuery(search: string): PaxConfig | null {
  try {
    const qs = new URLSearchParams(search);
    const adults = Number(qs.get("adt") || "1");
    const children = Number(qs.get("chd") || "0");
    const infants = Number(qs.get("inf") || "0");
    return normalizePax({ adults, children, infants });
  } catch {
    return null;
  }
}

/* ================= MAIN ================= */

function readPaxFromSession(): PaxConfig | null {
  try {
    for (const key of SEARCH_KEYS) {
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const p = parsed?.paxConfig ?? parsed?.pax ?? parsed?.pricing?.pax;
      if (p) return normalizePax(p);
    }
  } catch {}
  return null;
}

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
  paxConfig,
  fareView = "SINGLE",
}: Props) {
  const nav = useNavigate();
  const loc = useLocation();

  // ✅ robust pax source
  const pax = useMemo(() => {
    const fromProps = normalizePax(paxConfig);

    const looksDefault = fromProps.adults === 1 && fromProps.children === 0 && fromProps.infants === 0;

    const fromStateRaw = (loc.state as any)?.paxConfig ?? (loc.state as any)?.pax ?? (loc.state as any)?.pricing?.pax;
    const fromState = fromStateRaw ? normalizePax(fromStateRaw) : null;
    if (fromState && looksDefault) return fromState;

    const fromQuery = looksDefault ? readPaxFromQuery(loc.search) : null;
    if (fromQuery) return fromQuery;

    const fromSS = looksDefault ? readPaxFromSession() : null;
    return fromSS ?? fromProps;
  }, [paxConfig, loc.state, loc.search]);

  const seats = useMemo(() => seatPaxCount(pax), [pax]);

  // ✅ selection sync (rows refresh safe)
  useEffect(() => {
    syncSelection(outboundRows, selectedOutbound, onSelectOutboundFare);
  }, [outboundRows, selectedOutbound, onSelectOutboundFare]);

  useEffect(() => {
    syncSelection(returnRows, selectedReturn, onSelectReturnFare);
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

  /* ✅ SHARE MODE */
  const [shareMode, setShareMode] = useState(false);
  const [selectedOutIds, setSelectedOutIds] = useState<Set<string>>(new Set());
  const [selectedInIds, setSelectedInIds] = useState<Set<string>>(new Set());
  const [copyDone, setCopyDone] = useState(false);

  const clearShareSelection = () => {
    setSelectedOutIds(new Set());
    setSelectedInIds(new Set());
  };

  const toggleOut = (id: string) => {
    setSelectedOutIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleIn = (id: string) => {
    setSelectedInIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedOutIds(new Set(outboundRows.map((r) => r.id)));
    setSelectedInIds(new Set(returnRows.map((r) => r.id)));
  };

  const selectedCount = selectedOutIds.size + selectedInIds.size;

  const shareItems = useMemo(() => {
    const items: Array<{ leg: "Outbound" | "Inbound"; row: RowRT; fare: FareRT }> = [];

    for (const r of outboundRows) {
      if (!selectedOutIds.has(r.id)) continue;
      const f = pickCurrentFare(r, selectedOutbound) ?? r.fares?.[0];
      if (f) items.push({ leg: "Outbound", row: r, fare: f });
    }

    for (const r of returnRows) {
      if (!selectedInIds.has(r.id)) continue;
      const f = pickCurrentFare(r, selectedReturn) ?? r.fares?.[0];
      if (f) items.push({ leg: "Inbound", row: r, fare: f });
    }

    return items;
  }, [outboundRows, returnRows, selectedOutIds, selectedInIds, selectedOutbound, selectedReturn]);

  const sharePayload = useMemo(() => {
    return {
      title: "Round Trip Options",
      text: shareItems.length ? buildShareText(shareItems) : "No flights selected.",
      url: window.location.href,
    };
  }, [shareItems]);

  const shareMessage = useMemo(() => buildShareMessage(sharePayload.text, sharePayload.url), [sharePayload.text, sharePayload.url]);

  const onShareWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const onShareEmail = () => {
    const subject = sharePayload.title;
    const body = shareMessage;
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 1200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareMessage;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        setCopyDone(true);
        window.setTimeout(() => setCopyDone(false), 1200);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  /* ================= ✅ BOOK NOW (ROUNDTRIP) ================= */

  const onBookNow = () => {
    if (!pickedOut?.row || !pickedOut?.fare || !pickedIn?.row || !pickedIn?.fare) {
      alert("Please select both outbound and return flights to continue.");
      return;
    }

    const paxFixed = normalizePax(pax);
    const seatCount = seatPaxCount(paxFixed);

    const onwardFlight = adaptRowToSelectedFlight(pickedOut.row, pickedOut.fare);
    const returnFlight = adaptRowToSelectedFlight(pickedIn.row, pickedIn.fare);

    const onwardPerPax = Number(pickedOut.fare.price || 0);
    const returnPerPax = Number(pickedIn.fare.price || 0);
    const perPaxSell = onwardPerPax + returnPerPax;

    const outAgent = getAgentInfo(pickedOut.fare);
    const inAgent = getAgentInfo(pickedIn.fare);

    const agentNetPerPax =
      outAgent.agentNet != null && inAgent.agentNet != null
        ? Number(outAgent.agentNet) + Number(inAgent.agentNet)
        : outAgent.agentNet != null
        ? Number(outAgent.agentNet)
        : inAgent.agentNet != null
        ? Number(inAgent.agentNet)
        : undefined;

    const commissionPerPax =
      outAgent.commission != null && inAgent.commission != null
        ? Number(outAgent.commission) + Number(inAgent.commission)
        : outAgent.commission != null
        ? Number(outAgent.commission)
        : inAgent.commission != null
        ? Number(inAgent.commission)
        : undefined;

    const pricing = {
      currency: "INR",
      perTraveller: perPaxSell,

      // ✅ totals by seats only
      totalFare: perPaxSell * seatCount,

      pax: paxFixed,
      seatCount,

      legWise: { onwardPerPax, returnPerPax },

      agentNetPerPax,
      agentNetTotal: agentNetPerPax != null ? agentNetPerPax * seatCount : undefined,

      commissionPerPax,
      commissionTotal: commissionPerPax != null ? commissionPerPax * seatCount : undefined,

      marginPerPax: agentNetPerPax != null ? Math.max(0, perPaxSell - agentNetPerPax) : undefined,
      marginTotal: agentNetPerPax != null ? Math.max(0, (perPaxSell - agentNetPerPax) * seatCount) : undefined,
    };

    const ctx = {
      tripType: "ROUNDTRIP",

      selectedFlightOnward: onwardFlight,
      selectedFlightReturn: returnFlight,

      selectedFareOnward: pickedOut.fare,
      selectedFareReturn: pickedIn.fare,

      pricing,

      paxConfig: paxFixed,
      pax: paxFixed,

      createdAt: Date.now(),
      _debug: { source: "RoundTripResultList", paxFixed, seatCount },
    };

    sessionStorage.setItem(SS_KEY, JSON.stringify(ctx));
    nav("/flights/passenger-details", { state: ctx });
  };

  return (
    <div className="space-y-5">
      {/* ✅ Share top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
        <div className="text-sm font-semibold" style={{ color: VAR.text }}>
          Round Trip Results
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShareMode((s) => !s);
              clearShareSelection();
            }}
            className="rounded-md px-3 py-1.5 text-xs font-semibold"
            style={{
              border: `1px solid ${VAR.border}`,
              background: shareMode ? VAR.primary : VAR.surface,
              color: shareMode ? VAR.onPrimary : VAR.text,
            }}
          >
            {shareMode ? "Exit Share Mode" : "Share"}
          </button>

          {shareMode && (
            <>
              <button
                type="button"
                onClick={selectAll}
                className="rounded-md px-3 py-1.5 text-xs font-semibold"
                style={{ border: `1px solid ${VAR.border}`, background: VAR.surface, color: VAR.text }}
              >
                Select All
              </button>

              <button
                type="button"
                onClick={clearShareSelection}
                className="rounded-md px-3 py-1.5 text-xs font-semibold"
                style={{ border: `1px solid ${VAR.border}`, background: VAR.surface, color: VAR.text }}
              >
                Clear
              </button>

              <div className="text-xs" style={{ color: VAR.muted }}>
                Selected: <span style={{ color: VAR.text, fontWeight: 800 }}>{selectedCount}</span>
              </div>

              {selectedCount > 0 && (
                <div className="ml-2 flex items-center gap-2">
                  <IconButton title="Share via WhatsApp" onClick={onShareWhatsApp}>
                    <WhatsAppIcon />
                  </IconButton>

                  <IconButton title="Share via Email" onClick={onShareEmail}>
                    <MailIcon />
                  </IconButton>

                  <IconButton title={copyDone ? "Copied!" : "Copy"} onClick={onCopy}>
                    <CopyIcon />
                  </IconButton>

                  {copyDone && (
                    <span className="text-[12px] font-semibold" style={{ color: VAR.text }}>
                      Copied!
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* OUTBOUND */}
        <div className="col-span-12 md:col-span-6 space-y-3">
       

          {outboundRows.length === 0 &&
            (emptyOutboundNode ?? (
              <div className="rounded-md p-4 text-sm" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface, color: VAR.muted }}>
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
              groupName={`out-fare-${r.id}`}
              shareMode={shareMode}
              isSelected={selectedOutIds.has(r.id)}
              onToggleSelect={toggleOut}
              seats={seats}
              fareView={fareView}
            />
          ))}
        </div>

        {/* RETURN */}
        <div className="col-span-12 md:col-span-6 space-y-3">


          {returnRows.length === 0 &&
            (emptyReturnNode ?? (
              <div className="rounded-md p-4 text-sm" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface, color: VAR.muted }}>
                No return flights found.
              </div>
            ))}

          {/* ✅ IMPORTANT: return side uses selectedReturn/onSelectReturnFare/toggleIn */}
          {returnRows.map((r) => (
            <LegCard
              key={r.id}
              row={r}
              selected={selectedReturn}
              onPickFare={(f) => onSelectReturnFare(r.id, f)}
              showCommission={showCommission}
              groupName={`in-fare-${r.id}`}
              shareMode={shareMode}
              isSelected={selectedInIds.has(r.id)}
              onToggleSelect={toggleIn}
              seats={seats}
              fareView={fareView}
            />
          ))}
        </div>
      </div>

      {/* ✅ Book Now summary */}
      <SummaryBar
        out={pickedOut}
        inn={pickedIn}
        paxConfig={pax}
        showCommission={showCommission}
        onBookNow={onBookNow}
        fareView={fareView}
      />
    </div>
  );
}
