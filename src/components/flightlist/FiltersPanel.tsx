import React, { useState } from "react";

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
  applyTo: "both" | "out" | "in";
  fareView: "SINGLE" | "FULL";
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
    {new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: fractionDigits,
    }).format(Number.isFinite(v) ? v : 0)}
  </>
);

/* ===== Checkbox (theme-dynamic) ===== */
const cxCheck =
  "h-5 w-5 rounded border border-[var(--border)] accent-[var(--primary)] bg-[var(--surface)] outline-none focus:outline-none focus:ring-0";

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

/* ===== Reusable time card (theme-dynamic) ===== */
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
        "rounded-xl border px-3 py-2 text-center",
        "flex flex-col items-center justify-center gap-1",
        "text-[12px] leading-tight transition",
        selected
          ? "border-[var(--primary)] bg-[var(--primarySoft)] text-[var(--text)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]",
      ].join(" ")}
    >
      <div className={selected ? "text-[var(--primary)]" : "text-[var(--muted)]"}>{icon}</div>
      <div className="font-semibold">{titleTop}</div>
      {titleBottom ? <div className="text-[11px] text-[var(--muted)]">{titleBottom}</div> : null}
    </button>
  );
}

/* ===== Segmented control for ApplyTo (theme-dynamic) ===== */
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
          "px-3 py-1.5 text-sm rounded-lg border transition font-semibold",
          active
            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
            : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface2)]",
        ].join(" ")}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  };

  return <div className="inline-flex items-center gap-1">{btn("both", "Both")}{btn("out", "Outbound")}{btn("in", "Inbound")}</div>;
}

export default function FilterPanel({

 

  title,
  meta,
  f,
  setF,
  onReset,
  mobile,
  onClose,
  showApplyTo = true,
}: {
  title?: string;
  meta: DatasetMeta;
  f: Filters;
  setF: (x: Filters) => void;
  onReset: () => void;
  mobile?: boolean;
  onClose?: () => void;
  showApplyTo?: boolean;
}) {

     const [themeFx, setThemeFx] = useState({
      leftWash: "radial-gradient(70% 110% at 0% 40%, rgba(37,99,235,0.12), transparent 65%)",
      rightWash: "radial-gradient(70% 110% at 100% 50%, rgba(16,182,217,0.10), transparent 62%)",
      bottom: "linear-gradient(to top, rgba(2,6,23,0.03), transparent 60%)",
      badgeBg: "rgba(255,255,255,0.60)",
      badgeBorder: "rgba(255,255,255,0.40)",
      badgeDot: "rgba(34,197,94,1)",
      badgeIcon: "rgba(16,182,217,1)",
      focusRing: "rgba(16,182,217,0.45)",
    });
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

  React.useEffect(() => {
    setPriceLocalMax((prev) => {
      const incoming = Number.isFinite(f.priceMax) ? f.priceMax : prev;
      return clamp(incoming, sliderMin, sliderMax);
    });
  }, [f.priceMax, sliderMin, sliderMax]);

  const applyTo = f.applyTo ?? "both";

  return (
    <aside
      className={[
        "relative overflow-hidden rounded-2xl border border-[var(--border)] mb-4",
        "bg-[var(--surface)] text-[var(--text)]",
        mobile ? "" : "p-4",
        "sm:p-4 sticky top-[190px]",
      ].join(" ")}
    >
              <div className="pointer-events-none absolute inset-0" style={{ background: themeFx.leftWash }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: themeFx.rightWash }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2" style={{ background: themeFx.bottom }} />
      {/* ✅ Background wash (left blue-ish, right purple-ish) - theme dynamic */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(700px circle at 12% 35%, var(--primarySoft), transparent 60%)," +
            "radial-gradient(700px circle at 88% 25%, var(--accentSoft), transparent 60%)," +
            "linear-gradient(to bottom, var(--surface), var(--surface2))",
        }}
      />
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-bold">{title ?? "Applied Filters"}</h3>
          <div className="flex items-center gap-2">
            {mobile && (
              <button
                onClick={onClose}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-sm hover:bg-[var(--surface2)] transition"
              >
                Close
              </button>
            )}
            <button onClick={onReset} className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)] transition">
              Clear all
            </button>
          </div>
        </div>

        {/* Apply-to Direction */}
        {showApplyTo && (
          <div className="mb-3 border-b border-[var(--border)]/40 pb-3">
            <div className="mb-2">
              <div className="text-[15px] font-bold mb-2">Apply to</div>
              <Seg value={applyTo} onChange={(v) => setF({ ...f, applyTo: v })} />
            </div>
            <p className="text-[12px] text-[var(--muted)]">
              Choose whether these filters affect <b>Outbound</b>, <b>Inbound</b>, or <b>Both</b> lists.
            </p>
          </div>
        )}

        {/* Fare Display Mode */}
        <div className="mb-3 border-b border-[var(--border)]/40 pb-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[15px] font-bold">Fare Display</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setF({ ...f, fareView: "SINGLE" })}
              className={[
                "px-3 py-1.5 rounded-lg text-sm font-bold border transition",
                f.fareView === "SINGLE"
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface2)]",
              ].join(" ")}
            >
              Per Pax
            </button>

            <button
              type="button"
              onClick={() => setF({ ...f, fareView: "FULL" })}
              className={[
                "px-3 py-1.5 rounded-lg text-sm font-bold border transition",
                f.fareView === "FULL"
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface2)]",
              ].join(" ")}
            >
              Full Fare
            </button>
          </div>

          <p className="mt-1 text-[12px] text-[var(--muted)]">
            Choose whether prices are shown <b>per traveller</b> or as <b>total fare</b>.
          </p>
        </div>

        {/* Popular Filters */}
        <div className="mb-3 border-b border-[var(--border)]/40 pb-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[15px] font-bold">Popular Filters</div>
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
                <span className="text-[14px] font-semibold">Non Stop</span>
              </span>
              <span className="text-[var(--muted)] text-[14px]">
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
                <span className="text-[14px] font-semibold">Hide Nearby Airports</span>
              </span>
              <span className="text-[var(--muted)] text-[14px]">
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
                  <span className="text-[14px] font-semibold">{al}</span>
                </span>
                <span className="text-[var(--muted)] text-[14px]">
                  <Money v={meta.airlineMinPrice[al] ?? meta.minPrice} />
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price (stable bounds) */}
        <div className="mb-3 border-b border-[var(--border)]/40 pb-3">
          <div className="mb-2 text-[15px] font-bold">One Way Price</div>
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
              setPriceLocalMax(next);
              setF({ ...f, priceMax: next });
            }}
            className="w-full accent-[var(--primary)]"
          />

          <div className="mt-1 flex items-center justify-between text-[12px] text-[var(--muted)]">
            <span className="font-bold text-[var(--text)]">
              <Money v={sliderMin} />
            </span>
            <span className="font-bold text-[var(--text)]">
              <Money v={priceLocalMax} />
            </span>
          </div>
        </div>

        {/* Departure time */}
        <div className="mb-3 border-b border-[var(--border)]/40 pb-3">
          <div className="mb-3 text-[15px] font-bold">Departure Time</div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "0-6" as TimeSlot, label: "Before 6 AM", icon: <IconBefore6 /> },
              { key: "6-12" as TimeSlot, label: "6 AM – 12 PM", icon: <Icon6to12 /> },
              { key: "12-18" as TimeSlot, label: "12 PM – 6 PM", icon: <Icon12to18 /> },
              { key: "18-24" as TimeSlot, label: "After 6 PM", icon: <IconAfter6 /> },
            ].map(({ key, label, icon }) => {
              const active = f.depSlots.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setF({ ...f, depSlots: toggleSlot(f.depSlots, key) })}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-semibold transition",
                    active
                      ? "border-[var(--primary)] bg-[var(--primarySoft)] text-[var(--text)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]",
                  ].join(" ")}
                >
                  <span className={active ? "text-[var(--primary)]" : "text-[var(--muted)]"}>{icon}</span>
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Arrival time */}
        <div className="mb-3 border-b border-[var(--border)]/40 pb-3">
          <div className="mb-3 text-[15px] font-bold">Arrival Time</div>
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
          <div className="mb-3 border-b border-[var(--border)]/40 pb-3">
            <div className="mb-2 text-[15px] font-bold">Departure Airports</div>
            <div className="space-y-2">
              {meta.departAirports.map((a) => (
                <label key={a.code} className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className={cxCheck}
                      checked={f.fromAirports.size !== 0 && f.fromAirports.has(a.code)}
                      onChange={() => setF({ ...f, fromAirports: toggleStringSet(f.fromAirports, a.code) })}
                    />
                    <span className="text-[14px] font-semibold">{a.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Arrival Airports */}
        {meta.arriveAirports?.length > 0 && (
          <div className="mb-3 border-b border-[var(--border)]/40 pb-3">
            <div className="mb-2 text-[15px] font-bold">Arrival Airports</div>
            <div className="space-y-2">
              {meta.arriveAirports.map((a) => (
                <label key={a.code} className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className={cxCheck}
                      checked={f.toAirports.size !== 0 && f.toAirports.has(a.code)}
                      onChange={() => setF({ ...f, toAirports: toggleStringSet(f.toAirports, a.code) })}
                    />
                    <span className="text-[14px] font-semibold">{a.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Airlines */}
        <div>
          <div className="mb-2 text-[15px] font-bold">Airlines</div>
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
                  <span className="text-[14px] font-semibold">{a}</span>
                </span>
                <span className="text-[var(--muted)]">
                  <Money v={meta.airlineMinPrice[a] ?? meta.minPrice} />
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
