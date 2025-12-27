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

export default function TravellerClassPicker({ open, value, onChange, onClose }) {
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
      const el = ref.current;
      if (!el) return;
      if (!el.contains(e.target)) onClose?.();
    };

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);

    setTimeout(() => setAnim(true), 0);

    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
      setAnim(false);
    };
  }, [open, onClose]);

  /* ---------------- Step logic (same) ---------------- */
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
      next.infants = Math.min(
        4,
        Math.max(0, Math.min(value.infants + delta, value.adults))
      );
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
      {/* Mobile backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Container */}
      <div
        className="
          fixed md:absolute z-50
          inset-x-0 bottom-0 md:inset-auto md:bottom-auto
          md:right-0 md:top-[calc(100%+8px)]
          flex justify-center md:justify-end
        "
      >
        {/* Outer frame (theme gradient-ish, no hardcode) */}
        <div
          ref={ref}
          onClick={(e) => e.stopPropagation()}
          className={[
            "w-full md:w-[520px] max-w-[96vw]",
            "p-[1px] rounded-2xl",
            anim ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            "transition-all duration-200",
          ].join(" ")}
          style={{
            background:
              "linear-gradient(135deg, var(--primarySoft), rgba(0,0,0,0), var(--primarySoft))",
          }}
        >
          {/* Card */}
          <div
            className="rounded-2xl shadow-xl overflow-hidden"
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-3 flex justify-between items-center"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="text-base font-semibold">Travellers & Class</div>
              <div style={{ color: "var(--muted)" }} className="text-xs font-semibold">
                Max {TOTAL_CAP}
              </div>
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
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {r.sub}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => step(r.key, "dec")}
                        disabled={val <= r.min}
                        className={[
                          "w-9 h-9 rounded-full grid place-items-center transition",
                          "disabled:opacity-40 disabled:cursor-not-allowed",
                          "focus:outline-none focus:ring-4",
                        ].join(" ")}
                        style={{
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          color: "var(--text)",
                          // focus ring theme
                          boxShadow: "0 0 0 0 rgba(0,0,0,0)",
                        }}
                        onMouseEnter={(e) => {
                          if (e.currentTarget.disabled) return;
                          e.currentTarget.style.background = "var(--surface2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--surface)";
                        }}
                      >
                        <IconMinus />
                      </button>

                      <div className="min-w-10 text-center font-semibold">{val}</div>

                      <button
                        type="button"
                        onClick={() => step(r.key, "inc")}
                        disabled={isAtCap}
                        className={[
                          "w-9 h-9 rounded-full grid place-items-center transition",
                          "disabled:opacity-40 disabled:cursor-not-allowed",
                          "focus:outline-none focus:ring-4",
                        ].join(" ")}
                        style={{
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          color: "var(--text)",
                        }}
                        onMouseEnter={(e) => {
                          if (e.currentTarget.disabled) return;
                          e.currentTarget.style.background = "var(--surface2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--surface)";
                        }}
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
                  {CABINS.map((c) => {
                    const active = value.cabin === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onChange?.({ ...value, cabin: c })}
                        className="px-3 py-1.5 rounded-full border text-sm font-semibold transition focus:outline-none focus:ring-4"
                        style={{
                          border: active ? "1px solid var(--primary)" : "1px solid var(--border)",
                          background: active ? "var(--primarySoft)" : "var(--surface)",
                          color: active ? "var(--text)" : "var(--text)",
                        }}
                        onMouseEnter={(e) => {
                          if (active) return;
                          e.currentTarget.style.background = "var(--surface2)";
                        }}
                        onMouseLeave={(e) => {
                          if (active) return;
                          e.currentTarget.style.background = "var(--surface)";
                        }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-5 py-3 flex justify-between items-center"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div className="text-sm" style={{ color: "var(--muted)" }}>
                <span style={{ color: "var(--text)" }} className="font-bold">
                  {total}
                </span>{" "}
                Travellers •{" "}
                <span style={{ color: "var(--text)" }} className="font-bold">
                  {value.cabin}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-10 px-5 rounded-xl text-white font-semibold transition focus:outline-none focus:ring-4"
                style={{
                  background: "var(--primary)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primaryHover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Focus ring color (theme) */}
      <style>{`
        button:focus-visible {
          box-shadow: 0 0 0 6px var(--primarySoft);
        }
      `}</style>
    </>
  );
}
