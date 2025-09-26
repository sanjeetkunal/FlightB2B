import { useState } from "react";
import AirportSelect from "./AirportSelect";
import { AIRPORTS } from "../data/airports";

export default function FromToSearch() {
  const [fromAP, setFromAP] = useState(AIRPORTS.find(a => a.code === "DEL") || null);
  const [toAP, setToAP] = useState(AIRPORTS.find(a => a.code === "HYD") || null);

  const swap = () => { const a = fromAP; setFromAP(toAP); setToAP(a); };

  return (
    <div className="relative grid grid-cols-[1fr_1px_1fr] gap-0 items-center">
      {/* FROM */}
      <div className="pr-2">
        <AirportSelect label="From" value={fromAP} onChange={setFromAP} onFocusSide={() => {}} />
      </div>

      {/* Divider */}
      <div className="justify-self-center w-px h-10 bg-gray-300 relative" />

      {/* TO */}
      <div className="pl-2">
        <AirportSelect label="To" value={toAP} onChange={setToAP} onFocusSide={() => {}} />
      </div>

      {/* Center swap button overlapping divider */}
      <button
        type="button"
        onClick={swap}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[18px]
                   w-8 h-8 rounded-full bg-white border shadow grid place-items-center"
        aria-label="Swap"
        title="Swap"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M7 7h11l-2.2-2.2 1.2-1.2L23 7l-5 3.4-1.2-1.2L18 8H7V7Zm10 10H6l2.2 2.2-1.2 1.2L1 17l5-3.4 1.2 1.2L6 16h11v1Z"/>
        </svg>
      </button>
    </div>
  );
}
