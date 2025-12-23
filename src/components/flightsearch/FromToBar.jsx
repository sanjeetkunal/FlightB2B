import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AIRPORTS } from "../../data/airports";
import AirportSelect from "../flightsearch/AirportSelect";
import DateField from "../flightsearch/DateField";
import TravellersField from "../flightsearch/TravellersField";
import TravellerClassPicker from "../flightsearch/TravellerClassPicker";

/* ---------------- RECENT SEARCH HELPERS ---------------- */
const RECENT_KEY = "flight_recent_searches";

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveRecentSearch = (item) => {
  const prev = getRecentSearches();
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
  const location = useLocation();

  /* ---------------- STATES ---------------- */
  const [trip, setTrip] = useState("oneway"); // oneway | round
  const [sector, setSector] = useState("dom"); // dom | intl

  const [fromAP, setFromAP] = useState(AIRPORTS.find((a) => a.code === "DEL") || null);
  const [toAP, setToAP] = useState(AIRPORTS.find((a) => a.code === "BOM") || null);

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
  const INDIA_IATAS = ["DEL","BOM","BLR","MAA","HYD","CCU","AMD","COK","GOI","PNQ","GAU","TRV"];

  /* ---------------- DERIVED ---------------- */
  const total = tc.adults + tc.children + tc.infants;

  const travellersLabel = useMemo(
    () => `${total} Traveller${total > 1 ? "s" : ""}, ${tc.cabin}`,
    [total, tc.cabin]
  );

  /* ---------------- EFFECTS ---------------- */

  // ✅ 1) Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // ✅ 2) HYDRATE STATE FROM URL (Modify Search binding fix)
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    if (![...qs.keys()].length) return;

    const tripParam = qs.get("trip"); // on results page: oneway | roundtrip
    const isRound = tripParam === "roundtrip";
    setTrip(isRound ? "round" : "oneway");

    const from = qs.get("from");
    const to = qs.get("to");
    const fromObj = from ? AIRPORTS.find((a) => a.code === from) : null;
    const toObj = to ? AIRPORTS.find((a) => a.code === to) : null;
    if (fromObj) setFromAP(fromObj);
    if (toObj) setToAP(toObj);

    // dates
    if (isRound) {
      const d = qs.get("depart") || "";
      const r = qs.get("return") || "";
      setDepart(d);
      setRet(r);
    } else {
      const d = qs.get("date") || "";
      setDepart(d);
      setRet("");
    }

    // pax + cabin
    const adt = Number(qs.get("adt") || "1");
    const chd = Number(qs.get("chd") || "0");
    const inf = Number(qs.get("inf") || "0");
    const cabin = qs.get("cabin") || "Economy";
    setTc((prev) => ({
      ...prev,
      adults: Number.isFinite(adt) ? adt : 1,
      children: Number.isFinite(chd) ? chd : 0,
      infants: Number.isFinite(inf) ? inf : 0,
      cabin,
    }));

    // sector (if present), else auto detect will handle below
    const sec = qs.get("sector"); // dom|intl (your code uses dom/intl)
    if (sec === "dom" || sec === "intl") setSector(sec);

    // special fare (intl roundtrip)
    const fare = qs.get("fare"); // "special"
    setSpecialFare(fare === "special");
  }, [location.search]);

  // Detect sector + auto special fare
  useEffect(() => {
    if (!fromAP || !toAP) return;

    const isInternational =
      !INDIA_IATAS.includes(fromAP.code) || !INDIA_IATAS.includes(toAP.code);

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

      if (sector === "intl" && specialFare) params.set("fare", "special");
    } else {
      params.set("date", depart);
      dateLabel = depart;
    }

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
    <div className="relative">
      {/* Error Toast */}
      {errorMsg && (
        <div className="absolute right-0 top-0 z-20">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 shadow">
            {errorMsg}
          </div>
        </div>
      )}

      {/* Trip Type */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {["oneway", "round"].map((k) => (
            <button
              key={k}
              onClick={() => setTrip(k)}
              className={[
                "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                trip === k
                  ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              {k === "oneway" ? "One Way" : "Round Trip"}
            </button>
          ))}
        </div>

        {trip === "round" && sector === "intl" && (
          <label className="ml-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
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

      {/* Fields wrapper (enterprise) */}
      <div className="mt-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 p-3 shadow-[0_10px_26px_rgba(2,6,23,0.08)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_0.12fr_2fr_1.2fr_1.2fr_1.6fr_auto]">
          <AirportSelect label="From" value={fromAP} onChange={setFromAP} />

          {/* Swap */}
          <div className="relative hidden md:block">
            <div className="mx-auto h-9 w-px bg-slate-200" />
            <button
              onClick={swap}
              type="button"
              className="
                absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                h-10 w-10 rounded-full border border-slate-200 bg-white
                shadow-sm hover:shadow-md hover:border-blue-200 transition
                text-slate-700
              "
              title="Swap"
            >
              ⇄
            </button>
          </div>

          <AirportSelect label="To" value={toAP} onChange={setToAP} />

          <DateField label="Departure" value={depart} onChange={setDepart} offsetDays={0} />

          <DateField
            label="Return"
            value={ret}
            onChange={setRet}
            disabled={trip !== "round"}
            offsetDays={1}
          />

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

          {/* Search button */}
          <button
            onClick={handleSearch}
            aria-label="Search flights"
            title="Search"
            className="
              flex h-[56px] w-[56px] items-center justify-center rounded-2xl
              bg-gradient-to-br from-blue-600 to-indigo-600 text-white
              shadow-[0_10px_20px_rgba(37,99,235,0.25)]
              hover:from-blue-700 hover:to-indigo-700 transition
            "
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
    </div>
  );
}
