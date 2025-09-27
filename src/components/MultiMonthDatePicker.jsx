import { useEffect, useMemo, useRef, useState } from "react";

/* helpers */
const sOD = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const sameDay = (a, b) => a && b &&
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const addMonths = (d, n) => { const x = new Date(d); x.setDate(1); x.setMonth(x.getMonth() + n); return x; };
const dim = (y, m) => new Date(y, m + 1, 0).getDate();
const buildCells = (y, m) => {
  const first = new Date(y, m, 1);
  const offset = (first.getDay() + 7) % 7; // 0=Sun
  const total = dim(y, m);
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(y, m, d));
  while (cells.length % 7) cells.push(null);
  while (cells.length < 42) cells.push(null); // always 6 rows
  return cells;
};

export default function MultiMonthDatePicker({
  value, onChange, open, onClose,
  months = 2, minDate, maxDate, className = ""
}) {
  const ref = useRef(null);
  const [anchor, setAnchor] = useState(() => sOD(value || new Date()));
  const headerFmt = useMemo(() => new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }), []);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = sOD(new Date());

  // responsive: how many months to render (1 on mobile)
  const [displayMonths, setDisplayMonths] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? 1 : months
  );

  useEffect(() => {
    // update on prop change (desktop)
    if (typeof window !== "undefined" && window.innerWidth >= 640) {
      setDisplayMonths(months);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setDisplayMonths(1);
      } else {
        setDisplayMonths(months);
      }
    }
    window.addEventListener("resize", handleResize);
    // initial run (in case SSR -> client mismatch)
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [months]);

  useEffect(() => {
    const fn = e => { if (open && ref.current && !ref.current.contains(e.target)) onClose?.(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open, onClose]);

  useEffect(() => {
    const onKey = e => { if (open && e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isDisabled = (d) => {
    if (!d) return true;
    if (minDate && d < sOD(minDate)) return true;
    if (maxDate && d > sOD(maxDate)) return true;
    return false;
  };

  const monthWidth = 280; // keep cells consistent
  // recompute width based on displayMonths
  const totalWidth = displayMonths * monthWidth + (displayMonths - 1) * 24 + 32; // grids gap + padding

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Calendar"
      // position/visual container - still absolute in your layout
      className={[
        "absolute top-[calc(100%+8px)] left-0 rounded-3xl border border-gray-200 bg-white",
        "shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] p-4 z-30",
        "max-w-[98vw] sm:max-w-[92vw] md:max-w-[1000px]", // responsive cap
        className,
      ].join(" ")}
      // only set inline width when totalWidth is smaller than viewport; otherwise let CSS cap it
      style={typeof window !== "undefined" && totalWidth < window.innerWidth ? { width: totalWidth } : undefined}
    >
      {/* edge arrows */}
      <button
        onClick={() => setAnchor(a => addMonths(a, -1))}
        className="absolute left-2 top-3 w-8 h-8 rounded-full grid place-items-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
        aria-label="Previous month"
      >
        ‹
      </button>
      <button
        onClick={() => setAnchor(a => addMonths(a, 1))}
        className="absolute right-2 top-3 w-8 h-8 rounded-full grid place-items-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
        aria-label="Next month"
      >
        ›
      </button>

      {/* months container
          - mobile: display single month (no horizontal scroll)
          - >=768px: grid of months
      */}
      <div
        className={[
          displayMonths === 1 ? "w-full" : "flex gap-6 overflow-x-auto touch-pan-x",
          "py-2 px-1 -mx-1",
          // marker for css grid override
          "cal-months-container",
        ].join(" ")}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {Array.from({ length: displayMonths }).map((_, i) => {
          const view = addMonths(anchor, i);
          const y = view.getFullYear();
          const m = view.getMonth();
          const cells = buildCells(y, m);

          return (
            <div
              key={i}
              className={[
                // mobile: fill width; desktop: min width for multi-column layout
                displayMonths === 1 ? "w-full" : "min-w-[260px] sm:min-w-[280px] flex-shrink-0",
                "mx-auto",
              ].join(" ")}
            >
              <div className="text-center text-base font-semibold mb-3 tracking-wide">
                {headerFmt.format(view)}
              </div>

              <div className="grid grid-cols-7 text-[11px] text-gray-500 mb-1">
                {weekday.map(d => (
                  <div key={d} className="h-6 grid place-items-center">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((d, idx) => {
                  const disabled = isDisabled(d);
                  const selected = d && sameDay(d, value);
                  const isToday = d && sameDay(d, today);
                  return (
                    <button
                      key={idx}
                      disabled={!d || disabled}
                      onClick={() => {
                        if (d) {
                          onChange?.(d);
                          onClose?.();
                        }
                      }}
                      className={[
                        "h-8 rounded-xl border transition-colors text-sm flex items-center justify-center px-0",
                        d ? "border-transparent hover:bg-gray-50" : "border-transparent cursor-default",
                        disabled ? "text-gray-300 cursor-not-allowed hover:bg-transparent" : "text-gray-900",
                        selected ? "bg-black text-white hover:bg-black" : "",
                        isToday && !selected ? "ring-1 ring-blue-200" : "",
                        // enlarge hit target on small screens
                        "sm:h-8",
                      ].join(" ")}
                      aria-pressed={selected ? "true" : "false"}
                    >
                      <div className="font-semibold leading-none text-sm">{d ? d.getDate() : ""}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive CSS: on medium+ screens show months in grid columns; on mobile we already show one month */}
      <style>{`
        /* When viewport width >= 768px, lay out months side-by-side using grid.
           We target the .cal-months-container element to change its display. */
        @media (min-width: 768px) {
          .cal-months-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1.5rem;
            overflow: visible;
          }
        }

        /* small cosmetic: hide horizontal scrollbar on webkit while still scrollable */
        .cal-months-container::-webkit-scrollbar { height: 8px; }
        .cal-months-container::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 9999px; }
      `}</style>
    </div>
  );
}
