import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AIRPORTS } from "../../data/airports";
import AirportSelect from "../flightsearch/AirportSelect";
import DateField from "../flightsearch/DateField";
import TravellersField from "../flightsearch/TravellersField";
import TravellerClassPicker from "../flightsearch/TravellerClassPicker";



/* ---------------- RECENT SEARCH HELPERS ---------------- */
const RECENT_KEY = "flight_recent_searches";

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (item) => {
  const prev = getRecentSearches();

  // remove exact duplicates
  const filtered = prev.filter(
    (x) =>
      !(
        x.from === item.from &&
        x.to === item.to &&
        x.dateLabel === item.dateLabel &&
        x.trip === item.trip
      )
  );

  const updated = [item, ...filtered].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
};

export default function FromToBar({ onSearch }) {
  const navigate = useNavigate();

  /* ---------------- STATES ---------------- */
  const [trip, setTrip] = useState("oneway"); // oneway | round
  const [sector, setSector] = useState("dom"); // dom | intl

  const [fromAP, setFromAP] = useState(
    AIRPORTS.find((a) => a.code === "DEL") || null
  );
  const [toAP, setToAP] = useState(
    AIRPORTS.find((a) => a.code === "BOM") || null
  );

  const [depart, setDepart] = useState("");
  const [ret, setRet] = useState("");

  const [tc, setTc] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    cabin: "Economy",
  });
  const [openTC, setOpenTC] = useState(false);

  const [specialFare, setSpecialFare] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [recentSearches, setRecentSearches] = useState([]);

  /* ---------------- CONSTANTS ---------------- */
  const INDIA_IATAS = [
    "DEL","BOM","BLR","MAA","HYD","CCU",
    "AMD","COK","GOI","PNQ","GAU","TRV",
  ];

  /* ---------------- DERIVED ---------------- */
  const total = tc.adults + tc.children + tc.infants;

  const travellersLabel = useMemo(
    () => `${total} Traveller${total > 1 ? "s" : ""}, ${tc.cabin}`,
    [total, tc.cabin]
  );

  /* ---------------- EFFECTS ---------------- */

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Detect sector + auto special fare
  useEffect(() => {
    if (!fromAP || !toAP) return;

    const isInternational =
      !INDIA_IATAS.includes(fromAP.code) ||
      !INDIA_IATAS.includes(toAP.code);

    if (isInternational) {
      setSector("intl");
      if (trip === "round") setSpecialFare(true);
    } else {
      setSector("dom");
      setSpecialFare(false);
    }
  }, [fromAP, toAP, trip]);

  // Reset on oneway
  useEffect(() => {
    if (trip !== "round") {
      setSpecialFare(false);
      setRet("");
    }
  }, [trip]);

  // Auto-hide error
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(""), 3000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  /* ---------------- ACTIONS ---------------- */
  const swap = () => {
    if (!fromAP || !toAP) return;
    setFromAP(toAP);
    setToAP(fromAP);
  };

  const handleSearch = () => {
    if (!fromAP || !toAP || !depart) {
      setErrorMsg("Please select From, To and Departure date");
      return;
    }

    if (trip === "round" && !ret) {
      setErrorMsg("Please select Return date");
      return;
    }

    if (fromAP.code === toAP.code) {
      setErrorMsg("From and To airports cannot be same");
      return;
    }

    const tripType = trip === "round" ? "roundtrip" : "oneway";

    const params = new URLSearchParams({
      trip: tripType,
      sector,
      from: fromAP.code,
      to: toAP.code,
      adt: String(tc.adults),
      chd: String(tc.children),
      inf: String(tc.infants),
      cabin: tc.cabin,
    });

    let dateLabel = "";

    if (tripType === "roundtrip") {
      params.set("depart", depart);
      params.set("return", ret);
      dateLabel = `${depart} → ${ret}`;

      if (sector === "intl" && specialFare) {
        params.set("fare", "special");
      }
    } else {
      params.set("date", depart);
      dateLabel = depart;
    }

    // SAVE RECENT SEARCH
    saveRecentSearch({
      from: fromAP.code,
      to: toAP.code,
      trip: tripType,
      sector,
      dateLabel,
      params: params.toString(),
      searchedAt: new Date().toISOString(),
    });

    setRecentSearches(getRecentSearches());

    onSearch?.({
      trip: tripType,
      from: fromAP,
      to: toAP,
      depart,
      ret,
      ...tc,
    });

    navigate(`/flight-results?${params.toString()}`);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="space-y-4 relative">
      {/* Error Toast */}
      {errorMsg && (
        <div className="absolute right-0 top-0 z-10">
          <div className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white shadow">
            {errorMsg}
          </div>
        </div>
      )}

      {/* Trip Type */}
      <div className="flex gap-3">
        {["oneway", "round"].map((k) => (
          <button
            key={k}
            onClick={() => setTrip(k)}
            className={`rounded-full border px-4 py-1 text-sm font-medium cursor-pointer ${
              trip === k
                ? "bg-black text-white border-black"
                : "bg-white border-gray-400"
            }`}
          >
            {k === "oneway" ? "One Way" : "Round Trip"}
          </button>
        ))}

        {trip === "round" && sector === "intl" && (
          <label className="ml-4 flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={specialFare}
              onChange={(e) => setSpecialFare(e.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Round-Trip Fares
          </label>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_0.1fr_2fr_1.2fr_1.2fr_1.6fr_auto]">
        <AirportSelect label="From" value={fromAP} onChange={setFromAP} />

        <div className="relative hidden md:block">
          <div className="mx-auto h-8 w-px bg-gray-300" />
          <button
            onClick={swap}
            className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-white shadow"
          >
            ⇄
          </button>
        </div>

        <AirportSelect label="To" value={toAP} onChange={setToAP} />
        <DateField label="Departure" value={depart} onChange={setDepart} />
        <DateField label="Return" value={ret} onChange={setRet} disabled={trip !== "round"} />

        <div className="relative">
          <TravellersField
            label="Travellers & Class"
            text={travellersLabel}
            onClick={() => setOpenTC((v) => !v)}
          />
          <TravellerClassPicker
            open={openTC}
            value={tc}
            onChange={setTc}
            onClose={() => setOpenTC(false)}
          />
        </div>

        <button
  onClick={handleSearch}
  aria-label="Search flights"
  title="Search"
  className="flex h-[56px] w-[56px] items-center justify-center rounded-xl
             bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    className="h-6 w-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35m1.1-5.4a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
    />
  </svg>
</button>

      </div>

   
    </div>
  );
}
