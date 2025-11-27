// src/pages/PassengerDetailsPage.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SeatMap from "../../components/flightlist/SeatMap";

const currencySymbol = "₹";
const SEAT_PRICE = 250; // SeatMap ke saath sync rakho

export default function PassengerDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const selectedFlight = state.selectedFlight;
  const pricing = state.pricing;
  const paxConfig = state.paxConfig;

  // Agar koi data nahi hai to back dikhao
  if (!selectedFlight || !pricing || !paxConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 text-center text-sm text-slate-600 shadow-sm">
          No flight selected. Please go back to the search results.
          <div className="mt-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================== Passenger list (ADT/CHD/INF) ================== */
  const passengers = useMemo(() => {
    const list = [];
    for (let i = 0; i < paxConfig.adults; i++) {
      list.push({ id: `ADT-${i + 1}`, type: "Adult", label: `Adult ${i + 1}` });
    }
    for (let i = 0; i < paxConfig.children; i++) {
      list.push({ id: `CHD-${i + 1}`, type: "Child", label: `Child ${i + 1}` });
    }
    for (let i = 0; i < paxConfig.infants; i++) {
      list.push({ id: `INF-${i + 1}`, type: "Infant", label: `Infant ${i + 1}` });
    }
    return list;
  }, [paxConfig]);

  const [contact, setContact] = useState({ email: "", phone: "" });

  const [paxDetails, setPaxDetails] = useState(() => {
    const initial = {};
    passengers.forEach((p) => {
      initial[p.id] = {
        title: "MR",
        firstName: "",
        lastName: "",
        gender: "",
        dob: "",
      };
    });
    return initial;
  });

  const [selectedSeats, setSelectedSeats] = useState([]); // ["12A","12B",...]
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstDetails, setGstDetails] = useState({
    gstin: "",
    company: "",
    address: "",
  });

  function handlePaxChange(paxId, field, value) {
    setPaxDetails((prev) => ({
      ...prev,
      [paxId]: {
        ...prev[paxId],
        [field]: value,
      },
    }));
  }

  const totalPax = paxConfig.adults + paxConfig.children + paxConfig.infants;

  const seatTotal = selectedSeats.length * SEAT_PRICE;
  const finalTotal = pricing.total + seatTotal;

  /* ================== Submit -> navigate to review-and-pay ================== */
  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      flight: selectedFlight,
      pricing,
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
    };

    // yahin se confirmation / payment page pe jao
    navigate("/flights/review-and-pay", {
      state: {
        bookingPayload: payload,
      },
    });

    console.log("Final booking payload (ready for API):", payload);
  }

  /* ================== UI ================== */

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

      {/* Main content container */}
      <div className="pt-6 lg:flex lg:items-start lg:gap-6 mx-auto max-w-7xl">
        {/* LEFT: Passenger + Contact inside one big card */}
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

            <form
              onSubmit={handleSubmit}
              className="space-y-6 px-4 py-4 sm:px-5 sm:py-5"
            >
              {passengers.map((p) => {
                const d =
                  paxDetails[p.id] || {
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
                        {p.type === "Infant"
                          ? "Must travel with an adult"
                          : "As per ID / Passport"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {/* Title */}
                      <div className="col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Title
                        </label>
                        <select
                          value={d.title}
                          onChange={(e) =>
                            handlePaxChange(p.id, "title", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="MR">Mr</option>
                          <option value="MS">Ms</option>
                          <option value="MRS">Mrs</option>
                        </select>
                      </div>

                      {/* First Name */}
                      <div className="col-span-1 sm:col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={d.firstName}
                          onChange={(e) =>
                            handlePaxChange(p.id, "firstName", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="As per ID"
                          required
                        />
                      </div>

                      {/* Last Name */}
                      <div className="col-span-1 sm:col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={d.lastName}
                          onChange={(e) =>
                            handlePaxChange(p.id, "lastName", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Surname"
                          required
                        />
                      </div>

                      {/* Gender */}
                      <div className="col-span-1 sm:col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Gender
                        </label>
                        <select
                          value={d.gender}
                          onChange={(e) =>
                            handlePaxChange(p.id, "gender", e.target.value)
                          }
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

                    {/* DOB row */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="col-span-1">
                        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={d.dob}
                          onChange={(e) =>
                            handlePaxChange(p.id, "dob", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Contact Details */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 sm:px-4 sm:py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Contact Details
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Ticket &amp; updates will be sent here
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) =>
                        setContact((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
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
                        onChange={(e) =>
                          setContact((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                  By continuing, you agree to fare rules, cancellation &amp;
                  change policies.
                </div>
              </div>

              {/* Seat map */}
              <SeatMap
                totalPax={totalPax}
                selectedSeats={selectedSeats}
                onChange={setSelectedSeats}
              />

              {/* GST Details (B2B) */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 sm:px-4 sm:py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    GST details for invoice
                  </div>
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
                        onChange={(e) =>
                          setGstDetails((prev) => ({
                            ...prev,
                            gstin: e.target.value,
                          }))
                        }
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
                        onChange={(e) =>
                          setGstDetails((prev) => ({
                            ...prev,
                            company: e.target.value,
                          }))
                        }
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
                        onChange={(e) =>
                          setGstDetails((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Address as per GST registration"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CTA bottom */}
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

        {/* RIGHT: Flight + Fare summary */}
        <aside className="mt-6 w-full space-y-4 lg:mt-0 lg:w-[340px] lg:flex-shrink-0 lg:sticky lg:top-30">
          {/* Flight card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={selectedFlight.logo}
                alt={selectedFlight.airline}
                className="h-8 w-8 object-contain"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900">
                  {selectedFlight.airline}{" "}
                  <span className="text-xs text-slate-500">
                    {selectedFlight.flightNos}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {selectedFlight.cabin} •{" "}
                  {selectedFlight.refundable === "Refundable"
                    ? "Refundable"
                    : "Non-refundable"}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    From
                  </div>
                  <div className="text-sm font-semibold">
                    {selectedFlight.fromCity} ({selectedFlight.fromIata})
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedFlight.departTime}
                  </div>
                </div>
                <div className="flex flex-col items-center text-[11px] text-slate-500">
                  <span>───✈───</span>
                  <span className="mt-1">{selectedFlight.departDate}</span>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    To
                  </div>
                  <div className="text-sm font-semibold">
                    {selectedFlight.toCity} ({selectedFlight.toIata})
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedFlight.arriveTime}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fare summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Fare Summary
              </div>
              <div className="rounded-full bg-slate-100 px-2 py-[2px] text-[10px] font-medium text-slate-600">
                All inclusive
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>
                  Travellers x {totalPax}{" "}
                  <span className="text-[11px] text-slate-400">
                    ({currencySymbol}
                    {pricing.perTraveller.toLocaleString("en-IN")} each)
                  </span>
                </span>
                <span>
                  {currencySymbol}
                  {pricing.total.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Seat charges line */}
              <div className="flex justify-between">
                <span>
                  Seat selection{" "}
                  {selectedSeats.length > 0 && (
                    <span className="text-[11px] text-slate-400">
                      ({selectedSeats.length} seat
                      {selectedSeats.length > 1 ? "s" : ""} × {currencySymbol}
                      {SEAT_PRICE})
                    </span>
                  )}
                </span>
                <span>
                  {currencySymbol}
                  {seatTotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* GST info badge */}
              {gstEnabled && (
                <div className="flex justify-between text-[11px] text-emerald-700">
                  <span>GST details added for tax invoice</span>
                  <span className="text-[10px] uppercase tracking-wide">
                    B2B
                  </span>
                </div>
              )}

              <div className="mt-2 flex items-center justify-between border-t border-dashed border-slate-200 pt-2 text-sm font-semibold text-slate-900">
                <span>Total payable</span>
                <span className="text-base text-blue-700">
                  {currencySymbol}
                  {finalTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-1 text-[11px] text-emerald-600">
                ✔ Free SMS &amp; email alerts included
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
