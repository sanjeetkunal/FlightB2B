// src/pages/PaymentConfirmationPage.tsx (or .jsx)
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

function paxIdToLabel(paxId: string) {
  if (paxId.startsWith("ADT")) return "Adult";
  if (paxId.startsWith("CHD")) return "Child";
  if (paxId.startsWith("INF")) return "Infant";
  return "Traveller";
}

function guessTripLabel(flight: any) {
  // supports: {tripType:'ONEWAY'|'ROUNDTRIP'} OR {outbound, inbound} OR {segments:[]}
  if (!flight) return "Flight";
  if (flight.tripType) return String(flight.tripType).toUpperCase() === "ROUNDTRIP" ? "Round Trip" : "One Way";
  if (flight.outbound || flight.inbound) return "Round Trip";
  return "One Way";
}

function getSegmentsFromFlight(flight: any) {
  // supports: flight.segments (oneway) OR flight.outbound.segments/inbound.segments (roundtrip)
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
  const baseTotal = pricing?.totalFare ?? bookingPayload?.finalTotal ?? 0; // your PassengerDetails uses totalFare + seats later
  const grossTotal = (pricing?.totalFare ?? 0) + seatTotal;

  const travellersCount = useMemo(() => {
    const a = paxConfig?.adults ?? 0;
    const c = paxConfig?.children ?? 0;
    const i = paxConfig?.infants ?? 0;
    return a + c + i;
  }, [paxConfig]);

  // ===== B2B: Agent / Commission controls (demo) =====
  // You can later replace these with API values (commission, tds, agentNetFare etc.)
  const [commissionEdit, setCommissionEdit] = useState<number>(() => Number(pricing?.commissionINR ?? 0));
  const [tdsEdit, setTdsEdit] = useState<number>(() => Number(pricing?.tdsINR ?? 0));
  const [agentNetOverride, setAgentNetOverride] = useState<number>(() => Number(pricing?.agentNetINR ?? 0));
  const [useAgentNetOverride, setUseAgentNetOverride] = useState<boolean>(() => Boolean(pricing?.agentNetINR));

  // Rule (demo):
  // - "Customer Payable" = grossTotal
  // - "Agent Net" = (if override) agentNetOverride else (grossTotal - commissionEdit + tdsEdit)
  // (You can change this formula to your real back-office logic)
  const computedAgentNet = useMemo(() => {
    if (useAgentNetOverride) return Math.max(0, Number(agentNetOverride || 0));
    const c = Math.max(0, Number(commissionEdit || 0));
    const t = Math.max(0, Number(tdsEdit || 0));
    return Math.max(0, grossTotal - c + t);
  }, [grossTotal, commissionEdit, tdsEdit, agentNetOverride, useAgentNetOverride]);

  // ===== Payment method: ONLY ONE (Wallet OR Gateway) =====
  // later walletBalance should come from API
  const walletBalance = 5000; // demo
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "gateway">("gateway");
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>("razorpay");

  const walletSufficient = walletBalance >= computedAgentNet;

  const amountToPayNow = useMemo(() => {
    // If paying by wallet -> full agent net from wallet (demo rule)
    // If paying by gateway -> full agent net via gateway
    return computedAgentNet;
  }, [computedAgentNet]);

  const selectedGateway = PAYMENT_GATEWAYS.find((g) => g.id === selectedGatewayId);

  const tripLabel = guessTripLabel(flight);
  const { outbound, inbound } = getSegmentsFromFlight(flight);

  const passengerList = useMemo(() => {
    const ids = Object.keys(paxDetails || {});
    // If paxDetails empty but paxConfig exists, still render placeholders
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
      // B2B pricing controls
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

    // Later:
    // 1) create-order API
    // 2) if wallet: debit wallet + generate PNR
    // 3) if gateway: redirect to PG
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

                    <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.muted }}>
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
                  {contact.email ? `Email: ${contact.email}` : "Email: —"} •{" "}
                  {contact.phone ? `Mobile: +91 ${contact.phone}` : "Mobile: —"}
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
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.muted }}
                  >
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

            {/* Gateway list (enabled only if paymentMethod === "gateway") */}
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

                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.muted }}
                      >
                        {gw.type === "upi" ? "UPI" : gw.type === "card" ? "CARDS" : gw.type === "netbanking" ? "NETBANKING" : "MIXED"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2">
              <input
                id="agree"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                style={{ accentColor: VAR.primary as any }}
                defaultChecked
              />
              <label htmlFor="agree" className="text-[11px] leading-relaxed" style={{ color: VAR.subtle }}>
                I confirm passenger names match their government ID / passport and I agree to fare rules, cancellation &amp; change policies.
              </label>
            </div>
          </section>
        </div>

        {/* RIGHT – B2B Fare summary */}
        <aside className="w-full shrink-0 space-y-4 lg:w-96">
          {/* Fare summary */}
          <section className="rounded-2xl p-4 shadow-sm" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: VAR.text }}>
                Fare summary (B2B)
              </h2>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.muted }}>
                Demo
              </span>
            </div>

            {/* Customer payable */}
            <div className="mt-3 rounded-xl p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
              <div className="flex justify-between text-xs" style={{ color: VAR.muted }}>
                <span>Base fare (travellers)</span>
                <span>{fmtINR(pricing?.totalFare ?? 0)}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs" style={{ color: VAR.muted }}>
                <span>
                  Seat selection {Array.isArray(seats) && seats.length ? `(${seats.length} × ${fmtINR(seatPricePerSeat)})` : ""}
                </span>
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

            {/* Commission edit */}
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

            {/* Pay CTA */}
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
              Demo page: API implement later. Do not refresh during payment flow.
            </p>
          </section>

          {/* Quick payment summary */}
          <section className="rounded-2xl p-4 shadow-sm" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
            <div className="text-xs font-semibold" style={{ color: VAR.text }}>
              Payment summary
            </div>

            <div className="mt-2 rounded-xl p-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
              <div className="flex justify-between text-xs" style={{ color: VAR.muted }}>
                <span>Method</span>
                <span className="font-semibold" style={{ color: VAR.text }}>
                  {paymentMethod === "wallet" ? "Wallet" : "Payment Gateway"}
                </span>
              </div>

              <div className="mt-1 flex justify-between text-xs" style={{ color: VAR.muted }}>
                <span>Payable now</span>
                <span className="font-semibold" style={{ color: VAR.text }}>
                  {fmtINR(amountToPayNow)}
                </span>
              </div>

              {paymentMethod === "wallet" ? (
                <div className="mt-1 flex justify-between text-[11px]" style={{ color: walletSufficient ? VAR.success : VAR.danger }}>
                  <span>Wallet balance</span>
                  <span className="font-semibold">{fmtINR(walletBalance)}</span>
                </div>
              ) : (
                <div className="mt-1 flex justify-between text-[11px]" style={{ color: VAR.subtle }}>
                  <span>Gateway</span>
                  <span className="font-semibold" style={{ color: VAR.text }}>
                    {selectedGateway?.name ?? "—"}
                  </span>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;
