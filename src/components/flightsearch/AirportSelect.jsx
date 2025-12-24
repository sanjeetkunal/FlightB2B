import { useEffect, useMemo, useRef, useState } from "react";
import { AIRPORTS } from "../../data/airports";
import FieldShell from "./FieldShell";

export default function AirportSelect({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // close on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // focus input when open
  useEffect(() => {
    if (open) {
      // small delay so DOM stable
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const list = useMemo(() => {
    const norm = (s) => (s || "").toLowerCase().trim();
    const qq = norm(q);

    const filtered = AIRPORTS.filter((a) =>
      !qq ||
      norm(a.code).includes(qq) ||
      norm(a.city).includes(qq) ||
      norm(a.airport).includes(qq) ||
      (a.state && norm(a.state).includes(qq)) ||
      (a.country && norm(a.country).includes(qq))
    );

    if (!qq) {
      const pop = filtered.filter((a) => a.popular);
      const others = filtered.filter((a) => !a.popular);
      return [...pop, ...others];
    }
    return filtered;
  }, [q]);

  useEffect(() => setActive(0), [q, open]);

  const pick = (ap) => {
    onChange(ap);
    setOpen(false);
    setQ("");
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange(null);
    setQ("");
    setOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === "Enter" || e.key === "ArrowDown")) {
      setOpen(true);
      return;
    }

    if (!open) return;

    if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      return;
    }

    if (e.key === "Enter") {
      const ap = list[active];
      if (ap) pick(ap);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(list.length - 1, 0)));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
  };

  const primary = value
    ? `${value.city}`
    : "";

  const secondary = value ? `${value.airport} • ${value.code}` : "";

  return (
    <div className="relative min-w-0" ref={wrapRef}>
      <FieldShell label={label}>
        {/* top row: big title + clear button */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            {/* ✅ SAME LINE INPUT (only when open) */}
            {open ? (
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="City, airport or code"
                className="
                  w-full bg-transparent outline-none
                  text-[18px] leading-6 font-bold text-slate-900
                  placeholder:text-slate-300
                "
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(true);
                  setQ("");
                }}
                className="w-full text-left min-w-0 cursor-pointer"
              >
                <div className="text-[18px] leading-6 font-bold text-slate-900 truncate">
                  {primary || "Select city"}
                </div>
              </button>
            )}

            {/* secondary line always visible (but show hint when empty) */}
            <div className="text-[12px] text-slate-500 truncate">
              {secondary || "City / Airport / Code"}
            </div>
          </div>

          {value && (
            <button
              type="button"
              onClick={clear}
              className="
                shrink-0 h-8 w-8 grid place-items-center rounded-full
                border border-slate-200 text-slate-500
                hover:text-slate-900 hover:bg-slate-50
              "
              aria-label="Clear"
              title="Clear"
            >
              ×
            </button>
          )}
        </div>
      </FieldShell>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute z-40 mt-2
            w-[min(520px,96vw)]
            rounded-3xl border border-slate-200 bg-white
            shadow-[0_24px_60px_-18px_rgba(0,0,0,0.35)]
            p-2
          "
        >
          {!q && (
            <div className="px-4 py-2 text-xs font-semibold text-slate-600">
              Popular Airports
            </div>
          )}

          <ul className="max-h-96 overflow-auto">
            {list.map((a, i) => (
              <li key={a.code + a.airport}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(a)}
                  className={[
                    "w-full text-left px-4 py-3 flex gap-3 items-start rounded-2xl",
                    i === active ? "bg-blue-50" : "hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 font-bold bg-slate-50">
                    {a.code}
                  </span>

                  <div className="min-w-0">
                    <div className="font-semibold text-[14px] truncate">
                      {a.city}
                      {a.state ? `, ${a.state}` : ""}, {a.country}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {a.airport}
                    </div>
                  </div>
                </button>

                {i < list.length - 1 && (
                  <div className="mx-4 h-px bg-slate-100" />
                )}
              </li>
            ))}

            {list.length === 0 && (
              <li className="px-4 py-3 text-sm text-slate-500">
                No airports found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
