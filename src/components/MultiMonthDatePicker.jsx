import { useEffect, useMemo, useRef, useState } from "react";

/* helpers */
const sOD = d => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const sameDay = (a,b) => a && b &&
  a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const addMonths = (d,n) => { const x = new Date(d); x.setDate(1); x.setMonth(x.getMonth()+n); return x; };
const dim = (y,m) => new Date(y, m+1, 0).getDate();
const buildCells = (y,m) => {
  const first = new Date(y,m,1);
  const offset = (first.getDay()+7)%7; // 0=Sun
  const total = dim(y,m);
  const cells = [];
  for (let i=0;i<offset;i++) cells.push(null);
  for (let d=1; d<=total; d++) cells.push(new Date(y,m,d));
  while (cells.length%7) cells.push(null);
  while (cells.length<42) cells.push(null); // always 6 rows
  return cells;
};

export default function MultiMonthDatePicker({
  value, onChange, open, onClose,
  months = 2, minDate, maxDate, className = ""
}) {
  const ref = useRef(null);
  const [anchor, setAnchor] = useState(() => sOD(value || new Date()));
  const headerFmt = useMemo(() => new Intl.DateTimeFormat(undefined,{ month:"long", year:"numeric" }),[]);
  const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const today = sOD(new Date());

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
  const totalWidth = months * monthWidth + (months-1)*24 + 32; // grids gap + padding

  return (
    <div
      ref={ref}
      className={`absolute top-[calc(100%+8px)] left-0 rounded-3xl border border-gray-200 bg-white
                  shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] p-4 z-30 ${className}`}
      style={{ width: totalWidth }}
      role="dialog" aria-label="Calendar"
    >
      {/* edge arrows */}
      <button
        onClick={() => setAnchor(a => addMonths(a,-1))}
        className="absolute left-2 top-3 w-8 h-8 rounded-full grid place-items-center hover:bg-gray-100"
        aria-label="Previous month"
      >‹</button>
      <button
        onClick={() => setAnchor(a => addMonths(a, 1))}
        className="absolute right-2 top-3 w-8 h-8 rounded-full grid place-items-center hover:bg-gray-100"
        aria-label="Next month"
      >›</button>

      {/* months */}
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${months}, minmax(0,1fr))` }}>
        {Array.from({ length: months }).map((_, i) => {
          const view = addMonths(anchor, i);
          const y = view.getFullYear();
          const m = view.getMonth();
          const cells = buildCells(y, m);

          return (
            <div key={i} className="w-[280px]">
              <div className="text-center text-base font-semibold mb-3 tracking-wide">
                {headerFmt.format(view)}
              </div>

              <div className="grid grid-cols-7 text-[11px] text-gray-500 mb-1">
                {weekday.map(d => <div key={d} className="h-6 grid place-items-center">{d}</div>)}
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
                      onClick={() => { if (d){ onChange?.(d); onClose?.(); } }}
                      className={[
                        "h-8 rounded-xl border transition-colors text-sm flex flex-col items-center justify-center",
                        d ? "border-transparent hover:bg-gray-50" : "border-transparent cursor-default",
                        disabled ? "text-gray-300 cursor-not-allowed hover:bg-transparent" : "text-gray-900",
                        selected ? "bg-black text-white hover:bg-blue-600" : "",
                        isToday && !selected ? "ring-1 ring-blue-200" : "",
                      ].join(" ")}
                    >
                      <div className="font-semibold leading-none">{d ? d.getDate() : ""}</div>
                     
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
