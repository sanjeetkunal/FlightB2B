// src/pages/OnewayResults.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { searchFlights, type FlightRow, type FlightFare } from "../data/flights";
import FilterPanel, { type Filters as PanelFilters } from "../components/flightlist/FiltersPanel";
import OnewayResult, {
  type Row as UIRow,
  type FareOption as UIFare,
} from "../components/flightlist/OnewayResult";

/* ---------- helpers ---------- */
const formatDateLabel = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.toLocaleString("en-GB", { day: "2-digit" });
  const mon = d.toLocaleString("en-GB", { month: "short" });
  const wk  = d.toLocaleString("en-GB", { weekday: "short" });
  return `${day} ${mon}, ${wk}`;
};

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
    seat: f.seatSelect ? "Preferred seat included" : "Seat selection (paid)" ,
  };
}

function adaptRows(rows: FlightRow[]): UIRow[] {
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
        handKg: fares.length ? Math.max(...fares.map(f => f.cabinBagKg ?? 0)) : 0,
        checkKg: fares.length ? Math.max(...fares.map(f => f.baggageKg ?? 0)) : 0,
        piece: "1 piece only",
      },
      cancellation: {
        refund: [{ when: "≥ 24h before", feeUSD: fares.some(f => f.refundable) ? 0 : 200 }],
        change: [{ when: "Date/Time change (per pax)", feeUSD: fares.some(f => f.changeFeeINR === 0) ? 0 : 150, note: "Fare diff applies" }],
        noShowUSD: 250,
      },
      fares: fares.map(mapFare),
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
    return Array.from(map.entries()).map(([code, label]) => ({ code, label })).sort((a,b)=>a.code.localeCompare(b.code));
  }, [data]);
  const arriveAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(r => map.set(r.toIata, `${r.toCity} (${r.toIata})`));
    return Array.from(map.entries()).map(([code, label]) => ({ code, label })).sort((a,b)=>a.code.localeCompare(b.code));
  }, [data]);
  return { airlines, minPrice, maxPrice, airlineMinPrice, departAirports, arriveAirports };
}

/* ---------- component ---------- */
type TimeSlot = "0-6" | "6-12" | "12-18" | "18-24";
type SortKey  = "price_low" | "price_high" | "duration" | "depart_early" | "arrive_late";

const timeOfDay = (hhmm?: string): TimeSlot => {
  const h = Number((hhmm ?? "00:00").split(":")[0]);
  if (h < 6) return "0-6";
  if (h < 12) return "6-12";
  if (h < 18) return "12-18";
  return "18-24";
};

export default function OnewayResults() {
  const { search } = useLocation();
  const qp = useMemo(() => new URLSearchParams(search), [search]);

  const fromIata = (qp.get("from") || "").toUpperCase();
  const toIata   = (qp.get("to")   || "").toUpperCase();
  const dateISO  = qp.get("date") || "";
  const cabin    = (qp.get("cabin") || "") as any;

  // fetch + adapt
  const raw = useMemo(() => {
    if (!fromIata || !toIata) return [];
    return searchFlights({ fromIata, toIata, departDate: dateISO, cabin });
  }, [fromIata, toIata, dateISO, cabin]);

  const data: UIRow[] = useMemo(() => adaptRows(raw), [raw]);

  // base meta (for resets)
  const metaBase = useDatasetMeta(data);

  // one-way filters (typed)
  const [filters, setFilters] = useState<PanelFilters>(() => ({
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
    applyTo: "out", // ignored in UI for one-way; panel will hide the toggle
  }));

  // keep bounds in sync with dataset price changes
  useEffect(() => {
    setFilters(f => ({
      ...f,
      priceMin: metaBase.minPrice,
      priceMax: Math.max(metaBase.maxPrice, metaBase.minPrice),
    }));
  }, [metaBase.minPrice, metaBase.maxPrice]);

  const filtered = useMemo(() => {
    const f = filters;
    const inAirline  = (a: string) => f.airlines.size === 0 || f.airlines.has(a);
    const inStops    = (s: number) => f.stops === "any" || s === f.stops;
    const inRefund   = (r: UIRow)  => f.refundable === "any" || r.refundable === f.refundable;
    const inPayments = (r: UIRow)  => f.payments.size === 0 || r.extras?.some(x => Array.from(f.payments).includes(x));
    const inPrice    = (r: UIRow)  => r.totalFareINR >= f.priceMin && r.totalFareINR <= f.priceMax;
    const inFrom     = (r: UIRow)  => f.fromAirports.size === 0 || f.fromAirports.has(r.fromIata.toUpperCase());
    const inTo       = (r: UIRow)  => f.toAirports.size === 0 || f.toAirports.has(r.toIata.toUpperCase());
    const inDepSlot  = (r: UIRow)  => f.depSlots.size === 0 || f.depSlots.has(timeOfDay(r.departTime));
    const inArrSlot  = (r: UIRow)  => f.arrSlots.size === 0 || f.arrSlots.has(timeOfDay(r.arriveTime));

    return data.filter(r =>
      inAirline(r.airline) && inPrice(r) && inRefund(r) && inPayments(r) &&
      inFrom(r) && inTo(r) && inDepSlot(r) && inArrSlot(r) &&
      (f.nonstopOnly ? r.stops === 0 : inStops(r.stops))
    );
  }, [filters, data]);

  /* sorting */
  const [sortBy, setSortBy] = useState<SortKey>("price_low");
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h*60+m; };
  const rows = useMemo(() => {
    const cp = [...filtered];
    cp.sort((a,b) => {
      if (sortBy === "price_low")    return a.totalFareINR - b.totalFareINR || a.durationMin - b.durationMin;
      if (sortBy === "price_high")   return b.totalFareINR - a.totalFareINR || a.durationMin - b.durationMin;
      if (sortBy === "duration")     return a.durationMin - b.durationMin || a.totalFareINR - b.totalFareINR;
      if (sortBy === "depart_early") return toMin(a.departTime) - toMin(b.departTime);
      if (sortBy === "arrive_late")  return toMin(b.arriveTime) - toMin(a.arriveTime);
      return 0;
    });
    return cp;
  }, [filtered, sortBy]);

  /* selection */
  const [selected, setSelected] = useState<{ flightId: string; fare: UIFare } | null>(null);
  useEffect(() => {
    if (selected && !rows.some(r => r.id === selected.flightId)) setSelected(null);
  }, [rows, selected]);

  /* meta for the panel should reflect currently visible rows (fallback to base data) */
  const metaForPanel = useDatasetMeta(rows.length ? rows : data);

  /* reset helper */
  const handleReset = () => {
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
      applyTo: "out",
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[20px] font-semibold text-gray-900">
          <span className="text-rose-700">{rows.length} Available Flights</span>{" "}
          {rows.length > 0 && (
            <span className="text-gray-600">
              from {new Set(rows.map(r => r.airline)).size} Airlines
            </span>
          )}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortKey)}
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm"
        >
          <option value="price_low">Lowest Price</option>
          <option value="price_high">Highest Price</option>
          <option value="duration">Shortest Duration</option>
          <option value="depart_early">Earliest Departure</option>
          <option value="arrive_late">Latest Arrival</option>
        </select>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="col-span-12 hidden md:col-span-3 md:block">
          <FilterPanel
            meta={metaForPanel}
            f={filters}
            setF={setFilters}
            onReset={handleReset}
            showApplyTo={false}   // no Both/Out/In toggle on one-way
          />
        </div>

        {/* Results */}
        <div className="col-span-12 md:col-span-9">
          <OnewayResult
            rows={rows}
            selectedGlobal={selected}
            onSelectFare={(rowId, fare) => setSelected({ flightId: rowId, fare })}
          />
        </div>
      </div>
    </div>
  );
}
