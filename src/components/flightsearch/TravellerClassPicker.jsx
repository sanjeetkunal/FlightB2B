import { useEffect, useRef, useState, useMemo } from "react";

function IconMinus() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function TravellerClassPicker({
  open,
  value,
  onChange,
  onClose,
}) {
  const ref = useRef(null);
  const [anim, setAnim] = useState(false);

  const CABINS = ["Economy", "Premium Economy", "Business"];
  const TOTAL_CAP = 9;

  const total = value.adults + value.children + value.infants;
  const isAtCap = useMemo(() => total >= TOTAL_CAP, [total]);

  /* ---------------- Close handlers ---------------- */
  useEffect(() => {
    if (!open) return;

    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    setTimeout(() => setAnim(true), 0);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      setAnim(false);
    };
  }, [open, onClose]);

  /* ---------------- Step logic (unchanged) ---------------- */
  const step = (field, dir) => {
    const next = { ...value };
    const delta = dir === "inc" ? 1 : -1;

    if (field === "adults") {
      const n = Math.min(9, Math.max(1, value.adults + delta));
      next.adults = n;
      if (next.infants > n) next.infants = n;
    } else if (field === "children") {
      next.children = Math.min(8, Math.max(0, value.children + delta));
    } else if (field === "infants") {
      next.infants = Math.min(4, Math.max(0, Math.min(value.infants + delta, value.adults)));
    }

    let t = next.adults + next.children + next.infants;
    if (t > TOTAL_CAP) {
      next.children = Math.max(0, next.children - (t - TOTAL_CAP));
    }

    onChange?.(next);
  };

  if (!open) return null;

  return (
    <>
      {/* ✅ Mobile backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose} />

      {/* ✅ Container */}
      <div
        className="
          fixed md:absolute z-50
          inset-x-0 bottom-0 md:inset-auto md:bottom-auto
          md:right-0 md:top-[calc(100%+8px)]
          flex justify-center md:justify-end
        "
      >
        <div
          ref={ref}
          className={[
            "w-full md:w-[520px] max-w-[96vw]",
            "p-[1px] rounded-2xl",
            "bg-gradient-to-br from-blue-500/30 via-emerald-400/30 to-fuchsia-400/30",
            anim ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            "transition-all duration-200",
          ].join(" ")}
        >
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 flex justify-between border-b">
              <div className="text-base font-semibold">Travellers & Class</div>
              <div className="text-xs text-gray-500">Max {TOTAL_CAP}</div>
            </div>

            {/* Body */}
            <div className="p-5 grid gap-5">
              {[
                { key: "adults", title: "Adults", sub: "12+ yrs", min: 1 },
                { key: "children", title: "Children", sub: "2–12 yrs", min: 0 },
                { key: "infants", title: "Infants", sub: "0–2 yrs", min: 0 },
              ].map((r) => {
                const val = value[r.key];
                return (
                  <div key={r.key} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-gray-500">{r.sub}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => step(r.key, "dec")}
                        disabled={val <= r.min}
                        className="w-9 h-9 rounded-full border grid place-items-center disabled:opacity-40"
                      >
                        <IconMinus />
                      </button>
                      <div className="min-w-10 text-center font-semibold">{val}</div>
                      <button
                        onClick={() => step(r.key, "inc")}
                        disabled={isAtCap}
                        className="w-9 h-9 rounded-full border grid place-items-center disabled:opacity-40"
                      >
                        <IconPlus />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Cabin */}
              <div>
                <div className="text-sm font-semibold mb-2">Class</div>
                <div className="flex flex-wrap gap-2">
                  {CABINS.map((c) => (
                    <button
                      key={c}
                      onClick={() => onChange?.({ ...value, cabin: c })}
                      className={[
                        "px-3 py-1.5 rounded-full border text-sm",
                        value.cabin === c
                          ? "bg-black text-white border-black"
                          : "hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <strong>{total}</strong> Travellers • <strong>{value.cabin}</strong>
              </div>
              <button
                onClick={onClose}
                className="h-10 px-5 rounded-xl bg-blue-600 text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
