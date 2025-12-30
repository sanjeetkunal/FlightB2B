// src/pages/dashboard/flight/RefundReport.jsx
import React, { useMemo, useState } from "react";

const SAMPLE_REFUND_REPORT = [
  {
    id: 1,
    bookingDate: "2025-11-20",
    cancelDate: "2025-11-22",
    refundDate: "2025-11-25",
    pnr: "AB12CD",
    airline: "Vistara",
    flightNo: "UK 970",
    from: "DEL",
    to: "BOM",
    paxName: "Rahul Sharma",
    paxCount: 2,
    refundType: "FULL", // FULL | PARTIAL
    status: "APPROVED", // APPROVED | PENDING | REJECTED | PROCESSING
    originalFare: 15400,
    penalty: 1800,
    refundAmount: 13600,
    refundMode: "UPI", // UPI | BANK | CARD | WALLET
    referenceNo: "RFND20251125001",
  },
  {
    id: 2,
    bookingDate: "2025-11-18",
    cancelDate: "2025-11-19",
    refundDate: "2025-11-21",
    pnr: "ZX98PQ",
    airline: "Emirates",
    flightNo: "EK 511",
    from: "DEL",
    to: "DXB",
    paxName: "Ananya Verma",
    paxCount: 2,
    refundType: "PARTIAL",
    status: "PENDING",
    originalFare: 42800,
    penalty: 5200,
    refundAmount: 37600,
    refundMode: "BANK",
    referenceNo: "RFND20251121009",
  },
  {
    id: 3,
    bookingDate: "2025-11-15",
    cancelDate: "2025-11-16",
    refundDate: "2025-11-18",
    pnr: "KL55MN",
    airline: "IndiGo",
    flightNo: "6E 211",
    from: "BOM",
    to: "DEL",
    paxName: "Sanjeet Kunal",
    paxCount: 1,
    refundType: "FULL",
    status: "REJECTED",
    originalFare: 5400,
    penalty: 5400,
    refundAmount: 0,
    refundMode: "CARD",
    referenceNo: "RFND20251118003",
  },
];

function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function RefundReport() {
  const todayISO = new Date().toISOString().slice(0, 10);

  // Filters
  const [fromDate, setFromDate] = useState("2025-11-01"); // Refund From
  const [toDate, setToDate] = useState(todayISO);         // Refund To
  const [status, setStatus] = useState("ALL");            // ALL | APPROVED | PENDING | REJECTED | PROCESSING
  const [refundType, setRefundType] = useState("ALL");    // ALL | FULL | PARTIAL
  const [airline, setAirline] = useState("ALL");
  const [mode, setMode] = useState("ALL");                // ALL | UPI | BANK | CARD | WALLET
  const [search, setSearch] = useState("");

  // Airline list
  const airlineOptions = useMemo(() => {
    const set = new Set();
    SAMPLE_REFUND_REPORT.forEach((r) => set.add(r.airline));
    return Array.from(set);
  }, []);

  // Filtered data
  const filtered = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return SAMPLE_REFUND_REPORT.filter((r) => {
      // filter on refundDate
      if (from || to) {
        const d = new Date(r.refundDate);
        if (from && d < from) return false;
        if (to && d > to) return false;
      }

      if (status !== "ALL" && r.status !== status) return false;
      if (refundType !== "ALL" && r.refundType !== refundType) return false;
      if (airline !== "ALL" && r.airline !== airline) return false;
      if (mode !== "ALL" && r.refundMode !== mode) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = (
          r.pnr +
          " " +
          r.paxName +
          " " +
          r.from +
          " " +
          r.to +
          " " +
          r.flightNo +
          " " +
          r.referenceNo
        ).toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [fromDate, toDate, status, refundType, airline, mode, search]);

  // Summary
  const summary = useMemo(() => {
    const totalRequests = filtered.length;
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let processing = 0;
    let totalRefund = 0;
    let totalPenalty = 0;

    filtered.forEach((r) => {
      if (r.status === "APPROVED") approved++;
      if (r.status === "PENDING") pending++;
      if (r.status === "REJECTED") rejected++;
      if (r.status === "PROCESSING") processing++;
      totalRefund += r.refundAmount;
      totalPenalty += r.penalty;
    });

    return {
      totalRequests,
      approved,
      pending,
      rejected,
      processing,
      totalRefund,
      totalPenalty,
    };
  }, [filtered]);

  const handleExport = () => {
    alert("Refund export (CSV/Excel) yahan implement kar sakte ho.");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-0 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Refund Report
            </h1>
            <p className="text-xs text-slate-500">
              Cancelled tickets ka refund status, penalty & refunded amount ek hi view me.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              ⬇️ Export (CSV/Excel)
            </button>
            <button className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">
              📄 Print View
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filters
            </div>
            <button
              onClick={() => {
                setFromDate("2025-11-01");
                setToDate(todayISO);
                setStatus("ALL");
                setRefundType("ALL");
                setAirline("ALL");
                setMode("ALL");
                setSearch("");
              }}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
            >
              Reset
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6 text-[11px]">
            {/* Refund From */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Refund From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Refund To */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Refund To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Refund Type */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Refund Type
              </label>
              <select
                value={refundType}
                onChange={(e) => setRefundType(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="FULL">Full Refund</option>
                <option value="PARTIAL">Partial Refund</option>
              </select>
            </div>

            {/* Airline */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Airline
              </label>
              <select
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                {airlineOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Refund Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="UPI">UPI</option>
                <option value="BANK">Bank Transfer</option>
                <option value="CARD">Card</option>
                <option value="WALLET">Wallet</option>
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Search (PNR / Passenger / Route / Ref No)
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. AB12CD / Rahul / DEL BOM / RFND2025..."
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Total Requests
            </div>
            <div className="mt-1 text-xl font-semibold text-slate-800">
              {summary.totalRequests}
            </div>
          </div>

          <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-emerald-700">
              Approved
            </div>
            <div className="mt-1 text-xl font-semibold text-emerald-900">
              {summary.approved}
            </div>
          </div>

          <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-amber-700">
              Pending / Processing
            </div>
            <div className="mt-1 text-xl font-semibold text-amber-900">
              {summary.pending + summary.processing}
            </div>
          </div>

          <div className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-rose-700">
              Rejected
            </div>
            <div className="mt-1 text-xl font-semibold text-rose-900">
              {summary.rejected}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Net Refund vs Penalty
            </div>
            <div className="mt-1 text-base font-semibold text-slate-900">
              {formatINR(summary.totalRefund)}
            </div>
            <div className="text-[10px] text-slate-400">
              Penalty: {formatINR(summary.totalPenalty)}
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-[11px] text-slate-500">
            <div>
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filtered.length}
              </span>{" "}
              records
            </div>
            <div className="text-[10px]">
              Refund date between{" "}
              <span className="font-medium">{fromDate || "start"}</span> to{" "}
              <span className="font-medium">{toDate || "end"}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-[11px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 text-left">Refund Date</th>
                  <th className="px-3 py-2 text-left">Booking / Cancel</th>
                  <th className="px-3 py-2 text-left">PNR</th>
                  <th className="px-3 py-2 text-left">Route</th>
                  <th className="px-3 py-2 text-left">Pax</th>
                  <th className="px-3 py-2 text-left">Airline</th>
                  <th className="px-3 py-2 text-left">Refund Type</th>
                  <th className="px-3 py-2 text-right">Original</th>
                  <th className="px-3 py-2 text-right">Penalty</th>
                  <th className="px-3 py-2 text-right">Refund Amt</th>
                  <th className="px-3 py-2 text-left">Mode</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Ref No.</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    <td className="px-3 py-2">
                      {r.refundDate}
                      <div className="text-[10px] text-slate-400">
                        #{r.id}
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      {r.bookingDate}
                      <div className="text-[10px] text-slate-400">
                        Cancel: {r.cancelDate}
                      </div>
                    </td>

                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {r.pnr}
                      <div className="text-[10px] text-slate-400">
                        {r.flightNo}
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      {r.from} → {r.to}
                      <div className="text-[10px] text-slate-400">
                        {r.paxName}
                      </div>
                    </td>

                    <td className="px-3 py-2">{r.paxCount}</td>

                    <td className="px-3 py-2">{r.airline}</td>

                    <td className="px-3 py-2">
                      {r.refundType === "FULL" ? "Full Refund" : "Partial"}
                    </td>

                    <td className="px-3 py-2 text-right">
                      {formatINR(r.originalFare)}
                    </td>

                    <td className="px-3 py-2 text-right text-rose-700">
                      {formatINR(r.penalty)}
                    </td>

                    <td className="px-3 py-2 text-right font-semibold text-emerald-800">
                      {formatINR(r.refundAmount)}
                    </td>

                    <td className="px-3 py-2">
                      {r.refundMode === "BANK"
                        ? "Bank Transfer"
                        : r.refundMode === "CARD"
                        ? "Card"
                        : r.refundMode === "WALLET"
                        ? "Wallet"
                        : "UPI"}
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          r.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <div className="font-mono text-[10px] text-slate-700">
                        {r.referenceNo}
                      </div>
                    </td>

                    <td className="px-3 py-2 text-right">
                      <button className="mr-1 rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100">
                        View
                      </button>
                      <button className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100">
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={14}
                      className="px-3 py-6 text-center text-xs text-slate-400"
                    >
                      No refund records found for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer (future pagination) */}
          <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
            <div>Static demo data. Baad me API + pagination aayega.</div>
            <div>Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
