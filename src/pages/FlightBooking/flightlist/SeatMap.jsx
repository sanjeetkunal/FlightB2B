import React, { useMemo, useState, useCallback, useEffect } from "react";

/** ================== Theme Vars ================== */
const VAR = {
  surface: "var(--surface, rgba(255,255,255,0.92))",
  surface2: "var(--surface2, rgba(248,250,252,0.92))",
  border: "var(--border, rgba(15,23,42,0.12))",
  text: "var(--text, rgba(15,23,42,0.92))",
  muted: "var(--muted, rgba(71,85,105,0.9))",
  subtle: "var(--subtle, rgba(100,116,139,0.85))",
  primary: "var(--primary, rgb(37,99,235))",
  primarySoft: "var(--primarySoft, rgba(37,99,235,0.14))",
  success: "var(--success, rgb(34,197,94))",
  successSoft: "var(--successSoft, rgba(34,197,94,0.12))",
  warn: "var(--warn, rgb(245,158,11))",
  warnSoft: "var(--warnSoft, rgba(245,158,11,0.14))",
  danger: "var(--danger, rgb(244,63,94))",
};

const nfIN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const fmtINR = (v) => `₹${nfIN.format(Number.isFinite(v) ? v : 0)}`;

function isObj(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function toSet(v) {
  if (v instanceof Set) return v;
  return new Set(Array.isArray(v) ? v : []);
}

function sumLen(seatsByLeg) {
  if (!isObj(seatsByLeg)) return 0;
  return Object.values(seatsByLeg).reduce((a, arr) => a + (Array.isArray(arr) ? arr.length : 0), 0);
}

/**
 * ✅ Supports:
 * - ONEWAY: selectedSeats = ["1A","1B"] (array)
 * - ROUNDTRIP: selectedSeats = { onward: ["1A"], return: ["2B"] } (object)
 *
 * ✅ For roundtrip, pass `legs`:
 * legs = [
 *  { key:"onward", label:"Onward", meta:"DEL → BOM • 12 Jan", blockedSeats:[], bookedSeats:[], extraLegroomRows:[1,2], seatPrice:250 },
 *  { key:"return", label:"Return", meta:"BOM → DEL • 15 Jan", blockedSeats:[], bookedSeats:[], extraLegroomRows:[1,2], seatPrice:250 },
 * ]
 */
export default function SeatMap({
  // used as seat-limit per leg (ADT+CHD)
  totalPax = 1,

  // oneway => array, roundtrip => object { onward:[], return:[] }
  selectedSeats = [],
  onChange = () => {},

  seatPrice = 250,
  rows = 18,
  letters = ["A", "B", "C", "D", "E", "F"],

  blockedSeats = ["1C", "1D", "7B", "7C"],
  bookedSeats = ["5A", "5B", "12F", "14E"],
  extraLegroomRows = [1, 2, 3, 4],

  // ✅ Roundtrip support
  legs = null,
}) {
  const [warn, setWarn] = useState("");
  const [hovered, setHovered] = useState("");

  // ✅ Normalize legs: if not provided => single leg "oneway"
  const LEG_LIST = useMemo(() => {
    if (Array.isArray(legs) && legs.length) {
      return legs.map((l, idx) => ({
        key: l?.key || (idx === 0 ? "onward" : `leg${idx + 1}`),
        label: l?.label || (idx === 0 ? "Onward" : `Leg ${idx + 1}`),
        meta: l?.meta || "",
        blockedSeats: l?.blockedSeats ?? blockedSeats,
        bookedSeats: l?.bookedSeats ?? bookedSeats,
        extraLegroomRows: l?.extraLegroomRows ?? extraLegroomRows,
        seatPrice: Number.isFinite(Number(l?.seatPrice)) ? Number(l?.seatPrice) : Number(seatPrice) || 0,
      }));
    }

    return [
      {
        key: "oneway",
        label: "Seat Map",
        meta: "",
        blockedSeats,
        bookedSeats,
        extraLegroomRows,
        seatPrice: Number(seatPrice) || 0,
      },
    ];
  }, [legs, blockedSeats, bookedSeats, extraLegroomRows, seatPrice]);

  const isMultiLeg = LEG_LIST.length > 1;

  const [activeLegKey, setActiveLegKey] = useState(LEG_LIST[0]?.key || "oneway");
  useEffect(() => {
    // if legs change, ensure active key exists
    const exists = LEG_LIST.some((l) => l.key === activeLegKey);
    if (!exists) setActiveLegKey(LEG_LIST[0]?.key || "oneway");
  }, [LEG_LIST, activeLegKey]);

  const activeLeg = useMemo(() => LEG_LIST.find((l) => l.key === activeLegKey) || LEG_LIST[0], [LEG_LIST, activeLegKey]);

  const BLOCKED = useMemo(() => toSet(activeLeg?.blockedSeats), [activeLeg]);
  const BOOKED = useMemo(() => toSet(activeLeg?.bookedSeats), [activeLeg]);

  const ROWS = useMemo(() => Array.from({ length: Math.max(1, rows) }, (_, i) => i + 1), [rows]);
  const LETTERS = useMemo(() => (Array.isArray(letters) && letters.length ? letters : ["A", "B", "C", "D", "E", "F"]), [letters]);

  const aisleIndex = 3; // 3-3 layout

  // ✅ selection getter/setter: array (oneway) OR object (multi-leg)
  const getSeatsForLeg = useCallback(
    (legKey) => {
      if (Array.isArray(selectedSeats)) return selectedSeats; // oneway mode
      if (isObj(selectedSeats)) return Array.isArray(selectedSeats[legKey]) ? selectedSeats[legKey] : [];
      return [];
    },
    [selectedSeats]
  );

  const setSeatsForLeg = useCallback(
    (legKey, nextArr) => {
      if (!isMultiLeg) {
        onChange(nextArr);
        return;
      }
      const prevObj = isObj(selectedSeats) ? selectedSeats : {};
      onChange({ ...prevObj, [legKey]: nextArr });
    },
    [isMultiLeg, onChange, selectedSeats]
  );

  const activeSelectedSeats = useMemo(() => getSeatsForLeg(activeLegKey), [getSeatsForLeg, activeLegKey]);

  // ✅ totals: per active leg + combined
  const activeSeatTotal = useMemo(
    () => (Array.isArray(activeSelectedSeats) ? activeSelectedSeats.length : 0) * (Number(activeLeg?.seatPrice) || 0),
    [activeSelectedSeats, activeLeg]
  );

  const combinedSelectedCount = useMemo(() => {
    if (!isMultiLeg) return Array.isArray(selectedSeats) ? selectedSeats.length : 0;
    return sumLen(selectedSeats);
  }, [selectedSeats, isMultiLeg]);

  const combinedSeatTotal = useMemo(() => {
    if (!isMultiLeg) return activeSeatTotal;
    // if per-leg seatPrice differs, calculate per leg
    const obj = isObj(selectedSeats) ? selectedSeats : {};
    return LEG_LIST.reduce((acc, leg) => {
      const count = Array.isArray(obj[leg.key]) ? obj[leg.key].length : 0;
      const price = Number(leg.seatPrice) || 0;
      return acc + count * price;
    }, 0);
  }, [isMultiLeg, selectedSeats, LEG_LIST, activeSeatTotal]);

  const canSelectMore = useMemo(() => {
    const count = Array.isArray(activeSelectedSeats) ? activeSelectedSeats.length : 0;
    return count < (Number(totalPax) || 0);
  }, [activeSelectedSeats, totalPax]);

  const toggleSeat = useCallback(
    (seatId) => {
      setWarn("");

      if (BLOCKED.has(seatId) || BOOKED.has(seatId)) return;

      const current = Array.isArray(activeSelectedSeats) ? activeSelectedSeats : [];
      const isSelected = current.includes(seatId);

      if (isSelected) {
        setSeatsForLeg(activeLegKey, current.filter((s) => s !== seatId));
        return;
      }

      if (!canSelectMore) {
        setWarn(`You can select up to ${totalPax} seat(s) only for ${activeLeg?.label || "this leg"}.`);
        return;
      }

      setSeatsForLeg(activeLegKey, [...current, seatId]);
    },
    [BLOCKED, BOOKED, activeSelectedSeats, setSeatsForLeg, canSelectMore, totalPax, activeLegKey, activeLeg]
  );

  const seatState = useCallback(
    (id, row) => {
      const isBlocked = BLOCKED.has(id);
      const isBooked = BOOKED.has(id);
      const isSelected = (activeSelectedSeats || []).includes(id);
      const isExtra = (activeLeg?.extraLegroomRows || []).includes(row);
      const isHovered = hovered === id;
      return { isBlocked, isBooked, isSelected, isExtra, isHovered };
    },
    [BLOCKED, BOOKED, activeSelectedSeats, activeLeg, hovered]
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
      background: "var(--seatBlockedBg, rgba(15,23,42,0.08))",
      color: "var(--seatBlockedText, rgba(15,23,42,0.35))",
      border: `1px solid var(--seatBlockedBorder, rgba(15,23,42,0.10))`,
      cursor: "not-allowed",
    };

    const selectedStyle = {
      background: VAR.primary,
      color: "var(--onPrimary, #fff)",
      border: `1px solid ${VAR.primary}`,
      boxShadow: "0 10px 24px rgba(2,6,23,0.10)", // shadow ok, not a “color token” issue
    };

    const hoverStyle = {
      background: VAR.primarySoft,
      color: VAR.text,
      border: `1px solid rgba(15,23,42,0.18)`,
    };

    const extraStyle =
      st.isExtra && !st.isSelected && !disabled
        ? { border: `1px solid ${VAR.warn}`, boxShadow: `0 0 0 3px ${VAR.warnSoft}` }
        : null;

    const style = disabled ? blockedStyle : st.isSelected ? selectedStyle : st.isHovered ? hoverStyle : base;

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
        className="h-9 w-9 rounded-md text-[10px] font-extrabold transition"
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
    <div className="rounded-md shadow-sm" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
      {/* Header */}
      <div className="px-4 py-3 sm:px-5" style={{ borderBottom: `1px solid ${VAR.border}` }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold" style={{ color: VAR.text }}>
              Seat selection (optional)
            </div>

            <div className="mt-0.5 text-[11px]" style={{ color: VAR.subtle }}>
              Select seats for each traveller. You can select up to <b>{totalPax}</b> seat(s) per leg.
            </div>

            {warn ? (
              <div
                className="mt-2 rounded-md px-3 py-2 text-[11px] font-semibold"
                style={{
                  background: "var(--dangerSoft, rgba(244,63,94,0.10))",
                  color: VAR.danger,
                  border: "1px solid var(--dangerBorder, rgba(244,63,94,0.18))",
                }}
              >
                {warn}
              </div>
            ) : null}
          </div>

          <div className="text-right">
            <div className="text-[11px]" style={{ color: VAR.subtle }}>
              From{" "}
              <span className="font-semibold" style={{ color: VAR.text }}>
                {fmtINR(activeLeg?.seatPrice || 0)}
              </span>
              /seat
            </div>

            <div className="mt-1 text-[11px]" style={{ color: VAR.subtle }}>
              Selected (this leg):{" "}
              <span className="font-extrabold" style={{ color: VAR.primary }}>
                {activeSelectedSeats?.length || 0}
              </span>
              /{totalPax}
            </div>

            {isMultiLeg ? (
              <div className="mt-1 text-[11px]" style={{ color: VAR.subtle }}>
                Selected (total):{" "}
                <span className="font-extrabold" style={{ color: VAR.text }}>
                  {combinedSelectedCount}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* ✅ Tabs for roundtrip/multi-leg */}
        {isMultiLeg ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {LEG_LIST.map((l) => {
              const active = l.key === activeLegKey;
              return (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => {
                    setWarn("");
                    setHovered("");
                    setActiveLegKey(l.key);
                  }}
                  className="rounded-full px-3 py-1.5 text-[11px] font-semibold"
                  style={{
                    border: `1px solid ${VAR.border}`,
                    background: active ? VAR.primarySoft : VAR.surface2,
                    color: active ? VAR.text : VAR.muted,
                  }}
                >
                  <span className="font-extrabold">{l.label}</span>
                  {l.meta ? <span className="ml-2" style={{ color: VAR.subtle }}>{l.meta}</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div className="px-4 pb-4 pt-3 sm:px-5">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide">
          <span style={{ color: VAR.subtle }}>Front of aircraft</span>
          <span style={{ color: VAR.subtle }}>Extra legroom rows: {(activeLeg?.extraLegroomRows || []).join(", ")}</span>
        </div>

        {/* Seat grid wrapper */}
        <div className="inline-flex flex-col rounded-md px-3 py-3" style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}>
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

        {/* Selected seats chips (active leg) */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(activeSelectedSeats || []).length ? (
              activeSelectedSeats.map((s) => (
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
                No seats selected for {activeLeg?.label}
              </span>
            )}
          </div>

          <div className="text-right">
            <div className="text-[11px]" style={{ color: VAR.subtle }}>
              Seat charges {isMultiLeg ? `(this leg)` : ""}
            </div>
            <div className="text-base font-extrabold" style={{ color: VAR.text }}>
              {fmtINR(activeSeatTotal)}
            </div>

            {isMultiLeg ? (
              <div className="mt-1 text-[11px]" style={{ color: VAR.subtle }}>
                Total seat charges (all legs):{" "}
                <span className="font-extrabold" style={{ color: VAR.text }}>
                  {fmtINR(combinedSeatTotal)}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]" style={{ color: VAR.muted }}>
          <LegendDot label="Available" bg={VAR.surface} border={VAR.border} />
          <LegendDot label="Selected" bg={VAR.primary} border={VAR.primary} />
          <LegendDot label="Booked / Blocked" bg={"var(--seatBlockedBg, rgba(15,23,42,0.10))"} border={"var(--seatBlockedBorder, rgba(15,23,42,0.12))"} />
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
