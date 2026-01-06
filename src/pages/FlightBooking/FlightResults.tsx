// src/pages/FlightResults.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import FromToBar from "../../pages/FlightBooking/flightsearch/FromToBar";

import { searchFlights, type FlightRow, type FlightFare } from "../../data/flights";

import FilterPanel, { type Filters } from "./flightlist/FiltersPanel";

import OnewayResult, {
  type Row as OW_Row,
  type FareOption as OW_Fare,
} from "./flightlist/OnewayResultList";

import RoundTripResultList, {
  type RowRT as RT_Row,
  type FareRT as RT_Fare,
} from "./flightlist/RoundTripResultList";

import SpecialRoundTripResult, {
  type SpecialRTRow,
  type FareOption as SpecialFare,
  type PaxConfig as SpecialPaxConfig,
  type LegSummary,
  type PolicyRule,
} from "./flightlist/SpecialRoundTripResult";

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
  const h = Number(String(hhmm ?? "00:00").split(":")[0]);
  if (!Number.isFinite(h)) return "0-6";
  if (h < 6) return "0-6";
  if (h < 12) return "6-12";
  if (h < 18) return "12-18";
  return "18-24";
};

const toMinSafe = (t?: string) => {
  const [h, m] = String(t ?? "00:00").split(":").map((x) => Number(x));
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : 0;
};

const toInt = (v: string | null | undefined, def: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : def;
};

type RouteFilter = { from?: string; to?: string; oneWay?: boolean; cabin?: string; pax?: number };

/* -------- refundable normalizers (unify to: Refundable / Non-Refundable) -------- */
function normalizeRefundable(v: unknown): "Refundable" | "Non-Refundable" {
  if (typeof v === "boolean") return v ? "Refundable" : "Non-Refundable";
  const s = String(v ?? "").toLowerCase().replace(/[-_]/g, " ").trim();
  return s.includes("non") ? "Non-Refundable" : "Refundable";
}
const normRefStr = (s: string) => s.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
const eqRefund = (rowVal: string, filterVal: "any" | "Refundable" | "Non-Refundable") =>
  filterVal === "any" || normRefStr(rowVal) === normRefStr(filterVal);

function clampPriceRange(prevMin: number, prevMax: number, nextMin: number, nextMax: number) {
  const lo = nextMin;
  const hi = Math.max(nextMax, nextMin);
  const min = Math.min(Math.max(prevMin, lo), hi);
  const max = Math.min(Math.max(prevMax, lo), hi);
  return { min, max: Math.max(max, min) };
}

const maxSafe = (vals: number[], fallback = 0) => (vals.length ? Math.max(...vals) : fallback);

/* ====== Layout animation variants ====== */
const layoutContainerVariants: any = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.12 },
  },
};

const sidebarVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const resultsVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* =============== ONEWAY ADAPTERS (strictly for OnewayResult) =============== */
function mapFareOW(f: FlightFare): OW_Fare {
  return {
    code: `${f.brand}-${f.cabin}-${f.rbd}`,
    label: f.brand,
    price: f.totalINR,
    refundable: f.refundable ? "Refundable" : "Non-Refundable",
    cabin: f.cabin,
    meal: f.meal ? "Free Meal" : "Paid Meal",
    baggage: { handKg: f.cabinBagKg, checkKg: f.baggageKg },
    seat: f.seatSelect ? "Preferred seat included" : "Seat selection (paid)",
    commissionINR: f.agentCommissionINR,
    agentFareINR: f.agentNetINR,
  };
}

function adaptRowsOW(rows: FlightRow[]): OW_Row[] {
  return rows.map((r) => {
    const departDateLbl = formatDateLabel(r.departDate);
    const arriveDateLbl = formatDateLabel(r.arriveDate);
    const fares = r.fares ?? [];
    const minFare = fares.length ? Math.min(...fares.map((f) => f.totalINR)) : 0;

    const carrier = r.flightNos.split(" ")[0];
    const flightNo = r.flightNos.split(" ").pop() || "";

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
          carrier,
          flightNo,
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
        refund: [{ when: "≥ 24h before departure", feeUSD: fares.some((f) => f.refundable) ? 0 : 200 }],
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
  const airlines = useMemo(() => Array.from(new Set(data.map((d) => d.airline))).sort(), [data]);
  const minPrice = useMemo(() => (data.length ? Math.min(...data.map((d) => d.totalFareINR)) : 0), [data]);
  const maxPrice = useMemo(() => (data.length ? Math.max(...data.map((d) => d.totalFareINR)) : 0), [data]);

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
function mapFareRT(f: FlightFare): RT_Fare {
  return {
    code: `${f.brand}-${f.cabin}-${f.rbd}`,
    label: f.brand,
    price: f.totalINR,
    refundable: f.refundable ? "Refundable" : "Non-Refundable",
    cabin: f.cabin,
    meal: f.meal ? "Free Meal" : "Paid Meal",
    badge: f.changeFeeINR === 0 ? { text: "Published", tone: "published" } : { text: "Offer Fare", tone: "offer" },
    baggage: { handKg: f.cabinBagKg, checkKg: f.baggageKg },
    seat: f.seatSelect ? "Preferred seat included" : "Seat selection (paid)",
    commissionINR: f.agentCommissionINR,
    agentFareINR: f.agentNetINR,
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
      refundable: normalizeRefundable(r.refundable),
      fares: fares.map(mapFareRT),
      baggage: {
        handKg: fares.length ? Math.max(...fares.map((f) => f.cabinBagKg ?? 0)) : 0,
        checkKg: fares.length ? Math.max(...fares.map((f) => f.baggageKg ?? 0)) : 0,
        piece: "1 piece only",
      },
      extras: r.extras ?? [],
      sector,
    };
  });
}

function useDatasetMetaRT(data: RT_Row[]) {
  const airlines = useMemo(() => Array.from(new Set(data.map((d) => d.airline))).sort(), [data]);
  const minPrice = useMemo(() => (data.length ? Math.min(...data.map((d) => d.totalFareINR)) : 0), [data]);
  const maxPrice = useMemo(() => (data.length ? Math.max(...data.map((d) => d.totalFareINR)) : 0), [data]);

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

  const carrier = r.flightNos.split(" ")[0];
  const flightNo = r.flightNos.split(" ").pop() || "";

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
        carrier,
        flightNo,
        durationMin: r.durationMin,
        layout: "3-3 Layout",
        beverage: true,
        seatType: "Standard Recliner",
        legroomInch: 30,
      },
    ],
    baggage: { handKg, checkKg, piece: "1 piece only" },
  };
};

const getMinFare = (fares?: FlightFare[]): number =>
  fares && fares.length ? Math.min(...fares.map((f) => f.totalINR)) : 0;

const buildRTFares = (out: FlightRow, back: FlightRow): { total: number; fares: SpecialFare[] } => {
  const outMin = getMinFare(out.fares);
  const inMin = getMinFare(back.fares);
  const baseRT = outMin + inMin;

  const specialPrice = Math.round(baseRT * 0.95);

  const outHand = (out.fares ?? []).map((f) => f.cabinBagKg ?? 0);
  const backHand = (back.fares ?? []).map((f) => f.cabinBagKg ?? 0);
  const outChk = (out.fares ?? []).map((f) => f.baggageKg ?? 0);
  const backChk = (back.fares ?? []).map((f) => f.baggageKg ?? 0);

  const saver: SpecialFare = {
    code: `${out.id}-${back.id}-RT-SAVER`,
    label: "Special Saver RT",
    price: specialPrice,
    refundable: "Refundable",
    cabin: out.fares?.[0]?.cabin ?? "Economy",
    meal: "Free Meal",
    baggage: {
      handKg: maxSafe([...outHand, ...backHand], 0),
      checkKg: maxSafe([...outChk, ...backChk], 0),
    },
    seat: "Standard seat selection",
    commissionINR: 1500,
    agentFareINR: specialPrice - 1500,
    perks: ["Special B2B round-trip fare"],
  };

  const flexPrice = Math.round(baseRT * 1.02);

  const flex: SpecialFare = {
    ...saver,
    code: `${out.id}-${back.id}-RT-FLEX`,
    label: "Special Flex RT",
    price: flexPrice,
    refundable: "Refundable",
    commissionINR: 2000,
    agentFareINR: flexPrice - 2000,
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
  change: [{ when: "Date/Time change (per sector)", feeUSD: 2000, note: "Fare difference applies" }],
  noShowUSD: 5000,
};

const buildSpecialRTRows = (
  fromIata: string,
  toIata: string,
  departDate: string,
  returnDate: string,
  cabin?: string
): SpecialRTRow[] => {
  // ✅ keep rules consistent with OW/RT
  const outbound = searchFlights({ fromIata, toIata, departDate, cabin });
  const inbound = searchFlights({ fromIata: toIata, toIata: fromIata, departDate: returnDate, cabin });

  const rows: SpecialRTRow[] = [];
  outbound.forEach((out) => {
    inbound.forEach((back) => {
      const { total, fares } = buildRTFares(out, back);

      rows.push({
        id: `${out.id}__${back.id}`,
        airline: out.airline,
        logo: out.logo,
        refundable:
          normalizeRefundable(out.refundable) === "Refundable" && normalizeRefundable(back.refundable) === "Refundable"
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

function useDatasetMetaIntlRT(data: SpecialRTRow[]) {
  const airlines = useMemo(() => Array.from(new Set(data.map((d) => d.airline))).sort(), [data]);
  const minPrice = useMemo(() => (data.length ? Math.min(...data.map((d) => d.totalFareINR)) : 0), [data]);
  const maxPrice = useMemo(() => (data.length ? Math.max(...data.map((d) => d.totalFareINR)) : 0), [data]);

  const airlineMinPrice = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach((r) => (m[r.airline] = Math.min(m[r.airline] ?? Infinity, r.totalFareINR)));
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

const getStopsValueIntl = (r: SpecialRTRow): number => {
  const isNonstop = (label?: string) => !label || label.toLowerCase().includes("non-stop");
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

/* =============================== MAIN =============================== */

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

  const adt = toInt(qp.get("adt") ?? qp.get("adults"), 1);
  const chd = toInt(qp.get("chd") ?? qp.get("children"), 0);
  const inf = toInt(qp.get("inf") ?? qp.get("infants"), 0);

  const paxCalc = [adt, chd, inf].reduce((sum, v) => (Number.isFinite(v) && v > 0 ? sum + v : sum), 0);
  const pax = paxCalc || 1;

  const isRound = tripRaw === "roundtrip" || (!!retISO && retISO !== "");
  const isInternational = sector === "intl";
  const isIntlRoundTrip = isRound && isInternational;
  const isSpecialIntlRT = isIntlRoundTrip && isSpecialFare;

  const paxConfigIntl: SpecialPaxConfig = useMemo(
    () => ({
      adults: adt || 1,
      children: chd || 0,
      infants: inf || 0,
    }),
    [adt, chd, inf]
  );

  // keys (used for safe resets on new search)
  const owKey = `${fromIata}|${toIata}|${String(dateISO).slice(0, 10)}|${String(cabin)}|OW`;
  const rtKey = `${fromIata}|${toIata}|${String(dateISO).slice(0, 10)}|${String(retISO).slice(0, 10)}|${String(cabin)}|RT`;
  const intlKey = `${fromIata}|${toIata}|${String(dateISO).slice(0, 10)}|${String(retISO).slice(0, 10)}|${String(cabin)}|INTL|${isSpecialIntlRT ? "S" : "N"}`;

  /* === RAW datasets === */
  const rawOutbound = useMemo(() => {
    if (!fromIata || !toIata) return [];
    return searchFlights({ fromIata, toIata, departDate: dateISO, cabin });
  }, [fromIata, toIata, dateISO, cabin]);

  const rawReturn = useMemo(() => {
    if (!isRound || !fromIata || !toIata) return [];
    return searchFlights({ fromIata: toIata, toIata: fromIata, departDate: retISO, cabin });
  }, [isRound, fromIata, toIata, retISO, cabin]);

  const intlRaw: SpecialRTRow[] = useMemo(() => {
    if (!isSpecialIntlRT || !fromIata || !toIata || !dateISO || !retISO) return [];
    return buildSpecialRTRows(fromIata, toIata, String(dateISO).slice(0, 10), String(retISO).slice(0, 10), cabin);
  }, [isSpecialIntlRT, fromIata, toIata, dateISO, retISO, cabin]);

  /* ========================== ONEWAY PIPE ========================== */
  const OW_DATA: OW_Row[] = useMemo(() => adaptRowsOW(rawOutbound), [rawOutbound]);
  const metaOW = useDatasetMetaOW(OW_DATA);

  const [fOW, setFOW] = useState<BaseFilters>(() => makeDefaultFilters(metaOW.minPrice, Math.max(metaOW.maxPrice, metaOW.minPrice)));

  // dataset change -> reset filters + selection safely
  useEffect(() => {
    setFOW(makeDefaultFilters(metaOW.minPrice, Math.max(metaOW.maxPrice, metaOW.minPrice)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owKey]);

  // min/max change -> clamp (don't overwrite user choices)
  useEffect(() => {
    setFOW((f) => {
      const { min, max } = clampPriceRange(f.priceMin, f.priceMax, metaOW.minPrice, metaOW.maxPrice);
      return { ...f, priceMin: min, priceMax: max };
    });
  }, [metaOW.minPrice, metaOW.maxPrice]);

  const routeOW: RouteFilter = useMemo(
    () => ({ from: fromIata || undefined, to: toIata || undefined, oneWay: true, cabin: cabin || undefined, pax: pax || 1 }),
    [fromIata, toIata, cabin, pax]
  );

  const applyOW = useCallback(
    (rows: OW_Row[]) =>
      rows.filter((r) => {
        const inAirline = fOW.airlines.size === 0 || fOW.airlines.has(r.airline);
        const inStops = fOW.stops === "any" || r.stops === fOW.stops;
        const inRefund = eqRefund(r.refundable, fOW.refundable);

        const paySet = fOW.payments;
        const inPayments = paySet.size === 0 || (r.extras ?? []).some((x) => paySet.has(x));

        const inPrice = r.totalFareINR >= fOW.priceMin && r.totalFareINR <= fOW.priceMax;
        const inFrom = fOW.fromAirports.size === 0 || fOW.fromAirports.has(r.fromIata.toUpperCase());
        const inTo = fOW.toAirports.size === 0 || fOW.toAirports.has(r.toIata.toUpperCase());
        const inDepSlot = fOW.depSlots.size === 0 || fOW.depSlots.has(timeOfDay(r.departTime));
        const inArrSlot = fOW.arrSlots.size === 0 || fOW.arrSlots.has(timeOfDay(r.arriveTime));

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
      }),
    [fOW, routeOW]
  );

  const [sortOW, setSortOW] = useState<SortKey>("price_low");

  const sortRowsOW = useCallback(
    (rows: OW_Row[]) => {
      const cp = [...rows];
      cp.sort((a, b) => {
        if (sortOW === "price_low") return a.totalFareINR - b.totalFareINR || a.durationMin - b.durationMin;
        if (sortOW === "price_high") return b.totalFareINR - a.totalFareINR || a.durationMin - b.durationMin;
        if (sortOW === "duration") return a.durationMin - b.durationMin || a.totalFareINR - b.totalFareINR;
        if (sortOW === "depart_early") return toMinSafe(a.departTime) - toMinSafe(b.departTime);
        if (sortOW === "arrive_late") return toMinSafe(b.arriveTime) - toMinSafe(a.arriveTime);
        return 0;
      });
      return cp;
    },
    [sortOW]
  );

  const rowsOW = useMemo(() => sortRowsOW(applyOW(OW_DATA)), [OW_DATA, applyOW, sortRowsOW]);

  const panelOWRows = rowsOW.length ? rowsOW : OW_DATA;
  const metaOWForPanel = useDatasetMetaOW(panelOWRows);

  const [selOW, setSelOW] = useState<{ flightId: string; fare: OW_Fare } | null>(null);
  useEffect(() => {
    // new dataset -> clear selection
    setSelOW(null);
  }, [owKey]);

  useEffect(() => {
    if (selOW && !rowsOW.some((r) => r.id === selOW.flightId)) setSelOW(null);
  }, [rowsOW, selOW]);

  /* ========================== ROUND DOMESTIC PIPE ========================== */
  const RT_OUT = useMemo(() => adaptRowsRT(rawOutbound, "DOM"), [rawOutbound]);
  const RT_IN = useMemo(() => adaptRowsRT(rawReturn, "DOM"), [rawReturn]);
  const metaRTAll = useDatasetMetaRT([...RT_OUT, ...RT_IN]);

  const [applyTo, setApplyTo] = useState<"both" | "out" | "in">("both");
  const [fOut, setFOut] = useState<BaseFilters>(() => makeDefaultFilters(metaRTAll.minPrice, Math.max(metaRTAll.maxPrice, metaRTAll.minPrice)));
  const [fIn, setFIn] = useState<BaseFilters>(() => makeDefaultFilters(metaRTAll.minPrice, Math.max(metaRTAll.maxPrice, metaRTAll.minPrice)));

  useEffect(() => {
    // dataset change -> reset
    const base = makeDefaultFilters(metaRTAll.minPrice, Math.max(metaRTAll.maxPrice, metaRTAll.minPrice));
    setApplyTo("both");
    setFOut(base);
    setFIn(base);
  }, [rtKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // clamp, do not override
    const nextMin = metaRTAll.minPrice;
    const nextMax = metaRTAll.maxPrice;

    setFOut((f) => {
      const { min, max } = clampPriceRange(f.priceMin, f.priceMax, nextMin, nextMax);
      return { ...f, priceMin: min, priceMax: max };
    });
    setFIn((f) => {
      const { min, max } = clampPriceRange(f.priceMin, f.priceMax, nextMin, nextMax);
      return { ...f, priceMin: min, priceMax: max };
    });
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

  const applyOneRT = useCallback((rows: RT_Row[], f: BaseFilters) => {
    const paySet = f.payments;

    return rows.filter((r) => {
      const inAirline = f.airlines.size === 0 || f.airlines.has(r.airline);
      const inStops = f.stops === "any" || r.stops === f.stops;
      const inRefund = eqRefund(r.refundable, f.refundable);
      const inPayments = paySet.size === 0 || (r.extras ?? []).some((x) => paySet.has(x));
      const inPrice = r.totalFareINR >= f.priceMin && r.totalFareINR <= f.priceMax;
      const inFrom = f.fromAirports.size === 0 || f.fromAirports.has(r.fromIata.toUpperCase());
      const inTo = f.toAirports.size === 0 || f.toAirports.has(r.toIata.toUpperCase());
      const inDepSlot = f.depSlots.size === 0 || f.depSlots.has(timeOfDay(r.departTime));
      const inArrSlot = f.arrSlots.size === 0 || f.arrSlots.has(timeOfDay(r.arriveTime));
      return inAirline && (f.nonstopOnly ? r.stops === 0 : inStops) && inRefund && inPayments && inPrice && inFrom && inTo && inDepSlot && inArrSlot;
    });
  }, []);

  const [sortRT, setSortRT] = useState<SortKey>("price_low");

  const sortRowsRT = useCallback(
    (rows: RT_Row[]) => {
      const cp = [...rows];
      cp.sort((a, b) => {
        if (sortRT === "price_low") return a.totalFareINR - b.totalFareINR || a.durationMin - b.durationMin;
        if (sortRT === "price_high") return b.totalFareINR - a.totalFareINR || a.durationMin - b.durationMin;
        if (sortRT === "duration") return a.durationMin - b.durationMin || a.totalFareINR - b.totalFareINR;
        if (sortRT === "depart_early") return toMinSafe(a.departTime) - toMinSafe(b.departTime);
        if (sortRT === "arrive_late") return toMinSafe(b.arriveTime) - toMinSafe(a.arriveTime);
        return 0;
      });
      return cp;
    },
    [sortRT]
  );

  const rowsOutRT = useMemo(() => sortRowsRT(applyOneRT(RT_OUT, fOut)), [RT_OUT, fOut, sortRowsRT, applyOneRT]);
  const rowsInRT = useMemo(() => sortRowsRT(applyOneRT(RT_IN, fIn)), [RT_IN, fIn, sortRowsRT, applyOneRT]);

  const panelRTRows =
    (applyTo === "out" ? rowsOutRT : applyTo === "in" ? rowsInRT : [...rowsOutRT, ...rowsInRT]).length
      ? applyTo === "out"
        ? rowsOutRT
        : applyTo === "in"
          ? rowsInRT
          : [...rowsOutRT, ...rowsInRT]
      : [...RT_OUT, ...RT_IN];

  const metaForPanelRT = useDatasetMetaRT(panelRTRows);

  const [selOutRT, setSelOutRT] = useState<{ flightId: string; fare: RT_Fare } | null>(null);
  const [selInRT, setSelInRT] = useState<{ flightId: string; fare: RT_Fare } | null>(null);

  useEffect(() => {
    // dataset change -> clear selection
    setSelOutRT(null);
    setSelInRT(null);
  }, [rtKey]);

  useEffect(() => {
    if (selOutRT && !rowsOutRT.some((r) => r.id === selOutRT.flightId)) setSelOutRT(null);
  }, [rowsOutRT, selOutRT]);

  useEffect(() => {
    if (selInRT && !rowsInRT.some((r) => r.id === selInRT.flightId)) setSelInRT(null);
  }, [rowsInRT, selInRT]);

  const resetByApplyToRT = () => {
    const base = makeDefaultFilters(metaRTAll.minPrice, Math.max(metaRTAll.maxPrice, metaRTAll.minPrice));
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
    // dataset change -> reset
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intlKey]);

  useEffect(() => {
    // clamp, do not override
    setFiltersIntl((f) => {
      const { min, max } = clampPriceRange(f.priceMin, f.priceMax, metaIntlBase.minPrice, metaIntlBase.maxPrice);
      return { ...f, priceMin: min, priceMax: max };
    });
  }, [metaIntlBase.minPrice, metaIntlBase.maxPrice]);

  const filteredIntl = useMemo(() => {
    const f = filtersIntl;

    const inAirline = (a: string) => f.airlines.size === 0 || f.airlines.has(a);

    const inStops = (row: SpecialRTRow) => {
      if (f.stops === "any") return true;
      const s = getStopsValueIntl(row);
      return s === f.stops;
    };

    const inRefund = (r: SpecialRTRow) => f.refundable === "any" || r.refundable === f.refundable;

    const paySet = f.payments;
    const inPayments = (r: SpecialRTRow) => paySet.size === 0 || (r.extras ?? []).some((x) => paySet.has(x));

    const inPrice = (r: SpecialRTRow) => r.totalFareINR >= f.priceMin && r.totalFareINR <= f.priceMax;

    const inFrom = (r: SpecialRTRow) => {
      if (f.fromAirports.size === 0) return true;
      const froms = [r.outbound.fromIata.toUpperCase(), r.inbound.fromIata.toUpperCase()];
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
    cp.sort((a, b) => {
      const aDur = a.outbound.durationMin + a.inbound.durationMin;
      const bDur = b.outbound.durationMin + b.inbound.durationMin;

      if (sortIntl === "price_low") return a.totalFareINR - b.totalFareINR || aDur - bDur;
      if (sortIntl === "price_high") return b.totalFareINR - a.totalFareINR || aDur - bDur;
      if (sortIntl === "duration") return aDur - bDur;
      if (sortIntl === "depart_early") return toMinSafe(a.outbound.departTime) - toMinSafe(b.outbound.departTime);
      if (sortIntl === "arrive_late") return toMinSafe(b.inbound.arriveTime) - toMinSafe(a.inbound.arriveTime);
      return 0;
    });
    return cp;
  }, [filteredIntl, sortIntl]);

  const panelIntlRows = rowsIntl.length ? rowsIntl : intlRaw;
  const metaIntlForPanel = useDatasetMetaIntlRT(panelIntlRows);

  const [selectedIntl, setSelectedIntl] = useState<{ flightId: string; fare: SpecialFare } | null>(null);

  useEffect(() => {
    // dataset change -> clear selection
    setSelectedIntl(null);
  }, [intlKey]);

  useEffect(() => {
    if (selectedIntl && !rowsIntl.some((r) => r.id === selectedIntl.flightId)) setSelectedIntl(null);
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

  const [showCommission, setShowCommission] = useState(false);

  /* ========================== COMMON UI ========================== */
  const [drawer, setDrawer] = useState(false);
  const [showModify, setShowModify] = useState(false);

  const uniqueAirlines = useMemo(() => {
    if (isSpecialIntlRT) return new Set(rowsIntl.map((r) => r.airline)).size;
    if (isRound) return new Set([...rowsOutRT, ...rowsInRT].map((r) => r.airline)).size;
    return new Set(rowsOW.map((r) => r.airline)).size;
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

  const nfIN = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

  // theme-based overlay (no static black)
  const overlayBg = "color-mix(in srgb, var(--text) 38%, transparent)";

  // (left as-is, in case you use share later)
  const baseUrl = window.location.origin;
  const buildDeepLink = (extra: Record<string, string>) => {
    const next = new URLSearchParams(qp.toString());
    Object.entries(extra).forEach(([k, v]) => next.set(k, v));
    return `${baseUrl}/flight-results?${next.toString()}`;
  };

  const buildHeaderSharePayload = () => {
    const msg = [
      "✈️ Flight Search",
      `Route: ${sectorLabel}`,
      departLbl ? `Depart: ${departLbl}` : "",
      isRound && returnLbl ? `Return: ${returnLbl}` : "",
      `Pax: ${totalPaxLabel}`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      title: "Flight Search",
      text: msg,
      url: `${baseUrl}/flight-results?${qp.toString()}`,
    };
  };

  type ShareLeg = {
    airline: string;
    flightNos: string;
    fromIata: string;
    toIata: string;
    departDate?: string;
    departTime: string;
    arriveTime: string;
    stops?: number;
    refundable?: string;
    fareLabel?: string;
    price?: number;
  };

  function buildShareText({
    isRound,
    out,
    inn,
    bookingUrl,
  }: {
    isRound: boolean;
    out?: ShareLeg;
    inn?: ShareLeg;
    bookingUrl?: string;
  }) {
    const lines: string[] = [];

    lines.push("✈️ Flight Option");

    if (out) {
      lines.push(
        `\nOutbound: ${out.fromIata} → ${out.toIata} (${out.departDate ?? ""})`,
        `${out.airline} ${out.flightNos}`,
        `Time: ${out.departTime} - ${out.arriveTime} | Stops: ${out.stops ?? 0}`,
        `Fare: ${out.fareLabel ?? "-"} | ${out.refundable ?? "-"}`,
        out.price != null ? `Price: ${nfIN.format(out.price)}` : ""
      );
    }

    if (isRound && inn) {
      lines.push(
        `\nReturn: ${inn.fromIata} → ${inn.toIata} (${inn.departDate ?? ""})`,
        `${inn.airline} ${inn.flightNos}`,
        `Time: ${inn.departTime} - ${inn.arriveTime} | Stops: ${inn.stops ?? 0}`,
        `Fare: ${inn.fareLabel ?? "-"} | ${inn.refundable ?? "-"}`,
        inn.price != null ? `Price: ${nfIN.format(inn.price)}` : ""
      );
    }

    if (bookingUrl) {
      lines.push(`\n🔗 Link: ${bookingUrl}`);
    }

    return lines.filter(Boolean).join("\n");
  }

  function shareOnWhatsApp(text: string) {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function shareOnEmail(text: string) {
    const subject = "Flight Option";
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = mailto;
  }

  return (
    <div className="mx-auto">
      <div className="min-h-screen">
        <motion.div
          className="mt-3 mb-3 md:sticky md:top-[60px] z-20 px-4 mx-auto max-w-7xl"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Header Card */}
          <div
            className="
              rounded-md px-3 py-2 shadow-sm
              border border-[var(--border)]
              bg-[var(--surface)]
            "
          >
            <div
              className={[
                "mb-4 origin-top transition-all duration-300 ease-out",
                showModify ? "max-h-[500px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2 pointer-events-none",
              ].join(" ")}
            >
              <div className="rounded-md">
                <FromToBar
                  onSearch={() => {
                    setShowModify(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase text-[var(--muted)]">
                  {isSpecialIntlRT ? "International Round Trip • Sector Details" : isRound ? "Round Trip • Sector Details" : "Oneway • Sector Details"}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {sectorLabel && (
                    <span className="rounded-full bg-[var(--text)] px-3 py-1 text-[13px] font-semibold text-[var(--surface)]">
                      {sectorLabel}
                    </span>
                  )}

                  {departLbl && (
                    <span className="rounded-full bg-[var(--surface2)] px-2.5 py-1 text-[12px] text-[var(--text)] border border-[var(--border)]">
                      {departLbl}
                    </span>
                  )}

                  {isRound && returnLbl && (
                    <span className="rounded-full bg-[var(--surface2)] px-2.5 py-1 text-[12px] text-[var(--text)] border border-[var(--border)]">
                      {returnLbl}
                    </span>
                  )}

                  <span className="rounded-full bg-[var(--surface2)] px-2.5 py-1 text-[12px] text-[var(--text)] border border-[var(--border)]">
                    {totalPaxLabel}
                  </span>

                  <span className="rounded-full bg-[var(--surface2)] px-2.5 py-1 text-[12px] text-[var(--muted)] border border-[var(--border)]">
                    {uniqueAirlines} Airlines
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs md:justify-end">
                {/* Commission Toggle */}
                <button
                  type="button"
                  onClick={() => setShowCommission((v) => !v)}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium transition",
                    showCommission
                      ? "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]",
                  ].join(" ")}
                >
                  <span>{showCommission ? "Net Fare" : "Commission"}</span>

                  <span
                    className={[
                      "flex h-4 w-8 items-center rounded-full px-[2px] transition",
                      showCommission ? "bg-[var(--success)]" : "bg-[var(--border)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-3 w-3 transform rounded-full bg-[var(--surface)] shadow transition",
                        showCommission ? "translate-x-4" : "",
                      ].join(" ")}
                    />
                  </span>
                </button>

                {/* Sort */}
                <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5">
                  <span className="text-[11px] text-[var(--muted)]">Sort:</span>

                  {!isRound ? (
                    <select
                      value={sortOW}
                      onChange={(e) => setSortOW(e.target.value as SortKey)}
                      className="bg-transparent text-[12px] text-[var(--text)] outline-none"
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
                      className="bg-transparent text-[12px] text-[var(--text)] outline-none"
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
                      className="bg-transparent text-[12px] text-[var(--text)] outline-none"
                    >
                      <option value="price_low">Price (Lowest)</option>
                      <option value="price_high">Price (Highest)</option>
                      <option value="duration">Duration (Shortest)</option>
                      <option value="depart_early">Earliest Departure (Out)</option>
                      <option value="arrive_late">Latest Arrival (In)</option>
                    </select>
                  )}
                </div>

                {/* Modify Search */}
                <button
                  type="button"
                  onClick={() => setShowModify((s) => !s)}
                  className="
                    inline-flex items-center gap-1 rounded-full border px-3 py-1.5
                    text-[12px] font-medium transition
                    border-[var(--primary)]
                    bg-[var(--surface)]
                    text-[var(--primary)]
                    hover:bg-[var(--primarySoft)]
                  "
                >
                  Modify Search
                </button>

                {/* Filters (mobile) */}
                <button
                  onClick={() => setDrawer(true)}
                  className="
                    rounded-md border border-[var(--border)] bg-[var(--surface)]
                    px-2.5 py-1.5 text-sm shadow-sm md:hidden
                    text-[var(--text)] hover:bg-[var(--surface2)] transition
                  "
                >
                  Filters
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="mx-auto max-w-7xl px-4" variants={layoutContainerVariants} initial="hidden" animate="visible">
          <motion.div className="grid grid-cols-12 gap-4" variants={layoutContainerVariants}>
            <motion.div className="col-span-12 hidden md:col-span-3 md:block" variants={sidebarVariants}>
              {!isRound ? (
                <FilterPanel
                  meta={metaOWForPanel}
                  f={{ ...fOW, applyTo: "out" }}
                  setF={(next) => {
                    const { applyTo: _omit, ...payload } = next as unknown as BaseFilters & { applyTo: never };
                    setFOW(payload);
                  }}
                  onReset={() => setFOW(makeDefaultFilters(metaOW.minPrice, Math.max(metaOW.maxPrice, metaOW.minPrice)))}
                  showApplyTo={false}
                />
              ) : !isSpecialIntlRT ? (
                <FilterPanel meta={metaForPanelRT} f={activeForPanelRT} setF={setFromPanelRT} onReset={resetByApplyToRT} showApplyTo />
              ) : (
                <FilterPanel meta={metaIntlForPanel} f={filtersIntl} setF={setFiltersIntl} onReset={handleResetIntl} showApplyTo />
              )}
            </motion.div>

            <motion.div className="col-span-12 md:col-span-9" variants={resultsVariants}>
              {!isRound ? (
                <OnewayResult
                  rows={rowsOW}
                  selectedGlobal={selOW}
                  onSelectFare={(rowId, fare) => setSelOW({ flightId: rowId, fare })}
                  paxConfig={{ adults: adt || 1, children: chd || 0, infants: inf || 0 }}
                  showCommission={showCommission}
                  fareView={fOW.fareView}
                />
              ) : !isSpecialIntlRT ? (
                <RoundTripResultList
                  outboundRows={rowsOutRT}
                  returnRows={rowsInRT}
                  selectedOutbound={selOutRT}
                  selectedReturn={selInRT}
                  onSelectOutboundFare={(rowId, fare) => setSelOutRT({ flightId: rowId, fare })}
                  onSelectReturnFare={(rowId, fare) => setSelInRT({ flightId: rowId, fare })}
                  showCommission={showCommission}
                  paxConfig={{ adults: adt || 1, children: chd || 0, infants: inf || 0 }}
                  fareView={activeForPanelRT.fareView}
                />
              ) : (
                <SpecialRoundTripResult
                  rows={rowsIntl}
                  selectedGlobal={selectedIntl}
                  onSelectFare={(rowId, fare) => setSelectedIntl({ flightId: rowId, fare })}
                  paxConfig={paxConfigIntl}
                  showCommission={showCommission}
                  onEmpty={
                    <span>
                      No special Intl RT fares found for <b>{fromIata} → {toIata}</b> on selected dates.
                    </span>
                  }
                />
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Mobile Drawer */}
        {drawer && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0"
              style={{ background: overlayBg }}
              onClick={() => setDrawer(false)}
            />

            <motion.div
              className="
                absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto
                bg-[var(--surface)] p-4 shadow-2xl
                border-l border-[var(--border)]
              "
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {!isRound ? (
                <FilterPanel
                  meta={metaOWForPanel}
                  f={{ ...fOW, applyTo: "out" }}
                  setF={(next) => {
                    const { applyTo: _omit, ...payload } = next as unknown as BaseFilters & { applyTo: never };
                    setFOW(payload);
                  }}
                  onReset={() => setFOW(makeDefaultFilters(metaOW.minPrice, Math.max(metaOW.maxPrice, metaOW.minPrice)))}
                  mobile
                  onClose={() => setDrawer(false)}
                  showApplyTo={false}
                />
              ) : !isSpecialIntlRT ? (
                <>
                  <FilterPanel meta={metaForPanelRT} f={activeForPanelRT} setF={setFromPanelRT} onReset={resetByApplyToRT} mobile onClose={() => setDrawer(false)} showApplyTo />
                  <button
                    onClick={() => setDrawer(false)}
                    className="
                      mt-3 w-full rounded-md px-3 py-2 text-sm font-semibold transition
                      bg-[var(--primary)] text-[var(--surface)]
                      hover:bg-[var(--primaryHover)]
                    "
                  >
                    Apply Filters
                  </button>
                </>
              ) : (
                <>
                  <FilterPanel meta={metaIntlForPanel} f={filtersIntl} setF={setFiltersIntl} onReset={handleResetIntl} mobile onClose={() => setDrawer(false)} showApplyTo />
                  <button
                    onClick={() => setDrawer(false)}
                    className="
                      mt-3 w-full rounded-md px-3 py-2 text-sm font-semibold transition
                      bg-[var(--primary)] text-[var(--surface)]
                      hover:bg-[var(--primaryHover)]
                    "
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
