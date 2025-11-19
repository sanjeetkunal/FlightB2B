// src/components/flightlist/SeatMap.jsx
import React from "react";

const SEAT_PRICE = 250; // per seat INR

// Simple 3-3 layout (A B C  aisle  D E F)
const ROWS = Array.from({ length: 18 }, (_, i) => i + 1);
const LETTERS = ["A", "B", "C", "D", "E", "F"];

// Example blocked / already-booked seats
const BLOCKED = new Set(["1C", "1D", "7B", "7C"]);
const BOOKED = new Set(["5A", "5B", "12F", "14E"]);

export default function SeatMap({ totalPax, selectedSeats, onChange }) {
  const handleToggle = (seatId) => {
    if (BLOCKED.has(seatId) || BOOKED.has(seatId)) return;

    const isSelected = selectedSeats.includes(seatId);

    if (isSelected) {
      onChange(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= totalPax) {
        alert(`You can select up to ${totalPax} seat(s) only.`);
        return;
      }
      onChange([...selectedSeats, seatId]);
    }
  };

  const renderSeat = (row, letter) => {
    const id = `${row}${letter}`;
    const isBlocked = BLOCKED.has(id);
    const isBooked = BOOKED.has(id);
    const isSelected = selectedSeats.includes(id);
    const isExtraLegroom = row <= 4; // front rows

    let className =
      "h-8 w-8 rounded-md border text-[11px] flex items-center justify-center transition";

    if (isBlocked || isBooked) {
      className +=
        " bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed";
    } else if (isSelected) {
      className +=
        " bg-blue-600 border-blue-600 text-white shadow-sm hover:bg-blue-700";
    } else {
      className +=
        " bg-white border-slate-300 text-slate-700 hover:border-blue-500 hover:bg-blue-50";
    }

    if (isExtraLegroom && !isSelected && !isBooked && !isBlocked) {
      className += " border-amber-400 ring-1 ring-amber-200";
    }

    return (
      <button
        key={id}
        type="button"
        onClick={() => handleToggle(id)}
        className={className}
      >
        {letter}
      </button>
    );
  };

  const seatTotal = selectedSeats.length * SEAT_PRICE;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Seat selection (optional)
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Choose preferred seats for each traveller.
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-500">
          <div>
            From <span className="font-semibold">₹{SEAT_PRICE}</span>/seat
          </div>
          <div className="mt-0.5 text-xs">
            Selected:{" "}
            <span className="font-semibold text-blue-600">
              {selectedSeats.length || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3 sm:px-5">
        {/* plane head */}
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-400">
          <span>Front of aircraft</span>
          <span>Exit rows 1–4</span>
        </div>

        {/* seats grid */}
        <div className="inline-flex flex-col rounded-2xl bg-slate-50 px-3 py-3">
          {/* header letters */}
          <div className="mb-1 flex items-center justify-center gap-2 text-[10px] text-slate-500">
            <div className="w-8 text-center">A</div>
            <div className="w-8 text-center">B</div>
            <div className="w-8 text-center">C</div>
            <div className="w-6" />
            <div className="w-8 text-center">D</div>
            <div className="w-8 text-center">E</div>
            <div className="w-8 text-center">F</div>
          </div>

          {ROWS.map((row) => (
            <div
              key={row}
              className="flex items-center justify-center gap-2 py-0.5"
            >
              <div className="w-6 pr-1 text-right text-[10px] text-slate-500">
                {row}
              </div>

              {LETTERS.slice(0, 3).map((l) => renderSeat(row, l))}

              <div className="w-6" />

              {LETTERS.slice(3).map((l) => renderSeat(row, l))}

              <div className="w-6 pl-1 text-[10px] text-slate-500">
                {row}
              </div>
            </div>
          ))}
        </div>

        {/* legend + amount */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-[4px] border border-slate-300 bg-white" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-[4px] bg-blue-600" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-[4px] bg-slate-300" />
              <span>Booked / Blocked</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-[4px] border border-amber-400 ring-1 ring-amber-200 bg-white" />
              <span>Extra legroom</span>
            </div>
          </div>

          <div className="text-right">
            <div>Seat charges</div>
            <div className="text-xs font-semibold text-slate-900">
              ₹{seatTotal.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
