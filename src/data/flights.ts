// src/data/flights.ts
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
  logoBg: string;
  flightNos: string;

  fromCity: string; fromIata: string;
  toCity: string;   toIata: string;
  departTime: string; departDate: string; // ISO "YYYY-MM-DD"
  arriveTime: string; arriveDate: string; // ISO "YYYY-MM-DD" (next-day ok)

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
  departDate: string; // ISO
  cabin?: Cabin;
};

export const FLIGHTS: FlightRow[] = [
    // ===== RETURN FLIGHTS (add these at the end of FLIGHTS[]) =====

  // BOM → DEL — 2025-10-16 (Vistara) — return of DEL→BOM
  {
    id: "UK-970",
    airline: "Vistara",
    logoBg: "#5A2E8A",
    flightNos: "UK 970",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "19:05", departDate: "2025-10-16",
    arriveTime: "21:15", arriveDate: "2025-10-16",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 130,
    refundable: "Refundable",
    fares: [
      {
        fareId: "UK970-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "X",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2500,
        meal: true, seatSelect: false,
        baseINR: 4200, taxINR: 1600, totalINR: 5800
      },
      {
        fareId: "UK970-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "M",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 4700, taxINR: 1700, totalINR: 6400
      },
      {
        fareId: "UK970-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 12400, taxINR: 3200, totalINR: 15600
      }
    ]
  },

  // DXB → DEL — 2025-10-18 (Emirates) — return of DEL→DXB (EK-513)
  {
    id: "EK-510",
    airline: "Emirates",
    logoBg: "#E31E24",
    flightNos: "EK 510",
    fromCity: "Dubai", fromIata: "DXB",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "20:15", departDate: "2025-10-18",
    arriveTime: "01:00", arriveDate: "2025-10-19",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 195,
    refundable: "Refundable",
    fares: [
      {
        fareId: "EK510-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 25, cabinBagKg: 7,
        refundable: false, changeFeeINR: 3500,
        meal: true, seatSelect: false,
        baseINR: 17600, taxINR: 5700, totalINR: 23300
      },
      {
        fareId: "EK510-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 18900, taxINR: 5900, totalINR: 24800
      },
      {
        fareId: "EK510-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 52800, taxINR: 9800, totalINR: 62600
      }
    ]
  },

  // DXB → DEL — 2025-10-13 (Air India Express) — return of IX-1945
  {
    id: "IX-1946",
    airline: "Air India Express",
    logoBg: "#E11D48",
    flightNos: "IX 1946",
    fromCity: "Dubai", fromIata: "DXB",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "02:10", departDate: "2025-10-13",
    arriveTime: "07:05", arriveDate: "2025-10-13",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 205,
    refundable: "Refundable",
    fares: [
      {
        fareId: "IX1946-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "T",
        baggageKg: 20, cabinBagKg: 7,
        refundable: false, changeFeeINR: 3000,
        meal: true, seatSelect: false,
        baseINR: 15200, taxINR: 5200, totalINR: 20400
      },
      {
        fareId: "IX1946-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 25, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 16800, taxINR: 5400, totalINR: 22200
      },
      {
        fareId: "IX1946-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 41200, taxINR: 9200, totalINR: 50400
      }
    ]
  },

  // DOH → DEL — 2025-10-19 (Qatar Airways) — return of QR-579
  {
    id: "QR-578",
    airline: "Qatar Airways",
    logoBg: "#6C2C3B",
    flightNos: "QR 578",
    fromCity: "Doha", fromIata: "DOH",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "18:55", departDate: "2025-10-19",
    arriveTime: "00:05", arriveDate: "2025-10-20",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 230,
    refundable: "Refundable",
    fares: [
      {
        fareId: "QR578-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 25, cabinBagKg: 7,
        refundable: false, changeFeeINR: 3000,
        meal: true, seatSelect: false,
        baseINR: 14200, taxINR: 4900, totalINR: 19100
      },
      {
        fareId: "QR578-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 15500, taxINR: 5100, totalINR: 20600
      },
      {
        fareId: "QR578-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 46800, taxINR: 9000, totalINR: 55800
      }
    ]
  },

  // IST → DEL — 2025-10-20/21 (overnight) (Turkish) — return of TK-717
  {
    id: "TK-716",
    airline: "Turkish Airlines",
    logoBg: "#CC1E2C",
    flightNos: "TK 716",
    fromCity: "Istanbul", fromIata: "IST",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "19:20", departDate: "2025-10-20",
    arriveTime: "04:35", arriveDate: "2025-10-21",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 405,
    refundable: "Refundable",
    fares: [
      {
        fareId: "TK716-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 25, cabinBagKg: 7,
        refundable: false, changeFeeINR: 4000,
        meal: true, seatSelect: false,
        baseINR: 21200, taxINR: 6100, totalINR: 27300
      },
      {
        fareId: "TK716-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 22800, taxINR: 6400, totalINR: 29200
      },
      {
        fareId: "TK716-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 68400, taxINR: 11200, totalINR: 79600
      }
    ]
  },

  // SIN → BLR — 2025-11-20 (Singapore Airlines) — return of SQ-511
  {
    id: "SQ-510",
    airline: "Singapore Airlines",
    logoBg: "#003D7C",
    flightNos: "SQ 510",
    fromCity: "Singapore", fromIata: "SIN",
    toCity: "Bengaluru",  toIata: "BLR",
    departTime: "20:10", departDate: "2025-11-20",
    arriveTime: "22:45", arriveDate: "2025-11-20",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 305,
    refundable: "Refundable",
    fares: [
      {
        fareId: "SQ510-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 25, cabinBagKg: 7,
        refundable: false, changeFeeINR: 3500,
        meal: true, seatSelect: false,
        baseINR: 19800, taxINR: 7100, totalINR: 26900
      },
      {
        fareId: "SQ510-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 21300, taxINR: 7400, totalINR: 28700
      },
      {
        fareId: "SQ510-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 58500, taxINR: 11200, totalINR: 69700
      }
    ]
  },

  // MUC → DEL — 2025-12-12/13 (overnight) (Lufthansa) — return of LH-763
  {
    id: "LH-762",
    airline: "Lufthansa",
    logoBg: "#FFB300",
    flightNos: "LH 762",
    fromCity: "Munich", fromIata: "MUC",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "19:15", departDate: "2025-12-12",
    arriveTime: "07:20", arriveDate: "2025-12-13",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 425,
    refundable: "Refundable",
    fares: [
      {
        fareId: "LH762-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 23, cabinBagKg: 8,
        refundable: false, changeFeeINR: 4500,
        meal: true, seatSelect: false,
        baseINR: 32200, taxINR: 9900, totalINR: 42100
      },
      {
        fareId: "LH762-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 8,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 34800, taxINR: 10100, totalINR: 44900
      },
      {
        fareId: "LH762-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 12,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 93600, taxINR: 15200, totalINR: 108800
      }
    ]
  },

  // AUH → DEL — 2025-10-20 (Etihad) — return of EY-211
  {
    id: "EY-218",
    airline: "Etihad Airways",
    logoBg: "#B59B49",
    flightNos: "EY 218",
    fromCity: "Abu Dhabi", fromIata: "AUH",
    toCity: "New Delhi",  toIata: "DEL",
    departTime: "02:30", departDate: "2025-10-20",
    arriveTime: "07:35", arriveDate: "2025-10-20",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 215,
    refundable: "Refundable",
    fares: [
      {
        fareId: "EY218-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 23, cabinBagKg: 7,
        refundable: false, changeFeeINR: 3000,
        meal: true, seatSelect: false,
        baseINR: 13600, taxINR: 4800, totalINR: 18400
      },
      {
        fareId: "EY218-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 14900, taxINR: 5000, totalINR: 19900
      },
      {
        fareId: "EY218-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 46200, taxINR: 8600, totalINR: 54800
      }
    ]
  },

  // GOI → HYD — 2025-12-06 (Akasa) — return of QP-1423
  {
    id: "QP-1424",
    airline: "Akasa Air",
    logoBg: "#6B21A8",
    flightNos: "QP 1424",
    fromCity: "Goa", fromIata: "GOI",
    toCity: "Hyderabad", toIata: "HYD",
    departTime: "14:20", departDate: "2025-12-06",
    arriveTime: "15:35", arriveDate: "2025-12-06",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 75,
    refundable: "Refundable",
    fares: [
      {
        fareId: "QP1424-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2000,
        meal: false, seatSelect: false,
        baseINR: 2850, taxINR: 1000, totalINR: 3850
      },
      {
        fareId: "QP1424-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 3350, taxINR: 1100, totalINR: 4450
      }
    ]
  },

  // COK → DEL — 2025-11-12 (Air India) — return of AI-581
  {
    id: "AI-582",
    airline: "Air India",
    logoBg: "#C41E3A",
    flightNos: "AI 582",
    fromCity: "Kochi", fromIata: "COK",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "15:20", departDate: "2025-11-12",
    arriveTime: "18:10", arriveDate: "2025-11-12",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 170,
    refundable: "Refundable",
    fares: [
      {
        fareId: "AI582-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2500,
        meal: true, seatSelect: false,
        baseINR: 5250, taxINR: 1900, totalINR: 7150
      },
      {
        fareId: "AI582-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 5850, taxINR: 2000, totalINR: 7850
      },
      {
        fareId: "AI582-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 35, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 13600, taxINR: 3200, totalINR: 16800
      }
    ]
  },

  // MAA → CCU — 2025-12-24 (SpiceJet) — return of SG-325
  {
    id: "SG-326",
    airline: "SpiceJet",
    logoBg: "#F97316",
    flightNos: "SG 326",
    fromCity: "Chennai", fromIata: "MAA",
    toCity: "Kolkata", toIata: "CCU",
    departTime: "12:30", departDate: "2025-12-24",
    arriveTime: "14:45", arriveDate: "2025-12-24",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Refundable",
    fares: [
      {
        fareId: "SG326-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "Q",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2000,
        meal: false, seatSelect: false,
        baseINR: 3650, taxINR: 1300, totalINR: 4950
      },
      {
        fareId: "SG326-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 4150, taxINR: 1400, totalINR: 5550
      }
    ]
  },

  // MAA → HYD — 2025-10-21 (SpiceJet) — return of SG-472
  {
    id: "SG-473",
    airline: "SpiceJet",
    logoBg: "#F97316",
    flightNos: "SG 473",
    fromCity: "Chennai", fromIata: "MAA",
    toCity: "Hyderabad", toIata: "HYD",
    departTime: "16:30", departDate: "2025-10-21",
    arriveTime: "17:45", arriveDate: "2025-10-21",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 75,
    refundable: "Refundable",
    fares: [
      {
        fareId: "SG473-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "Q",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2000,
        meal: false, seatSelect: false,
        baseINR: 2650, taxINR: 900, totalINR: 3550
      },
      {
        fareId: "SG473-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 3150, taxINR: 950, totalINR: 4100
      }
    ]
  },

  // DXB → BOM — 2025-10-20 (Emirates) — return of EK-501
  {
    id: "EK-500",
    airline: "Emirates",
    logoBg: "#E31E24",
    flightNos: "EK 500",
    fromCity: "Dubai", fromIata: "DXB",
    toCity: "Mumbai", toIata: "BOM",
    departTime: "23:40", departDate: "2025-10-20",
    arriveTime: "04:30", arriveDate: "2025-10-21",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 200,
    refundable: "Refundable",
    fares: [
      {
        fareId: "EK500-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 25, cabinBagKg: 7,
        refundable: false, changeFeeINR: 3500,
        meal: true, seatSelect: false,
        baseINR: 17100, taxINR: 5400, totalINR: 22500
      },
      {
        fareId: "EK500-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 18400, taxINR: 5600, totalINR: 24000
      },
      {
        fareId: "EK500-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 52200, taxINR: 9600, totalINR: 61800
      }
    ]
  },

  // LHR → DEL — 2025-12-18 (Qatar, 1-stop DOH) — return of QR-001
  {
    id: "QR-002",
    airline: "Qatar Airways",
    logoBg: "#6C2C3B",
    flightNos: "QR 002",
    fromCity: "London", fromIata: "LHR",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "09:10", departDate: "2025-12-18",
    arriveTime: "02:40", arriveDate: "2025-12-19",
    stops: 1, stopLabel: "1 Stop DOH",
    durationMin: 610,
    refundable: "Refundable",
    extras: ["Book & Hold"],
    fares: [
      {
        fareId: "QR002-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 25, cabinBagKg: 7,
        refundable: false, changeFeeINR: 4500,
        meal: true, seatSelect: false,
        baseINR: 33500, taxINR: 10800, totalINR: 44300
      },
      {
        fareId: "QR002-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 36800, taxINR: 11100, totalINR: 47900
      },
      {
        fareId: "QR002-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 129000, taxINR: 17000, totalINR: 146000
      }
    ]
  },

];

// utility
export function searchFlights(input: SearchInput): FlightRow[] {
  const rows = FLIGHTS.filter(f =>
    f.fromIata === input.fromIata &&
    f.toIata === input.toIata &&
    (!input.departDate || f.departDate === input.departDate)
  );

  // cabin filter → keep only fares of that cabin, drop flights with 0 fares left
  const mapped = rows.map(r => {
    if (!input.cabin) return r;
    const fares = r.fares.filter(f => f.cabin === input.cabin);
    return { ...r, fares };
  }).filter(r => r.fares.length > 0);

  // sort by min fare
  return mapped.sort((a, b) => minFare(a) - minFare(b));
}

export function minFare(row: FlightRow): number {
  return Math.min(...row.fares.map(f => f.totalINR));
}
