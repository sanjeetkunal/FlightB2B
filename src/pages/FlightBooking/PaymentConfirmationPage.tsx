// src/pages/PaymentConfirmationPage.tsx
// ✅ COMPLETE DROP-IN (Enterprise UI + Proper Flight Details like Oneway style)
// ✅ No static colors (only CSS variables)
// ✅ Seats support: ONEWAY (array) + ROUNDTRIP ({ onward, return })
// ✅ Flight details UI: route header + leg cards + segment breakdown (Outbound/Return)
// ✅ Ticket mapping fixed (uses robust flight build)
// ✅ Stores BOOKING_CONFIRM_CTX_V1 for BookingConfirmationPage
// ✅ Stores optional ticket in sessionStorage

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  MapPin,
  Users,
  Armchair,
  BadgeCheck,
  CreditCard,
  Wallet,
  ChevronRight,
} from "lucide-react";

/** ================== Theme Vars (avoid hard static colors) ================== */
const VAR = {
  page: "var(--page, rgba(248,250,252,1))",
  surface: "var(--surface, rgba(255,255,255,0.92))",
  surface2: "var(--surface2, rgba(248,250,252,0.92))",
  border: "var(--border, rgba(15,23,42,0.12))",
  text: "var(--text, rgba(15,23,42,0.92))",
  muted: "var(--muted, rgba(71,85,105,0.9))",
  subtle: "var(--subtle, rgba(100,116,139,0.85))",
  primary: "var(--primary, rgba(37,99,235,1))",
  primarySoft: "var(--primarySoft, rgba(37,99,235,0.14))",
  accent: "var(--accent, rgba(16,182,217,1))",
  accentSoft: "var(--accentSoft, rgba(16,182,217,0.12))",
  success: "var(--success, rgba(34,197,94,1))",
  successSoft: "var(--successSoft, rgba(34,197,94,0.12))",
  warn: "var(--warn, rgba(245,158,11,1))",
  warnSoft: "var(--warnSoft, rgba(245,158,11,0.14))",
  danger: "var(--danger, rgba(244,63,94,1))",
  onPrimary: "var(--onPrimary, rgba(255,255,255,1))",
  shadow: "var(--shadow, 0 14px 30px rgba(2,6,23,0.10))",
  shadowSm: "var(--shadowSm, 0 8px 18px rgba(2,6,23,0.08))",
};

const nfIN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ================== Storage keys ================== */
const BOOKING_SS_KEY = "BOOKING_PAYLOAD_V1";
const TICKET_SS_KEY = "TICKET_CTX_V1";
const BOOKING_CONFIRM_SS_KEY = "BOOKING_CONFIRM_CTX_V1";

/** ================== Payment gateways ================== */
type PaymentGateway = {
  id: string;
  name: string;
  description: string;
  type: "upi" | "card" | "netbanking" | "mixed";
};

const PAYMENT_GATEWAYS: PaymentGateway[] = [
  { id: "razorpay", name: "Razorpay", description: "UPI, Cards, Netbanking, Wallets", type: "mixed" },
  { id: "payu", name: "PayU", description: "Credit / Debit cards, Netbanking & UPI", type: "mixed" },
  { id: "ccavenue", name: "CCAvenue", description: "Multi-bank netbanking and international cards", type: "mixed" },
];

/** ================== Helpers ================== */
function safeParse(json: string | null) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function fmtINR(v: number) {
  return `₹${nfIN.format(Number.isFinite(v) ? v : 0)}`;
}
function safeNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function paxIdToLabel(paxId: string) {
  if (paxId.startsWith("ADT")) return "Adult";
  if (paxId.startsWith("CHD")) return "Child";
  if (paxId.startsWith("INF")) return "Infant";
  return "Traveller";
}
function paxIdToPaxType(paxId: string) {
  if (paxId.startsWith("ADT")) return "ADT";
  if (paxId.startsWith("CHD")) return "CHD";
  if (paxId.startsWith("INF")) return "INF";
  return "ADT";
}

/** ✅ Build robust flight object for UI + Ticket (supports RT payload: onwardFlight/returnFlight) */
function buildRobustFlight(bookingPayload: any) {
  const onwardFlight = bookingPayload?.onwardFlight ?? bookingPayload?.selectedFlightOnward ?? null;
  const returnFlight = bookingPayload?.returnFlight ?? bookingPayload?.selectedFlightReturn ?? null;

  let f = bookingPayload?.flight ?? bookingPayload?.selectedFlight ?? bookingPayload?.flightDetails ?? null;

  // already normalized shape
  if (f?.outbound || f?.inbound || Array.isArray(f?.segments)) return f;

  // synthesize from RT legs
  if (onwardFlight || returnFlight) {
    return {
      tripType: "ROUNDTRIP",
      airline: onwardFlight?.airline || returnFlight?.airline || "",
      flightNos: `${onwardFlight?.flightNos || ""}${returnFlight?.flightNos ? " | " + returnFlight.flightNos : ""}`,
      refundable:
        onwardFlight?.refundable === "Refundable" && returnFlight?.refundable === "Refundable"
          ? "Refundable"
          : "Non-Refundable",
      outbound: { segments: onwardFlight?.segments || [] },
      inbound: { segments: returnFlight?.segments || [] },
    };
  }

  return f;
}

function guessTripLabel(flight: any) {
  if (!flight) return "Flight";
  const t = String(flight.tripType || "").toUpperCase();
  if (t === "ROUNDTRIP" || t === "ROUND") return "Round Trip";
  if (flight.outbound || flight.inbound) return "Round Trip";
  return "One Way";
}
function guessTripType(flight: any): "ONEWAY" | "ROUND" {
  const t = String(flight?.tripType || "").toUpperCase();
  if (t === "ROUNDTRIP" || t === "ROUND") return "ROUND";
  if (flight?.outbound || flight?.inbound) return "ROUND";
  return "ONEWAY";
}
function getSegmentsFromFlight(flight: any) {
  if (!flight) return { outbound: [], inbound: [] as any[] };
  if (flight.outbound?.segments || flight.inbound?.segments) {
    return { outbound: flight.outbound?.segments || [], inbound: flight.inbound?.segments || [] };
  }
  return { outbound: flight.segments || [], inbound: [] };
}

/** ✅ Handles both segment shapes:
 * 1) flat: fromCity/fromIata/departTime
 * 2) nested: from:{city,code,time} to:{city,code,time}
 */
function segSummary(segs: any[]) {
  if (!segs?.length) return "";
  const first = segs[0];
  const last = segs[segs.length - 1];

  const fromCity = first.fromCity ?? first.from?.city ?? "";
  const fromIata = first.fromIata ?? first.from?.code ?? "";
  const toCity = last.toCity ?? last.to?.city ?? "";
  const toIata = last.toIata ?? last.to?.code ?? "";

  const departTime = first.departTime ?? first.from?.time ?? "";
  const arriveTime = last.arriveTime ?? last.to?.time ?? "";

  const from = `${fromCity} (${fromIata})`;
  const to = `${toCity} (${toIata})`;
  const time = `${departTime} → ${arriveTime}`;
  return `${from} → ${to} • ${time}`;
}

function routeLabelFromSegments(outbound: any[], inbound: any[], fallback = "Flight") {
  const pick = (segs: any[]) => {
    if (!segs?.length) return null;
    const first = segs[0];
    const last = segs[segs.length - 1];

    const fromCity = first.fromCity ?? first.from?.city ?? "";
    const fromIata = first.fromIata ?? first.from?.code ?? "";
    const toCity = last.toCity ?? last.to?.city ?? "";
    const toIata = last.toIata ?? last.to?.code ?? "";

    return { fromCity, fromIata, toCity, toIata };
  };

  const o = pick(outbound);
  const r = pick(inbound);

  if (o && r) return `${o.fromCity} (${o.fromIata}) - ${o.toCity} (${o.toIata}) (Round Trip)`;
  if (o) return `${o.fromCity} (${o.fromIata}) - ${o.toCity} (${o.toIata})`;
  return fallback;
}

/** ✅ Seats normalize (ONEWAY array OR ROUNDTRIP object) */
function normalizeSeats(raw: any) {
  if (Array.isArray(raw)) return { type: "ONEWAY" as const, onward: raw, ret: [] as string[] };
  const onward = Array.isArray(raw?.onward) ? raw.onward : [];
  const ret = Array.isArray(raw?.return) ? raw.return : [];
  return { type: "ROUNDTRIP" as const, onward, ret };
}

function toTicketSegments(segs: any[], idPrefix: string) {
  return (segs || []).map((s: any, idx: number) => {
    const fromCity = s.fromCity ?? s.from?.city ?? "";
    const fromIata = s.fromIata ?? s.from?.code ?? "";
    const departTime = s.departTime ?? s.from?.time ?? "";
    const departDate = s.departDate ?? s.from?.date ?? "";

    const toCity = s.toCity ?? s.to?.city ?? "";
    const toIata = s.toIata ?? s.to?.code ?? "";
    const arriveTime = s.arriveTime ?? s.to?.time ?? "";
    const arriveDate = s.arriveDate ?? s.to?.date ?? "";

    return {
      id: `${idPrefix}-${idx + 1}`,
      airlineName: s.airline || s.airlineName || "",
      airlineCode: s.airlineCode || s.code || (s.flightNos ? String(s.flightNos).split(" ")[0] : ""),
      flightNo: s.flightNo || s.flightNos || "",
      from: {
        code: fromIata,
        city: fromCity,
        terminal: s.fromTerminal || s.terminalFrom || s.from?.terminal,
        time: departTime,
        date: departDate,
      },
      to: {
        code: toIata,
        city: toCity,
        terminal: s.toTerminal || s.terminalTo || s.to?.terminal,
        time: arriveTime,
        date: arriveDate,
      },
      durationMins: safeNum(s.durationMins ?? s.duration ?? s.durationMinutes),
      cabin: s.cabin || s.cabinClass || "",
      refundable: s.refundable || "",
      baggage: {
        checkIn: s.baggage?.checkKg ? `${s.baggage.checkKg}KG` : s.baggage?.checkIn,
        cabin: s.baggage?.handKg ? `${s.baggage.handKg}KG` : s.baggage?.cabin,
      },
    };
  });
}

/**
 * ✅ Build TicketData (optional) for later TicketCopyPage use
 * ✅ FIXED: uses robust flight build so RT segments never go missing
 */
function buildTicketFromPayload(args: {
  bookingPayload: any;
  b2b: { grossTotal: number; commissionINR: number; tdsINR: number; agentNetINR: number };
  payment: { method: "wallet" | "gateway"; amount: number; gateway?: string | null };
}) {
  const { bookingPayload, b2b } = args;

  const flight = buildRobustFlight(bookingPayload);
  const paxConfig = bookingPayload?.paxConfig ?? bookingPayload?.pricing?.pax ?? null;
  const paxDetails = bookingPayload?.paxDetails ?? {};
  const pricing = bookingPayload?.pricing ?? {};
  const gst = bookingPayload?.gst ?? { enabled: false };

  const seatPack = normalizeSeats(bookingPayload?.seats?.selectedSeats ?? bookingPayload?.seats?.seats);
  const seatsFlat: string[] = [...seatPack.onward, ...seatPack.ret];

  const { outbound, inbound } = getSegmentsFromFlight(flight);

  const ids = Object.keys(paxDetails || {});
  let paxIds: string[] = ids.length ? ids.slice().sort((a, b) => a.localeCompare(b)) : [];

  if (!paxIds.length && paxConfig) {
    const a = paxConfig?.adults ?? 0;
    const c = paxConfig?.children ?? 0;
    const i = paxConfig?.infants ?? 0;
    for (let x = 0; x < a; x++) paxIds.push(`ADT-${x + 1}`);
    for (let x = 0; x < c; x++) paxIds.push(`CHD-${x + 1}`);
    for (let x = 0; x < i; x++) paxIds.push(`INF-${x + 1}`);
  }

  const passengers = paxIds.map((id, idx) => {
    const d = paxDetails?.[id] || {};
    const sector =
      outbound?.length
        ? `${(outbound[0]?.fromIata ?? outbound[0]?.from?.code ?? "")}-${(outbound[outbound.length - 1]?.toIata ?? outbound[outbound.length - 1]?.to?.code ?? "")}`
        : `${flight?.fromIata ?? ""}-${flight?.toIata ?? ""}`;

    return {
      id,
      title: d.title || "",
      firstName: d.firstName || `Traveller`,
      lastName: d.lastName || `${idx + 1}`,
      airline: flight?.airline || "",
      status: "CONFIRMED",
      sector,
      airlinePnr: "—",
      ticketNumber: "—",
      paxType: paxIdToPaxType(id),
    };
  });

  const now = new Date();
  const bookingDate = now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  const bookingTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const baseFare = safeNum(pricing?.totalFare ?? 0);
  const seatPricePerSeat = safeNum(bookingPayload?.seats?.seatPricePerSeat ?? 250);
  const seatTotal = safeNum(bookingPayload?.seats?.seatTotal ?? seatsFlat.length * seatPricePerSeat);
  const supplierGross = baseFare + seatTotal;

  return {
    brand: { name: "Virtual2Actual Travel", tagline: "B2B Agent Console" },
    bookingId: bookingPayload?.bookingId || `V2A-${Math.floor(100000 + Math.random() * 900000)}`,
    bookingStatus: "CONFIRMED",
    bookingDate,
    bookingTime,
    tripType: guessTripType(flight),
    routeLabel: routeLabelFromSegments(outbound?.length ? outbound : flight?.segments || [], inbound, "Flight"),
    segments: [
      ...toTicketSegments(outbound?.length ? outbound : flight?.segments || [], "OB"),
      ...toTicketSegments(inbound || [], "IB"),
    ],
    passengers,
    fare: {
      baseFare: supplierGross,
      taxes: 0,
      airlineCharges: 0,
      otherCharges: 0,
      discount: 0,
      insurance: 0,
      gst: gst?.enabled ? 0 : 0,
      tds: safeNum(b2b.tdsINR),
    },
    agentPricing: {
      markup: 0,
      serviceFee: 0,
      commissionOverride: safeNum(b2b.commissionINR),
      notes: `Payment: ${args.payment.method === "wallet" ? "Wallet" : `Gateway (${args.payment.gateway || "—"})`}`,
    },
    terms: [
      "All passengers must present valid government ID at check-in.",
      "Name changes are not permitted after ticket issuance.",
      "Baggage allowances may vary by fare family.",
    ],
  };
}

/** ================== Enterprise UI building blocks ================== */
function Card(props: { title?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-xl ${props.className || ""}`}
      style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, boxShadow: VAR.shadowSm }}
    >
      {(props.title || props.right) && (
        <div className="flex items-center justify-between gap-2 px-5 py-4">
          <div className="min-w-0">
            {props.title ? (
              <div className="text-sm font-semibold" style={{ color: VAR.text }}>
                {props.title}
              </div>
            ) : null}
          </div>
          {props.right}
        </div>
      )}
      <div className={`${props.title || props.right ? "px-5 pb-5" : "p-5"}`}>{props.children}</div>
    </section>
  );
}

function Pill(props: { icon?: React.ReactNode; text: React.ReactNode; tone?: "base" | "soft" | "success" | "warn" }) {
  const tone = props.tone || "base";
  const bg =
    tone === "success" ? VAR.successSoft : tone === "warn" ? VAR.warnSoft : tone === "soft" ? VAR.surface2 : VAR.surface;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: bg, border: `1px solid ${VAR.border}`, color: VAR.muted }}
    >
      {props.icon ? <span className="opacity-90">{props.icon}</span> : null}
      <span className="whitespace-nowrap">{props.text}</span>
    </span>
  );
}

function KV(props: { k: React.ReactNode; v: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-xs" style={{ color: VAR.muted }}>
        {props.k}
      </div>
      <div className={`${props.strong ? "font-extrabold" : "font-semibold"} text-right`} style={{ color: VAR.text }}>
        {props.v}
      </div>
    </div>
  );
}

function AirlineBadge(props: { text: string }) {
  const t = String(props.text || "").trim();
  const initials = (t.split(" ").filter(Boolean)[0] || "FL").slice(0, 2).toUpperCase();
  return (
    <div
      className="grid h-10 w-10 place-items-center rounded-xl text-xs font-extrabold"
      style={{
        background: `linear-gradient(135deg, ${VAR.primarySoft}, ${VAR.accentSoft})`,
        border: `1px solid ${VAR.border}`,
        color: VAR.text,
      }}
      title={t}
    >
      {initials}
    </div>
  );
}

function getLegMeta(segs: any[]) {
  if (!segs?.length) return { fromCity: "", fromIata: "", toCity: "", toIata: "", departTime: "", arriveTime: "", stops: 0 };
  const first = segs[0];
  const last = segs[segs.length - 1];

  const fromCity = first.fromCity ?? first.from?.city ?? "";
  const fromIata = first.fromIata ?? first.from?.code ?? "";
  const toCity = last.toCity ?? last.to?.city ?? "";
  const toIata = last.toIata ?? last.to?.code ?? "";

  const departTime = first.departTime ?? first.from?.time ?? "";
  const arriveTime = last.arriveTime ?? last.to?.time ?? "";

  const stops = Math.max(0, (segs?.length || 1) - 1);

  return { fromCity, fromIata, toCity, toIata, departTime, arriveTime, stops };
}

function LegHeader(props: { label: string; segs: any[]; refundable?: string; cabin?: string }) {
  const meta = getLegMeta(props.segs);
  const stopText = meta.stops === 0 ? "Non-stop" : meta.stops === 1 ? "1 Stop" : `${meta.stops} Stops`;
  return (
    <div className="rounded-xl p-4" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: VAR.subtle }}>
            {props.label}
          </div>
          <div className="mt-1 text-base font-extrabold leading-tight" style={{ color: VAR.text }}>
            {meta.fromIata || "—"} <span style={{ color: VAR.subtle }}>→</span> {meta.toIata || "—"}
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: VAR.muted }}>
            {meta.fromCity} • {meta.toCity}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Pill
            tone="soft"
            icon={<Clock className="h-3.5 w-3.5" style={{ color: VAR.muted }} />}
            text={
              <span>
                {meta.departTime || "—"} <span style={{ color: VAR.subtle }}>→</span> {meta.arriveTime || "—"}
              </span>
            }
          />
          <Pill
            tone="soft"
            icon={<MapPin className="h-3.5 w-3.5" style={{ color: VAR.muted }} />}
            text={stopText}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {props.cabin ? <Pill tone="soft" text={`Cabin: ${props.cabin}`} /> : null}
        <Pill tone="soft" text={props.refundable === "Refundable" ? "Refundable" : "Non-refundable"} />
      </div>
    </div>
  );
}

function SegmentRow(props: { seg: any; idx: number; total: number }) {
  const s = props.seg || {};
  const fromCity = s.fromCity ?? s.from?.city ?? "";
  const fromIata = s.fromIata ?? s.from?.code ?? "";
  const departTime = s.departTime ?? s.from?.time ?? "";
  const fromTerminal = s.fromTerminal || s.terminalFrom || s.from?.terminal;

  const toCity = s.toCity ?? s.to?.city ?? "";
  const toIata = s.toIata ?? s.to?.code ?? "";
  const arriveTime = s.arriveTime ?? s.to?.time ?? "";
  const toTerminal = s.toTerminal || s.terminalTo || s.to?.terminal;

  const airlineName = s.airline || s.airlineName || "";
  const flightNo = s.flightNo || s.flightNos || "";

  return (
    <div className="rounded-xl p-4" style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}>
      <div className="flex items-start gap-3">
        <AirlineBadge text={airlineName || flightNo || "FL"} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-extrabold" style={{ color: VAR.text }}>
              {airlineName || "Airline"}
            </div>
            {flightNo ? (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.muted }}>
                {flightNo}
              </span>
            ) : null}

            {props.total > 1 ? (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.subtle }}>
                Segment {props.idx + 1}/{props.total}
              </span>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
              <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: VAR.subtle }}>
                <PlaneTakeoff className="h-4 w-4" style={{ color: VAR.muted }} />
                Departure
              </div>
              <div className="mt-1 text-sm font-extrabold" style={{ color: VAR.text }}>
                {fromIata || "—"}{" "}
                <span className="text-xs font-semibold" style={{ color: VAR.subtle }}>
                  ({fromCity || "—"})
                </span>
              </div>
              <div className="mt-0.5 text-[12px] font-semibold" style={{ color: VAR.text }}>
                {departTime || "—"}
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: VAR.muted }}>
                {fromTerminal ? `Terminal: ${fromTerminal}` : "Terminal: —"}
              </div>
            </div>

            <div className="rounded-xl p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
              <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: VAR.subtle }}>
                <PlaneLanding className="h-4 w-4" style={{ color: VAR.muted }} />
                Arrival
              </div>
              <div className="mt-1 text-sm font-extrabold" style={{ color: VAR.text }}>
                {toIata || "—"}{" "}
                <span className="text-xs font-semibold" style={{ color: VAR.subtle }}>
                  ({toCity || "—"})
                </span>
              </div>
              <div className="mt-0.5 text-[12px] font-semibold" style={{ color: VAR.text }}>
                {arriveTime || "—"}
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: VAR.muted }}>
                {toTerminal ? `Terminal: ${toTerminal}` : "Terminal: —"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ================== Page ================== */
const PaymentConfirmationPage: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();

  // Accept bookingPayload from router state OR sessionStorage fallback
  const bookingPayload = useMemo(() => {
    const fromState = (location.state as any)?.bookingPayload || null;
    const fromSS = safeParse(sessionStorage.getItem(BOOKING_SS_KEY));
    return fromState ?? fromSS ?? null;
  }, [location.state]);

  // persist payload for refresh/back
  useEffect(() => {
    if (!bookingPayload) return;
    sessionStorage.setItem(BOOKING_SS_KEY, JSON.stringify(bookingPayload));
  }, [bookingPayload]);

  const flight = useMemo(() => buildRobustFlight(bookingPayload), [bookingPayload]);

  const paxConfig = bookingPayload?.paxConfig ?? bookingPayload?.pricing?.pax ?? null;
  const contact = bookingPayload?.contact ?? null;
  const paxDetails = bookingPayload?.paxDetails ?? {};
  const pricing = bookingPayload?.pricing ?? {};
  const gst = bookingPayload?.gst ?? { enabled: false };

  // seats normalize (ONEWAY/ROUNDTRIP)
  const seatPricePerSeat = safeNum(bookingPayload?.seats?.seatPricePerSeat ?? 250);
  const seatPack = useMemo(() => normalizeSeats(bookingPayload?.seats?.selectedSeats ?? bookingPayload?.seats?.seats), [bookingPayload]);
  const seatsFlat = useMemo(() => [...seatPack.onward, ...seatPack.ret], [seatPack]);
  const seatTotal = safeNum(bookingPayload?.seats?.seatTotal ?? seatsFlat.length * seatPricePerSeat);

  // totals
  const grossTotal =
    safeNum(pricing?.grossTotal ?? pricing?.finalTotal ?? bookingPayload?.finalTotal ?? 0) ||
    (safeNum(pricing?.totalFare ?? 0) +
      safeNum(seatTotal) +
      safeNum(pricing?.txnFee ?? pricing?.transactionFee ?? 0) +
      safeNum(pricing?.txnCharge ?? pricing?.transactionCharge ?? 0) +
      safeNum(pricing?.gstAmount ?? pricing?.gst ?? 0));

  const travellersCount = useMemo(() => {
    const a = paxConfig?.adults ?? 0;
    const c = paxConfig?.children ?? 0;
    const i = paxConfig?.infants ?? 0;
    const total = a + c + i;
    return total > 0 ? total : Object.keys(paxDetails || {}).length || 1;
  }, [paxConfig, paxDetails]);

  // Agent / commission
  const agentFromPayload = pricing?.agent ?? {};
  const [commissionEdit, setCommissionEdit] = useState<number>(() =>
    Number(agentFromPayload?.commissionTotal ?? pricing?.commissionINR ?? pricing?.commissionTotal ?? 0)
  );
  const [tdsEdit, setTdsEdit] = useState<number>(() =>
    Number(agentFromPayload?.tdsTotal ?? pricing?.tdsINR ?? pricing?.tdsTotal ?? 0)
  );
  const [agentNetOverride, setAgentNetOverride] = useState<number>(() =>
    Number(agentFromPayload?.netPayable ?? pricing?.agentNetINR ?? pricing?.netPayable ?? 0)
  );
  const [useAgentNetOverride, setUseAgentNetOverride] = useState<boolean>(() =>
    Boolean(agentFromPayload?.netPayable ?? pricing?.agentNetINR ?? pricing?.netPayable)
  );

  const computedAgentNet = useMemo(() => {
    if (useAgentNetOverride) return Math.max(0, Number(agentNetOverride || 0));
    const c = Math.max(0, Number(commissionEdit || 0));
    const t = Math.max(0, Number(tdsEdit || 0));
    return Math.max(0, grossTotal - c + t);
  }, [grossTotal, commissionEdit, tdsEdit, agentNetOverride, useAgentNetOverride]);

  // Payment method
  const walletBalance = 100000; // demo
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "gateway">("gateway");
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>("razorpay");
  const [agreed, setAgreed] = useState(true);

  const walletSufficient = walletBalance >= computedAgentNet;
  const amountToPayNow = computedAgentNet;
  const selectedGateway = PAYMENT_GATEWAYS.find((g) => g.id === selectedGatewayId);

  const tripLabel = guessTripLabel(flight);
  const { outbound, inbound } = getSegmentsFromFlight(flight);

  const routeTitle = useMemo(() => {
    const out = outbound?.length ? outbound : flight?.segments || [];
    return routeLabelFromSegments(out, inbound, "Flight");
  }, [outbound, inbound, flight]);

  const passengerList = useMemo(() => {
    const ids = Object.keys(paxDetails || {});
    if (ids.length) {
      return ids
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .map((id) => ({ id, type: paxIdToLabel(id), data: paxDetails[id] }));
    }

    const list: any[] = [];
    const a = paxConfig?.adults ?? 0;
    const c = paxConfig?.children ?? 0;
    const i = paxConfig?.infants ?? 0;
    for (let x = 0; x < a; x++) list.push({ id: `ADT-${x + 1}`, type: "Adult", data: {} });
    for (let x = 0; x < c; x++) list.push({ id: `CHD-${x + 1}`, type: "Child", data: {} });
    for (let x = 0; x < i; x++) list.push({ id: `INF-${x + 1}`, type: "Infant", data: {} });
    return list;
  }, [paxDetails, paxConfig]);

  const navigateToBookingConfirmation = (ticket: any) => {
    const bookingId = ticket?.bookingId || bookingPayload?.bookingId;
    if (!bookingId) {
      nav("/flights", { replace: true });
      return;
    }

    nav(`/booking/confirm/${bookingId}`, {
      state: { bookingPayload, ticket },
      replace: true,
    });
  };

  const handleConfirmPayment = () => {
    if (!agreed) return;
    if (paymentMethod === "wallet" && !walletSufficient) return;

    const ticket = buildTicketFromPayload({
      bookingPayload,
      b2b: {
        grossTotal,
        commissionINR: Number(commissionEdit || 0),
        tdsINR: Number(tdsEdit || 0),
        agentNetINR: computedAgentNet,
      },
      payment: {
        method: paymentMethod,
        amount: amountToPayNow,
        gateway: paymentMethod === "gateway" ? selectedGatewayId : null,
      },
    });

    sessionStorage.setItem(TICKET_SS_KEY, JSON.stringify(ticket));

    sessionStorage.setItem(
      BOOKING_CONFIRM_SS_KEY,
      JSON.stringify({
        bookingPayload,
        ticket,
        booking: {
          status: "CONFIRMED",
          bookingId: ticket?.bookingId || bookingPayload?.bookingId || null,
          bookingDate: ticket?.bookingDate || null,
          bookingTime: ticket?.bookingTime || null,
        },
        b2b: {
          grossTotal,
          commissionINR: Number(commissionEdit || 0),
          tdsINR: Number(tdsEdit || 0),
          agentNetINR: computedAgentNet,
          agentNetOverride: useAgentNetOverride ? Number(agentNetOverride || 0) : null,
        },
        payment: {
          method: paymentMethod,
          amount: amountToPayNow,
          gateway: paymentMethod === "gateway" ? selectedGatewayId : null,
        },
      })
    );

    navigateToBookingConfirmation(ticket);
  };

  if (!bookingPayload) {
    return (
      <div className="min-h-screen grid place-items-center px-4" style={{ background: VAR.page, color: VAR.text }}>
        <div
          className="w-full max-w-md rounded-xl p-6"
          style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, boxShadow: VAR.shadowSm }}
        >
          <div className="text-base font-extrabold">No booking found</div>
          <div className="mt-1 text-sm" style={{ color: VAR.muted }}>
            Please go back and select a flight again.
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => nav(-1)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold"
              style={{ background: VAR.primary, color: VAR.onPrimary }}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
            <button
              onClick={() => nav("/flights")}
              className="rounded-xl px-4 py-2 text-sm font-extrabold"
              style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2, color: VAR.text }}
            >
              New Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  const titleGradient = `linear-gradient(90deg, ${VAR.primary}, ${VAR.accent})`;

  return (
    <div className="min-h-screen" style={{ background: VAR.page, color: VAR.text }}>
      {/* Top Header (Enterprise) */}
      <div style={{ background: VAR.surface, borderBottom: `1px solid ${VAR.border}` }}>
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => nav(-1)}
                className="mt-0.5 grid h-10 w-10 place-items-center rounded-xl"
                style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}
                title="Back"
              >
                <ArrowLeft className="h-5 w-5" style={{ color: VAR.text }} />
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2 text-[12px]" style={{ color: VAR.muted }}>
                  <span className="font-semibold">Flights</span>
                  <ChevronRight className="h-4 w-4" style={{ color: VAR.subtle }} />
                  <span className="font-semibold">Payment</span>
                  <ChevronRight className="h-4 w-4" style={{ color: VAR.subtle }} />
                  <span className="font-extrabold" style={{ color: VAR.text }}>
                    Confirm
                  </span>
                </div>

                <h1
                  className="mt-1 text-2xl md:text-3xl font-extrabold"
                  style={{ backgroundImage: titleGradient, WebkitBackgroundClip: "text", color: "transparent" }}
                >
                  Confirm booking &amp; payment
                </h1>

                <div className="mt-1 text-sm" style={{ color: VAR.muted }}>
                  Review travellers and flight details, then pay using <b>Wallet</b> or <b>Gateway</b>.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
                style={{ background: VAR.successSoft, border: `1px solid ${VAR.border}`, color: VAR.text }}
              >
                <ShieldCheck className="h-4 w-4" style={{ color: VAR.success }} />
                Secure checkout
              </span>

              <span
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
                style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.text }}
              >
                <BadgeCheck className="h-4 w-4" style={{ color: VAR.primary }} />
                B2B fare &amp; earnings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* LEFT */}
          <div className="flex-1 space-y-5">
            {/* Flight Details (Enterprise / Oneway-style) */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <PlaneTakeoff className="h-4 w-4" style={{ color: VAR.primary }} />
                  Flight details
                </div>
              }
              right={
                <button
                  onClick={() => nav("/flights/passenger-details", { state: bookingPayload })}
                  className="rounded-xl px-4 py-2 text-sm font-extrabold"
                  style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.text }}
                >
                  Edit passengers
                </button>
              }
            >
              {/* Route header */}
              <div className="rounded-xl p-4" style={{ background: `linear-gradient(135deg, ${VAR.primarySoft}, ${VAR.accentSoft})`, border: `1px solid ${VAR.border}` }}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: VAR.subtle }}>
                      {tripLabel}
                    </div>
                    <div className="mt-1 text-lg md:text-xl font-extrabold" style={{ color: VAR.text }}>
                      {routeTitle}
                    </div>
                    <div className="mt-1 text-[12px]" style={{ color: VAR.muted }}>
                      {flight?.airline ? `${flight.airline}` : "Airline"} {flight?.flightNos ? `• ${flight.flightNos}` : ""}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Pill icon={<Users className="h-3.5 w-3.5" style={{ color: VAR.muted }} />} text={`${travellersCount} Travellers`} />
                    <Pill icon={<Armchair className="h-3.5 w-3.5" style={{ color: VAR.muted }} />} text={`${seatsFlat.length} Seats`} />
                    <Pill tone={gst?.enabled ? "success" : "soft"} text={gst?.enabled ? "GST included" : "GST not added"} />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {/* Outbound */}
                <LegHeader label={outbound?.length ? "Outbound" : "Flight"} segs={outbound?.length ? outbound : flight?.segments || []} refundable={flight?.refundable} cabin={flight?.cabin || flight?.cabinClass} />
                <div className="space-y-3">
                  {(outbound?.length ? outbound : flight?.segments || []).map((s: any, idx: number, arr: any[]) => (
                    <SegmentRow key={`ob-${idx}`} seg={s} idx={idx} total={arr.length} />
                  ))}
                </div>

                {/* Return */}
                {!!inbound?.length && (
                  <>
                    <LegHeader label="Return" segs={inbound} refundable={flight?.refundable} cabin={flight?.cabin || flight?.cabinClass} />
                    <div className="space-y-3">
                      {inbound.map((s: any, idx: number, arr: any[]) => (
                        <SegmentRow key={`ib-${idx}`} seg={s} idx={idx} total={arr.length} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Contact */}
              {contact && (
                <div className="mt-4 rounded-xl p-4" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                  <div className="text-sm font-extrabold" style={{ color: VAR.text }}>
                    Contact details
                  </div>
                  <div className="mt-1 text-sm" style={{ color: VAR.muted }}>
                    {contact.email ? `Email: ${contact.email}` : "Email: —"} • {contact.phone ? `Mobile: +91 ${contact.phone}` : "Mobile: —"}
                  </div>
                </div>
              )}
            </Card>

            {/* Travellers & Seats (Enterprise list) */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" style={{ color: VAR.primary }} />
                  Travellers & seats
                </div>
              }
              right={
                <span className="text-[12px] font-semibold" style={{ color: VAR.muted }}>
                  Infants excluded from seat assignment
                </span>
              }
            >
              <div className="space-y-3">
                {(() => {
                  let seatIdx = -1; // seats apply only to non-INF
                  return passengerList.map((p, idx) => {
                    const d = p.data || {};
                    const name = [d.title, d.firstName, d.lastName].filter(Boolean).join(" ").trim() || `Traveller ${idx + 1}`;

                    const isInf = String(p.id).startsWith("INF");
                    const seatPos = isInf ? null : ++seatIdx;

                    const seatOnward = seatPos != null ? seatPack.onward?.[seatPos] : null;
                    const seatReturn = seatPos != null ? seatPack.ret?.[seatPos] : null;

                    const seatText =
                      seatPack.type === "ROUNDTRIP"
                        ? isInf
                          ? "Not required"
                          : `${seatOnward || "—"} / ${seatReturn || "—"}`
                        : isInf
                        ? "Not required"
                        : seatOnward || "Not selected";

                    return (
                      <div key={p.id} className="rounded-xl p-4" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="text-sm font-extrabold truncate" style={{ color: VAR.text }}>
                              {p.type} {String(p.id).split("-")[1] || ""} — {name}
                            </div>

                            <div className="mt-1 flex flex-wrap gap-2">
                              <Pill tone="soft" text={`Gender: ${d.gender || "—"}`} />
                              <Pill tone="soft" text={`DOB: ${d.dob || "—"}`} />
                              <Pill tone="soft" text={<span>Seat: <b style={{ color: VAR.text }}>{seatText}</b></span>} />
                            </div>
                          </div>

                          <span
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-extrabold"
                            style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.text }}
                          >
                            <BadgeCheck className="h-4 w-4" style={{ color: VAR.primary }} />
                            {p.type}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>

            {/* Payment options (Enterprise) */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" style={{ color: VAR.primary }} />
                  Payment options
                </div>
              }
              right={
                <span className="text-[12px] font-semibold" style={{ color: VAR.muted }}>
                  Choose one method
                </span>
              }
            >
              <div className="grid gap-3 md:grid-cols-2">
                {/* Wallet */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className="rounded-xl p-4 text-left transition"
                  style={{
                    background: paymentMethod === "wallet" ? VAR.warnSoft : VAR.surface2,
                    border: `1px solid ${paymentMethod === "wallet" ? VAR.warn : VAR.border}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-extrabold" style={{ color: VAR.text }}>
                        <Wallet className="h-4 w-4" style={{ color: VAR.text }} />
                        Agent Wallet
                      </div>
                      <div className="mt-1 text-[12px]" style={{ color: VAR.muted }}>
                        Pay full net payable from wallet balance.
                      </div>
                    </div>

                    <span className="rounded-xl px-3 py-2 text-[12px] font-extrabold" style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.text }}>
                      {fmtINR(walletBalance)}
                    </span>
                  </div>

                  {!walletSufficient && (
                    <div className="mt-3 text-[12px] font-extrabold" style={{ color: VAR.danger }}>
                      Insufficient balance for {fmtINR(amountToPayNow)}.
                    </div>
                  )}
                </button>

                {/* Gateway */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("gateway")}
                  className="rounded-xl p-4 text-left transition"
                  style={{
                    background: paymentMethod === "gateway" ? VAR.primarySoft : VAR.surface2,
                    border: `1px solid ${paymentMethod === "gateway" ? VAR.primary : VAR.border}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-extrabold" style={{ color: VAR.text }}>
                        <CreditCard className="h-4 w-4" style={{ color: VAR.text }} />
                        Payment Gateway
                      </div>
                      <div className="mt-1 text-[12px]" style={{ color: VAR.muted }}>
                        UPI / Cards / Netbanking.
                      </div>
                    </div>

                    <span className="rounded-xl px-3 py-2 text-[12px] font-extrabold" style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.text }}>
                      Enabled
                    </span>
                  </div>
                </button>
              </div>

              {/* Gateway list */}
              <div className="mt-4" style={{ opacity: paymentMethod === "gateway" ? 1 : 0.45 }}>
                <div className="text-xs font-semibold" style={{ color: VAR.subtle }}>
                  Select gateway
                </div>

                <div className="mt-2 space-y-2">
                  {PAYMENT_GATEWAYS.map((gw) => {
                    const active = selectedGatewayId === gw.id;
                    return (
                      <button
                        key={gw.id}
                        type="button"
                        disabled={paymentMethod !== "gateway"}
                        onClick={() => setSelectedGatewayId(gw.id)}
                        className="w-full rounded-xl p-4 text-left transition"
                        style={{
                          background: active ? VAR.primarySoft : VAR.surface2,
                          border: `1px solid ${active ? VAR.primary : VAR.border}`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="grid h-5 w-5 place-items-center rounded-full border text-[10px] font-extrabold"
                                style={{
                                  borderColor: active ? VAR.primary : VAR.border,
                                  background: active ? VAR.primary : VAR.surface,
                                  color: active ? VAR.onPrimary : "transparent",
                                }}
                              >
                                ●
                              </span>
                              <div className="text-sm font-extrabold" style={{ color: VAR.text }}>
                                {gw.name}
                              </div>
                              <span
                                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                                style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.muted }}
                              >
                                {gw.type === "upi" ? "UPI" : gw.type === "card" ? "CARDS" : gw.type === "netbanking" ? "NETBANKING" : "MIXED"}
                              </span>
                            </div>
                            <div className="mt-1 text-[12px]" style={{ color: VAR.muted }}>
                              {gw.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Agreement */}
              <div className="mt-4 flex items-start gap-3 rounded-xl p-4" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                <input
                  id="agree"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{
                    accentColor: VAR.primary as any,
                    border: `1px solid ${VAR.border}`,
                    background: VAR.surface,
                  }}
                />
                <label htmlFor="agree" className="text-[12px] leading-relaxed" style={{ color: VAR.muted }}>
                  I confirm passenger names match their government ID / passport and I agree to fare rules, cancellation &amp; change policies.
                </label>
              </div>
            </Card>
          </div>

          {/* RIGHT (Sticky Summary) */}
          <aside className="w-full shrink-0 lg:w-[420px]">
            <div className="lg:sticky lg:top-4 space-y-5">
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4" style={{ color: VAR.primary }} />
                    Fare summary (B2B)
                  </div>
                }
                right={<Pill tone="soft" text="Demo" />}
              >
                <div className="rounded-xl p-4" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                  <div className="space-y-2">
                    <KV k="Base fare (travellers)" v={fmtINR(safeNum(pricing?.totalFare ?? 0))} />
                    <KV
                      k={<span>Seat selection {seatsFlat.length ? <span style={{ color: VAR.subtle }}>({seatsFlat.length} × {fmtINR(seatPricePerSeat)})</span> : null}</span>}
                      v={fmtINR(seatTotal)}
                    />

                    {safeNum(pricing?.txnFee ?? pricing?.transactionFee ?? 0) > 0 ? (
                      <KV k="Transaction fee" v={fmtINR(safeNum(pricing?.txnFee ?? pricing?.transactionFee ?? 0))} />
                    ) : null}

                    {safeNum(pricing?.txnCharge ?? pricing?.transactionCharge ?? 0) > 0 ? (
                      <KV k="Transaction charge" v={fmtINR(safeNum(pricing?.txnCharge ?? pricing?.transactionCharge ?? 0))} />
                    ) : null}

                    {!!gst?.enabled && safeNum(pricing?.gstAmount ?? pricing?.gst ?? 0) > 0 ? (
                      <KV k="GST" v={fmtINR(safeNum(pricing?.gstAmount ?? pricing?.gst ?? 0))} />
                    ) : null}
                  </div>

                  <div className="mt-4 border-t border-dashed pt-4" style={{ borderColor: VAR.border }}>
                    <KV k={<span className="text-sm font-extrabold" style={{ color: VAR.text }}>Customer payable (Gross)</span>} v={<span className="text-xl">{fmtINR(grossTotal)}</span>} strong />
                  </div>
                </div>

                <div className="mt-4 rounded-xl p-4" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold" style={{ color: VAR.text }}>
                        Agent earnings &amp; net payable
                      </div>
                      <div className="mt-1 text-[12px]" style={{ color: VAR.muted }}>
                        Net payable is used for the final payment.
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-[12px] font-semibold" style={{ color: VAR.muted }}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded"
                        style={{ accentColor: VAR.primary as any }}
                        checked={useAgentNetOverride}
                        onChange={(e) => setUseAgentNetOverride(e.target.checked)}
                      />
                      Override
                    </label>
                  </div>

                  {!useAgentNetOverride ? (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[12px] font-semibold" style={{ color: VAR.subtle }}>
                          Commission (₹)
                        </div>
                        <input
                          value={String(commissionEdit)}
                          onChange={(e) => setCommissionEdit(Number(String(e.target.value).replace(/[^\d]/g, "")) || 0)}
                          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-extrabold outline-none"
                          style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                          inputMode="numeric"
                        />
                      </div>

                      <div>
                        <div className="text-[12px] font-semibold" style={{ color: VAR.subtle }}>
                          TDS (₹)
                        </div>
                        <input
                          value={String(tdsEdit)}
                          onChange={(e) => setTdsEdit(Number(String(e.target.value).replace(/[^\d]/g, "")) || 0)}
                          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-extrabold outline-none"
                          style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                          inputMode="numeric"
                        />
                      </div>

                      <div className="col-span-2 text-[12px]" style={{ color: VAR.muted }}>
                        Formula: <b>Gross - Commission + TDS</b>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="text-[12px] font-semibold" style={{ color: VAR.subtle }}>
                        Agent Net Fare (₹)
                      </div>
                      <input
                        value={String(agentNetOverride)}
                        onChange={(e) => setAgentNetOverride(Number(String(e.target.value).replace(/[^\d]/g, "")) || 0)}
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-extrabold outline-none"
                        style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                        inputMode="numeric"
                      />
                      <div className="mt-1 text-[12px]" style={{ color: VAR.muted }}>
                        This becomes the final payable amount.
                      </div>
                    </div>
                  )}

                  <div className="mt-4 border-t border-dashed pt-4" style={{ borderColor: VAR.border }}>
                    <KV
                      k={<span className="text-sm font-extrabold" style={{ color: VAR.text }}>Net payable (Agent)</span>}
                      v={<span className="text-xl" style={{ color: VAR.primary }}>{fmtINR(computedAgentNet)}</span>}
                      strong
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={!agreed || (paymentMethod === "wallet" && !walletSufficient)}
                  className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-extrabold transition"
                  style={{
                    background: paymentMethod === "wallet" ? VAR.warn : VAR.primary,
                    color: VAR.onPrimary,
                    opacity: !agreed || (paymentMethod === "wallet" && !walletSufficient) ? 0.5 : 1,
                    boxShadow: VAR.shadowSm,
                  }}
                >
                  {paymentMethod === "wallet" ? "Pay using Wallet" : `Pay via ${selectedGateway?.name ?? "Gateway"}`} • {fmtINR(amountToPayNow)}
                </button>

                <div className="mt-3 text-[12px]" style={{ color: VAR.muted }}>
                  Payment is simulated here. Replace with API gateway + booking confirmation later.
                </div>
              </Card>

              <Card title="Trip summary">
                <div className="rounded-xl p-4" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                  <div className="text-[12px] font-semibold" style={{ color: VAR.subtle }}>
                    Outbound
                  </div>
                  <div className="mt-1 text-sm font-extrabold" style={{ color: VAR.text }}>
                    {outbound?.length ? segSummary(outbound) : segSummary(flight?.segments || [])}
                  </div>

                  {!!inbound?.length && (
                    <>
                      <div className="mt-3 text-[12px] font-semibold" style={{ color: VAR.subtle }}>
                        Return
                      </div>
                      <div className="mt-1 text-sm font-extrabold" style={{ color: VAR.text }}>
                        {segSummary(inbound)}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;
