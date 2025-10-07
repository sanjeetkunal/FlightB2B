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
  // ===== DEL → BOM — 2025-10-12 (existing) =====
  {
    id: "6E-201",
    airline: "IndiGo",
    logoBg: "#1A73E8",
    flightNos: "6E 201",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai",      toIata: "BOM",
    departTime: "07:15", departDate: "2025-10-12",
    arriveTime: "09:30", arriveDate: "2025-10-12",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Refundable",
    extras: ["Book & Hold", "Partial Payment"],
    fares: [
      {
        fareId: "6E201-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2500,
        meal: false, seatSelect: false, holdAllowed: true, partialPay: true,
        baseINR: 4200, taxINR: 1699, totalINR: 5899
      },
      {
        fareId: "6E201-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 4700, taxINR: 1790, totalINR: 6490
      },
      {
        fareId: "6E201-PE-PREM",
        brand: "Premium", cabin: "Premium Economy", rbd: "W",
        baggageKg: 25, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 6400, taxINR: 2050, totalINR: 8450
      }
    ]
  },
  {
    id: "AI-865",
    airline: "Air India",
    logoBg: "#C41E3A",
    flightNos: "AI 865",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai",      toIata: "BOM",
    departTime: "10:10", departDate: "2025-10-12",
    arriveTime: "12:25", arriveDate: "2025-10-12",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Refundable",
    fares: [
      {
        fareId: "AI865-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2500,
        meal: true, seatSelect: false,
        baseINR: 4550, taxINR: 1740, totalINR: 6290
      },
      {
        fareId: "AI865-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 5050, taxINR: 1840, totalINR: 6890
      },
      {
        fareId: "AI865-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 35, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 11900, taxINR: 2900, totalINR: 14800
      }
    ]
  },
  {
    id: "UK-951",
    airline: "Vistara",
    logoBg: "#5A2E8A",
    flightNos: "UK 951",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Mumbai",      toIata: "BOM",
    departTime: "18:40", departDate: "2025-10-12",
    arriveTime: "20:55", arriveDate: "2025-10-12",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Refundable",
    fares: [
      {
        fareId: "UK951-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "X",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2500,
        meal: true, seatSelect: false,
        baseINR: 4900, taxINR: 1940, totalINR: 6840
      },
      {
        fareId: "UK951-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "M",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 5350, taxINR: 2050, totalINR: 7400
      },
      {
        fareId: "UK951-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 12600, taxINR: 3200, totalINR: 15800
      }
    ]
  },

  // ===== DEL → DXB — 2025-10-12 (existing) =====
  {
    id: "EK-513",
    airline: "Emirates",
    logoBg: "#E31E24",
    flightNos: "EK 513",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Dubai",      toIata: "DXB",
    departTime: "16:15", departDate: "2025-10-12",
    arriveTime: "18:10", arriveDate: "2025-10-12",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 205,
    refundable: "Refundable",
    fares: [
      {
        fareId: "EK513-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 25, cabinBagKg: 7,
        refundable: false, changeFeeINR: 3500,
        meal: true, seatSelect: false,
        baseINR: 18200, taxINR: 5900, totalINR: 24100
      },
      {
        fareId: "EK513-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 19400, taxINR: 6100, totalINR: 25500
      },
      {
        fareId: "EK513-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 53400, taxINR: 9600, totalINR: 63000
      }
    ]
  },

  // ===== NEW ADDITIONS BELOW =====

  // DEL → BLR — 2025-10-13 (Akasa Air)
  {
    id: "QP-1101",
    airline: "Akasa Air",
    logoBg: "#6B21A8",
    flightNos: "QP 1101",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Bengaluru",   toIata: "BLR",
    departTime: "06:30", departDate: "2025-10-13",
    arriveTime: "09:15", arriveDate: "2025-10-13",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 165,
    refundable: "Refundable",
    extras: ["Book & Hold"],
    fares: [
      {
        fareId: "QP1101-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2500,
        meal: false, seatSelect: false,
        baseINR: 3600, taxINR: 1500, totalINR: 5100
      },
      {
        fareId: "QP1101-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 4100, taxINR: 1600, totalINR: 5700
      },
      {
        fareId: "QP1101-PE-PREM",
        brand: "Premium", cabin: "Premium Economy", rbd: "W",
        baggageKg: 25, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 5800, taxINR: 1900, totalINR: 7700
      }
    ]
  },

  // BLR → DEL — 2025-10-14 (Vistara)
  {
    id: "UK-810",
    airline: "Vistara",
    logoBg: "#5A2E8A",
    flightNos: "UK 810",
    fromCity: "Bengaluru", fromIata: "BLR",
    toCity: "New Delhi",   toIata: "DEL",
    departTime: "07:20", departDate: "2025-10-14",
    arriveTime: "10:05", arriveDate: "2025-10-14",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 165,
    refundable: "Refundable",
    fares: [
      {
        fareId: "UK810-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "X",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2500,
        meal: true, seatSelect: false,
        baseINR: 4200, taxINR: 1600, totalINR: 5800
      },
      {
        fareId: "UK810-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "M",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 4700, taxINR: 1700, totalINR: 6400
      },
      {
        fareId: "UK810-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 35, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 12000, taxINR: 3000, totalINR: 15000
      }
    ]
  },

  // BOM → DEL — 2025-11-02 (IndiGo)
  {
    id: "6E-244",
    airline: "IndiGo",
    logoBg: "#1A73E8",
    flightNos: "6E 244",
    fromCity: "Mumbai",  fromIata: "BOM",
    toCity: "New Delhi", toIata: "DEL",
    departTime: "08:00", departDate: "2025-11-02",
    arriveTime: "10:15", arriveDate: "2025-11-02",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Refundable",
    fares: [
      {
        fareId: "6E244-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2500,
        meal: false, seatSelect: false,
        baseINR: 4000, taxINR: 1500, totalINR: 5500
      },
      {
        fareId: "6E244-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 4600, taxINR: 1600, totalINR: 6200
      }
    ]
  },

  // DEL → COK — 2025-11-05 (Air India)
  {
    id: "AI-581",
    airline: "Air India",
    logoBg: "#C41E3A",
    flightNos: "AI 581",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Kochi",      toIata: "COK",
    departTime: "11:10", departDate: "2025-11-05",
    arriveTime: "14:05", arriveDate: "2025-11-05",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 175,
    refundable: "Refundable",
    fares: [
      {
        fareId: "AI581-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2500,
        meal: true, seatSelect: false,
        baseINR: 5200, taxINR: 1900, totalINR: 7100
      },
      {
        fareId: "AI581-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 5800, taxINR: 2000, totalINR: 7800
      },
      {
        fareId: "AI581-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 35, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 13500, taxINR: 3200, totalINR: 16700
      }
    ]
  },

  // HYD → MAA — 2025-10-18 (SpiceJet)
  {
    id: "SG-472",
    airline: "SpiceJet",
    logoBg: "#F97316",
    flightNos: "SG 472",
    fromCity: "Hyderabad", fromIata: "HYD",
    toCity: "Chennai",     toIata: "MAA",
    departTime: "13:40", departDate: "2025-10-18",
    arriveTime: "14:55", arriveDate: "2025-10-18",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 75,
    refundable: "Refundable",
    fares: [
      {
        fareId: "SG472-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "Q",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2000,
        meal: false, seatSelect: false,
        baseINR: 2600, taxINR: 900, totalINR: 3500
      },
      {
        fareId: "SG472-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 3100, taxINR: 950, totalINR: 4050
      }
    ]
  },

  // CCU → MAA — 2025-12-20 (SpiceJet)
  {
    id: "SG-325",
    airline: "SpiceJet",
    logoBg: "#F97316",
    flightNos: "SG 325",
    fromCity: "Kolkata", fromIata: "CCU",
    toCity: "Chennai", toIata: "MAA",
    departTime: "09:20", departDate: "2025-12-20",
    arriveTime: "11:35", arriveDate: "2025-12-20",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 135,
    refundable: "Refundable",
    fares: [
      {
        fareId: "SG325-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2500,
        meal: false, seatSelect: false,
        baseINR: 3600, taxINR: 1300, totalINR: 4900
      },
      {
        fareId: "SG325-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 4100, taxINR: 1400, totalINR: 5500
      }
    ]
  },

  // MAA → DEL — 2025-10-19 (Air India)
  {
    id: "AI-540",
    airline: "Air India",
    logoBg: "#C41E3A",
    flightNos: "AI 540",
    fromCity: "Chennai",   fromIata: "MAA",
    toCity: "New Delhi",   toIata: "DEL",
    departTime: "18:30", departDate: "2025-10-19",
    arriveTime: "21:05", arriveDate: "2025-10-19",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 155,
    refundable: "Refundable",
    fares: [
      {
        fareId: "AI540-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2500,
        meal: true, seatSelect: false,
        baseINR: 5000, taxINR: 1800, totalINR: 6800
      },
      {
        fareId: "AI540-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 5600, taxINR: 1900, totalINR: 7500
      },
      {
        fareId: "AI540-PE-PREM",
        brand: "Premium", cabin: "Premium Economy", rbd: "W",
        baggageKg: 25, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 7200, taxINR: 2100, totalINR: 9300
      }
    ]
  },

  // DEL → DXB — 2025-10-12 (Air India Express)
  {
    id: "IX-1945",
    airline: "Air India Express",
    logoBg: "#E11D48",
    flightNos: "IX 1945",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Dubai",      toIata: "DXB",
    departTime: "22:45", departDate: "2025-10-12",
    arriveTime: "00:55", arriveDate: "2025-10-13",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 190,
    refundable: "Refundable",
    fares: [
      {
        fareId: "IX1945-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "T",
        baggageKg: 20, cabinBagKg: 7,
        refundable: false, changeFeeINR: 3000,
        meal: true, seatSelect: false,
        baseINR: 15000, taxINR: 5000, totalINR: 20000
      },
      {
        fareId: "IX1945-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 25, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 16500, taxINR: 5200, totalINR: 21700
      },
      {
        fareId: "IX1945-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 41000, taxINR: 9000, totalINR: 50000
      }
    ]
  },

  // BOM → DXB — 2025-10-13 (Emirates)
  {
    id: "EK-501",
    airline: "Emirates",
    logoBg: "#E31E24",
    flightNos: "EK 501",
    fromCity: "Mumbai", fromIata: "BOM",
    toCity: "Dubai",  toIata: "DXB",
    departTime: "10:30", departDate: "2025-10-13",
    arriveTime: "13:35", arriveDate: "2025-10-13",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 185,
    refundable: "Refundable",
    fares: [
      {
        fareId: "EK501-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 25, cabinBagKg: 7,
        refundable: false, changeFeeINR: 3500,
        meal: true, seatSelect: false,
        baseINR: 17000, taxINR: 5300, totalINR: 22300
      },
      {
        fareId: "EK501-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 18200, taxINR: 5600, totalINR: 23800
      },
      {
        fareId: "EK501-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 52000, taxINR: 9500, totalINR: 61500
      }
    ]
  },

  // DEL → DOH — 2025-10-12 (Qatar Airways)
  {
    id: "QR-579",
    airline: "Qatar Airways",
    logoBg: "#6C2C3B",
    flightNos: "QR 579",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Doha",       toIata: "DOH",
    departTime: "08:40", departDate: "2025-10-12",
    arriveTime: "10:20", arriveDate: "2025-10-12",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 220,
    refundable: "Refundable",
    fares: [
      {
        fareId: "QR579-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 25, cabinBagKg: 7,
        refundable: false, changeFeeINR: 3000,
        meal: true, seatSelect: false,
        baseINR: 14000, taxINR: 4800, totalINR: 18800
      },
      {
        fareId: "QR579-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 15300, taxINR: 5000, totalINR: 20300
      },
      {
        fareId: "QR579-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 47000, taxINR: 9000, totalINR: 56000
      }
    ]
  },

  // DEL → IST — 2025-10-13 (Turkish Airlines)
  {
    id: "TK-717",
    airline: "Turkish Airlines",
    logoBg: "#CC1E2C",
    flightNos: "TK 717",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Istanbul",    toIata: "IST",
    departTime: "06:35", departDate: "2025-10-13",
    arriveTime: "12:50", arriveDate: "2025-10-13",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 375,
    refundable: "Refundable",
    fares: [
      {
        fareId: "TK717-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 25, cabinBagKg: 7,
        refundable: false, changeFeeINR: 4000,
        meal: true, seatSelect: false,
        baseINR: 21000, taxINR: 6000, totalINR: 27000
      },
      {
        fareId: "TK717-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 22500, taxINR: 6300, totalINR: 28800
      },
      {
        fareId: "TK717-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 68000, taxINR: 11000, totalINR: 79000
      }
    ]
  },

  // BLR → SIN — 2025-11-15 (Singapore Airlines)
  {
    id: "SQ-511",
    airline: "Singapore Airlines",
    logoBg: "#003D7C",
    flightNos: "SQ 511",
    fromCity: "Bengaluru", fromIata: "BLR",
    toCity: "Singapore",   toIata: "SIN",
    departTime: "23:30", departDate: "2025-11-15",
    arriveTime: "06:00", arriveDate: "2025-11-16",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 300,
    refundable: "Refundable",
    fares: [
      {
        fareId: "SQ511-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 25, cabinBagKg: 7,
        refundable: false, changeFeeINR: 3500,
        meal: true, seatSelect: false,
        baseINR: 19500, taxINR: 7200, totalINR: 26700
      },
      {
        fareId: "SQ511-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 21000, taxINR: 7400, totalINR: 28400
      },
      {
        fareId: "SQ511-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 58000, taxINR: 11000, totalINR: 69000
      }
    ]
  },

  // DEL → MUC — 2025-12-05 (Lufthansa)
  {
    id: "LH-763",
    airline: "Lufthansa",
    logoBg: "#FFB300",
    flightNos: "LH 763",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Munich",      toIata: "MUC",
    departTime: "13:50", departDate: "2025-12-05",
    arriveTime: "17:45", arriveDate: "2025-12-05",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 415,
    refundable: "Refundable",
    fares: [
      {
        fareId: "LH763-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 23, cabinBagKg: 8,
        refundable: false, changeFeeINR: 4500,
        meal: true, seatSelect: false,
        baseINR: 32000, taxINR: 9800, totalINR: 41800
      },
      {
        fareId: "LH763-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 8,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 34500, taxINR: 10000, totalINR: 44500
      },
      {
        fareId: "LH763-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 12,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 93000, taxINR: 15000, totalINR: 108000
      }
    ]
  },

  // DEL → AUH — 2025-10-14 (Etihad)
  {
    id: "EY-211",
    airline: "Etihad Airways",
    logoBg: "#B59B49",
    flightNos: "EY 211",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "Abu Dhabi",   toIata: "AUH",
    departTime: "21:55", departDate: "2025-10-14",
    arriveTime: "00:05", arriveDate: "2025-10-15",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 190,
    refundable: "Refundable",
    fares: [
      {
        fareId: "EY211-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 23, cabinBagKg: 7,
        refundable: false, changeFeeINR: 3000,
        meal: true, seatSelect: false,
        baseINR: 13500, taxINR: 4700, totalINR: 18200
      },
      {
        fareId: "EY211-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 14800, taxINR: 4900, totalINR: 19700
      },
      {
        fareId: "EY211-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 46000, taxINR: 8500, totalINR: 54500
      }
    ]
  },

  // HYD → GOI — 2025-12-02 (Akasa Air)
  {
    id: "QP-1423",
    airline: "Akasa Air",
    logoBg: "#6B21A8",
    flightNos: "QP 1423",
    fromCity: "Hyderabad", fromIata: "HYD",
    toCity: "Goa",        toIata: "GOI",
    departTime: "12:10", departDate: "2025-12-02",
    arriveTime: "13:35", arriveDate: "2025-12-02",
    stops: 0, stopLabel: "Non-stop",
    durationMin: 85,
    refundable: "Refundable",
    fares: [
      {
        fareId: "QP1423-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 15, cabinBagKg: 7,
        refundable: false, changeFeeINR: 2000,
        meal: false, seatSelect: false,
        baseINR: 2800, taxINR: 1000, totalINR: 3800
      },
      {
        fareId: "QP1423-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 20, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 3300, taxINR: 1100, totalINR: 4400
      }
    ]
  },

  // DEL → LHR — 2025-12-10 (Qatar Airways, 1-stop via DOH)
  {
    id: "QR-001",
    airline: "Qatar Airways",
    logoBg: "#6C2C3B",
    flightNos: "QR 001",
    fromCity: "New Delhi", fromIata: "DEL",
    toCity: "London",      toIata: "LHR",
    departTime: "03:10", departDate: "2025-12-10",
    arriveTime: "12:10", arriveDate: "2025-12-10",
    stops: 1, stopLabel: "1 Stop DOH",
    durationMin: 600,
    refundable: "Refundable",
    extras: ["Book & Hold"],
    fares: [
      {
        fareId: "QR001-ECO-SAVER",
        brand: "Saver", cabin: "Economy", rbd: "V",
        baggageKg: 25, cabinBagKg: 7,
        refundable: false, changeFeeINR: 4500,
        meal: true, seatSelect: false,
        baseINR: 33000, taxINR: 10700, totalINR: 43700
      },
      {
        fareId: "QR001-ECO-FLEX",
        brand: "Flex", cabin: "Economy", rbd: "K",
        baggageKg: 30, cabinBagKg: 7,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 36200, taxINR: 11000, totalINR: 47200
      },
      {
        fareId: "QR001-BIZ",
        brand: "Business", cabin: "Business", rbd: "J",
        baggageKg: 40, cabinBagKg: 10,
        refundable: true, changeFeeINR: 0,
        meal: true, seatSelect: true,
        baseINR: 128000, taxINR: 17000, totalINR: 145000
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
