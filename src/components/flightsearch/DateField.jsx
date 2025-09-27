import { useMemo, useRef, useState } from "react";
import FieldShell from "../flightsearch/FieldShell";
import MultiMonthDatePicker from "../flightsearch/MultiMonthDatePicker";

export default function DateField({ label, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const valDate = value ? new Date(value) : null;

  const fmt = useMemo(
    () => new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short", year: "numeric" }),
    []
  );

  const display = valDate ? fmt.format(valDate) : "Select date";

  const handlePick = (d) => {
    // parent state string me hai, ISO YYYY-MM-DD me bhejenge
    const y = d.getFullYear();
    const m = `${d.getMonth()+1}`.padStart(2,"0");
    const day = `${d.getDate()}`.padStart(2,"0");
    onChange(`${y}-${m}-${day}`);
  };

  return (
    <div className="relative">
      <FieldShell label={label}>
        <button
          type="button"
          onClick={() => !disabled && setOpen(v=>!v)}
          className={`w-full text-left bg-transparent text-[16px] font-semibold outline-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {display}
        </button>
        <span className="ml-2">📅</span>
      </FieldShell>

      {/* Multi-month calendar popover */}
      <MultiMonthDatePicker
        open={open && !disabled}
        value={valDate}
        onChange={handlePick}
        onClose={() => setOpen(false)}
        months={2}                 // 👈 change to 3 if you want 3 months
        minDate={new Date()}       // optional: block past dates
        className="right-0 z-30"
      />
    </div>
  );
}
