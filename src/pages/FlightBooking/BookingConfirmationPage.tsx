// src/pages/BookingConfirmationPage.tsx
// ✅ COMPLETE Drop-in replacement (HOOK ORDER FIXED)
// ✅ Enterprise UI polish + higher visibility (typography, spacing, sticky sidebar, better tables)
// ✅ Flight Details UI (more “oneway style”: strong route header, timeline, leg summary, segment rows)
// ✅ Airline logo FIX: tries API logo -> gstatic -> airhex (auto retry chain)
// ✅ Dummy PNR + Dummy Ticket No. generated (stable per bookingId) when missing
// ✅ Loader first: "Confirming your booking..."
// ✅ Status: CONFIRMED / PENDING / FAILED
// ✅ Pending -> PNR update UI (saves in BOOKING_CONFIRM_CTX_V1)
// ✅ Left: Flight details + traveler info, Right: complete fare details
// ✅ Roundtrip FIX: if ticket.segments missing OR no OB/IB ids -> fallback from bookingPayload.flight + smart split
// ✅ Seats count FIX: supports ONEWAY array OR ROUNDTRIP { onward, return }
// ✅ No static colors (only CSS variables)

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** ================= Theme Vars (dynamic only) ================= */
const VAR = {
  page: "var(--page, rgba(248,250,252,1))",
  surface: "var(--surface, rgba(255,255,255,1))",
  surface2: "var(--surface2, rgba(248,250,252,1))",
  border: "var(--border, rgba(15,23,42,0.12))",
  text: "var(--text, rgba(15,23,42,0.92))",
  muted: "var(--muted, rgba(71,85,105,0.9))",
  subtle: "var(--subtle, rgba(100,116,139,0.85))",

  primary: "var(--primary, rgba(37,99,235,1))",
  onPrimary: "var(--onPrimary, rgba(255,255,255,1))",
  primarySoft: "var(--primarySoft, rgba(37,99,235,0.12))",

  success: "var(--success, rgba(34,197,94,1))",
  successSoft: "var(--successSoft, rgba(34,197,94,0.12))",

  warn: "var(--warn, rgba(245,158,11,1))",
  warnSoft: "var(--warnSoft, rgba(245,158,11,0.14))",

  danger: "var(--danger, rgba(244,63,94,1))",
  dangerSoft: "var(--dangerSoft, rgba(244,63,94,0.12))",

  shadowSm: "var(--shadowSm, 0 8px 18px rgba(2,6,23,0.08))",
  shadow: "var(--shadow, 0 14px 30px rgba(2,6,23,0.10))",
};

const nfIN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const BOOKING_CONFIRM_SS_KEY = "BOOKING_CONFIRM_CTX_V1";
const TICKET_SS_KEY = "TICKET_CTX_V1";
const ROUTE_TICKET_COPY = "/flights/ticket-copy";

/** ================= Helpers ================= */
function safeParse(json: string | null) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function safeNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function fmtINR(v: any) {
  const n = Number(v);
  return `₹${nfIN.format(Number.isFinite(n) ? n : 0)}`;
}
function clampStr(v: any, fallback = "—") {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
}
function normalizeStatus(raw: any): "CONFIRMED" | "PENDING" | "FAILED" {
  const s = String(raw ?? "").toUpperCase();
  if (s.includes("PEND") || s.includes("HOLD")) return "PENDING";
  if (s.includes("FAIL") || s.includes("REJECT") || s.includes("ERROR") || s.includes("CANCEL")) return "FAILED";
  return "CONFIRMED";
}
function minsToHM(mins: any) {
  const m = Math.max(0, Number(mins) || 0);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (!h) return `${mm}m`;
  return `${h}h ${mm}m`;
}

function pickFlightFromPayload(bookingPayload: any) {
  return bookingPayload?.flight ?? bookingPayload?.selectedFlight ?? bookingPayload?.flightDetails ?? null;
}

function extractBoundsFromFlight(flight: any) {
  if (!flight) return { outbound: [] as any[], inbound: [] as any[] };

  const outbound =
    flight?.outbound?.segments ??
    flight?.onward?.segments ??
    flight?.departing?.segments ??
    flight?.segmentsOutbound ??
    [];

  const inbound =
    flight?.inbound?.segments ??
    flight?.return?.segments ??
    flight?.returning?.segments ??
    flight?.segmentsInbound ??
    [];

  const flat = Array.isArray(flight?.segments) ? flight.segments : [];

  if ((outbound && outbound.length) || (inbound && inbound.length)) return { outbound: outbound || [], inbound: inbound || [] };
  return { outbound: flat || [], inbound: [] };
}

function toDisplaySegments(segs: any[], idPrefix: string) {
  return (segs || []).map((s: any, idx: number) => ({
    id: `${idPrefix}-${idx + 1}`,
    airlineName: s.airline || s.airlineName || s.carrierName || "",
    airlineCode: s.airlineCode || s.code || s.carrierCode || (s.flightNos ? String(s.flightNos).split(" ")[0] : ""),
    airlineLogo: s.airlineLogo || s.logo || s.carrierLogo || s.brand?.logo || s.airline?.logo,
    flightNo: s.flightNo || s.flightNos || s.flightNumber || "",
    aircraft: s.aircraft || s.aircraftType || s.plane || s.equipment || "",
    cabin: s.cabin || s.cabinClass || s.class || "",
    distance: s.distance || s.miles || s.km || "",
    from: {
      code: s.fromIata || s.from?.code || s.origin || "",
      city: s.fromCity || s.from?.city || s.originCity || "",
      terminal: s.fromTerminal || s.terminalFrom || s.from?.terminal,
      time: s.departTime || s.from?.time || s.depTime || "",
      date: s.departDate || s.from?.date || s.depDate || "",
    },
    to: {
      code: s.toIata || s.to?.code || s.destination || "",
      city: s.toCity || s.to?.city || s.destinationCity || "",
      terminal: s.toTerminal || s.terminalTo || s.to?.terminal,
      time: s.arriveTime || s.to?.time || s.arrTime || "",
      date: s.arriveDate || s.to?.date || s.arrDate || "",
    },
    durationMins: safeNum(s.durationMins ?? s.duration ?? s.durationMinutes),
    refundable: s.refundable || "",
    baggage: {
      checkIn: s.baggage?.checkKg ? `${s.baggage.checkKg}KG` : s.baggage?.checkIn,
      cabin: s.baggage?.handKg ? `${s.baggage.handKg}KG` : s.baggage?.cabin,
    },
    layoverMins: safeNum(s.layoverMins ?? s.layover ?? s.layoverMinutes),
  }));
}

function isRoundTripGuess(ticket: any, bookingPayload: any) {
  const t = String(ticket?.tripType ?? pickFlightFromPayload(bookingPayload)?.tripType ?? "").toUpperCase().trim();
  if (t.includes("ROUND")) return true;

  const flight = pickFlightFromPayload(bookingPayload);
  const { inbound } = extractBoundsFromFlight(flight);
  if (inbound?.length) return true;

  const segs = Array.isArray(ticket?.segments) ? ticket.segments : [];
  const hasIB = segs.some((s: any) => String(s?.id || "").toUpperCase().startsWith("IB-"));
  const hasOB = segs.some((s: any) => String(s?.id || "").toUpperCase().startsWith("OB-"));
  return hasOB && hasIB;
}

function splitRoundTripSegments(all: any[], isRT: boolean) {
  const upperId = (x: any) => String(x?.id || "").toUpperCase();

  const outbound = all.filter((s) => upperId(s).startsWith("OB-"));
  const inbound = all.filter((s) => upperId(s).startsWith("IB-"));
  if (outbound.length || inbound.length) return { outbound, inbound };

  const out2 = all.filter((s) => String(s?.direction || s?.bound || s?.leg || "").toUpperCase().includes("OUT"));
  const in2 = all.filter((s) => String(s?.direction || s?.bound || s?.leg || "").toUpperCase().includes("IN"));
  if (out2.length || in2.length) return { outbound: out2, inbound: in2 };

  if (isRT && all.length >= 2) {
    const mid = Math.ceil(all.length / 2);
    return { outbound: all.slice(0, mid), inbound: all.slice(mid) };
  }

  return { outbound: all, inbound: [] as any[] };
}

/** ================= Seats normalize (ONEWAY array OR ROUNDTRIP object) ================= */
function normalizeSeats(raw: any) {
  if (Array.isArray(raw)) return { type: "ONEWAY" as const, onward: raw, ret: [] as string[] };
  const onward = Array.isArray(raw?.onward) ? raw.onward : [];
  const ret = Array.isArray(raw?.return) ? raw.return : [];
  return { type: "ROUNDTRIP" as const, onward, ret };
}

/** ================= Stable dummy generators (enterprise-friendly) ================= */
function fnv1a32(str: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function makeAlphaNum(len: number, seed: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  let x = seed >>> 0;
  for (let i = 0; i < len; i++) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    out += chars[x % chars.length];
  }
  return out;
}
function makeDigits(len: number, seed: number) {
  let out = "";
  let x = seed >>> 0;
  for (let i = 0; i < len; i++) {
    x = (Math.imul(x, 1103515245) + 12345) >>> 0;
    out += String(x % 10);
  }
  return out;
}
function genDemoPNR(bookingId: string) {
  const seed = fnv1a32(`PNR:${bookingId}`);
  return makeAlphaNum(6, seed);
}
function genDemoTicketNo(bookingId: string, paxIdx: number) {
  const prefixSeed = fnv1a32(`TKT:PX:${bookingId}:${paxIdx}:P`);
  const bodySeed = fnv1a32(`TKT:PX:${bookingId}:${paxIdx}:B`);
  const prefix = String((prefixSeed % 900) + 100);
  const body = makeDigits(10, bodySeed);
  return `${prefix}${body}`;
}

/** ================= Small Icons (no deps) ================= */
function IconClock({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPlane({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 16l-8-4V3.5a1.5 1.5 0 0 0-3 0V12L2 16v2l8-1.5V21l2-1 2 1v-4.5L21 18v-2Z" fill="currentColor" />
    </svg>
  );
}
function IconCopy({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 8V6.6A2.6 2.6 0 0 1 10.6 4h6.8A2.6 2.6 0 0 1 20 6.6v6.8A2.6 2.6 0 0 1 17.4 16H16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M6.6 8H13.4A2.6 2.6 0 0 1 16 10.6v6.8A2.6 2.6 0 0 1 13.4 20H6.6A2.6 2.6 0 0 1 4 17.4v-6.8A2.6 2.6 0 0 1 6.6 8Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconChevron({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.2 5.2L18 9l-4.8 1.8L12 16l-1.2-5.2L6 9l4.8-1.8L12 2Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M19 14l.7 3L22 18l-2.3 1-.7 3-.7-3L16 18l2.3-1 .7-3Z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/** ================= UI helpers ================= */
function Spinner() {
  return (
    <div
      className="h-10 w-10 rounded-full"
      style={{
        border: `3px solid ${VAR.border}`,
        borderTopColor: VAR.primary,
        animation: "spin 0.9s linear infinite",
      }}
    />
  );
}

function Section(props: { title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl p-4 md:p-5"
      style={{
        border: `1px solid ${VAR.border}`,
        background: VAR.surface,
        boxShadow: VAR.shadowSm,
      }}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-[13px] md:text-sm font-extrabold tracking-wide" style={{ color: VAR.text }}>
            {props.title}
          </h2>
          {props.subtitle ? (
            <div className="mt-1 text-[11px] md:text-xs" style={{ color: VAR.muted }}>
              {props.subtitle}
            </div>
          ) : null}
        </div>
        {props.right ? <div className="shrink-0">{props.right}</div> : null}
      </div>

      <div className="mt-4">{props.children}</div>
    </section>
  );
}

function StatusBadge({ status }: { status: "CONFIRMED" | "PENDING" | "FAILED" }) {
  const tone =
    status === "CONFIRMED"
      ? { bg: VAR.successSoft, br: VAR.success, text: VAR.text, label: "Confirmed" }
      : status === "PENDING"
      ? { bg: VAR.warnSoft, br: VAR.warn, text: VAR.text, label: "Pending" }
      : { bg: VAR.dangerSoft, br: VAR.danger, text: VAR.text, label: "Failed" };

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold"
      style={{ background: tone.bg, border: `1px solid ${tone.br}`, color: tone.text }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: tone.br }} />
      {tone.label}
    </span>
  );
}

function Pill({ label, value, tone = "neutral" }: { label: string; value: React.ReactNode; tone?: "neutral" | "primary" }) {
  const bg = tone === "primary" ? VAR.primarySoft : VAR.surface2;
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold"
      style={{ background: bg, border: `1px solid ${VAR.border}`, color: VAR.text }}
    >
      <span style={{ color: VAR.subtle }}>{label}</span>
      <span className="font-extrabold" style={{ color: VAR.text }}>
        {value}
      </span>
    </span>
  );
}

function GhostButton({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-extrabold"
      style={{
        background: VAR.surface2,
        border: `1px solid ${VAR.border}`,
        color: VAR.text,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{ color: VAR.primary }}>
        <IconCopy size={15} />
      </span>
      {label}
    </button>
  );
}

function PrimaryButton({
  onClick,
  label,
  disabled,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg px-4 py-2 text-sm font-extrabold"
      style={{
        background: VAR.primary,
        color: VAR.onPrimary,
        opacity: disabled ? 0.55 : 1,
        boxShadow: VAR.shadowSm,
      }}
    >
      {label}
    </button>
  );
}

function SubtleButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg px-4 py-2 text-sm font-extrabold"
      style={{
        background: VAR.surface2,
        color: VAR.text,
        border: `1px solid ${VAR.border}`,
      }}
    >
      {label}
    </button>
  );
}

/** ================= Flight Details UI (enterprise visibility) ================= */
function airlineInitials(name: any, code: any) {
  const c = String(code || "").trim().toUpperCase();
  if (c) return c.slice(0, 2);
  const n = String(name || "").trim();
  if (!n) return "AI";
  const parts = n.split(/\s+/).filter(Boolean);
  const a = (parts[0]?.[0] || "A").toUpperCase();
  const b = (parts[1]?.[0] || parts[0]?.[1] || "I").toUpperCase();
  return `${a}${b}`.slice(0, 2);
}

function normalizeLogoUrl(u: any) {
  const s = String(u || "").trim();
  if (!s) return "";
  if (s.startsWith("/")) return `${window.location.origin}${s}`;
  return s;
}

function getAirlineCode(seg: any) {
  const code =
    seg?.airlineCode ||
    seg?.code ||
    seg?.carrierCode ||
    (seg?.flightNo ? String(seg.flightNo).split(/[\s-]+/)[0] : "") ||
    (seg?.flightNos ? String(seg.flightNos).split(/[\s-]+/)[0] : "");
  return String(code || "").trim().toUpperCase();
}

function buildLogoCandidates(seg: any) {
  const direct =
    seg?.airlineLogo ||
    seg?.logo ||
    seg?.airline?.logo ||
    seg?.carrierLogo ||
    seg?.brand?.logo ||
    "";

  const directUrl = normalizeLogoUrl(direct);
  const code = getAirlineCode(seg);

  const candidates: string[] = [];
  if (directUrl) candidates.push(directUrl);

  if (code) {
    candidates.push(`https://www.gstatic.com/flights/airline_logos/70px/${code}.png`);
    candidates.push(`https://www.gstatic.com/flights/airline_logos/48px/${code}.png`);
    candidates.push(`https://www.gstatic.com/flights/airline_logos/36px/${code}.png`);
    candidates.push(`https://content.airhex.com/content/logos/airlines_${code}_200_200_s.png`);
    candidates.push(`https://content.airhex.com/content/logos/airlines_${code}_64_64_s.png`);
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}

function AirlineLogo({ seg, size = 34 }: { seg: any; size?: number }) {
  const code = getAirlineCode(seg);
  const label = airlineInitials(seg?.airlineName, code);

  const sources = useMemo(() => buildLogoCandidates(seg), [seg]);
  const [idx, setIdx] = useState(0);
  const src = sources[idx] || "";

  return (
    <div
      className="relative shrink-0 grid place-items-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: VAR.surface2,
        border: `1px solid ${VAR.border}`,
      }}
      title={clampStr(seg?.airlineName, "Airline")}
    >
      <div className="absolute inset-0 grid place-items-center text-[11px] font-extrabold" style={{ color: VAR.text }}>
        {label}
      </div>

      {src ? (
        <img
          key={src}
          src={src}
          alt={clampStr(seg?.airlineName, "Airline")}
          className="relative z-10 object-contain"
          style={{ width: size - 8, height: size - 8 }}
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => {
            if (idx < sources.length - 1) setIdx((p) => p + 1);
          }}
        />
      ) : null}
    </div>
  );
}

function StopSummary({ segs }: { segs: any[] }) {
  const stops = Math.max(0, (segs?.length || 0) - 1);
  const totalMins = (segs || []).reduce((a: number, s: any) => a + (Number(s?.durationMins) || 0), 0);
  const stopLabel = stops === 0 ? "Non-stop" : stops === 1 ? "1 stop" : `${stops} stops`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-extrabold" style={{ color: VAR.text }}>
      <span>{stopLabel}</span>
      <span style={{ color: VAR.subtle }}>•</span>
      <span className="inline-flex items-center gap-1" style={{ color: VAR.subtle }}>
        <IconClock size={15} />
        <span style={{ color: VAR.text }}>{minsToHM(totalMins)}</span>
      </span>
    </div>
  );
}

function RoutePill({ segs }: { segs: any[] }) {
  const first = segs?.[0]?.from || {};
  const last = segs?.[segs.length - 1]?.to || {};
  const left = clampStr(first?.code, "");
  const right = clampStr(last?.code, "");
  const label = left && right ? `${left} → ${right}` : "Route";
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold"
      style={{ background: VAR.primarySoft, border: `1px solid ${VAR.border}`, color: VAR.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: VAR.primary }} />
      {label}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold"
      style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.text }}
    >
      {children}
    </span>
  );
}

function SegmentRow({ seg, recordLocator }: { seg: any; recordLocator: string }) {
  const dateLabel = clampStr(seg?.from?.date || seg?.to?.date || "", "—");
  const airlineName = clampStr(seg?.airlineName, "Airline");
  const flightNo = clampStr(seg?.flightNo, "");
  const aircraft = clampStr(seg?.aircraft, "");
  const cabin = clampStr(seg?.cabin, "Economy");

  const depTime = clampStr(seg?.from?.time, "—");
  const depCity = clampStr(seg?.from?.city, "");
  const depCode = clampStr(seg?.from?.code, "");
  const depTerminal = clampStr(seg?.from?.terminal, "");
  const arrTime = clampStr(seg?.to?.time, "—");
  const arrCity = clampStr(seg?.to?.city, "");
  const arrCode = clampStr(seg?.to?.code, "");
  const arrTerminal = clampStr(seg?.to?.terminal, "");

  const dur = minsToHM(seg?.durationMins);
  const baggageCabin = clampStr(seg?.baggage?.cabin, "");
  const baggageCheck = clampStr(seg?.baggage?.checkIn, "");
  const refundable = clampStr(seg?.refundable, "");

  return (
    <div className="py-4">
      {/* Row header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-extrabold tracking-wide" style={{ color: VAR.primary }}>
            {String(dateLabel).toUpperCase()}
          </div>
          <div className="mt-2 flex items-start gap-3">
            <AirlineLogo seg={seg} size={36} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[13px] md:text-sm font-extrabold" style={{ color: VAR.text }}>
                  {airlineName}
                </div>
                {flightNo ? (
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-extrabold" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.text }}>
                    {flightNo}
                  </span>
                ) : null}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Chip>
                  <span style={{ color: VAR.subtle }}>Class</span>
                  <span className="font-extrabold">{cabin}</span>
                </Chip>

                {(baggageCabin || baggageCheck) ? (
                  <Chip>
                    <span style={{ color: VAR.subtle }}>Baggage</span>
                    <span className="font-extrabold">
                      {baggageCabin ? `${baggageCabin} cabin` : "— cabin"} / {baggageCheck ? `${baggageCheck} check-in` : "— check-in"}
                    </span>
                  </Chip>
                ) : null}

                {aircraft ? (
                  <Chip>
                    <span style={{ color: VAR.subtle }}>Aircraft</span>
                    <span className="font-extrabold">{aircraft}</span>
                  </Chip>
                ) : null}

                {refundable ? (
                  <Chip>
                    <span style={{ color: VAR.subtle }}>Fare</span>
                    <span className="font-extrabold">{refundable}</span>
                  </Chip>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <div className="rounded-lg px-3 py-2 text-right" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
            <div className="text-[10px] font-semibold" style={{ color: VAR.subtle }}>
              Record Locator
            </div>
            <div className="text-sm font-extrabold" style={{ color: VAR.text }}>
              {recordLocator}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_1fr] md:items-center">
        {/* Depart */}
        <div className="rounded-xl p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[18px] font-extrabold leading-none" style={{ color: VAR.text }}>
                {depTime}
              </div>
              <div className="mt-1 text-[12px] font-semibold" style={{ color: VAR.muted }}>
                {depCity} {depCode ? `(${depCode})` : ""}
              </div>
              {depTerminal ? (
                <div className="mt-0.5 text-[11px]" style={{ color: VAR.subtle }}>
                  Terminal {depTerminal}
                </div>
              ) : null}
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold" style={{ color: VAR.subtle }}>
                Depart
              </div>
              <div className="text-[12px] font-extrabold" style={{ color: VAR.text }}>
                {depCode || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="rounded-xl p-3 text-center" style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}>
          <div className="inline-flex items-center justify-center gap-2">
            <span style={{ color: VAR.primary }}>
              <IconPlane size={16} />
            </span>
            <span className="text-[14px] font-extrabold" style={{ color: VAR.text }}>
              {dur}
            </span>
          </div>
          <div className="mt-1 text-[11px] font-semibold" style={{ color: VAR.subtle }}>
            Flight duration
          </div>
          <details className="mt-2">
            <summary
              className="inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-extrabold"
              style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.text }}
            >
              <span style={{ color: VAR.subtle }}>Segment details</span>
              <span style={{ color: VAR.primary }}>
                <IconChevron size={14} />
              </span>
            </summary>

            <div className="mt-2 rounded-lg p-3 text-left text-[11px]" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.muted }}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <div style={{ color: VAR.subtle }}>Operating carrier</div>
                  <div className="font-extrabold" style={{ color: VAR.text }}>
                    {airlineName}
                  </div>
                </div>
                <div>
                  <div style={{ color: VAR.subtle }}>Flight number</div>
                  <div className="font-extrabold" style={{ color: VAR.text }}>
                    {clampStr(flightNo, "—")}
                  </div>
                </div>
                <div>
                  <div style={{ color: VAR.subtle }}>Aircraft</div>
                  <div className="font-extrabold" style={{ color: VAR.text }}>
                    {clampStr(aircraft, "—")}
                  </div>
                </div>
                <div>
                  <div style={{ color: VAR.subtle }}>Record locator</div>
                  <div className="font-extrabold" style={{ color: VAR.text }}>
                    {recordLocator}
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Arrive */}
        <div className="rounded-xl p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[18px] font-extrabold leading-none" style={{ color: VAR.text }}>
                {arrTime}
              </div>
              <div className="mt-1 text-[12px] font-semibold" style={{ color: VAR.muted }}>
                {arrCity} {arrCode ? `(${arrCode})` : ""}
              </div>
              {arrTerminal ? (
                <div className="mt-0.5 text-[11px]" style={{ color: VAR.subtle }}>
                  Terminal {arrTerminal}
                </div>
              ) : null}
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold" style={{ color: VAR.subtle }}>
                Arrive
              </div>
              <div className="text-[12px] font-extrabold" style={{ color: VAR.text }}>
                {arrCode || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LayoverRow({ label }: { label: string }) {
  return (
    <div className="py-2 text-center text-[11px] font-extrabold" style={{ color: VAR.primary }}>
      {label}
    </div>
  );
}

function FlightLegCard({ title, segs, recordLocator }: { title: "Departure" | "Return"; segs: any[]; recordLocator: string }) {
  const has = !!segs?.length;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: VAR.surface,
        border: `1px solid ${VAR.border}`,
        boxShadow: VAR.shadowSm,
      }}
    >
      <div
        className="px-4 py-3"
        style={{
          background: VAR.surface2,
          borderBottom: `1px solid ${VAR.border}`,
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-extrabold" style={{ color: VAR.text }}>
            {title}
          </div>
          {has ? (
            <>
              <StopSummary segs={segs} />
              <RoutePill segs={segs} />
            </>
          ) : null}
        </div>
      </div>

      {!has ? (
        <div className="p-4 text-sm" style={{ color: VAR.muted }}>
          No flight segments found.
        </div>
      ) : (
        <div className="px-4">
          {segs.map((seg, idx) => {
            const showDivider = idx !== 0;

            const layoverMins = Number(seg?.layoverMins) || 0;
            const prevTo = segs[idx - 1]?.to || null;
            const layoverCity = prevTo?.city ? String(prevTo.city) : "";
            const layoverCode = prevTo?.code ? String(prevTo.code) : "";

            return (
              <React.Fragment key={String(seg?.id || idx)}>
                {showDivider ? <div style={{ borderTop: `1px solid ${VAR.border}` }} /> : null}

                {idx > 0 && layoverMins > 0 ? (
                  <LayoverRow
                    label={`Layover: ${layoverCity ? `${layoverCity}, ` : ""}${layoverCode ? `${layoverCode} ` : ""}${minsToHM(layoverMins)}`}
                  />
                ) : null}

                <SegmentRow seg={seg} recordLocator={recordLocator} />
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** ================= Fare UI helpers ================= */
function MoneyRow({ label, value, emphasis }: { label: string; value: React.ReactNode; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold" style={{ color: VAR.muted }}>
        {label}
      </span>
      <span className={emphasis ? "text-sm md:text-base font-extrabold" : "text-xs font-extrabold"} style={{ color: VAR.text }}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="my-3 border-t border-dashed" style={{ borderColor: VAR.border }} />;
}

/** ================= Page ================= */
export default function BookingConfirmationPage() {
  const nav = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);

  const ctx = useMemo(() => {
    const fromState = (location.state as any) || null;
    const fromSS = safeParse(sessionStorage.getItem(BOOKING_CONFIRM_SS_KEY));
    return fromState?.bookingPayload || fromState?.ticket ? fromState : fromSS;
  }, [location.state]);

  const ticket = useMemo(() => {
    return ctx?.ticket || safeParse(sessionStorage.getItem(TICKET_SS_KEY));
  }, [ctx]);

  const bookingPayload = ctx?.bookingPayload || null;
  const bookingMeta = ctx?.booking || {};
  const b2b = ctx?.b2b || {};
  const payment = ctx?.payment || {};

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  const segments: any[] = useMemo(() => {
    const fromTicket = Array.isArray(ticket?.segments) ? ticket.segments : [];
    if (fromTicket.length) return fromTicket;

    const flight = pickFlightFromPayload(bookingPayload);
    const { outbound, inbound } = extractBoundsFromFlight(flight);
    if ((outbound && outbound.length) || (inbound && inbound.length)) {
      return [...toDisplaySegments(outbound || [], "OB"), ...toDisplaySegments(inbound || [], "IB")];
    }
    return [];
  }, [ticket, bookingPayload]);

  const isRT = useMemo(() => isRoundTripGuess(ticket, bookingPayload), [ticket, bookingPayload]);
  const { outbound, inbound } = useMemo(() => splitRoundTripSegments(segments, isRT), [segments, isRT]);

  const passengers: any[] = Array.isArray(ticket?.passengers) ? ticket.passengers : [];

  const [pnr, setPnr] = useState<string>(() => String(bookingMeta?.pnr ?? "").trim());
  const [pnrSaving, setPnrSaving] = useState(false);

  const bookingId = clampStr(ticket?.bookingId || bookingMeta?.bookingId || bookingPayload?.bookingId);
  const bookedAt = clampStr(ticket?.bookingDate || bookingMeta?.bookingDate, "");
  const bookedTime = clampStr(ticket?.bookingTime || bookingMeta?.bookingTime || "", "");
  const contactEmail = clampStr(bookingPayload?.contact?.email, "");
  const contactPhone = clampStr(bookingPayload?.contact?.phone ? `+91 ${bookingPayload.contact.phone}` : "", "");
  const status = normalizeStatus(bookingMeta?.status || ticket?.bookingStatus);

  // ✅ Seats count robust
  const seatRaw = bookingPayload?.seats?.selectedSeats ?? bookingPayload?.seats?.seats ?? [];
  const seatPack = useMemo(() => normalizeSeats(seatRaw), [seatRaw]);
  const seatsCount = (seatPack.onward?.length || 0) + (seatPack.ret?.length || 0);

  const primarySegs = outbound?.length ? outbound : segments;
  const travelMins = (primarySegs || []).reduce((a: number, s: any) => a + (Number(s?.durationMins) || 0), 0);

  const grossTotal = Number(b2b?.grossTotal ?? 0) || Number(ticket?.fare?.baseFare ?? 0) || 0;
  const commissionINR = Number(b2b?.commissionINR ?? ticket?.agentPricing?.commissionOverride ?? 0) || 0;
  const tdsINR = Number(b2b?.tdsINR ?? ticket?.fare?.tds ?? 0) || 0;
  const agentNetINR = Number(b2b?.agentNetINR ?? 0) || Math.max(0, Number(grossTotal) - Number(commissionINR) + Number(tdsINR));

  const gatewayLabel =
    payment?.method === "wallet" ? "Wallet" : payment?.gateway ? `Gateway (${String(payment.gateway).toUpperCase()})` : "Gateway";

  const canShowTicket = status === "CONFIRMED";

  const effectivePNR = useMemo(() => {
    const saved = String(bookingMeta?.pnr || "").trim();
    if (saved) return saved.toUpperCase();

    const fromPax = String(passengers?.[0]?.airlinePnr || "").trim();
    if (fromPax) return fromPax.toUpperCase();

    return genDemoPNR(String(bookingId || "BOOKING"));
  }, [bookingMeta?.pnr, passengers, bookingId]);

  const recordLocator = effectivePNR;

  const saveCtxToSS = (nextCtx: any) => {
    try {
      sessionStorage.setItem(BOOKING_CONFIRM_SS_KEY, JSON.stringify(nextCtx));
      if (nextCtx?.ticket) sessionStorage.setItem(TICKET_SS_KEY, JSON.stringify(nextCtx.ticket));
    } catch {
      // ignore
    }
  };

  const handleUpdatePNR = () => {
    const value = String(pnr || "").trim().toUpperCase();
    if (!value) return;

    setPnrSaving(true);
    window.setTimeout(() => {
      const next = {
        ...(ctx || {}),
        booking: {
          ...(bookingMeta || {}),
          pnr: value,
        },
      };
      saveCtxToSS(next);
      setPnrSaving(false);
    }, 650);
  };

  /** ================= EARLY RETURNS (NO HOOKS BELOW THIS) ================= */
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center px-4" style={{ background: VAR.page, color: VAR.text }}>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
          @keyframes pulseSoft { 0%,100%{ opacity:.55;} 50%{ opacity:1;} }
          details > summary { list-style: none; }
          details > summary::-webkit-details-marker { display:none; }
        `}</style>

        <div className="w-full max-w-md rounded-xl p-6 text-center" style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, boxShadow: VAR.shadowSm }}>
          <div className="mx-auto grid place-items-center">
            <Spinner />
          </div>

          <div className="mt-4 text-base font-extrabold">Confirming your booking…</div>
          <div className="mt-1 text-xs" style={{ color: VAR.muted, animation: "pulseSoft 1.2s ease-in-out infinite" }}>
            Please don&apos;t close or refresh this page.
          </div>

          <div className="mt-5 rounded-xl p-4 text-left" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
            <div className="text-[11px] font-semibold" style={{ color: VAR.subtle }}>
              Booking reference
            </div>
            <div className="mt-1 text-sm font-extrabold" style={{ color: VAR.text }}>
              {bookingId}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket && !bookingPayload) {
    return (
      <div className="min-h-screen grid place-items-center px-4" style={{ background: VAR.page, color: VAR.text }}>
        <div className="w-full max-w-md rounded-xl p-6" style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, boxShadow: VAR.shadowSm }}>
          <div className="text-base font-extrabold">No confirmation found</div>
          <div className="mt-1 text-xs" style={{ color: VAR.muted }}>
            Please complete booking again.
          </div>
          <PrimaryButton onClick={() => nav("/flights")} label="Go to Flights" />
        </div>
      </div>
    );
  }

  const headerTitle = "Booking Confirmation";
  const routeLabel = clampStr(ticket?.routeLabel, "Flight");

  // Soft premium header background (no static colors, uses vars)
  const heroBg = `linear-gradient(135deg, ${VAR.primarySoft}, rgba(255,255,255,0) 55%), radial-gradient(1200px 300px at 20% 0%, ${VAR.primarySoft}, rgba(255,255,255,0) 60%)`;

  return (
    <div className="min-h-screen" style={{ background: VAR.page, color: VAR.text }}>
      <style>{`
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display:none; }
        details[open] summary svg { transform: rotate(90deg); }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 py-5">
        {/* HERO HEADER */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: VAR.surface,
            border: `1px solid ${VAR.border}`,
            boxShadow: VAR.shadow,
          }}
        >
          <div className="p-4 md:p-6" style={{ backgroundImage: heroBg }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.text }}>
                  <span style={{ color: VAR.primary }}>
                    <IconSpark size={16} />
                  </span>
                  Booking processed
                </div>

                <div className="mt-3 text-xl md:text-2xl font-extrabold" style={{ color: VAR.text }}>
                  {headerTitle}
                </div>

                <div className="mt-2 text-xs md:text-sm leading-relaxed" style={{ color: VAR.muted }}>
                  Booking: <b style={{ color: VAR.text }}>{bookingId}</b>
                  {contactEmail ? (
                    <>
                      {" "}
                      • <span className="font-semibold">{contactEmail}</span>
                    </>
                  ) : null}
                  {bookedAt ? (
                    <>
                      {" "}
                      • Booked on <span className="font-semibold">{bookedAt}</span>
                      {bookedTime ? <> • {bookedTime}</> : null}
                    </>
                  ) : null}
                  {contactPhone ? <> • {contactPhone}</> : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StatusBadge status={status} />

                  <Pill label="Route" value={routeLabel} />
                  <Pill label="Travellers" value={passengers.length || 0} />
                  <Pill label="Seats" value={seatsCount} />
                  <Pill label="PNR" value={recordLocator} tone="primary" />
                </div>

                {status === "PENDING" && (
                  <div className="mt-4 rounded-xl p-4 text-sm" style={{ background: VAR.warnSoft, border: `1px solid ${VAR.warn}`, color: VAR.text }}>
                    Your booking is <b>pending</b>. If you have received a PNR from supplier/airline, update it below to complete confirmation.
                  </div>
                )}

                {status === "FAILED" && (
                  <div className="mt-4 rounded-xl p-4 text-sm" style={{ background: VAR.dangerSoft, border: `1px solid ${VAR.danger}`, color: VAR.text }}>
                    Booking <b>failed</b>.{" "}
                    <span style={{ color: VAR.muted }}>
                      {clampStr(bookingMeta?.errorMessage || bookingMeta?.reason || "Please try again or contact support.")}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 md:items-end">
                <div className="flex flex-wrap gap-2">
                  <SubtleButton onClick={() => nav("/flights")} label="Back to search" />
                  <PrimaryButton
                    onClick={() => nav(ROUTE_TICKET_COPY, { state: { ticket } })}
                    disabled={!canShowTicket}
                    label="View ticket copy"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <GhostButton label="Copy Booking ID" onClick={() => void navigator.clipboard?.writeText(String(bookingId))} />
                  <GhostButton label="Copy PNR" onClick={() => void navigator.clipboard?.writeText(String(recordLocator))} />
                </div>

                <div className="text-[11px] font-semibold" style={{ color: VAR.subtle }}>
                  Ticket copy available after confirmation
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-column layout */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_400px]">
          {/* LEFT */}
          <div className="space-y-4">
            <Section
              title="Flight details"
              subtitle="Review segment information, terminals, baggage, and record locator."
              right={
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Pill label="Status" value={<span style={{ color: VAR.text }}>{status}</span>} />
                  <Pill label="Total travel" value={minsToHM(travelMins)} />
                </div>
              }
            >
              {!primarySegs?.length ? (
                <div className="rounded-xl p-4 text-sm" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.muted }}>
                  No flight segments found. (Roundtrip fallback uses bookingPayload.flight outbound/inbound.)
                </div>
              ) : (
                <div className="space-y-4">
                  <FlightLegCard title="Departure" segs={primarySegs} recordLocator={recordLocator} />
                  {!!inbound.length ? <FlightLegCard title="Return" segs={inbound} recordLocator={recordLocator} /> : null}
                </div>
              )}
            </Section>

            {/* Traveler Information */}
            <Section
              title="Traveler information"
              subtitle="Verify passenger names match government ID / passport."
              right={<span className="text-xs font-semibold" style={{ color: VAR.subtle }}>Tickets may be issued later for pending bookings.</span>}
            >
              {/* Desktop table */}
              <div className="hidden md:block rounded-xl" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                <div className="overflow-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead>
                      <tr className="text-[11px]" style={{ color: VAR.subtle }}>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Traveler</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Airline</th>
                        <th className="px-4 py-3">PNR</th>
                        <th className="px-4 py-3">Ticket No.</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {passengers.map((p: any, idx: number) => {
                        const name = [p?.title, p?.firstName, p?.lastName].filter(Boolean).join(" ").trim() || `Traveller ${idx + 1}`;

                        const paxPnr = String(p?.airlinePnr || "").trim()
                          ? String(p.airlinePnr).trim().toUpperCase()
                          : recordLocator;

                        const paxTicketNo = String(p?.ticketNumber || "").trim()
                          ? String(p.ticketNumber).trim()
                          : genDemoTicketNo(String(bookingId || "BOOKING"), idx + 1);

                        return (
                          <tr key={String(p?.id || idx)} className="border-t" style={{ borderColor: VAR.border }}>
                            <td className="px-4 py-4 text-sm font-extrabold" style={{ color: VAR.text }}>
                              {idx + 1}
                            </td>

                            <td className="px-4 py-4">
                              <div className="text-sm font-extrabold" style={{ color: VAR.text }}>
                                {name}
                              </div>
                              <div className="mt-0.5 text-[11px]" style={{ color: VAR.muted }}>
                                ID: {clampStr(p?.id)}
                              </div>
                            </td>

                            <td className="px-4 py-4 text-sm font-semibold" style={{ color: VAR.text }}>
                              {clampStr(p?.paxType, "ADT")}
                            </td>

                            <td className="px-4 py-4 text-sm font-semibold" style={{ color: VAR.text }}>
                              {clampStr(p?.airline, "—")}
                            </td>

                            <td className="px-4 py-4 text-sm font-extrabold" style={{ color: VAR.text }}>
                              {paxPnr}
                              {!String(p?.airlinePnr || "").trim() ? (
                                <span className="ml-2 text-[10px] font-semibold" style={{ color: VAR.subtle }}>
                                  (demo)
                                </span>
                              ) : null}
                            </td>

                            <td className="px-4 py-4 text-sm font-extrabold" style={{ color: VAR.text }}>
                              {paxTicketNo}
                              {!String(p?.ticketNumber || "").trim() ? (
                                <span className="ml-2 text-[10px] font-semibold" style={{ color: VAR.subtle }}>
                                  (demo)
                                </span>
                              ) : null}
                            </td>

                            <td className="px-4 py-4 text-sm font-extrabold" style={{ color: VAR.text }}>
                              {clampStr(p?.status || (status === "CONFIRMED" ? "CONFIRMED" : status), "—")}
                            </td>
                          </tr>
                        );
                      })}

                      {!passengers.length && (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-sm font-semibold" style={{ color: VAR.muted }}>
                            No passenger list found in ticket data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="px-4 pb-4 text-[11px]" style={{ color: VAR.muted }}>
                  Disclaimer: Special requests are not guaranteed. Contact the airline to confirm they have received and confirmed your requests.
                </div>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {passengers.length ? (
                  passengers.map((p: any, idx: number) => {
                    const name = [p?.title, p?.firstName, p?.lastName].filter(Boolean).join(" ").trim() || `Traveller ${idx + 1}`;
                    const paxPnr = String(p?.airlinePnr || "").trim()
                      ? String(p.airlinePnr).trim().toUpperCase()
                      : recordLocator;
                    const paxTicketNo = String(p?.ticketNumber || "").trim()
                      ? String(p.ticketNumber).trim()
                      : genDemoTicketNo(String(bookingId || "BOOKING"), idx + 1);

                    return (
                      <div key={String(p?.id || idx)} className="rounded-xl p-4" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-extrabold" style={{ color: VAR.text }}>
                              {idx + 1}. {name}
                            </div>
                            <div className="mt-1 text-[11px]" style={{ color: VAR.muted }}>
                              ID: {clampStr(p?.id)} • {clampStr(p?.paxType, "ADT")}
                            </div>
                          </div>
                          <span className="rounded-full px-3 py-1 text-[10px] font-extrabold" style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.text }}>
                            {clampStr(p?.status || (status === "CONFIRMED" ? "CONFIRMED" : status), "—")}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="rounded-lg p-2" style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}>
                            <div style={{ color: VAR.subtle }}>PNR</div>
                            <div className="font-extrabold" style={{ color: VAR.text }}>{paxPnr}</div>
                          </div>
                          <div className="rounded-lg p-2" style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}>
                            <div style={{ color: VAR.subtle }}>Ticket No.</div>
                            <div className="font-extrabold" style={{ color: VAR.text }}>{paxTicketNo}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl p-4 text-sm" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.muted }}>
                    No passenger list found in ticket data.
                  </div>
                )}
              </div>

              {/* PNR update (pending only) */}
              {status === "PENDING" && (
                <div className="mt-4 rounded-xl p-4" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-extrabold" style={{ color: VAR.text }}>
                        Update PNR
                      </div>
                      <div className="mt-1 text-xs" style={{ color: VAR.muted }}>
                        Add supplier/airline PNR to continue confirmation (demo). API later: validate PNR and fetch issued ticket details.
                      </div>

                      <input
                        value={pnr}
                        onChange={(e) => setPnr(String(e.target.value))}
                        placeholder="Enter PNR (e.g. ABC123)"
                        className="mt-3 w-full rounded-xl border px-3 py-3 text-sm outline-none"
                        style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                      />

                      <div className="mt-2 text-[11px] font-semibold" style={{ color: VAR.subtle }}>
                        Current PNR: <b style={{ color: VAR.text }}>{recordLocator}</b>
                      </div>
                    </div>

                    <PrimaryButton
                      onClick={handleUpdatePNR}
                      disabled={!String(pnr || "").trim() || pnrSaving}
                      label={pnrSaving ? "Updating…" : "Update PNR"}
                    />
                  </div>
                </div>
              )}
            </Section>
          </div>

          {/* RIGHT */}
          <aside className="space-y-4 lg:sticky lg:top-4 self-start">
            <Section title="Fare details" subtitle="B2B summary, net payable and payment reference.">
              <div className="rounded-xl p-4" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold" style={{ color: VAR.text }}>
                    Fare summary (B2B)
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: VAR.subtle }}>
                    {gatewayLabel}
                  </span>
                </div>

                <Divider />

                <div className="space-y-2">
                  <MoneyRow label="Customer payable (Gross)" value={fmtINR(grossTotal)} />
                  <MoneyRow label="Commission" value={`- ${fmtINR(commissionINR)}`} />
                  <MoneyRow label="TDS" value={`+ ${fmtINR(tdsINR)}`} />

                  <Divider />

                  <MoneyRow label="Net payable (Agent)" value={fmtINR(agentNetINR)} emphasis />
                  <div className="mt-1 text-[11px] font-semibold" style={{ color: VAR.subtle }}>
                    Formula: Gross - Commission + TDS
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl p-4" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                <div className="text-xs font-extrabold" style={{ color: VAR.text }}>
                  Payment & booking
                </div>

                <Divider />

                <div className="space-y-2 text-xs font-semibold" style={{ color: VAR.muted }}>
                  <div className="flex justify-between gap-3">
                    <span>Payment method</span>
                    <span className="font-extrabold" style={{ color: VAR.text }}>
                      {gatewayLabel}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Amount</span>
                    <span className="font-extrabold" style={{ color: VAR.text }}>
                      {fmtINR(payment?.amount ?? agentNetINR)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Booking status</span>
                    <span className="font-extrabold" style={{ color: VAR.text }}>
                      {status}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>PNR</span>
                    <span className="font-extrabold" style={{ color: VAR.text }}>
                      {recordLocator}
                    </span>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Support" subtitle="Share Booking ID with support team for quick resolution.">
              <div className="rounded-xl p-4" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                <div className="text-xs font-extrabold" style={{ color: VAR.text }}>
                  Need help?
                </div>
                <div className="mt-1 text-xs font-semibold" style={{ color: VAR.muted }}>
                  Share Booking ID <b style={{ color: VAR.text }}>{bookingId}</b> with support team.
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <SubtleButton
                    onClick={() => {
                      void navigator.clipboard?.writeText(String(bookingId));
                    }}
                    label="Copy Booking ID"
                  />
                  <PrimaryButton onClick={() => nav("/flights")} label="Book another flight" />
                </div>
              </div>
            </Section>
          </aside>
        </div>
      </div>
    </div>
  );
}
