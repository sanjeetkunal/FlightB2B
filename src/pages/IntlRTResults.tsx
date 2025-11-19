// src/pages/IntlRoundTripResults.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FLIGHTS,
  type FlightRow,
  type FlightFare,
} from "../data/flights";

import FilterPanel, {
  type Filters as PanelFilters,
} from "../components/flightlist/FiltersPanel";

import IntlRoundTripResult, {
  type IntlRTRow,
  type FareOption,
  type PaxConfig,
  type LegSummary,
  type PolicyRule,
} from "../components/flightlist/IntlRoundTripResult";

/* ---------- helpers ---------- */

const formatDateLabel = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.toLocaleString("en-GB", { day: "2-digit" });
  const mon = d.toLocaleString("en-GB", { month: "short" });
  const wk = d.toLocaleString("en-GB", { weekday: "short" });
  return `${day} ${mon}, ${wk}`;
};

const toLegSummary = (r: FlightRow): LegSummary => {
  const departDateLbl = formatDateLabel(r.departDate);
  const arriveDateLbl = formatDateLabel(r.arriveDate);
  const fares = r.fares ?? [];

  const handKg = fares.length
    ? Math.max(...fares.map((f) => f.cabinBagKg ?? 0))
    : undefined;
  const checkKg = fares.length
    ? Math.max(...fares.map((f) => f.baggageKg ?? 0))
    : undefined;

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

const buildRTFares = (
  out: FlightRow,
  back: FlightRow
): { total: number; fares: FareOption[] } => {
  const outMin = getMinFare(out.fares);
  const inMin = getMinFare(back.fares);
  const baseRT = outMin + inMin;

  // Special B2B discount e.g. 5%
  const specialPrice = Math.round(baseRT * 0.95);

  const saver: FareOption = {
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

  const flex: FareOption = {
    ...saver,
    code: `${out.id}-${back.id}-RT-FLEX`,
    label: "Special Flex RT",
    price: Math.round(baseRT * 1.02),
    refundable: "Refundable",
    perks: ["Date change allowed", "Higher baggage"],
  };

  return {
    total: specialPrice,
    fares: [saver, flex],
  };
};

const defaultPolicy: {
  refund: PolicyRule[];
  change: PolicyRule[];
  noShowUSD?: number;
} = {
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

const buildIntlRTRows = (
  fromIata: string,
  toIata: string,
  departDate: string,
  returnDate: string,
  cabin?: string
): IntlRTRow[] => {
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

  const rows: IntlRTRow[] = [];

  outbound.forEach((out) => {
    inbound.forEach((back) => {
      const { total, fares } = buildRTFares(out, back);

      rows.push({
        id: `${out.id}__${back.id}`,
        airline: out.airline,
        logo: out.logo,
        refundable:
          out.refundable === "Refundable" &&
          back.refundable === "Refundable"
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

/* ---------- dataset meta for FilterPanel (Intl RT) ---------- */

function useDatasetMetaRT(data: IntlRTRow[]) {
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
      map.set(
        r.outbound.fromIata,
        `${r.outbound.fromCity} (${r.outbound.fromIata})`
      );
      map.set(
        r.inbound.fromIata,
        `${r.inbound.fromCity} (${r.inbound.fromIata})`
      );
    });
    return Array.from(map.entries())
      .map(([code, label]) => ({ code, label }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data]);

  const arriveAirports = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((r) => {
      map.set(
        r.outbound.toIata,
        `${r.outbound.toCity} (${r.outbound.toIata})`
      );
      map.set(
        r.inbound.toIata,
        `${r.inbound.toCity} (${r.inbound.toIata})`
      );
    });
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

/* ---------- component ---------- */

type TimeSlot = "0-6" | "6-12" | "12-18" | "18-24";
type SortKey =
  | "price_low"
  | "price_high"
  | "duration"
  | "depart_early"
  | "arrive_late";

const timeOfDay = (hhmm?: string): TimeSlot => {
  const h = Number((hhmm ?? "00:00").split(":")[0]);
  if (h < 6) return "0-6";
  if (h < 12) return "6-12";
  if (h < 18) return "12-18";
  return "18-24";
};

// Intl RT stops value: 0 if both legs Non-stop, else 1+
const getStopsValue = (r: IntlRTRow): number => {
  const isNonstop = (label?: string) =>
    !label || label.toLowerCase().includes("non-stop");

  const outNon = isNonstop(r.outbound.stopLabel);
  const inNon = isNonstop(r.inbound.stopLabel);

  return outNon && inNon ? 0 : 1;
};

export default function IntlRoundTripResultsPage() {
  const { search } = useLocation();
  const navigate = useNavigate();

  const qp = useMemo(() => new URLSearchParams(search), [search]);

  const fromIata = (qp.get("from") || "").toUpperCase();
  const toIata = (qp.get("to") || "").toUpperCase();
  const departISO = qp.get("depart") || "";
  const returnISO = qp.get("return") || "";
  const cabin = qp.get("cabin") || undefined;

  const adt = Number(qp.get("adt") || "1") || 1;
  const chd = Number(qp.get("chd") || "0") || 0;
  const inf = Number(qp.get("inf") || "0") || 0;

  const paxConfig: PaxConfig = {
    adults: adt,
    children: chd,
    infants: inf,
  };

  const totalPax = adt + chd + inf;
  const paxLabel = `${totalPax} Traveller${totalPax > 1 ? "s" : ""}`;

  const departLbl = departISO ? formatDateLabel(departISO) : "";
  const returnLbl = returnISO ? formatDateLabel(returnISO) : "";

  const raw: IntlRTRow[] = useMemo(() => {
    if (!fromIata || !toIata || !departISO || !returnISO) return [];
    return buildIntlRTRows(fromIata, toIata, departISO, returnISO, cabin);
  }, [fromIata, toIata, departISO, returnISO, cabin]);

  const data = raw;

  const metaBase = useDatasetMetaRT(data);

  // panel filters – same structure as OnewayResults but applyTo used here
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
    applyTo: "both", // yahan Out/In/Both ka toggle kaam karega
  }));

  // Agent commission toggle (page-level)
  const [showCommission, setShowCommission] = useState(false);

  // price range sync
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      priceMin: metaBase.minPrice,
      priceMax: Math.max(metaBase.maxPrice, metaBase.minPrice),
    }));
  }, [metaBase.minPrice, metaBase.maxPrice]);

  const filtered = useMemo(() => {
    const f = filters;

    const inAirline = (a: string) =>
      f.airlines.size === 0 || f.airlines.has(a);

    const inStops = (row: IntlRTRow) => {
      if (f.stops === "any") return true;
      const s = getStopsValue(row);
      return s === f.stops;
    };

    const inRefund = (r: IntlRTRow) =>
      f.refundable === "any" || r.refundable === f.refundable;

    const inPayments = (r: IntlRTRow) =>
      f.payments.size === 0 ||
      r.extras?.some((x) => Array.from(f.payments).includes(x));

    const inPrice = (r: IntlRTRow) =>
      r.totalFareINR >= f.priceMin && r.totalFareINR <= f.priceMax;

    const inFrom = (r: IntlRTRow) => {
      if (f.fromAirports.size === 0) return true;
      const froms = [
        r.outbound.fromIata.toUpperCase(),
        r.inbound.fromIata.toUpperCase(),
      ];
      return froms.some((code) => f.fromAirports.has(code));
    };

    const inTo = (r: IntlRTRow) => {
      if (f.toAirports.size === 0) return true;
      const tos = [
        r.outbound.toIata.toUpperCase(),
        r.inbound.toIata.toUpperCase(),
      ];
      return tos.some((code) => f.toAirports.has(code));
    };

    const inDepSlot = (r: IntlRTRow) => {
      if (f.depSlots.size === 0) return true;

      const outSlot = timeOfDay(r.outbound.departTime);
      const inSlot = timeOfDay(r.inbound.departTime);

      if (f.applyTo === "out") return f.depSlots.has(outSlot);
      if (f.applyTo === "in") return f.depSlots.has(inSlot);

      // both
      return f.depSlots.has(outSlot) || f.depSlots.has(inSlot);
    };

    const inArrSlot = (r: IntlRTRow) => {
      if (f.arrSlots.size === 0) return true;

      const outSlot = timeOfDay(r.outbound.arriveTime);
      const inSlot = timeOfDay(r.inbound.arriveTime);

      if (f.applyTo === "out") return f.arrSlots.has(outSlot);
      if (f.applyTo === "in") return f.arrSlots.has(inSlot);

      return f.arrSlots.has(outSlot) || f.arrSlots.has(inSlot);
    };

    return data.filter((r) => {
      const stopsVal = getStopsValue(r);

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
  }, [filters, data]);

  /* sorting */
  const [sortBy, setSortBy] = useState<SortKey>("price_low");

  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const rows = useMemo(() => {
    const cp = [...filtered];
    cp.sort((a, b) => {
      if (sortBy === "price_low")
        return (
          a.totalFareINR - b.totalFareINR ||
          a.outbound.durationMin +
            a.inbound.durationMin -
            (b.outbound.durationMin + b.inbound.durationMin)
        );
      if (sortBy === "price_high")
        return (
          b.totalFareINR - a.totalFareINR ||
          a.outbound.durationMin +
            a.inbound.durationMin -
            (b.outbound.durationMin + b.inbound.durationMin)
        );
      if (sortBy === "duration")
        return (
          a.outbound.durationMin +
          a.inbound.durationMin -
          (b.outbound.durationMin + b.inbound.durationMin)
        );
      if (sortBy === "depart_early")
        return toMin(a.outbound.departTime) - toMin(b.outbound.departTime);
      if (sortBy === "arrive_late")
        return toMin(b.inbound.arriveTime) - toMin(a.inbound.arriveTime);
      return 0;
    });
    return cp;
  }, [filtered, sortBy]);

  /* selection */
  const [selected, setSelected] = useState<{
    flightId: string;
    fare: FareOption;
  } | null>(null);

  useEffect(() => {
    if (selected && !rows.some((r) => r.id === selected.flightId)) {
      setSelected(null);
    }
  }, [rows, selected]);

  /* meta for panel (filtered rows fallback to base data) */
  const metaForPanel = useDatasetMetaRT(rows.length ? rows : data);

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
      applyTo: "both",
    });
  };

  // Sector label using first row fallback
  const sectorLabel = useMemo(() => {
    if (!fromIata || !toIata) return "";
    const first = data?.[0];
    const fromName = first?.outbound.fromCity || fromIata;
    const toName = first?.outbound.toCity || toIata;
    return `${fromName} (${fromIata}) → ${toName} (${toIata})`;
  }, [fromIata, toIata, data]);

  const handleModifySearch = () => {
    navigate(-1);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* ===== TOP SECTOR STRIP (sticky, same vibe as domestic roundtrip) ===== */}
      <div className="mt-3 mb-3 flex flex-col gap-3 sticky top-[110px] z-20 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Left: sector + dates + pax */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase text-gray-500">
            Intl Round Trip • Sector Details
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

            {returnLbl && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[12px] text-gray-700">
                {returnLbl}
              </span>
            )}

            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[12px] text-gray-700">
              {paxLabel}
            </span>
          </div>
        </div>

        {/* Right: Agent Commission toggle + Sort + Modify Search */}
        <div className="flex flex-wrap items-center gap-2 text-xs md:justify-end">
          {/* Agent Commission toggle */}
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

          {/* Sort dropdown */}
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
              <option value="depart_early">Earliest Departure (Out)</option>
              <option value="arrive_late">Latest Arrival (In)</option>
            </select>
          </div>

          {/* Modify Search */}
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
        {/* Sidebar FiltersPanel */}
        <div className="col-span-12 hidden md:col-span-3 md:block">
          <FilterPanel
            meta={metaForPanel}
            f={filters}
            setF={setFilters}
            onReset={handleReset}
            showApplyTo={true} // RT ke liye Out / In / Both toggle dikhana hai
          />
        </div>

        {/* Results */}
        <div className="col-span-12 md:col-span-9">
          <IntlRoundTripResult
            rows={rows}
            selectedGlobal={selected}
            onSelectFare={(rowId, fare) =>
              setSelected({ flightId: rowId, fare })
            }
            paxConfig={paxConfig}
            showCommission={showCommission}
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
        </div>
      </div>
    </div>
  );
}
