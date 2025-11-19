import { useEffect, useRef, useState, useMemo } from "react";

function IconMinus() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function TravellerClassPicker({
  open,
  value,
  onChange,
  onClose,
  className = "",
}) {
  const ref = useRef(null);
  const [anim, setAnim] = useState(false);

  const CABINS = ["Economy", "Premium Economy", "Business"];
  const TOTAL_CAP = 9;

  const total = value.adults + value.children + value.infants;
  const isAtCap = useMemo(() => total >= TOTAL_CAP, [total]);

  // close on outside / Esc
  useEffect(() => {
    if (!open) return;

    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose?.();
      }
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

  const step = (field, dir) => {
    const next = { ...value };
    const delta = dir === "inc" ? 1 : -1;

    if (field === "adults") {
      const n = Math.min(9, Math.max(1, value.adults + delta));
      next.adults = n;
      if (next.infants > n) next.infants = n; // infants ≤ adults
    } else if (field === "children") {
      const n = Math.min(8, Math.max(0, value.children + delta));
      next.children = n;
    } else if (field === "infants") {
      const n = Math.min(4, Math.max(0, value.infants + delta));
      next.infants = Math.min(n, next.adults); // infants ≤ adults
    }

    // Total cap handle
    let t = next.adults + next.children + next.infants;
    if (t > TOTAL_CAP) {
      const overflow = t - TOTAL_CAP;
      if (field === "children") {
        next.children = Math.max(0, next.children - overflow);
      } else if (field === "infants") {
        next.infants = Math.max(0, next.infants - overflow);
      } else {
        // adults increased; try reduce children first then infants
        let rem = overflow;
        const reduceChildren = Math.min(rem, next.children);
        next.children -= reduceChildren;
        rem -= reduceChildren;
        if (rem > 0) next.infants = Math.max(0, next.infants - rem);
      }
    }

    const after = next.adults + next.children + next.infants;
    if (after === TOTAL_CAP && dir === "inc") {
      // nudge small highlight animation when cap reached
      setAnim(false);
      requestAnimationFrame(() => setAnim(true));
    }

    onChange?.(next);
  };

  if (!open) return null;

  return (
    <div className={`absolute z-40 mt-2 w-full md:w-[520px] ${className}`}>
      <div
        ref={ref}
        className={[
          "p-[1px] rounded-2xl",
          "bg-gradient-to-br from-blue-500/30 via-emerald-400/30 to-fuchsia-400/30",
          anim ? "opacity-100 scale-100" : "opacity-0 scale-95",
          "transition-all duration-150",
        ].join(" ")}
      >
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] overflow-hidden">
          {/* header */}
          <div className="px-5 py-3 flex items-center justify-between border-b bg-gradient-to-r from-white/80 to-white/60">
            <div className="text-base font-semibold">Travellers & Class</div>
            <div className="text-xs text-gray-500">Max {TOTAL_CAP} travellers</div>
          </div>

          {/* body */}
          <div className="p-5 grid gap-5">
            {[
              { key: "adults", title: "Adults", sub: "12 yrs or above", min: 1, max: 9 },
              { key: "children", title: "Children", sub: "2 - 12 yrs", min: 0, max: 8 },
              { key: "infants", title: "Infants", sub: "0 - 2 yrs", min: 0, max: 4 },
            ].map((r) => {
              const val = value[r.key];
              const decDisabled = val <= r.min;
              const incDisabled =
                (r.key === "infants" &&
                  (val >= Math.min(4, value.adults) || isAtCap)) ||
                (r.key !== "infants" && (val >= r.max || isAtCap));

              return (
                <div key={r.key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-gray-500">{r.sub}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="decrease"
                      onClick={() => step(r.key, "dec")}
                      disabled={decDisabled}
                      className={[
                        "w-9 h-9 rounded-full border border-gray-400 grid place-items-center",
                        decDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <IconMinus />
                    </button>
                    <div
                      className={[
                        "min-w-10 h-9 px-3 rounded-full grid place-items-center text-sm font-semibold",
                        "bg-gray-100 text-gray-800",
                        anim && isAtCap ? "ring-2 ring-orange-500/30" : "",
                      ].join(" ")}
                    >
                      {val}
                    </div>
                    <button
                      type="button"
                      aria-label="increase"
                      onClick={() => !incDisabled && step(r.key, "inc")}
                      disabled={incDisabled}
                      className={[
                        "w-9 h-9 rounded-full border border-gray-400 grid place-items-center",
                        incDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <IconPlus />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* group booking note */}
            <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm flex items-start gap-2">
              <span className="mt-0.5">👥</span>
              <div>
                Planning a trip for <strong>more than {TOTAL_CAP} travellers?</strong>{" "}
                <a className="text-orange-600 font-semibold hover:underline" href="#">
                  Create Group Booking
                </a>
              </div>
            </div>

            {/* cabin chips */}
            <div>
              <div className="text-sm font-semibold mb-2">Class</div>
              <div className="flex flex-wrap gap-2">
                {CABINS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onChange?.({ ...value, cabin: c })}
                    className={[
                      "px-3 py-1.5 rounded-full border border-gray-400 text-sm transition",
                      value.cabin === c
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-white hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="px-5 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{total}</span> Traveller
              {total > 1 ? "s" : ""} •{" "}
              <span className="font-semibold">{value.cabin}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow hover:opacity-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
