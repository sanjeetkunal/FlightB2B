import React from "react";

/* ===== Types ===== */
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
  /** 👉 choose which direction to apply filters to */
  applyTo: "both" | "out" | "in";
};

export type DatasetMeta = {
  airlines: string[];
  minPrice: number;
  maxPrice: number;
  airlineMinPrice: Record<string, number>;
  departAirports: { code: string; label: string }[];
  arriveAirports: { code: string; label: string }[];
};

/* ===== Money ===== */
const Money = ({
  v,
  currency = "INR" as const,
  fractionDigits = 2,
}: {
  v: number;
  currency?: "INR" | "USD";
  fractionDigits?: number;
}) => (
  <>
    {new Intl.NumberFormat(
      currency === "INR" ? "en-IN" : "en-US",
      { style: "currency", currency, maximumFractionDigits: fractionDigits }
    ).format(Number.isFinite(v) ? v : 0)}
  </>
);

/* ===== Checkbox class (blue) ===== */
const cxCheck =
  "h-5 w-5 accent-blue-500 rounded border border-gray-300 outline-none focus:outline-none font-normal focus:ring-0";

/* ===== Minimal inline icons ===== */
const IconBefore6 = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M3 16h18" />
    <path d="M7 16a5 5 0 1 1 10 0" />
    <path d="M12 3v3M4.2 5.2l2.1 2.1M19.8 5.2l-2.1 2.1" />
  </svg>
);
const Icon6to12 = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const Icon12to18 = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M3 16h18" />
    <path d="M7 16a5 5 0 1 1 10 0" />
    <path d="M5 20h14" />
  </svg>
);
const IconAfter6 = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M15 3a7 7 0 1 0 6 12 7 7 0 0 1-6-12Z" />
  </svg>
);

/* ===== helpers ===== */
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/* ===== Reusable time card ===== */
function TimeCard({
  selected,
  onClick,
  titleTop,
  titleBottom,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  titleTop: string;
  titleBottom?: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "w-[110px] sm:w-[120px] h-[72px]",
        "rounded-sm border bg-white px-3 py-2 text-center",
        "flex flex-col items-center justify-center gap-1",
        "text-[12px] leading-tight",
        selected
          ? "border-blue-500 text-blue-700 bg-blue-50"
          : "border-gray-300 text-gray-700 hover:border-gray-400",
      ].join(" ")}
    >
      <div className={selected ? "text-blue-600" : "text-gray-500"}>{icon}</div>
      <div className="font-medium">{titleTop}</div>
      {titleBottom ? <div className="text-[11px] text-gray-500">{titleBottom}</div> : null}
    </button>
  );
}

/* ===== Segmented control for ApplyTo ===== */
function Seg({
  value,
  onChange,
}: {
  value: "both" | "out" | "in";
  onChange: (v: "both" | "out" | "in") => void;
}) {
  const btn = (val: "both" | "out" | "in", label: string) => {
    const active = value === val;
    return (
      <button
        type="button"
        onClick={() => onChange(val)}
        className={[
          "px-3 py-1.5 text-sm rounded-md border",
          active
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
        ].join(" ")}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  };
  return (
    <div className="inline-flex items-center gap-1">
      {btn("both", "Both")}
      {btn("out", "Outbound")}
      {btn("in", "Inbound")}
    </div>
  );
}

export default function FilterPanel({
  title,
  meta,
  f,
  setF,
  onReset,
  mobile,
  onClose,
  /** 👇 NEW: control visibility of Apply-to segment (pass false on one-way) */
  showApplyTo = true,
}: {
  title?: string;
  meta: DatasetMeta;
  f: Filters;
  setF: (x: Filters) => void;
  onReset: () => void;
  mobile?: boolean;
  onClose?: () => void;
  showApplyTo?: boolean; // NEW
}) {
  /* ===== typed Set toggles ===== */
  const toggleStringSet = (set: Set<string>, val: string) => {
    const next = new Set<string>(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  };
  const toggleSlot = (set: Set<TimeSlot>, val: TimeSlot) => {
    const next = new Set<TimeSlot>(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  };

  /** 🔒 Freeze slider bounds on mount so they don’t shift as results change */
  const [priceBounds] = React.useState(() => {
    const min = Math.floor(meta?.minPrice ?? 0);
    const max = Math.ceil(Math.max(meta?.maxPrice ?? 0, meta?.minPrice ?? 0));
    return { min, max };
  });
  const sliderMin = priceBounds.min;
  const sliderMax = priceBounds.max;

  /** Smooth local slider value (no snapping) */
  const [priceLocalMax, setPriceLocalMax] = React.useState(
    clamp(Number.isFinite(f.priceMax) ? f.priceMax : sliderMax, sliderMin, sliderMax)
  );

  // keep local slider in sync if parent pushes a different value (but keep bounds frozen)
  React.useEffect(() => {
    setPriceLocalMax((prev) => {
      const incoming = Number.isFinite(f.priceMax) ? f.priceMax : prev;
      return clamp(incoming, sliderMin, sliderMax);
    });
  }, [f.priceMax, sliderMin, sliderMax]);

  /* ===== stops (single-select via checkbox UI) ===== */
  const setStop = (n: 0 | 1 | 2) => setF({ ...f, stops: n, nonstopOnly: n === 0 });

  /* ===== Time labels ===== */
  const depCards = [
    { key: "0-6" as TimeSlot, top: "Before 6 AM", icon: <IconBefore6 /> },
    { key: "6-12" as TimeSlot, top: "6 AM to 12 PM", icon: <Icon6to12 /> },
    { key: "12-18" as TimeSlot, top: "12 PM to 6 PM", icon: <Icon12to18 /> },
    { key: "18-24" as TimeSlot, top: "After 6 PM", icon: <IconAfter6 /> },
  ];
  const arrCards = depCards;

  const applyTo = f.applyTo ?? "both";

  return (
    <aside className={`bg-white ${mobile ? "" : "p-4"} sm:p-4 text-[13px] sticky top-[190px] rounded-2xl`}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold">{title ?? "Applied Filters"}</h3>
        <div className="flex items-center gap-2">
          {mobile && (
            <button onClick={onClose} className="rounded-lg border px-3 py-1 text-sm">
              Close
            </button>
          )}
          <button onClick={onReset} className="text-sm text-gray-600 hover:text-gray-900">
            Clear all
          </button>
        </div>
      </div>

      {/* 👉 Apply-to Direction — visible only when allowed (i.e., round-trip) */}
      {showApplyTo && (
        <div className="mb-3 border-b border-gray-100 pb-3">
          <div className="mb-2 items-center justify-between">
            <div className="text-[16px] font-bold mb-2">Apply to</div>
            <Seg
              value={applyTo}
              onChange={(v) => setF({ ...f, applyTo: v })}
            />
          </div>
          <p className="text-[12px] text-gray-500">
            Choose whether these filters affect <b>Outbound</b>, <b>Inbound</b>, or <b>Both</b> lists.
          </p>
        </div>
      )}

      {/* Popular Filters */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[16px] font-bold">Popular Filters</div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className={cxCheck}
                checked={f.nonstopOnly}
                onChange={() => {
                  const nextNonstop = !f.nonstopOnly;
                  setF({
                    ...f,
                    nonstopOnly: nextNonstop,
                    stops: nextNonstop ? 0 : "any",
                  });
                }}
              />
              <span className="text-[14px]">Non Stop</span>
            </span>
            <span className="text-gray-500 text-[14px]">
              <Money v={meta.minPrice} />
            </span>
          </label>

          <label className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className={cxCheck}
                checked={f.hideNearby}
                onChange={() => setF({ ...f, hideNearby: !f.hideNearby })}
              />
              <span className="text-[14px]">Hide Nearby Airports</span>
            </span>
            <span className="text-gray-500 text-[14px]">
              <Money v={meta.minPrice} />
            </span>
          </label>

          {meta.airlines.slice(0, 1).map((al) => (
            <label key={al} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className={cxCheck}
                  checked={f.airlines.size !== 0 && f.airlines.has(al)}
                  onChange={() => setF({ ...f, airlines: toggleStringSet(f.airlines, al) })}
                />
                <span className="text-[14px]">{al}</span>
              </span>
              <span className="text-gray-500 text-[14px]">
                <Money v={meta.airlineMinPrice[al] ?? meta.minPrice} />
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* One Way Price (stable bounds) */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-2 text-[16px] font-bold">One Way Price</div>
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={1}
          value={priceLocalMax}
          onChange={(e) => {
            const raw = Number.isFinite(e.currentTarget.valueAsNumber)
              ? e.currentTarget.valueAsNumber
              : Number(e.currentTarget.value);
            const next = clamp(raw, sliderMin, sliderMax);
            setPriceLocalMax(next);           // smooth UI
            setF({ ...f, priceMax: next });   // update parent filters
          }}
          className="w-full"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-gray-600 text-[14px]">
          <span className="font-bold"><Money v={sliderMin} /></span>
          <span className="font-bold"><Money v={priceLocalMax} /></span>
        </div>
      </div>

      {/* Departure time */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-3 text-[16px] font-bold">Departure Time</div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "0-6" as TimeSlot, top: "Before 6 AM", icon: <IconBefore6 /> },
            { key: "6-12" as TimeSlot, top: "6 AM to 12 PM", icon: <Icon6to12 /> },
            { key: "12-18" as TimeSlot, top: "12 PM to 6 PM", icon: <Icon12to18 /> },
            { key: "18-24" as TimeSlot, top: "After 6 PM", icon: <IconAfter6 /> },
          ].map(({ key, top, icon }) => (
            <TimeCard
              key={key}
              selected={f.depSlots.has(key)}
              onClick={() => setF({ ...f, depSlots: toggleSlot(f.depSlots, key) })}
              titleTop={top}
              icon={icon}
            />
          ))}
        </div>
      </div>

      {/* Arrival time */}
      <div className="mb-3 border-b border-gray-100 pb-3">
        <div className="mb-3 text-[16px] font-bold">Arrival Time</div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "0-6" as TimeSlot, top: "Before 6 AM", icon: <IconBefore6 /> },
            { key: "6-12" as TimeSlot, top: "6 AM to 12 PM", icon: <Icon6to12 /> },
            { key: "12-18" as TimeSlot, top: "12 PM to 6 PM", icon: <Icon12to18 /> },
            { key: "18-24" as TimeSlot, top: "After 6 PM", icon: <IconAfter6 /> },
          ].map(({ key, top, icon }) => (
            <TimeCard
              key={key}
              selected={f.arrSlots.has(key)}
              onClick={() => setF({ ...f, arrSlots: toggleSlot(f.arrSlots, key) })}
              titleTop={top}
              icon={icon}
            />
          ))}
        </div>
      </div>

      {/* Departure Airports */}
      {meta.departAirports?.length > 0 && (
        <div className="mb-3 border-b border-gray-100 pb-3">
          <div className="mb-2 text-[16px] font-bold">Departure Airports</div>
          <div className="space-y-2">
            {meta.departAirports.map((a) => (
              <label key={a.code} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className={cxCheck}
                    checked={f.fromAirports.size !== 0 && f.fromAirports.has(a.code)}
                    onChange={() =>
                      setF({ ...f, fromAirports: toggleStringSet(f.fromAirports, a.code) })
                    }
                  />
                  <span className="text-[14px]">{a.label}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Arrival Airports */}
      {meta.arriveAirports?.length > 0 && (
        <div className="mb-3 border-b border-gray-100 pb-3">
          <div className="mb-2 text-[16px] font-bold">Arrival Airports</div>
          <div className="space-y-2">
            {meta.arriveAirports.map((a) => (
              <label key={a.code} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className={cxCheck}
                    checked={f.toAirports.size !== 0 && f.toAirports.has(a.code)}
                    onChange={() =>
                      setF({ ...f, toAirports: toggleStringSet(f.toAirports, a.code) })
                    }
                  />
                  <span className="text-[14px]">{a.label}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Airlines */}
      <div>
        <div className="mb-2 text-[16px] font-bold">Airlines</div>
        <div className="space-y-2">
          {meta.airlines.map((a) => (
            <label key={a} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className={cxCheck}
                  checked={f.airlines.size !== 0 && f.airlines.has(a)}
                  onChange={() => setF({ ...f, airlines: toggleStringSet(f.airlines, a) })}
                />
                <span className="text-[14px]">{a}</span>
              </span>
              <span className="text-gray-500">
                <Money v={meta.airlineMinPrice[a] ?? meta.minPrice} />
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
