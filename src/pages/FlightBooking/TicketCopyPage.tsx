// TicketCopyPage.tsx (drop-in replacement)
// ✅ Static colors removed (no bg-slate-*, text-slate-*, border-slate-* color classes)
// ✅ Uses CSS variables (same pattern like your PaymentConfirmationPage VAR object)

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock,
  Download,
  FileText,
  Mail,
  Pencil,
  Printer,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Tag,
  Wallet,
} from "lucide-react";

/** ================== Theme Vars (dynamic) ================== */
const VAR = {
  page: "var(--page, rgba(248,250,252,1))",
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
  dangerSoft: "var(--dangerSoft, rgba(244,63,94,0.12))",
};

const nfIN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/* ===================== Types ===================== */

export type Pax = {
  id: string | number;
  title?: string;
  firstName: string;
  lastName: string;
  airline?: string;
  status: "CONFIRMED" | "HOLD" | "CANCELLED" | string;
  sector: string;
  airlinePnr?: string;
  ticketNumber?: string;
  paxType?: "ADT" | "CHD" | "INF" | string;
};

export type Segment = {
  id: string | number;
  airlineName: string;
  airlineCode: string;
  flightNo: string;
  from: { code: string; city: string; terminal?: string; time: string; date: string };
  to: { code: string; city: string; terminal?: string; time: string; date: string };
  durationMins?: number;
  cabin?: string;
  refundable?: "Refundable" | "Non Refundable" | string;
  baggage?: { checkIn?: string; cabin?: string };
};

export type FareBreakup = {
  baseFare: number;
  taxes: number;
  airlineCharges?: number;
  otherCharges?: number;
  discount?: number;
  insurance?: number;
  gst?: number;
  tds?: number;
};

export type AgentPricing = {
  markup: number;
  serviceFee: number;
  commissionOverride: number;
  notes?: string;
};

export type TicketData = {
  brand?: { name: string; tagline?: string };
  bookingId: string;
  bookingStatus: "CONFIRMED" | "HOLD" | "CANCELLED" | string;
  bookingDate: string;
  bookingTime: string;
  tripType?: "ONEWAY" | "ROUND" | "MULTI" | string;
  routeLabel: string;
  segments: Segment[];
  passengers: Pax[];
  fare: FareBreakup;
  agentPricing?: Partial<AgentPricing>;
  cancellation?: {
    easeMyTripFeeLabel?: string;
    airlineFeeRules?: Array<{ label: string; amount: string }>;
  };
  terms?: string[];
};

export type SavePricingPayload = {
  bookingId: string;
  pricing: AgentPricing;
  computed: { supplierTotal: number; agentNetTotal: number; customerPayable: number };
};

export type EmailTicketPayload = {
  bookingId: string;
  mode: "CUSTOMER" | "AGENT";
  toEmail?: string;
};

/* ===================== Helpers ===================== */

const fmtINR = (n: number) => `₹${nfIN.format(Math.round(n || 0))}`;

const toMinsLabel = (mins?: number) => {
  if (!mins && mins !== 0) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

const safeNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const statusTone = (s: string) => {
  const up = String(s || "").toUpperCase();
  if (up.includes("CONF")) return { bg: VAR.successSoft, fg: VAR.success, border: VAR.border };
  if (up.includes("HOLD")) return { bg: VAR.warnSoft, fg: VAR.warn, border: VAR.border };
  if (up.includes("CANC")) return { bg: VAR.dangerSoft, fg: VAR.danger, border: VAR.border };
  return { bg: VAR.surface2, fg: VAR.muted, border: VAR.border };
};

/* ===================== Demo data ===================== */

const DEMO_TICKET: TicketData = {
  brand: { name: "Virtual2Actual Travel", tagline: "B2B Agent Console" },
  bookingId: "EMT-SAMPLE-7755148",
  bookingStatus: "CONFIRMED",
  bookingDate: "Thu, 02 May 2025",
  bookingTime: "15:12",
  tripType: "ONEWAY",
  routeLabel: "Delhi - Bangalore",
  segments: [
    {
      id: 1,
      airlineName: "Vistara",
      airlineCode: "UK",
      flightNo: "UK 817",
      from: { code: "DEL", city: "Delhi", terminal: "T3", time: "16:05", date: "Thu-02May2019" },
      to: { code: "BLR", city: "Bangalore", terminal: "T1", time: "18:30", date: "Thu-02May2019" },
      durationMins: 145,
      cabin: "Economy",
      refundable: "Non Refundable",
      baggage: { checkIn: "15KG", cabin: "7KG" },
    },
  ],
  passengers: [
    {
      id: 1,
      firstName: "Prakash",
      lastName: "Sharma",
      airline: "UK",
      status: "CONFIRMED",
      sector: "DEL-BLR",
      airlinePnr: "LXY283",
      ticketNumber: "2202497003757/1",
      paxType: "ADT",
    },
  ],
  fare: {
    baseFare: 7000,
    taxes: 1084,
    airlineCharges: 0,
    otherCharges: 0,
    discount: 0,
    insurance: 0,
    gst: 0,
    tds: 0,
  },
  agentPricing: { markup: 250, serviceFee: 0, commissionOverride: 0 },
  cancellation: {
    easeMyTripFeeLabel: "Convenience fee: ₹ 250 per pax per sector",
    airlineFeeRules: [{ label: "Before 4 hours of departure", amount: "₹ 3,180 (per pax per sector)" }],
  },
  terms: [
    "All passengers must present valid government ID at check-in.",
    "Name changes are not permitted after ticket issuance.",
    "Baggage allowances may vary by fare family.",
  ],
};

/* ===================== Component ===================== */

export default function TicketCopyPage({
  ticket = DEMO_TICKET,
  onBack,
  onSavePricing,
  onEmailTicket,
  onDownloadPdf,
}: {
  ticket?: TicketData;
  onBack?: () => void;
  onSavePricing?: (payload: SavePricingPayload) => Promise<void> | void;
  onEmailTicket?: (payload: EmailTicketPayload) => Promise<void> | void;
  onDownloadPdf?: (mode: "CUSTOMER" | "AGENT") => Promise<void> | void;
}) {
  const brandName = ticket.brand?.name || "B2B Flight Portal";
  const brandTagline = ticket.brand?.tagline || "Ticket Copy";

  const [mode, setMode] = useState<"CUSTOMER" | "AGENT">("CUSTOMER");
  const [editPricing, setEditPricing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const [pricing, setPricing] = useState<AgentPricing>({
    markup: safeNum(ticket.agentPricing?.markup),
    serviceFee: safeNum(ticket.agentPricing?.serviceFee),
    commissionOverride: safeNum(ticket.agentPricing?.commissionOverride),
    notes: ticket.agentPricing?.notes || "",
  });

  const supplierTotal = useMemo(() => {
    const f = ticket.fare;
    const base = safeNum(f.baseFare);
    const taxes = safeNum(f.taxes);
    const airline = safeNum(f.airlineCharges);
    const other = safeNum(f.otherCharges);
    const insurance = safeNum(f.insurance);
    const gst = safeNum(f.gst);
    const tds = safeNum(f.tds);
    const discount = safeNum(f.discount);
    return base + taxes + airline + other + insurance + gst + tds - discount;
  }, [ticket.fare]);

  const agentNetTotal = useMemo(() => supplierTotal, [supplierTotal]);

  const customerPayable = useMemo(() => {
    const m = safeNum(pricing.markup);
    const sf = safeNum(pricing.serviceFee);
    return supplierTotal + m + sf;
  }, [supplierTotal, pricing.markup, pricing.serviceFee]);

  const fareRows = useMemo(() => {
    const f = ticket.fare;
    return [
      { label: "Base Fare", amount: safeNum(f.baseFare) },
      { label: "Taxes", amount: safeNum(f.taxes) },
      ...(safeNum(f.airlineCharges) ? [{ label: "Airline Charges", amount: safeNum(f.airlineCharges) }] : []),
      ...(safeNum(f.otherCharges) ? [{ label: "Other Charges", amount: safeNum(f.otherCharges) }] : []),
      ...(safeNum(f.insurance) ? [{ label: "Insurance", amount: safeNum(f.insurance) }] : []),
      ...(safeNum(f.gst) ? [{ label: "GST", amount: safeNum(f.gst) }] : []),
      ...(safeNum(f.tds) ? [{ label: "TDS", amount: safeNum(f.tds) }] : []),
      ...(safeNum(f.discount) ? [{ label: "Discount", amount: -Math.abs(safeNum(f.discount)) }] : []),
    ];
  }, [ticket.fare]);

  const handlePricingChange = (key: keyof AgentPricing, value: string) => {
    setPricing((p) => ({ ...p, [key]: safeNum(value) }));
  };

  const resetPricing = () => {
    setPricing({
      markup: safeNum(ticket.agentPricing?.markup),
      serviceFee: safeNum(ticket.agentPricing?.serviceFee),
      commissionOverride: safeNum(ticket.agentPricing?.commissionOverride),
      notes: ticket.agentPricing?.notes || "",
    });
  };

  const savePricing = async () => {
    if (!onSavePricing) {
      setEditPricing(false);
      return;
    }
    try {
      setBusy("save");
      const payload: SavePricingPayload = {
        bookingId: ticket.bookingId,
        pricing,
        computed: { supplierTotal, agentNetTotal, customerPayable },
      };
      await onSavePricing(payload);
      setEditPricing(false);
    } finally {
      setBusy(null);
    }
  };

  const doEmail = async () => {
    if (!onEmailTicket) return;
    try {
      setBusy("email");
      await onEmailTicket({ bookingId: ticket.bookingId, mode });
    } finally {
      setBusy(null);
    }
  };

  const doDownload = async () => {
    if (!onDownloadPdf) return;
    try {
      setBusy("pdf");
      await onDownloadPdf(mode);
    } finally {
      setBusy(null);
    }
  };

  const printTicket = () => window.print();

  const titleGradient = `linear-gradient(90deg, ${VAR.primary}, ${VAR.accent})`;
  const bookingTone = statusTone(ticket.bookingStatus);

  return (
    <div className="min-h-screen" >
      {/* ================= Top Bar ================= */}
      <div
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ background: VAR.surface, borderColor: VAR.border }}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium"
              style={{ borderColor: VAR.border, background: VAR.surface2, color: VAR.text }}
              title="Back"
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <div className="text-xs" style={{ color: VAR.subtle }}>
                Ticket Copy
              </div>
              <div className="text-sm md:text-base font-semibold" style={{ color: VAR.text }}>
                {ticket.routeLabel}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode switch */}
            <div className="inline-flex rounded-xl border p-1" style={{ borderColor: VAR.border, background: VAR.surface2 }}>
              {([
                { key: "CUSTOMER", label: "Customer Copy" },
                { key: "AGENT", label: "Agent Copy" },
              ] as const).map((m) => {
                const active = mode === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMode(m.key)}
                    className="rounded-lg px-3 py-1.5 text-[11px] font-semibold transition"
                    style={{
                      background: active ? VAR.primary : "transparent",
                      color: active ? "white" : VAR.muted,
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={printTicket}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium"
              style={{ borderColor: VAR.border, background: VAR.surface2, color: VAR.text }}
            >
              <Printer className="h-4 w-4" />
              Print
            </button>

            <button
              type="button"
              onClick={doDownload}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium disabled:opacity-60"
              style={{ borderColor: VAR.border, background: VAR.surface2, color: VAR.text }}
              disabled={!onDownloadPdf || busy === "pdf"}
            >
              <Download className="h-4 w-4" />
              {busy === "pdf" ? "Preparing..." : "Download PDF"}
            </button>

            <button
              type="button"
              onClick={doEmail}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-60"
              style={{ background: VAR.primary, color: "white" }}
              disabled={!onEmailTicket || busy === "email"}
            >
              <Mail className="h-4 w-4" />
              {busy === "email" ? "Sending..." : "Email"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* ================= Printable Ticket Sheet ================= */}
        <div className="rounded-2xl shadow-sm overflow-hidden border" style={{ background: VAR.surface, borderColor: VAR.border }}>
          {/* Header strip */}
          <div className="p-5 border-b" style={{ borderColor: VAR.border }}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Brand */}
              <div className="flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{ background: `linear-gradient(135deg, ${VAR.primary}, ${VAR.accent})`, color: "white" }}
                >
                  {brandName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 3)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="text-lg font-semibold" style={{ color: VAR.text }}>
                    <span style={{ backgroundImage: titleGradient, WebkitBackgroundClip: "text", color: "transparent" }}>
                      {brandName}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: VAR.subtle }}>
                    {brandTagline}
                  </div>
                </div>
              </div>

              {/* Status & meta */}
              <div className="flex flex-col sm:items-end gap-2">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold border"
                  style={{ background: bookingTone.bg, color: bookingTone.fg, borderColor: bookingTone.border }}
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {String(ticket.bookingStatus).toUpperCase().includes("CONF") ? "Booking Confirmed" : ticket.bookingStatus}
                </div>

                <div className="flex flex-wrap gap-2 text-[11px]" style={{ color: VAR.muted }}>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Booking Date: <span className="font-medium" style={{ color: VAR.text }}>{ticket.bookingDate}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Time: <span className="font-medium" style={{ color: VAR.text }}>{ticket.bookingTime}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Greeting */}
            <div className="mt-4 text-sm" style={{ color: VAR.text }}>
              <span className="font-medium">Hi,</span>
              <div className="mt-1 text-[13px]" style={{ color: VAR.muted }}>
                Your flight ticket for <span className="font-semibold" style={{ color: VAR.text }}>{ticket.routeLabel}</span> is
                <span className="font-semibold" style={{ color: VAR.text }}> {String(ticket.bookingStatus).toLowerCase()}</span>.{" "}
                Please use this copy for communication with your customer or back-office.
              </div>
              <div className="mt-2 text-[12px]" style={{ color: VAR.muted }}>
                Your Booking ID is <span className="font-semibold" style={{ color: VAR.text }}>{ticket.bookingId}</span>
              </div>
            </div>
          </div>

          {/* Segment summary */}
          <div className="px-5 py-4 border-b" style={{ borderColor: VAR.border }}>
            <div className="space-y-3">
              {ticket.segments.map((s, idx) => (
                <div
                  key={s.id}
                  className="rounded-xl border p-4"
                  style={{ borderColor: VAR.border, background: VAR.surface2 }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-lg border flex items-center justify-center text-xs font-bold"
                        style={{ background: VAR.surface, borderColor: VAR.border, color: VAR.text }}
                      >
                        {s.airlineCode}
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: VAR.text }}>
                          {s.airlineName}
                          <span style={{ color: VAR.subtle, fontWeight: 400 }}> · </span>
                          <span style={{ color: VAR.muted }}>{s.airlineCode} {s.flightNo}</span>
                        </div>
                        <div className="text-[11px]" style={{ color: VAR.subtle }}>
                          {ticket.tripType || "Trip"} · {s.cabin || "Cabin"}
                          {s.refundable ? ` · ${s.refundable}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]" style={{ color: VAR.muted }}>
                      {s.durationMins ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-1"
                          style={{ background: VAR.surface, borderColor: VAR.border, color: VAR.muted }}
                        >
                          <Clock className="h-3 w-3" />
                          {toMinsLabel(s.durationMins)}
                        </span>
                      ) : null}

                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-1"
                        style={{ background: VAR.surface, borderColor: VAR.border, color: bookingTone.fg }}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        {ticket.bookingStatus}
                      </span>

                      {idx === 0 && ticket.segments.length > 1 ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-1"
                          style={{ background: VAR.surface, borderColor: VAR.border, color: VAR.muted }}
                        >
                          <Tag className="h-3 w-3" />
                          Segment {idx + 1}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_120px_1fr] items-center gap-3">
                    <div className="rounded-lg border p-3" style={{ background: VAR.surface, borderColor: VAR.border }}>
                      <div className="text-[10px]" style={{ color: VAR.subtle }}>Departure</div>
                      <div className="mt-0.5 text-sm font-semibold" style={{ color: VAR.text }}>
                        {s.from.city} <span style={{ color: VAR.subtle }}>({s.from.code})</span>
                      </div>
                      <div className="text-[12px] font-medium" style={{ color: VAR.text }}>{s.from.time}</div>
                      <div className="text-[10px]" style={{ color: VAR.subtle }}>
                        {s.from.date}{s.from.terminal ? ` · ${s.from.terminal}` : ""}
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col items-center justify-center">
                      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${VAR.border}, transparent)` }} />
                      <div
                        className="-mt-2 rounded-full px-2 text-[10px]"
                        style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.subtle }}
                      >
                        Non-stop
                      </div>
                    </div>

                    <div className="rounded-lg border p-3" style={{ background: VAR.surface, borderColor: VAR.border }}>
                      <div className="text-[10px]" style={{ color: VAR.subtle }}>Arrival</div>
                      <div className="mt-0.5 text-sm font-semibold" style={{ color: VAR.text }}>
                        {s.to.city} <span style={{ color: VAR.subtle }}>({s.to.code})</span>
                      </div>
                      <div className="text-[12px] font-medium" style={{ color: VAR.text }}>{s.to.time}</div>
                      <div className="text-[10px]" style={{ color: VAR.subtle }}>
                        {s.to.date}{s.to.terminal ? ` · ${s.to.terminal}` : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Passengers table */}
          <div className="px-5 py-4 border-b" style={{ borderColor: VAR.border }}>
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: VAR.muted }}>
                Passengers
              </div>
              <div className="text-[11px]" style={{ color: VAR.subtle }}>
                {ticket.passengers.length} passenger{ticket.passengers.length > 1 ? "s" : ""}
              </div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-[11px]">
                <thead>
                  <tr style={{ background: VAR.surface2, color: VAR.muted }}>
                    <th className="text-left font-semibold px-3 py-2 rounded-l-lg">Passenger</th>
                    <th className="text-left font-semibold px-3 py-2">Airline</th>
                    <th className="text-left font-semibold px-3 py-2">Status</th>
                    <th className="text-left font-semibold px-3 py-2">Sector</th>
                    <th className="text-left font-semibold px-3 py-2">Airline PNR</th>
                    <th className="text-left font-semibold px-3 py-2 rounded-r-lg">Ticket Number</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.passengers.map((p) => {
                    const tone = statusTone(p.status);
                    return (
                      <tr key={p.id} className="border-b last:border-b-0" style={{ borderColor: VAR.border }}>
                        <td className="px-3 py-2">
                          <div className="font-medium" style={{ color: VAR.text }}>
                            {(p.title ? p.title + " " : "") + p.firstName + " " + p.lastName}
                          </div>
                          <div className="text-[10px]" style={{ color: VAR.subtle }}>{p.paxType || "ADT"}</div>
                        </td>
                        <td className="px-3 py-2" style={{ color: VAR.muted }}>{p.airline || "-"}</td>
                        <td className="px-3 py-2">
                          <span
                            className="inline-flex rounded-full px-2 py-0.5 font-semibold border"
                            style={{ background: tone.bg, color: tone.fg, borderColor: VAR.border }}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-3 py-2" style={{ color: VAR.muted }}>{p.sector}</td>
                        <td className="px-3 py-2" style={{ color: VAR.muted }}>{p.airlinePnr || "-"}</td>
                        <td className="px-3 py-2" style={{ color: VAR.muted }}>{p.ticketNumber || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Baggage */}
          <div className="px-5 py-4 border-b" style={{ borderColor: VAR.border }}>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: VAR.muted }}>
              Baggage Info
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-[11px]">
                <thead>
                  <tr style={{ background: VAR.surface2, color: VAR.muted }}>
                    <th className="text-left font-semibold px-3 py-2 rounded-l-lg">Airline</th>
                    <th className="text-left font-semibold px-3 py-2">Sector</th>
                    <th className="text-left font-semibold px-3 py-2">Check-in</th>
                    <th className="text-left font-semibold px-3 py-2 rounded-r-lg">Cabin</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.segments.map((s) => (
                    <tr key={s.id} className="border-b last:border-b-0" style={{ borderColor: VAR.border }}>
                      <td className="px-3 py-2" style={{ color: VAR.muted }}>{s.airlineCode}</td>
                      <td className="px-3 py-2" style={{ color: VAR.muted }}>{s.from.code}-{s.to.code}</td>
                      <td className="px-3 py-2" style={{ color: VAR.muted }}>{s.baggage?.checkIn || "As per airline"}</td>
                      <td className="px-3 py-2" style={{ color: VAR.muted }}>{s.baggage?.cabin || "As per airline"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fare Details */}
          <div className="px-5 py-4 border-b" style={{ borderColor: VAR.border }}>
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: VAR.muted }}>
                Fare Details
              </div>
              <div className="text-[10px]" style={{ color: VAR.subtle }}>
                {mode === "AGENT" ? "Agent view includes internal pricing" : "Customer view"}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border p-3" style={{ borderColor: VAR.border, background: VAR.surface2 }}>
                <div className="text-[11px] font-semibold" style={{ color: VAR.muted }}>
                  Supplier Fare (Gross)
                </div>
                <div className="mt-2 space-y-1">
                  {fareRows.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span style={{ color: VAR.subtle }}>{r.label}</span>
                      <span style={{ fontWeight: 600, color: r.amount < 0 ? VAR.success : VAR.text }}>
                        {fmtINR(r.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t flex items-center justify-between text-[11px]" style={{ borderColor: VAR.border }}>
                  <span className="font-semibold" style={{ color: VAR.muted }}>Total (Supplier)</span>
                  <span className="font-semibold" style={{ color: VAR.text }}>{fmtINR(supplierTotal)}</span>
                </div>
              </div>

              <div className="rounded-xl border p-3" style={{ borderColor: VAR.border, background: VAR.surface2 }}>
                <div className="text-[11px] font-semibold" style={{ color: VAR.muted }}>
                  Sale Fare
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span style={{ color: VAR.subtle }}>Supplier Total</span>
                    <span style={{ fontWeight: 600, color: VAR.text }}>{fmtINR(supplierTotal)}</span>
                  </div>

                  {safeNum(pricing.markup) > 0 || mode === "AGENT" ? (
                    <div className="flex items-center justify-between text-[11px]">
                      <span style={{ color: VAR.subtle }}>{mode === "AGENT" ? "Agent Markup" : "Service Add-on"}</span>
                      <span style={{ fontWeight: 600, color: VAR.text }}>{fmtINR(safeNum(pricing.markup))}</span>
                    </div>
                  ) : null}

                  {safeNum(pricing.serviceFee) > 0 || mode === "AGENT" ? (
                    <div className="flex items-center justify-between text-[11px]">
                      <span style={{ color: VAR.subtle }}>{mode === "AGENT" ? "Service Fee" : "Convenience Fee"}</span>
                      <span style={{ fontWeight: 600, color: VAR.text }}>{fmtINR(safeNum(pricing.serviceFee))}</span>
                    </div>
                  ) : null}

                  {mode === "AGENT" && safeNum(pricing.commissionOverride) > 0 ? (
                    <div className="flex items-center justify-between text-[11px]">
                      <span style={{ color: VAR.subtle }}>Commission (Display)</span>
                      <span style={{ fontWeight: 700, color: VAR.success }}>
                        {fmtINR(safeNum(pricing.commissionOverride))}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-2 pt-2 border-t flex items-center justify-between text-[11px]" style={{ borderColor: VAR.border }}>
                  <span className="font-semibold" style={{ color: VAR.muted }}>Total Payable</span>
                  <span className="font-semibold" style={{ color: VAR.text }}>{fmtINR(customerPayable)}</span>
                </div>

                {mode === "AGENT" ? (
                  <div className="mt-2 text-[10px]" style={{ color: VAR.subtle }}>
                    Agent Net (to supplier): <span style={{ fontWeight: 600, color: VAR.text }}>{fmtINR(agentNetTotal)}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Cancellation rules */}
          <div className="px-5 py-4 border-b" style={{ borderColor: VAR.border }}>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: VAR.muted }}>
              Cancellation Charges
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border p-3" style={{ borderColor: VAR.border, background: VAR.surface2 }}>
                <div className="text-[11px] font-semibold" style={{ color: VAR.muted }}>
                  Portal / Convenience Fee
                </div>
                <div className="mt-1 text-[11px]" style={{ color: VAR.subtle }}>
                  {ticket.cancellation?.easeMyTripFeeLabel || "Convenience fee as applicable per airline and sector."}
                </div>
              </div>

              <div className="rounded-xl border p-3" style={{ borderColor: VAR.border, background: VAR.surface2 }}>
                <div className="text-[11px] font-semibold" style={{ color: VAR.muted }}>
                  Airline Fee
                </div>
                <div className="mt-2 space-y-1">
                  {(ticket.cancellation?.airlineFeeRules || []).length ? (
                    ticket.cancellation!.airlineFeeRules!.map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span style={{ color: VAR.subtle }}>{r.label}</span>
                        <span style={{ fontWeight: 600, color: VAR.text }}>{r.amount}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px]" style={{ color: VAR.subtle }}>As per airline policy.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="px-5 py-4">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: VAR.muted }}>
              Terms & Conditions
            </div>
            <ul className="mt-2 space-y-1 text-[11px] list-disc pl-4" style={{ color: VAR.subtle }}>
              {(ticket.terms || []).length ? ticket.terms!.map((t, i) => <li key={i}>{t}</li>) : <li>Standard airline and portal terms apply.</li>}
            </ul>
          </div>
        </div>

        {/* ================= Agent Control Panel ================= */}
        <div className="space-y-4">
          <div className="rounded-2xl shadow-sm p-4 border" style={{ background: VAR.surface, borderColor: VAR.border }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs" style={{ color: VAR.subtle }}>Agent Tools</div>
                <div className="text-sm font-semibold" style={{ color: VAR.text }}>Pricing & Actions</div>
              </div>

              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold border"
                style={{ background: VAR.surface2, borderColor: VAR.border, color: VAR.muted }}
              >
                <Wallet className="h-3 w-3" />
                B2B
              </span>
            </div>

            {/* Pricing editor */}
            <div className="mt-4 rounded-xl border p-3" style={{ borderColor: VAR.border, background: VAR.surface2 }}>
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold" style={{ color: VAR.muted }}>
                  Markup Management
                </div>
                <button
                  type="button"
                  onClick={() => setEditPricing((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold"
                  style={{ background: VAR.surface, borderColor: VAR.border, color: VAR.muted }}
                >
                  <Pencil className="h-3 w-3" />
                  {editPricing ? "Close" : "Edit"}
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {(
                  [
                    { key: "markup", label: "Agent Markup (₹)" },
                    { key: "serviceFee", label: "Service / Convenience Fee (₹)" },
                    { key: "commissionOverride", label: "Commission Override (Display) (₹)" },
                  ] as const
                ).map((f) => (
                  <label className="block" key={f.key}>
                    <span className="text-[10px] font-medium" style={{ color: VAR.subtle }}>
                      {f.label}
                    </span>
                    <input
                      type="number"
                      value={pricing[f.key]}
                      onChange={(e) => handlePricingChange(f.key, e.target.value)}
                      disabled={!editPricing}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-xs outline-none"
                      style={{
                        borderColor: VAR.border,
                        background: editPricing ? VAR.surface : VAR.surface2,
                        color: editPricing ? VAR.text : VAR.subtle,
                        opacity: editPricing ? 1 : 0.85,
                      }}
                    />
                  </label>
                ))}

                <label className="block">
                  <span className="text-[10px] font-medium" style={{ color: VAR.subtle }}>Internal Notes</span>
                  <textarea
                    rows={3}
                    value={pricing.notes || ""}
                    onChange={(e) => setPricing((p) => ({ ...p, notes: e.target.value }))}
                    disabled={!editPricing}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-xs outline-none"
                    style={{
                      borderColor: VAR.border,
                      background: editPricing ? VAR.surface : VAR.surface2,
                      color: editPricing ? VAR.text : VAR.subtle,
                      opacity: editPricing ? 1 : 0.85,
                    }}
                    placeholder="Optional: internal remarks for this booking"
                  />
                </label>

                {editPricing ? (
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={resetPricing}
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-semibold"
                      style={{ background: VAR.surface, borderColor: VAR.border, color: VAR.text }}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={savePricing}
                      disabled={busy === "save"}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold disabled:opacity-60"
                      style={{ background: VAR.success, color: "white" }}
                    >
                      <Save className="h-3.5 w-3.5" />
                      {busy === "save" ? "Saving..." : "Save Pricing"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Quick totals card */}
            <div className="mt-4 grid grid-cols-1 gap-2">
              <div className="rounded-xl border p-3" style={{ borderColor: VAR.border, background: VAR.surface2 }}>
                <div className="text-[10px]" style={{ color: VAR.subtle }}>Supplier Total</div>
                <div className="text-base font-semibold" style={{ color: VAR.text }}>{fmtINR(supplierTotal)}</div>
              </div>
              <div className="rounded-xl border p-3" style={{ borderColor: VAR.border, background: VAR.surface2 }}>
                <div className="text-[10px]" style={{ color: VAR.subtle }}>Customer Payable (Live)</div>
                <div className="text-base font-semibold" style={{ color: VAR.text }}>{fmtINR(customerPayable)}</div>
              </div>
            </div>
          </div>

          {/* Document / Sharing Tools */}
          <div className="rounded-2xl shadow-sm p-4 border" style={{ background: VAR.surface, borderColor: VAR.border }}>
            <div className="text-xs" style={{ color: VAR.subtle }}>Documents</div>
            <div className="text-sm font-semibold" style={{ color: VAR.text }}>Ticket & Invoice</div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={doDownload}
                disabled={!onDownloadPdf || busy === "pdf"}
                className="inline-flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium disabled:opacity-60"
                style={{ background: VAR.surface2, borderColor: VAR.border, color: VAR.text }}
              >
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Download {mode === "AGENT" ? "Agent" : "Customer"} PDF
                </span>
                <span className="text-[10px]" style={{ color: VAR.subtle }}>A4</span>
              </button>

              <button
                type="button"
                onClick={printTicket}
                className="inline-flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium"
                style={{ background: VAR.surface2, borderColor: VAR.border, color: VAR.text }}
              >
                <span className="inline-flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print Ticket
                </span>
                <span className="text-[10px]" style={{ color: VAR.subtle }}>Ctrl/Cmd + P</span>
              </button>

              <button
                type="button"
                onClick={doEmail}
                disabled={!onEmailTicket || busy === "email"}
                className="inline-flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-60"
                style={{ background: VAR.primary, color: "white" }}
              >
                <span className="inline-flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Email Ticket
                </span>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.8)" }}>Auto template</span>
              </button>
            </div>
          </div>

          {/* Safety / Audit Notes */}
          <div className="rounded-2xl shadow-sm p-4 border" style={{ background: VAR.surface, borderColor: VAR.border }}>
            <div className="text-xs" style={{ color: VAR.subtle }}>Agent Compliance</div>
            <div className="text-sm font-semibold" style={{ color: VAR.text }}>Audit Checklist</div>
            <ul className="mt-3 space-y-2 text-[11px]" style={{ color: VAR.muted }}>
              {[
                "Verify passenger names match government ID.",
                "Confirm sector and travel date before sharing customer copy.",
                "Save markup changes to keep reports accurate.",
              ].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span
                    className="mt-0.5 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold border"
                    style={{ background: VAR.successSoft, color: VAR.success, borderColor: VAR.border }}
                  >
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ================= Print Styles ================= */}
      <style>{`
        @media print {
          body { background: white !important; }
          .sticky { position: static !important; }
          /* Hide right panel + top controls while printing */
          .lg\\:grid-cols-\\[1fr_360px\\] { grid-template-columns: 1fr !important; }
          .lg\\:grid-cols-\\[1fr_360px\\] > div:last-child { display: none !important; }
          button { display: none !important; }
          a { text-decoration: none !important; }
          .shadow-sm { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
