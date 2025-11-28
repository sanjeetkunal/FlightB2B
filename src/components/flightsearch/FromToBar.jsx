// src/components/home/FromToBar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AIRPORTS } from "../../data/airports";
import AirportSelect from "../flightsearch/AirportSelect";
import DateField from "../flightsearch/DateField";
import TravellersField from "../flightsearch/TravellersField";
import TravellerClassPicker from "../flightsearch/TravellerClassPicker";

export default function FromToBar({ onSearch }) {
  const navigate = useNavigate();
  const [trip, setTrip] = useState("oneway"); // "oneway" | "round"

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

  // 🔔 Toast message (simple)
  const [errorMsg, setErrorMsg] = useState("");

  const total = tc.adults + tc.children + tc.infants;

  const travellersLabel = useMemo(
    () => `${total} Traveller${total > 1 ? "s" : ""}, ${tc.cabin}`,
    [total, tc.cabin]
  );

  const swap = () => {
    if (!fromAP || !toAP) return;
    const a = fromAP;
    setFromAP(toAP);
    setToAP(a);
  };

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(""), 3000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  // 🔹 LISTEN TO "Modify Search" EVENT FROM RESULTS PAGE
  useEffect(() => {
    /** @param {CustomEvent} e */
    const handler = (e) => {
      const d = e.detail || {};

      // trip type
      if (d.tripType) {
        setTrip(d.tripType === "ROUND" ? "round" : "oneway");
      }

      // from / to airports (codes se lookup)
      if (d.from) {
        const ap = AIRPORTS.find((a) => a.code === d.from) || null;
        if (ap) setFromAP(ap);
      }
      if (d.to) {
        const ap = AIRPORTS.find((a) => a.code === d.to) || null;
        if (ap) setToAP(ap);
      }

      // dates (oneway me sirf depart, round me ret bhi)
      if (d.date || d.depart) {
        setDepart(d.date || d.depart || "");
      }
      if (d.tripType === "ROUND" && d.return) {
        setRet(d.return || "");
      } else if (d.tripType === "ONEWAY") {
        // oneway modify pe return clear
        setRet("");
      }

      // travellers + cabin
      setTc((prev) => ({
        adults: typeof d.adt === "number" ? d.adt : prev.adults,
        children: typeof d.chd === "number" ? d.chd : prev.children,
        infants: typeof d.inf === "number" ? d.inf : prev.infants,
        cabin: d.cabin || prev.cabin,
      }));
    };

    window.addEventListener("open-fromtobar", handler);
    return () => window.removeEventListener("open-fromtobar", handler);
  }, []);

  // -------------------------------------------------------
  //  handleSearch – ab ek hi /flight-results page ke liye
  // -------------------------------------------------------
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

    const fromIata = fromAP.code.toUpperCase();
    const toIata = toAP.code.toUpperCase();

    const departISO = depart;
    const returnISO = ret;

    const adt = tc.adults;
    const chd = tc.children;
    const inf = tc.infants;
    const cabin = tc.cabin;

    // Optional callback
    onSearch &&
      onSearch({
        trip: tripType,
        from: { code: fromIata, city: fromAP.city },
        to: { code: toIata, city: toAP.city },
        depart: departISO,
        ret: tripType === "roundtrip" ? returnISO : "",
        adults: adt,
        children: chd,
        infants: inf,
        cabin,
      });

    // India vs International detection
    const INDIA_IATAS = [
      "DEL",
      "BOM",
      "BLR",
      "MAA",
      "HYD",
      "CCU",
      "AMD",
      "COK",
      "GOI",
      "PNQ",
      "GAU",
      "TRV",
    ];

    const isInternational =
      !INDIA_IATAS.includes(fromIata) || !INDIA_IATAS.includes(toIata);

    const sector = isInternational ? "intl" : "dom"; // ⬅️ new flag

    // ---------- COMMON QUERY PARAMS ----------
    const params = new URLSearchParams({
      trip: tripType, // "oneway" | "roundtrip"
      sector, // "dom" | "intl"
      from: fromIata,
      to: toIata,
      adt: String(adt),
      chd: String(chd),
      inf: String(inf),
      cabin,
    });

    if (tripType === "roundtrip") {
      params.set("depart", departISO);
      params.set("return", returnISO);
    } else {
      params.set("date", departISO);
    }

    // ---------- SINGLE RESULTS PAGE ----------
    navigate(`/flight-results?${params.toString()}`);
  };

  // ---------------- RENDER -------------------
  return (
    <div className="space-y-3 relative">
      {/* 🔔 Toast strip (top-right inside component) */}
      {errorMsg && (
        <div className="flex justify-end absolute top-0 right-0">
          <div className="mb-2 flex max-w-sm items-start gap-3 rounded-lg bg-red-400 px-4 py-2 text-sm text-white shadow">
            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              !
            </div>
            <div className="flex-1 font-medium">{errorMsg}</div>
            <button
              onClick={() => setErrorMsg("")}
              className="ml-2 text-xs text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Trip Type Toggle */}
      <div className="mb-3 flex gap-3">
        {["oneway", "round"].map((k) => (
          <button
            key={k}
            onClick={() => setTrip(k)}
            className={`cursor-pointer rounded-full border border-gray-400 px-4 py-2 text-sm font-medium ${
              trip === k ? "bg-black text-white border-black" : "bg-white"
            }`}
          >
            {k === "oneway" ? "One Way" : "Round Trip"}
          </button>
        ))}
      </div>

      {/* Fields row */}
      <div className="mt-6 grid grid-cols-1 items-center gap-3 md:grid-cols-[2fr_0.1fr_2fr_1.2fr_1.2fr_1.6fr_auto]">
        {/* FROM */}
        <AirportSelect label="From" value={fromAP} onChange={setFromAP} />

        {/* Divider + Swap */}
        <div className="relative hidden md:block">
          <div className="mx-auto h-8 w-px bg-gray-300" />
          <button
            onClick={swap}
            title="Swap"
            aria-label="Swap From and To"
            className="absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center
                       cursor-pointer rounded-full border border-gray-400 bg-white shadow hover:bg-gray-50"
          >
            ⇄
          </button>
        </div>

        {/* TO */}
        <AirportSelect label="To" value={toAP} onChange={setToAP} />

        {/* DATES */}
        <DateField label="Departure" value={depart} onChange={setDepart} />
        <DateField
          label="Return"
          value={ret}
          onChange={setRet}
          disabled={trip !== "round"}
        />

        {/* TRAVELLERS */}
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
            className="right-0"
          />
        </div>

        {/* SEARCH BTN */}
        <button
          onClick={handleSearch}
          className="flex h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-blue-500
                     text-white font-semibold hover:bg-amber-600 md:w-[80px]"
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
