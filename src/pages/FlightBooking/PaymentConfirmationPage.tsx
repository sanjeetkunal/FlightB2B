// src/pages/PaymentConfirmationPage.tsx
// Drop-in replacement. Works with your existing sessionStorage payload: "BOOKING_PAYLOAD_V1"
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** ================== Theme Vars (avoid hard static colors) ================== */
const VAR = {
  surface: "var(--surface, rgba(255,255,255,0.92))",
  surface2: "var(--surface2, rgba(248,250,252,0.92))",
  border: "var(--border, rgba(15,23,42,0.12))",
  text: "var(--text, rgba(15,23,42,0.92))",
  muted: "var(--muted, rgba(71,85,105,0.9))",
  subtle: "var(--subtle, rgba(100,116,139,0.85))",
  primary: "var(--primary, rgb(37,99,235))",
  primarySoft: "var(--primarySoft, rgba(37,99,235,0.14))",
  accent: "var(--accent, rgb(16,182,217))",
  accentSoft: "var(--accentSoft, rgba(16,182,217,0.12))",
  success: "var(--success, rgb(34,197,94))",
  successSoft: "var(--successSoft, rgba(34,197,94,0.12))",
  warn: "var(--warn, rgb(245,158,11))",
  warnSoft: "var(--warnSoft, rgba(245,158,11,0.14))",
  danger: "var(--danger, rgb(244,63,94))",
};

const nfIN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ================== Ticket Copy storage ================== */
const TICKET_SS_KEY = "TICKET_CTX_V1";

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
function segSummary(segs: any[]) {
  if (!segs?.length) return "";
  const first = segs[0];
  const last = segs[segs.length - 1];
  const from = `${first.fromCity || ""} (${first.fromIata || ""})`;
  const to = `${last.toCity || ""} (${last.toIata || ""})`;
  const time = `${first.departTime || ""} → ${last.arriveTime || ""}`;
  return `${from} → ${to} • ${time}`;
}
function routeLabelFromSegments(outbound: any[], inbound: any[], fallback = "Flight") {
  const pick = (segs: any[]) => {
    if (!segs?.length) return null;
    const first = segs[0];
    const last = segs[segs.length - 1];
    return {
      fromCity: first.fromCity || "",
      fromIata: first.fromIata || "",
      toCity: last.toCity || "",
      toIata: last.toIata || "",
    };
  };

  const o = pick(outbound);
  const r = pick(inbound);

  if (o && r) return `${o.fromCity} (${o.fromIata}) - ${o.toCity} (${o.toIata}) (Round Trip)`;
  if (o) return `${o.fromCity} (${o.fromIata}) - ${o.toCity} (${o.toIata})`;
  return fallback;
}

function toTicketSegments(segs: any[], idPrefix: string) {
  return (segs || []).map((s: any, idx: number) => ({
    id: `${idPrefix}-${idx + 1}`,
    airlineName: s.airline || s.airlineName || "",
    airlineCode: s.airlineCode || s.code || (s.flightNos ? String(s.flightNos).split(" ")[0] : ""),
    flightNo: s.flightNo || s.flightNos || "",
    from: {
      code: s.fromIata || "",
      city: s.fromCity || "",
      terminal: s.fromTerminal || s.terminalFrom || s.from?.terminal,
      time: s.departTime || s.from?.time || "",
      date: s.departDate || s.from?.date || "",
    },
    to: {
      code: s.toIata || "",
      city: s.toCity || "",
      terminal: s.toTerminal || s.terminalTo || s.to?.terminal,
      time: s.arriveTime || s.to?.time || "",
      date: s.arriveDate || s.to?.date || "",
    },
    durationMins: safeNum(s.durationMins ?? s.duration ?? s.durationMinutes),
    cabin: s.cabin || s.cabinClass || "",
    refundable: s.refundable || "",
    baggage: {
      checkIn: s.baggage?.checkKg ? `${s.baggage.checkKg}KG` : s.baggage?.checkIn,
      cabin: s.baggage?.handKg ? `${s.baggage.handKg}KG` : s.baggage?.cabin,
    },
  }));
}

/**
 * Build TicketData for TicketCopyPage (demo)
 * NOTE: backend aayega to yahi mapping replace karna.
 */
function buildTicketFromPayload(args: {
  bookingPayload: any;
  b2b: {
    grossTotal: number;
    commissionINR: number;
    tdsINR: number;
    agentNetINR: number;
  };
  payment: {
    method: "wallet" | "gateway";
    amount: number;
    gateway?: string | null;
  };
}) {
  const { bookingPayload, b2b } = args;

  const flight = bookingPayload?.flight ?? bookingPayload?.selectedFlight ?? bookingPayload?.flightDetails ?? null;
  const paxConfig = bookingPayload?.paxConfig ?? bookingPayload?.pricing?.pax ?? null;
  const paxDetails = bookingPayload?.paxDetails ?? {};
  const seats: string[] = bookingPayload?.seats?.selectedSeats ?? bookingPayload?.seats?.seats ?? [];
  const pricing = bookingPayload?.pricing ?? {};
  const gst = bookingPayload?.gst ?? { enabled: false };

  const { outbound, inbound } = getSegmentsFromFlight(flight);

  // Build passenger list (paxDetails preferred)
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
    return {
      id,
      title: d.title || "",
      firstName: d.firstName || `Traveller`,
      lastName: d.lastName || `${idx + 1}`,
      airline: flight?.airline || "",
      status: "CONFIRMED", // demo
      sector:
        outbound?.length
          ? `${outbound[0]?.fromIata || ""}-${outbound[outbound.length - 1]?.toIata || ""}`
          : `${flight?.fromIata || ""}-${flight?.toIata || ""}`,
      airlinePnr: "—", // demo
      ticketNumber: "—", // demo
      paxType: paxIdToPaxType(id),
      seat: seats?.[idx] || "",
    };
  });

  const now = new Date();
  const bookingDate = now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  const bookingTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // Fare breakup (demo)
  // - baseFare: pricing.totalFare (your current traveller total)
  // - taxes: 0 (until api)
  // - gst/tds from b2b toggles
  const baseFare = safeNum(pricing?.totalFare ?? 0);
  const seatTotal = safeNum(bookingPayload?.seats?.seatTotal ?? (Array.isArray(seats) ? seats.length * safeNum(bookingPayload?.seats?.seatPricePerSeat ?? 250) : 0));

  // In ticket copy: show supplier/gross as base+seat (demo)
  const supplierGross = baseFare + seatTotal;

  return {
    brand: { name: "Virtual2Actual Travel", tagline: "B2B Agent Console" },
    bookingId: bookingPayload?.bookingId || `V2A-${Math.floor(100000 + Math.random() * 900000)}`,
    bookingStatus: "CONFIRMED", // demo after payment
    bookingDate,
    bookingTime,
    tripType: guessTripType(flight),
    routeLabel: routeLabelFromSegments(outbound?.length ? outbound : flight?.segments || [], inbound, "Flight"),
    segments: [
      ...toTicketSegments(outbound?.length ? outbound : flight?.segments || [], "OB"),
      ...toTicketSegments(inbound || [], "IB"),
    ],
    passengers: passengers.map((p: any) => ({
      id: p.id,
      title: p.title,
      firstName: p.firstName,
      lastName: p.lastName,
      airline: p.airline,
      status: p.status,
      sector: p.sector,
      airlinePnr: p.airlinePnr,
      ticketNumber: p.ticketNumber,
      paxType: p.paxType,
    })),
    fare: {
      baseFare: supplierGross,
      taxes: 0,
      airlineCharges: 0,
      otherCharges: 0,
      discount: 0,
      insurance: 0,
      gst: gst?.enabled ? 0 : 0, // demo
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

/** ================== Main ================== */
const PaymentConfirmationPage: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();

  // Accept bookingPayload from router state OR sessionStorage fallback
  const bookingPayload = useMemo(() => {
    const fromState = (location.state as any)?.bookingPayload || null;
    const fromSS = safeParse(sessionStorage.getItem("BOOKING_PAYLOAD_V1"));
    return fromState ?? fromSS ?? null;
  }, [location.state]);

  // If payload not present -> back
  useEffect(() => {
    if (!bookingPayload) return;
    sessionStorage.setItem("BOOKING_PAYLOAD_V1", JSON.stringify(bookingPayload));
  }, [bookingPayload]);

  const flight = bookingPayload?.flight ?? bookingPayload?.selectedFlight ?? bookingPayload?.flightDetails ?? null;
  const paxConfig = bookingPayload?.paxConfig ?? bookingPayload?.pricing?.pax ?? null;
  const contact = bookingPayload?.contact ?? null;
  const paxDetails = bookingPayload?.paxDetails ?? {};
  const seats = bookingPayload?.seats?.selectedSeats ?? bookingPayload?.seats?.seats ?? [];
  const pricing = bookingPayload?.pricing ?? {};
  const gst = bookingPayload?.gst ?? { enabled: false };
  const seatPricePerSeat = bookingPayload?.seats?.seatPricePerSeat ?? 250;

  // totals (fallbacks)
  const seatTotal = bookingPayload?.seats?.seatTotal ?? (Array.isArray(seats) ? seats.length * seatPricePerSeat : 0);
  const grossTotal = (pricing?.totalFare ?? 0) + seatTotal;

  const travellersCount = useMemo(() => {
    const a = paxConfig?.adults ?? 0;
    const c = paxConfig?.children ?? 0;
    const i = paxConfig?.infants ?? 0;
    return a + c + i;
  }, [paxConfig]);

  // ===== B2B: Agent / Commission controls (demo) =====
  const [commissionEdit, setCommissionEdit] = useState<number>(() => Number(pricing?.commissionINR ?? 0));
  const [tdsEdit, setTdsEdit] = useState<number>(() => Number(pricing?.tdsINR ?? 0));
  const [agentNetOverride, setAgentNetOverride] = useState<number>(() => Number(pricing?.agentNetINR ?? 0));
  const [useAgentNetOverride, setUseAgentNetOverride] = useState<boolean>(() => Boolean(pricing?.agentNetINR));

  // demo formula:
  const computedAgentNet = useMemo(() => {
    if (useAgentNetOverride) return Math.max(0, Number(agentNetOverride || 0));
    const c = Math.max(0, Number(commissionEdit || 0));
    const t = Math.max(0, Number(tdsEdit || 0));
    return Math.max(0, grossTotal - c + t);
  }, [grossTotal, commissionEdit, tdsEdit, agentNetOverride, useAgentNetOverride]);

  // ===== Payment method: ONLY ONE (Wallet OR Gateway) =====
  const walletBalance = 100000; // demo
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "gateway">("gateway");
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>("razorpay");

  const walletSufficient = walletBalance >= computedAgentNet;
  const amountToPayNow = computedAgentNet;

  const selectedGateway = PAYMENT_GATEWAYS.find((g) => g.id === selectedGatewayId);

  const tripLabel = guessTripLabel(flight);
  const { outbound, inbound } = getSegmentsFromFlight(flight);

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

  const handleConfirmPayment = () => {
    const payload = {
      bookingPayload,
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
        wallet: paymentMethod === "wallet" ? { useWallet: true, walletAmount: amountToPayNow } : { useWallet: false, walletAmount: 0 },
        gateway: paymentMethod === "gateway" ? selectedGatewayId : null,
      },
    };

    console.log("CONFIRM PAYMENT PAYLOAD:", payload);

    // ✅ DEMO SUCCESS: build ticket + redirect to ticket copy page
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

    nav("/flights/ticket-copy", {
      state: { ticket },
    });

    // Later (API):
    // 1) create-order API
    // 2) wallet: debit wallet + generate PNR/Tickets => then navigate with real ticket data
    // 3) gateway: redirect => success callback => then navigate with real ticket data
  };

  if (!bookingPayload) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">No booking found</div>
          <div className="mt-1 text-xs text-slate-600">Please go back and select a flight again.</div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => nav(-1)}
              className="rounded-lg px-3 py-2 text-xs font-semibold"
              style={{ background: VAR.primary, color: "white" }}
            >
              Go Back
            </button>
            <button
              onClick={() => nav("/flights")}
              className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold"
              style={{ borderColor: VAR.border, color: "rgba(15,23,42,0.85)" }}
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b" style={{ background: VAR.surface, borderColor: VAR.border }}>
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold" style={{ backgroundImage: titleGradient, WebkitBackgroundClip: "text", color: "transparent" }}>
              Confirm booking &amp; payment
            </h1>
            <p className="mt-1 text-xs md:text-sm" style={{ color: VAR.muted }}>
              Review travellers, fare breakdown (B2B), then pay using <b>either</b> Wallet or Payment Gateway.
            </p>
          </div>

          <div className="rounded-full px-3 py-1 text-xs" style={{ background: VAR.successSoft, color: VAR.text, border: `1px solid ${VAR.border}` }}>
            Secure payment • Encrypted gateway
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row">
        {/* LEFT */}
        <div className="flex-1 space-y-4">
          {/* Review booking */}
          <section className="rounded-2xl p-4 shadow-sm" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold" style={{ color: VAR.text }}>
                  Review booking
                </div>
                <div className="mt-0.5 text-[11px]" style={{ color: VAR.subtle }}>
                  {tripLabel} • {flight?.airline || ""} {flight?.flightNos ? `• ${flight.flightNos}` : ""}
                </div>
              </div>
              <button
                onClick={() => nav("/flights/passenger-details", { state: { bookingPayload } })}
                className="rounded-lg px-3 py-2 text-xs font-semibold"
                style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2, color: VAR.text }}
              >
                Edit details
              </button>
            </div>

            <div className="mt-3 rounded-xl p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
              <div className="text-xs font-semibold" style={{ color: VAR.text }}>
                {outbound?.length ? "Outbound" : "Flight"}
              </div>
              <div className="mt-0.5 text-xs" style={{ color: VAR.muted }}>
                {outbound?.length ? segSummary(outbound) : segSummary(flight?.segments || [])}
              </div>

              {!!inbound?.length && (
                <>
                  <div className="mt-2 text-xs font-semibold" style={{ color: VAR.text }}>
                    Return
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: VAR.muted }}>
                    {segSummary(inbound)}
                  </div>
                </>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: VAR.subtle }}>
                <span className="rounded-full px-2 py-1" style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}>
                  Travellers: {travellersCount || passengerList.length}
                </span>
                <span className="rounded-full px-2 py-1" style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}>
                  Seats: {Array.isArray(seats) ? seats.length : 0}
                </span>
                <span className="rounded-full px-2 py-1" style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}>
                  Fare: {flight?.refundable === "Refundable" ? "Refundable" : "Non-refundable"}
                </span>
                {!!gst?.enabled && (
                  <span className="rounded-full px-2 py-1" style={{ background: VAR.successSoft, border: `1px solid ${VAR.border}`, color: VAR.text }}>
                    GST added
                  </span>
                )}
              </div>
            </div>

            <hr className="my-3 border-dashed" style={{ borderColor: VAR.border }} />

            {/* Passenger list */}
            <div className="space-y-2">
              {passengerList.map((p, idx) => {
                const d = p.data || {};
                const name = [d.title, d.firstName, d.lastName].filter(Boolean).join(" ").trim() || `Traveller ${idx + 1}`;
                const seat = Array.isArray(seats) ? seats[idx] : null;

                return (
                  <div key={p.id} className="flex items-start justify-between gap-3 rounded-xl p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: VAR.text }}>
                        {p.type} {String(p.id).split("-")[1] || ""} — {name}
                      </div>
                      <div className="mt-0.5 text-[11px]" style={{ color: VAR.subtle }}>
                        Gender: {d.gender || "—"} • DOB: {d.dob || "—"}
                      </div>
                      <div className="mt-0.5 text-[11px]" style={{ color: VAR.subtle }}>
                        Seat: <span style={{ color: VAR.text, fontWeight: 600 }}>{seat || "Not selected"}</span>
                      </div>
                    </div>

                    <span
                      className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.muted }}
                    >
                      {p.type}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Contact */}
            {contact && (
              <div className="mt-3 rounded-xl p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
                <div className="text-xs font-semibold" style={{ color: VAR.text }}>
                  Contact
                </div>
                <div className="mt-1 text-xs" style={{ color: VAR.muted }}>
                  {contact.email ? `Email: ${contact.email}` : "Email: —"} • {contact.phone ? `Mobile: +91 ${contact.phone}` : "Mobile: —"}
                </div>
              </div>
            )}
          </section>

          {/* Payment options */}
          <section className="rounded-2xl p-4 shadow-sm" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold" style={{ color: VAR.text }}>
                Payment options
              </h2>
              <span className="text-[11px]" style={{ color: VAR.subtle }}>
                Select only one method (Wallet OR Gateway)
              </span>
            </div>

            {/* Method selector */}
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {/* Wallet */}
              <button
                type="button"
                onClick={() => setPaymentMethod("wallet")}
                className="rounded-xl p-3 text-left transition"
                style={{
                  background: paymentMethod === "wallet" ? VAR.warnSoft : VAR.surface2,
                  border: `1px solid ${paymentMethod === "wallet" ? VAR.warn : VAR.border}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold" style={{ color: VAR.text }}>
                    Pay using Agent Wallet
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.muted }}>
                    Balance: {fmtINR(walletBalance)}
                  </span>
                </div>
                <div className="mt-1 text-[11px]" style={{ color: VAR.subtle }}>
                  Wallet will be charged full payable amount (demo). If insufficient, choose gateway.
                </div>

                {!walletSufficient && (
                  <div className="mt-2 text-[11px] font-semibold" style={{ color: VAR.danger }}>
                    Insufficient wallet balance for {fmtINR(amountToPayNow)}.
                  </div>
                )}
              </button>

              {/* Gateway */}
              <button
                type="button"
                onClick={() => setPaymentMethod("gateway")}
                className="rounded-xl p-3 text-left transition"
                style={{
                  background: paymentMethod === "gateway" ? VAR.primarySoft : VAR.surface2,
                  border: `1px solid ${paymentMethod === "gateway" ? VAR.primary : VAR.border}`,
                }}
              >
                <div className="text-sm font-semibold" style={{ color: VAR.text }}>
                  Pay via Payment Gateway
                </div>
                <div className="mt-1 text-[11px]" style={{ color: VAR.subtle }}>
                  UPI / Cards / Netbanking. Wallet will not be used.
                </div>
              </button>
            </div>

            {/* Gateway list */}
            <div className="mt-4 space-y-2" style={{ opacity: paymentMethod === "gateway" ? 1 : 0.45 }}>
              <p className="text-xs font-medium" style={{ color: VAR.muted }}>
                Select payment gateway
              </p>

              <div className="space-y-2">
                {PAYMENT_GATEWAYS.map((gw) => {
                  const active = selectedGatewayId === gw.id;
                  return (
                    <button
                      key={gw.id}
                      type="button"
                      disabled={paymentMethod !== "gateway"}
                      onClick={() => setSelectedGatewayId(gw.id)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs md:text-sm transition"
                      style={{
                        border: `1px solid ${active ? VAR.primary : VAR.border}`,
                        background: active ? VAR.primarySoft : VAR.surface2,
                        color: VAR.text,
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="grid h-4 w-4 place-items-center rounded-full border text-[10px] font-bold"
                            style={{
                              borderColor: active ? VAR.primary : VAR.border,
                              background: active ? VAR.primary : VAR.surface,
                              color: active ? "white" : "transparent",
                            }}
                          >
                            ●
                          </span>
                          <span className="font-semibold">{gw.name}</span>
                        </div>
                        <p className="mt-0.5 text-[11px]" style={{ color: VAR.subtle }}>
                          {gw.description}
                        </p>
                      </div>

                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.muted }}>
                        {gw.type === "upi" ? "UPI" : gw.type === "card" ? "CARDS" : gw.type === "netbanking" ? "NETBANKING" : "MIXED"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2">
              <input id="agree" type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300" style={{ accentColor: VAR.primary as any }} defaultChecked />
              <label htmlFor="agree" className="text-[11px] leading-relaxed" style={{ color: VAR.subtle }}>
                I confirm passenger names match their government ID / passport and I agree to fare rules, cancellation &amp; change policies.
              </label>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <aside className="w-full shrink-0 space-y-4 lg:w-96">
          <section className="rounded-2xl p-4 shadow-sm" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: VAR.text }}>
                Fare summary (B2B)
              </h2>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.muted }}>
                Demo
              </span>
            </div>

            <div className="mt-3 rounded-xl p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
              <div className="flex justify-between text-xs" style={{ color: VAR.muted }}>
                <span>Base fare (travellers)</span>
                <span>{fmtINR(pricing?.totalFare ?? 0)}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs" style={{ color: VAR.muted }}>
                <span>Seat selection {Array.isArray(seats) && seats.length ? `(${seats.length} × ${fmtINR(seatPricePerSeat)})` : ""}</span>
                <span>{fmtINR(seatTotal)}</span>
              </div>

              {!!gst?.enabled && (
                <div className="mt-1 flex justify-between text-[11px]" style={{ color: VAR.success }}>
                  <span>GST details added</span>
                  <span className="font-semibold">B2B</span>
                </div>
              )}

              <div className="mt-2 flex items-center justify-between border-t border-dashed pt-2" style={{ borderColor: VAR.border }}>
                <span className="text-xs font-semibold" style={{ color: VAR.text }}>
                  Customer payable (Gross)
                </span>
                <span className="text-base font-extrabold" style={{ color: VAR.text }}>
                  {fmtINR(grossTotal)}
                </span>
              </div>
            </div>

            <div className="mt-3 rounded-xl p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold" style={{ color: VAR.text }}>
                  Agent earnings &amp; net payable
                </div>

                <label className="inline-flex items-center gap-2 text-[11px]" style={{ color: VAR.muted }}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    style={{ accentColor: VAR.primary as any }}
                    checked={useAgentNetOverride}
                    onChange={(e) => setUseAgentNetOverride(e.target.checked)}
                  />
                  Override Net Fare
                </label>
              </div>

              {!useAgentNetOverride ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold" style={{ color: VAR.subtle }}>
                      Commission (₹)
                    </label>
                    <input
                      value={String(commissionEdit)}
                      onChange={(e) => setCommissionEdit(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                      style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                      inputMode="numeric"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold" style={{ color: VAR.subtle }}>
                      TDS (₹)
                    </label>
                    <input
                      value={String(tdsEdit)}
                      onChange={(e) => setTdsEdit(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                      style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                      inputMode="numeric"
                    />
                  </div>

                  <div className="col-span-2 mt-1 text-[11px]" style={{ color: VAR.subtle }}>
                    Net payable formula (demo): <b>Gross - Commission + TDS</b>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <label className="block text-[11px] font-semibold" style={{ color: VAR.subtle }}>
                    Agent Net Fare (₹)
                  </label>
                  <input
                    value={String(agentNetOverride)}
                    onChange={(e) => setAgentNetOverride(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                    inputMode="numeric"
                  />
                  <div className="mt-1 text-[11px]" style={{ color: VAR.subtle }}>
                    This will be the final payable for payment (demo).
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-dashed pt-2" style={{ borderColor: VAR.border }}>
                <span className="text-xs font-semibold" style={{ color: VAR.text }}>
                  Net payable (Agent)
                </span>
                <span className="text-base font-extrabold" style={{ color: VAR.primary }}>
                  {fmtINR(computedAgentNet)}
                </span>
              </div>

              <div className="mt-1 text-[11px]" style={{ color: VAR.subtle }}>
                Payment method chosen will pay this net amount.
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={paymentMethod === "wallet" && !walletSufficient}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition"
              style={{
                background: paymentMethod === "wallet" ? VAR.warn : VAR.primary,
                color: "white",
                opacity: paymentMethod === "wallet" && !walletSufficient ? 0.5 : 1,
              }}
            >
              {paymentMethod === "wallet" ? "Pay using Wallet" : `Pay via ${selectedGateway?.name ?? "Gateway"}`} • {fmtINR(amountToPayNow)}
            </button>

            <p className="mt-2 text-[10px]" style={{ color: VAR.subtle }}>
              Demo page: API implement later. Payment success simulate -Ticket Copy page.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;
