// src/pages/PassengerDetailsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import SeatMap from "./flightlist/SeatMap";

const currencySymbol = "₹";
const SEAT_PRICE = 250;

const SS_KEY = "BOOKING_CTX_V1";
const PAYLOAD_KEY = "BOOKING_PAYLOAD_V1";

/** Optional: if your search page stores pax somewhere */
const FALLBACK_SEARCH_KEYS = ["FLIGHT_SEARCH_CTX_V1", "SEARCH_CTX_V1", "SEARCH_CTX", "FLIGHT_SEARCH_CTX"];

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isIndianPhone10(v) {
  return /^[6-9]\d{9}$/.test(v);
}

const nfIN = (n) => Number(n || 0).toLocaleString("en-IN");
const moneyIN = (n) => `${currencySymbol}${nfIN(Number(n || 0))}`;

function sum(arr) {
  return (arr || []).reduce((a, b) => a + Number(b || 0), 0);
}

/** ===================== THEME VARS (no hard colors needed) ===================== */
const VAR = {
  surface: "var(--surface, rgba(255,255,255,0.92))",
  surface2: "var(--surface2, rgba(248,250,252,0.92))",
  border: "var(--border, rgba(15,23,42,0.12))",
  text: "var(--text, rgba(15,23,42,0.92))",
  muted: "var(--muted, rgba(71,85,105,0.9))",
  subtle: "var(--subtle, rgba(100,116,139,0.85))",
  primary: "var(--primary, rgb(37,99,235))",
  primarySoft: "var(--primarySoft, rgba(37,99,235,0.14))",
  accentSoft: "var(--accentSoft, rgba(16,182,217,0.12))",
  success: "var(--success, rgb(34,197,94))",
  danger: "var(--danger, rgb(244,63,94))",
};

function Pill({ children, tone = "default" }) {
  const style =
    tone === "ok"
      ? { background: "var(--successSoft, rgba(34,197,94,0.12))", border: `1px solid ${VAR.border}`, color: VAR.text }
      : tone === "warn"
      ? { background: "var(--warnSoft, rgba(245,158,11,0.12))", border: `1px solid ${VAR.border}`, color: VAR.text }
      : { background: VAR.surface2, border: `1px solid ${VAR.border}`, color: VAR.muted };

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide"
      style={style}
    >
      {children}
    </span>
  );
}

function SectionCard({ title, subtitle, right, children }) {
  return (
    <div className="rounded-md shadow-sm" style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}>
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3" style={{ borderColor: VAR.border }}>
        <div>
          <div className="text-sm font-semibold" style={{ color: VAR.text }}>
            {title}
          </div>
          {subtitle ? (
            <div className="mt-0.5 text-[11px]" style={{ color: VAR.subtle }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function KeyVal({ k, v, bold = false, tone }) {
  const valStyle = bold ? { color: VAR.text, fontWeight: 700 } : { color: VAR.text };
  const toneStyle = tone === "primary" ? { color: VAR.primary, fontWeight: 800 } : tone === "muted" ? { color: VAR.muted } : valStyle;

  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <div style={{ color: VAR.muted }}>{k}</div>
      <div style={toneStyle}>{v}</div>
    </div>
  );
}

function Collapse({ titleLeft, titleRight, open, onToggle, children }) {
  return (
    <div className="rounded-md" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
        style={{ borderBottom: open ? `1px dashed ${VAR.border}` : "none" }}
      >
        <div className="min-w-0">
          <div className="text-xs font-semibold" style={{ color: VAR.text }}>
            {titleLeft}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold" style={{ color: VAR.text }}>
            {titleRight}
          </div>
          <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: VAR.muted }}>
            <path d="M7 10l5 5 5-5" fill="currentColor" />
          </svg>
        </div>
      </button>
      {open ? <div className="px-3 py-3">{children}</div> : null}
    </div>
  );
}

/** ===================== ✅ PAX NORMALIZER (IMPORTANT) ===================== */
function toInt(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.floor(v));
}
function normalizePax(input, fallback) {
  const src = input ?? fallback ?? { adults: 1, children: 0, infants: 0 };
  const pax = { adults: toInt(src.adults), children: toInt(src.children), infants: toInt(src.infants) };
  if (pax.adults + pax.children + pax.infants <= 0) return { adults: 1, children: 0, infants: 0 };
  return pax;
}

/** ✅ Try extract pax from multiple possible shapes/keys */
function extractPaxFromAny(obj) {
  if (!obj) return null;

  // direct shape
  if (obj.adults != null || obj.children != null || obj.infants != null) {
    return { adults: obj.adults, children: obj.children, infants: obj.infants };
  }

  // common variants
  const candidates = [
    obj.paxConfig,
    obj.pax,
    obj.travellers,
    obj.travelers,
    obj.passengers,
    obj.search?.paxConfig,
    obj.search?.pax,
    obj.search?.travellers,
    obj.searchParams?.paxConfig,
    obj.searchParams?.pax,
    obj.searchParams?.travellers,
    obj.searchPayload?.paxConfig,
    obj.searchPayload?.pax,
    obj.searchPayload?.travellers,
    obj.pricing?.pax,
  ].filter(Boolean);

  for (const c of candidates) {
    if (c?.adults != null || c?.children != null || c?.infants != null) {
      return { adults: c.adults, children: c.children, infants: c.infants };
    }
  }

  // sometimes stored as counts
  if (obj.adultCount != null || obj.childCount != null || obj.infantCount != null) {
    return { adults: obj.adultCount, children: obj.childCount, infants: obj.infantCount };
  }

  return null;
}

function readFallbackSearchPax() {
  for (const k of FALLBACK_SEARCH_KEYS) {
    const raw = sessionStorage.getItem(k);
    const parsed = raw ? safeParse(raw) : null;
    const pax = extractPaxFromAny(parsed);
    if (pax) return pax;
  }
  return null;
}

function paxFromQuery(searchParams) {
  const a = searchParams.get("adults");
  const c = searchParams.get("children");
  const i = searchParams.get("infants");
  if (a == null && c == null && i == null) return null;
  return { adults: a, children: c, infants: i };
}

/** ===================== Fare Helpers ===================== */
function buildPaxBreakup(pricing, paxConfig) {
  const pax = paxConfig || pricing?.pax || { adults: 1, children: 0, infants: 0 };
  const per = Number(pricing?.perTraveller || 0);
  const totalFare = Number(pricing?.totalFare || 0);

  const fromApi = pricing?.paxFareBreakup || pricing?.paxBreakup || null;
  if (fromApi && (fromApi.ADT || fromApi.CHD || fromApi.INF)) {
    const mk = (x) => ({
      base: Number(x?.base || 0),
      fuel: Number(x?.fuel || 0),
      tax: Number(x?.tax || 0),
      total: Number(x?.total || 0),
    });
    return { pax, ADT: mk(fromApi.ADT), CHD: mk(fromApi.CHD), INF: mk(fromApi.INF) };
  }

  const infantPer = Number(pricing?.infantPerTraveller ?? pricing?.infantFare ?? 0);

  // perTraveller is per pax total (for RT too)
  const adtTotal = per || (pax.adults ? totalFare / Math.max(1, pax.adults + pax.children + pax.infants) : 0);
  const chdTotal = per || adtTotal;
  const infTotal = infantPer;

  const split = (t) => {
    const total = Number(t || 0);
    const fuel = Math.round(total * 0.0);
    const tax = Math.round(total * 0.18);
    const base = Math.max(0, total - fuel - tax);
    return { base, fuel, tax, total };
  };

  return { pax, ADT: split(adtTotal), CHD: split(chdTotal), INF: split(infTotal) };
}

/** ✅ Roundtrip agent compute: accepts fares array */
function computeAgentFigures({ grossTotal, pricing, fares = [], paxConfig }) {
  const totalPax =
    (paxConfig?.adults || 0) + (paxConfig?.children || 0) + (paxConfig?.infants || 0) ||
    (pricing?.pax?.adults || 0) + (pricing?.pax?.children || 0) + (pricing?.pax?.infants || 0) ||
    1;

  const apiAgent = pricing?.agent || null;

  const fromPricingCommission = Number(apiAgent?.commissionTotal ?? pricing?.commissionTotal ?? pricing?.commissionINR ?? 0) || 0;
  const fromFareCommission = fares.reduce((acc, f) => acc + Number(f?.commissionINR || 0), 0) * totalPax;

  const commissionTotal = fromPricingCommission > 0 ? fromPricingCommission : fromFareCommission;

  const tdsRate = Number(apiAgent?.tdsRate ?? pricing?.tdsRate ?? 5);
  const tdsTotal = Number(apiAgent?.tdsTotal ?? pricing?.tdsTotal ?? Math.round((commissionTotal * tdsRate) / 100));

  const netFare = Number(apiAgent?.netFare ?? Math.max(0, Number(grossTotal || 0) - commissionTotal));
  const netPayable = Number(apiAgent?.netPayable ?? Math.max(0, netFare + tdsTotal));

  return { commissionTotal, tdsRate, tdsTotal, netFare, netPayable };
}

/** ===================== PAGE ===================== */
export default function PassengerDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const incomingState = location.state || null;

  const restored = useMemo(() => {
    const raw = sessionStorage.getItem(SS_KEY);
    return raw ? safeParse(raw) : null;
  }, []);

  const [draftCtx, setDraftCtx] = useState(null);
  useEffect(() => {
    const draftId = searchParams.get("draft");
    if (!draftId) return;

    const raw = sessionStorage.getItem(`BOOKING_DRAFT:${draftId}`);
    const d = raw ? safeParse(raw) : null;
    if (d) {
      setDraftCtx(d);
      sessionStorage.setItem(SS_KEY, JSON.stringify(d));
    }
  }, [searchParams]);

  const ctx = incomingState ?? draftCtx ?? restored ?? null;

  useEffect(() => {
    if (incomingState) sessionStorage.setItem(SS_KEY, JSON.stringify(incomingState));
  }, [incomingState]);

  const tripType = (ctx?.tripType || ctx?.searchType || "ONEWAY").toUpperCase();

  // oneway
  const selectedFlight = ctx?.selectedFlight ?? null;
  const selectedFare = ctx?.selectedFare ?? ctx?.fare ?? null;

  // roundtrip
  const selectedFlightOnward = ctx?.selectedFlightOnward ?? ctx?.onwardFlight ?? null;
  const selectedFlightReturn = ctx?.selectedFlightReturn ?? ctx?.returnFlight ?? null;
  const selectedFareOnward = ctx?.selectedFareOnward ?? null;
  const selectedFareReturn = ctx?.selectedFareReturn ?? null;

  const pricing = ctx?.pricing ?? null;

  /**
   * ✅ FIX: pax resolve for ROUNDTRIP too (robust)
   * priority:
   * 1) ctx.paxConfig / ctx.pax / etc
   * 2) pricing.pax
   * 3) url query (adults/children/infants)
   * 4) fallback search ctx from sessionStorage (if present)
   */
 const paxConfig = useMemo(() => {
  const fromCtx = extractPaxFromAny(ctx);
  const fromPricing = extractPaxFromAny(pricing);
  const fromQuery = paxFromQuery(searchParams);
  const fromSearchStore = readFallbackSearchPax();

  // ✅ Priority: ctx > pricing > query > searchStore
  return normalizePax(fromCtx ?? fromPricing ?? fromQuery ?? fromSearchStore, null);
}, [ctx, pricing, searchParams]);


  // ✅ stricter requirements (ROUNDTRIP must have both legs + both fares)
  const hasRequired = useMemo(() => {
    if (!pricing) return false;

    if (tripType === "ROUNDTRIP") {
      return Boolean(selectedFlightOnward && selectedFlightReturn && selectedFareOnward && selectedFareReturn);
    }
    return Boolean(selectedFlight && selectedFare);
  }, [pricing, tripType, selectedFlight, selectedFare, selectedFlightOnward, selectedFlightReturn, selectedFareOnward, selectedFareReturn]);

  const passengers = useMemo(() => {
    const list = [];
    for (let i = 0; i < (paxConfig.adults || 0); i++) list.push({ id: `ADT-${i + 1}`, type: "Adult", label: `Adult ${i + 1}`, code: "ADT" });
    for (let i = 0; i < (paxConfig.children || 0); i++) list.push({ id: `CHD-${i + 1}`, type: "Child", label: `Child ${i + 1}`, code: "CHD" });
    for (let i = 0; i < (paxConfig.infants || 0); i++) list.push({ id: `INF-${i + 1}`, type: "Infant", label: `Infant ${i + 1}`, code: "INF" });
    return list;
  }, [paxConfig]);

  const totalPax = useMemo(() => paxConfig.adults + paxConfig.children + paxConfig.infants, [paxConfig]);

  const [contact, setContact] = useState({ email: "", phone: "" });
  const [paxDetails, setPaxDetails] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstDetails, setGstDetails] = useState({ gstin: "", company: "", address: "" });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    setPaxDetails((prev) => {
      const next = { ...prev };
      for (const p of passengers) {
        if (!next[p.id]) next[p.id] = { title: "MR", firstName: "", lastName: "", gender: "", dob: "" };
      }
      Object.keys(next).forEach((id) => {
        if (!passengers.find((p) => p.id === id)) delete next[id];
      });
      return next;
    });
  }, [passengers]);

  function handlePaxChange(paxId, field, value) {
    setPaxDetails((prev) => ({ ...prev, [paxId]: { ...(prev[paxId] || {}), [field]: value } }));
  }

  // totals
  const baseTotalFare = Number(pricing?.totalFare ?? 0);
  const seatTotal = selectedSeats.length * SEAT_PRICE;

  const gstAmount = gstEnabled ? Number(pricing?.gstAmount ?? pricing?.gst ?? 0) : 0;
  const txnFee = Number(pricing?.transactionFee ?? pricing?.txnFee ?? 0);
  const txnCharge = Number(pricing?.transactionCharge ?? pricing?.txnCharge ?? 0);

  const grossTotal = baseTotalFare + seatTotal + txnFee + txnCharge + gstAmount;

  const agent = useMemo(
    () =>
      computeAgentFigures({
        grossTotal,
        pricing,
        fares: tripType === "ROUNDTRIP" ? [selectedFareOnward, selectedFareReturn].filter(Boolean) : [selectedFare].filter(Boolean),
        paxConfig,
      }),
    [grossTotal, pricing, selectedFare, selectedFareOnward, selectedFareReturn, paxConfig, tripType]
  );

  const finalTotal = grossTotal;

  useEffect(() => {
    if (totalPax > 0 && selectedSeats.length > totalPax) setSelectedSeats((s) => s.slice(0, totalPax));
  }, [totalPax, selectedSeats.length]);

  function validateBeforeSubmit() {
    const list = [];

    if (!isEmail(contact.email)) list.push("Please enter a valid email.");
    if (!isIndianPhone10(contact.phone)) list.push("Please enter a valid 10-digit Indian mobile number.");

    // ✅ infants rule (common airline rule)
    if ((paxConfig.infants || 0) > (paxConfig.adults || 0)) {
      list.push("Infants cannot be more than adults (1 infant per adult).");
    }

    for (const p of passengers) {
      const d = paxDetails[p.id];
      if (!d) {
        list.push(`${p.label}: Missing details.`);
        continue;
      }
      if (!d.firstName?.trim()) list.push(`${p.label}: First name required.`);
      if (!d.lastName?.trim()) list.push(`${p.label}: Last name required.`);
      if (!d.gender) list.push(`${p.label}: Gender required.`);
      if (!d.dob) list.push(`${p.label}: Date of birth required.`);
    }
    return list;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    if (!hasRequired) {
      setErrors(["Missing selection (flight/fare). Please go back and select properly."]);
      return;
    }

    const validationErrors = validateBeforeSubmit();
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      tripType,

      // flights
      flight: selectedFlight,
      onwardFlight: selectedFlightOnward,
      returnFlight: selectedFlightReturn,

      // fares
      selectedFare,
      selectedFareOnward,
      selectedFareReturn,

      pricing: {
        ...pricing,
        seatTotal,
        gstAmount,
        txnFee,
        txnCharge,
        grossTotal,
        agent,
        finalTotal,
        pax: paxConfig, // ✅ ensure pax stored here too
      },

      paxConfig, // ✅ normalized
      pax: paxConfig, // ✅ for any other page
      contact,
      paxDetails,

      seats: { selectedSeats, seatPricePerSeat: SEAT_PRICE, seatTotal },
      gst: { enabled: gstEnabled, ...gstDetails },

      finalTotal,
      createdAt: new Date().toISOString(),
    };

    sessionStorage.setItem(PAYLOAD_KEY, JSON.stringify(payload));
    navigate("/flights/review-and-pay", { state: { bookingPayload: payload } });
  }

  const breakup = useMemo(() => buildPaxBreakup(pricing, paxConfig), [pricing, paxConfig]);
  const [openPax, setOpenPax] = useState({ ADT: false, CHD: false, INF: false });

  const paxLines = useMemo(() => {
    const pax = breakup.pax || paxConfig || { adults: 0, children: 0, infants: 0 };
    const rows = [];
    if (pax.adults) rows.push({ code: "ADT", label: `Adult x ${pax.adults}`, amount: (breakup.ADT?.total || 0) * pax.adults });
    if (pax.children) rows.push({ code: "CHD", label: `Child x ${pax.children}`, amount: (breakup.CHD?.total || 0) * pax.children });
    if (pax.infants) rows.push({ code: "INF", label: `Infant x ${pax.infants}`, amount: (breakup.INF?.total || 0) * pax.infants });
    return rows;
  }, [breakup, paxConfig]);

  const paxFareTotal = useMemo(() => sum(paxLines.map((x) => x.amount)), [paxLines]);

  if (!hasRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="rounded-md px-6 py-5 text-center text-sm shadow-sm"
          style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.muted }}
        >
          Missing selection (flight/fare). Please go back to results and select properly.
          <div className="mt-3 flex justify-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-md px-4 py-2 text-xs font-semibold"
              style={{ background: VAR.primary, color: "var(--onPrimary, #fff)" }}
            >
              Go Back
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem(SS_KEY);
                navigate("/flights");
              }}
              className="rounded-md px-4 py-2 text-xs font-semibold"
              style={{ background: VAR.surface, border: `1px solid ${VAR.border}`, color: VAR.text }}
            >
              New Search
            </button>
          </div>

          <div className="mt-3 text-[11px]" style={{ color: VAR.subtle }}>
            Debug Pax: {paxConfig.adults}A {paxConfig.children}C {paxConfig.infants}I
          </div>
        </div>
      </div>
    );
  }

  // ✅ refundable header logic for roundtrip
  const refundableFlag =
    tripType === "ROUNDTRIP"
      ? selectedFareOnward?.refundable === "Refundable" && selectedFareReturn?.refundable === "Refundable"
      : (selectedFare?.refundable || selectedFlight?.refundable || "Non-Refundable") === "Refundable";

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 border-b" style={{ borderColor: VAR.border, background: VAR.surface }}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: VAR.subtle }}>
              Step 2 • Traveller Details
            </p>
            <h1 className="text-lg sm:text-xl font-semibold" style={{ color: VAR.text }}>
              Enter passenger details &amp; review your fare
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Pill>{tripType === "ROUNDTRIP" ? "Round Trip" : tripType === "SPECIAL" ? "Special Fare" : "One Way"}</Pill>
              <Pill tone={refundableFlag ? "ok" : "warn"}>{refundableFlag ? "Refundable" : "Non-Refundable"}</Pill>
              <Pill>{`Pax: ${paxConfig.adults}A ${paxConfig.children}C ${paxConfig.infants}I`}</Pill>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: VAR.muted }}>
            <span className="h-2 w-2 rounded-full" style={{ background: VAR.success }} />
            <span>Secure booking</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 pb-10 lg:flex lg:items-start lg:gap-6">
        {/* LEFT */}
        <section className="flex-1 space-y-4">
          <SectionCard title="Passenger Details" subtitle="Ensure names match the government ID / passport exactly.">
            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.length > 0 && (
                <div
                  className="rounded-md px-4 py-3 text-sm"
                  style={{ border: `1px solid rgba(244,63,94,0.25)`, background: "rgba(244,63,94,0.08)", color: "rgba(127,29,29,0.95)" }}
                >
                  <div className="font-semibold mb-1">Please fix:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {passengers.map((p) => {
                const d = paxDetails[p.id] || { title: "MR", firstName: "", lastName: "", gender: "", dob: "" };

                return (
                  <div
                    key={p.id}
                    className="space-y-3 rounded-md px-3.5 py-3.5 sm:px-4 sm:py-4"
                    style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2 }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold" style={{ color: VAR.text }}>
                          {p.label}{" "}
                          <span className="ml-2">
                            <Pill>{p.type}</Pill>
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px]" style={{ color: VAR.subtle }}>
                          {p.type === "Infant" ? "Must travel with an adult" : "As per ID / Passport"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide" style={{ color: VAR.subtle }}>
                          Title
                        </label>
                        <select
                          value={d.title}
                          onChange={(e) => handlePaxChange(p.id, "title", e.target.value)}
                          className="w-full rounded-md border px-2 py-2 text-xs outline-none"
                          style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                        >
                          <option value="MR">Mr</option>
                          <option value="MS">Ms</option>
                          <option value="MRS">Mrs</option>
                        </select>
                      </div>

                      <div className="col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide" style={{ color: VAR.subtle }}>
                          First Name
                        </label>
                        <input
                          type="text"
                          value={d.firstName}
                          onChange={(e) => handlePaxChange(p.id, "firstName", e.target.value)}
                          className="w-full rounded-md border px-2 py-2 text-xs outline-none"
                          style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                          placeholder="As per ID"
                          required
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide" style={{ color: VAR.subtle }}>
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={d.lastName}
                          onChange={(e) => handlePaxChange(p.id, "lastName", e.target.value)}
                          className="w-full rounded-md border px-2 py-2 text-xs outline-none"
                          style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                          placeholder="Surname"
                          required
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide" style={{ color: VAR.subtle }}>
                          Gender
                        </label>
                        <select
                          value={d.gender}
                          onChange={(e) => handlePaxChange(p.id, "gender", e.target.value)}
                          className="w-full rounded-md border px-2 py-2 text-xs outline-none"
                          style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                          required
                        >
                          <option value="">Select</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide" style={{ color: VAR.subtle }}>
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={d.dob}
                          onChange={(e) => handlePaxChange(p.id, "dob", e.target.value)}
                          className="w-full rounded-md border px-2 py-2 text-xs outline-none"
                          style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Contact */}
              <div className="space-y-3 rounded-md px-3.5 py-3.5 sm:px-4 sm:py-4" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold" style={{ color: VAR.text }}>
                    Contact Details
                  </div>
                  <div className="text-[11px]" style={{ color: VAR.subtle }}>
                    Ticket &amp; updates will be sent here
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide" style={{ color: VAR.subtle }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-md border px-2 py-2 text-xs outline-none"
                      style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide" style={{ color: VAR.subtle }}>
                      Mobile (WhatsApp preferred)
                    </label>
                    <div className="flex gap-2">
                      <span className="flex items-center rounded-md border px-2 text-xs" style={{ borderColor: VAR.border, background: VAR.surface2, color: VAR.muted }}>
                        +91
                      </span>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full rounded-md border px-2 py-2 text-xs outline-none"
                        style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 border-t pt-2 text-[11px]" style={{ borderColor: VAR.border, color: VAR.subtle }}>
                  By continuing, you agree to fare rules, cancellation &amp; change policies.
                </div>
              </div>

              <SeatMap totalPax={totalPax} selectedSeats={selectedSeats} onChange={setSelectedSeats} />

              {/* GST */}
              <div className="space-y-3 rounded-md px-3.5 py-3.5 sm:px-4 sm:py-4" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold" style={{ color: VAR.text }}>
                    GST details for invoice
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-[11px]" style={{ color: VAR.muted }}>
                    <span>Add GST</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded"
                      checked={gstEnabled}
                      onChange={(e) => setGstEnabled(e.target.checked)}
                      style={{ accentColor: "var(--primary, rgb(37,99,235))" }}
                    />
                  </label>
                </div>

                {gstEnabled && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide" style={{ color: VAR.subtle }}>
                        GSTIN
                      </label>
                      <input
                        type="text"
                        value={gstDetails.gstin}
                        onChange={(e) => setGstDetails((prev) => ({ ...prev, gstin: e.target.value }))}
                        className="w-full rounded-md border px-2 py-2 text-xs outline-none"
                        style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide" style={{ color: VAR.subtle }}>
                        Company name
                      </label>
                      <input
                        type="text"
                        value={gstDetails.company}
                        onChange={(e) => setGstDetails((prev) => ({ ...prev, company: e.target.value }))}
                        className="w-full rounded-md border px-2 py-2 text-xs outline-none"
                        style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                        placeholder="Your company legal name"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide" style={{ color: VAR.subtle }}>
                        Billing address
                      </label>
                      <textarea
                        rows={2}
                        value={gstDetails.address}
                        onChange={(e) => setGstDetails((prev) => ({ ...prev, address: e.target.value }))}
                        className="w-full rounded-md border px-2 py-2 text-xs outline-none"
                        style={{ borderColor: VAR.border, background: VAR.surface, color: VAR.text }}
                        placeholder="Address as per GST registration"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md px-6 py-2.5 text-sm font-semibold shadow-sm"
                  style={{ background: VAR.primary, color: "var(--onPrimary, #fff)" }}
                >
                  Continue to payment
                </button>
              </div>
            </form>
          </SectionCard>
        </section>

        {/* RIGHT */}
        <aside className="mt-6 w-full space-y-4 lg:mt-0 lg:w-[360px] lg:flex-shrink-0 lg:sticky lg:top-24">
          <SectionCard title="Selected Flight" subtitle={tripType === "ROUNDTRIP" ? "Onward + Return" : "Summary"}>
            {/* ONEWAY */}
            {tripType !== "ROUNDTRIP" && selectedFlight ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src={selectedFlight.logo} alt={selectedFlight.airline} className="h-9 w-9 object-contain" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{ color: VAR.text }}>
                      {selectedFlight.airline}{" "}
                      <span className="text-xs" style={{ color: VAR.muted }}>
                        {selectedFlight.flightNos}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedFare ? (
                  <div className="rounded-md px-3 py-3 text-xs" style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}>
                    <KeyVal k="Fare" v={selectedFare.label || "Selected Fare"} />
                    <KeyVal k="Per Pax" v={moneyIN(pricing?.perTraveller || selectedFare.price || 0)} bold />
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* ROUNDTRIP */}
            {tripType === "ROUNDTRIP" ? (
              <div className="space-y-3">
                {selectedFlightOnward ? (
                  <div className="rounded-md px-3 py-3" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2 }}>
                    <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: VAR.subtle }}>
                      Onward
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <img src={selectedFlightOnward.logo} alt={selectedFlightOnward.airline} className="h-8 w-8 object-contain" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold" style={{ color: VAR.text }}>
                          {selectedFlightOnward.airline}{" "}
                          <span className="text-xs" style={{ color: VAR.muted }}>
                            {selectedFlightOnward.flightNos}
                          </span>
                        </div>
                        <div className="text-[11px]" style={{ color: VAR.muted }}>
                          {selectedFlightOnward.fromIata} → {selectedFlightOnward.toIata} • {selectedFlightOnward.departDate}
                        </div>
                        {selectedFareOnward ? (
                          <div className="mt-1 text-[11px]" style={{ color: VAR.subtle }}>
                            Fare: <b style={{ color: VAR.text }}>{selectedFareOnward.label}</b> • {moneyIN(selectedFareOnward.price)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                {selectedFlightReturn ? (
                  <div className="rounded-md px-3 py-3" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2 }}>
                    <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: VAR.subtle }}>
                      Return
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <img src={selectedFlightReturn.logo} alt={selectedFlightReturn.airline} className="h-8 w-8 object-contain" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold" style={{ color: VAR.text }}>
                          {selectedFlightReturn.airline}{" "}
                          <span className="text-xs" style={{ color: VAR.muted }}>
                            {selectedFlightReturn.flightNos}
                          </span>
                        </div>
                        <div className="text-[11px]" style={{ color: VAR.muted }}>
                          {selectedFlightReturn.fromIata} → {selectedFlightReturn.toIata} • {selectedFlightReturn.departDate}
                        </div>
                        {selectedFareReturn ? (
                          <div className="mt-1 text-[11px]" style={{ color: VAR.subtle }}>
                            Fare: <b style={{ color: VAR.text }}>{selectedFareReturn.label}</b> • {moneyIN(selectedFareReturn.price)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-md px-3 py-3 text-xs" style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}>
                  <KeyVal k="Per Pax (Round Trip)" v={moneyIN(pricing?.perTraveller || 0)} bold />
                  <KeyVal k="Total Fare" v={moneyIN(pricing?.totalFare || 0)} bold tone="primary" />
                </div>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="Fare Summary" subtitle="B2B • Pax wise breakup (click to expand)" right={<Pill>All inclusive</Pill>}>
            <div className="space-y-3">
              {(breakup?.pax?.adults || 0) > 0 && (
                <Collapse
                  titleLeft="Adult Fare"
                  titleRight={moneyIN((breakup.ADT?.total || 0) * (breakup.pax?.adults || 0))}
                  open={openPax.ADT}
                  onToggle={() => setOpenPax((s) => ({ ...s, ADT: !s.ADT }))}
                >
                  <div className="space-y-2">
                    <KeyVal k="Base Fare" v={moneyIN(breakup.ADT?.base || 0)} />
                    <KeyVal k="Fuel Surcharge" v={moneyIN(breakup.ADT?.fuel || 0)} />
                    <KeyVal k="Tax" v={moneyIN(breakup.ADT?.tax || 0)} />
                    <div className="pt-2" style={{ borderTop: `1px dashed ${VAR.border}` }}>
                      <KeyVal k="Total (per adult)" v={moneyIN(breakup.ADT?.total || 0)} bold />
                      <KeyVal k={`Adult x ${breakup.pax?.adults || 0}`} v={moneyIN((breakup.ADT?.total || 0) * (breakup.pax?.adults || 0))} bold />
                    </div>
                  </div>
                </Collapse>
              )}

              {(breakup?.pax?.children || 0) > 0 && (
                <Collapse
                  titleLeft="Child Fare"
                  titleRight={moneyIN((breakup.CHD?.total || 0) * (breakup.pax?.children || 0))}
                  open={openPax.CHD}
                  onToggle={() => setOpenPax((s) => ({ ...s, CHD: !s.CHD }))}
                >
                  <div className="space-y-2">
                    <KeyVal k="Base Fare" v={moneyIN(breakup.CHD?.base || 0)} />
                    <KeyVal k="Fuel Surcharge" v={moneyIN(breakup.CHD?.fuel || 0)} />
                    <KeyVal k="Tax" v={moneyIN(breakup.CHD?.tax || 0)} />
                    <div className="pt-2" style={{ borderTop: `1px dashed ${VAR.border}` }}>
                      <KeyVal k="Total (per child)" v={moneyIN(breakup.CHD?.total || 0)} bold />
                      <KeyVal k={`Child x ${breakup.pax?.children || 0}`} v={moneyIN((breakup.CHD?.total || 0) * (breakup.pax?.children || 0))} bold />
                    </div>
                  </div>
                </Collapse>
              )}

              {(breakup?.pax?.infants || 0) > 0 && (
                <Collapse
                  titleLeft="Infant Fare"
                  titleRight={moneyIN((breakup.INF?.total || 0) * (breakup.pax?.infants || 0))}
                  open={openPax.INF}
                  onToggle={() => setOpenPax((s) => ({ ...s, INF: !s.INF }))}
                >
                  <div className="space-y-2">
                    <KeyVal k="Base Fare" v={moneyIN(breakup.INF?.base || 0)} />
                    <KeyVal k="Tax" v={moneyIN(breakup.INF?.tax || 0)} />
                    <div className="pt-2" style={{ borderTop: `1px dashed ${VAR.border}` }}>
                      <KeyVal k="Total (per infant)" v={moneyIN(breakup.INF?.total || 0)} bold />
                      <KeyVal k={`Infant x ${breakup.pax?.infants || 0}`} v={moneyIN((breakup.INF?.total || 0) * (breakup.pax?.infants || 0))} bold />
                    </div>
                  </div>
                </Collapse>
              )}

              <div className="rounded-md p-3 space-y-2" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2 }}>
                <KeyVal k="Seat selection" v={moneyIN(seatTotal)} />
                <KeyVal k="GST" v={moneyIN(gstEnabled ? gstAmount : 0)} />
                <KeyVal k="Transaction Fee" v={moneyIN(txnFee)} />
                <KeyVal k="Transaction Charge" v={moneyIN(txnCharge)} />
              </div>

              <div className="rounded-md p-3 space-y-2" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
                {paxLines.map((x) => (
                  <KeyVal key={x.code} k={x.label} v={moneyIN(x.amount)} />
                ))}
                <div className="pt-2" style={{ borderTop: `1px dashed ${VAR.border}` }}>
                  <KeyVal k="Pax Fare Total" v={moneyIN(paxFareTotal)} bold />
                  <KeyVal k="Gross Total +" v={moneyIN(grossTotal)} bold tone="primary" />
                </div>
              </div>

              <div className="rounded-md p-3 space-y-2" style={{ border: `1px solid ${VAR.border}`, background: VAR.surface }}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold" style={{ color: VAR.text }}>
                    Agent Summary
                  </div>
                  <Pill>B2B</Pill>
                </div>

                <KeyVal k="Gross Total" v={moneyIN(grossTotal)} />
                <KeyVal k="Commission" v={moneyIN(agent.commissionTotal)} />
                <KeyVal k={`TDS @ ${agent.tdsRate}%`} v={moneyIN(agent.tdsTotal)} />
                <div className="pt-2" style={{ borderTop: `1px dashed ${VAR.border}` }}>
                  <KeyVal k="Net Fare (Gross - Commission)" v={moneyIN(agent.netFare)} bold />
                  <KeyVal k="Net Payable (Net Fare + TDS)" v={moneyIN(agent.netPayable)} bold tone="primary" />
                </div>

                <div className="mt-1 text-[11px]" style={{ color: VAR.subtle }}>
                  *Demo values: API integrate hote hi exact breakup/commission/tds backend se aayega.
                </div>
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
