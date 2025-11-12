// src/pages/FlightResults.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import FromToBar from "../components/flightsearch/FromToBar";

import { searchFlights, type FlightRow, type FlightFare } from "../data/flights";

import FilterPanel, { type Filters } from "../components/flightlist/FiltersPanel";
import OnewayResult, {
  type Row as OW_Row,
  type FareOption as OW_Fare,
} from "../components/flightlist/OnewayResult";
import RoundTripResultList, {
  type RowRT as RT_Row,
  type FareRT as RT_Fare,
} from "../components/flightlist/RoundTripResultList";

/* =============== small utils =============== */
type TimeSlot = "0-6" | "6-12" | "12-18" | "18-24";
type SortKey = "price_low" | "price_high" | "duration" | "depart_early" | "arrive_late";

const formatDateLabel = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.toLocaleString("en-GB", { day: "2-digit" });
  const mon = d.toLocaleString("en-GB", { month: "short" });
  const wk  = d.toLocaleString("en-GB", { weekday: "short" });
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

/* =============== ONEWAY ADAPTERS (strictly for OnewayResult) =============== */
function mapFareOW(f: FlightFare): OW_Fare {
  return {
    code: `${f.brand}-${f.cabin}-${f.rbd}`,
    label: f.brand,
    price: f.totalINR,
    refundable: f.refundable ? "Refundable" : "Non Refundable",
    cabin: f.cabin,
    meal: f.meal ? "Free Meal" : "Paid Meal",
    badge: f.changeFeeINR === 0 ? { text: "Published", tone: "published" } : { text: "Offer Fare", tone: "offer" },
    baggage: { handKg: f.cabinBagKg, checkKg: f.baggageKg },
    seat: f.seatSelect ? "Preferred seat included" : "Seat selection (paid)",
  };
}
function adaptRowsOW(rows: FlightRow[]): OW_Row[] {
  return rows.map((r) => {
    const departDateLbl = formatDateLabel(r.departDate);
    const arriveDateLbl = formatDateLabel(r.arriveDate);
    const fares = r.fares ?? [];
    const minFare = fares.length ? Math.min(...fares.map(f => f.totalINR)) : 0;

    return {
      id: r.id,
      airline: r.airline,
      logo: r.logo,
      flightNos: r.flightNos,
      fromCity: r.fromCity, fromIata: r.fromIata,
      toCity: r.toCity,     toIata: r.toIata,
      departTime: r.departTime, departDate: departDateLbl,
      arriveTime: r.arriveTime, arriveDate: arriveDateLbl,
      stops: r.stops, stopLabel: r.stopLabel, durationMin: r.durationMin,
      totalFareINR: minFare,
      commissionUSD: 0, agentFareUSD: 0, // OnewayRow expects these
      refundable: normalizeRefundable(r.refundable), // ✅ always "Refundable" | "Non Refundable"
      extras: r.extras ?? [],
      segments: [{
        fromCity: r.fromCity, fromIata: r.fromIata, departTime: r.departTime, departDate: departDateLbl,
        toCity: r.toCity,     toIata: r.toIata,     arriveTime: r.arriveTime, arriveDate: arriveDateLbl,
        carrier: r.flightNos.split(" ")[0], flightNo: r.flightNos.split(" ").pop() || "",
        durationMin: r.durationMin, layout: "3-3 Layout", beverage: true, seatType: "Standard Recliner", legroomInch: 29,
      }],
      baggage: {
        handKg: fares.length ? Math.max(...fares.map(f=>f.cabinBagKg ?? 0)) : 0,
        checkKg: fares.length ? Math.max(...fares.map(f=>f.baggageKg ?? 0)) : 0,
        piece: "1 piece only",
      },
      cancellation: {
        refund: [{ when: "≥ 24h before departure", feeUSD: fares.some(f=>f.refundable) ? 0 : 200 }],
        change: [{ when: "Date/Time change (per pax)", feeUSD: fares.some(f=>f.changeFeeINR===0) ? 0 : 150, note: "Fare diff applies" }],
        noShowUSD: 250,
      },
      fares: fares.map(mapFareOW),
    };
  });
}

function useDatasetMetaOW(data: OW_Row[]) {
  const airlines = useMemo(() => Array.from(new Set(data.map(d => d.airline))).sort(), [data]);
  const minPrice = useMemo(() => data.length ? Math.min(...data.map(d => d.totalFareINR)) : 0, [data]);
  const maxPrice = useMemo(() => data.length ? Math.max(...data.map(d => d.totalFareINR)) : 0, [data]);
  const airlineMinPrice = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach(r => { m[r.airline] = Math.min(m[r.airline] ?? Infinity, r.totalFareINR); });
    return m;
  }, [data]);
  const departAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(r => map.set(r.fromIata, `${r.fromCity} (${r.fromIata})`));
    return Array.from(map.entries()).map(([code, label]) => ({ code, label })).sort((a,b)=>a.code.localeCompare(b.code));
  }, [data]);
  const arriveAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(r => map.set(r.toIata, `${r.toCity} (${r.toIata})`));
    return Array.from(map.entries()).map(([code, label]) => ({ code, label })).sort((a,b)=>a.code.localeCompare(b.code));
  }, [data]);
  return { airlines, minPrice, maxPrice, airlineMinPrice, departAirports, arriveAirports };
}

/* =============== ROUND-TRIP ADAPTERS (strictly for RoundTripResultList) =============== */
// keep one normalizer so both places stay consistent
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
    refundable: normalizeRefundableRT(f.refundable), // ✅ space, not hyphen
    cabin: f.cabin,
    meal: f.meal ? "Free Meal" : "Paid Meal",
    badge: f.changeFeeINR === 0
      ? { text: "Published", tone: "published" }
      : { text: "Offer Fare", tone: "offer" },
    baggage: { handKg: f.cabinBagKg, checkKg: f.baggageKg },
    seat: f.seatSelect ? "Preferred seat included" : "Seat selection (paid)",
  };
}

function adaptRowsRT(rows: FlightRow[]): RT_Row[] {
  return rows.map((r) => {
    const departDateLbl = formatDateLabel(r.departDate);
    const arriveDateLbl = formatDateLabel(r.arriveDate);
    const fares = r.fares ?? [];
    const minFare = fares.length ? Math.min(...fares.map(f => f.totalINR)) : 0;

    return {
      id: r.id,
      airline: r.airline,
      logo: r.logo,
      flightNos: r.flightNos,
      fromCity: r.fromCity, fromIata: r.fromIata,
      toCity: r.toCity,     toIata: r.toIata,
      departTime: r.departTime, departDate: departDateLbl,
      arriveTime: r.arriveTime, arriveDate: arriveDateLbl,
      stops: r.stops, stopLabel: r.stopLabel, durationMin: r.durationMin,
      totalFareINR: minFare,
      refundable: normalizeRefundableRT(r.refundable), // ✅ consistent string
      extras: r.extras ?? [],
      segments: [], // keep or map actual segments if you have them
      baggage: {
        handKg: fares.length ? Math.max(...fares.map(f=>f.cabinBagKg ?? 0)) : 0,
        checkKg: fares.length ? Math.max(...fares.map(f=>f.baggageKg ?? 0)) : 0,
        piece: "1 piece only",
      },
      cancellation: {
        // here `fares` is FlightFare[], so .refundable is boolean — good.
        refund: [{ when: "≥ 24h before departure", feeUSD: fares.some(f=>f.refundable) ? 0 : 200 }],
        change: [{ when: "Date/Time change (per pax)", feeUSD: fares.some(f=>f.changeFeeINR===0) ? 0 : 150, note: "Fare diff applies" }],
        noShowUSD: 250,
      },
      fares: fares.map(mapFareRT),
    };
  });
}

function useDatasetMetaRT(data: RT_Row[]) {
  const airlines = useMemo(() => Array.from(new Set(data.map(d => d.airline))).sort(), [data]);
  const minPrice = useMemo(() => data.length ? Math.min(...data.map(d => d.totalFareINR)) : 0, [data]);
  const maxPrice = useMemo(() => data.length ? Math.max(...data.map(d => d.totalFareINR)) : 0, [data]);
  const airlineMinPrice = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach(r => { m[r.airline] = Math.min(m[r.airline] ?? Infinity, r.totalFareINR); });
    return m;
  }, [data]);
  const departAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(r => map.set(r.fromIata, `${r.fromCity} (${r.fromIata})`));
    return Array.from(map.entries()).map(([code, label]) => ({ code, label })).sort((a,b)=>a.code.localeCompare(b.code));
  }, [data]);
  const arriveAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(r => map.set(r.toIata, `${r.toCity} (${r.toIata})`));
    return Array.from(map.entries()).map(([code, label]) => ({ code, label })).sort((a,b)=>a.code.localeCompare(b.code));
  }, [data]);
  return { airlines, minPrice, maxPrice, airlineMinPrice, departAirports, arriveAirports };
}

/* =============== shared filter base (price ranges etc.) =============== */
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
});

/* ===================================================================== */
/* =============================== MAIN ================================= */
/* ===================================================================== */
export default function FlightResults() {
  const { search } = useLocation();
  const qp = useMemo(() => new URLSearchParams(search), [search]);

  const fromIata = (qp.get("from") || "").toUpperCase();
  const toIata   = (qp.get("to")   || "").toUpperCase();
  const dateISO  = qp.get("date") || "";
  const retISO   = qp.get("ret")  || "";
  const trip     = (qp.get("trip") || "").toLowerCase(); // "oneway" | "round"
  const cabin    = (qp.get("cabin") || "") as any;
  const paxQp    = Number(qp.get("pax") || "1");
  const pax      = Number.isFinite(paxQp) && paxQp > 0 ? paxQp : 1;

  const isRound  = trip === "round" || (!!retISO && retISO !== "");

  /* fetch raw once (same for both paths) */
  const rawOutbound = useMemo(() => {
    if (!fromIata || !toIata) return [];
    return searchFlights({ fromIata, toIata, departDate: dateISO, cabin });
  }, [fromIata, toIata, dateISO, cabin]);

  const rawReturn = useMemo(() => {
    if (!isRound || !fromIata || !toIata) return [];
    return searchFlights({ fromIata: toIata, toIata: fromIata, departDate: retISO, cabin });
  }, [isRound, fromIata, toIata, retISO, cabin]);

  /* ========================== ONEWAY PIPE ========================== */
  const OW_DATA: OW_Row[] = useMemo(() => adaptRowsOW(rawOutbound), [rawOutbound]);
  const metaOW = useDatasetMetaOW(OW_DATA);

  const [fOW, setFOW] = useState<BaseFilters>(() =>
    makeDefaultFilters(metaOW.minPrice, Math.max(metaOW.maxPrice, metaOW.minPrice))
  );
  useEffect(() => {
    setFOW(f => ({ ...f, priceMin: metaOW.minPrice, priceMax: Math.max(metaOW.maxPrice, metaOW.minPrice) }));
  }, [metaOW.minPrice, metaOW.maxPrice]);

  const routeOW: RouteFilter = useMemo(() => ({
    from: fromIata || undefined,
    to: toIata || undefined,
    oneWay: true,
    cabin: cabin || undefined,
    pax: pax || 1,
  }), [fromIata, toIata, cabin, pax]);

  const applyOW = (rows: OW_Row[]) => rows.filter((r) => {
    const inAirline  = fOW.airlines.size === 0 || fOW.airlines.has(r.airline);
    const inStops    = fOW.stops === "any" || r.stops === fOW.stops;
    const inRefund   = eqRefund(r.refundable, fOW.refundable); // normalized compare
    const inPayments = fOW.payments.size === 0 || r.extras?.some((x) => Array.from(fOW.payments).includes(x));
    const inPrice    = r.totalFareINR >= fOW.priceMin && r.totalFareINR <= fOW.priceMax;
    const inFrom     = fOW.fromAirports.size === 0 || fOW.fromAirports.has(r.fromIata.toUpperCase());
    const inTo       = fOW.toAirports.size   === 0 || fOW.toAirports.has(r.toIata.toUpperCase());
    const inDepSlot  = fOW.depSlots.size === 0 || fOW.depSlots.has(timeOfDay(r.departTime));
    const inArrSlot  = fOW.arrSlots.size === 0 || fOW.arrSlots.has(timeOfDay(r.arriveTime));
    const routeOk    = (!routeOW.from || r.fromIata.toUpperCase() === routeOW.from) &&
                       (!routeOW.to   || r.toIata.toUpperCase()   === routeOW.to);
    return routeOk && inAirline && (fOW.nonstopOnly ? r.stops === 0 : inStops) &&
           inRefund && inPayments && inPrice && inFrom && inTo && inDepSlot && inArrSlot;
  });

  const [sortOW, setSortOW] = useState<SortKey>("price_low");
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const sortRowsOW = (rows: OW_Row[]) => {
    const cp = [...rows];
    cp.sort((a,b) => {
      if (sortOW === "price_low")    return a.totalFareINR - b.totalFareINR || a.durationMin - b.durationMin;
      if (sortOW === "price_high")   return b.totalFareINR - a.totalFareINR || a.durationMin - b.durationMin;
      if (sortOW === "duration")     return a.durationMin - b.durationMin   || a.totalFareINR - b.totalFareINR;
      if (sortOW === "depart_early") return toMin(a.departTime) - toMin(b.departTime);
      if (sortOW === "arrive_late")  return toMin(b.arriveTime) - toMin(a.arriveTime);
      return 0;
    });
    return cp;
  };

  const rowsOW = useMemo(() => sortRowsOW(applyOW(OW_DATA)), [OW_DATA, fOW, sortOW]);

  const [selOW, setSelOW] = useState<{ flightId: string; fare: OW_Fare } | null>(null);
  useEffect(() => { if (selOW && !rowsOW.some(r => r.id === selOW.flightId)) setSelOW(null); }, [rowsOW, selOW]);

  /* ========================== ROUND PIPE ========================== */
  const RT_OUT: RT_Row[] = useMemo(() => adaptRowsRT(rawOutbound), [rawOutbound]);
  const RT_IN : RT_Row[] = useMemo(() => adaptRowsRT(rawReturn),   [rawReturn]);
  const metaRTAll = useDatasetMetaRT([...RT_OUT, ...RT_IN]);

  const [applyTo, setApplyTo] = useState<"both"|"out"|"in">("both");
  const [fOut, setFOut] = useState<BaseFilters>(() =>
    makeDefaultFilters(metaRTAll.minPrice, Math.max(metaRTAll.maxPrice, metaRTAll.minPrice))
  );
  const [fIn, setFIn] = useState<BaseFilters>(() =>
    makeDefaultFilters(metaRTAll.minPrice, Math.max(metaRTAll.maxPrice, metaRTAll.minPrice))
  );
  useEffect(() => {
    const min = metaRTAll.minPrice, max = Math.max(metaRTAll.maxPrice, metaRTAll.minPrice);
    setFOut(f => ({ ...f, priceMin: min, priceMax: Math.min(f.priceMax, max) }));
    setFIn (f => ({ ...f, priceMin: min, priceMax: Math.min(f.priceMax, max) }));
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
        setFOut(src); setFIn(src);
      }
      return;
    }
    const { applyTo: _x, ...payload } = next as unknown as BaseFilters & { applyTo: never };
    if (applyTo === "both") { setFOut(payload); setFIn(payload); }
    else if (applyTo === "out") setFOut(payload);
    else setFIn(payload);
  };

  const applyOneRT = (rows: RT_Row[], f: BaseFilters) => rows.filter((r) => {
    const inAirline  = f.airlines.size === 0 || f.airlines.has(r.airline);
    const inStops    = f.stops === "any" || r.stops === f.stops;
    const inRefund   = eqRefund(r.refundable, f.refundable); // normalized compare
    const inPayments = f.payments.size === 0 || r.extras?.some((x) => Array.from(f.payments).includes(x));
    const inPrice    = r.totalFareINR >= f.priceMin && r.totalFareINR <= f.priceMax;
    const inFrom     = f.fromAirports.size === 0 || f.fromAirports.has(r.fromIata.toUpperCase());
    const inTo       = f.toAirports.size   === 0 || f.toAirports.has(r.toIata.toUpperCase());
    const inDepSlot  = f.depSlots.size === 0 || f.depSlots.has(timeOfDay(r.departTime));
    const inArrSlot  = f.arrSlots.size === 0 || f.arrSlots.has(timeOfDay(r.arriveTime));
    return inAirline && (f.nonstopOnly ? r.stops === 0 : inStops) &&
           inRefund && inPayments && inPrice && inFrom && inTo && inDepSlot && inArrSlot;
  });

  const [sortRT, setSortRT] = useState<SortKey>("price_low");
  const sortRowsRT = (rows: RT_Row[]) => {
    const cp = [...rows];
    const toMinRT = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    cp.sort((a,b) => {
      if (sortRT === "price_low")    return a.totalFareINR - b.totalFareINR || a.durationMin - b.durationMin;
      if (sortRT === "price_high")   return b.totalFareINR - a.totalFareINR || a.durationMin - b.durationMin;
      if (sortRT === "duration")     return a.durationMin - b.durationMin   || a.totalFareINR - b.totalFareINR;
      if (sortRT === "depart_early") return toMinRT(a.departTime) - toMinRT(b.departTime);
      if (sortRT === "arrive_late")  return toMinRT(b.arriveTime) - toMinRT(a.arriveTime);
      return 0;
    });
    return cp;
  };

  const rowsOutRT = useMemo(() => sortRowsRT(applyOneRT(RT_OUT, fOut)), [RT_OUT, fOut, sortRT]);
  const rowsInRT  = useMemo(() => sortRowsRT(applyOneRT(RT_IN , fIn )), [RT_IN , fIn , sortRT]);

  const metaForPanelRT = useDatasetMetaRT(
    (applyTo === "out" ? rowsOutRT : applyTo === "in" ? rowsInRT : [...rowsOutRT, ...rowsInRT]).length
      ? (applyTo === "out" ? rowsOutRT : applyTo === "in" ? rowsInRT : [...rowsOutRT, ...rowsInRT])
      : [...RT_OUT, ...RT_IN]
  );

  const [selOutRT, setSelOutRT] = useState<{ flightId: string; fare: RT_Fare } | null>(null);
  const [selInRT , setSelInRT ] = useState<{ flightId: string; fare: RT_Fare } | null>(null);
  useEffect(()=>{ if (selOutRT && !rowsOutRT.some(r=>r.id===selOutRT.flightId)) setSelOutRT(null); }, [rowsOutRT, selOutRT]);
  useEffect(()=>{ if (selInRT  && !rowsInRT .some(r=>r.id===selInRT.flightId)) setSelInRT (null); }, [rowsInRT , selInRT ]);

  const resetByApplyToRT = () => {
    const base = makeDefaultFilters(metaRTAll.minPrice, Math.max(metaRTAll.maxPrice, metaRTAll.minPrice));
    if (applyTo === "both") { setFOut(base); setFIn(base); }
    else if (applyTo === "out") setFOut(base);
    else setFIn(base);
  };

  /* ========================== COMMON UI ========================== */
  const [drawer, setDrawer] = useState(false);
  const [showModify, setShowModify] = useState(false);

  const uniqueAirlines = useMemo(() => {
    if (isRound) {
      const set = new Set<string>();
      [...rowsOutRT, ...rowsInRT].forEach(r => set.add(r.airline));
      return set.size;
    }
    const set = new Set<string>();
    rowsOW.forEach(r => set.add(r.airline));
    return set.size;
  }, [isRound, rowsOutRT, rowsInRT, rowsOW]);

  return (
    <div className="mx-auto">
      <div className="min-h-screen">
        {showModify && (
          <div className="sticky top-0 z-40 mb-3 backdrop-blur bg-gray-900 p-2 rounded">
            <div className="mx-auto max-w-7xl">
              <FromToBar
                onSearch={(payload:any) => {
                  // Only toggling UI here – routing/URL params control searches.
                  setShowModify(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[20px] font-semibold text-gray-900">
              {isRound ? (
                <>
                  <span className="text-rose-700">{rowsOutRT.length}</span>
                  <span className="text-gray-600"> outbound • </span>
                  <span className="text-rose-700">{rowsInRT.length}</span>
                  <span className="text-gray-600"> return flights</span>{" "}
                  {(rowsOutRT.length + rowsInRT.length) > 0 && (
                    <span className="text-gray-600">from {uniqueAirlines} Airlines</span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-rose-700">{rowsOW.length} Available Flights</span>{" "}
                  {rowsOW.length > 0 && <span className="text-gray-600">from {uniqueAirlines} Airlines</span>}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModify((s) => !s)}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm hover:bg-gray-50"
              >
                Modify Search
              </button>

              {!isRound ? (
                <select
                  value={sortOW}
                  onChange={(e) => setSortOW(e.target.value as SortKey)}
                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm"
                >
                  <option value="price_low">Lowest Price</option>
                  <option value="price_high">Highest Price</option>
                  <option value="duration">Shortest Duration</option>
                  <option value="depart_early">Earliest Departure</option>
                  <option value="arrive_late">Latest Arrival</option>
                </select>
              ) : (
                <select
                  value={sortRT}
                  onChange={(e) => setSortRT(e.target.value as SortKey)}
                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm"
                >
                  <option value="price_low">Lowest Price</option>
                  <option value="price_high">Highest Price</option>
                  <option value="duration">Shortest Duration</option>
                  <option value="depart_early">Earliest Departure</option>
                  <option value="arrive_late">Latest Arrival</option>
                </select>
              )}

              <button
                onClick={() => setDrawer(true)}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm md:hidden"
              >
                Filters
              </button>
            </div>
          </div>

          {/* tiny badge showing which side you're editing (round only) */}
          {isRound && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs text-gray-700">
                Editing filters for:
                <strong className="uppercase">{applyTo === "both" ? "Both" : applyTo === "out" ? "Outbound" : "Inbound"}</strong>
                <button onClick={resetByApplyToRT} className="ml-2 rounded border px-2 py-[2px] hover:bg-gray-50">
                  Reset this side
                </button>
              </span>
            </div>
          )}

          <div className="grid grid-cols-12 gap-4">
            {/* Sidebar */}
            <div className="col-span-12 hidden md:col-span-3 md:block">
              {!isRound ? (
                <FilterPanel
                  meta={useDatasetMetaOW(rowsOW.length ? rowsOW : OW_DATA)}
                  f={{ ...fOW, applyTo: "out" }}
                  setF={(next) => {
                    const { applyTo: _omit, ...payload } = next as unknown as BaseFilters & { applyTo: never };
                    setFOW(payload);
                  }}
                  onReset={() => {
                    setFOW(makeDefaultFilters(metaOW.minPrice, Math.max(metaOW.maxPrice, metaOW.minPrice)));
                  }}
                  showApplyTo={false}
                />
              ) : (
                <FilterPanel
                  meta={metaForPanelRT}
                  f={activeForPanelRT}
                  setF={setFromPanelRT}
                  onReset={resetByApplyToRT}
                  showApplyTo
                />
              )}
            </div>

            {/* Results */}
            <div className="col-span-12 md:col-span-9">
              {!isRound ? (
                <OnewayResult
                  rows={rowsOW}
                  selectedGlobal={selOW}
                  onSelectFare={(rowId, fare) => setSelOW({ flightId: rowId, fare })}
                />
              ) : (
                <RoundTripResultList
                  outboundRows={rowsOutRT}
                  returnRows={rowsInRT}
                  selectedOutbound={selOutRT}
                  selectedReturn={selInRT}
                  onSelectOutboundFare={(rowId, fare) => setSelOutRT({ flightId: rowId, fare })}
                  onSelectReturnFare={(rowId, fare)   => setSelInRT ({ flightId: rowId, fare })}
                  fromIata={fromIata}
                  toIata={toIata}
                  departDate={dateISO}
                  returnDate={retISO}
                  cabin={String(cabin || "Economy")}
                  pax={pax}
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {drawer && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-4 shadow-2xl">
              {!isRound ? (
                <FilterPanel
                  meta={useDatasetMetaOW(rowsOW.length ? rowsOW : OW_DATA)}
                  f={{ ...fOW, applyTo: "out" }}
                  setF={(next) => {
                    const { applyTo: _omit, ...payload } = next as unknown as BaseFilters & { applyTo: never };
                    setFOW(payload);
                  }}
                  onReset={() => {
                    setFOW(makeDefaultFilters(metaOW.minPrice, Math.max(metaOW.maxPrice, metaOW.minPrice)));
                  }}
                  mobile
                  onClose={() => setDrawer(false)}
                  showApplyTo={false}
                />
              ) : (
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
