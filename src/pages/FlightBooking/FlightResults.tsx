// src/pages/FlightResults.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion"; // ⭐ animation

import FromToBar from "../../components/flightsearch/FromToBar";

import {
  searchFlights,
  FLIGHTS,
  type FlightRow,
  type FlightFare,
} from "../../data/flights";

import FilterPanel, { type Filters } from "../../components/flightlist/FiltersPanel";

import OnewayResult, {
  type Row as OW_Row,
  type FareOption as OW_Fare,
} from "../../components/flightlist/OnewayResultList";

import RoundTripResultList, {
  type RowRT as RT_Row,
  type FareRT as RT_Fare,

} from "../../components/flightlist/RoundTripResultList";

import SpecialRoundTripResult, {
  type SpecialRTRow,
  type FareOption as SpecialFare,
  type PaxConfig as SpecialPaxConfig,
  type LegSummary,
  type PolicyRule,
} from "../../components/flightlist/SpecialRoundTripResult";

/* =============== small utils =============== */
type TimeSlot = "0-6" | "6-12" | "12-18" | "18-24";
type SortKey = "price_low" | "price_high" | "duration" | "depart_early" | "arrive_late";

const formatDateLabel = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.toLocaleString("en-GB", { day: "2-digit" });
  const mon = d.toLocaleString("en-GB", { month: "short" });
  const wk = d.toLocaleString("en-GB", { weekday: "short" });
  return `${day} ${mon}, ${wk}`;
};

const timeOfDay = (hhmm?: string): TimeSlot => {
  const h = Number((hhmm ?? "00:00").split(":")[0]);
  if (h < 6) return "0-6";
  if (h < 12) return "6-12";
  if (h < 18) return "12-18";
  return "18-24";
};

type RouteFilter = { from?: string; to?: string; oneWay?: boolean; cabin?: string; pax?: number };

/* -------- refundable normalizers (fixes hyphen vs space issues) -------- */
function normalizeRefundable(v: unknown): "Refundable" | "Non-Refundable" {
  if (typeof v === "boolean") return v ? "Refundable" : "Non-Refundable";
  const s = String(v ?? "").toLowerCase().replace(/-/g, " ").trim();
  return s.includes("non") ? "Non-Refundable" : "Refundable";
}
const normRefStr = (s: string) => s.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
const eqRefund = (rowVal: string, filterVal: "any" | "Refundable" | "Non-Refundable") =>
  filterVal === "any" || normRefStr(rowVal) === normRefStr(filterVal);

/* ====== Layout animation variants ====== */
const layoutContainerVariants: any = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.12,
    },
  },
};

const sidebarVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const resultsVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

/* =============== ONEWAY ADAPTERS (strictly for OnewayResult) =============== */
function mapFareOW(f: FlightFare): OW_Fare {
  return {
    code: `${f.brand}-${f.cabin}-${f.rbd}`,
    label: f.brand,
    price: f.totalINR,
    refundable: f.refundable ? "Refundable" : "Non Refundable",
    cabin: f.cabin,
    meal: f.meal ? "Free Meal" : "Paid Meal",
    badge:
      f.changeFeeINR === 0
        ? { text: "Published", tone: "published" }
        : { text: "Offer Fare", tone: "offer" },
    baggage: { handKg: f.cabinBagKg, checkKg: f.baggageKg },
    seat: f.seatSelect ? "Preferred seat included" : "Seat selection (paid)",
  };
}

function adaptRowsOW(rows: FlightRow[]): OW_Row[] {
  return rows.map((r) => {
    const departDateLbl = formatDateLabel(r.departDate);
    const arriveDateLbl = formatDateLabel(r.arriveDate);
    const fares = r.fares ?? [];
    const minFare = fares.length ? Math.min(...fares.map((f) => f.totalINR)) : 0;

    return {
      id: r.id,
      airline: r.airline,
      logo: r.logo,
      flightNos: r.flightNos,
      fromCity: r.fromCity,
      fromIata: r.fromIata,
      toCity: r.toCity,
      toIata: r.toIata,
      departTime: r.departTime,
      departDate: departDateLbl,
      arriveTime: r.arriveTime,
      arriveDate: arriveDateLbl,
      stops: r.stops,
      stopLabel: r.stopLabel,
      durationMin: r.durationMin,
      totalFareINR: minFare,
      commissionUSD: 0,
      agentFareUSD: 0,
      refundable: normalizeRefundable(r.refundable),
      extras: r.extras ?? [],
      segments: [
        {
          fromCity: r.fromCity,
          fromIata: r.fromIata,
          departTime: r.departTime,
          departDate: departDateLbl,
          toCity: r.toCity,
          toIata: r.toIata,
          arriveTime: r.arriveTime,
          arriveDate: arriveDateLbl,
          carrier: r.flightNos.split(" ")[0],
          flightNo: r.flightNos.split(" ").pop() || "",
          durationMin: r.durationMin,
          layout: "3-3 Layout",
          beverage: true,
          seatType: "Standard Recliner",
          legroomInch: 29,
        },
      ],
      baggage: {
        handKg: fares.length ? Math.max(...fares.map((f) => f.cabinBagKg ?? 0)) : 0,
        checkKg: fares.length ? Math.max(...fares.map((f) => f.baggageKg ?? 0)) : 0,
        piece: "1 piece only",
      },
      cancellation: {
        refund: [
          {
            when: "≥ 24h before departure",
            feeUSD: fares.some((f) => f.refundable) ? 0 : 200,
          },
        ],
        change: [
          {
            when: "Date/Time change (per pax)",
            feeUSD: fares.some((f) => f.changeFeeINR === 0) ? 0 : 150,
            note: "Fare diff applies",
          },
        ],
        noShowUSD: 250,
      },
      fares: fares.map(mapFareOW),
    };
  });
}

function useDatasetMetaOW(data: OW_Row[]) {
  const airlines = useMemo(
    () => Array.from(new Set(data.map((d) => d.airline))).sort(),
    [data]
  );
  const minPrice = useMemo(
    () => (data.length ? Math.min(...data.map((d) => d.totalFareINR)) : 0),
    [data]
  );
  const maxPrice = useMemo(
    () => (data.length ? Math.max(...data.map((d) => d.totalFareINR)) : 0),
    [data]
  );
  const airlineMinPrice = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach((r) => {
      m[r.airline] = Math.min(m[r.airline] ?? Infinity, r.totalFareINR);
    });
    return m;
  }, [data]);
  const departAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((r) => map.set(r.fromIata, `${r.fromCity} (${r.fromIata})`));
    return Array.from(map.entries())
      .map(([code, label]) => ({ code, label }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data]);
  const arriveAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((r) => map.set(r.toIata, `${r.toCity} (${r.toIata})`));
    return Array.from(map.entries())
      .map(([code, label]) => ({ code, label }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data]);
  return { airlines, minPrice, maxPrice, airlineMinPrice, departAirports, arriveAirports };
}

/* =============== ROUND-TRIP (DOMESTIC) ADAPTERS =============== */
function normalizeRefundableRT(v: unknown): "Refundable" | "Non Refundable" {
  if (typeof v === "boolean") return v ? "Refundable" : "Non Refundable";
  const s = String(v ?? "").toLowerCase().replace(/-/g, " ").trim();
  return s.includes("non") ? "Non Refundable" : "Refundable";
}

function mapFareRT(f: FlightFare): RT_Fare {
  return {
    code: `${f.brand}-${f.cabin}-${f.rbd}`,
    label: f.brand,
    price: f.totalINR,
    refundable: normalizeRefundableRT(f.refundable),
    cabin: f.cabin,
    meal: f.meal ? "Free Meal" : "Paid Meal",
    badge:
      f.changeFeeINR === 0
        ? { text: "Published", tone: "published" }
        : { text: "Offer Fare", tone: "offer" },
    baggage: { handKg: f.cabinBagKg, checkKg: f.baggageKg },
    seat: f.seatSelect ? "Preferred seat included" : "Seat selection (paid)",
  };
}

function adaptRowsRT(rows: FlightRow[], sector: "DOM" | "INTL"): RT_Row[] {
  return rows.map((r) => {
    const departDateLbl = formatDateLabel(r.departDate);
    const arriveDateLbl = formatDateLabel(r.arriveDate);
    const fares = r.fares ?? [];
    const minFare = fares.length ? Math.min(...fares.map((f) => f.totalINR)) : 0;

    return {
      id: r.id,
      airline: r.airline,
      logo: r.logo,
      flightNos: r.flightNos,

      fromCity: r.fromCity,
      fromIata: r.fromIata,
      toCity: r.toCity,
      toIata: r.toIata,

      departTime: r.departTime,
      arriveTime: r.arriveTime,
      departDate: departDateLbl,
      arriveDate: arriveDateLbl,

      stops: r.stops,
      stopLabel: r.stopLabel,
      durationMin: r.durationMin,

      totalFareINR: minFare,
      refundable: normalizeRefundableRT(r.refundable),

      fares: fares.map(mapFareRT),
      baggage: {
        handKg: fares.length ? Math.max(...fares.map(f => f.cabinBagKg ?? 0)) : 0,
        checkKg: fares.length ? Math.max(...fares.map(f => f.baggageKg ?? 0)) : 0,
        piece: "1 piece only",
      },

      sector, // ✅🔥 THIS FIXES EVERYTHING
    };

  });
}

function useDatasetMetaRT(data: RT_Row[]) {
  const airlines = useMemo(
    () => Array.from(new Set(data.map((d) => d.airline))).sort(),
    [data]
  );
  const minPrice = useMemo(
    () => (data.length ? Math.min(...data.map((d) => d.totalFareINR)) : 0),
    [data]
  );
  const maxPrice = useMemo(
    () => (data.length ? Math.max(...data.map((d) => d.totalFareINR)) : 0),
    [data]
  );
  const airlineMinPrice = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach((r) => {
      m[r.airline] = Math.min(m[r.airline] ?? Infinity, r.totalFareINR);
    });
    return m;
  }, [data]);
  const departAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((r) => map.set(r.fromIata, `${r.fromCity} (${r.fromIata})`));
    return Array.from(map.entries())
      .map(([code, label]) => ({ code, label }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data]);
  const arriveAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((r) => map.set(r.toIata, `${r.toCity} (${r.toIata})`));
    return Array.from(map.entries())
      .map(([code, label]) => ({ code, label }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data]);
  return { airlines, minPrice, maxPrice, airlineMinPrice, departAirports, arriveAirports };
}

/* =============== INTL ROUND-TRIP ADAPTERS (for SpecialRoundTripResult) =============== */

const toLegSummary = (r: FlightRow): LegSummary => {
  const departDateLbl = formatDateLabel(r.departDate);
  const arriveDateLbl = formatDateLabel(r.arriveDate);
  const fares = r.fares ?? [];

  const handKg = fares.length ? Math.max(...fares.map((f) => f.cabinBagKg ?? 0)) : undefined;
  const checkKg = fares.length ? Math.max(...fares.map((f) => f.baggageKg ?? 0)) : undefined;

  return {
    fromCity: r.fromCity,
    fromIata: r.fromIata,
    toCity: r.toCity,
    toIata: r.toIata,
    departTime: r.departTime,
    departDate: departDateLbl,
    arriveTime: r.arriveTime,
    arriveDate: arriveDateLbl,
    stopLabel: r.stopLabel,
    durationMin: r.durationMin,
    segments: [
      {
        fromCity: r.fromCity,
        fromIata: r.fromIata,
        toCity: r.toCity,
        toIata: r.toIata,
        departTime: r.departTime,
        departDate: departDateLbl,
        arriveTime: r.arriveTime,
        arriveDate: arriveDateLbl,
        carrier: r.flightNos.split(" ")[0],
        flightNo: r.flightNos.split(" ").pop() || "",
        durationMin: r.durationMin,
        layout: "3-3 Layout",
        beverage: true,
        seatType: "Standard Recliner",
        legroomInch: 30,
      },
    ],
    baggage: {
      handKg,
      checkKg,
      piece: "1 piece only",
    },
  };
};

const getMinFare = (fares?: FlightFare[]): number =>
  fares && fares.length ? Math.min(...fares.map((f) => f.totalINR)) : 0;

const buildRTFares = (out: FlightRow, back: FlightRow): { total: number; fares: SpecialFare[] } => {
  const outMin = getMinFare(out.fares);
  const inMin = getMinFare(back.fares);
  const baseRT = outMin + inMin;

  const specialPrice = Math.round(baseRT * 0.95);

  const saver: SpecialFare = {
    code: `${out.id}-${back.id}-RT-SAVER`,
    label: "Special Saver RT",
    price: specialPrice,
    refundable: "Refundable",
    cabin: out.fares?.[0]?.cabin ?? "Economy",
    meal: "Free Meal",
    baggage: {
      handKg: Math.max(
        ...(out.fares ?? []).map((f) => f.cabinBagKg ?? 0),
        ...(back.fares ?? []).map((f) => f.cabinBagKg ?? 0)
      ),
      checkKg: Math.max(
        ...(out.fares ?? []).map((f) => f.baggageKg ?? 0),
        ...(back.fares ?? []).map((f) => f.baggageKg ?? 0)
      ),
    },
    seat: "Standard seat selection",
    commissionINR: 1500,
    agentFareINR: specialPrice - 1500,
    perks: ["Special B2B round-trip fare"],
  };

  const flex: SpecialFare = {
    ...saver,
    code: `${out.id}-${back.id}-RT-FLEX`,
    label: "Special Flex RT",
    price: Math.round(baseRT * 1.02),
    refundable: "Refundable",
    perks: ["Date change allowed", "Higher baggage"],
  };

  return { total: specialPrice, fares: [saver, flex] };
};

const defaultPolicy: { refund: PolicyRule[]; change: PolicyRule[]; noShowUSD?: number } = {
  refund: [
    { when: "≥ 72h before departure", feeUSD: 0 },
    { when: "24–72h before departure", feeUSD: 2500 },
    { when: "< 24h before departure", feeUSD: 4500 },
  ],
  change: [
    {
      when: "Date/Time change (per sector)",
      feeUSD: 2000,
      note: "Fare difference applies",
    },
  ],
  noShowUSD: 5000,
};

const buildSpecialRTRows = (
  fromIata: string,
  toIata: string,
  departDate: string,
  returnDate: string,
  cabin?: string
): SpecialRTRow[] => {
  const outbound = FLIGHTS.filter(
    (f) =>
      f.fromIata === fromIata &&
      f.toIata === toIata &&
      f.departDate === departDate &&
      (!cabin || f.fares?.some((x) => x.cabin === cabin))
  );
  const inbound = FLIGHTS.filter(
    (f) =>
      f.fromIata === toIata &&
      f.toIata === fromIata &&
      f.departDate === returnDate &&
      (!cabin || f.fares?.some((x) => x.cabin === cabin))
  );

  const rows: SpecialRTRow[] = [];

  outbound.forEach((out) => {
    inbound.forEach((back) => {
      const { total, fares } = buildRTFares(out, back);

      rows.push({
        id: `${out.id}__${back.id}`,
        airline: out.airline,
        logo: out.logo,
        refundable:
          out.refundable === "Refundable" && back.refundable === "Refundable"
            ? "Refundable"
            : "Non-Refundable",
        extras: ["Special Intl RT B2B Fare"],
        totalFareINR: total,
        outbound: toLegSummary(out),
        inbound: toLegSummary(back),
        cancellation: defaultPolicy,
        fares,
      });
    });
  });

  return rows;
};

// dataset meta for Intl RT filter panel
function useDatasetMetaIntlRT(data: SpecialRTRow[]) {
  const airlines = useMemo(
    () => Array.from(new Set(data.map((d) => d.airline))).sort(),
    [data]
  );

  const minPrice = useMemo(
    () => (data.length ? Math.min(...data.map((d) => d.totalFareINR)) : 0),
    [data]
  );

  const maxPrice = useMemo(
    () => (data.length ? Math.max(...data.map((d) => d.totalFareINR)) : 0),
    [data]
  );

  const airlineMinPrice = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach((r) => {
      m[r.airline] = Math.min(m[r.airline] ?? Infinity, r.totalFareINR);
    });
    return m;
  }, [data]);

  const departAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((r) => {
      map.set(r.outbound.fromIata, `${r.outbound.fromCity} (${r.outbound.fromIata})`);
      map.set(r.inbound.fromIata, `${r.inbound.fromCity} (${r.inbound.fromIata})`);
    });
    return Array.from(map.entries())
      .map(([code, label]) => ({ code, label }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data]);

  const arriveAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((r) => {
      map.set(r.outbound.toIata, `${r.outbound.toCity} (${r.outbound.toIata})`);
      map.set(r.inbound.toIata, `${r.inbound.toCity} (${r.inbound.toIata})`);
    });
    return Array.from(map.entries())
      .map(([code, label]) => ({ code, label }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data]);

  return { airlines, minPrice, maxPrice, airlineMinPrice, departAirports, arriveAirports };
}

// Intl RT stops value: 0 if both legs Non-stop, else 1+
const getStopsValueIntl = (r: SpecialRTRow): number => {
  const isNonstop = (label?: string) =>
    !label || label.toLowerCase().includes("non-stop");
  const outNon = isNonstop(r.outbound.stopLabel);
  const inNon = isNonstop(r.inbound.stopLabel);
  return outNon && inNon ? 0 : 1;
};

/* =============== shared filter base =============== */
type BaseFilters = Omit<Filters, "applyTo">;

const makeDefaultFilters = (minPrice: number, maxPrice: number): BaseFilters => ({
  airlines: new Set<string>(),
  stops: "any",
  refundable: "any",
  payments: new Set<string>(),
  priceMin: minPrice,
  priceMax: Math.max(maxPrice, minPrice),
  nonstopOnly: false,
  hideNearby: false,
  fromAirports: new Set<string>(),
  toAirports: new Set<string>(),
  depSlots: new Set<TimeSlot>(),
  arrSlots: new Set<TimeSlot>(),
  fareView: "SINGLE",
});

/* ===================================================================== */
/* =============================== MAIN ================================= */
/* ===================================================================== */

export default function FlightResults() {
  const { search } = useLocation();
  const qp = useMemo(() => new URLSearchParams(search), [search]);



  const fareType = qp.get("fare"); // null OR "special"
  const isSpecialFare = fareType === "special";

  const fromIata = (qp.get("from") || "").toUpperCase();
  const toIata = (qp.get("to") || "").toUpperCase();

  const dateISO = qp.get("date") || qp.get("depart") || "";
  const retISO = qp.get("ret") || qp.get("return") || "";

  const tripRaw = (qp.get("trip") || "").toLowerCase(); // "oneway" | "roundtrip"
  const sector = (qp.get("sector") || "dom").toLowerCase(); // "dom" | "intl"

  const cabin = (qp.get("cabin") || "Economy") as any;

  const adt = Number(qp.get("adt") || qp.get("adults") || "1");
  const chd = Number(qp.get("chd") || qp.get("children") || "0");
  const inf = Number(qp.get("inf") || qp.get("infants") || "0");

  const paxCalc = [adt, chd, inf].reduce(
    (sum, v) => (Number.isFinite(v) && v > 0 ? sum + v : sum),
    0
  );
  const pax = paxCalc || 1;

  // ✅ ONEWAY + DOMESTIC RT pax config
const paxConfig = {
  adults: adt || 1,
  children: chd || 0,
  infants: inf || 0,
};


  const isRound = tripRaw === "roundtrip" || (!!retISO && retISO !== "");
  const isInternational = sector === "intl";
  const isIntlRoundTrip = isRound && isInternational;
  const isSpecialIntlRT = isIntlRoundTrip && isSpecialFare;

  // Intl RT specific pax config
  const paxConfigIntl: SpecialPaxConfig = {
    adults: adt || 1,
    children: chd || 0,
    infants: inf || 0,
  };

  /* === RAW datasets === */
  const rawOutbound = useMemo(() => {
    if (!fromIata || !toIata) return [];
    return searchFlights({ fromIata, toIata, departDate: dateISO, cabin });
  }, [fromIata, toIata, dateISO, cabin]);

  const rawReturn = useMemo(() => {
    if (!isRound || !fromIata || !toIata) return [];
    return searchFlights({
      fromIata: toIata,
      toIata: fromIata,
      departDate: retISO,
      cabin,
    });
  }, [isRound, fromIata, toIata, retISO, cabin]);

  const intlRaw: SpecialRTRow[] = useMemo(() => {
    if (!isSpecialIntlRT || !fromIata || !toIata || !dateISO || !retISO) return [];
    return buildSpecialRTRows(fromIata, toIata, dateISO, retISO, cabin);
  }, [isSpecialIntlRT, fromIata, toIata, dateISO, retISO, cabin]);

  /* ========================== ONEWAY PIPE ========================== */
  const OW_DATA: OW_Row[] = useMemo(() => adaptRowsOW(rawOutbound), [rawOutbound]);
  const metaOW = useDatasetMetaOW(OW_DATA);

  const [fOW, setFOW] = useState<BaseFilters>(() =>
    makeDefaultFilters(metaOW.minPrice, Math.max(metaOW.maxPrice, metaOW.minPrice))
  );
  useEffect(() => {
    setFOW((f) => ({
      ...f,
      priceMin: metaOW.minPrice,
      priceMax: Math.max(metaOW.maxPrice, metaOW.minPrice),
    }));
  }, [metaOW.minPrice, metaOW.maxPrice]);

  const routeOW: RouteFilter = useMemo(
    () => ({
      from: fromIata || undefined,
      to: toIata || undefined,
      oneWay: true,
      cabin: cabin || undefined,
      pax: pax || 1,
    }),
    [fromIata, toIata, cabin, pax]
  );

  const applyOW = (rows: OW_Row[]) =>
    rows.filter((r) => {
      const inAirline = fOW.airlines.size === 0 || fOW.airlines.has(r.airline);
      const inStops = fOW.stops === "any" || r.stops === fOW.stops;
      const inRefund = eqRefund(r.refundable, fOW.refundable);
      const inPayments =
        fOW.payments.size === 0 || r.extras?.some((x) => Array.from(fOW.payments).includes(x));
      const inPrice = r.totalFareINR >= fOW.priceMin && r.totalFareINR <= fOW.priceMax;
      const inFrom =
        fOW.fromAirports.size === 0 || fOW.fromAirports.has(r.fromIata.toUpperCase());
      const inTo = fOW.toAirports.size === 0 || fOW.toAirports.has(r.toIata.toUpperCase());
      const inDepSlot =
        fOW.depSlots.size === 0 || fOW.depSlots.has(timeOfDay(r.departTime));
      const inArrSlot =
        fOW.arrSlots.size === 0 || fOW.arrSlots.has(timeOfDay(r.arriveTime));
      const routeOk =
        (!routeOW.from || r.fromIata.toUpperCase() === routeOW.from) &&
        (!routeOW.to || r.toIata.toUpperCase() === routeOW.to);
      return (
        routeOk &&
        inAirline &&
        (fOW.nonstopOnly ? r.stops === 0 : inStops) &&
        inRefund &&
        inPayments &&
        inPrice &&
        inFrom &&
        inTo &&
        inDepSlot &&
        inArrSlot
      );
    });

  const [sortOW, setSortOW] = useState<SortKey>("price_low");
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const sortRowsOW = (rows: OW_Row[]) => {
    const cp = [...rows];
    cp.sort((a, b) => {
      if (sortOW === "price_low")
        return a.totalFareINR - b.totalFareINR || a.durationMin - b.durationMin;
      if (sortOW === "price_high")
        return b.totalFareINR - a.totalFareINR || a.durationMin - b.durationMin;
      if (sortOW === "duration")
        return a.durationMin - b.durationMin || a.totalFareINR - b.totalFareINR;
      if (sortOW === "depart_early") return toMin(a.departTime) - toMin(b.departTime);
      if (sortOW === "arrive_late") return toMin(b.arriveTime) - toMin(a.arriveTime);
      return 0;
    });
    return cp;
  };

  const rowsOW = useMemo(() => sortRowsOW(applyOW(OW_DATA)), [OW_DATA, fOW, sortOW]);
  const metaOWForPanel = useDatasetMetaOW(rowsOW.length ? rowsOW : OW_DATA);

  const [selOW, setSelOW] = useState<{ flightId: string; fare: OW_Fare } | null>(null);
  useEffect(() => {
    if (selOW && !rowsOW.some((r) => r.id === selOW.flightId)) setSelOW(null);
  }, [rowsOW, selOW]);

  /* ========================== ROUND DOMESTIC PIPE ========================== */
  const RT_OUT = useMemo(
    () => adaptRowsRT(rawOutbound, "DOM"),
    [rawOutbound]
  );

  const RT_IN = useMemo(
    () => adaptRowsRT(rawReturn, "DOM"),
    [rawReturn]
  );
  const metaRTAll = useDatasetMetaRT([...RT_OUT, ...RT_IN]);

  const [applyTo, setApplyTo] = useState<"both" | "out" | "in">("both");
  const [fOut, setFOut] = useState<BaseFilters>(() =>
    makeDefaultFilters(metaRTAll.minPrice, Math.max(metaRTAll.maxPrice, metaRTAll.minPrice))
  );
  const [fIn, setFIn] = useState<BaseFilters>(() =>
    makeDefaultFilters(metaRTAll.minPrice, Math.max(metaRTAll.maxPrice, metaRTAll.minPrice))
  );
  useEffect(() => {
    const min = metaRTAll.minPrice;
    const max = Math.max(metaRTAll.maxPrice, metaRTAll.minPrice);
    setFOut((f) => ({ ...f, priceMin: min, priceMax: Math.min(f.priceMax, max) }));
    setFIn((f) => ({ ...f, priceMin: min, priceMax: Math.min(f.priceMax, max) }));
  }, [metaRTAll.minPrice, metaRTAll.maxPrice]);

  const activeForPanelRT: Filters = useMemo(() => {
    const base = applyTo === "in" ? fIn : fOut;
    return { ...base, applyTo };
  }, [applyTo, fOut, fIn]);

  const setFromPanelRT = (next: Filters) => {
    if (next.applyTo !== applyTo) {
      const prev = applyTo;
      setApplyTo(next.applyTo);
      if (next.applyTo === "both") {
        const src = prev === "in" ? fIn : fOut;
        setFOut(src);
        setFIn(src);
      }
      return;
    }
    const { applyTo: _x, ...payload } = next as unknown as BaseFilters & { applyTo: never };
    if (applyTo === "both") {
      setFOut(payload);
      setFIn(payload);
    } else if (applyTo === "out") setFOut(payload);
    else setFIn(payload);
  };

  const applyOneRT = (rows: RT_Row[], f: BaseFilters) =>
    rows.filter((r) => {
      const inAirline = f.airlines.size === 0 || f.airlines.has(r.airline);
      const inStops = f.stops === "any" || r.stops === f.stops;
      const inRefund = eqRefund(r.refundable, f.refundable);
      const inPayments =
        f.payments.size === 0 || r.extras?.some((x) => Array.from(f.payments).includes(x));
      const inPrice = r.totalFareINR >= f.priceMin && r.totalFareINR <= f.priceMax;
      const inFrom =
        f.fromAirports.size === 0 || f.fromAirports.has(r.fromIata.toUpperCase());
      const inTo = f.toAirports.size === 0 || f.toAirports.has(r.toIata.toUpperCase());
      const inDepSlot =
        f.depSlots.size === 0 || f.depSlots.has(timeOfDay(r.departTime));
      const inArrSlot =
        f.arrSlots.size === 0 || f.arrSlots.has(timeOfDay(r.arriveTime));
      return (
        inAirline &&
        (f.nonstopOnly ? r.stops === 0 : inStops) &&
        inRefund &&
        inPayments &&
        inPrice &&
        inFrom &&
        inTo &&
        inDepSlot &&
        inArrSlot
      );
    });

  const [sortRT, setSortRT] = useState<SortKey>("price_low");
  const sortRowsRT = (rows: RT_Row[]) => {
    const cp = [...rows];
    const toMinRT = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    cp.sort((a, b) => {
      if (sortRT === "price_low")
        return a.totalFareINR - b.totalFareINR || a.durationMin - b.durationMin;
      if (sortRT === "price_high")
        return b.totalFareINR - a.totalFareINR || a.durationMin - b.durationMin;
      if (sortRT === "duration")
        return a.durationMin - b.durationMin || a.totalFareINR - b.totalFareINR;
      if (sortRT === "depart_early") return toMinRT(a.departTime) - toMinRT(b.departTime);
      if (sortRT === "arrive_late") return toMinRT(b.arriveTime) - toMinRT(a.arriveTime);
      return 0;
    });
    return cp;
  };

  const rowsOutRT = useMemo(
    () => sortRowsRT(applyOneRT(RT_OUT, fOut)),
    [RT_OUT, fOut, sortRT]
  );
  const rowsInRT = useMemo(
    () => sortRowsRT(applyOneRT(RT_IN, fIn)),
    [RT_IN, fIn, sortRT]
  );

  const metaForPanelRT = useDatasetMetaRT(
    (applyTo === "out"
      ? rowsOutRT
      : applyTo === "in"
        ? rowsInRT
        : [...rowsOutRT, ...rowsInRT]
    ).length
      ? applyTo === "out"
        ? rowsOutRT
        : applyTo === "in"
          ? rowsInRT
          : [...rowsOutRT, ...rowsInRT]
      : [...RT_OUT, ...RT_IN]
  );

  const [selOutRT, setSelOutRT] = useState<{ flightId: string; fare: RT_Fare } | null>(
    null
  );
  const [selInRT, setSelInRT] = useState<{ flightId: string; fare: RT_Fare } | null>(null);
  useEffect(() => {
    if (selOutRT && !rowsOutRT.some((r) => r.id === selOutRT.flightId)) setSelOutRT(null);
  }, [rowsOutRT, selOutRT]);
  useEffect(() => {
    if (selInRT && !rowsInRT.some((r) => r.id === selInRT.flightId)) setSelInRT(null);
  }, [rowsInRT, selInRT]);

  const resetByApplyToRT = () => {
    const base = makeDefaultFilters(
      metaRTAll.minPrice,
      Math.max(metaRTAll.maxPrice, metaRTAll.minPrice)
    );
    if (applyTo === "both") {
      setFOut(base);
      setFIn(base);
    } else if (applyTo === "out") setFOut(base);
    else setFIn(base);
  };

  /* ========================== INTL ROUND-TRIP PIPE ========================== */

  const metaIntlBase = useDatasetMetaIntlRT(intlRaw);

  const [filtersIntl, setFiltersIntl] = useState<Filters>(() => ({
    airlines: new Set<string>(),
    stops: "any",
    refundable: "any",
    payments: new Set<string>(),
    priceMin: metaIntlBase.minPrice,
    priceMax: Math.max(metaIntlBase.maxPrice, metaIntlBase.minPrice),
    nonstopOnly: false,
    hideNearby: false,
    fromAirports: new Set<string>(),
    toAirports: new Set<string>(),
    depSlots: new Set<TimeSlot>(),
    arrSlots: new Set<TimeSlot>(),
    applyTo: "both",
    fareView: "SINGLE",
  }));

  useEffect(() => {
    setFiltersIntl((f) => ({
      ...f,
      priceMin: metaIntlBase.minPrice,
      priceMax: Math.max(metaIntlBase.maxPrice, metaIntlBase.minPrice),
    }));
  }, [metaIntlBase.minPrice, metaIntlBase.maxPrice]);

  const filteredIntl = useMemo(() => {
    const f = filtersIntl;

    const inAirline = (a: string) => f.airlines.size === 0 || f.airlines.has(a);

    const inStops = (row: SpecialRTRow) => {
      if (f.stops === "any") return true;
      const s = getStopsValueIntl(row);
      return s === f.stops;
    };

    const inRefund = (r: SpecialRTRow) =>
      f.refundable === "any" || r.refundable === f.refundable;

    const inPayments = (r: SpecialRTRow) =>
      f.payments.size === 0 ||
      r.extras?.some((x) => Array.from(f.payments).includes(x));

    const inPrice = (r: SpecialRTRow) =>
      r.totalFareINR >= f.priceMin && r.totalFareINR <= f.priceMax;

    const inFrom = (r: SpecialRTRow) => {
      if (f.fromAirports.size === 0) return true;
      const froms = [
        r.outbound.fromIata.toUpperCase(),
        r.inbound.fromIata.toUpperCase(),
      ];
      return froms.some((code) => f.fromAirports.has(code));
    };

    const inTo = (r: SpecialRTRow) => {
      if (f.toAirports.size === 0) return true;
      const tos = [r.outbound.toIata.toUpperCase(), r.inbound.toIata.toUpperCase()];
      return tos.some((code) => f.toAirports.has(code));
    };

    const inDepSlot = (r: SpecialRTRow) => {
      if (f.depSlots.size === 0) return true;
      const outSlot = timeOfDay(r.outbound.departTime);
      const inSlot = timeOfDay(r.inbound.departTime);

      if (f.applyTo === "out") return f.depSlots.has(outSlot);
      if (f.applyTo === "in") return f.depSlots.has(inSlot);
      return f.depSlots.has(outSlot) || f.depSlots.has(inSlot);
    };

    const inArrSlot = (r: SpecialRTRow) => {
      if (f.arrSlots.size === 0) return true;
      const outSlot = timeOfDay(r.outbound.arriveTime);
      const inSlot = timeOfDay(r.inbound.arriveTime);

      if (f.applyTo === "out") return f.arrSlots.has(outSlot);
      if (f.applyTo === "in") return f.arrSlots.has(inSlot);
      return f.arrSlots.has(outSlot) || f.arrSlots.has(inSlot);
    };

    return intlRaw.filter((r) => {
      const stopsVal = getStopsValueIntl(r);

      return (
        inAirline(r.airline) &&
        inPrice(r) &&
        inRefund(r) &&
        inPayments(r) &&
        inFrom(r) &&
        inTo(r) &&
        inDepSlot(r) &&
        inArrSlot(r) &&
        (f.nonstopOnly ? stopsVal === 0 : inStops(r))
      );
    });
  }, [filtersIntl, intlRaw]);

  const [sortIntl, setSortIntl] = useState<SortKey>("price_low");

  const rowsIntl = useMemo(() => {
    const cp = [...filteredIntl];
    const toMinIntl = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    cp.sort((a, b) => {
      if (sortIntl === "price_low")
        return (
          a.totalFareINR - b.totalFareINR ||
          a.outbound.durationMin + a.inbound.durationMin -
          (b.outbound.durationMin + b.inbound.durationMin)
        );
      if (sortIntl === "price_high")
        return (
          b.totalFareINR - a.totalFareINR ||
          a.outbound.durationMin + a.inbound.durationMin -
          (b.outbound.durationMin + b.inbound.durationMin)
        );
      if (sortIntl === "duration")
        return (
          a.outbound.durationMin +
          a.inbound.durationMin -
          (b.outbound.durationMin + b.inbound.durationMin)
        );
      if (sortIntl === "depart_early")
        return toMinIntl(a.outbound.departTime) - toMinIntl(b.outbound.departTime);
      if (sortIntl === "arrive_late")
        return toMinIntl(b.inbound.arriveTime) - toMinIntl(a.inbound.arriveTime);
      return 0;
    });
    return cp;
  }, [filteredIntl, sortIntl]);

  const metaIntlForPanel = useDatasetMetaIntlRT(
    rowsIntl.length ? rowsIntl : intlRaw
  );

  const [selectedIntl, setSelectedIntl] = useState<{
    flightId: string;
    fare: SpecialFare;
  } | null>(null);

  useEffect(() => {
    if (selectedIntl && !rowsIntl.some((r) => r.id === selectedIntl.flightId)) {
      setSelectedIntl(null);
    }
  }, [rowsIntl, selectedIntl]);

  const handleResetIntl = () => {
    setFiltersIntl({
      airlines: new Set<string>(),
      stops: "any",
      refundable: "any",
      payments: new Set<string>(),
      priceMin: metaIntlBase.minPrice,
      priceMax: Math.max(metaIntlBase.maxPrice, metaIntlBase.minPrice),
      nonstopOnly: false,
      hideNearby: false,
      fromAirports: new Set<string>(),
      toAirports: new Set<string>(),
      depSlots: new Set<TimeSlot>(),
      arrSlots: new Set<TimeSlot>(),
      applyTo: "both",
      fareView: "SINGLE",
    });
  };

  const [showCommissionIntl, setShowCommissionIntl] = useState(false);

  /* ========================== COMMON UI ========================== */
  const [drawer, setDrawer] = useState(false);
  const [showModify, setShowModify] = useState(false);

  const uniqueAirlines = useMemo(() => {
    if (isSpecialIntlRT) {
      const s = new Set<string>();
      rowsIntl.forEach((r) => s.add(r.airline));
      return s.size;
    }
    if (isRound) {
      const s = new Set<string>();
      [...rowsOutRT, ...rowsInRT].forEach((r) => s.add(r.airline));
      return s.size;
    }
    const s = new Set<string>();
    rowsOW.forEach((r) => s.add(r.airline));
    return s.size;
  }, [isSpecialIntlRT, isRound, rowsIntl, rowsOutRT, rowsInRT, rowsOW]);

  const sectorLabel = useMemo(() => {
    if (!fromIata || !toIata) return "";
    if (isSpecialIntlRT && rowsIntl[0]) {
      const first = rowsIntl[0];
      return `${first.outbound.fromCity} (${first.outbound.fromIata}) → ${first.outbound.toCity} (${first.outbound.toIata})`;
    }
    if (rowsOW[0]) {
      const r = rowsOW[0];
      return `${r.fromCity} (${r.fromIata}) → ${r.toCity} (${r.toIata})`;
    }
    if (rowsOutRT[0]) {
      const r = rowsOutRT[0];
      return `${r.fromCity} (${r.fromIata}) → ${r.toCity} (${r.toIata})`;
    }
    return `${fromIata} → ${toIata}`;
  }, [fromIata, toIata, isSpecialIntlRT, rowsIntl, rowsOW, rowsOutRT]);

  const departLbl = dateISO ? formatDateLabel(dateISO) : "";
  const returnLbl = retISO ? formatDateLabel(retISO) : "";
  const totalPaxLabel = `${pax} Traveller${pax > 1 ? "s" : ""}`;

  return (
    <div className="mx-auto">
      <div className="min-h-screen">
        {/* TOP STRIP (common) */}

        <motion.div
          className="mt-3 mb-3 sticky top-[110px] z-20 px-4 mx-auto max-w-7xl"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="border border-gray-200 bg-white rounded-2xl px-3 shadow-sm py-2  ">
            {/* Modify search bar overlay with transition */}
            <div
              className={`
      mb-4 origin-top 
      transition-all duration-300 ease-out 
      ${showModify
                  ? "max-h-[500px] opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
                }
    `}
            >
              <div className="rounded-xl">
                <FromToBar
                  onSearch={() => {
                    setShowModify(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            </div>

            {/* baaki tumhara pura bar same rakhte hain */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase text-gray-500">
                  {isSpecialIntlRT
                    ? "International Round Trip • Sector Details"
                    : isRound
                      ? "Round Trip • Sector Details"
                      : "Oneway • Sector Details"}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {sectorLabel && (
                    <span className="rounded-full bg-gray-900 px-3 py-1 text-[13px] font-semibold text-white">
                      {sectorLabel}
                    </span>
                  )}
                  {departLbl && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[12px] text-gray-700">
                      {departLbl}
                    </span>
                  )}
                  {isRound && returnLbl && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[12px] text-gray-700">
                      {returnLbl}
                    </span>
                  )}
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[12px] text-gray-700">
                    {totalPaxLabel}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[12px] text-gray-500">
                    {uniqueAirlines} Airlines
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs md:justify-end">
                {/* Intl RT agent commission toggle */}
                {isSpecialIntlRT && (
                  <button
                    type="button"
                    onClick={() => setShowCommissionIntl((v) => !v)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium ${showCommissionIntl
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-300 bg-white text-gray-700"
                      }`}
                  >
                    <span>Agent Commission</span>
                    <span
                      className={`flex h-4 w-8 items-center rounded-full px-[2px] transition ${showCommissionIntl ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                    >
                      <span
                        className={`h-3 w-3 transform rounded-full bg-white shadow transition ${showCommissionIntl ? "translate-x-4" : ""
                          }`}
                      />
                    </span>
                  </button>
                )}

                {/* Sort dropdown */}
                <div className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1.5">
                  <span className="text-[11px] text-gray-500">Sort:</span>
                  {!isRound ? (
                    <select
                      value={sortOW}
                      onChange={(e) => setSortOW(e.target.value as SortKey)}
                      className="bg-transparent text-[12px] text-gray-800 outline-none"
                    >
                      <option value="price_low">Price (Lowest)</option>
                      <option value="price_high">Price (Highest)</option>
                      <option value="duration">Duration (Shortest)</option>
                      <option value="depart_early">Earliest Departure</option>
                      <option value="arrive_late">Latest Arrival</option>
                    </select>
                  ) : !isSpecialIntlRT ? (
                    <select
                      value={sortRT}
                      onChange={(e) => setSortRT(e.target.value as SortKey)}
                      className="bg-transparent text-[12px] text-gray-800 outline-none"
                    >
                      <option value="price_low">Price (Lowest)</option>
                      <option value="price_high">Price (Highest)</option>
                      <option value="duration">Duration (Shortest)</option>
                      <option value="depart_early">Earliest Departure</option>
                      <option value="arrive_late">Latest Arrival</option>
                    </select>
                  ) : (
                    <select
                      value={sortIntl}
                      onChange={(e) => setSortIntl(e.target.value as SortKey)}
                      className="bg-transparent text-[12px] text-gray-800 outline-none"
                    >
                      <option value="price_low">Price (Lowest)</option>
                      <option value="price_high">Price (Highest)</option>
                      <option value="duration">Duration (Shortest)</option>
                      <option value="depart_early">Earliest Departure (Out)</option>
                      <option value="arrive_late">Latest Arrival (In)</option>
                    </select>
                  )}
                </div>

                {/* Modify Search trigger */}
                <button
                  type="button"
                  onClick={() => setShowModify((s) => !s)}
                  className="inline-flex items-center gap-1 rounded-full border border-blue-500 bg-white px-3 py-1.5 text-[12px] font-medium text-blue-600 hover:bg-blue-50"
                >
                  Modify Search
                </button>

                {/* mobile filter button */}
                <button
                  onClick={() => setDrawer(true)}
                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm md:hidden"
                >
                  Filters
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===== Layout: filters + results ===== */}
        <motion.div
          className="mx-auto max-w-7xl px-4"
          variants={layoutContainerVariants}
          initial="hidden"
          animate="visible"  // ⭐ scroll pe trigger
        >
          <motion.div
            className="grid grid-cols-12 gap-4"
            variants={layoutContainerVariants}
          >
            {/* Sidebar */}
            <motion.div
              className="col-span-12 hidden md:col-span-3 md:block"
              variants={sidebarVariants}
            >
              {!isRound ? (
                <FilterPanel
                  meta={metaOWForPanel}
                  f={{ ...fOW, applyTo: "out" }}
                  setF={(next) => {
                    const { applyTo: _omit, ...payload } =
                      next as unknown as BaseFilters & { applyTo: never };
                    setFOW(payload);
                  }}
                  onReset={() => {
                    setFOW(
                      makeDefaultFilters(
                        metaOW.minPrice,
                        Math.max(metaOW.maxPrice, metaOW.minPrice)
                      )
                    );
                  }}
                  showApplyTo={false}
                />
              ) : !isSpecialIntlRT ? (
                <FilterPanel
                  meta={metaForPanelRT}
                  f={activeForPanelRT}
                  setF={setFromPanelRT}
                  onReset={resetByApplyToRT}
                  showApplyTo
                />
              ) : (
                <FilterPanel
                  meta={metaIntlForPanel}
                  f={filtersIntl}
                  setF={setFiltersIntl}
                  onReset={handleResetIntl}
                  showApplyTo
                />
              )}
            </motion.div>

            {/* Results */}
            <motion.div
              className="col-span-12 md:col-span-9"
              variants={resultsVariants}
            >
              {!isRound ? (
                <OnewayResult
                  rows={rowsOW}
                  selectedGlobal={selOW}
                  onSelectFare={(rowId, fare) =>
                    setSelOW({ flightId: rowId, fare })
                  }
                  paxConfig={paxConfig}        // ✅ NOW DEFINED
                  showCommission
                  fareView={fOW.fareView}      // ✅ CORRECT STATE
                />
              ) : !isSpecialIntlRT ? (
                <RoundTripResultList
                  outboundRows={rowsOutRT}
                  returnRows={rowsInRT}
                  selectedOutbound={selOutRT}
                  selectedReturn={selInRT}
                  onSelectOutboundFare={(rowId, fare) =>
                    setSelOutRT({ flightId: rowId, fare })
                  }
                  onSelectReturnFare={(rowId, fare) =>
                    setSelInRT({ flightId: rowId, fare })
                  }
                  showCommission={false}
                />

              ) : (
                <SpecialRoundTripResult
                  rows={rowsIntl}
                  selectedGlobal={selectedIntl}
                  onSelectFare={(rowId, fare) =>
                    setSelectedIntl({ flightId: rowId, fare })
                  }
                  paxConfig={paxConfigIntl}
                  showCommission={showCommissionIntl}
                  onEmpty={
                    <span>
                      No special Intl RT fares found for{" "}
                      <b>
                        {fromIata} → {toIata}
                      </b>{" "}
                      on selected dates.
                    </span>
                  }
                />
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Mobile drawer */}
        {drawer && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawer(false)}
            />
            <motion.div
              className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-4 shadow-2xl"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {!isRound ? (
                <FilterPanel
                  meta={metaOWForPanel}
                  f={{ ...fOW, applyTo: "out" }}
                  setF={(next) => {
                    const { applyTo: _omit, ...payload } =
                      next as unknown as BaseFilters & { applyTo: never };
                    setFOW(payload);
                  }}
                  onReset={() => {
                    setFOW(
                      makeDefaultFilters(
                        metaOW.minPrice,
                        Math.max(metaOW.maxPrice, metaOW.minPrice)
                      )
                    );
                  }}
                  mobile
                  onClose={() => setDrawer(false)}
                  showApplyTo={false}
                />
              ) : !isSpecialIntlRT ? (
                <>
                  <FilterPanel
                    meta={metaForPanelRT}
                    f={activeForPanelRT}
                    setF={setFromPanelRT}
                    onReset={resetByApplyToRT}
                    mobile
                    onClose={() => setDrawer(false)}
                    showApplyTo
                  />
                  <button
                    onClick={() => setDrawer(false)}
                    className="mt-3 w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Apply Filters
                  </button>
                </>
              ) : (
                <>
                  <FilterPanel
                    meta={metaIntlForPanel}
                    f={filtersIntl}
                    setF={setFiltersIntl}
                    onReset={handleResetIntl}
                    mobile
                    onClose={() => setDrawer(false)}
                    showApplyTo
                  />
                  <button
                    onClick={() => setDrawer(false)}
                    className="mt-3 w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Apply Filters
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}