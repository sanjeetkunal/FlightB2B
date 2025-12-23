/* =========================================================
   B2B FLIGHT DATA + SEARCH (SINGLE FILE)  ✅ FIXED
   ========================================================= */

/* ================= TYPES ================= */

export type FareBrand = "Saver" | "Regular" | "Flex" | "Premium" | "Business";
export type Cabin = "Economy" | "Premium Economy" | "Business";

export type FlightFare = {
  fareId: string;

  /* fare identity */
  brand: FareBrand;
  cabin: Cabin;
  rbd: string;

  /* baggage & services */
  baggageKg: number;
  cabinBagKg: number;
  meal: boolean;
  seatSelect: boolean;

  /* rules */
  refundable: boolean;
  changeFeeINR: number;

  /** optional cancellation fee (some UI uses this) */
  cancelFeeINR?: number;

  /* B2B options */
  holdAllowed?: boolean;
  partialPay?: boolean;

  /* pricing */
  baseINR: number;
  taxINR: number;
  totalINR: number;

  /* B2B finance */
  agentNetINR?: number;
  agentCommissionINR?: number;
  markupAllowed?: boolean;

  /* optional perks */
  priorityCheckIn?: boolean;
  priorityBoarding?: boolean;
};

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
  departDate: string; // YYYY-MM-DD
  arriveTime: string;
  arriveDate: string; // YYYY-MM-DD

  stops: 0 | 1 | 2;
  stopLabel: string;
  durationMin: number;

  /** row-level label (UI expects string) */
  refundable: "Refundable" | "Non-Refundable";
  extras?: string[];

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

export type RoundTripResult = {
  out: FlightRow[];
  ret: FlightRow[];
};

/* ================= AIRLINE LOGOS ================= */

export const LOGOS = {
  vistara: new URL("../assets/airlines/vistara.png", import.meta.url).href,
  airIndia: new URL("../assets/airlines/air-india.AVIF", import.meta.url).href,
  indigo: new URL("../assets/airlines/indigo.png", import.meta.url).href,
  spicejet: new URL("../assets/airlines/spicejet.png", import.meta.url).href,
  akasa: new URL("../assets/airlines/akasa.png", import.meta.url).href,
} as const;

/* ================= FLIGHT DATA ================= */

export const FLIGHTS: FlightRow[] = [

    /* ================== DOM: DEL -> BOM (10 Jan 2026) - MORE OPTIONS ================== */
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

  /* ================== DOM: BOM -> DEL (15 Jan 2026) - MORE OPTIONS ================== */
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


    /* ================== INTL: DXB -> DEL (Return sample - 15 Jan 2026) ================== */
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

  /* ================== INTL: DEL -> DXB (10 Jan 2026) - ALT OPTION (1 STOP) ================== */
  {
    id: "SG-089-INT",
    airline: "SpiceJet",
    logo: LOGOS.spicejet,
    flightNos: "SG 089",
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

  /* ================== INTL: DXB -> DEL (15 Jan 2026) - ALT OPTION (1 STOP) ================== */
  {
    id: "SG-090-INT",
    airline: "SpiceJet",
    logo: LOGOS.spicejet,
    flightNos: "SG 090",
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

  /* ================== DOM: BOM -> DEL (Return sample) ================== */
  {
    id: "AI-864-DOM",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 864",
    fromCity: "Mumbai",
    fromIata: "BOM",
    toCity: "New Delhi",
    toIata: "DEL",
    departTime: "19:10",
    departDate: "2026-01-15",
    arriveTime: "21:25",
    arriveDate: "2026-01-15",
    stops: 0,
    stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Non-Refundable",
    extras: ["B2B", "GST Invoice"],
    fares: [
      {
        fareId: "AI864-ECO-SAVER",
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
        baseINR: 6200,
        taxINR: 1400,
        totalINR: 7600,
        agentNetINR: 7200,
        agentCommissionINR: 400,
        markupAllowed: true,
      },
      {
        fareId: "AI864-ECO-REGULAR",
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
        baseINR: 6800,
        taxINR: 1500,
        totalINR: 8300,
        agentNetINR: 7800,
        agentCommissionINR: 500,
        markupAllowed: true,
      },
      {
        fareId: "AI864-ECO-FLEX",
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
        baseINR: 7500,
        taxINR: 1600,
        totalINR: 9100,
        agentNetINR: 8500,
        agentCommissionINR: 600,
        markupAllowed: true,
      },
      {
        fareId: "AI864-ECO-PREMIUM",
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
        baseINR: 8300,
        taxINR: 1800,
        totalINR: 10100,
        agentNetINR: 9300,
        agentCommissionINR: 800,
        markupAllowed: true,
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
];

/* ================= HELPERS ================= */

function normDate(d?: string): string {
  return d ? d.slice(0, 10) : "";
}

function normCabin(c?: Cabin | string): Cabin | undefined {
  if (!c) return undefined;
  if (c === "Economy" || c === "Premium Economy" || c === "Business") return c;

  const map: Record<string, Cabin> = {
    economy: "Economy",
    eco: "Economy",
    premium: "Premium Economy",
    "premium economy": "Premium Economy",
    business: "Business",
    biz: "Business",
  };

  return map[String(c).toLowerCase().trim()];
}

function minFare(row: FlightRow): number {
  return Math.min(...row.fares.map((f) => f.totalINR));
}

/* ================= SEARCH ================= */

export function searchFlights(input: SearchInput): FlightRow[] {
  const from = input.fromIata.toUpperCase();
  const to = input.toIata.toUpperCase();
  const date = normDate(input.departDate);
  const cabin = normCabin(input.cabin);

  return FLIGHTS.filter(
    (f) =>
      f.fromIata === from &&
      f.toIata === to &&
      (!date || f.departDate === date)
  )
    .map((r) => {
      if (!cabin) return r;
      return { ...r, fares: r.fares.filter((f) => f.cabin === cabin) };
    })
    .filter((r) => r.fares.length > 0)
    .sort((a, b) => minFare(a) - minFare(b));
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

  // route+optional cabin match karke date-wise min fare nikalo
  const map = new Map<string, number>();

  for (const row of FLIGHTS) {
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

