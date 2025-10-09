import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import FromToBar from "../components/flightsearch/FromToBar";

import { searchFlights, type FlightRow, type FlightFare } from "../data/flights";

import FilterPanel, { type Filters } from "../components/flightlist/FiltersPanel";
import OnewayResult, {
  type Row as UIRow,
  type FareOption as UIFare,
} from "../components/flightlist/OnewayResult";
import RoundTripResultList from "../components/flightlist/RoundTripResultList";

/* ================== small utils ================== */
const formatDateLabel = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.toLocaleString("en-GB", { day: "2-digit" });
  const mon = d.toLocaleString("en-GB", { month: "short" });
  const wk  = d.toLocaleString("en-GB", { weekday: "short" });
  return `${day} ${mon}, ${wk}`;
};

/* flights.ts → UI adapter */
function mapFare(f: FlightFare): UIFare {
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
function adaptRows(rows: FlightRow[]): UIRow[] {
  return rows.map((r) => {
    const departDateLbl = formatDateLabel(r.departDate);
    const arriveDateLbl = formatDateLabel(r.arriveDate);
    return {
      id: r.id,
      airline: r.airline,
      logo: r.logo,                // ✅ FIX: use image URL (was r.logoB)
      flightNos: r.flightNos,
      fromCity: r.fromCity, fromIata: r.fromIata,
      toCity: r.toCity,     toIata: r.toIata,
      departTime: r.departTime, departDate: departDateLbl,
      arriveTime: r.arriveTime, arriveDate: arriveDateLbl,
      stops: r.stops, stopLabel: r.stopLabel, durationMin: r.durationMin,
      totalFareINR: Math.min(...r.fares.map(f => f.totalINR)),
      commissionUSD: 0, agentFareUSD: 0,
      refundable: r.refundable,
      extras: r.extras ?? [],
      segments: [{
        fromCity: r.fromCity, fromIata: r.fromIata, departTime: r.departTime, departDate: departDateLbl,
        toCity: r.toCity,     toIata: r.toIata,     arriveTime: r.arriveTime, arriveDate: arriveDateLbl,
        carrier: r.flightNos.split(" ")[0], flightNo: r.flightNos.split(" ").pop() || "",
        durationMin: r.durationMin, layout: "3-3 Layout", beverage: true, seatType: "Standard Recliner", legroomInch: 29,
      }],
      baggage: {
        handKg: Math.max(...r.fares.map(f=>f.cabinBagKg ?? 0)),
        checkKg: Math.max(...r.fares.map(f=>f.baggageKg ?? 0)),
        piece: "1 piece only"
      },
      cancellation: {
        refund: [{ when: "≥ 24h before departure", feeUSD: r.fares.some(f=>f.refundable) ? 0 : 200 }],
        change: [{ when: "Date/Time change (per pax)", feeUSD: r.fares.some(f=>f.changeFeeINR===0) ? 0 : 150, note: "Fare diff applies" }],
        noShowUSD: 250,
      },
      fares: r.fares.map(mapFare),
    };
  });
}

/* dataset meta for FilterPanel */
function useDatasetMeta(data: UIRow[]) {
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
    return Array.from(map.entries()).map(([code, label]) => ({ code, label }));
  }, [data]);
  const arriveAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(r => map.set(r.toIata, `${r.toCity} (${r.toIata})`));
    return Array.from(map.entries()).map(([code, label]) => ({ code, label }));
  }, [data]);
  return { airlines, minPrice, maxPrice, airlineMinPrice, departAirports, arriveAirports };
}

/* helpers */
type TimeSlot = "0-6" | "6-12" | "12-18" | "18-24";
type SortKey = "price_low" | "price_high" | "duration" | "depart_early" | "arrive_late";
const timeOfDay = (hhmm: string): TimeSlot => {
  const h = Number(hhmm.split(":")[0]);
  if (h < 6) return "0-6";
  if (h < 12) return "6-12";
  if (h < 18) return "12-18";
  return "18-24";
};

type RouteFilter = { from?: string; to?: string; oneWay?: boolean; cabin?: string; pax?: number };

export default function FlightResults() {
  const { search } = useLocation();
  const qp = new URLSearchParams(search);

  const fromIata = (qp.get("from") || "").toUpperCase();
  const toIata   = (qp.get("to")   || "").toUpperCase();
  const dateISO  = qp.get("date") || "";
  const retISO   = qp.get("ret")  || "";
  const trip     = (qp.get("trip") || "").toLowerCase();      // "oneway" | "round"
  const cabin    = (qp.get("cabin") || "") as any;
  const pax      = Number(qp.get("pax") || "1");

  const isRound  = trip === "round" || (!!retISO && retISO !== "");

  /* fetch outbound + (if round) return from flights.ts */
  const rawOutbound = useMemo(() => {
    if (!fromIata || !toIata) return [];
    return searchFlights({ fromIata, toIata, departDate: dateISO, cabin });
  }, [fromIata, toIata, dateISO, cabin]);

  const rawReturn = useMemo(() => {
    if (!isRound || !fromIata || !toIata) return [];
    return searchFlights({ fromIata: toIata, toIata: fromIata, departDate: retISO, cabin });
  }, [isRound, fromIata, toIata, retISO, cabin]);

  /* adapt to UI rows */
  const OUTBOUND_DATA: UIRow[] = useMemo(() => adaptRows(rawOutbound), [rawOutbound]);
  const RETURN_DATA:   UIRow[] = useMemo(() => adaptRows(rawReturn),   [rawReturn]);
  const COMBINED:      UIRow[] = isRound ? [...OUTBOUND_DATA, ...RETURN_DATA] : OUTBOUND_DATA;

  /* meta + filters */
  const metaBase = useDatasetMeta(COMBINED);
  const [filters, setFilters] = useState<Filters>(() => ({
    airlines: new Set<string>(),
    stops: "any",
    refundable: "any",
    payments: new Set<string>(),
    priceMin: metaBase.minPrice,
    priceMax: Math.max(metaBase.maxPrice, metaBase.minPrice),
    nonstopOnly: false,
    hideNearby: false,
    fromAirports: new Set<string>(),
    toAirports: new Set<string>(),
    depSlots: new Set<TimeSlot>(),
    arrSlots: new Set<TimeSlot>(),
  }));
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      priceMin: metaBase.minPrice,
      priceMax: Math.max(metaBase.maxPrice, metaBase.minPrice),
    }));
  }, [metaBase.minPrice, metaBase.maxPrice]);

  const [route, setRoute] = useState<RouteFilter>({});
  useEffect(() => {
    setRoute({
      from:  fromIata || undefined,
      to:    toIata   || undefined,
      oneWay: !isRound,
      cabin: cabin || undefined,
      pax: pax || 1,
    });
  }, [fromIata, toIata, isRound, cabin, pax]);

  const applyFilters = (rows: UIRow[]) => {
    const inAirline = (a: string) => filters.airlines.size === 0 || filters.airlines.has(a);
    const inStops = (s: number) => filters.stops === "any" || s === filters.stops;
    const inRefund = (r: UIRow) => filters.refundable === "any" || r.refundable === filters.refundable;
    const inPayments = (r: UIRow) => filters.payments.size === 0 || r.extras?.some((x) => Array.from(filters.payments).includes(x));
    const inPrice = (r: UIRow) => r.totalFareINR >= filters.priceMin && r.totalFareINR <= filters.priceMax;

    const inFromAirport = (r: UIRow) => !route.from || r.fromIata.toUpperCase() === route.from.toUpperCase();
    const inToAirport   = (r: UIRow) => !route.to   || r.toIata.toUpperCase()   === route.to.toUpperCase();

    const inDepSlot = (r: UIRow) => filters.depSlots.size === 0 || filters.depSlots.has(timeOfDay(r.departTime));
    const inArrSlot = (r: UIRow) => filters.arrSlots.size === 0 || filters.arrSlots.has(timeOfDay(r.arriveTime));

    return rows.filter((r) =>
      inAirline(r.airline) &&
      inPrice(r) &&
      inRefund(r) &&
      inPayments(r) &&
      inFromAirport(r) &&
      inToAirport(r) &&
      inDepSlot(r) &&
      inArrSlot(r) &&
      (filters.nonstopOnly ? r.stops === 0 : inStops(r.stops))
    );
  };

  type SortKey = "price_low" | "price_high" | "duration" | "depart_early" | "arrive_late";
  const [sortBy, setSortBy] = useState<SortKey>("price_low");
  const sortRows = (rows: UIRow[]) => {
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case "price_low":   return a.totalFareINR - b.totalFareINR;
        case "price_high":  return b.totalFareINR - a.totalFareINR;
        case "duration":    return a.durationMin - b.durationMin;
        case "depart_early":return toMin(a.departTime) - toMin(b.departTime);
        case "arrive_late": return toMin(b.arriveTime) - toMin(a.arriveTime);
        default:            return 0;
      }
    });
  };

  const filteredOut = useMemo(() => applyFilters(OUTBOUND_DATA), [filters, route, OUTBOUND_DATA]);
  const filteredIn  = useMemo(() => applyFilters(RETURN_DATA),   [filters, route, RETURN_DATA]);

  const rowsOut = useMemo(() => sortRows(filteredOut), [filteredOut, sortBy]);
  const rowsIn  = useMemo(() => sortRows(filteredIn),  [filteredIn,  sortBy]);

  const rowsOneWay = rowsOut; // alias for readability

  const metaForPanel = useDatasetMeta((isRound ? [...rowsOut, ...rowsIn] : rowsOneWay).length
    ? (isRound ? [...rowsOut, ...rowsIn] : rowsOneWay)
    : COMBINED
  );

  /* selections */
  const [selectedOutbound, setSelectedOutbound] = useState<{ flightId: string; fare: UIFare } | null>(null);
  const [selectedReturn,   setSelectedReturn]   = useState<{ flightId: string; fare: UIFare } | null>(null);

  /* one-way view uses just selectedOutbound */
  const selectedGlobal = selectedOutbound;

  /* UI state */
  const [drawer, setDrawer] = useState(false);
  const [showModify, setShowModify] = useState(false);

  /* modify search handler (keeps it in-page as filters/route change) */
  const handleModifySearch = (payload: any) => {
    const adults   = Number(payload?.pax?.adults ?? payload?.adults ?? 0);
    const children = Number(payload?.pax?.children ?? payload?.children ?? 0);
    const infants  = Number(payload?.pax?.infants ?? payload?.infants ?? 0);
    const paxCalc  = (payload?.pax && typeof payload.pax === "number")
      ? payload.pax
      : Math.max(1, adults + children + infants || 1);

    setRoute({
      from:  payload?.from?.code ?? payload?.fromIata ?? payload?.from ?? "",
      to:    payload?.to?.code   ?? payload?.toIata   ?? payload?.to   ?? "",
      oneWay: (payload?.trip || "").toLowerCase() !== "round" && !payload?.ret,
      cabin:  payload?.cabin ?? payload?.class ?? "Economy",
      pax: paxCalc,
    });
    setShowModify(false);
  };

  /* header counts */
  const uniqueAirlines = useMemo(() => {
    const set = new Set<string>();
    (isRound ? [...rowsOut, ...rowsIn] : rowsOneWay).forEach(r => set.add(r.airline));
    return set.size;
  }, [isRound, rowsOut, rowsIn, rowsOneWay]);

  return (
    <div className="mx-auto">
      <div className="min-h-screen">
        {showModify && (
          <div className="sticky top-0 z-40 mb-3 backdrop-blur bg-gray-900 p-2 rounded">
            <div className="mx-auto max-w-7xl">
              <FromToBar onSearch={handleModifySearch} />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[20px] font-semibold text-gray-900">
              {isRound ? (
                <>
                  <span className="text-rose-700">{rowsOut.length}</span>
                  <span className="text-gray-600"> outbound • </span>
                  <span className="text-rose-700">{rowsIn.length}</span>
                  <span className="text-gray-600"> return flights</span>{" "}
                  { (rowsOut.length + rowsIn.length) > 0 && (
                    <span className="text-gray-600">from {uniqueAirlines} Airlines</span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-rose-700">{rowsOneWay.length} Available Flights</span>{" "}
                  {rowsOneWay.length > 0 && <span className="text-gray-600">from {uniqueAirlines} Airlines</span>}
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

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm"
              >
                <option value="price_low">Lowest Price</option>
                <option value="price_high">Highest Price</option>
                <option value="duration">Shortest Duration</option>
                <option value="depart_early">Earliest Departure</option>
                <option value="arrive_late">Latest Arrival</option>
              </select>

              <button
                onClick={() => setDrawer(true)}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm md:hidden"
              >
                Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* Sidebar */}
            <div className="col-span-12 hidden md:col-span-3 md:block">
              <FilterPanel meta={metaForPanel} f={filters} setF={setFilters} onReset={() => {
                setFilters({
                  airlines: new Set<string>(),
                  stops: "any",
                  refundable: "any",
                  payments: new Set<string>(),
                  priceMin: metaBase.minPrice,
                  priceMax: Math.max(metaBase.maxPrice, metaBase.minPrice),
                  nonstopOnly: false,
                  hideNearby: false,
                  fromAirports: new Set<string>(),
                  toAirports: new Set<string>(),
                  depSlots: new Set<TimeSlot>(),
                  arrSlots: new Set<TimeSlot>(),
                });
              }} />
            </div>

            {/* Results */}
            <div className="col-span-12 md:col-span-9">
              {isRound ? (
                <RoundTripResultList
                  outboundRows={rowsOut}
                  returnRows={rowsIn}
                  selectedOutbound={selectedOutbound}
                  selectedReturn={selectedReturn}
                  onSelectOutboundFare={(rowId, fare) => setSelectedOutbound({ flightId: rowId, fare })}
                  onSelectReturnFare={(rowId, fare)   => setSelectedReturn({ flightId: rowId, fare })}
                  fromIata={fromIata}
                  toIata={toIata}
                  departDate={dateISO}
                  returnDate={retISO}
                  cabin={cabin}
                  pax={pax}
                />
              ) : (
                <OnewayResult
                  rows={rowsOneWay}
                  selectedGlobal={selectedGlobal}
                  onSelectFare={(rowId, fare) => setSelectedOutbound({ flightId: rowId, fare })}
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
              <FilterPanel meta={metaForPanel} f={filters} setF={setFilters} onReset={() => {
                setFilters({
                  airlines: new Set<string>(),
                  stops: "any",
                  refundable: "any",
                  payments: new Set<string>(),
                  priceMin: metaBase.minPrice,
                  priceMax: Math.max(metaBase.maxPrice, metaBase.minPrice),
                  nonstopOnly: false,
                  hideNearby: false,
                  fromAirports: new Set<string>(),
                  toAirports: new Set<string>(),
                  depSlots: new Set<TimeSlot>(),
                  arrSlots: new Set<TimeSlot>(),
                });
              }} mobile onClose={() => setDrawer(false)} />
              <button
                onClick={() => setDrawer(false)}
                className="mt-3 w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
