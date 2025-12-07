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
  Trash2,
  Wallet,
} from "lucide-react";

/**
 * B2B Ticket Copy Page
 * - Agent can view both Customer Copy and Agent Copy
 * - Agent can adjust markup / service fee / commission overlay
 * - Clean, printable layout inspired by the reference screenshot
 *
 * How to use:
 * <TicketCopyPage
 *   ticket={apiTicket}
 *   onSavePricing={async (payload) => ...}
 *   onEmailTicket={async (payload) => ...}
 *   onDownloadPdf={() => ...}
 * />
 */

/* ===================== Types ===================== */

export type Pax = {
  id: string | number;
  title?: string;
  firstName: string;
  lastName: string;
  airline?: string; // marketing carrier
  status: "CONFIRMED" | "HOLD" | "CANCELLED" | string;
  sector: string; // e.g. DEL-BLR
  airlinePnr?: string;
  ticketNumber?: string;
  paxType?: "ADT" | "CHD" | "INF" | string;
};

export type Segment = {
  id: string | number;
  airlineName: string;
  airlineCode: string;
  flightNo: string;
  from: {
    code: string;
    city: string;
    terminal?: string;
    time: string; // ISO or display string
    date: string; // ISO or display string
  };
  to: {
    code: string;
    city: string;
    terminal?: string;
    time: string;
    date: string;
  };
  durationMins?: number;
  cabin?: string;
  refundable?: "Refundable" | "Non Refundable" | string;
  baggage?: {
    checkIn?: string; // e.g. 15KG
    cabin?: string; // e.g. 7KG
  };
};

export type FareBreakup = {
  baseFare: number; // supplier base
  taxes: number;
  airlineCharges?: number;
  otherCharges?: number;
  discount?: number; // positive number
  insurance?: number;
  gst?: number;
  tds?: number;
};

export type AgentPricing = {
  markup: number; // agent sells on top of gross
  serviceFee: number; // convenience / handling
  commissionOverride: number; // optional extra commission display
  notes?: string;
};

export type TicketData = {
  brand?: {
    name: string;
    tagline?: string;
  };
  bookingId: string;
  bookingStatus: "CONFIRMED" | "HOLD" | "CANCELLED" | string;
  bookingDate: string; // display
  bookingTime: string; // display
  tripType?: "ONEWAY" | "ROUND" | "MULTI" | string;
  routeLabel: string; // e.g. Delhi - Bangalore
  segments: Segment[];
  passengers: Pax[];
  fare: FareBreakup;
  agentPricing?: Partial<AgentPricing>; // existing saved values
  cancellation?: {
    easeMyTripFeeLabel?: string;
    airlineFeeRules?: Array<{ label: string; amount: string }>;
  };
  terms?: string[];
};

export type SavePricingPayload = {
  bookingId: string;
  pricing: AgentPricing;
  computed: {
    supplierTotal: number;
    agentNetTotal: number;
    customerPayable: number;
  };
};

export type EmailTicketPayload = {
  bookingId: string;
  mode: "CUSTOMER" | "AGENT";
  toEmail?: string;
};

/* ===================== Helpers ===================== */

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));

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
      from: {
        code: "DEL",
        city: "Delhi",
        terminal: "T3",
        time: "16:05",
        date: "Thu-02May2019",
      },
      to: {
        code: "BLR",
        city: "Bangalore",
        terminal: "T1",
        time: "18:30",
        date: "Thu-02May2019",
      },
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
  agentPricing: {
    markup: 250,
    serviceFee: 0,
    commissionOverride: 0,
  },
  cancellation: {
    easeMyTripFeeLabel: "Convenience fee: ₹ 250 per pax per sector",
    airlineFeeRules: [
      { label: "Before 4 hours of departure", amount: "₹ 3,180 (per pax per sector)" },
    ],
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

  const agentNetTotal = useMemo(() => {
    // What agent pays to supplier (can later incorporate credit/commission logic)
    return supplierTotal;
  }, [supplierTotal]);

  const customerPayable = useMemo(() => {
    const m = safeNum(pricing.markup);
    const sf = safeNum(pricing.serviceFee);
    // Commission override is display-only in this UI (does not reduce payable)
    return supplierTotal + m + sf;
  }, [supplierTotal, pricing.markup, pricing.serviceFee]);

  const fareRows = useMemo(() => {
    const f = ticket.fare;
    return [
      { label: "Base Fare", amount: safeNum(f.baseFare) },
      { label: "Taxes", amount: safeNum(f.taxes) },
      ...(safeNum(f.airlineCharges)
        ? [{ label: "Airline Charges", amount: safeNum(f.airlineCharges) }]
        : []),
      ...(safeNum(f.otherCharges)
        ? [{ label: "Other Charges", amount: safeNum(f.otherCharges) }]
        : []),
      ...(safeNum(f.insurance)
        ? [{ label: "Insurance", amount: safeNum(f.insurance) }]
        : []),
      ...(safeNum(f.gst) ? [{ label: "GST", amount: safeNum(f.gst) }] : []),
      ...(safeNum(f.tds) ? [{ label: "TDS", amount: safeNum(f.tds) }] : []),
      ...(safeNum(f.discount)
        ? [{ label: "Discount", amount: -Math.abs(safeNum(f.discount)) }]
        : []),
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
        computed: {
          supplierTotal,
          agentNetTotal,
          customerPayable,
        },
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

  const printTicket = () => {
    // You can enhance this with a dedicated print stylesheet.
    window.print();
  };

  /* ===================== UI Blocks ===================== */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================= Top Bar ================= */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              title="Back"
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <div className="text-xs text-slate-500">Ticket Copy</div>
              <div className="text-sm md:text-base font-semibold text-slate-900">
                {ticket.routeLabel}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode switch */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
              {([
                { key: "CUSTOMER", label: "Customer Copy" },
                { key: "AGENT", label: "Agent Copy" },
              ] as const).map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                    mode === m.key
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={printTicket}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>

            <button
              type="button"
              onClick={doDownload}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              disabled={!onDownloadPdf || busy === "pdf"}
            >
              <Download className="h-4 w-4" />
              {busy === "pdf" ? "Preparing..." : "Download PDF"}
            </button>

            <button
              type="button"
              onClick={doEmail}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
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
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header strip */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Brand */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {brandName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 3)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">
                    {brandName}
                  </div>
                  <div className="text-xs text-slate-500">{brandTagline}</div>
                </div>
              </div>

              {/* Status & meta */}
              <div className="flex flex-col sm:items-end gap-2">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${
                    ticket.bookingStatus === "CONFIRMED"
                      ? "bg-emerald-50 text-emerald-700"
                      : ticket.bookingStatus === "HOLD"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {ticket.bookingStatus === "CONFIRMED"
                    ? "Booking Confirmed"
                    : ticket.bookingStatus}
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Booking Date: <span className="font-medium">{ticket.bookingDate}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Time: <span className="font-medium">{ticket.bookingTime}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Greeting */}
            <div className="mt-4 text-sm text-slate-700">
              <span className="font-medium">Hi,</span>
              <div className="mt-1 text-[13px] text-slate-600">
                Your flight ticket for <span className="font-semibold">{ticket.routeLabel}</span> is
                <span className="font-semibold"> {ticket.bookingStatus.toLowerCase()}</span>.
                {" "}
                Please use this copy for communication with your customer or back-office.
              </div>
              <div className="mt-2 text-[12px] text-slate-600">
                Your Booking ID is <span className="font-semibold text-slate-900">{ticket.bookingId}</span>
              </div>
            </div>
          </div>

          {/* Segment summary */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="space-y-3">
              {ticket.segments.map((s, idx) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/40 p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800">
                        {s.airlineCode}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {s.airlineName}
                          <span className="text-slate-400 font-normal"> · </span>
                          <span className="text-slate-700">{s.airlineCode} {s.flightNo}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ticket.tripType || "Trip"} · {s.cabin || "Cabin"}
                          {s.refundable ? ` · ${s.refundable}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      {s.durationMins ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-1">
                          <Clock className="h-3 w-3" />
                          {toMinsLabel(s.durationMins)}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-1">
                        <ShieldCheck className="h-3 w-3" />
                        {ticket.bookingStatus}
                      </span>
                      {idx === 0 && ticket.segments.length > 1 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-1">
                          <Tag className="h-3 w-3" />
                          Segment {idx + 1}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_120px_1fr] items-center gap-3">
                    <div className="rounded-lg bg-white border border-slate-200 p-3">
                      <div className="text-[10px] text-slate-500">Departure</div>
                      <div className="mt-0.5 text-sm font-semibold text-slate-900">
                        {s.from.city} <span className="text-slate-400">({s.from.code})</span>
                      </div>
                      <div className="text-[12px] text-slate-700 font-medium">{s.from.time}</div>
                      <div className="text-[10px] text-slate-500">{s.from.date}{s.from.terminal ? ` · ${s.from.terminal}` : ""}</div>
                    </div>

                    <div className="hidden md:flex flex-col items-center justify-center">
                      <div className="h-[2px] w-full bg-slate-200" />
                      <div className="-mt-2 rounded-full bg-white px-2 text-[10px] text-slate-500">
                        Non-stop
                      </div>
                    </div>

                    <div className="rounded-lg bg-white border border-slate-200 p-3">
                      <div className="text-[10px] text-slate-500">Arrival</div>
                      <div className="mt-0.5 text-sm font-semibold text-slate-900">
                        {s.to.city} <span className="text-slate-400">({s.to.code})</span>
                      </div>
                      <div className="text-[12px] text-slate-700 font-medium">{s.to.time}</div>
                      <div className="text-[10px] text-slate-500">{s.to.date}{s.to.terminal ? ` · ${s.to.terminal}` : ""}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Passengers table */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Passengers
              </div>
              <div className="text-[11px] text-slate-500">
                {ticket.passengers.length} passenger{ticket.passengers.length > 1 ? "s" : ""}
              </div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-[11px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="text-left font-semibold px-3 py-2 rounded-l-lg">Passenger</th>
                    <th className="text-left font-semibold px-3 py-2">Airline</th>
                    <th className="text-left font-semibold px-3 py-2">Status</th>
                    <th className="text-left font-semibold px-3 py-2">Sector</th>
                    <th className="text-left font-semibold px-3 py-2">Airline PNR</th>
                    <th className="text-left font-semibold px-3 py-2 rounded-r-lg">Ticket Number</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.passengers.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">
                          {(p.title ? p.title + " " : "") + p.firstName + " " + p.lastName}
                        </div>
                        <div className="text-[10px] text-slate-500">{p.paxType || "ADT"}</div>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{p.airline || "-"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${
                            String(p.status).toUpperCase().includes("CONF")
                              ? "bg-emerald-50 text-emerald-700"
                              : String(p.status).toUpperCase().includes("HOLD")
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{p.sector}</td>
                      <td className="px-3 py-2 text-slate-700">{p.airlinePnr || "-"}</td>
                      <td className="px-3 py-2 text-slate-700">{p.ticketNumber || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Baggage */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Baggage Info
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-[11px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="text-left font-semibold px-3 py-2 rounded-l-lg">Airline</th>
                    <th className="text-left font-semibold px-3 py-2">Sector</th>
                    <th className="text-left font-semibold px-3 py-2">Check-in</th>
                    <th className="text-left font-semibold px-3 py-2 rounded-r-lg">Cabin</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.segments.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 py-2 text-slate-700">
                        {s.airlineCode}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {s.from.code}-{s.to.code}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {s.baggage?.checkIn || "As per airline"}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {s.baggage?.cabin || "As per airline"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fare Details */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Fare Details
              </div>
              <div className="text-[10px] text-slate-500">
                {mode === "AGENT" ? "Agent view includes internal pricing" : "Customer view"}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
                <div className="text-[11px] font-semibold text-slate-700">Supplier Fare (Gross)</div>
                <div className="mt-2 space-y-1">
                  {fareRows.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">{r.label}</span>
                      <span className={`font-medium ${r.amount < 0 ? "text-emerald-700" : "text-slate-900"}`}>
                        {fmtINR(r.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">Total (Supplier)</span>
                  <span className="font-semibold text-slate-900">{fmtINR(supplierTotal)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
                <div className="text-[11px] font-semibold text-slate-700">Sale Fare</div>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Supplier Total</span>
                    <span className="font-medium text-slate-900">{fmtINR(supplierTotal)}</span>
                  </div>

                  {/* Customer view only shows final add-ons without internal labels */}
                  {safeNum(pricing.markup) > 0 || mode === "AGENT" ? (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">{mode === "AGENT" ? "Agent Markup" : "Service Add-on"}</span>
                      <span className="font-medium text-slate-900">{fmtINR(safeNum(pricing.markup))}</span>
                    </div>
                  ) : null}

                  {safeNum(pricing.serviceFee) > 0 || mode === "AGENT" ? (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">{mode === "AGENT" ? "Service Fee" : "Convenience Fee"}</span>
                      <span className="font-medium text-slate-900">{fmtINR(safeNum(pricing.serviceFee))}</span>
                    </div>
                  ) : null}

                  {mode === "AGENT" && safeNum(pricing.commissionOverride) > 0 ? (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">Commission (Display)</span>
                      <span className="font-medium text-emerald-700">{fmtINR(safeNum(pricing.commissionOverride))}</span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">Total Payable</span>
                  <span className="font-semibold text-slate-900">{fmtINR(customerPayable)}</span>
                </div>

                {mode === "AGENT" ? (
                  <div className="mt-2 text-[10px] text-slate-500">
                    Agent Net (to supplier): <span className="font-medium">{fmtINR(agentNetTotal)}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Cancellation rules */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Cancellation Charges
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
                <div className="text-[11px] font-semibold text-slate-700">
                  Portal / Convenience Fee
                </div>
                <div className="mt-1 text-[11px] text-slate-600">
                  {ticket.cancellation?.easeMyTripFeeLabel ||
                    "Convenience fee as applicable per airline and sector."}
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
                <div className="text-[11px] font-semibold text-slate-700">Airline Fee</div>
                <div className="mt-2 space-y-1">
                  {(ticket.cancellation?.airlineFeeRules || []).length ? (
                    ticket.cancellation!.airlineFeeRules!.map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600">{r.label}</span>
                        <span className="font-medium text-slate-900">{r.amount}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-500">As per airline policy.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="px-5 py-4">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Terms & Conditions
            </div>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-600 list-disc pl-4">
              {(ticket.terms || []).length ? (
                ticket.terms!.map((t, i) => <li key={i}>{t}</li>)
              ) : (
                <li>Standard airline and portal terms apply.</li>
              )}
            </ul>
          </div>
        </div>

        {/* ================= Agent Control Panel ================= */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Agent Tools</div>
                <div className="text-sm font-semibold text-slate-900">Pricing & Actions</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                <Wallet className="h-3 w-3" />
                B2B
              </span>
            </div>

            {/* Pricing editor */}
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/40 p-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-slate-700">Markup Management</div>
                <button
                  type="button"
                  onClick={() => setEditPricing((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <Pencil className="h-3 w-3" />
                  {editPricing ? "Close" : "Edit"}
                </button>
              </div>

              <div className="mt-3 space-y-2">
                <label className="block">
                  <span className="text-[10px] font-medium text-slate-500">Agent Markup (₹)</span>
                  <input
                    type="number"
                    value={pricing.markup}
                    onChange={(e) => handlePricingChange("markup", e.target.value)}
                    disabled={!editPricing}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs outline-none ${
                      editPricing
                        ? "border-slate-200 bg-white focus:border-slate-400"
                        : "border-slate-100 bg-slate-100 text-slate-500"
                    }`}
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-medium text-slate-500">Service / Convenience Fee (₹)</span>
                  <input
                    type="number"
                    value={pricing.serviceFee}
                    onChange={(e) => handlePricingChange("serviceFee", e.target.value)}
                    disabled={!editPricing}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs outline-none ${
                      editPricing
                        ? "border-slate-200 bg-white focus:border-slate-400"
                        : "border-slate-100 bg-slate-100 text-slate-500"
                    }`}
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-medium text-slate-500">Commission Override (Display) (₹)</span>
                  <input
                    type="number"
                    value={pricing.commissionOverride}
                    onChange={(e) => handlePricingChange("commissionOverride", e.target.value)}
                    disabled={!editPricing}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs outline-none ${
                      editPricing
                        ? "border-slate-200 bg-white focus:border-slate-400"
                        : "border-slate-100 bg-slate-100 text-slate-500"
                    }`}
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-medium text-slate-500">Internal Notes</span>
                  <textarea
                    rows={3}
                    value={pricing.notes || ""}
                    onChange={(e) => setPricing((p) => ({ ...p, notes: e.target.value }))}
                    disabled={!editPricing}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs outline-none ${
                      editPricing
                        ? "border-slate-200 bg-white focus:border-slate-400"
                        : "border-slate-100 bg-slate-100 text-slate-500"
                    }`}
                    placeholder="Optional: internal remarks for this booking"
                  />
                </label>

                {editPricing ? (
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={resetPricing}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={savePricing}
                      disabled={busy === "save"}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
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
              <div className="rounded-xl border border-slate-100 p-3">
                <div className="text-[10px] text-slate-500">Supplier Total</div>
                <div className="text-base font-semibold text-slate-900">{fmtINR(supplierTotal)}</div>
              </div>
              <div className="rounded-xl border border-slate-100 p-3">
                <div className="text-[10px] text-slate-500">Customer Payable (Live)</div>
                <div className="text-base font-semibold text-slate-900">{fmtINR(customerPayable)}</div>
              </div>
            </div>
          </div>

          {/* Document / Sharing Tools */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <div className="text-xs text-slate-500">Documents</div>
            <div className="text-sm font-semibold text-slate-900">Ticket & Invoice</div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={doDownload}
                disabled={!onDownloadPdf || busy === "pdf"}
                className="inline-flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Download {mode === "AGENT" ? "Agent" : "Customer"} PDF
                </span>
                <span className="text-[10px] text-slate-400">A4</span>
              </button>

              <button
                type="button"
                onClick={printTicket}
                className="inline-flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print Ticket
                </span>
                <span className="text-[10px] text-slate-400">Ctrl/Cmd + P</span>
              </button>

              <button
                type="button"
                onClick={doEmail}
                disabled={!onEmailTicket || busy === "email"}
                className="inline-flex items-center justify-between rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Email Ticket
                </span>
                <span className="text-[10px] text-white/80">Auto template</span>
              </button>
            </div>
          </div>

          {/* Safety / Audit Notes */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <div className="text-xs text-slate-500">Agent Compliance</div>
            <div className="text-sm font-semibold text-slate-900">Audit Checklist</div>
            <ul className="mt-3 space-y-2 text-[11px] text-slate-600">
              <li className="flex gap-2">
                <span className="mt-0.5 h-4 w-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                Verify passenger names match government ID.
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 h-4 w-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                Confirm sector and travel date before sharing customer copy.
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 h-4 w-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                Save markup changes to keep reports accurate.
              </li>
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
