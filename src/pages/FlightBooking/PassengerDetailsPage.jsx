// src/pages/PassengerDetailsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SeatMap from "../../components/flightlist/SeatMap";

const currencySymbol = "₹";
const SEAT_PRICE = 250;

// session keys (enterprise UX: survive refresh)
const SS_KEY = "BOOKING_CTX_V1";

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

export default function PassengerDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Always read state safely
  const incomingState = location.state || null;

  // ✅ Restore from sessionStorage if user refreshed page
  const restored = useMemo(() => {
    const raw = sessionStorage.getItem(SS_KEY);
    return raw ? safeParse(raw) : null;
  }, []);

  // choose source of truth
  const ctx = incomingState ?? restored ?? null;

  // keep ctx in sessionStorage whenever present
  useEffect(() => {
    if (incomingState) {
      sessionStorage.setItem(SS_KEY, JSON.stringify(incomingState));
    }
  }, [incomingState]);

  // ✅ Normalize data (no crash, hooks stable)
  const selectedFlight = ctx?.selectedFlight ?? null;
  const paxConfig = ctx?.paxConfig ?? null;

  // IMPORTANT: standardize pricing keys
  // expected:
  // pricing = { currency:"INR", perTraveller:number, totalFare:number, singleFare:number, pax:{...} }
  const pricing = ctx?.pricing ?? null;

  const hasRequired = Boolean(selectedFlight && paxConfig && pricing);

  // ✅ passengers list always computed safely
  const passengers = useMemo(() => {
    if (!paxConfig) return [];
    const list = [];
    for (let i = 0; i < (paxConfig.adults || 0); i++) {
      list.push({ id: `ADT-${i + 1}`, type: "Adult", label: `Adult ${i + 1}` });
    }
    for (let i = 0; i < (paxConfig.children || 0); i++) {
      list.push({ id: `CHD-${i + 1}`, type: "Child", label: `Child ${i + 1}` });
    }
    for (let i = 0; i < (paxConfig.infants || 0); i++) {
      list.push({ id: `INF-${i + 1}`, type: "Infant", label: `Infant ${i + 1}` });
    }
    return list;
  }, [paxConfig]);

  const totalPax = useMemo(() => {
    if (!paxConfig) return 0;
    return (paxConfig.adults || 0) + (paxConfig.children || 0) + (paxConfig.infants || 0);
  }, [paxConfig]);

  // ✅ form states
  const [contact, setContact] = useState({ email: "", phone: "" });

  const [paxDetails, setPaxDetails] = useState({});

  // ✅ sync paxDetails whenever passengers list changes
  useEffect(() => {
    setPaxDetails((prev) => {
      const next = { ...prev };
      // add missing
      for (const p of passengers) {
        if (!next[p.id]) {
          next[p.id] = {
            title: "MR",
            firstName: "",
            lastName: "",
            gender: "",
            dob: "",
          };
        }
      }
      // remove extras (if counts reduced)
      Object.keys(next).forEach((id) => {
        if (!passengers.find((p) => p.id === id)) delete next[id];
      });
      return next;
    });
  }, [passengers]);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstDetails, setGstDetails] = useState({ gstin: "", company: "", address: "" });
  const [errors, setErrors] = useState([]);

  function handlePaxChange(paxId, field, value) {
    setPaxDetails((prev) => ({
      ...prev,
      [paxId]: { ...(prev[paxId] || {}), [field]: value },
    }));
  }

  // ✅ pricing normalization: use totalFare
  const baseTotalFare = pricing?.totalFare ?? 0;
  const seatTotal = selectedSeats.length * SEAT_PRICE;
  const finalTotal = baseTotalFare + seatTotal;

  // ✅ prevent selecting more seats than pax (common enterprise rule)
  useEffect(() => {
    if (totalPax > 0 && selectedSeats.length > totalPax) {
      setSelectedSeats((s) => s.slice(0, totalPax));
    }
  }, [totalPax, selectedSeats.length]);

  function validateBeforeSubmit() {
    const list = [];

    if (!isEmail(contact.email)) list.push("Please enter a valid email.");
    if (!isIndianPhone10(contact.phone)) list.push("Please enter a valid 10-digit Indian mobile number.");

    // pax validations
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

    // seat rule (optional)
    // if you want seats mandatory:
    // if (selectedSeats.length !== totalPax) list.push("Please select seat for each traveller.");

    return list;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    if (!hasRequired) {
      setErrors(["No flight selected. Please go back to results."]);
      return;
    }

    const validationErrors = validateBeforeSubmit();
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      flight: selectedFlight,
      pricing: {
        ...pricing,
        // keep a computed number too
        seatTotal,
        finalTotal,
      },
      paxConfig,
      contact,
      paxDetails,
      seats: {
        selectedSeats,
        seatPricePerSeat: SEAT_PRICE,
        seatTotal,
      },
      gst: {
        enabled: gstEnabled,
        ...gstDetails,
      },
      finalTotal,
      createdAt: new Date().toISOString(),
    };

    // persist payload for refresh-safe review page too
    sessionStorage.setItem("BOOKING_PAYLOAD_V1", JSON.stringify(payload));

    navigate("/flights/review-and-pay", {
      state: { bookingPayload: payload },
    });
  }

  // ✅ Render: if no required state, show "Go back" (but AFTER hooks)
  if (!hasRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 text-center text-sm text-slate-600 shadow-sm">
          No flight selected. Please go back to the search results.
          <div className="mt-3 flex justify-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem(SS_KEY);
                navigate("/flights");
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              New Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur mx-auto max-w-7xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              Step 2 • Traveller Details
            </p>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
              Enter passenger details &amp; review your fare
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Secure booking</span>
          </div>
        </div>
      </div>

      <div className="pt-6 lg:flex lg:items-start lg:gap-6 mx-auto max-w-7xl">
        {/* LEFT */}
        <section className="flex-1">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                Passenger Details
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Ensure names match the government ID / passport exactly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-4 py-4 sm:px-5 sm:py-5">
              {/* errors */}
              {errors.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  <div className="font-semibold mb-1">Please fix:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {passengers.map((p) => {
                const d = paxDetails[p.id] || {
                  title: "MR",
                  firstName: "",
                  lastName: "",
                  gender: "",
                  dob: "",
                };

                return (
                  <div
                    key={p.id}
                    className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3.5 sm:px-4 sm:py-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-900">
                        {p.label}{" "}
                        <span className="ml-1 rounded-full bg-slate-200 px-2 py-[2px] text-[10px] font-medium uppercase tracking-wide text-slate-600">
                          {p.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.type === "Infant" ? "Must travel with an adult" : "As per ID / Passport"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Title
                        </label>
                        <select
                          value={d.title}
                          onChange={(e) => handlePaxChange(p.id, "title", e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="MR">Mr</option>
                          <option value="MS">Ms</option>
                          <option value="MRS">Mrs</option>
                        </select>
                      </div>

                      <div className="col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={d.firstName}
                          onChange={(e) => handlePaxChange(p.id, "firstName", e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="As per ID"
                          required
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={d.lastName}
                          onChange={(e) => handlePaxChange(p.id, "lastName", e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Surname"
                          required
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Gender
                        </label>
                        <select
                          value={d.gender}
                          onChange={(e) => handlePaxChange(p.id, "gender", e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={d.dob}
                          onChange={(e) => handlePaxChange(p.id, "dob", e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Contact */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 sm:px-4 sm:py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">Contact Details</div>
                  <div className="text-[11px] text-slate-500">Ticket &amp; updates will be sent here</div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Mobile (WhatsApp preferred)
                    </label>
                    <div className="flex gap-2">
                      <span className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-2 text-xs text-slate-600">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                  By continuing, you agree to fare rules, cancellation &amp; change policies.
                </div>
              </div>

              {/* Seat map */}
              <SeatMap totalPax={totalPax} selectedSeats={selectedSeats} onChange={setSelectedSeats} />

              {/* GST */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 sm:px-4 sm:py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">GST details for invoice</div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-[11px] text-slate-600">
                    <span>Add GST</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={gstEnabled}
                      onChange={(e) => setGstEnabled(e.target.checked)}
                    />
                  </label>
                </div>

                {gstEnabled && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        GSTIN
                      </label>
                      <input
                        type="text"
                        value={gstDetails.gstin}
                        onChange={(e) => setGstDetails((prev) => ({ ...prev, gstin: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Company name
                      </label>
                      <input
                        type="text"
                        value={gstDetails.company}
                        onChange={(e) => setGstDetails((prev) => ({ ...prev, company: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Your company legal name"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Billing address
                      </label>
                      <textarea
                        rows={2}
                        value={gstDetails.address}
                        onChange={(e) => setGstDetails((prev) => ({ ...prev, address: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Address as per GST registration"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Continue to payment
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* RIGHT */}
        <aside className="mt-6 w-full space-y-4 lg:mt-0 lg:w-[340px] lg:flex-shrink-0 lg:sticky lg:top-30">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <img src={selectedFlight.logo} alt={selectedFlight.airline} className="h-8 w-8 object-contain" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900">
                  {selectedFlight.airline}{" "}
                  <span className="text-xs text-slate-500">{selectedFlight.flightNos}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {selectedFlight.cabin} •{" "}
                  {selectedFlight.refundable === "Refundable" ? "Refundable" : "Non-refundable"}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">From</div>
                  <div className="text-sm font-semibold">
                    {selectedFlight.fromCity} ({selectedFlight.fromIata})
                  </div>
                  <div className="text-xs text-slate-500">{selectedFlight.departTime}</div>
                </div>
                <div className="flex flex-col items-center text-[11px] text-slate-500">
                  <span>───✈───</span>
                  <span className="mt-1">{selectedFlight.departDate}</span>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">To</div>
                  <div className="text-sm font-semibold">
                    {selectedFlight.toCity} ({selectedFlight.toIata})
                  </div>
                  <div className="text-xs text-slate-500">{selectedFlight.arriveTime}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Fare Summary</div>
              <div className="rounded-full bg-slate-100 px-2 py-[2px] text-[10px] font-medium text-slate-600">
                All inclusive
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>
                  Travellers x {totalPax}{" "}
                  <span className="text-[11px] text-slate-400">
                    ({currencySymbol}{Number(pricing.perTraveller || 0).toLocaleString("en-IN")} each)
                  </span>
                </span>
                <span>
                  {currencySymbol}{Number(pricing.totalFare || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  Seat selection{" "}
                  {selectedSeats.length > 0 && (
                    <span className="text-[11px] text-slate-400">
                      ({selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} × {currencySymbol}{SEAT_PRICE})
                    </span>
                  )}
                </span>
                <span>{currencySymbol}{seatTotal.toLocaleString("en-IN")}</span>
              </div>

              {gstEnabled && (
                <div className="flex justify-between text-[11px] text-emerald-700">
                  <span>GST details added for tax invoice</span>
                  <span className="text-[10px] uppercase tracking-wide">B2B</span>
                </div>
              )}

              <div className="mt-2 flex items-center justify-between border-t border-dashed border-slate-200 pt-2 text-sm font-semibold text-slate-900">
                <span>Total payable</span>
                <span className="text-base text-blue-700">
                  {currencySymbol}{finalTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-1 text-[11px] text-emerald-600">✔ Free SMS &amp; email alerts included</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
