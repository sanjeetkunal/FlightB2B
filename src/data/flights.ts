export type FareBrand = "Saver" | "Flex" | "Premium" | "Business";
export type Cabin = "Economy" | "Premium Economy" | "Business";

export type FlightFare = {
  fareId: string;
  brand: FareBrand;
  cabin: Cabin;
  rbd: string;
  baggageKg: number;
  cabinBagKg: number;
  refundable: boolean;
  changeFeeINR: number;
  meal: boolean;
  seatSelect: boolean;
  holdAllowed?: boolean;
  partialPay?: boolean;

  baseINR: number;
  taxINR: number;
  totalINR: number;
};

export type FlightRow = {
  id: string;
  airline: string;
  logo: string;
  flightNos: string;

  fromCity: string; fromIata: string;
  toCity: string;   toIata: string;
  departTime: string; departDate: string; // YYYY-MM-DD
  arriveTime: string; arriveDate: string; // YYYY-MM-DD (next-day ok)

  stops: 0 | 1 | 2;
  stopLabel: string;
  durationMin: number;

  refundable: "Refundable" | "Non-Refundable";
  extras?: string[];

  fares: FlightFare[];
};

export type SearchInput = {
  fromIata: string;
  toIata: string;
  departDate: string; // ISO or YYYY-MM-DD
  cabin?: Cabin | string;
};

export type RoundTripInput = {
  fromIata: string;
  toIata: string;
  departDate: string; // ISO or YYYY-MM-DD
  returnDate: string; // ISO or YYYY-MM-DD
  cabin?: Cabin | string;
};

export type RoundTripResult = {
  out: FlightRow[];
  ret: FlightRow[];
};

/* ========= Airline logos (vite-safe URLs) ========= */
export const LOGOS = {
  vistara:  new URL("../assets/airlines/vistara.png",  import.meta.url).href,
  airIndia: new URL("../assets/airlines/air-india.AVIF", import.meta.url).href,
  indigo:   new URL("../assets/airlines/indigo.png",    import.meta.url).href,
  spicejet: new URL("../assets/airlines/spicejet.png",  import.meta.url).href,
  akasa:    new URL("../assets/airlines/akasa.png",     import.meta.url).href,
} as const;

/* =======================================================================
   DATA
   ======================================================================= */
export const FLIGHTS: FlightRow[] = [

    /* ===== DEL → DXB — 2026-12-10 (5 flights) ===== */
  {
    id: "AI-915-INT",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 915",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Dubai", toIata: "DXB",
    departTime: "06:30", departDate: "2026-01-10",
    arriveTime: "09:00", arriveDate: "2026-01-10",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 240,
    refundable: "Refundable",
    fares: [
      {
        fareId: "AI915INT-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 25,
        cabinBagKg: 7,
        refundable: false,
        changeFeeINR: 4500,
        meal: true,
        seatSelect: false,
        baseINR: 11500,
        taxINR: 3500,
        totalINR: 15000,
      },
      {
        fareId: "AI915INT-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 30,
        cabinBagKg: 7,
        refundable: true,
        changeFeeINR: 0,
        meal: true,
        seatSelect: true,
        baseINR: 13200,
        taxINR: 3800,
        totalINR: 17000,
      },
    ],
  },
  {
    id: "6E-1451-INT",
    airline: "IndiGo",
    logo: LOGOS.indigo,
    flightNos: "6E 1451",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Dubai", toIata: "DXB",
    departTime: "09:45", departDate: "2026-01-10",
    arriveTime: "12:15", arriveDate: "2026-01-10",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 240,
    refundable: "Refundable",
    fares: [
      {
        fareId: "6E1451INT-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 20,
        cabinBagKg: 7,
        refundable: false,
        changeFeeINR: 4200,
        meal: false,
        seatSelect: false,
        baseINR: 10800,
        taxINR: 3200,
        totalINR: 14000,
      },
      {
        fareId: "6E1451INT-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 25,
        cabinBagKg: 7,
        refundable: true,
        changeFeeINR: 0,
        meal: true,
        seatSelect: true,
        baseINR: 12400,
        taxINR: 3600,
        totalINR: 16000,
      },
    ],
  },
  {
    id: "UK-201-INT",
    airline: "Vistara",
    logo: LOGOS.vistara,
    flightNos: "UK 201",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Dubai", toIata: "DXB",
    departTime: "13:10", departDate: "2026-01-10",
    arriveTime: "15:40", arriveDate: "2026-01-10",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 210,
    refundable: "Refundable",
    fares: [
      {
        fareId: "UK201INT-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 25,
        cabinBagKg: 7,
        refundable: false,
        changeFeeINR: 4500,
        meal: true,
        seatSelect: false,
        baseINR: 12500,
        taxINR: 3500,
        totalINR: 16000,
      },
      {
        fareId: "UK201INT-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "M",
        baggageKg: 30,
        cabinBagKg: 7,
        refundable: true,
        changeFeeINR: 0,
        meal: true,
        seatSelect: true,
        baseINR: 14200,
        taxINR: 3800,
        totalINR: 18000,
      },
    ],
  },
  {
    id: "AI-917-INT",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 917",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Dubai", toIata: "DXB",
    departTime: "18:20", departDate: "2026-01-10",
    arriveTime: "20:50", arriveDate: "2026-01-10",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 210,
    refundable: "Refundable",
    fares: [
      {
        fareId: "AI917INT-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 25,
        cabinBagKg: 7,
        refundable: false,
        changeFeeINR: 4500,
        meal: true,
        seatSelect: false,
        baseINR: 11800,
        taxINR: 3400,
        totalINR: 15200,
      },
      {
        fareId: "AI917INT-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 30,
        cabinBagKg: 7,
        refundable: true,
        changeFeeINR: 0,
        meal: true,
        seatSelect: true,
        baseINR: 13500,
        taxINR: 3700,
        totalINR: 17200,
      },
    ],
  },
  {
    id: "6E-1463-INT",
    airline: "IndiGo",
    logo: LOGOS.indigo,
    flightNos: "6E 1463",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Dubai", toIata: "DXB",
    departTime: "22:45", departDate: "2026-01-10",
    arriveTime: "01:15", arriveDate: "2026-01-10",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 240,
    refundable: "Refundable",
    fares: [
      {
        fareId: "6E1463INT-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 20,
        cabinBagKg: 7,
        refundable: false,
        changeFeeINR: 4200,
        meal: false,
        seatSelect: false,
        baseINR: 10200,
        taxINR: 3200,
        totalINR: 13400,
      },
      {
        fareId: "6E1463INT-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 25,
        cabinBagKg: 7,
        refundable: true,
        changeFeeINR: 0,
        meal: true,
        seatSelect: true,
        baseINR: 11800,
        taxINR: 3600,
        totalINR: 15400,
      },
    ],
  },

  /* ===== DXB → DEL — 2025-12-10 (5 flights, same date for return) ===== */
  {
    id: "AI-916-INT",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 916",
    fromCity: "Dubai", fromIata: "DXB",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "07:45", departDate: "2026-01-10",
    arriveTime: "13:15", arriveDate: "2026-01-10",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 240,
    refundable: "Refundable",
    fares: [
      {
        fareId: "AI916INT-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 25,
        cabinBagKg: 7,
        refundable: false,
        changeFeeINR: 4500,
        meal: true,
        seatSelect: false,
        baseINR: 12000,
        taxINR: 3500,
        totalINR: 15500,
      },
      {
        fareId: "AI916INT-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 30,
        cabinBagKg: 7,
        refundable: true,
        changeFeeINR: 0,
        meal: true,
        seatSelect: true,
        baseINR: 13700,
        taxINR: 3800,
        totalINR: 17500,
      },
    ],
  },
  {
    id: "6E-1452-INT",
    airline: "IndiGo",
    logo: LOGOS.indigo,
    flightNos: "6E 1452",
    fromCity: "Dubai", fromIata: "DXB",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "11:30", departDate: "2026-01-10",
    arriveTime: "17:00", arriveDate: "2026-01-10",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 240,
    refundable: "Refundable",
    fares: [
      {
        fareId: "6E1452INT-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 20,
        cabinBagKg: 7,
        refundable: false,
        changeFeeINR: 4200,
        meal: false,
        seatSelect: false,
        baseINR: 11000,
        taxINR: 3300,
        totalINR: 14300,
      },
      {
        fareId: "6E1452INT-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 25,
        cabinBagKg: 7,
        refundable: true,
        changeFeeINR: 0,
        meal: true,
        seatSelect: true,
        baseINR: 12600,
        taxINR: 3600,
        totalINR: 16200,
      },
    ],
  },
  {
    id: "UK-202-INT",
    airline: "Vistara",
    logo: LOGOS.vistara,
    flightNos: "UK 202",
    fromCity: "Dubai", fromIata: "DXB",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "15:20", departDate: "2026-01-10",
    arriveTime: "20:10", arriveDate: "2026-01-10",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 290,
    refundable: "Refundable",
    fares: [
      {
        fareId: "UK202INT-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 25,
        cabinBagKg: 7,
        refundable: false,
        changeFeeINR: 4500,
        meal: true,
        seatSelect: false,
        baseINR: 12800,
        taxINR: 3700,
        totalINR: 16500,
      },
      {
        fareId: "UK202INT-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "M",
        baggageKg: 30,
        cabinBagKg: 7,
        refundable: true,
        changeFeeINR: 0,
        meal: true,
        seatSelect: true,
        baseINR: 14500,
        taxINR: 4000,
        totalINR: 18500,
      },
    ],
  },
  {
    id: "AI-918-INT",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 918",
    fromCity: "Dubai", fromIata: "DXB",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "19:05", departDate: "2026-01-10",
    arriveTime: "00:35", arriveDate: "2026-01-10",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 240,
    refundable: "Refundable",
    fares: [
      {
        fareId: "AI918INT-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 25,
        cabinBagKg: 7,
        refundable: false,
        changeFeeINR: 4500,
        meal: true,
        seatSelect: false,
        baseINR: 11900,
        taxINR: 3400,
        totalINR: 15300,
      },
      {
        fareId: "AI918INT-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 30,
        cabinBagKg: 7,
        refundable: true,
        changeFeeINR: 0,
        meal: true,
        seatSelect: true,
        baseINR: 13600,
        taxINR: 3700,
        totalINR: 17300,
      },
    ],
  },
  {
    id: "6E-1464-INT",
    airline: "IndiGo",
    logo: LOGOS.indigo,
    flightNos: "6E 1464",
    fromCity: "Dubai", fromIata: "DXB",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "23:50", departDate: "2026-01-10",
    arriveTime: "05:20", arriveDate: "2026-01-10",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 270,
    refundable: "Refundable",
    fares: [
      {
        fareId: "6E1464INT-ECO-SAVER",
        brand: "Saver",
        cabin: "Economy",
        rbd: "V",
        baggageKg: 20,
        cabinBagKg: 7,
        refundable: false,
        changeFeeINR: 4200,
        meal: false,
        seatSelect: false,
        baseINR: 10400,
        taxINR: 3300,
        totalINR: 13700,
      },
      {
        fareId: "6E1464INT-ECO-FLEX",
        brand: "Flex",
        cabin: "Economy",
        rbd: "K",
        baggageKg: 25,
        cabinBagKg: 7,
        refundable: true,
        changeFeeINR: 0,
        meal: true,
        seatSelect: true,
        baseINR: 12000,
        taxINR: 3600,
        totalINR: 15600,
      },
    ],
  },

  /* ===== DEL → BOM — 2025-11-28 (15 flights) ===== */
  {
    id: "UK-955",
    airline: "Vistara",
    logo: LOGOS.vistara,
    flightNos: "UK 955",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "06:30", departDate: "2025-11-28",
    arriveTime: "08:50", arriveDate: "2025-11-28",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 140,
    refundable: "Refundable",
    fares: [
      { fareId: "UK955-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4800, taxINR: 1600, totalINR: 6400 },
      { fareId: "UK955-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true, seatSelect: true,  baseINR: 5200, taxINR: 1700, totalINR: 6900 }
    ]
  },
  {
    id: "AI-865",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 865",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "07:30", departDate: "2025-11-28",
    arriveTime: "09:55", arriveDate: "2025-11-28",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 145,
    refundable: "Refundable",
    fares: [
      { fareId: "AI865-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4600, taxINR: 1550, totalINR: 6150 },
      { fareId: "AI865-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true, seatSelect: true,  baseINR: 5000, taxINR: 1700, totalINR: 6700 }
    ]
  },
  {
    id: "6E-2151",
    airline: "IndiGo",
    logo: LOGOS.indigo,
    flightNos: "6E 2151",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "09:10", departDate: "2025-11-28",
    arriveTime: "11:20", arriveDate: "2025-11-28",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 130,
    refundable: "Refundable",
    fares: [
      { fareId: "6E2151-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2000, meal: false, seatSelect: false, baseINR: 4200, taxINR: 1400, totalINR: 5600 },
      { fareId: "6E2151-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4550, taxINR: 1500, totalINR: 6050 }
    ]
  },
  {
    id: "SG-819",
    airline: "SpiceJet",
    logo: LOGOS.spicejet,
    flightNos: "SG 819",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "10:20", departDate: "2025-11-28",
    arriveTime: "13:35", arriveDate: "2025-11-28",
    stops: 1, stopLabel: "1 Stop AMD",
    durationMin: 195,
    refundable: "Refundable",
    fares: [
      { fareId: "SG819-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "Q", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2000, meal: false, seatSelect: false, baseINR: 3800, taxINR: 1300, totalINR: 5100 },
      { fareId: "SG819-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4100, taxINR: 1400, totalINR: 5500 }
    ]
  },
  {
    id: "QP-1123",
    airline: "Akasa Air",
    logo: LOGOS.akasa,
    flightNos: "QP 1123",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "11:45", departDate: "2025-11-28",
    arriveTime: "14:05", arriveDate: "2025-11-28",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 140,
    refundable: "Refundable",
    fares: [
      { fareId: "QP1123-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 1800, meal: false, seatSelect: false, baseINR: 3900, taxINR: 1250, totalINR: 5150 },
      { fareId: "QP1123-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4200, taxINR: 1300, totalINR: 5500 }
    ]
  },

  {
    id: "UK-979",
    airline: "Vistara",
    logo: LOGOS.vistara,
    flightNos: "UK 979",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "14:10", departDate: "2025-11-28",
    arriveTime: "16:30", arriveDate: "2025-11-28",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 140,
    refundable: "Refundable",
    fares: [
      { fareId: "UK979-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4900, taxINR: 1650, totalINR: 6550 },
      { fareId: "UK979-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "M", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 5400, taxINR: 1700, totalINR: 7100 }
    ]
  },
  {
    id: "AI-887",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 887",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "15:00", departDate: "2025-11-28",
    arriveTime: "17:30", arriveDate: "2025-11-28",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 150,
    refundable: "Refundable",
    fares: [
      { fareId: "AI887-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4700, taxINR: 1600, totalINR: 6300 },
      { fareId: "AI887-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 5200, taxINR: 1700, totalINR: 6900 }
    ]
  },
  {
    id: "6E-2547",
    airline: "IndiGo",
    logo: LOGOS.indigo,
    flightNos: "6E 2547",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "17:20", departDate: "2025-11-28",
    arriveTime: "19:45", arriveDate: "2025-11-28",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 145,
    refundable: "Refundable",
    fares: [
      { fareId: "6E2547-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2000, meal: false, seatSelect: false, baseINR: 4400, taxINR: 1500, totalINR: 5900 },
      { fareId: "6E2547-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4800, taxINR: 1600, totalINR: 6400 }
    ]
  },
  {
    id: "SG-931",
    airline: "SpiceJet",
    logo: LOGOS.spicejet,
    flightNos: "SG 931",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "18:40", departDate: "2025-11-28",
    arriveTime: "22:10", arriveDate: "2025-11-28",
    stops: 1, stopLabel: "1 Stop HYD",
    durationMin: 210,
    refundable: "Refundable",
    fares: [
      { fareId: "SG931-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "Q", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2000, meal: false, seatSelect: false, baseINR: 3850, taxINR: 1200, totalINR: 5050 },
      { fareId: "SG931-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4250, taxINR: 1300, totalINR: 5550 }
    ]
  },
  {
    id: "QP-1421",
    airline: "Akasa Air",
    logo: LOGOS.akasa,
    flightNos: "QP 1421",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "19:30", departDate: "2025-11-28",
    arriveTime: "22:00", arriveDate: "2025-11-28",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 150,
    refundable: "Refundable",
    fares: [
      { fareId: "QP1421-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 1800, meal: false, seatSelect: false, baseINR: 4300, taxINR: 1300, totalINR: 5600 },
      { fareId: "QP1421-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4700, taxINR: 1400, totalINR: 6100 }
    ]
  },
  {
    id: "AI-805",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 805",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "20:10", departDate: "2025-11-28",
    arriveTime: "22:40", arriveDate: "2025-11-28",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 150,
    refundable: "Refundable",
    fares: [
      { fareId: "AI805-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4600, taxINR: 1500, totalINR: 6100 },
      { fareId: "AI805-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4950, taxINR: 1600, totalINR: 6550 }
    ]
  },
  {
    id: "6E-2999",
    airline: "IndiGo",
    logo: LOGOS.indigo,
    flightNos: "6E 2999",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "21:05", departDate: "2025-11-28",
    arriveTime: "23:20", arriveDate: "2025-11-28",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Refundable",
    fares: [
      { fareId: "6E2999-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2000, meal: false, seatSelect: false, baseINR: 4350, taxINR: 1450, totalINR: 5800 },
      { fareId: "6E2999-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4700, taxINR: 1550, totalINR: 6250 }
    ]
  },
  {
    id: "UK-971",
    airline: "Vistara",
    logo: LOGOS.vistara,
    flightNos: "UK 971",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "22:10", departDate: "2025-11-28",
    arriveTime: "00:30", arriveDate: "2025-11-17",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 140,
    refundable: "Refundable",
    fares: [
      { fareId: "UK971-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4550, taxINR: 1500, totalINR: 6050 },
      { fareId: "UK971-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "M", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4950, taxINR: 1600, totalINR: 6550 }
    ]
  },

  {
    id: "SG-955",
    airline: "SpiceJet",
    logo: LOGOS.spicejet,
    flightNos: "SG 955",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "05:55", departDate: "2025-11-28",
    arriveTime: "09:20", arriveDate: "2025-11-28",
    stops: 1, stopLabel: "1 Stop BLR",
    durationMin: 205,
    refundable: "Refundable",
    fares: [
      { fareId: "SG955-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "Q", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 1900, meal: false, seatSelect: false, baseINR: 3500, taxINR: 1200, totalINR: 4700 },
      { fareId: "SG955-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 3900, taxINR: 1300, totalINR: 5200 }
    ]
  },
  {
    id: "QP-1701",
    airline: "Akasa Air",
    logo: LOGOS.akasa,
    flightNos: "QP 1701",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "08:05", departDate: "2025-11-28",
    arriveTime: "10:35", arriveDate: "2025-11-28",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 150,
    refundable: "Refundable",
    fares: [
      { fareId: "QP1701-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 1800, meal: false, seatSelect: false, baseINR: 4250, taxINR: 1350, totalINR: 5600 },
      { fareId: "QP1701-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4650, taxINR: 1450, totalINR: 6100 }
    ]
  },
  {
    id: "AI-881",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 881",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "16:20", departDate: "2025-11-28",
    arriveTime: "18:55", arriveDate: "2025-11-28",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 155,
    refundable: "Refundable",
    fares: [
      { fareId: "AI881-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4750, taxINR: 1550, totalINR: 6300 },
      { fareId: "AI881-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 5200, taxINR: 1650, totalINR: 6850 }
    ]
  },

  /* ===== BOM → DEL — 2025-11-30 (15 flights) ===== */
  {
    id: "UK-946",
    airline: "Vistara",
    logo: LOGOS.vistara,
    flightNos: "UK 946",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "06:45", departDate: "2025-11-30",
    arriveTime: "09:00", arriveDate: "2025-11-30",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Refundable",
    fares: [
      { fareId: "UK946-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4700, taxINR: 1600, totalINR: 6300 },
      { fareId: "UK946-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "M", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true, seatSelect: true,  baseINR: 5100, taxINR: 1700, totalINR: 6800 }
    ]
  },
  {
    id: "AI-676",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 676",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "07:50", departDate: "2025-11-30",
    arriveTime: "10:20", arriveDate: "2025-11-30",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 150,
    refundable: "Refundable",
    fares: [
      { fareId: "AI676-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4650, taxINR: 1550, totalINR: 6200 },
      { fareId: "AI676-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true, seatSelect: true,  baseINR: 5050, taxINR: 1650, totalINR: 6700 }
    ]
  },
  {
    id: "6E-531",
    airline: "IndiGo",
    logo: LOGOS.indigo,
    flightNos: "6E 531",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "09:00", departDate: "2025-11-30",
    arriveTime: "11:10", arriveDate: "2025-11-30",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 130,
    refundable: "Refundable",
    fares: [
      { fareId: "6E531-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2000, meal: false, seatSelect: false, baseINR: 4300, taxINR: 1400, totalINR: 5700 },
      { fareId: "6E531-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4650, taxINR: 1500, totalINR: 6150 }
    ]
  },
  {
    id: "SG-802R",
    airline: "SpiceJet",
    logo: LOGOS.spicejet,
    flightNos: "SG 802",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "10:40", departDate: "2025-11-30",
    arriveTime: "13:50", arriveDate: "2025-11-30",
    stops: 1, stopLabel: "1 Stop AMD",
    durationMin: 190,
    refundable: "Refundable",
    fares: [
      { fareId: "SG802R-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "Q", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2000, meal: false, seatSelect: false, baseINR: 3700, taxINR: 1250, totalINR: 4950 },
      { fareId: "SG802R-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4050, taxINR: 1300, totalINR: 5350 }
    ]
  },
  {
    id: "QP-1124",
    airline: "Akasa Air",
    logo: LOGOS.akasa,
    flightNos: "QP 1124",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "11:55", departDate: "2025-11-30",
    arriveTime: "14:20", arriveDate: "2025-11-30",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 145,
    refundable: "Refundable",
    fares: [
      { fareId: "QP1124-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 1800, meal: false, seatSelect: false, baseINR: 3950, taxINR: 1300, totalINR: 5250 },
      { fareId: "QP1124-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4300, taxINR: 1350, totalINR: 5650 }
    ]
  },

  {
    id: "UK-980",
    airline: "Vistara",
    logo: LOGOS.vistara,
    flightNos: "UK 980",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "14:30", departDate: "2025-11-30",
    arriveTime: "16:45", arriveDate: "2025-11-30",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Refundable",
    fares: [
      { fareId: "UK980-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4850, taxINR: 1650, totalINR: 6500 },
      { fareId: "UK980-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "M", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 5250, taxINR: 1750, totalINR: 7000 }
    ]
  },
  {
    id: "AI-806",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 806",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "15:20", departDate: "2025-11-30",
    arriveTime: "17:55", arriveDate: "2025-11-30",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 155,
    refundable: "Refundable",
    fares: [
      { fareId: "AI806-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4750, taxINR: 1550, totalINR: 6300 },
      { fareId: "AI806-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 5100, taxINR: 1650, totalINR: 6750 }
    ]
  },
  {
    id: "6E-2548",
    airline: "IndiGo",
    logo: LOGOS.indigo,
    flightNos: "6E 2548",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "17:00", departDate: "2025-11-30",
    arriveTime: "19:20", arriveDate: "2025-11-30",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 140,
    refundable: "Refundable",
    fares: [
      { fareId: "6E2548-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2000, meal: false, seatSelect: false, baseINR: 4450, taxINR: 1500, totalINR: 5950 },
      { fareId: "6E2548-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4800, taxINR: 1600, totalINR: 6400 }
    ]
  },
  {
    id: "SG-932",
    airline: "SpiceJet",
    logo: LOGOS.spicejet,
    flightNos: "SG 932",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "18:20", departDate: "2025-11-30",
    arriveTime: "21:40", arriveDate: "2025-11-30",
    stops: 1, stopLabel: "1 Stop HYD",
    durationMin: 200,
    refundable: "Refundable",
    fares: [
      { fareId: "SG932-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "Q", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2000, meal: false, seatSelect: false, baseINR: 3750, taxINR: 1200, totalINR: 4950 },
      { fareId: "SG932-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4150, taxINR: 1300, totalINR: 5450 }
    ]
  },
  {
    id: "QP-1422",
    airline: "Akasa Air",
    logo: LOGOS.akasa,
    flightNos: "QP 1422",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "19:10", departDate: "2025-11-30",
    arriveTime: "21:40", arriveDate: "2025-11-30",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 150,
    refundable: "Refundable",
    fares: [
      { fareId: "QP1422-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 1800, meal: false, seatSelect: false, baseINR: 4350, taxINR: 1350, totalINR: 5700 },
      { fareId: "QP1422-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4700, taxINR: 1450, totalINR: 6150 }
    ]
  },
  {
    id: "AI-864",
    airline: "Air India",
    logo: LOGOS.airIndia,
    flightNos: "AI 864",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "20:30", departDate: "2025-11-30",
    arriveTime: "22:55", arriveDate: "2025-11-30",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 145,
    refundable: "Refundable",
    fares: [
      { fareId: "AI864-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4700, taxINR: 1550, totalINR: 6250 },
      { fareId: "AI864-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 5050, taxINR: 1650, totalINR: 6700 }
    ]
  },
  {
    id: "6E-1000",
    airline: "IndiGo",
    logo: LOGOS.indigo,
    flightNos: "6E 1000",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "21:10", departDate: "2025-11-30",
    arriveTime: "23:20", arriveDate: "2025-11-30",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 130,
    refundable: "Refundable",
    fares: [
      { fareId: "6E1000-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2000, meal: false, seatSelect: false, baseINR: 4400, taxINR: 1500, totalINR: 5900 },
      { fareId: "6E1000-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "K", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 4750, taxINR: 1550, totalINR: 6300 }
    ]
  },
  {
    id: "UK-972",
    airline: "Vistara",
    logo: LOGOS.vistara,
    flightNos: "UK 972",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "22:15", departDate: "2025-11-30",
    arriveTime: "00:25", arriveDate: "2025-11-21",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 130,
    refundable: "Refundable",
    fares: [
      { fareId: "UK972-ECO-SAVER", brand: "Saver", cabin: "Economy", rbd: "V", baggageKg: 15, cabinBagKg: 7, refundable: false, changeFeeINR: 2500, meal: true, seatSelect: false, baseINR: 4850, taxINR: 1650, totalINR: 6500 },
      { fareId: "UK972-ECO-FLEX",  brand: "Flex",  cabin: "Economy", rbd: "M", baggageKg: 20, cabinBagKg: 7, refundable: true,  changeFeeINR: 0,    meal: true,  seatSelect: true,  baseINR: 5250, taxINR: 1750, totalINR: 7000 }
    ]
  },
];

function normDate(d: string | undefined): string {
  if (!d) return "";
  // Accept ISO strings too; trim to YYYY-MM-DD
  return d.slice(0, 10);
}

function normCabin(c?: Cabin | string): Cabin | undefined {
  if (!c) return undefined;
  if (c === "Economy" || c === "Premium Economy" || c === "Business") return c;
  const key = String(c).trim().toLowerCase();
  const map: Record<string, Cabin> = {
    "economy": "Economy",
    "eco": "Economy",
    "premium economy": "Premium Economy",
    "prem eco": "Premium Economy",
    "premium": "Premium Economy",
    "business": "Business",
    "biz": "Business",
    "j": "Business",
  };
  return map[key];
}

function minFare(row: FlightRow): number {
  return Math.min(...row.fares.map((f) => f.totalINR));
}

/* ========= Core search ========= */
export function searchFlights(input: SearchInput): FlightRow[] {
  const from = input.fromIata?.toUpperCase();
  const to   = input.toIata?.toUpperCase();
  const date = normDate(input.departDate);
  const cabin = normCabin(input.cabin);

  const rows = FLIGHTS.filter(
    (f) =>
      f.fromIata === from &&
      f.toIata === to &&
      (!date || f.departDate === date)
  );

  const filtered = rows
    .map((r) => {
      if (!cabin) return r;
      const fares = r.fares.filter((f) => f.cabin === cabin);
      return { ...r, fares };
    })
    .filter((r) => r.fares.length > 0);

  return filtered.sort((a, b) => minFare(a) - minFare(b));
}

/* ========= Round-trip search ========= */
export function searchRoundTrip(input: RoundTripInput): RoundTripResult {
  const cabin = normCabin(input.cabin);

  const out = searchFlights({
    fromIata: input.fromIata,
    toIata: input.toIata,
    departDate: normDate(input.departDate),
    cabin,
  });

  const ret = searchFlights({
    fromIata: input.toIata, // reverse direction
    toIata: input.fromIata,
    departDate: normDate(input.returnDate),
    cabin,
  });

  return { out, ret };
}

/* ========= Optional: convenience getters ========= */
export function cheapestFare(row: FlightRow): FlightFare {
  return row.fares.reduce((best, f) => (f.totalINR < best.totalINR ? f : best), row.fares[0]);
}

export function hasCabin(row: FlightRow, cabin: Cabin): boolean {
  return row.fares.some((f) => f.cabin === cabin);
}

/* ========= Example usage (remove in prod) =========
console.log(
  searchRoundTrip({
    fromIata: "DEL",
    toIata: "BOM",
    departDate: "2025-11-28",
    returnDate: "2025-11-30",
    cabin: "Economy",
  })
);
*/