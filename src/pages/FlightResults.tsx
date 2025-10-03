import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ========= Types ========= */
type Segment = {
  fromCity: string; fromIata: string; departTime: string; departDate: string;
  toCity: string;   toIata: string;   arriveTime: string; arriveDate: string;
  carrier: string; flightNo: string; durationMin: number;
  layoverAt?: string; layoverMin?: number;
};

type PolicyRule = { when: string; feeUSD: number; note?: string };

type FareOption = {
  code: "SME" | "CORPORATE" | "FLEXI" | string;
  label: string;
  price: number;                           // INR
  refundable: "Refundable" | "Non Refundable";
  cabin?: string;                          // Economy / Business
  meal?: "Paid Meal" | "Free Meal" | "No Meal" | string;
  badge?: { text: string; tone?: "offer" | "published" };
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
  totalFareINR: number;                    // for sorting (min fare)
  commissionUSD: number; agentFareUSD: number;
  refundable: "Refundable" | "Non-Refundable";
  extras?: string[];
  segments: Segment[];
  baggage: { handKg?: number; checkKg?: number; piece?: string };
  cancellation: { refund: PolicyRule[]; change: PolicyRule[]; noShowUSD?: number };
  fares: FareOption[];
};

/* ========= Mock data (₹) ========= */
const BASE: Row[] = [
  {
    id: "EK-1", airline: "Emirates Airways", logoBg: "#E31E24", flightNos: "EK2287 - EK123",
    fromCity: "Dhaka", fromIata: "DAC", departTime: "16:50", departDate: "20 Dec, Fri",
    toCity: "Istanbul", toIata: "IST", arriveTime: "20:50", arriveDate: "20 Dec, Fri",
    stops: 1, stopLabel: "1 Stop DXB", durationMin: 240, totalFareINR: 2617.7,
    commissionUSD: 80, agentFareUSD: 1000, refundable: "Refundable",
    extras: ["Book & Hold", "Partial Payment"],
    segments: [
      { fromCity: "Dhaka", fromIata: "DAC", departTime: "16:50", departDate: "20 Dec, Fri", toCity: "Dubai", toIata: "DXB", arriveTime: "19:20", arriveDate: "20 Dec, Fri", carrier: "EK", flightNo: "2287", durationMin: 210, layoverAt: "DXB", layoverMin: 70 },
      { fromCity: "Dubai", fromIata: "DXB", departTime: "20:30", departDate: "20 Dec, Fri", toCity: "Istanbul", toIata: "IST", arriveTime: "20:50", arriveDate: "20 Dec, Fri", carrier: "EK", flightNo: "123", durationMin: 200 },
    ],
    baggage: { handKg: 7, checkKg: 25, piece: "1 piece allowed" },
    cancellation: {
      refund: [{ when: "≥ 24h before departure", feeUSD: 120 }, { when: "< 24h before departure", feeUSD: 220 }],
      change: [{ when: "Date/Time change (per pax)", feeUSD: 90, note: "Fare diff applies" }],
      noShowUSD: 300,
    },
    fares: [
      { code: "SME", label: "SME", price: 2617.7, refundable: "Non Refundable", cabin: "Economy", meal: "Paid Meal", badge: { text: "Offer Fare", tone: "offer" }, baggage: { handKg: 7, checkKg: 20 }, seat: "Standard seat included", commissionINR: 220, agentFareINR: 2397.7 },
      { code: "CORPORATE", label: "Corporate", price: 3768.7, refundable: "Refundable", cabin: "Economy", meal: "Paid Meal", badge: { text: "Published", tone: "published" }, baggage: { handKg: 7, checkKg: 25 }, seat: "Preferred seat included", commissionINR: 260, agentFareINR: 3508.7 },
      { code: "FLEXI", label: "Flexi", price: 3925.7, refundable: "Refundable", cabin: "Economy", meal: "Free Meal", badge: { text: "Published", tone: "published" }, baggage: { handKg: 7, checkKg: 25 }, seat: "Seat selection (paid)", commissionINR: 280, agentFareINR: 3645.7 },
    ],
  },
  {
    id: "QR-1", airline: "Qater Airways", logoBg: "#6C2C3B", flightNos: "QR954 - QR241",
    fromCity: "Dhaka", fromIata: "DAC", departTime: "15:45", departDate: "20 Dec, Fri",
    toCity: "Istanbul", toIata: "IST", arriveTime: "21:05", arriveDate: "20 Dec, Fri",
    stops: 1, stopLabel: "1 Stop DOH", durationMin: 260, totalFareINR: 2849.5,
    commissionUSD: 90, agentFareUSD: 1005, refundable: "Refundable", extras: ["Book & Hold"],
    segments: [
      { fromCity: "Dhaka", fromIata: "DAC", departTime: "15:45", departDate: "20 Dec, Fri", toCity: "Doha", toIata: "DOH", arriveTime: "18:00", arriveDate: "20 Dec, Fri", carrier: "QR", flightNo: "954", durationMin: 195, layoverAt: "DOH", layoverMin: 75 },
      { fromCity: "Doha", fromIata: "DOH", departTime: "19:15", departDate: "20 Dec, Fri", toCity: "Istanbul", toIata: "IST", arriveTime: "21:05", arriveDate: "20 Dec, Fri", carrier: "QR", flightNo: "241", durationMin: 170 },
    ],
    baggage: { handKg: 7, checkKg: 23, piece: "1 piece" },
    cancellation: {
      refund: [{ when: "≥ 24h before departure", feeUSD: 100 }, { when: "< 24h before departure", feeUSD: 200 }],
      change: [{ when: "Date/Time change (per pax)", feeUSD: 75, note: "Fare diff applies" }],
      noShowUSD: 250,
    },
    fares: [
      { code: "SME", label: "SME", price: 2849.5, refundable: "Refundable", cabin: "Economy", meal: "Paid Meal", badge: { text: "Offer Fare", tone: "offer" },  baggage: { handKg: 7, checkKg: 20 }, seat: "Standard seat included", commissionINR: 200, agentFareINR: 2649.5 },
      { code: "CORPORATE", label: "Corporate", price: 3099.5, refundable: "Refundable", cabin: "Economy", meal: "Paid Meal", badge: { text: "Published", tone: "published" }, baggage: { handKg: 7, checkKg: 23 }, seat: "Preferred seat included", commissionINR: 220, agentFareINR: 2879.5 },
      { code: "FLEXI", label: "Flexi", price: 3299.5, refundable: "Refundable", cabin: "Economy", meal: "Free Meal", badge: { text: "Published", tone: "published" },  baggage: { handKg: 7, checkKg: 23 }, seat: "Seat selection (paid)", commissionINR: 240, agentFareINR: 3059.5 },
    ],
  },
  {
    id: "TK-1", airline: "Turkish Airline", logoBg: "#CC1E2C", flightNos: "TK713",
    fromCity: "Dhaka", fromIata: "DAC", departTime: "06:40", departDate: "20 Dec, Fri",
    toCity: "Istanbul", toIata: "IST", arriveTime: "12:15", arriveDate: "20 Dec, Fri",
    stops: 0, stopLabel: "Non-stop", durationMin: 335, totalFareINR: 3999,
    commissionUSD: 70, agentFareUSD: 1180, refundable: "Non-Refundable",
    extras: ["Book & Hold", "Partial Payment"],
    segments: [
      { fromCity: "Dhaka", fromIata: "DAC", departTime: "06:40", departDate: "20 Dec, Fri", toCity: "Istanbul", toIata: "IST", arriveTime: "12:15", arriveDate: "20 Dec, Fri", carrier: "TK", flightNo: "713", durationMin: 335 },
    ],
    baggage: { handKg: 8, checkKg: 30, piece: "2 pieces (Business)" },
    cancellation: {
      refund: [{ when: "Anytime", feeUSD: 0, note: "Not permitted (Non-Refundable)" }],
      change: [{ when: "Date/Time change", feeUSD: 150, note: "Fare diff applies" }],
      noShowUSD: 350,
    },
    fares: [
      { code: "SME", label: "SME", price: 3999, refundable: "Non Refundable", cabin: "Economy", meal: "Paid Meal", badge: { text: "Published", tone: "published" }, baggage: { handKg: 8, checkKg: 25 }, seat: "Standard seat included", commissionINR: 260, agentFareINR: 3739 },
      { code: "CORPORATE", label: "Corporate", price: 4169, refundable: "Non Refundable", cabin: "Economy", meal: "Paid Meal", badge: { text: "Published", tone: "published" }, baggage: { handKg: 8, checkKg: 30 }, seat: "Preferred seat included", commissionINR: 280, agentFareINR: 3889 },
      { code: "FLEXI", label: "Flexi", price: 4325, refundable: "Non Refundable", cabin: "Economy", meal: "Free Meal", badge: { text: "Offer Fare", tone: "offer" },  baggage: { handKg: 8, checkKg: 30 }, seat: "Seat selection (paid)", commissionINR: 300, agentFareINR: 4025 },
    ],
  },
];

/* ========= Helpers ========= */
const Money = ({ v, currency = "INR" as const, fractionDigits = 2 }: { v: number; currency?: "INR" | "USD"; fractionDigits?: number }) => (
  <>{new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, maximumFractionDigits: fractionDigits }).format(v)}</>
);

const minsToLabel = (m?: number) => {
  if (!m && m !== 0) return "";
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${String(mm).padStart(2, "0")}m`;
};

const CircleLogo = ({ bg }: { bg: string }) => (
  <div className="grid h-9 w-9 place-items-center rounded-full text-white shadow-sm" style={{ background: bg }}>
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5">
      <path d="M2 12l20 2-6-4 3-7-3-1-5 8-5-1-1 2 5 2-2 7 2 1 3-7" fill="currentColor" />
    </svg>
  </div>
);

function SmallLogo({ bg }: { bg: string }) {
  return (
    <span className="inline-grid h-5 w-5 place-items-center rounded-full text-white ring-1 ring-black/5" style={{ background: bg }}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
        <path d="M2 12l20 2-6-4 3-7-3-1-5 8-5-1-1 2 5 2-2 7 2 1 3-7" fill="currentColor" />
      </svg>
    </span>
  );
}

function DetailsHeader({ airline, logoBg, flightNos }: { airline: string; logoBg: string; flightNos: string; }) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <CircleLogo bg={logoBg} />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-gray-900">{airline}</div>
          <div className="truncate text-xs text-gray-600">Flight(s): <span className="font-medium">{flightNos}</span></div>
        </div>
      </div>
      <div className="hidden items-center gap-2 sm:flex text-xs text-gray-600">
        Aircraft • Economy
      </div>
    </div>
  );
}

const ArcTimeline = ({ label }: { label: string }) => (
  <div className="relative flex items-center justify-center">
    <svg width="240" height="44" viewBox="0 0 260 50" className="text-gray-300">
      <path d="M20 32 Q130 4 240 32" stroke="currentColor" strokeDasharray="4 6" strokeWidth="2" fill="none" />
      <circle cx="130" cy="18" r="6" fill="white" stroke="currentColor" strokeWidth="1.5" />
    </svg>
    <div className="absolute -top-0 text-[11px] font-medium text-gray-600">{label}</div>
  </div>
);

/* ========= Filters ========= */
type SortKey = "price_low" | "price_high" | "duration" | "depart_early" | "arrive_late";
type Filters = {
  airlines: Set<string>;
  stops: "any" | 0 | 1 | 2;
  refundable: "any" | "Refundable" | "Non-Refundable";
  payments: Set<string>;
  priceMin: number;
  priceMax: number;
};

const useDatasetMeta = (data: Row[]) => {
  const airlines = useMemo(() => Array.from(new Set(data.map(d => d.airline))).sort(), [data]);
  const minPrice = useMemo(() => Math.min(...data.map(d => d.totalFareINR)), [data]);
  const maxPrice = useMemo(() => Math.max(...data.map(d => d.totalFareINR)), [data]);
  return { airlines, minPrice, maxPrice };
};

function FilterPanel({ meta, f, setF, onReset, mobile, onClose }:{
  meta: ReturnType<typeof useDatasetMeta>; f: Filters; setF: (x: Filters) => void; onReset: () => void; mobile?: boolean; onClose?: () => void;
}) {
  const toggleSet = (set: Set<string>, val: string) => { const next = new Set(set); next.has(val) ? next.delete(val) : next.add(val); return next; };

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white ${mobile ? "" : "p-4"} sm:p-4 shadow-sm`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold">Filters</h3>
        <div className="flex items-center gap-2">
          {mobile && <button onClick={onClose} className="rounded-lg border px-3 py-1 text-sm">Close</button>}
          <button onClick={onReset} className="text-sm text-gray-600 hover:text-gray-800">Reset</button>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        {/* Airlines */}
        <div className="border-b border-gray-100 pb-3">
          <div className="mb-1 font-medium">Airlines</div>
          <div className="space-y-2">
            {meta.airlines.map((a) => (
              <label key={a} className="flex items-center gap-2">
                <input type="checkbox" checked={f.airlines.size === 0 || f.airlines.has(a)} onChange={() => setF({ ...f, airlines: toggleSet(f.airlines, a) })}/>
                {a}
              </label>
            ))}
            <div className="flex gap-2 pt-1">
              <button className="rounded border px-2 py-1" onClick={() => setF({ ...f, airlines: new Set() })}>Select all</button>
              <button className="rounded border px-2 py-1" onClick={() => setF({ ...f, airlines: new Set<string>([]) })}>Clear</button>
            </div>
          </div>
        </div>

        {/* Stops */}
        <div className="border-b border-gray-100 pb-3">
          <div className="mb-1 font-medium">Stops</div>
          {(["any", 0, 1, 2] as const).map((v) => (
            <label key={String(v)} className="mr-4 inline-flex items-center gap-2">
              <input type="radio" name={mobile ? "m_stops" : "stops"} checked={f.stops === v} onChange={() => setF({ ...f, stops: v })}/>
              {v === "any" ? "Any" : v === 0 ? "Non-stop" : `${v} Stop`}
            </label>
          ))}
        </div>

        {/* Refundability */}
        <div className="border-b border-gray-100 pb-3">
          <div className="mb-1 font-medium">Refundability</div>
          {(["any", "Refundable", "Non-Refundable"] as const).map((v) => (
            <label key={v} className="mr-4 inline-flex items-center gap-2">
              <input type="radio" name={mobile ? "m_ref" : "ref"} checked={f.refundable === v} onChange={() => setF({ ...f, refundable: v })}/>
              {v === "any" ? "Any" : v}
            </label>
          ))}
        </div>

        {/* Payments */}
        <div className="border-b border-gray-100 pb-3">
          <div className="mb-1 font-medium">Payment options</div>
          {["Book & Hold", "Partial Payment"].map((p) => (
            <label key={p} className="mr-4 inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={f.payments.has(p)}
                onChange={() => setF({ ...f, payments: (() => { const next = new Set(f.payments); next.has(p) ? next.delete(p) : next.add(p); return next; })() })}
              />
              {p}
            </label>
          ))}
        </div>

        {/* Price range */}
        <div>
          <div className="mb-1 font-medium">Price range (INR)</div>
          <div className="flex items-center gap-3">
            <input type="number" step="0.1" value={f.priceMin} min={meta.minPrice} max={f.priceMax} onChange={(e) => setF({ ...f, priceMin: Number(e.target.value) })} className="w-28 rounded-lg border px-2 py-1"/>
            <span>—</span>
            <input type="number" step="0.1" value={f.priceMax} min={f.priceMin} max={meta.maxPrice} onChange={(e) => setF({ ...f, priceMax: Number(e.target.value) })} className="w-28 rounded-lg border px-2 py-1"/>
          </div>
          <div className="mt-1 text-xs text-gray-500">Min {meta.minPrice} • Max {meta.maxPrice}</div>
        </div>
      </div>
    </div>
  );
}

/* ========= Tabs ========= */
type DetailsTab = "itinerary" | "baggage" | "cancellation" | "fare";

/* ========= Panels ========= */
function ItineraryPanel({ segs, logoBg }:{ segs: Segment[]; logoBg: string }) {
  return (
    <div className="space-y-4">
      {segs.map((s, i) => (
        <div key={i} className="rounded-xl border border-gray-200 p-3">
          <div className="grid grid-cols-12 items-start gap-3">
            <div className="col-span-5 text-right">
              <div className="text-sm font-semibold">{s.departTime}</div>
              <div className="text-xs text-gray-500">{s.fromCity} ({s.fromIata}) • {s.departDate}</div>
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <div className="relative h-12 w-px bg-gray-300">
                <span className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full border border-gray-400 bg-white" />
                <span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full border border-gray-400 bg-white" />
              </div>
            </div>
            <div className="col-span-5">
              <div className="text-sm font-semibold">{s.arriveTime}</div>
              <div className="text-xs text-gray-500">{s.toCity} ({s.toIata}) • {s.arriveDate}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                <SmallLogo bg={logoBg} />
                <span className="font-medium">{s.carrier}-{s.flightNo}</span>
                <span>• {minsToLabel(s.durationMin)}</span>
              </div>
            </div>
          </div>
          {s.layoverAt && (
            <div className="mt-2 text-center text-xs text-gray-600">
              Layover at <span className="font-medium">{s.layoverAt}</span> — {minsToLabel(s.layoverMin)}
            </div>
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
          {refund.map((r, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <span>{r.when}</span>
              <span className="font-medium">₹{r.feeUSD}</span>
            </li>
          ))}
        </ul>
        {typeof noShowUSD === "number" && (
          <div className="mt-2 text-xs text-gray-600">No-show fee: <span className="font-semibold">₹{noShowUSD}</span></div>
        )}
      </div>
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="mb-2 text-sm font-semibold">Change rules</div>
        <ul className="space-y-1 text-sm text-gray-700">
          {change.map((r, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <span>{r.when}{r.note ? ` — ${r.note}` : ""}</span>
              <span className="font-medium">₹{r.feeUSD}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ========= Selected Fare Panel (shows ONLY chosen fare) ========= */
function SelectedFarePanel({ fare }: { fare: FareOption }) {
  const refundableTone = fare.refundable === "Refundable" ? "text-emerald-700" : "text-rose-700";
  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="text-[13px] text-gray-600">Selected Fare</div>
        <div className="text-[18px] font-bold text-gray-900"><Money v={fare.price} /></div>
        {fare.badge?.text && (
          <span className={`rounded bg-pink-50 px-1.5 py-0.5 text-[11px] font-semibold ${fare.badge?.tone === "offer" ? "text-pink-700 ring-1 ring-pink-200" : "text-amber-800 ring-1 ring-amber-200"}`}>
            {fare.badge.text}
          </span>
        )}
        <span className={`text-[12px] ${refundableTone} font-medium`}>{fare.refundable}</span>
      </div>
      <div className="text-[12px] text-gray-700">
        {fare.cabin || "Economy"}{fare.meal ? `, ${fare.meal}` : ""}
      </div>

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

      {(fare.commissionINR != null || fare.agentFareINR != null) && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {fare.commissionINR != null && (<><div className="text-gray-600">Commission</div><div className="text-right font-medium"><Money v={fare.commissionINR} /></div></>)}
          {fare.agentFareINR != null && (<><div className="text-gray-600">Agent Fare</div><div className="text-right font-medium"><Money v={fare.agentFareINR} /></div></>)}
        </div>
      )}
    </div>
  );
}

/* ========= Fare ONE-LINE summary (bigger bold price) ========= */
function FareOneLine({
  fare, placeholder, onClick,
}: { fare: FareOption | null; placeholder: string; onClick: () => void }) {
  const badgeTone =
    fare?.badge?.tone === "offer"
      ? "bg-pink-50 text-pink-700 ring-pink-200"
      : "bg-amber-50 text-amber-800 ring-amber-200";

  return (
    <button
      onClick={onClick}
      className="inline-flex max-w-full items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-left text-[12px] hover:bg-gray-50"
      title="Change fare"
    >
      <span className={`h-3.5 w-3.5 rounded-full border ${fare ? "border-gray-800" : "border-gray-400"} grid place-items-center`}>
        {fare && <span className="h-2 w-2 rounded-full bg-gray-800" />}
      </span>

      {fare ? (
        <div className="flex min-w-0 items-center gap-2">
          <span className="whitespace-nowrap text-[17px] font-bold text-gray-900"><Money v={fare.price} /></span>
          <span className="relative">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700">i</span>
            <div className="pointer-events-none absolute left-1/2 z-30 mt-2 w-72 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 opacity-0 shadow-2xl transition hover:opacity-100">
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="font-semibold">{fare.label} • {fare.cabin || "—"}</span>
                <span className="font-semibold"><Money v={fare.price} /></span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-gray-50 p-2">
                  <div className="text-[11px] text-gray-500">Baggage</div>
                  <div className="mt-0.5 font-medium">
                    {fare.baggage?.handKg != null ? `${fare.baggage.handKg}kg cabin` : "Cabin: airline"}
                    <br />
                    {fare.baggage?.checkKg != null ? `${fare.baggage.checkKg}kg check-in` : "Check-in: airline"}
                  </div>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                  <div className="text-[11px] text-gray-500">Seat</div>
                  <div className="mt-0.5 font-medium">{fare.seat || "Seat selection (paid)"}</div>
                </div>
              </div>
              {(fare.commissionINR != null || fare.agentFareINR != null) && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {fare.commissionINR != null && (<><div>Commission</div><div className="text-right font-medium"><Money v={fare.commissionINR} /></div></>)}
                  {fare.agentFareINR != null && (<><div>Agent Fare</div><div className="text-right font-medium"><Money v={fare.agentFareINR} /></div></>)}
                </div>
              )}
              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-gray-200 bg-white" />
            </div>
          </span>
          {fare.badge?.text && (
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${badgeTone}`}>{fare.badge.text}</span>
          )}
          <span className="truncate text-[12px] text-gray-700">
            {(fare.cabin || "Economy")}{fare.meal ? `, ${fare.meal}` : ""},{" "}
            <span className={fare.refundable === "Refundable" ? "text-emerald-700 font-medium" : "text-rose-700 font-medium"}>
              {fare.refundable}
            </span>
          </span>
        </div>
      ) : (
        <span className="text-[12px] text-gray-600">{placeholder}</span>
      )}
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500"><path d="M7 10l5 5 5-5" fill="currentColor" /></svg>
    </button>
  );
}

/* ========= Fare LIST rows ========= */
function FareListRows({
  fares, name, selectedCode, onSelect,
}: {
  fares: FareOption[]; name: string; selectedCode?: string; onSelect: (f: FareOption) => void;
}) {
  const row = (f: FareOption, last: boolean) => {
    const badgeTone =
      f.badge?.tone === "offer"
        ? "bg-pink-50 text-pink-700 ring-pink-200"
        : "bg-amber-50 text-amber-800 ring-amber-200";
    const refundableTone = f.refundable === "Refundable" ? "text-emerald-700" : "text-rose-700";

    return (
      <label key={f.code} className={`grid cursor-pointer grid-cols-[18px_1fr] items-center gap-2 px-2 py-2 ${!last ? "border-b border-gray-100" : ""}`}>
        <input
          type="radio"
          name={name} // GLOBAL group
          value={f.code}
          checked={selectedCode === f.code}
          onChange={() => onSelect(f)}
          className="h-3.5 w-3.5 accent-gray-800"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-gray-900"><Money v={f.price} /></span>
            <span className="relative">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700">i</span>
              <div className="pointer-events-none absolute left-0 z-30 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 opacity-0 shadow-2xl transition hover:opacity-100">
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="font-semibold">{f.label} • {f.cabin || "—"}</span>
                  <span className="font-semibold"><Money v={f.price} /></span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-gray-50 p-2">
                    <div className="text-[11px] text-gray-500">Baggage</div>
                    <div className="mt-0.5 font-medium">
                      {f.baggage?.handKg != null ? `${f.baggage.handKg}kg cabin` : "Cabin: airline"}
                      <br />
                      {f.baggage?.checkKg != null ? `${f.baggage.checkKg}kg check-in` : "Check-in: airline"}
                    </div>
                  </div>
                  <div className="rounded-md bg-gray-50 p-2">
                    <div className="text-[11px] text-gray-500">Seat</div>
                    <div className="mt-0.5 font-medium">{f.seat || "Seat selection (paid)"}</div>
                  </div>
                </div>
                {(f.commissionINR != null || f.agentFareINR != null) && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {f.commissionINR != null && (<><div>Commission</div><div className="text-right font-medium"><Money v={f.commissionINR} /></div></>)}
                    {f.agentFareINR != null && (<><div>Agent Fare</div><div className="text-right font-medium"><Money v={f.agentFareINR} /></div></>)}
                  </div>
                )}
                <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 border-l border-t border-gray-200 bg-white" />
              </div>
            </span>
            {f.badge?.text && <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${badgeTone}`}>{f.badge.text}</span>}
            <span className="truncate text-[12px] text-gray-700">
              {(f.cabin || "Economy")}{f.meal ? `, ${f.meal}` : ""},{" "}
              <span className={`${refundableTone} font-medium`}>{f.refundable}</span>
            </span>
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

/* ========= Single row ========= */
function B2BRow({
  r, expanded, onToggle, selectedFare, onSelectFare,
}: {
  r: Row;
  expanded: boolean;
  onToggle: () => void;
  selectedFare: FareOption | null;             // from parent (global)
  onSelectFare: (rowId: string, fare: FareOption) => void;
}) {
  const nav = useNavigate();
  const [tab, setTab] = useState<DetailsTab>("itinerary");
  const [showFareMenu, setShowFareMenu] = useState(false);

  const minFare = useMemo(() => Math.min(...r.fares.map(f => f.price)), [r.fares]);

  const onBook = () => {
    if (!selectedFare) return;
    const qs = new URLSearchParams({ fare: selectedFare.code }).toString();
    nav(`/flights/${r.id}?${qs}`, { state: { selectedFare, flightId: r.id } });
  };

  const chooseFare = (f: FareOption) => {
    onSelectFare(r.id, f);         // make it global
    setShowFareMenu(false);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      {/* summary row: airline + times + starting-from (same line, right) */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        {/* airline */}
        <div className="flex items-center gap-2">
          <CircleLogo bg={r.logoBg} />
          <div className="min-w-0">
            <div className="truncate text-[16px] font-semibold text-gray-900">{r.airline}</div>
            <div className="text-[11px] text-gray-500">{r.flightNos}</div>
          </div>
        </div>

        {/* times */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-x-4">
          <div className="text-right">
            <div className="text-[13px] text-gray-700">
              {r.fromIata} <span className="font-semibold text-gray-900">{r.departTime}</span>
            </div>
            <div className="text-[11px] text-gray-500">{r.departDate}</div>
          </div>
          <ArcTimeline label={r.stopLabel} />
          <div className="text-left">
            <div className="text-[13px] text-gray-700">
              {r.toIata} <span className="font-semibold text-gray-900">{r.arriveTime}</span>
            </div>
            <div className="text-[11px] text-gray-500">{r.arriveDate}</div>
          </div>
        </div>

        {/* starting from (right aligned, same line) */}
        <div className="ml-2 hidden text-right sm:block">
          <span className="text-[12px] text-gray-600">Starting from </span><br></br>
          <span className="text-[16px] font-semibold text-gray-900"><Money v={minFare} /></span>
        </div>
      </div>
<div className="border border-dashed border-gray-200 my-3"></div>
      {/* action bar: Selected Fare • Details • Book */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        {/* left small meta */}
        <div className="flex min-w-0 flex-1 items-center gap-2 text-[12px]">
          <span className={`${r.refundable === "Refundable" ? "text-emerald-700" : "text-rose-700"} font-medium`}>{r.refundable}</span>
          {r.extras?.map((x) => <span key={x} className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">{x}</span>)}
        </div>

        <div className="relative flex items-center gap-2">
          {/* one-line fare (click to open fare list) */}
          <FareOneLine
            fare={selectedFare}
            placeholder="Select fare"
            onClick={() => setShowFareMenu((s) => !s)}
          />
          {showFareMenu && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-50">
              <FareListRows
                fares={r.fares}
                name={"fare-global"}                 // GLOBAL radio group
                selectedCode={selectedFare?.code}
                onSelect={chooseFare}
              />
            </div>
          )}

          {/* Details next to Book Now */}
          <button
            onClick={onToggle}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 hover:bg-gray-50"
          >
            Details
            <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}>
              <path d="M7 10l5 5 5-5" fill="currentColor" />
            </svg>
          </button>

          <button
            onClick={onBook}
            disabled={!selectedFare}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white shadow
              ${selectedFare ? "bg-gray-900 hover:opacity-95" : "bg-gray-400 cursor-not-allowed opacity-60"}`}
            title={selectedFare ? "Proceed to booking" : "Select a fare to continue"}
          >
            Book Now
          </button>
        </div>
      </div>

      {/* expanded details */}
      {expanded && (
        <div className="mt-2 rounded-xl border border-gray-200 p-3">
          <DetailsHeader airline={r.airline} logoBg={r.logoBg} flightNos={r.flightNos} />

          {/* If a fare is selected, show its compact panel at top */}
          {selectedFare && (
            <div className="mb-3">
              <SelectedFarePanel fare={selectedFare} />
            </div>
          )}

          <div className="mb-2">
            <RowTabs active={tab} onChange={setTab} />
          </div>

          {tab === "itinerary" && <ItineraryPanel segs={r.segments} logoBg={r.logoBg} />}
          {tab === "baggage" && <BaggagePanel hand={r.baggage.handKg} check={r.baggage.checkKg} piece={r.baggage.piece} />}
          {tab === "cancellation" && <CancellationPanel refund={r.cancellation.refund} change={r.cancellation.change} noShowUSD={r.cancellation.noShowUSD} />}

          {/* Fare tab: mirror the selected fare; if none, prompt */}
          {tab === "fare" && (
            selectedFare ? (
              <SelectedFarePanel fare={selectedFare} />
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                Select a fare from the row to view its details here.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ========= Tabs (buttons) ========= */
function RowTabs({ active, onChange }:{ active: DetailsTab; onChange: (t: DetailsTab) => void }) {
  const TabBtn = ({ id, label }:{ id: DetailsTab; label: string }) => (
    <button
      onClick={() => onChange(id)}
      className={`rounded-lg border px-3 py-1.5 text-sm transition ${active === id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
    >
      {label}
    </button>
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

/* ========= Page ========= */
export default function B2BFlightListExact() {
  const meta = useDatasetMeta(BASE);

  const [filters, setFilters] = useState<Filters>({
    airlines: new Set<string>(), stops: "any", refundable: "any",
    payments: new Set<string>(), priceMin: meta.minPrice, priceMax: meta.maxPrice,
  });
  const [sortBy, setSortBy] = useState<SortKey>("price_low");
  const [drawer, setDrawer] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // GLOBAL single selection across the page
  const [selectedGlobal, setSelectedGlobal] = useState<{ flightId: string; fare: FareOption } | null>(null);

  const applyFilters = (rows: Row[]) => {
    const inAirline = (a: string) => filters.airlines.size === 0 || filters.airlines.has(a);
    const inStops = (s: number) => filters.stops === "any" || s === filters.stops;
    const inRefund = (r: Row) => filters.refundable === "any" || r.refundable === filters.refundable;
    const inPayments = (r: Row) => filters.payments.size === 0 || r.extras?.some((x) => Array.from(filters.payments).includes(x));
    const inPrice = (r: Row) => r.totalFareINR >= filters.priceMin && r.totalFareINR <= filters.priceMax;
    return rows.filter((r) => inAirline(r.airline) && inStops(r.stops) && inRefund(r) && inPayments(r) && inPrice(r));
  };

  const sortRows = (rows: Row[]) => {
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const sorted = [...rows].sort((a, b) => {
      switch (sortBy) {
        case "price_low": return a.totalFareINR - b.totalFareINR;
        case "price_high": return b.totalFareINR - a.totalFareINR;
        case "duration": return a.durationMin - b.durationMin;
        case "depart_early": return toMin(a.departTime) - toMin(b.departTime);
        case "arrive_late": return toMin(b.arriveTime) - toMin(a.arriveTime);
        default: return 0;
      }
    });
    return sorted;
  };

  const filtered = useMemo(() => applyFilters(BASE), [filters]);
  const rows = useMemo(() => sortRows(filtered), [filtered, sortBy]);
  const uniqueAirlines = useMemo(() => new Set(rows.map(r => r.airline)).size, [rows]);

  const resetFilters = () =>
    setFilters({
      airlines: new Set<string>(),
      stops: "any",
      refundable: "any",
      payments: new Set<string>(),
      priceMin: meta.minPrice,
      priceMax: meta.maxPrice,
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[90rem] px-3 py-4">
        {/* header */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[20px] font-semibold text-gray-900">
            <span className="text-rose-700">{rows.length} Available Flights</span>{" "}
            <span className="text-gray-600">from {uniqueAirlines} Airlines</span>
          </div>

          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm">
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
          {/* Sidebar (desktop) */}
          <div className="col-span-12 hidden md:col-span-3 md:block">
            <FilterPanel meta={meta} f={filters} setF={setFilters} onReset={resetFilters} />
          </div>

          {/* List */}
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
                  No results. Try adjusting filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
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
  );
}
