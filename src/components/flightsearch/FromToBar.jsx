import { useMemo, useState } from "react";
import { AIRPORTS } from "../../data/airports";
import AirportSelect from "../flightsearch/AirportSelect";
import DateField from "../flightsearch/DateField";
import TravellersField from "../flightsearch/TravellersField";
import TravellerClassPicker from "../flightsearch/TravellerClassPicker"; // 👈 import add kiya



export default function FromToBar({ onSearch }) {
  const [trip, setTrip] = useState("oneway");

  const [fromAP, setFromAP] = useState(AIRPORTS.find(a => a.code === "CCU") || null);
  const [toAP, setToAP]     = useState(AIRPORTS.find(a => a.code === "MAA") || null);

  const [depart, setDepart] = useState("");
  const [ret, setRet] = useState("");

  const [tc, setTc] = useState({ adults:1, children:0, infants:0, cabin:"Economy" });
  const [openTC, setOpenTC] = useState(false);

  const total = tc.adults + tc.children + tc.infants;
  const travellersLabel = useMemo(
    () => `${total} Traveller${total>1?"s":""}, ${tc.cabin}`,
    [total, tc.cabin]
  );

  const swap = () => { const a = fromAP; setFromAP(toAP); setToAP(a); };

  const handleSearch = () => {
    const payload = {
      trip,
      from: fromAP ? { code: fromAP.code, city: fromAP.city } : null,
      to: toAP ? { code: toAP.code, city: toAP.city } : null,
      depart,
      ret: trip === "round" ? ret : "",
      ...tc,
    };
    onSearch?.(payload);
  };

  return (
    <div className="space-y-3">
      {/* Trip toggle */}
      <div className="flex gap-3 mb-3">
        {["oneway","round"].map(k => (
          <button
            key={k}
            onClick={()=>setTrip(k)}
            className={`px-4 py-2 rounded-full border border-gray-400 text-sm font-medium cursor-pointer ${
              trip===k ? "bg-black text-white border-black" : "bg-white"
            }`}
          >
            {k==="oneway"?"One Way":"Round Trip"}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_0.1fr_2fr_1.2fr_1.2fr_1.6fr_auto] gap-3 items-center mt-6">

        {/* FROM */}
        <AirportSelect label="From" value={fromAP} onChange={setFromAP} />

        {/* Divider + Swap */}
        <div className="relative hidden md:block">
          <div className="w-px h-8 bg-gray-300 mx-auto" />
          <button
            onClick={swap}
            title="Swap"
            aria-label="Swap From and To"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       w-8 h-8 rounded-full bg-white border border-gray-400 shadow grid place-items-center hover:bg-gray-50 cursor-pointer"
          >⇄</button>
        </div>

        {/* TO */}
        <AirportSelect label="To" value={toAP} onChange={setToAP} />

        {/* DATES */}
        <DateField label="Departure" value={depart} onChange={setDepart} />
        <DateField label="Return" value={ret} onChange={setRet} disabled={trip !== "round"} />

        {/* TRAVELLERS */}
        <div className="relative">
          <TravellersField
            label="Travellers & Class"
            text={travellersLabel}
            onClick={() => setOpenTC(v=>!v)}
          />
          <TravellerClassPicker
            open={openTC}
            value={tc}
            onChange={setTc}
            onClose={() => setOpenTC(false)}
            className="right-0"
          />
        </div>

        {/* SEARCH */}
        <button
          // onClick={handleSearch}  
         onClick={() => navigate(`/flights/`)}
          className="w-full md:w-[80px] h-[56px] rounded-xl bg-blue-900 hover:bg-amber-600
                     text-white font-semibold flex items-center justify-center gap-2"
        >
          <span className="text-xl leading-none">›</span>
        </button>
      </div>
    </div>
  );
}
