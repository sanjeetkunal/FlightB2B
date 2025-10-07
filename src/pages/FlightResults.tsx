import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FromToBar from "../components/flightsearch/FromToBar";

/* ====== import seed + types from flights.ts ====== */
import { searchFlights, type FlightRow, type FlightFare } from "../data/flights";

/* ========= Local types (your FlightList UI) ========= */
type Segment = {
  fromCity: string; fromIata: string; departTime: string; departDate: string;
  toCity: string;   toIata: string;   arriveTime: string; arriveDate: string;
  carrier: string; flightNo: string; durationMin: number;
  layoverAt?: string; layoverMin?: number;
  fromTerminal?: string; toTerminal?: string;
  aircraft?: string; layout?: string; beverage?: boolean;
  seatType?: string; legroomInch?: number;
};
type PolicyRule = { when: string; feeUSD: number; note?: string };
type FareOption = {
  code: "SME" | "CORPORATE" | "FLEXI" | string;
  label: string;
  price: number;  // INR
  refundable: "Refundable" | "Non Refundable";
  cabin?: string;
  meal?: "Paid Meal" | "Free Meal" | "No Meal" | string;
  badge?: { text: string; tone?: "offer" | "published" };
  refNo?: number;
  baggage?: { handKg?: number; checkKg?: number };
  seat?: string;
  commissionINR?: number;
  agentFareINR?: number;
  perks?: string[];
};
type Row = {
  id: string;
  airline: string;
  logoBg: string;
  flightNos: string;
  fromCity: string; fromIata: string; departTime: string; departDate: string;
  toCity: string; toIata: string; arriveTime: string; arriveDate: string;
  stops: 0 | 1 | 2;
  stopLabel: string;
  durationMin: number;
  totalFareINR: number;
  commissionUSD: number; agentFareUSD: number;
  refundable: "Refundable" | "Non-Refundable";
  extras?: string[];
  segments: Segment[];
  baggage: { handKg?: number; checkKg?: number; piece?: string };
  cancellation: { refund: PolicyRule[]; change: PolicyRule[]; noShowUSD?: number };
  fares: FareOption[];
};

/* ========= Utils ========= */
const Money = ({ v, currency = "INR" as const, fractionDigits = 2 }:{
  v: number; currency?: "INR" | "USD"; fractionDigits?: number;
}) => <>{new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, maximumFractionDigits: fractionDigits }).format(v)}</>;

const minsToLabel = (m?: number) => {
  if (m == null) return "";
  const h = Math.floor(m / 60); const mm = m % 60;
  return `${h}h ${String(mm).padStart(2, "0")}m`;
};
const formatDateLabel = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.toLocaleString("en-GB", { day: "2-digit" });
  const mon = d.toLocaleString("en-GB", { month: "short" });
  const wk  = d.toLocaleString("en-GB", { weekday: "short" });
  return `${day} ${mon}, ${wk}`;
};

/* ========= flights.ts → your UI adapter ========= */
function mapFare(f: FlightFare): FareOption {
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
function adaptRows(rows: FlightRow[]): Row[] {
  return rows.map((r) => {
    const departDateLbl = formatDateLabel(r.departDate);
    const arriveDateLbl = formatDateLabel(r.arriveDate);
    return {
      id: r.id,
      airline: r.airline,
      logoBg: r.logoBg,
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

/* ========= Logos & Header ========= */
const CircleLogo = ({ bg }: { bg: string }) => (
  <div className="grid h-9 w-9 place-items-center rounded-full text-white shadow-sm" style={{ background: bg }}>
    <svg viewBox="0 0 24 24" className="h-4 w-4"><path d="M2 12l20 2-6-4 3-7-3-1-5 8-5-1-1 2 5 2-2 7 2 1 3-7" fill="currentColor" /></svg>
  </div>
);
function SmallLogo({ bg }: { bg: string }) {
  return (
    <span className="inline-grid h-5 w-5 place-items-center rounded-full text-white ring-1 ring-black/5" style={{ background: bg }}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M2 12l20 2-6-4 3-7-3-1-5 8-5-1-1 2 5 2-2 7 2 1 3-7" fill="currentColor" /></svg>
    </span>
  );
}
function DetailsHeader({ airline, logoBg, flightNos }:{ airline: string; logoBg: string; flightNos: string }) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <CircleLogo bg={logoBg} />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-gray-900">{airline}</div>
          <div className="truncate text-xs text-gray-600">Flight(s): <span className="font-medium">{flightNos}</span></div>
        </div>
      </div>
      <div className="hidden items-center gap-2 sm:flex text-xs text-gray-600">Aircraft • Economy</div>
    </div>
  );
}

/* === Arc with icons === */
const TAKEOFF_ICON = "https://cdn-icons-png.flaticon.com/128/8943/8943898.png";
const LANDING_ICON = "https://cdn-icons-png.flaticon.com/128/6591/6591567.png";
const ArcTimeline = ({ label, leftIcon = TAKEOFF_ICON, rightIcon = LANDING_ICON }:{
  label: string; leftIcon?: string; rightIcon?: string;
}) => (
  <div className="relative flex items-center justify-center">
    <svg width="260" height="50" viewBox="0 0 260 50" className="text-gray-300">
      <g transform="translate(20,32)"><image href={leftIcon} width="16" height="16" x="-8" y="-8" /></g>
      <g transform="translate(240,32)"><image href={rightIcon} width="16" height="16" x="-8" y="-8" /></g>
      <path d="M20 32 Q130 4 240 32" stroke="currentColor" strokeDasharray="4 6" strokeWidth="2" fill="none" />
      <circle cx="130" cy="18" r="6" fill="white" stroke="currentColor" strokeWidth="1.5" />
    </svg>
    <div className="absolute -top-0 text-[11px] font-medium text-gray-600">{label}</div>
  </div>
);

/* ========= Dataset meta ========= */
type TimeSlot = "0-6" | "6-12" | "12-18" | "18-24";
type SortKey = "price_low" | "price_high" | "duration" | "depart_early" | "arrive_late";
type Filters = {
  airlines: Set<string>;
  stops: "any" | 0 | 1 | 2;
  refundable: "any" | "Refundable" | "Non-Refundable";
  payments: Set<string>;
  priceMin: number;
  priceMax: number;
  nonstopOnly: boolean;
  hideNearby: boolean;
  fromAirports: Set<string>;
  toAirports: Set<string>;
  depSlots: Set<TimeSlot>;
  arrSlots: Set<TimeSlot>;
};
const timeOfDay = (hhmm: string): TimeSlot => {
  const h = Number(hhmm.split(":")[0]);
  if (h < 6) return "0-6";
  if (h < 12) return "6-12";
  if (h < 18) return "12-18";
  return "18-24";
};
const useDatasetMeta = (data: Row[]) => {
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
};

/* ========= Filter Panel ========= */
function FilterPanel({ meta, f, setF, onReset, mobile, onClose }:{
  meta: ReturnType<typeof useDatasetMeta>;
  f: Filters; setF: (x: Filters) => void;
  onReset: () => void;
  mobile?: boolean; onClose?: () => void;
}) {
  const toggleSet = (set: Set<string>, val: string) => {
    const next = new Set(set); next.has(val) ? next.delete(val) : next.add(val); return next;
  };
  const toggleSlot = (set: Set<TimeSlot>, val: TimeSlot) => {
    const next = new Set(set); next.has(val) ? next.delete(val) : next.add(val); return next;
  };
  const SlotChip = ({ v, label }:{ v: TimeSlot; label: string }) => (
    <button
      onClick={() => setF({ ...f, depSlots: toggleSlot(f.depSlots, v) })}
      className={`rounded-md px-2 py-1 text-xs ring-1 ${f.depSlots.has(v) ? "bg-gray-900 text-white ring-gray-900" : "bg-white text-gray-700 ring-gray-300"}`}
    >{label}</button>
  );
  const SlotChipArr = ({ v, label }:{ v: TimeSlot; label: string }) => (
    <button
      onClick={() => setF({ ...f, arrSlots: toggleSlot(f.arrSlots, v) })}
      className={`rounded-md px-2 py-1 text-xs ring-1 ${f.arrSlots.has(v) ? "bg-gray-900 text-white ring-gray-900" : "bg-white text-gray-700 ring-gray-300"}`}
    >{label}</button>
  );

  return (
    <aside className={`rounded-2xl bg-white ${mobile ? "" : "p-4"} sm:p-4 text-[13px]`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold">Applied Filters</h3>
        <div className="flex items-center gap-2">
          {mobile && <button onClick={onClose} className="rounded-lg border px-3 py-1 text-sm">Close</button>}
          <button onClick={onReset} className="text-sm text-gray-600 hover:text-gray-900">Clear all</button>
        </div>
      </div>

      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-medium">Popular Filters</div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2">
              <input type="checkbox" checked={f.nonstopOnly} onChange={() => setF({ ...f, nonstopOnly: !f.nonstopOnly, stops: !f.nonstopOnly ? 0 : "any" })}/>
              Non Stop
            </span>
            <span className="text-gray-500"><Money v={meta.minPrice} /></span>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2">
              <input type="checkbox" checked={f.hideNearby} onChange={() => setF({ ...f, hideNearby: !f.hideNearby })}/>
              Hide Nearby Airports
            </span>
            <span className="text-gray-500"><Money v={meta.minPrice} /></span>
          </label>
          {meta.airlines.slice(0, 1).map(al => (
            <label key={al} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <input type="checkbox" checked={f.airlines.size === 0 ? false : f.airlines.has(al)} onChange={() => setF({ ...f, airlines: toggleSet(f.airlines, al) })}/>
                {al}
              </span>
              <span className="text-gray-500"><Money v={meta.airlineMinPrice[al]} /></span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-2 font-medium">One Way Price</div>
        <input
          type="range"
          min={Math.floor(meta.minPrice)}
          max={Math.ceil(Math.max(meta.maxPrice, meta.minPrice))}
          step={1}
          value={Math.floor(f.priceMax)}
          onChange={(e) => setF({ ...f, priceMax: Number(e.target.value) })}
          className="w-full"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
          <span><Money v={meta.minPrice} /></span>
          <span><Money v={f.priceMax} /></span>
        </div>
      </div>

      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-2 font-medium">Stops</div>
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <input type="radio" name={mobile ? "m_stops" : "stops"} checked={f.stops === 0} onChange={() => setF({ ...f, stops: 0, nonstopOnly: true })}/>
              Non Stop
            </span>
            <span className="text-gray-500"><Money v={meta.minPrice} /></span>
          </label>
          <label className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <input type="radio" name={mobile ? "m_stops" : "stops"} checked={f.stops === 1} onChange={() => setF({ ...f, stops: 1, nonstopOnly: false })}/>
              1 Stop
            </span>
            <span className="text-gray-500"><Money v={meta.maxPrice} /></span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name={mobile ? "m_stops" : "stops"} checked={f.stops === "any"} onChange={() => setF({ ...f, stops: "any", nonstopOnly: false })}/>
            Any
          </label>
        </div>
      </div>

      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-2 font-medium">Departure Time</div>
        <div className="flex flex-wrap gap-2">
          <SlotChip v="0-6" label="Early Morning (12–6)" />
          <SlotChip v="6-12" label="Morning (6–12)" />
          <SlotChip v="12-18" label="Afternoon (12–6)" />
          <SlotChip v="18-24" label="Evening (6–12)" />
        </div>
      </div>

      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-2 font-medium">Arrival Time</div>
        <div className="flex flex-wrap gap-2">
          <SlotChipArr v="0-6" label="Early Morning (12–6)" />
          <SlotChipArr v="6-12" label="Morning (6–12)" />
          <SlotChipArr v="12-18" label="Afternoon (12–6)" />
          <SlotChipArr v="18-24" label="Evening (6–12)" />
        </div>
      </div>

      <div>
        <div className="mb-2 font-medium">Airlines</div>
        <div className="space-y-2">
          {meta.airlines.map(a => (
            <label key={a} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <input type="checkbox" checked={f.airlines.size === 0 ? false : f.airlines.has(a)} onChange={() => setF({ ...f, airlines: toggleSet(f.airlines, a) })}/>
                {a}
              </span>
              <span className="text-gray-500"><Money v={meta.airlineMinPrice[a]} /></span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ========= Details: itinerary/baggage/cancel/fare ========= */
const AmenIconLayout = () => (<svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500"><path d="M3 7h18v2H3zm0 4h18v2H3zm0 4h18v2H3z" fill="currentColor" /></svg>);
const AmenIconDrink  = () => (<svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500"><path d="M4 3h16l-2 5h-4l1 11H9l1-11H6L4 3z" fill="currentColor" /></svg>);
const AmenIconSeat   = () => (<svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500"><path d="M7 3h7v9h5v9h-2v-7h-5V5H9v16H7V3z" fill="currentColor" /></svg>);
function SegmentCard({ s, logoBg, airline, rowBaggage }:{
  s: Segment; logoBg: string; airline: string;
  rowBaggage: { handKg?: number; checkKg?: number; piece?: string };
}) {
  const dur = minsToLabel(s.durationMin);
  const piece = rowBaggage.piece || "1 piece only";
  const hand = rowBaggage.handKg ?? 0, check = rowBaggage.checkKg ?? 0;
  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SmallLogo bg={logoBg} />
          <div className="text-sm font-semibold text-gray-900">{airline} {s.carrier}-{s.flightNo}</div>
        </div>
        {s.aircraft && <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700 ring-1 ring-gray-200">{s.aircraft}</span>}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.1fr_auto_1.1fr_auto_auto_auto] md:items-start">
        <div>
          <div className="text-lg font-semibold text-gray-900">{s.departTime}</div>
          <div className="text-xs text-gray-500">{s.departDate}</div>
          <div className="mt-1 text-sm text-gray-700">{s.fromCity}, {s.fromIata}</div>
          {s.fromTerminal && <div className="text-xs text-gray-500">Terminal {s.fromTerminal}</div>}
        </div>
        <div className="mx-1 grid place-items-center">
          <div className="text-[12px] font-medium text-gray-700">{dur.replace("h","h ").replace("m"," m")}</div>
          <div className="mt-1 h-1.5 w-14 rounded bg-gray-200"><div className="h-1.5 w-2/3 rounded bg-emerald-500" /></div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">{s.arriveTime}</div>
          <div className="text-xs text-gray-500">{s.arriveDate}</div>
          <div className="mt-1 text-sm text-gray-700">{s.toCity}, {s.toIata}</div>
          {s.toTerminal && <div className="text-xs text-gray-500">Terminal {s.toTerminal}</div>}
        </div>
        <div className="hidden text-right md:block">
          <div className="text-[11px] font-semibold text-gray-600">BAGGAGE :</div>
          <div className="text-[11px] font-semibold text-gray-800">ADULT</div>
        </div>
        <div className="hidden md:block">
          <div className="text-[11px] font-semibold text-gray-600">CHECK IN</div>
          <div className="text-[12px] text-gray-800">{check} Kgs ({piece})</div>
        </div>
        <div className="hidden md:block">
          <div className="text-[11px] font-semibold text-gray-600">CABIN</div>
          <div className="text-[12px] text-gray-800">{hand} Kgs ({piece})</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 border-t border-dashed border-gray-200 pt-2 text-[12px] text-gray-700 md:grid-cols-3">
        <div className="flex items-center gap-2"><AmenIconLayout /> {s.layout || "3-3 Layout"}</div>
        <div className="flex items-center gap-2"><AmenIconDrink /> {s.beverage !== false ? "Beverage Available" : "No Beverage"}</div>
        <div className="flex items-center gap-2"><AmenIconSeat /> {s.seatType || "Standard Recliner"} ({s.legroomInch ?? 28}" Legroom)</div>
      </div>
    </div>
  );
}
function LayoverBadge({ text }: { text: string }) {
  return (
    <div className="relative my-3 flex items-center">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="mx-2 rounded-md bg-amber-50 px-2 py-1 text-[12px] font-medium text-amber-800 ring-1 ring-amber-200">{text}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}
function ItineraryPanel({ segs, logoBg, airline, rowBaggage }:{
  segs: Segment[]; logoBg: string; airline: string;
  rowBaggage: { handKg?: number; checkKg?: number; piece?: string };
}) {
  return (
    <div>
      {segs.map((s, i) => (
        <div key={i}>
          <SegmentCard s={s} logoBg={logoBg} airline={airline} rowBaggage={rowBaggage} />
          {s.layoverAt && s.layoverMin != null && (
            <LayoverBadge text={`Change of planes • ${minsToLabel(s.layoverMin)} Layover in ${s.layoverAt}`} />
          )}
        </div>
      ))}
    </div>
  );
}
function BaggagePanel({ hand, check, piece }:{ hand?: number; check?: number; piece?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="grid grid-cols-3 bg-gray-50 text-xs font-semibold text-gray-700">
        <div className="border-r border-gray-200 p-2">Cabin</div>
        <div className="border-r border-gray-200 p-2">Check-in</div>
        <div className="p-2">Policy</div>
      </div>
      <div className="grid grid-cols-3 text-sm">
        <div className="border-r border-gray-200 p-3">{hand ?? 0} kg</div>
        <div className="border-r border-gray-200 p-3">{check ?? 0} kg</div>
        <div className="p-3">{piece || "As per airline allowance"}</div>
      </div>
    </div>
  );
}
function CancellationPanel({ refund, change, noShowUSD }:{ refund: PolicyRule[]; change: PolicyRule[]; noShowUSD?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="mb-2 text-sm font-semibold">Refund rules</div>
        <ul className="space-y-1 text-sm text-gray-700">
          {refund.map((r, i) => (<li key={i} className="flex items-start justify-between gap-3"><span>{r.when}</span><span className="font-medium">₹{r.feeUSD}</span></li>))}
        </ul>
        {typeof noShowUSD === "number" && (<div className="mt-2 text-xs text-gray-600">No-show fee: <span className="font-semibold">₹{noShowUSD}</span></div>)}
      </div>
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="mb-2 text-sm font-semibold">Change rules</div>
        <ul className="space-y-1 text-sm text-gray-700">
          {change.map((r, i) => (<li key={i} className="flex items-start justify-between gap-3"><span>{r.when}{r.note ? ` — ${r.note}` : ""}</span><span className="font-medium">₹{r.feeUSD}</span></li>))}
        </ul>
      </div>
    </div>
  );
}
function SelectedFarePanel({ fare }: { fare: FareOption }) {
  const refundableTone = fare.refundable === "Refundable" ? "text-emerald-700" : "text-rose-700";
  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="text-[13px] text-gray-600">Selected Fare</div>
        <div className="text-[18px] font-bold text-gray-900"><Money v={fare.price} /></div>
        {fare.badge?.text && (
          <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${fare.badge?.tone === "offer" ? "text-pink-700 ring-1 ring-pink-200 bg-pink-50" : "text-amber-800 ring-1 ring-amber-200 bg-amber-50"}`}>{fare.badge.text}</span>
        )}
        <span className={`text-[12px] ${refundableTone} font-medium`}>{fare.refundable}</span>
      </div>
      <div className="text-[12px] text-gray-700">{fare.cabin || "Economy"}{fare.meal ? `, ${fare.meal}` : ""}</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-[11px] text-gray-500">Baggage</div>
          <div className="mt-0.5 text-sm font-medium">
            {(fare.baggage?.handKg ?? "—")}kg cabin • {(fare.baggage?.checkKg ?? "—")}kg check-in
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-[11px] text-gray-500">Seat</div>
          <div className="mt-0.5 text-sm font-medium">{fare.seat || "Seat selection (paid)"}</div>
        </div>
      </div>
    </div>
  );
}
type DetailsTab = "itinerary" | "baggage" | "cancellation" | "fare";
function RowTabs({ active, onChange }:{ active: DetailsTab; onChange: (t: DetailsTab) => void }) {
  const TabBtn = ({ id, label }:{ id: DetailsTab; label: string }) => (
    <button onClick={() => onChange(id)} className={`rounded-lg border px-3 py-1.5 text-sm transition ${active === id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>{label}</button>
  );
  return (
    <div className="flex flex-wrap gap-2">
      <TabBtn id="itinerary" label="Itinerary" />
      <TabBtn id="baggage" label="Baggage" />
      <TabBtn id="cancellation" label="Cancellation & Changes" />
      <TabBtn id="fare" label="Fare Details" />
    </div>
  );
}

/* ========= Fare pickers ========= */
function FareOneLine({ fare, placeholder, onClick }:{ fare: FareOption | null; placeholder: string; onClick: () => void; }) {
  const badgeTone = fare?.badge?.tone === "offer" ? "bg-pink-50 text-pink-700 ring-pink-200" : "bg-amber-50 text-amber-800 ring-amber-200";
  return (
    <button onClick={onClick} className="inline-flex max-w-full items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-left text-[12px] hover:bg-gray-50" title="Change fare">
      <span className={`h-3.5 w-3.5 rounded-full border ${fare ? "border-gray-800" : "border-gray-400"} grid place-items-center`}>{fare && <span className="h-2 w-2 rounded-full bg-gray-800" />}</span>
      {fare ? (
        <div className="flex min-w-0 items-center gap-2">
          {fare.refNo != null && <span className="text-[10px] text-gray-500 -translate-y-[2px]">{fare.refNo}</span>}
          <span className="whitespace-nowrap text-[14px] font-bold text-gray-900"><Money v={fare.price} /></span>
          <span className="relative group">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700">i</span>
            <div className="pointer-events-none absolute left-1/2 z-30 mt-2 w-72 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 opacity-0 shadow-2xl transition group-hover:opacity-100">
              <div className="mb-1 flex items-center justify-between text-[12px]"><span className="font-semibold">{fare.label} • {fare.cabin || "—"}</span><span className="font-semibold"><Money v={fare.price} /></span></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-gray-50 p-2"><div className="text-[11px] text-gray-500">Baggage</div><div className="mt-0.5 font-medium">{fare.baggage?.handKg != null ? `${fare.baggage.handKg}kg cabin` : "Cabin: airline"}<br/>{fare.baggage?.checkKg != null ? `${fare.baggage.checkKg}kg check-in` : "Check-in: airline"}</div></div>
                <div className="rounded-md bg-gray-50 p-2"><div className="text-[11px] text-gray-500">Seat</div><div className="mt-0.5 font-medium">{fare.seat || "Seat selection (paid)"}</div></div>
              </div>
              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-gray-200 bg-white" />
            </div>
          </span>
          {fare.badge?.text && (<span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${badgeTone}`}>{fare.badge.text}</span>)}
          <span className="truncate text-[12px] text-gray-700">{(fare.cabin || "Economy")}{fare.meal ? `, ${fare.meal}` : ""},{" "}<span className={fare.refundable === "Refundable" ? "text-emerald-700 font-medium" : "text-rose-700 font-medium"}>{fare.refundable}</span></span>
        </div>
      ) : (<span className="text-[12px] text-gray-600">{placeholder}</span>)}
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500"><path d="M7 10l5 5 5-5" fill="currentColor" /></svg>
    </button>
  );
}
function FareListRows({ fares, name, selectedCode, onSelect }:{
  fares: FareOption[]; name: string; selectedCode?: string; onSelect: (f: FareOption) => void;
}) {
  const row = (f: FareOption, last: boolean) => {
    const badgeTone = f.badge?.tone === "offer" ? "bg-pink-50 text-pink-700 ring-pink-200" : "bg-amber-50 text-amber-800 ring-amber-200";
    const refundableTone = f.refundable === "Refundable" ? "text-emerald-700" : "text-rose-700";
    return (
      <label key={f.code} className={`grid cursor-pointer grid-cols-[18px_1fr] items-center gap-2 px-2 py-2 ${!last ? "border-b border-gray-100" : ""}`}>
        <input type="radio" name={name} value={f.code} checked={selectedCode === f.code} onChange={() => onSelect(f)} className="h-3.5 w-3.5 accent-gray-800" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {f.refNo != null && <span className="text-[10px] text-gray-500 -translate-y-[2px]">{f.refNo}</span>}
            <span className="text-[15px] font-semibold text-gray-900"><Money v={f.price} /></span>
            <span className="relative group">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700">i</span>
              <div className="pointer-events-none absolute left-0 z-30 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 opacity-0 shadow-2xl transition group-hover:opacity-100">
                <div className="mb-1 flex items-center justify-between text-[12px]"><span className="font-semibold">{f.label} • {f.cabin || "—"}</span><span className="font-semibold"><Money v={f.price} /></span></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-gray-50 p-2"><div className="text-[11px] text-gray-500">Baggage</div><div className="mt-0.5 font-medium">{f.baggage?.handKg != null ? `${f.baggage.handKg}kg cabin` : "Cabin: airline"}<br/>{f.baggage?.checkKg != null ? `${f.baggage.checkKg}kg check-in` : "Check-in: airline"}</div></div>
                  <div className="rounded-md bg-gray-50 p-2"><div className="text-[11px] text-gray-500">Seat</div><div className="mt-0.5 font-medium">{f.seat || "Seat selection (paid)"}</div></div>
                </div>
                <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 border-l border-t border-gray-200 bg-white" />
              </div>
            </span>
            {f.badge?.text && <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${badgeTone}`}>{f.badge.text}</span>}
            <span className="truncate text-[12px] text-gray-700">{(f.cabin || "Economy")}{f.meal ? `, ${f.meal}` : ""},{" "}<span className={`${refundableTone} font-medium`}>{f.refundable}</span></span>
          </div>
        </div>
      </label>
    );
  };
  return (
    <div className="w-[28rem] max-w-[90vw] overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl">
      {fares.map((f, i) => row(f, i === fares.length - 1))}
    </div>
  );
}

/* ========= Single Row ========= */
function B2BRow({
  r, expanded, onToggle, selectedFare, onSelectFare,
}:{ r: Row; expanded: boolean; onToggle: () => void; selectedFare: FareOption | null; onSelectFare: (rowId: string, fare: FareOption) => void; }) {
  const nav = useNavigate();
  const [tab, setTab] = useState<DetailsTab>("itinerary");
  const [showFareMenu, setShowFareMenu] = useState(false);
  const minFare = useMemo(() => Math.min(...r.fares.map(f => f.price)), [r.fares]);

  const onBook = () => {
    if (!selectedFare) return;
    const qs = new URLSearchParams({ fare: selectedFare.code }).toString();
    nav(`/flights/${r.id}?${qs}`, { state: { selectedFare, flightId: r.id } });
  };
  const chooseFare = (f: FareOption) => { onSelectFare(r.id, f); setShowFareMenu(false); };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <div className="flex items-center gap-2">
          <CircleLogo bg={r.logoBg} />
          <div className="min-w-0">
            <div className="truncate text-[16px] font-semibold text-gray-900">{r.airline}</div>
            <div className="text-[11px] text-gray-500">{r.flightNos}</div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-x-4">
          <div className="text-right">
            <div className="text-[13px] text-gray-700">{r.fromCity} ({r.fromIata}) <span className="font-semibold text-gray-900">{r.departTime}</span></div>
            <div className="text-[11px] text-gray-500">{r.departDate}</div>
          </div>
          <ArcTimeline label={r.stopLabel} />
          <div className="text-left">
            <div className="text-[13px] text-gray-700">{r.toCity} ({r.toIata}) <span className="font-semibold text-gray-900">{r.arriveTime}</span></div>
            <div className="text-[11px] text-gray-500">{r.arriveDate}</div>
          </div>
        </div>

        <div className="ml-2 hidden text-right sm:block">
          <span className="text-[12px] text-gray-600">Starting from </span><br/>
          <span className="text-[16px] font-semibold text-gray-900"><Money v={minFare} /></span>
          <small className="text-[12px] text-gray-600"> /per pax</small>
        </div>
      </div>
      <hr className="my-3 border-gray-100" />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-[12px]">
          <span className={`${r.refundable === "Refundable" ? "text-emerald-700" : "text-rose-700"} font-medium`}>{r.refundable}</span>
          {r.extras?.map((x) => <span key={x} className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">{x}</span>)}
        </div>

        <div className="relative flex items-center gap-2">
          <FareOneLine fare={selectedFare} placeholder="Select fare" onClick={() => setShowFareMenu((s) => !s)} />
          {showFareMenu && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-50">
              <FareListRows fares={r.fares} name={"fare-global"} selectedCode={selectedFare?.code} onSelect={chooseFare} />
            </div>
          )}
          <button onClick={onToggle} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 hover:bg-gray-50">
            Details
            <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}><path d="M7 10l5 5 5-5" fill="currentColor" /></svg>
          </button>
          <button onClick={onBook} disabled={!selectedFare} className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white shadow ${selectedFare ? "bg-gray-900 hover:opacity-95" : "bg-gray-400 cursor-not-allowed opacity-60"}`}>
            Book Now
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 rounded-xl border border-gray-200 p-3">
          <DetailsHeader airline={r.airline} logoBg={r.logoBg} flightNos={r.flightNos} />
          {selectedFare && <div className="mb-3"><SelectedFarePanel fare={selectedFare} /></div>}
          <div className="mb-2"><RowTabs active={tab} onChange={setTab} /></div>
          {tab === "itinerary" && <ItineraryPanel segs={r.segments} logoBg={r.logoBg} airline={r.airline} rowBaggage={r.baggage} />}
          {tab === "baggage" && <BaggagePanel hand={r.baggage.handKg} check={r.baggage.checkKg} piece={r.baggage.piece} />}
          {tab === "cancellation" && <CancellationPanel refund={r.cancellation.refund} change={r.cancellation.change} noShowUSD={r.cancellation.noShowUSD} />}
          {tab === "fare" && (selectedFare ? <SelectedFarePanel fare={selectedFare} /> : <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">Select a fare from the row to view its details here.</div>)}
        </div>
      )}
    </div>
  );
}

/* ========= Page ========= */
type RouteFilter = { from?: string; to?: string; oneWay?: boolean; cabin?: string; pax?: number };

export default function FlightResults() {
  const { search } = useLocation();
  const qp = new URLSearchParams(search);

  const fromIata = (qp.get("from") || "").toUpperCase();
  const toIata   = (qp.get("to")   || "").toUpperCase();
  const dateISO  = qp.get("date") || "";                   // "YYYY-MM-DD"
  const cabin    = (qp.get("cabin") || "") as any;         // Economy | Premium Economy | Business
  const pax      = Number(qp.get("pax") || "1");

  // fetch from flights.ts
  const rawFlights = useMemo(() => {
    if (!fromIata || !toIata) return [];
    return searchFlights({ fromIata, toIata, departDate: dateISO, cabin });
  }, [fromIata, toIata, dateISO, cabin]);

  // adapt to local Row[]
  const DATA: Row[] = useMemo(() => adaptRows(rawFlights), [rawFlights]);

  const [route, setRoute] = useState<RouteFilter>({});
  useEffect(() => {
    setRoute({
      from: fromIata || undefined,
      to: toIata || undefined,
      oneWay: true,
      cabin: cabin || undefined,
      pax: pax || 1,
    });
  }, [fromIata, toIata, cabin, pax]);

  const metaBase = useDatasetMeta(DATA);
  const [filters, setFilters] = useState<Filters>(() => ({
    airlines: new Set<string>(),
    stops: "any",
    refundable: "any",
    payments: new Set<string>(),
    priceMin: metaBase.minPrice,
    priceMax: metaBase.maxPrice || metaBase.minPrice,
    nonstopOnly: false,
    hideNearby: false,
    fromAirports: new Set<string>(),
    toAirports: new Set<string>(),
    depSlots: new Set<TimeSlot>(),
    arrSlots: new Set<TimeSlot>(),
  }));
  useEffect(() => {
    setFilters(f => ({
      ...f,
      priceMin: metaBase.minPrice,
      priceMax: Math.max(metaBase.maxPrice, metaBase.minPrice),
    }));
  }, [metaBase.minPrice, metaBase.maxPrice]);

  const applyFilters = (rows: Row[]) => {
    const inAirline = (a: string) => filters.airlines.size === 0 || filters.airlines.has(a);
    const inStops = (s: number) => filters.stops === "any" || s === filters.stops;
    const inRefund = (r: Row) => filters.refundable === "any" || r.refundable === filters.refundable;
    const inPayments = (r: Row) => filters.payments.size === 0 || r.extras?.some((x) => Array.from(filters.payments).includes(x));
    const inPrice = (r: Row) => r.totalFareINR >= filters.priceMin && r.totalFareINR <= filters.priceMax;
    const inFromAirport = (r: Row) => !route.from || r.fromIata.toUpperCase() === route.from.toUpperCase();
    const inToAirport   = (r: Row) => !route.to   || r.toIata.toUpperCase()   === route.to.toUpperCase();
    const inDepSlot = (r: Row) => filters.depSlots.size === 0 || filters.depSlots.has(timeOfDay(r.departTime));
    const inArrSlot = (r: Row) => filters.arrSlots.size === 0 || filters.arrSlots.has(timeOfDay(r.arriveTime));

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

  const [sortBy, setSortBy] = useState<SortKey>("price_low");
  const sortRows = (rows: Row[]) => {
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case "price_low": return a.totalFareINR - b.totalFareINR;
        case "price_high": return b.totalFareINR - a.totalFareINR;
        case "duration": return a.durationMin - b.durationMin;
        case "depart_early": return toMin(a.departTime) - toMin(b.departTime);
        case "arrive_late": return toMin(b.arriveTime) - toMin(a.arriveTime);
        default: return 0;
      }
    });
  };

  const filtered = useMemo(() => applyFilters(DATA), [filters, route, DATA]);
  const rows = useMemo(() => sortRows(filtered), [filtered, sortBy]);
  const meta = useDatasetMeta(rows.length ? rows : DATA);
  const [drawer, setDrawer] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedGlobal, setSelectedGlobal] = useState<{ flightId: string; fare: FareOption } | null>(null);
  const [showModify, setShowModify] = useState(false);

  const uniqueAirlines = useMemo(() => new Set(rows.map(r => r.airline)).size, [rows]);
  const resetFilters = () =>
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

  return (
    <div className="mx-auto">
      <div className="min-h-screen">
        {showModify && (
          <div className="sticky top-0 z-40 mb-3 backdrop-blur">
            <div className="mx-auto max-w-7xl">
              <FromToBar onSearch={handleModifySearch} />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[20px] font-semibold text-gray-900">
              <span className="text-rose-700">{rows.length} Available Flights</span>{" "}
              {rows.length > 0 && <span className="text-gray-600">from {uniqueAirlines} Airlines</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowModify((s) => !s)} className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm hover:bg-gray-50">Modify Search</button>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm">
                <option value="price_low">Lowest Price</option>
                <option value="price_high">Highest Price</option>
                <option value="duration">Shortest Duration</option>
                <option value="depart_early">Earliest Departure</option>
                <option value="arrive_late">Latest Arrival</option>
              </select>
              <button onClick={() => setDrawer(true)} className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm md:hidden">Filters</button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 hidden md:col-span-3 md:block">
              <FilterPanel meta={meta} f={filters} setF={setFilters} onReset={resetFilters} />
            </div>

            <div className="col-span-12 md:col-span-9">
              <div className="space-y-2">
                {rows.map((r) => (
                  <B2BRow
                    key={r.id}
                    r={r}
                    expanded={expandedId === r.id}
                    onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    selectedFare={selectedGlobal?.flightId === r.id ? selectedGlobal.fare : null}
                    onSelectFare={(rowId, fare) => setSelectedGlobal({ flightId: rowId, fare })}
                  />
                ))}
                {rows.length === 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
                    No results. Modify your search or adjust filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {drawer && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-4 shadow-2xl">
              <FilterPanel meta={meta} f={filters} setF={setFilters} onReset={resetFilters} mobile onClose={() => setDrawer(false)} />
              <button onClick={() => setDrawer(false)} className="mt-3 w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
