import React from "react";

/* ===== Shared types with page ===== */
export type TimeSlot = "0-6" | "6-12" | "12-18" | "18-24";
export type Filters = {
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

export type DatasetMeta = {
  airlines: string[];
  minPrice: number;
  maxPrice: number;
  airlineMinPrice: Record<string, number>;
  departAirports: { code: string; label: string }[];
  arriveAirports: { code: string; label: string }[];
};

/* ===== small helper for Money ===== */
const Money = ({ v, currency = "INR" as const, fractionDigits = 2 }:{
  v: number; currency?: "INR" | "USD"; fractionDigits?: number;
}) => (
  <>{new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency", currency, maximumFractionDigits: fractionDigits
  }).format(isFinite(v) ? v : 0)}</>
);

export default function FilterPanel({
  meta, f, setF, onReset, mobile, onClose,
}:{
  meta: DatasetMeta;
  f: Filters;
  setF: (x: Filters) => void;
  onReset: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const toggleSet = (set: Set<string>, val: string) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  };
  const toggleSlot = (set: Set<TimeSlot>, val: TimeSlot) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  };

  const SlotChip = ({ v, label }:{ v: TimeSlot; label: string }) => (
    <button
      onClick={() => setF({ ...f, depSlots: toggleSlot(f.depSlots, v) })}
      className={`rounded-md px-2 py-1 text-xs ring-1 ${
        f.depSlots.has(v) ? "bg-gray-900 text-white ring-gray-900" : "bg-white text-gray-700 ring-gray-300"
      }`}
    >
      {label}
    </button>
  );

  const SlotChipArr = ({ v, label }:{ v: TimeSlot; label: string }) => (
    <button
      onClick={() => setF({ ...f, arrSlots: toggleSlot(f.arrSlots, v) })}
      className={`rounded-md px-2 py-1 text-xs ring-1 ${
        f.arrSlots.has(v) ? "bg-gray-900 text-white ring-gray-900" : "bg-white text-gray-700 ring-gray-300"
      }`}
    >
      {label}
    </button>
  );

  const sliderMin = Math.floor(meta?.minPrice ?? 0);
  const sliderMax = Math.ceil(Math.max(meta?.maxPrice ?? 0, meta?.minPrice ?? 0));

  return (
    <aside className={`rounded-2xl bg-white ${mobile ? "" : "p-4"} sm:p-4 text-[13px]`}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold">Applied Filters</h3>
        <div className="flex items-center gap-2">
          {mobile && <button onClick={onClose} className="rounded-lg border px-3 py-1 text-sm">Close</button>}
          <button onClick={onReset} className="text-sm text-gray-600 hover:text-gray-900">Clear all</button>
        </div>
      </div>

      {/* Popular Filters */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-medium">Popular Filters</div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={f.nonstopOnly}
                onChange={() => setF({ ...f, nonstopOnly: !f.nonstopOnly, stops: !f.nonstopOnly ? 0 : "any" })}
              />
              Non Stop
            </span>
            <span className="text-gray-500"><Money v={meta.minPrice} /></span>
          </label>

          <label className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={f.hideNearby}
                onChange={() => setF({ ...f, hideNearby: !f.hideNearby })}
              />
              Hide Nearby Airports
            </span>
            <span className="text-gray-500"><Money v={meta.minPrice} /></span>
          </label>

          {/* Quick airline toggle (first one) */}
          {meta.airlines.slice(0, 1).map(al => (
            <label key={al} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={f.airlines.size === 0 ? false : f.airlines.has(al)}
                  onChange={() => setF({ ...f, airlines: toggleSet(f.airlines, al) })}
                />
                {al}
              </span>
              <span className="text-gray-500"><Money v={meta.airlineMinPrice[al] ?? meta.minPrice} /></span>
            </label>
          ))}
        </div>
      </div>

      {/* One Way Price */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-2 font-medium">One Way Price</div>
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={1}
          value={Math.min(Math.max(sliderMin, Math.floor(f.priceMax)), sliderMax)}
          onChange={(e) => setF({ ...f, priceMax: Number(e.target.value) })}
          className="w-full"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
          <span><Money v={meta.minPrice} /></span>
          <span><Money v={f.priceMax} /></span>
        </div>
      </div>

      {/* Stops */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-2 font-medium">Stops</div>
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <input
                type="radio"
                name={mobile ? "m_stops" : "stops"}
                checked={f.stops === 0}
                onChange={() => setF({ ...f, stops: 0, nonstopOnly: true })}
              />
              Non Stop
            </span>
            <span className="text-gray-500"><Money v={meta.minPrice} /></span>
          </label>
          <label className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <input
                type="radio"
                name={mobile ? "m_stops" : "stops"}
                checked={f.stops === 1}
                onChange={() => setF({ ...f, stops: 1, nonstopOnly: false })}
              />
              1 Stop
            </span>
            <span className="text-gray-500"><Money v={meta.maxPrice} /></span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={mobile ? "m_stops" : "stops"}
              checked={f.stops === "any"}
              onChange={() => setF({ ...f, stops: "any", nonstopOnly: false })}
            />
            Any
          </label>
        </div>
      </div>

      {/* Departure time chips */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-2 font-medium">Departure Time</div>
        <div className="flex flex-wrap gap-2">
          <SlotChip v="0-6" label="Early Morning (12–6)" />
          <SlotChip v="6-12" label="Morning (6–12)" />
          <SlotChip v="12-18" label="Afternoon (12–6)" />
          <SlotChip v="18-24" label="Evening (6–12)" />
        </div>
      </div>

      {/* Arrival time chips */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-2 font-medium">Arrival Time</div>
        <div className="flex flex-wrap gap-2">
          <SlotChipArr v="0-6" label="Early Morning (12–6)" />
          <SlotChipArr v="6-12" label="Morning (6–12)" />
          <SlotChipArr v="12-18" label="Afternoon (12–6)" />
          <SlotChipArr v="18-24" label="Evening (6–12)" />
        </div>
      </div>

      {/* Departure Airports */}
      {meta.departAirports?.length > 0 && (
        <div className="mb-3 border-b border-gray-100 pb-3">
          <div className="mb-2 font-medium">Departure Airports</div>
          <div className="space-y-2">
            {meta.departAirports.map(a => (
              <label key={a.code} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={f.fromAirports.size === 0 ? false : f.fromAirports.has(a.code)}
                    onChange={() => setF({ ...f, fromAirports: toggleSet(f.fromAirports, a.code) })}
                  />
                  {a.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Arrival Airports */}
      {meta.arriveAirports?.length > 0 && (
        <div className="mb-3 border-b border-gray-100 pb-3">
          <div className="mb-2 font-medium">Arrival Airports</div>
          <div className="space-y-2">
            {meta.arriveAirports.map(a => (
              <label key={a.code} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={f.toAirports.size === 0 ? false : f.toAirports.has(a.code)}
                    onChange={() => setF({ ...f, toAirports: toggleSet(f.toAirports, a.code) })}
                  />
                  {a.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Airlines */}
      <div>
        <div className="mb-2 font-medium">Airlines</div>
        <div className="space-y-2">
          {meta.airlines.map(a => (
            <label key={a} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={f.airlines.size === 0 ? false : f.airlines.has(a)}
                  onChange={() => setF({ ...f, airlines: toggleSet(f.airlines, a) })}
                />
                {a}
              </span>
              <span className="text-gray-500"><Money v={meta.airlineMinPrice[a] ?? meta.minPrice} /></span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
