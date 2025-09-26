import { useEffect, useMemo, useRef, useState } from "react";
import { AIRPORTS } from "../data/airports";
import FieldShell from "./FieldShell";

export default function AirportSelect({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // close on outside click
  useEffect(() => {
    const onDoc = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const list = useMemo(() => {
    const norm = (s) => (s || "").toLowerCase().trim();
    const qq = norm(q);
    const filtered = AIRPORTS.filter(a =>
      !qq ||
      norm(a.code).includes(qq) ||
      norm(a.city).includes(qq) ||
      norm(a.airport).includes(qq) ||
      (a.state && norm(a.state).includes(qq)) ||
      (a.country && norm(a.country).includes(qq))
    );
    if (!qq) {
      const pop = filtered.filter(a => a.popular);
      const others = filtered.filter(a => !a.popular);
      return [...pop, ...others];
    }
    return filtered;
  }, [q]);

  const pick = (ap) => {
    onChange(ap);
    setOpen(false);
    setQ("");
    inputRef.current?.blur();
  };

  const clear = (e) => { e.stopPropagation(); onChange(null); setQ(""); setOpen(true); inputRef.current?.focus(); };

  return (
    <div className="relative" ref={wrapRef}>
      <FieldShell label={label}>
        <input
          ref={inputRef}
          value={open ? q : (value ? `${value.code} - ${value.city}` : "")}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => { setOpen(true); setQ(""); }}
          placeholder="City, airport or code"
          className="w-full bg-transparent text-[16px] font-semibold outline-none cursor-pointer"
          onKeyDown={(e) => {
            if (!open && (e.key === "Enter" || e.key === "ArrowDown")) setOpen(true);
            if (open && e.key === "Escape") setOpen(false);
            if (open && e.key === "Enter") { const ap = list[active]; if (ap) pick(ap); }
            if (open && e.key === "ArrowDown") setActive((a) => Math.min(a + 1, list.length - 1));
            if (open && e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
          }}
          readOnly={false}
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Clear"
            title="Clear"
          >
            ×
          </button>
        )}
      </FieldShell>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 mt-2 w-[min(420px,90vw)] sm:w-[420px] rounded-3xl shadow-[0_20px_50px_-5px_rgba(0,0,0,0.25)] bg-white shadow-2xl p-2">
          {!q && <div className="px-4 py-2 text-sm font-semibold text-gray-800">Popular Airports</div>}
          <ul className="max-h-96 overflow-auto">
            {list.map((a, i) => (
              <li key={a.code + a.airport}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(a)}
                  className={`w-full text-left px-4 py-3 flex gap-3 items-start rounded-2xl
                              ${i === active ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 font-semibold bg-gray-100 p-2">
                    {a.code}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-[15px]">
                      {a.city}{a.state ? `, ${a.state}` : ""}, {a.country}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{a.airport}</div>
                  </div>
                </button>
                <div className="mx-4 h-px bg-gray-200" />
              </li>
            ))}
            {list.length === 0 && <li className="px-4 py-3 text-sm text-gray-500">No airports found</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
