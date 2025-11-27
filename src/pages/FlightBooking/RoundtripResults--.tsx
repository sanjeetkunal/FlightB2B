// src/pages/RoundtripResults.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  searchFlights,
  type FlightRow,
  type FlightFare,
} from "../../data/flights";
import FilterPanel, {
  type Filters as PanelFilters,
} from "../../components/flightlist/FiltersPanel";
import RoundtripList, {
  type RowRT,
  type FareRT,
} from "../../components/flightlist/RoundTripResultList";

/* ---------------------- helpers ---------------------- */
const formatDateLabel = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.toLocaleString("en-GB", { day: "2-digit" });
  const mon = d.toLocaleString("en-GB", { month: "short" });
  const wk = d.toLocaleString("en-GB", { weekday: "short" });
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
  badge:
    f.changeFeeINR === 0
      ? { text: "Published", tone: "published" }
      : { text: "Offer Fare", tone: "offer" },
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
      refundable: normRefundable(r.refundable),
      extras: r.extras ?? [],

      segments:
        (r as any).segments ?? [
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
        handKg: fares.length
          ? Math.max(...fares.map((x) => x.cabinBagKg ?? 0))
          : 0,
        checkKg: fares.length
          ? Math.max(...fares.map((x) => x.baggageKg ?? 0))
          : 0,
        piece: "1 piece only",
      },

      cancellation:
        (r as any).cancellation ?? {
          refund: [
            {
              when: "≥ 24h before",
              feeUSD: fares.some((x) => x.refundable) ? 0 : 200,
            },
          ],
          change: [
            {
              when: "Date/Time change (per pax)",
              feeUSD: fares.some((x) => x.changeFeeINR === 0) ? 0 : 150,
              note: "Fare diff applies",
            },
          ],
          noShowUSD: 250,
        },

      fares: fares.map(mapFareRT),
    };
  });

/* meta for FilterPanel */
function useDatasetMetaRT(data: RowRT[]) {
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
    data.forEach((r) =>
      map.set(r.fromIata, `${r.fromCity} (${r.fromIata})`)
    );
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

  return {
    airlines,
    minPrice,
    maxPrice,
    airlineMinPrice,
    departAirports,
    arriveAirports,
  };
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
const toBase = (f: PanelFilters): BaseFilters => ({
  airlines: f.airlines,
  stops: f.stops,
  refundable: f.refundable,
  payments: f.payments,
  priceMin: f.priceMin,
  priceMax: f.priceMax,
  nonstopOnly: f.nonstopOnly,
  hideNearby: f.hideNearby,
  fromAirports: f.fromAirports,
  toAirports: f.toAirports,
  depSlots: f.depSlots,
  arrSlots: f.arrSlots,
});

const makeDefaultBase = (min: number, max: number): BaseFilters => ({
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

const makeDefaultFilters = (min: number, max: number): PanelFilters => ({
  ...makeDefaultBase(min, max),
  applyTo: "both",
});

type SortKey = "price_low" | "price_high" | "duration" | "depart_early" | "arrive_late";

/* ---------------------- page component ---------------------- */
export default function RoundtripResults() {
  const { search } = useLocation();
  const navigate = useNavigate();

  const qp = useMemo(() => new URLSearchParams(search), [search]);

  const fromIata = (qp.get("from") || "").toUpperCase();
  const toIata = (qp.get("to") || "").toUpperCase();
  const dateISO = qp.get("date") || "";
  const retISO = qp.get("ret") || "";
  const cabin = (qp.get("cabin") || "") as any;
  const pax = Number(qp.get("pax") || "1") || 1;

  const departLabel = formatDateLabel(dateISO);
  const returnLabel = formatDateLabel(retISO);

  /* fetch rows for both legs */
  const rawOut = useMemo(
    () =>
      !fromIata || !toIata
        ? []
        : searchFlights({ fromIata, toIata, departDate: dateISO, cabin }),
    [fromIata, toIata, dateISO, cabin]
  );
  const rawIn = useMemo(
    () =>
      !fromIata || !toIata
        ? []
        : searchFlights({
            fromIata: toIata,
            toIata: fromIata,
            departDate: retISO,
            cabin,
          }),
    [fromIata, toIata, retISO, cabin]
  );

  const dataOut: RowRT[] = useMemo(() => adaptRT(rawOut), [rawOut]);
  const dataIn: RowRT[] = useMemo(() => adaptRT(rawIn), [rawIn]);

  /* filters – shared, with applyTo out / in / both */
  const combinedMeta = useDatasetMetaRT([...dataOut, ...dataIn]);
  const [filters, setFilters] = useState<PanelFilters>(() =>
    makeDefaultFilters(
      combinedMeta.minPrice,
      Math.max(combinedMeta.maxPrice, combinedMeta.minPrice)
    )
  );

  // Agent commission toggle (page-level) – shared with list
  const [showCommission, setShowCommission] = useState(false);

  // keep price bounds updated when dataset changes
  useEffect(() => {
    const min = combinedMeta.minPrice;
    const max = Math.max(combinedMeta.maxPrice, combinedMeta.minPrice);
    setFilters((f) => ({
      ...f,
      priceMin: min,
      priceMax: Math.min(f.priceMax, max),
    }));
  }, [combinedMeta.minPrice, combinedMeta.maxPrice]);

  const applyOne = (rows: RowRT[], f: BaseFilters) =>
    rows.filter((r) => {
      const inAirline = f.airlines.size === 0 || f.airlines.has(r.airline);
      const inStops = f.stops === "any" || r.stops === f.stops;
      const inRefund =
        f.refundable === "any" || r.refundable === f.refundable;
      const inPayments =
        f.payments.size === 0 ||
        r.extras?.some((x) => Array.from(f.payments).includes(x));
      const inPrice =
        r.totalFareINR >= f.priceMin && r.totalFareINR <= f.priceMax;
      const inFrom =
        f.fromAirports.size === 0 ||
        f.fromAirports.has(r.fromIata.toUpperCase());
      const inTo =
        f.toAirports.size === 0 ||
        f.toAirports.has(r.toIata.toUpperCase());
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

  const [sortBy, setSortBy] = useState<SortKey>("price_low");
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const sortRows = (rows: RowRT[]) => {
    const cp = [...rows];
    cp.sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return (
            a.totalFareINR - b.totalFareINR ||
            a.durationMin - b.durationMin
          );
        case "price_high":
          return (
            b.totalFareINR - a.totalFareINR ||
            a.durationMin - b.durationMin
          );
        case "duration":
          return (
            a.durationMin - b.durationMin ||
            a.totalFareINR - b.totalFareINR
          );
        case "depart_early":
          return toMin(a.departTime) - toMin(b.departTime);
        case "arrive_late":
          return toMin(b.arriveTime) - toMin(a.arriveTime);
        default:
          return 0;
      }
    });
    return cp;
  };

  const outFiltered = useMemo(() => {
    const base = toBase(filters);
    const rows =
      filters.applyTo === "in" ? dataOut : applyOne(dataOut, base); // only inbound filtered
    return sortRows(rows);
  }, [dataOut, filters, sortBy]);

  const inFiltered = useMemo(() => {
    const base = toBase(filters);
    const rows =
      filters.applyTo === "out" ? dataIn : applyOne(dataIn, base); // only outbound filtered
    return sortRows(rows);
  }, [dataIn, filters, sortBy]);

  /* selections */
  const [selOut, setSelOut] =
    useState<{ flightId: string; fare: FareRT } | null>(null);
  const [selIn, setSelIn] =
    useState<{ flightId: string; fare: FareRT } | null>(null);

  // clear selection if the chosen row disappears after filter/sort
  useEffect(() => {
    if (selOut && !outFiltered.some((r) => r.id === selOut.flightId))
      setSelOut(null);
  }, [outFiltered, selOut]);
  useEffect(() => {
    if (selIn && !inFiltered.some((r) => r.id === selIn.flightId))
      setSelIn(null);
  }, [inFiltered, selIn]);

  /* panel meta (based on visible rows) */
  const metaForPanel = useDatasetMetaRT(
    [...outFiltered, ...inFiltered].length
      ? [...outFiltered, ...inFiltered]
      : [...dataOut, ...dataIn]
  );

  // sector label & pax label for header strip
  const sectorLabel = useMemo(() => {
    if (!fromIata || !toIata) return "";
    const first = dataOut?.[0];
    const fromName = first?.fromCity || fromIata;
    const toName = first?.toCity || toIata;
    return `${fromName} (${fromIata}) → ${toName} (${toIata})`;
  }, [fromIata, toIata, dataOut]);

  const paxLabel = useMemo(
    () => `${pax} Traveller${pax > 1 ? "s" : ""}`,
    [pax]
  );

  const handleModifySearch = () => {
    navigate(-1);
  };

  /* UI */
  return (
    <div className="mx-auto max-w-7xl">
      {/* ===== TOP SECTOR STRIP (same look as oneway) ===== */}
        <div className="mt-3 mb-3 flex flex-col gap-3 sticky top-[110px] z-20 rounded-1xl border border-gray-200 bg-white px-3 py-2 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
         
          <div className="text-[11px] font-semibold uppercase text-gray-500">
            Round Trip • Sector Details
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-gray-900 px-3 py-1 text-[13px] font-semibold text-white">
              {sectorLabel}
            </span>
            {/* <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[12px] text-gray-700">
              {dateLabel}
            </span> */}
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[12px] text-gray-700">
              {paxLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs md:justify-end">
          <button
            type="button"
            onClick={() => setShowCommission((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium ${
              showCommission
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-300 bg-white text-gray-700"
            }`}
          >
            <span>Agent Commission</span>
            <span
              className={`flex h-4 w-8 items-center rounded-full px-[2px] transition ${
                showCommission ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`h-3 w-3 transform rounded-full bg-white shadow transition ${
                  showCommission ? "translate-x-4" : ""
                }`}
              />
            </span>
          </button>

          <div className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1.5">
            <span className="text-[11px] text-gray-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-transparent text-[12px] text-gray-800 outline-none"
            >
              <option value="price_low">Price (Lowest)</option>
              <option value="price_high">Price (Highest)</option>
              <option value="duration">Duration (Shortest)</option>
              <option value="depart_early">Earliest Departure</option>
              <option value="arrive_late">Latest Arrival</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleModifySearch}
            className="inline-flex items-center gap-1 rounded-full border border-blue-500 bg-white px-3 py-1.5 text-[12px] font-medium text-blue-600 hover:bg-blue-50"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
              <path
                d="M4 5h16v2H4zm0 6h10v2H4zm0 6h7v2H4z"
                fill="currentColor"
              />
            </svg>
            Modify Search
          </button>
        </div>
      </div>

      {/* ===== Layout: filters + results ===== */}
      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar filters (apply to BOTH / OUT / IN) */}
        <div className="col-span-12 hidden md:col-span-3 md:block">
          <FilterPanel
            meta={metaForPanel}
            f={filters}
            setF={setFilters}
            onReset={() =>
              setFilters(
                makeDefaultFilters(
                  combinedMeta.minPrice,
                  Math.max(
                    combinedMeta.maxPrice,
                    combinedMeta.minPrice
                  )
                )
              )
            }
            showApplyTo={true}
          />
        </div>

        {/* Results */}
        <div className="col-span-12 md:col-span-9">
          <RoundtripList
            outboundRows={outFiltered}
            returnRows={inFiltered}
            selectedOutbound={selOut}
            selectedReturn={selIn}
            onSelectOutboundFare={(id, fare) =>
              setSelOut({ flightId: id, fare })
            }
            onSelectReturnFare={(id, fare) =>
              setSelIn({ flightId: id, fare })
            }
            fromIata={fromIata}
            toIata={toIata}
            departDate={dateISO}
            returnDate={retISO}
            cabin={cabin}
            pax={pax}
            showCommission={showCommission}
          />
        </div>
      </div>
    </div>
  );
}
