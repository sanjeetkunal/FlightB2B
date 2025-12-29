import React, { useMemo, useState, useCallback } from "react";

/** ================== Theme Vars (same idea as your Payment page) ================== */
const VAR = {
  surface: "var(--surface, rgba(255,255,255,0.92))",
  surface2: "var(--surface2, rgba(248,250,252,0.92))",
  border: "var(--border, rgba(15,23,42,0.12))",
  text: "var(--text, rgba(15,23,42,0.92))",
  muted: "var(--muted, rgba(71,85,105,0.9))",
  subtle: "var(--subtle, rgba(100,116,139,0.85))",
  primary: "var(--primary, rgb(37,99,235))",
  primarySoft: "var(--primarySoft, rgba(37,99,235,0.14))",
  accent: "var(--accent, rgb(16,182,217))",
  accentSoft: "var(--accentSoft, rgba(16,182,217,0.12))",
  success: "var(--success, rgb(34,197,94))",
  successSoft: "var(--successSoft, rgba(34,197,94,0.12))",
  warn: "var(--warn, rgb(245,158,11))",
  warnSoft: "var(--warnSoft, rgba(245,158,11,0.14))",
  danger: "var(--danger, rgb(244,63,94))",
};

const nfIN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const fmtINR = (v) => `₹${nfIN.format(Number.isFinite(v) ? v : 0)}`;

export default function SeatMap({
  totalPax = 1,
  selectedSeats = [],
  onChange = () => {},
  seatPrice = 250,
  rows = 18,
  letters = ["A", "B", "C", "D", "E", "F"],
  blockedSeats = ["1C", "1D", "7B", "7C"],
  bookedSeats = ["5A", "5B", "12F", "14E"],
  extraLegroomRows = [1, 2, 3, 4],
}) {
  const [warn, setWarn] = useState("");
  const [hovered, setHovered] = useState("");

  const BLOCKED = useMemo(
    () => (blockedSeats instanceof Set ? blockedSeats : new Set(blockedSeats || [])),
    [blockedSeats]
  );
  const BOOKED = useMemo(
    () => (bookedSeats instanceof Set ? bookedSeats : new Set(bookedSeats || [])),
    [bookedSeats]
  );

  const ROWS = useMemo(() => Array.from({ length: Math.max(1, rows) }, (_, i) => i + 1), [rows]);
  const LETTERS = useMemo(
    () => (Array.isArray(letters) && letters.length ? letters : ["A", "B", "C", "D", "E", "F"]),
    [letters]
  );

  const aisleIndex = 3; // 3-3 layout

  const seatTotal = useMemo(
    () => (Array.isArray(selectedSeats) ? selectedSeats.length : 0) * (Number(seatPrice) || 0),
    [selectedSeats, seatPrice]
  );

  const canSelectMore = useMemo(() => {
    const count = Array.isArray(selectedSeats) ? selectedSeats.length : 0;
    return count < (Number(totalPax) || 0);
  }, [selectedSeats, totalPax]);

  const toggleSeat = useCallback(
    (seatId) => {
      setWarn("");

      if (BLOCKED.has(seatId) || BOOKED.has(seatId)) return;

      const current = Array.isArray(selectedSeats) ? selectedSeats : [];
      const isSelected = current.includes(seatId);

      if (isSelected) {
        onChange(current.filter((s) => s !== seatId));
        return;
      }

      if (!canSelectMore) {
        setWarn(`You can select up to ${totalPax} seat(s) only.`);
        return;
      }

      onChange([...current, seatId]);
    },
    [BLOCKED, BOOKED, selectedSeats, onChange, canSelectMore, totalPax]
  );

  const seatState = useCallback(
    (id, row) => {
      const isBlocked = BLOCKED.has(id);
      const isBooked = BOOKED.has(id);
      const isSelected = (selectedSeats || []).includes(id);
      const isExtra = extraLegroomRows.includes(row);
      const isHovered = hovered === id;

      return { isBlocked, isBooked, isSelected, isExtra, isHovered };
    },
    [BLOCKED, BOOKED, selectedSeats, extraLegroomRows, hovered]
  );

  const Seat = ({ id, row }) => {
    const st = seatState(id, row);
    const disabled = st.isBlocked || st.isBooked;

    const base = {
      border: `1px solid ${VAR.border}`,
      background: VAR.surface,
      color: VAR.text,
    };

    const blockedStyle = {
      background: "rgba(15,23,42,0.08)",
      color: "rgba(15,23,42,0.35)",
      border: `1px solid rgba(15,23,42,0.10)`,
      cursor: "not-allowed",
    };

    const selectedStyle = {
      background: VAR.primary,
      color: "white",
      border: `1px solid ${VAR.primary}`,
      boxShadow: "0 10px 24px rgba(2,6,23,0.10)",
    };

    const hoverStyle = {
      background: VAR.primarySoft,
      color: VAR.text,
      border: `1px solid rgba(15,23,42,0.18)`,
    };

    // extra legroom ring/border (only when available & not selected)
    const extraStyle =
      st.isExtra && !st.isSelected && !disabled
        ? {
            border: `1px solid ${VAR.warn}`,
            boxShadow: `0 0 0 3px ${VAR.warnSoft}`,
          }
        : null;

    const style = disabled
      ? blockedStyle
      : st.isSelected
      ? selectedStyle
      : st.isHovered
      ? hoverStyle
      : base;

    const title =
      disabled
        ? BOOKED.has(id)
          ? `${id} • Booked`
          : `${id} • Blocked`
        : st.isSelected
        ? `${id} • Selected`
        : `${id} • Available`;

    return (
      <button
        type="button"
        onClick={() => toggleSeat(id)}
        disabled={disabled}
        title={title}
        className="h-9 w-9 rounded-lg text-[10px] font-extrabold transition"
        style={{ ...style, ...(extraStyle || {}) }}
        onMouseEnter={() => {
          if (!disabled && !st.isSelected) setHovered(id);
        }}
        onMouseLeave={() => setHovered("")}
      >
        {id}
      </button>
    );
  };

  return (
    <div className="rounded-2xl shadow-sm" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5" style={{ borderBottom: `1px solid ${VAR.border}` }}>
        <div>
          <div className="text-sm font-semibold" style={{ color: VAR.text }}>
            Seat selection (optional)
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: VAR.subtle }}>
            Select seats for each traveller. You can select up to <b>{totalPax}</b> seat(s).
          </div>

          {warn ? (
            <div
              className="mt-2 rounded-xl px-3 py-2 text-[11px] font-semibold"
              style={{ background: "rgba(244,63,94,0.10)", color: VAR.danger, border: `1px solid rgba(244,63,94,0.18)` }}
            >
              {warn}
            </div>
          ) : null}
        </div>

        <div className="text-right">
          <div className="text-[11px]" style={{ color: VAR.subtle }}>
            From <span className="font-semibold" style={{ color: VAR.text }}>{fmtINR(seatPrice)}</span>/seat
          </div>
          <div className="mt-1 text-[11px]" style={{ color: VAR.subtle }}>
            Selected:{" "}
            <span className="font-extrabold" style={{ color: VAR.primary }}>
              {selectedSeats?.length || 0}
            </span>
            /{totalPax}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4 pt-3 sm:px-5">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide">
          <span style={{ color: VAR.subtle }}>Front of aircraft</span>
          <span style={{ color: VAR.subtle }}>Extra legroom rows: {extraLegroomRows.join(", ")}</span>
        </div>

        {/* Seat grid wrapper */}
        <div className="inline-flex flex-col rounded-2xl px-3 py-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
          {/* Letters header */}
          <div className="mb-2 flex items-center justify-center gap-2 text-[10px]">
            {LETTERS.slice(0, aisleIndex).map((l) => (
              <div key={l} className="w-9 text-center font-semibold" style={{ color: VAR.subtle }}>
                {l}
              </div>
            ))}
            <div className="w-6" />
            {LETTERS.slice(aisleIndex).map((l) => (
              <div key={l} className="w-9 text-center font-semibold" style={{ color: VAR.subtle }}>
                {l}
              </div>
            ))}
          </div>

          {/* Rows */}
          {ROWS.map((row) => (
            <div key={row} className="flex items-center justify-center gap-2 py-1">
              <div className="w-7 pr-1 text-right text-[10px] font-semibold" style={{ color: VAR.subtle }}>
                {row}
              </div>

              {LETTERS.slice(0, aisleIndex).map((letter) => {
                const id = `${row}${letter}`;
                return <Seat key={id} id={id} row={row} />;
              })}

              <div className="w-6" />

              {LETTERS.slice(aisleIndex).map((letter) => {
                const id = `${row}${letter}`;
                return <Seat key={id} id={id} row={row} />;
              })}

              <div className="w-7 pl-1 text-[10px] font-semibold" style={{ color: VAR.subtle }}>
                {row}
              </div>
            </div>
          ))}
        </div>

        {/* Selected seats chips */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(selectedSeats || []).length ? (
              selectedSeats.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSeat(s)}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{ background: VAR.primarySoft, color: VAR.text, border: `1px solid ${VAR.border}` }}
                  title="Click to remove"
                >
                  {s} ✕
                </button>
              ))
            ) : (
              <span className="text-[11px]" style={{ color: VAR.subtle }}>
                No seats selected
              </span>
            )}
          </div>

          <div className="text-right">
            <div className="text-[11px]" style={{ color: VAR.subtle }}>
              Seat charges
            </div>
            <div className="text-base font-extrabold" style={{ color: VAR.text }}>
              {fmtINR(seatTotal)}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]" style={{ color: VAR.muted }}>
          <LegendDot label="Available" bg={VAR.surface} border={VAR.border} />
          <LegendDot label="Selected" bg={VAR.primary} border={VAR.primary} />
          <LegendDot label="Booked / Blocked" bg={"rgba(15,23,42,0.10)"} border={"rgba(15,23,42,0.12)"} />
          <LegendDot label="Extra legroom" bg={VAR.surface} border={VAR.warn} ring={VAR.warnSoft} />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ label, bg, border, ring }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-3.5 w-3.5 rounded-[6px]"
        style={{
          background: bg,
          border: `1px solid ${border}`,
          boxShadow: ring ? `0 0 0 3px ${ring}` : undefined,
        }}
      />
      <span>{label}</span>
    </div>
  );
}
