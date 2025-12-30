/* =========================================================
   TYPES
========================================================= */

export type FareBrand = "Saver" | "Regular" | "Flex" | "Premium" | "Business";
export type Cabin = "Economy" | "Premium Economy" | "Business";

export type FlightFare = {
  fareId: string;

  brand: FareBrand;
  cabin: Cabin;
  rbd: string;

  baggageKg: number;
  cabinBagKg: number;
  meal: boolean;
  seatSelect: boolean;

  refundable: boolean;
  changeFeeINR: number;
  cancelFeeINR?: number;

  holdAllowed?: boolean;
  partialPay?: boolean;

  baseINR: number;
  taxINR: number;
  totalINR: number;

  agentNetINR?: number;
  agentCommissionINR?: number;
  markupAllowed?: boolean;

  priorityCheckIn?: boolean;
  priorityBoarding?: boolean;
};

export type FlightSegment = {
  airline: string;
  flightNo: string;

  fromCity: string;
  fromIata: string;
  departTime: string;
  departDate: string; // YYYY-MM-DD

  toCity: string;
  toIata: string;
  arriveTime: string;
  arriveDate: string; // YYYY-MM-DD

  durationMin: number;

  fromTerminal?: string;
  toTerminal?: string;
};

/** ✅ RICH layover info (arrival/departure + duration + label) */
export type Layover = {
  atIata: string;
  atCity: string;

  arriveTime: string;
  arriveDate: string;

  departTime: string;
  departDate: string;

  durationMin: number;
  label: string; // e.g. "1h 35m"
};

export type Stops = 0 | 1 | 2;

export type FlightRow = {
  id: string;

  airline: string;
  logo: string;
  flightNos: string;

  fromCity: string;
  fromIata: string;
  toCity: string;
  toIata: string;

  departTime: string;
  departDate: string;
  arriveTime: string;
  arriveDate: string;

  stops: Stops;
  stopLabel: string;
  durationMin: number;

  refundable: "Refundable" | "Non-Refundable";
  extras?: string[];

  segments: FlightSegment[];
  layovers?: Layover[];
  totalLayoverMin?: number;

  fares: FlightFare[];
};

export type SearchInput = {
  fromIata: string;
  toIata: string;
  departDate: string;
  cabin?: Cabin | string;
};

export type RoundTripInput = {
  fromIata: string;
  toIata: string;
  departDate: string;
  returnDate: string;
  cabin?: Cabin | string;
};

export type RoundTripResult = { out: FlightRow[]; ret: FlightRow[] };

/* ================= UI TYPES (MATCH your OnewayResultList) ================= */

export type FareOption = {
  code: string;
  label: string;
  price: number; // INR
  refundable: "Refundable" | "Non-Refundable";
  cabin?: string;
  meal?: string;
  badge?: { text: string; tone?: "offer" | "published" };
  refNo?: number;
  baggage?: { handKg?: number; checkKg?: number };
  seat?: string;

  commissionINR?: number;
  agentFareINR?: number;

  perks?: string[];
};

export type Segment = {
  fromCity: string;
  fromIata: string;
  departTime: string;
  departDate: string;

  toCity: string;
  toIata: string;
  arriveTime: string;
  arriveDate: string;

  carrier: string;
  flightNo: string;
  durationMin: number;

  layoverAt?: string; // IATA only (UI uses atCity separately)
  layoverMin?: number;

  fromTerminal?: string;
  toTerminal?: string;

  aircraft?: string;
  layout?: string;
  beverage?: boolean;
  seatType?: string;
  legroomInch?: number;
};

export type PolicyRule = { when: string; feeUSD: number; note?: string };

export type Row = {
  id: string;
  airline: string;
  logo: string;
  flightNos: string;

  fromCity: string;
  fromIata: string;
  departTime: string;
  departDate: string;

  toCity: string;
  toIata: string;
  arriveTime: string;
  arriveDate: string;

  stops: number;
  stopLabel: string;
  durationMin: number;

  totalFareINR: number;

  commissionUSD: number; // treat as INR for UI
  agentFareUSD: number; // treat as INR for UI

  refundable: "Refundable" | "Non-Refundable";
  extras?: string[];

  segments: Segment[];

  baggage: { handKg?: number; checkKg?: number; piece?: string };

  cancellation: {
    refund: PolicyRule[];
    change: PolicyRule[];
    noShowUSD?: number;
  };

  fares: FareOption[];
};

/* =========================================================
   AIRLINE LOGOS
========================================================= */

export const LOGOS = {
  vistara: new URL("../assets/airlines/vistara.png", import.meta.url).href,
  airIndia: new URL("../assets/airlines/air-india.AVIF", import.meta.url).href,
  indigo: new URL("../assets/airlines/indigo.png", import.meta.url).href,
  spicejet: new URL("../assets/airlines/spicejet.png", import.meta.url).href,
  akasa: new URL("../assets/airlines/akasa.png", import.meta.url).href,
} as const;

/* =========================================================
   HELPERS (NO LIBS)
========================================================= */

function normDate(d?: string): string {
  return d ? d.slice(0, 10) : "";
}

function normCabin(c?: Cabin | string): Cabin | undefined {
  if (!c) return undefined;
  if (c === "Economy" || c === "Premium Economy" || c === "Business") return c;

  const map: Record<string, Cabin> = {
    economy: "Economy",
    eco: "Economy",
    "premium economy": "Premium Economy",
    premium: "Premium Economy",
    business: "Business",
    biz: "Business",
  };
  return map[String(c).toLowerCase().trim()];
}

/** Use UTC date math so durations/layovers never go negative due to local timezone */
function toUtcMs(dateYYYYMMDD: string, hhmm: string): number {
  const [y, m, d] = (dateYYYYMMDD || "").split("-").map((x) => Number(x));
  const [hh, mm] = (hhmm || "").split(":").map((x) => Number(x));
  const yy = Number.isFinite(y) ? y : 1970;
  const mo = Number.isFinite(m) ? m - 1 : 0;
  const dd = Number.isFinite(d) ? d : 1;
  const h = Number.isFinite(hh) ? hh : 0;
  const mi = Number.isFinite(mm) ? mm : 0;
  return Date.UTC(yy, mo, dd, h, mi, 0, 0);
}

function diffMin(aDate: string, aTime: string, bDate: string, bTime: string): number {
  const ms = toUtcMs(bDate, bTime) - toUtcMs(aDate, aTime);
  return Math.max(0, Math.round(ms / 60000));
}

function fmtMin(min: number): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h <= 0) return `${mm}m`;
  if (mm <= 0) return `${h}h`;
  return `${h}h ${mm}m`;
}

function asStops(n: number): Stops {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return 2;
}

function stopLabelFromStops(stops: Stops): string {
  if (stops === 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return "2 stops";
}

function buildLayovers(segments: FlightSegment[]): Layover[] {
  const out: Layover[] = [];
  for (let i = 0; i < segments.length - 1; i++) {
    const s1 = segments[i];
    const s2 = segments[i + 1];
    const d = diffMin(s1.arriveDate, s1.arriveTime, s2.departDate, s2.departTime);

    out.push({
      atIata: s1.toIata,
      atCity: s1.toCity,

      arriveTime: s1.arriveTime,
      arriveDate: s1.arriveDate,

      departTime: s2.departTime,
      departDate: s2.departDate,

      durationMin: d,
      label: fmtMin(d),
    });
  }
  return out;
}

function minFareTotal(row: FlightRow): number {
  return Math.min(...row.fares.map((f) => f.totalINR));
}

function journeyDurationMin(segs: FlightSegment[]): number {
  if (!segs?.length) return 0;
  const first = segs[0];
  const last = segs[segs.length - 1];
  return diffMin(first.departDate, first.departTime, last.arriveDate, last.arriveTime);
}

function defaultFlightNosFromSegments(segs: FlightSegment[]): string {
  return segs.map((s) => s.flightNo).join(" • ");
}

/** ✅ Single source of truth: keep stops/label/layovers/duration/headers consistent */
function normalizeRow(raw: FlightRow): FlightRow {
  const segments = raw.segments ?? [];
  const stops = asStops(segments.length >= 3 ? 2 : segments.length === 2 ? 1 : 0);
  const stopLabel = stopLabelFromStops(stops);

  const layovers = segments.length > 1 ? buildLayovers(segments) : [];
  const totalLayoverMin = layovers.reduce((sum, x) => sum + (x.durationMin || 0), 0);

  const durationMin = segments.length ? journeyDurationMin(segments) : raw.durationMin ?? 0;

  const first = segments[0];
  const last = segments[segments.length - 1];

  const departDate = first?.departDate ?? raw.departDate;
  const departTime = first?.departTime ?? raw.departTime;
  const arriveDate = last?.arriveDate ?? raw.arriveDate;
  const arriveTime = last?.arriveTime ?? raw.arriveTime;

  const fromIata = first?.fromIata ?? raw.fromIata;
  const fromCity = first?.fromCity ?? raw.fromCity;
  const toIata = last?.toIata ?? raw.toIata;
  const toCity = last?.toCity ?? raw.toCity;

  const flightNos = raw.flightNos?.trim() ? raw.flightNos : defaultFlightNosFromSegments(segments);

  // keep row.refundable consistent: if any fare is refundable -> show "Refundable", else "Non-Refundable"
  const anyRefundable = (raw.fares ?? []).some((f) => !!f.refundable);
  const refundable: FlightRow["refundable"] = anyRefundable ? "Refundable" : "Non-Refundable";

  return {
    ...raw,
    segments,
    stops,
    stopLabel,
    layovers,
    totalLayoverMin,
    durationMin,
    departDate,
    departTime,
    arriveDate,
    arriveTime,
    fromIata,
    fromCity,
    toIata,
    toCity,
    flightNos,
    refundable,
  };
}

/* =========================================================
   DATA
   (Same as your list — no need to manually add layovers now.
    normalizeRow() computes layovers from segments.)
========================================================= */

export const FLIGHTS = [
  /* ================== DOM: DEL -> BOM (10 Jan 2026) ================== */
  {
    id: "UK-943-DOM",
    airline: "Vistara",
    logo: LOGOS.vistara,
    flightNos: "UK 943",
    fromCity: "New Delhi",
    fromIata: "DEL",
    toCity: "Mumbai",
    toIata: "BOM",
    departTime: "07:40",
    departDate: "2026-01-10",
    arriveTime: "09:55",
    arriveDate: "2026-01-10",
    stops: 0,
    stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Non-Refundable",
    extras: ["B2B", "GST Invoice", "Priority Support"],
    segments: [
      {
        airline: "Vistara",
        flightNo: "UK 943",
        fromCity: "New Delhi",
        fromIata: "DEL",
        departTime: "07:40",
        departDate: "2026-01-10",
        toCity: "Mumbai",
        toIata: "BOM",
        arriveTime: "09:55",
        arriveDate: "2026-01-10",
        durationMin: 135,
      },
    ],
    fares: [
      {
        fareId: "UK943-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "T",
        baggageKg: 15,
        cabinBagKg: 7,
        meal: true,
        seatSelect: false,
        refundable: false,
        changeFeeINR: 2800,
        cancelFeeINR: 4200,
        holdAllowed: false,
        partialPay: false,
        baseINR: 6400,
        taxINR: 1500,
        totalINR: 7900,
        agentNetINR: 7400,
        agentCommissionINR: 500,
        markupAllowed: true,
      },
      {
        fareId: "UK943-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 25,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 0,
        holdAllowed: true,
        partialPay: true,
        baseINR: 7600,
        taxINR: 1700,
        totalINR: 9300,
        agentNetINR: 8650,
        agentCommissionINR: 650,
        markupAllowed: true,
      },
    ],
  },

  {
    id: "SG-8712-DOM",
    airline: "SpiceJet",
    logo: LOGOS.spicejet,
    flightNos: "SG 8712",
    fromCity: "New Delhi",
    fromIata: "DEL",
    toCity: "Mumbai",
    toIata: "BOM",
    departTime: "13:20",
    departDate: "2026-01-10",
    arriveTime: "15:35",
    arriveDate: "2026-01-10",
    stops: 0,
    stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Non-Refundable",
    extras: ["B2B", "Free Web Check-in"],
    segments: [
      {
        airline: "SpiceJet",
        flightNo: "SG 8712",
        fromCity: "New Delhi",
        fromIata: "DEL",
        departTime: "13:20",
        departDate: "2026-01-10",
        toCity: "Mumbai",
        toIata: "BOM",
        arriveTime: "15:35",
        arriveDate: "2026-01-10",
        durationMin: 135,
      },
    ],
    fares: [
      {
        fareId: "SG8712-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "U",
        baggageKg: 15,
        cabinBagKg: 7,
        meal: false,
        seatSelect: false,
        refundable: false,
        changeFeeINR: 2999,
        cancelFeeINR: 3999,
        baseINR: 5200,
        taxINR: 1300,
        totalINR: 6500,
        agentNetINR: 6100,
        agentCommissionINR: 400,
        markupAllowed: true,
      },
      {
        fareId: "SG8712-ECO-REGULAR",
        brand: "Regular",
        cabin: "Economy",
        rbd: "S",
        baggageKg: 20,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: false,
        changeFeeINR: 1999,
        cancelFeeINR: 3499,
        baseINR: 5800,
        taxINR: 1400,
        totalINR: 7200,
        agentNetINR: 6750,
        agentCommissionINR: 450,
        markupAllowed: true,
      },
    ],
  },

  {
    id: "QP-1121-DOM",
    airline: "Akasa Air",
    logo: LOGOS.akasa,
    flightNos: "QP 1121",
    fromCity: "New Delhi",
    fromIata: "DEL",
    toCity: "Mumbai",
    toIata: "BOM",
    departTime: "18:10",
    departDate: "2026-01-10",
    arriveTime: "20:25",
    arriveDate: "2026-01-10",
    stops: 0,
    stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Non-Refundable",
    extras: ["B2B", "Low Cost"],
    segments: [
      {
        airline: "Akasa Air",
        flightNo: "QP 1121",
        fromCity: "New Delhi",
        fromIata: "DEL",
        departTime: "18:10",
        departDate: "2026-01-10",
        toCity: "Mumbai",
        toIata: "BOM",
        arriveTime: "20:25",
        arriveDate: "2026-01-10",
        durationMin: 135,
      },
    ],
    fares: [
      {
        fareId: "QP1121-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 15,
        cabinBagKg: 7,
        meal: false,
        seatSelect: false,
        refundable: false,
        changeFeeINR: 2799,
        cancelFeeINR: 3799,
        baseINR: 5000,
        taxINR: 1200,
        totalINR: 6200,
        agentNetINR: 5850,
        agentCommissionINR: 350,
        markupAllowed: true,
      },
      {
        fareId: "QP1121-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 20,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 999,
        baseINR: 6100,
        taxINR: 1400,
        totalINR: 7500,
        agentNetINR: 7050,
        agentCommissionINR: 450,
        markupAllowed: true,
      },
    ],
  },

  /* ================== DOM: BOM -> DEL (15 Jan 2026) ================== */
  {
    id: "6E-222-DOM",
    airline: "IndiGo",
    logo: LOGOS.indigo,
    flightNos: "6E 222",
    fromCity: "Mumbai",
    fromIata: "BOM",
    toCity: "New Delhi",
    toIata: "DEL",
    departTime: "06:10",
    departDate: "2026-01-15",
    arriveTime: "08:25",
    arriveDate: "2026-01-15",
    stops: 0,
    stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Non-Refundable",
    extras: ["B2B", "Free Web Check-in"],
    segments: [
      {
        airline: "IndiGo",
        flightNo: "6E 222",
        fromCity: "Mumbai",
        fromIata: "BOM",
        departTime: "06:10",
        departDate: "2026-01-15",
        toCity: "New Delhi",
        toIata: "DEL",
        arriveTime: "08:25",
        arriveDate: "2026-01-15",
        durationMin: 135,
      },
    ],
    fares: [
      {
        fareId: "6E222-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "T",
        baggageKg: 15,
        cabinBagKg: 7,
        meal: false,
        seatSelect: false,
        refundable: false,
        changeFeeINR: 2999,
        cancelFeeINR: 3999,
        baseINR: 5400,
        taxINR: 1300,
        totalINR: 6700,
        agentNetINR: 6300,
        agentCommissionINR: 400,
        markupAllowed: true,
      },
      {
        fareId: "6E222-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 25,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 999,
        baseINR: 6700,
        taxINR: 1600,
        totalINR: 8300,
        agentNetINR: 7750,
        agentCommissionINR: 550,
        markupAllowed: true,
      },
    ],
  },

  {
    id: "UK-944-DOM",
    airline: "Vistara",
    logo: LOGOS.vistara,
    flightNos: "UK 944",
    fromCity: "Mumbai",
    fromIata: "BOM",
    toCity: "New Delhi",
    toIata: "DEL",
    departTime: "12:45",
    departDate: "2026-01-15",
    arriveTime: "15:00",
    arriveDate: "2026-01-15",
    stops: 0,
    stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Non-Refundable",
    extras: ["B2B", "GST Invoice", "Priority Support"],
    segments: [
      {
        airline: "Vistara",
        flightNo: "UK 944",
        fromCity: "Mumbai",
        fromIata: "BOM",
        departTime: "12:45",
        departDate: "2026-01-15",
        toCity: "New Delhi",
        toIata: "DEL",
        arriveTime: "15:00",
        arriveDate: "2026-01-15",
        durationMin: 135,
      },
    ],
    fares: [
      {
        fareId: "UK944-ECO-REGULAR",
        brand: "Regular",
        cabin: "Economy",
        rbd: "Q",
        baggageKg: 20,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: false,
        changeFeeINR: 2200,
        cancelFeeINR: 3500,
        holdAllowed: true,
        partialPay: false,
        baseINR: 7000,
        taxINR: 1600,
        totalINR: 8600,
        agentNetINR: 8050,
        agentCommissionINR: 550,
        markupAllowed: true,
      },
      {
        fareId: "UK944-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 25,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 0,
        holdAllowed: true,
        partialPay: true,
        baseINR: 7800,
        taxINR: 1700,
        totalINR: 9500,
        agentNetINR: 8850,
        agentCommissionINR: 650,
        markupAllowed: true,
      },
    ],
  },

  /* ================== INTL: DXB -> DEL (15 Jan 2026) ================== */
  {
    id: "AI-916-INT",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 916",
    fromCity: "Dubai",
    fromIata: "DXB",
    toCity: "New Delhi",
    toIata: "DEL",
    departTime: "10:40",
    departDate: "2026-01-15",
    arriveTime: "15:20",
    arriveDate: "2026-01-15",
    stops: 0,
    stopLabel: "Non-stop",
    durationMin: 220,
    refundable: "Non-Refundable",
    extras: ["B2B", "Passport Required"],
    segments: [
      {
        airline: "Air India",
        flightNo: "AI 916",
        fromCity: "Dubai",
        fromIata: "DXB",
        departTime: "10:40",
        departDate: "2026-01-15",
        toCity: "New Delhi",
        toIata: "DEL",
        arriveTime: "15:20",
        arriveDate: "2026-01-15",
        durationMin: 220,
      },
    ],
    fares: [
      {
        fareId: "AI916-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 25,
        cabinBagKg: 7,
        meal: true,
        seatSelect: false,
        refundable: false,
        changeFeeINR: 4500,
        cancelFeeINR: 6500,
        holdAllowed: true,
        partialPay: false,
        baseINR: 11800,
        taxINR: 3600,
        totalINR: 15400,
        agentNetINR: 14600,
        agentCommissionINR: 800,
        markupAllowed: true,
      },
      {
        fareId: "AI916-ECO-REGULAR",
        brand: "Regular",
        cabin: "Economy",
        rbd: "Q",
        baggageKg: 30,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: false,
        changeFeeINR: 3000,
        cancelFeeINR: 5500,
        holdAllowed: true,
        partialPay: false,
        baseINR: 12800,
        taxINR: 3800,
        totalINR: 16600,
        agentNetINR: 15700,
        agentCommissionINR: 900,
        markupAllowed: true,
      },
      {
        fareId: "AI916-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 35,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 1500,
        holdAllowed: true,
        partialPay: true,
        baseINR: 13600,
        taxINR: 3900,
        totalINR: 17500,
        agentNetINR: 16200,
        agentCommissionINR: 1300,
        markupAllowed: true,
      },
      {
        fareId: "AI916-BIZ",
        brand: "Business",
        cabin: "Business",
        rbd: "C",
        baggageKg: 40,
        cabinBagKg: 12,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 0,
        holdAllowed: true,
        partialPay: true,
        baseINR: 39200,
        taxINR: 8800,
        totalINR: 48000,
        agentNetINR: 45200,
        agentCommissionINR: 2800,
        markupAllowed: true,
        priorityCheckIn: true,
        priorityBoarding: true,
      },
    ],
  },

  /* ================== INTL: DEL -> DXB (10 Jan 2026) - 1 STOP ================== */
  {
    id: "SG-089-INT",
    airline: "SpiceJet",
    logo: LOGOS.spicejet,
    flightNos: "SG 089 • SG 431",
    fromCity: "New Delhi",
    fromIata: "DEL",
    toCity: "Dubai",
    toIata: "DXB",
    departTime: "23:10",
    departDate: "2026-01-10",
    arriveTime: "05:35",
    arriveDate: "2026-01-11",
    stops: 1,
    stopLabel: "1 stop",
    durationMin: 385,
    refundable: "Non-Refundable",
    extras: ["B2B", "Passport Required"],
    segments: [
      {
        airline: "SpiceJet",
        flightNo: "SG 089",
        fromCity: "New Delhi",
        fromIata: "DEL",
        departTime: "23:10",
        departDate: "2026-01-10",
        toCity: "Mumbai",
        toIata: "BOM",
        arriveTime: "01:25",
        arriveDate: "2026-01-11",
        durationMin: 135,
      },
      {
        airline: "SpiceJet",
        flightNo: "SG 431",
        fromCity: "Mumbai",
        fromIata: "BOM",
        departTime: "03:00",
        departDate: "2026-01-11",
        toCity: "Dubai",
        toIata: "DXB",
        arriveTime: "05:35",
        arriveDate: "2026-01-11",
        durationMin: 155,
      },
    ],
    fares: [
      {
        fareId: "SG089-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "T",
        baggageKg: 25,
        cabinBagKg: 7,
        meal: false,
        seatSelect: false,
        refundable: false,
        changeFeeINR: 4999,
        cancelFeeINR: 6999,
        baseINR: 9800,
        taxINR: 3400,
        totalINR: 13200,
        agentNetINR: 12500,
        agentCommissionINR: 700,
        markupAllowed: true,
      },
      {
        fareId: "SG089-ECO-REGULAR",
        brand: "Regular",
        cabin: "Economy",
        rbd: "Q",
        baggageKg: 30,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: false,
        changeFeeINR: 3500,
        cancelFeeINR: 6000,
        baseINR: 10600,
        taxINR: 3600,
        totalINR: 14200,
        agentNetINR: 13400,
        agentCommissionINR: 800,
        markupAllowed: true,
      },
    ],
  },

  /* ================== INTL: DXB -> DEL (15 Jan 2026) - 1 STOP ================== */
  {
    id: "SG-090-INT",
    airline: "SpiceJet",
    logo: LOGOS.spicejet,
    flightNos: "SG 090 • SG 120",
    fromCity: "Dubai",
    fromIata: "DXB",
    toCity: "New Delhi",
    toIata: "DEL",
    departTime: "20:50",
    departDate: "2026-01-15",
    arriveTime: "03:25",
    arriveDate: "2026-01-16",
    stops: 1,
    stopLabel: "1 stop",
    durationMin: 395,
    refundable: "Non-Refundable",
    extras: ["B2B", "Passport Required"],
    segments: [
      {
        airline: "SpiceJet",
        flightNo: "SG 090",
        fromCity: "Dubai",
        fromIata: "DXB",
        departTime: "20:50",
        departDate: "2026-01-15",
        toCity: "Mumbai",
        toIata: "BOM",
        arriveTime: "01:10",
        arriveDate: "2026-01-16",
        durationMin: 200,
      },
      {
        airline: "SpiceJet",
        flightNo: "SG 120",
        fromCity: "Mumbai",
        fromIata: "BOM",
        departTime: "02:10",
        departDate: "2026-01-16",
        toCity: "New Delhi",
        toIata: "DEL",
        arriveTime: "03:25",
        arriveDate: "2026-01-16",
        durationMin: 75,
      },
    ],
    fares: [
      {
        fareId: "SG090-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "T",
        baggageKg: 25,
        cabinBagKg: 7,
        meal: false,
        seatSelect: false,
        refundable: false,
        changeFeeINR: 4999,
        cancelFeeINR: 6999,
        baseINR: 10000,
        taxINR: 3400,
        totalINR: 13400,
        agentNetINR: 12700,
        agentCommissionINR: 700,
        markupAllowed: true,
      },
      {
        fareId: "SG090-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 35,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 2000,
        baseINR: 11800,
        taxINR: 3800,
        totalINR: 15600,
        agentNetINR: 14500,
        agentCommissionINR: 1100,
        markupAllowed: true,
      },
    ],
  },

  /* ================== INTL: DEL -> DXB (10 Jan 2026) - 2 STOPS ================== */
  {
    id: "AI-519-2STOP-INT",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 519 • AI 867 • AI 901",
    fromCity: "New Delhi",
    fromIata: "DEL",
    toCity: "Dubai",
    toIata: "DXB",
    departTime: "04:50",
    departDate: "2026-01-10",
    arriveTime: "12:40",
    arriveDate: "2026-01-10",
    stops: 2,
    stopLabel: "2 stops",
    durationMin: 470,
    refundable: "Non-Refundable",
    extras: ["B2B", "Passport Required", "Long Layover"],
    segments: [
      {
        airline: "Air India",
        flightNo: "AI 519",
        fromCity: "New Delhi",
        fromIata: "DEL",
        departTime: "04:50",
        departDate: "2026-01-10",
        toCity: "Ahmedabad",
        toIata: "AMD",
        arriveTime: "06:20",
        arriveDate: "2026-01-10",
        durationMin: 90,
      },
      {
        airline: "Air India",
        flightNo: "AI 867",
        fromCity: "Ahmedabad",
        fromIata: "AMD",
        departTime: "07:15",
        departDate: "2026-01-10",
        toCity: "Mumbai",
        toIata: "BOM",
        arriveTime: "08:35",
        arriveDate: "2026-01-10",
        durationMin: 80,
      },
      {
        airline: "Air India",
        flightNo: "AI 901",
        fromCity: "Mumbai",
        fromIata: "BOM",
        departTime: "10:00",
        departDate: "2026-01-10",
        toCity: "Dubai",
        toIata: "DXB",
        arriveTime: "12:40",
        arriveDate: "2026-01-10",
        durationMin: 160,
      },
    ],
    fares: [
      {
        fareId: "AI519-2STOP-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "T",
        baggageKg: 25,
        cabinBagKg: 7,
        meal: true,
        seatSelect: false,
        refundable: false,
        changeFeeINR: 5200,
        cancelFeeINR: 7800,
        holdAllowed: true,
        partialPay: false,
        baseINR: 9000,
        taxINR: 3200,
        totalINR: 12200,
        agentNetINR: 11600,
        agentCommissionINR: 600,
        markupAllowed: true,
      },
      {
        fareId: "AI519-2STOP-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 30,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 2000,
        holdAllowed: true,
        partialPay: true,
        baseINR: 10400,
        taxINR: 3500,
        totalINR: 13900,
        agentNetINR: 13100,
        agentCommissionINR: 800,
        markupAllowed: true,
      },
    ],
  },

  /* ================== DOM: DEL -> BOM (10 Jan 2026) ================== */
  {
    id: "AI-865-DOM",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 865",
    fromCity: "New Delhi",
    fromIata: "DEL",
    toCity: "Mumbai",
    toIata: "BOM",
    departTime: "06:05",
    departDate: "2026-01-10",
    arriveTime: "08:20",
    arriveDate: "2026-01-10",
    stops: 0,
    stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Non-Refundable",
    extras: ["B2B", "GST Invoice"],
    segments: [
      {
        airline: "Air India",
        flightNo: "AI 865",
        fromCity: "New Delhi",
        fromIata: "DEL",
        departTime: "06:05",
        departDate: "2026-01-10",
        toCity: "Mumbai",
        toIata: "BOM",
        arriveTime: "08:20",
        arriveDate: "2026-01-10",
        durationMin: 135,
      },
    ],
    fares: [
      {
        fareId: "AI865-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 15,
        cabinBagKg: 7,
        meal: true,
        seatSelect: false,
        refundable: false,
        changeFeeINR: 3200,
        cancelFeeINR: 4200,
        holdAllowed: false,
        partialPay: false,
        baseINR: 6100,
        taxINR: 1400,
        totalINR: 7500,
        agentNetINR: 7120,
        agentCommissionINR: 380,
        markupAllowed: true,
      },
      {
        fareId: "AI865-ECO-REGULAR",
        brand: "Regular",
        cabin: "Economy",
        rbd: "Q",
        baggageKg: 20,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: false,
        changeFeeINR: 2200,
        cancelFeeINR: 3500,
        holdAllowed: true,
        partialPay: false,
        baseINR: 6700,
        taxINR: 1500,
        totalINR: 8200,
        agentNetINR: 7700,
        agentCommissionINR: 500,
        markupAllowed: true,
      },
      {
        fareId: "AI865-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 25,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 0,
        holdAllowed: true,
        partialPay: true,
        baseINR: 7400,
        taxINR: 1600,
        totalINR: 9000,
        agentNetINR: 8400,
        agentCommissionINR: 600,
        markupAllowed: true,
      },
      {
        fareId: "AI865-ECO-PREMIUM",
        brand: "Premium",
        cabin: "Economy",
        rbd: "Y",
        baggageKg: 30,
        cabinBagKg: 10,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 0,
        holdAllowed: true,
        partialPay: true,
        baseINR: 8200,
        taxINR: 1800,
        totalINR: 10000,
        agentNetINR: 9200,
        agentCommissionINR: 800,
        markupAllowed: true,
        priorityCheckIn: true,
        priorityBoarding: true,
      },
    ],
  },

  {
    id: "6E-221-DOM",
    airline: "IndiGo",
    logo: LOGOS.indigo,
    flightNos: "6E 221",
    fromCity: "New Delhi",
    fromIata: "DEL",
    toCity: "Mumbai",
    toIata: "BOM",
    departTime: "09:10",
    departDate: "2026-01-10",
    arriveTime: "11:20",
    arriveDate: "2026-01-10",
    stops: 0,
    stopLabel: "Non-stop",
    durationMin: 130,
    refundable: "Non-Refundable",
    extras: ["B2B", "Free Web Check-in"],
    segments: [
      {
        airline: "IndiGo",
        flightNo: "6E 221",
        fromCity: "New Delhi",
        fromIata: "DEL",
        departTime: "09:10",
        departDate: "2026-01-10",
        toCity: "Mumbai",
        toIata: "BOM",
        arriveTime: "11:20",
        arriveDate: "2026-01-10",
        durationMin: 130,
      },
    ],
    fares: [
      {
        fareId: "6E221-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "T",
        baggageKg: 15,
        cabinBagKg: 7,
        meal: false,
        seatSelect: false,
        refundable: false,
        changeFeeINR: 2999,
        cancelFeeINR: 3999,
        baseINR: 5600,
        taxINR: 1300,
        totalINR: 6900,
        agentNetINR: 6500,
        agentCommissionINR: 400,
        markupAllowed: true,
      },
      {
        fareId: "6E221-REGULAR",
        brand: "Regular",
        cabin: "Economy",
        rbd: "S",
        baggageKg: 20,
        cabinBagKg: 7,
        meal: true,
        seatSelect: false,
        refundable: false,
        changeFeeINR: 1999,
        cancelFeeINR: 3499,
        baseINR: 6100,
        taxINR: 1400,
        totalINR: 7500,
        agentNetINR: 7050,
        agentCommissionINR: 450,
        markupAllowed: true,
      },
      {
        fareId: "6E221-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 25,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 999,
        baseINR: 6900,
        taxINR: 1600,
        totalINR: 8500,
        agentNetINR: 7950,
        agentCommissionINR: 550,
        markupAllowed: true,
      },
      {
        fareId: "6E221-PREMIUM",
        brand: "Premium",
        cabin: "Economy",
        rbd: "Y",
        baggageKg: 30,
        cabinBagKg: 10,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 0,
        baseINR: 7800,
        taxINR: 1700,
        totalINR: 9500,
        agentNetINR: 8900,
        agentCommissionINR: 600,
        markupAllowed: true,
        priorityBoarding: true,
      },
    ],
  },

  /* ================== INTL: DEL -> DXB (10 Jan 2026) ================== */
  {
    id: "AI-915-INT",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 915",
    fromCity: "New Delhi",
    fromIata: "DEL",
    toCity: "Dubai",
    toIata: "DXB",
    departTime: "06:30",
    departDate: "2026-01-10",
    arriveTime: "09:00",
    arriveDate: "2026-01-10",
    stops: 0,
    stopLabel: "Non-stop",
    durationMin: 240,
    refundable: "Non-Refundable",
    extras: ["B2B", "Passport Required"],
    segments: [
      {
        airline: "Air India",
        flightNo: "AI 915",
        fromCity: "New Delhi",
        fromIata: "DEL",
        departTime: "06:30",
        departDate: "2026-01-10",
        toCity: "Dubai",
        toIata: "DXB",
        arriveTime: "09:00",
        arriveDate: "2026-01-10",
        durationMin: 240,
      },
    ],
    fares: [
      {
        fareId: "AI915-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 25,
        cabinBagKg: 7,
        meal: true,
        seatSelect: false,
        refundable: false,
        changeFeeINR: 4500,
        cancelFeeINR: 6500,
        holdAllowed: true,
        partialPay: false,
        baseINR: 11500,
        taxINR: 3500,
        totalINR: 15000,
        agentNetINR: 14200,
        agentCommissionINR: 800,
        markupAllowed: true,
      },
      {
        fareId: "AI915-ECO-REGULAR",
        brand: "Regular",
        cabin: "Economy",
        rbd: "Q",
        baggageKg: 30,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: false,
        changeFeeINR: 3000,
        cancelFeeINR: 5500,
        holdAllowed: true,
        partialPay: false,
        baseINR: 12600,
        taxINR: 3800,
        totalINR: 16400,
        agentNetINR: 15500,
        agentCommissionINR: 900,
        markupAllowed: true,
      },
      {
        fareId: "AI915-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 35,
        cabinBagKg: 7,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 1500,
        holdAllowed: true,
        partialPay: true,
        baseINR: 13200,
        taxINR: 3800,
        totalINR: 17000,
        agentNetINR: 15800,
        agentCommissionINR: 1200,
        markupAllowed: true,
      },
      {
        fareId: "AI915-BIZ",
        brand: "Business",
        cabin: "Business",
        rbd: "C",
        baggageKg: 40,
        cabinBagKg: 12,
        meal: true,
        seatSelect: true,
        refundable: true,
        changeFeeINR: 0,
        cancelFeeINR: 0,
        holdAllowed: true,
        partialPay: true,
        baseINR: 38500,
        taxINR: 8500,
        totalINR: 47000,
        agentNetINR: 44500,
        agentCommissionINR: 2500,
        markupAllowed: true,
        priorityCheckIn: true,
        priorityBoarding: true,
      },
    ],
  },
] satisfies FlightRow[];

/* =========================================================
   DOMAIN SEARCH
========================================================= */

export function searchFlights(input: SearchInput): FlightRow[] {
  const from = input.fromIata.toUpperCase();
  const to = input.toIata.toUpperCase();
  const date = normDate(input.departDate);
  const cabin = normCabin(input.cabin);

  return FLIGHTS.filter((f) => f.fromIata === from && f.toIata === to && (!date || f.departDate === date))
    .map(normalizeRow)
    .map((r) => {
      if (!cabin) return r;
      return { ...r, fares: r.fares.filter((f) => f.cabin === cabin) };
    })
    .filter((r) => r.fares.length > 0)
    .sort((a, b) => minFareTotal(a) - minFareTotal(b));
}

export function searchRoundTrip(input: RoundTripInput): RoundTripResult {
  return {
    out: searchFlights({
      fromIata: input.fromIata,
      toIata: input.toIata,
      departDate: input.departDate,
      cabin: input.cabin,
    }),
    ret: searchFlights({
      fromIata: input.toIata,
      toIata: input.fromIata,
      departDate: input.returnDate,
      cabin: input.cabin,
    }),
  };
}

export function getMinFareByDate(input: SearchInput): Map<string, number> {
  const from = input.fromIata.toUpperCase();
  const to = input.toIata.toUpperCase();
  const cabin = normCabin(input.cabin);

  const map = new Map<string, number>();

  for (const raw of FLIGHTS) {
    const row = normalizeRow(raw);
    if (row.fromIata !== from || row.toIata !== to) continue;

    const fares = cabin ? row.fares.filter((f) => f.cabin === cabin) : row.fares;
    if (!fares.length) continue;

    const rowMin = Math.min(...fares.map((f) => f.totalINR));
    const d = row.departDate;

    const prev = map.get(d);
    if (prev == null || rowMin < prev) map.set(d, rowMin);
  }

  return map;
}

/* =========================================================
   UI ADAPTERS (FIX STOP DETAILS)
========================================================= */

function fareToUi(f: FlightFare): FareOption {
  return {
    code: f.fareId,
    label: f.brand,
    price: f.totalINR,
    refundable: f.refundable ? "Refundable" : "Non-Refundable",
    cabin: f.cabin,
    meal: f.meal ? "Meal Included" : "No Meal",
    baggage: { handKg: f.cabinBagKg, checkKg: f.baggageKg },
    seat: f.seatSelect ? "Seat Included" : "Seat selection (paid)",

    agentFareINR: f.agentNetINR,
    commissionINR: f.agentCommissionINR,

    perks: [
      ...(f.priorityCheckIn ? ["Priority Check-in"] : []),
      ...(f.priorityBoarding ? ["Priority Boarding"] : []),
      ...(f.holdAllowed ? ["Hold Allowed"] : []),
      ...(f.partialPay ? ["Partial Pay"] : []),
    ],
  };
}

/** ✅ IMPORTANT:
 *  - layoverAt must be IATA only (UI uses atCity from toCity)
 *  - layoverMin computed between segment i arrival and segment i+1 departure
 */
function segmentsToUi(segs: FlightSegment[]): Segment[] {
  if (!segs?.length) return [];

  return segs.map((s, i) => {
    const next = segs[i + 1];
    const layoverMin = next
      ? diffMin(s.arriveDate, s.arriveTime, next.departDate, next.departTime)
      : undefined;

    return {
      fromCity: s.fromCity,
      fromIata: s.fromIata,
      departTime: s.departTime,
      departDate: s.departDate,

      toCity: s.toCity,
      toIata: s.toIata,
      arriveTime: s.arriveTime,
      arriveDate: s.arriveDate,

      carrier: s.airline,
      flightNo: s.flightNo,
      durationMin: s.durationMin,

      layoverAt: next ? s.toIata : undefined,
      layoverMin,

      fromTerminal: s.fromTerminal,
      toTerminal: s.toTerminal,

      // optional placeholders (your UI already expects these sometimes)
      layout: "3-3 Layout",
      beverage: true,
      seatType: "Standard Recliner",
      legroomInch: 28,
    };
  });
}

function defaultCancellation(ref: "Refundable" | "Non-Refundable"): Row["cancellation"] {
  if (ref === "Refundable") {
    return {
      refund: [
        { when: "Before 24 hrs", feeUSD: 1500 },
        { when: "Within 24 hrs", feeUSD: 2500 },
      ],
      change: [
        { when: "Before 24 hrs", feeUSD: 999, note: "Fare diff applicable" },
        { when: "Within 24 hrs", feeUSD: 1999, note: "Fare diff applicable" },
      ],
      noShowUSD: 3500,
    };
  }
  return {
    refund: [
      { when: "Before 24 hrs", feeUSD: 0, note: "Non-refundable" },
      { when: "Within 24 hrs", feeUSD: 0, note: "Non-refundable" },
    ],
    change: [{ when: "Anytime", feeUSD: 2999, note: "Fare diff applicable" }],
    noShowUSD: 4500,
  };
}

export function flightRowToUiRow(raw: FlightRow): Row {
  const row = normalizeRow(raw);
  const faresUi = row.fares.map(fareToUi);

  // min fare (safe)
  const min = faresUi.length
    ? faresUi.reduce((m, x) => (x.price < m.price ? x : m), faresUi[0])
    : null;

  const totalFareINR = min?.price ?? 0;

  // pick B2B values from min fare (fallback 0)
  const agentFareUSD = min?.agentFareINR ?? 0;
  const commissionUSD = min?.commissionINR ?? 0;

  const baggage = {
    handKg: min?.baggage?.handKg ?? row.fares[0]?.cabinBagKg ?? 7,
    checkKg: min?.baggage?.checkKg ?? row.fares[0]?.baggageKg ?? 15,
    piece: "1 piece only",
  };

  return {
    id: row.id,
    airline: row.airline,
    logo: row.logo,
    flightNos: row.flightNos,

    fromCity: row.fromCity,
    fromIata: row.fromIata,
    departTime: row.departTime,
    departDate: row.departDate,

    toCity: row.toCity,
    toIata: row.toIata,
    arriveTime: row.arriveTime,
    arriveDate: row.arriveDate,

    stops: row.stops,
    stopLabel: row.stopLabel,
    durationMin: row.durationMin,

    totalFareINR,

    commissionUSD,
    agentFareUSD,

    refundable: row.refundable,
    extras: row.extras,

    segments: segmentsToUi(row.segments),

    baggage,

    cancellation: defaultCancellation(row.refundable),

    fares: faresUi,
  };
}

/** ✅ USE THIS in OneWay UI */
export function searchUiRows(input: SearchInput): Row[] {
  return searchFlights(input).map(flightRowToUiRow);
}
