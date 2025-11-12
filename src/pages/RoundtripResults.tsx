// src/pages/RoundtripResults.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { searchFlights, type FlightRow, type FlightFare } from "../data/flights";
import FilterPanel, { type Filters as PanelFilters } from "../components/flightlist/FiltersPanel";
import RoundtripList, { type RowRT, type FareRT } from "../components/flightlist/RoundTripResultList";

/* ---------------------- helpers ---------------------- */
const formatDateLabel = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.toLocaleString("en-GB", { day: "2-digit" });
  const mon = d.toLocaleString("en-GB", { month: "short" });
  const wk  = d.toLocaleString("en-GB", { weekday: "short" });
  return `${day} ${mon}, ${wk}`;
};

// unify refundable strings for RowRT + FareRT
type RefundStr = "Refundable" | "Non Refundable";
const normRefundable = (v: unknown): RefundStr => {
  if (typeof v === "string") {
    const normalized = v.replace(/-/g, " ").trim();
    return normalized === "Refundable" ? "Refundable" : "Non Refundable";
  }
  return v ? "Refundable" : "Non Refundable";
};

const mapFareRT = (f: FlightFare): FareRT => ({
  code: `${f.brand}-${f.cabin}-${f.rbd}`,
  label: f.brand,
  price: f.totalINR,
  refundable: normRefundable(f.refundable),
  cabin: f.cabin,
  meal: f.meal ? "Free Meal" : "Paid Meal",
  badge: f.changeFeeINR === 0 ? { text: "Published", tone: "published" } : { text: "Offer Fare", tone: "offer" },
  baggage: { handKg: f.cabinBagKg, checkKg: f.baggageKg },
  seat: f.seatSelect ? "Preferred seat included" : "Seat selection (paid)",
});

const adaptRT = (rows: FlightRow[]): RowRT[] =>
  rows.map((r) => {
    const departDateLbl = formatDateLabel(r.departDate);
    const arriveDateLbl = formatDateLabel(r.arriveDate);
    const fares = r.fares ?? [];
    const minFare = fares.length ? Math.min(...fares.map((x) => x.totalINR)) : 0;

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
      refundable: normRefundable(r.refundable), // **fixed spacing here**
      extras: r.extras ?? [],

      // if your RowRT requires a segments array with certain fields,
      // prefer r.segments from the API; else provide a minimal fallback
      segments:
        (r as any).segments ??
        [
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
            legroomInch: 29,
          },
        ],

      baggage: {
        handKg: fares.length ? Math.max(...fares.map((x) => x.cabinBagKg ?? 0)) : 0,
        checkKg: fares.length ? Math.max(...fares.map((x) => x.baggageKg ?? 0)) : 0,
        piece: "1 piece only",
      },

      cancellation:
        (r as any).cancellation ?? {
          refund: [{ when: "≥ 24h before", feeUSD: fares.some((x) => x.refundable) ? 0 : 200 }],
          change: [{ when: "Date/Time change (per pax)", feeUSD: fares.some((x) => x.changeFeeINR === 0) ? 0 : 150, note: "Fare diff applies" }],
          noShowUSD: 250,
        },

      fares: fares.map(mapFareRT),
    };
  });

/* meta for FilterPanel */
function useDatasetMetaRT(data: RowRT[]) {
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

/* filter + sort helpers */
type TimeSlot = "0-6" | "6-12" | "12-18" | "18-24";
const timeOfDay = (t?: string): TimeSlot => {
  const h = Number((t ?? "00:00").split(":")[0]);
  if (h < 6) return "0-6";
  if (h < 12) return "6-12";
  if (h < 18) return "12-18";
  return "18-24";
};

type BaseFilters = Omit<PanelFilters, "applyTo">;

const makeDefault = (min: number, max: number): BaseFilters => ({
  airlines: new Set<string>(),
  stops: "any",
  refundable: "any",
  payments: new Set<string>(),
  priceMin: min,
  priceMax: Math.max(max, min),
  nonstopOnly: false,
  hideNearby: false,
  fromAirports: new Set<string>(),
  toAirports: new Set<string>(),
  depSlots: new Set<TimeSlot>(),
  arrSlots: new Set<TimeSlot>(),
});

type SortKey = "price_low" | "price_high" | "duration" | "depart_early" | "arrive_late";

/* ---------------------- page component ---------------------- */
export default function RoundtripResults() {
  const { search } = useLocation();
  const qp = useMemo(() => new URLSearchParams(search), [search]);

  const fromIata = (qp.get("from") || "").toUpperCase();
  const toIata   = (qp.get("to")   || "").toUpperCase();
  const dateISO  = qp.get("date") || "";
  const retISO   = qp.get("ret")  || "";
  const cabin    = (qp.get("cabin") || "") as any;
  const pax      = Number(qp.get("pax") || "1") || 1;

  /* fetch rows for both legs */
  const rawOut = useMemo(
    () => (!fromIata || !toIata) ? [] : searchFlights({ fromIata, toIata, departDate: dateISO, cabin }),
    [fromIata, toIata, dateISO, cabin]
  );
  const rawIn = useMemo(
    () => (!fromIata || !toIata) ? [] : searchFlights({ fromIata: toIata, toIata: fromIata, departDate: retISO, cabin }),
    [fromIata, toIata, retISO, cabin]
  );

  const dataOut: RowRT[] = useMemo(() => adaptRT(rawOut), [rawOut]);
  const dataIn:  RowRT[] = useMemo(() => adaptRT(rawIn ), [rawIn ]);

  /* filters – one panel that applies to BOTH legs */
  const combinedMeta = useDatasetMetaRT([...dataOut, ...dataIn]);
  const [fBoth, setFBoth] = useState<BaseFilters>(() => makeDefault(combinedMeta.minPrice, Math.max(combinedMeta.maxPrice, combinedMeta.minPrice)));

  // keep price bounds updated when dataset changes
  useEffect(() => {
    const min = combinedMeta.minPrice;
    const max = Math.max(combinedMeta.maxPrice, combinedMeta.minPrice);
    setFBoth((f) => ({ ...f, priceMin: min, priceMax: Math.min(f.priceMax, max) }));
  }, [combinedMeta.minPrice, combinedMeta.maxPrice]);

  const applyOne = (rows: RowRT[], f: BaseFilters) =>
    rows.filter((r) => {
      const inAirline  = f.airlines.size === 0 || f.airlines.has(r.airline);
      const inStops    = f.stops === "any" || r.stops === f.stops;
      const inRefund   = f.refundable === "any" || r.refundable === f.refundable;
      const inPayments = f.payments.size === 0 || r.extras?.some((x) => Array.from(f.payments).includes(x));
      const inPrice    = r.totalFareINR >= f.priceMin && r.totalFareINR <= f.priceMax;
      const inFrom     = f.fromAirports.size === 0 || f.fromAirports.has(r.fromIata.toUpperCase());
      const inTo       = f.toAirports.size   === 0 || f.toAirports.has(r.toIata.toUpperCase());
      const inDepSlot  = f.depSlots.size === 0 || f.depSlots.has(timeOfDay(r.departTime));
      const inArrSlot  = f.arrSlots.size === 0 || f.arrSlots.has(timeOfDay(r.arriveTime));
      return inAirline && (f.nonstopOnly ? r.stops === 0 : inStops) &&
             inRefund && inPayments && inPrice && inFrom && inTo && inDepSlot && inArrSlot;
    });

  const [sortBy, setSortBy] = useState<SortKey>("price_low");
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const sortRows = (rows: RowRT[]) => {
    const cp = [...rows];
    cp.sort((a, b) => {
      switch (sortBy) {
        case "price_low":    return a.totalFareINR - b.totalFareINR || a.durationMin - b.durationMin;
        case "price_high":   return b.totalFareINR - a.totalFareINR || a.durationMin - b.durationMin;
        case "duration":     return a.durationMin - b.durationMin || a.totalFareINR - b.totalFareINR;
        case "depart_early": return toMin(a.departTime) - toMin(b.departTime);
        case "arrive_late":  return toMin(b.arriveTime) - toMin(a.arriveTime);
        default: return 0;
      }
    });
    return cp;
  };

  const outFiltered = useMemo(() => sortRows(applyOne(dataOut, fBoth)), [dataOut, fBoth, sortBy]);
  const inFiltered  = useMemo(() => sortRows(applyOne(dataIn , fBoth)), [dataIn , fBoth, sortBy]);

  /* selections */
  const [selOut, setSelOut] = useState<{ flightId: string; fare: FareRT } | null>(null);
  const [selIn , setSelIn ] = useState<{ flightId: string; fare: FareRT } | null>(null);

  // clear selection if the chosen row disappears after filter/sort
  useEffect(() => {
    if (selOut && !outFiltered.some((r) => r.id === selOut.flightId)) setSelOut(null);
  }, [outFiltered, selOut]);
  useEffect(() => {
    if (selIn && !inFiltered.some((r) => r.id === selIn.flightId)) setSelIn(null);
  }, [inFiltered, selIn]);

  /* panel meta (based on visible rows) */
  const metaForPanel = useDatasetMetaRT(
    [...outFiltered, ...inFiltered].length ? [...outFiltered, ...inFiltered] : [...dataOut, ...dataIn]
  );

  /* UI */
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[20px] font-semibold text-gray-900">
          <span className="text-rose-700">{outFiltered.length}</span>
          <span className="text-gray-600"> outbound • </span>
          <span className="text-rose-700">{inFiltered.length}</span>
          <span className="text-gray-600"> return flights</span>{" "}
          {(outFiltered.length + inFiltered.length) > 0 && (
            <span className="text-gray-600">
              from {new Set([...outFiltered, ...inFiltered].map((r) => r.airline)).size} Airlines
            </span>
          )}
        </div>

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
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar filters (apply to BOTH legs) */}
        <div className="col-span-12 hidden md:col-span-3 md:block">
          <FilterPanel
            meta={metaForPanel}
            f={{ ...fBoth, applyTo: "out" }}     // applyTo required by type, but hidden
            setF={(next) => {
              const { applyTo: _ignore, ...payload } = next as unknown as BaseFilters & { applyTo: never };
              setFBoth(payload);                  // one panel -> both legs
            }}
            onReset={() => setFBoth(makeDefault(combinedMeta.minPrice, Math.max(combinedMeta.maxPrice, combinedMeta.minPrice)))}
            showApplyTo={false}
          />
        </div>

        {/* Results */}
        <div className="col-span-12 md:col-span-9">
          <RoundtripList
            outboundRows={outFiltered}
            returnRows={inFiltered}
            selectedOutbound={selOut}
            selectedReturn={selIn}
            onSelectOutboundFare={(id, fare) => setSelOut({ flightId: id, fare })}
            onSelectReturnFare={(id, fare)   => setSelIn ({ flightId: id, fare })}
            fromIata={fromIata}
            toIata={toIata}
            departDate={dateISO}
            returnDate={retISO}
            cabin={cabin}
            pax={pax}
          />
        </div>
      </div>
    </div>
  );
}
