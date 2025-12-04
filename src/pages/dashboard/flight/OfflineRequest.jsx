// src/pages/dashboard/flight/OfflineRequest.jsx
import React, { useMemo, useState } from "react";

const SAMPLE_OFFLINE_REQUESTS = [
  {
    id: 1001,
    createdAt: "2025-11-25 10:15",
    updatedAt: "2025-11-25 11:05",
    reqNo: "OFF-2025-0001",
    type: "FARE_QUOTE", // FARE_QUOTE | DATE_CHANGE | REFUND | CANCELLATION | GROUP | OTHER
    priority: "NORMAL", // NORMAL | HIGH | URGENT
    status: "OPEN", // OPEN | INPROGRESS | WAITING_AIRLINE | CLOSED | REJECTED
    pnr: "",
    airline: "Vistara",
    sector: "DEL-BOM",
    travelDate: "2025-12-05",
    paxName: "Rahul Sharma",
    channel: "PORTAL", // PORTAL | EMAIL | WHATSAPP | CALL
    agentRemark: "Need best economy return fare for DEL-BOM-DEL.",
    backofficeRemark: "Checking corporate fare, will revert.",
  },
  {
    id: 1002,
    createdAt: "2025-11-24 16:20",
    updatedAt: "2025-11-24 18:10",
    reqNo: "OFF-2025-0002",
    type: "DATE_CHANGE",
    priority: "URGENT",
    status: "INPROGRESS",
    pnr: "AB12CD",
    airline: "Vistara",
    sector: "DEL-BOM",
    travelDate: "2025-12-01",
    paxName: "Sanjeet Kunal",
    channel: "WHATSAPP",
    agentRemark: "Change travel date from 1 Dec to 3 Dec, share penalty.",
    backofficeRemark: "Checking reissue charges with airline.",
  },
  {
    id: 1003,
    createdAt: "2025-11-23 11:00",
    updatedAt: "2025-11-23 13:30",
    reqNo: "OFF-2025-0003",
    type: "REFUND",
    priority: "NORMAL",
    status: "WAITING_AIRLINE",
    pnr: "ZX98PQ",
    airline: "Emirates",
    sector: "DEL-DXB",
    travelDate: "2025-11-25",
    paxName: "Ananya Verma",
    channel: "EMAIL",
    agentRemark: "Apply full refund due to medical reason.",
    backofficeRemark: "Refund submitted to airline, awaiting response.",
  },
  {
    id: 1004,
    createdAt: "2025-11-22 09:45",
    updatedAt: "2025-11-22 12:00",
    reqNo: "OFF-2025-0004",
    type: "GROUP",
    priority: "HIGH",
    status: "CLOSED",
    pnr: "",
    airline: "IndiGo",
    sector: "DEL-GOI",
    travelDate: "2025-12-20",
    paxName: "Group of 18 pax",
    channel: "PORTAL",
    agentRemark: "Group fare required ex-DEL for GOA, 2 nights.",
    backofficeRemark: "Quote shared & confirmed via email.",
  },
];

export default function OfflineRequest() {
  const todayISO = new Date().toISOString().slice(0, 10);

  // Filters
  const [fromDate, setFromDate] = useState("2025-11-20");
  const [toDate, setToDate] = useState(todayISO);
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [channel, setChannel] = useState("ALL");
  const [search, setSearch] = useState("");

  // New request form
  const [reqType, setReqType] = useState("FARE_QUOTE");
  const [reqPriority, setReqPriority] = useState("NORMAL");
  const [reqPnr, setReqPnr] = useState("");
  const [reqAirline, setReqAirline] = useState("");
  const [reqSector, setReqSector] = useState("");
  const [reqTravelDate, setReqTravelDate] = useState("");
  const [reqPaxName, setReqPaxName] = useState("");
  const [reqRemark, setReqRemark] = useState("");
  const [attachmentName, setAttachmentName] = useState("");

  const [toast, setToast] = useState(null);

  const showToast = (msg, tone = "success") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return SAMPLE_OFFLINE_REQUESTS.filter((r) => {
      if (from || to) {
        const created = new Date(r.createdAt.slice(0, 10));
        if (from && created < from) return false;
        if (to && created > to) return false;
      }

      if (status !== "ALL" && r.status !== status) return false;
      if (type !== "ALL" && r.type !== type) return false;
      if (priority !== "ALL" && r.priority !== priority) return false;
      if (channel !== "ALL" && r.channel !== channel) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = (
          r.reqNo +
          " " +
          r.pnr +
          " " +
          r.paxName +
          " " +
          r.airline +
          " " +
          r.sector
        ).toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [fromDate, toDate, status, type, priority, channel, search]);

  const summary = useMemo(() => {
    const total = filtered.length;
    let open = 0;
    let inprogress = 0;
    let waiting = 0;
    let closed = 0;
    let rejected = 0;
    let urgent = 0;

    filtered.forEach((r) => {
      if (r.status === "OPEN") open++;
      if (r.status === "INPROGRESS") inprogress++;
      if (r.status === "WAITING_AIRLINE") waiting++;
      if (r.status === "CLOSED") closed++;
      if (r.status === "REJECTED") rejected++;
      if (r.priority === "URGENT") urgent++;
    });

    return { total, open, inprogress, waiting, closed, rejected, urgent };
  }, [filtered]);

  const handleCreateRequest = () => {
    if (!reqType || !reqRemark.trim()) {
      showToast("Request type & remarks required hai.", "error");
      return;
    }

    // basic validation – if date change / refund / cancellation then PNR recommended
    if (
      (reqType === "DATE_CHANGE" ||
        reqType === "REFUND" ||
        reqType === "CANCELLATION") &&
      !reqPnr.trim()
    ) {
      showToast("Date change / refund / cancellation ke liye PNR daalo.", "error");
      return;
    }

    console.log("New offline request (demo):", {
      reqType,
      reqPriority,
      reqPnr,
      reqAirline,
      reqSector,
      reqTravelDate,
      reqPaxName,
      reqRemark,
      attachmentName,
    });

    showToast("Offline request submit ho gayi (demo).", "success");

    setReqPnr("");
    setReqAirline("");
    setReqSector("");
    setReqTravelDate("");
    setReqPaxName("");
    setReqRemark("");
    setAttachmentName("");
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-20 z-20 rounded-lg px-3 py-2 text-xs shadow-md ${
            toast.tone === "success"
              ? "bg-emerald-600 text-white"
              : toast.tone === "error"
              ? "bg-rose-600 text-white"
              : "bg-slate-800 text-slate-50"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-0 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Offline Request
            </h1>
            <p className="text-xs text-slate-500">
              Date change, refund, fare quote, group booking jaisi manual
              requests yahan se raise & track karo.
            </p>
          </div>
          <div className="flex gap-2 text-[11px]">
            <div className="flex items-center gap-1 rounded-full bg-slate-900/90 px-3 py-1 text-slate-50">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span>Backoffice SLA: 30–90 mins (demo)</span>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5 text-[11px]">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Total Requests
            </div>
            <div className="mt-1 text-xl font-semibold text-slate-800">
              {summary.total}
            </div>
            <div className="text-[10px] text-slate-400">
              Open: {summary.open} • Closed: {summary.closed}
            </div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-amber-700">
              In Progress / Waiting Airline
            </div>
            <div className="mt-1 text-xl font-semibold text-amber-900">
              {summary.inprogress + summary.waiting}
            </div>
            <div className="text-[10px] text-amber-800">
              In Progress: {summary.inprogress} • Waiting: {summary.waiting}
            </div>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-rose-700">
              Rejected
            </div>
            <div className="mt-1 text-xl font-semibold text-rose-900">
              {summary.rejected}
            </div>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-red-700">
              Urgent Requests
            </div>
            <div className="mt-1 text-xl font-semibold text-red-900">
              {summary.urgent}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Quick Shortcuts
            </div>
            <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
              <span className="rounded-full bg-slate-100 px-2 py-0.5">
                Date Change
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5">
                Refund
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5">
                Group Fare
              </span>
            </div>
          </div>
        </div>

        {/* New request + filters */}
        <div className="mb-4 grid gap-4 lg:grid-cols-3">
          {/* Left: New offline request form */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-[11px]">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                New Offline Request
              </div>
              <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[9px] text-slate-500">
                Ticketing queue me chale jayega (demo)
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {/* Request Type */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Request Type <span className="text-rose-600">*</span>
                </label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="FARE_QUOTE">Fare Quote</option>
                  <option value="DATE_CHANGE">Date Change</option>
                  <option value="REFUND">Refund</option>
                  <option value="CANCELLATION">Cancellation</option>
                  <option value="GROUP">Group Fare</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Priority
                </label>
                <select
                  value={reqPriority}
                  onChange={(e) => setReqPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* PNR */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  PNR (optional / required for change/refund)
                </label>
                <input
                  type="text"
                  value={reqPnr}
                  onChange={(e) => setReqPnr(e.target.value.toUpperCase())}
                  placeholder="e.g. AB12CD"
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] uppercase outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Airline */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Airline
                </label>
                <input
                  type="text"
                  value={reqAirline}
                  onChange={(e) => setReqAirline(e.target.value)}
                  placeholder="e.g. Vistara / Emirates"
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Sector */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Sector
                </label>
                <input
                  type="text"
                  value={reqSector}
                  onChange={(e) => setReqSector(e.target.value.toUpperCase())}
                  placeholder="e.g. DEL-BOM"
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] uppercase outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Travel Date */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Travel Date
                </label>
                <input
                  type="date"
                  value={reqTravelDate}
                  onChange={(e) => setReqTravelDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Pax name */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Passenger / Group Name
                </label>
                <input
                  type="text"
                  value={reqPaxName}
                  onChange={(e) => setReqPaxName(e.target.value)}
                  placeholder="e.g. Rahul Sharma / Group of 10"
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Attachment */}
              <div className="md:col-span-3">
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Attachment (ticket / medical / approval – optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAttachmentName(file.name);
                        showToast("Demo: attachment select ho gaya.", "info");
                      } else {
                        setAttachmentName("");
                      }
                    }}
                    className="text-[10px]"
                  />
                  {attachmentName && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{attachmentName}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div className="md:col-span-3">
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Request Details / Remarks{" "}
                  <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={reqRemark}
                  onChange={(e) => setReqRemark(e.target.value)}
                  rows={3}
                  placeholder="Example: Please share lowest refundable fare for DEL-BOM-DEL, travel between 3–7 Dec, 2 adults, 1 child. Or explain clearly what you need support for."
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setReqType("FARE_QUOTE");
                  setReqPriority("NORMAL");
                  setReqPnr("");
                  setReqAirline("");
                  setReqSector("");
                  setReqTravelDate("");
                  setReqPaxName("");
                  setReqRemark("");
                  setAttachmentName("");
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleCreateRequest}
                className="rounded-lg bg-slate-900 px-4 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800"
              >
                🚀 Submit Offline Request
              </button>
            </div>
          </div>

          {/* Right: Filters panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-[11px]">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Filter Requests
              </div>
              <button
                onClick={() => {
                  setFromDate("2025-11-20");
                  setToDate(todayISO);
                  setStatus("ALL");
                  setType("ALL");
                  setPriority("ALL");
                  setChannel("ALL");
                  setSearch("");
                }}
                className="text-[10px] font-medium text-blue-600 hover:text-blue-700"
              >
                Reset
              </button>
            </div>

            <div className="space-y-2">
              {/* Date range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">
                    Created From
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[10px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">
                    Created To
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[10px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[10px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="ALL">All</option>
                  <option value="OPEN">Open</option>
                  <option value="INPROGRESS">In Progress</option>
                  <option value="WAITING_AIRLINE">Waiting Airline</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[10px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="ALL">All</option>
                  <option value="FARE_QUOTE">Fare Quote</option>
                  <option value="DATE_CHANGE">Date Change</option>
                  <option value="REFUND">Refund</option>
                  <option value="CANCELLATION">Cancellation</option>
                  <option value="GROUP">Group</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[10px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="ALL">All</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Channel */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[10px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="ALL">All</option>
                  <option value="PORTAL">Portal</option>
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="CALL">Call</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">
                  Search (Req No / PNR / Pax / Airline)
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. OFF-2025 / AB12CD / Rahul / Vistara"
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[10px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Requests table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-[11px] text-slate-500">
            <div>
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filtered.length}
              </span>{" "}
              request(s)
            </div>
            <div className="text-[10px]">
              Created between{" "}
              <span className="font-medium">{fromDate || "start"}</span> to{" "}
              <span className="font-medium">{toDate || "end"}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-[11px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 text-left">Request</th>
                  <th className="px-3 py-2 text-left">Type / Priority</th>
                  <th className="px-3 py-2 text-left">PNR / Pax</th>
                  <th className="px-3 py-2 text-left">Airline / Sector</th>
                  <th className="px-3 py-2 text-left">Travel</th>
                  <th className="px-3 py-2 text-left">Channel</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Remarks</th>
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
                      <div className="font-semibold text-slate-800">
                        {r.reqNo}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Created: {r.createdAt}
                        <br />
                        Updated: {r.updatedAt}
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <div className="text-[10px] font-medium text-slate-800">
                        {r.type
                          .replace("_", " ")
                          .toLowerCase()
                          .replace(/^\w/, (c) => c.toUpperCase())}
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                            r.priority === "URGENT"
                              ? "bg-red-100 text-red-800"
                              : r.priority === "HIGH"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {r.priority}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      {r.pnr || "-"}
                      <div className="text-[10px] text-slate-400">
                        {r.paxName}
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      {r.airline || "-"}
                      <div className="text-[10px] text-slate-400">
                        {r.sector || "-"}
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      {r.travelDate || "-"}
                    </td>

                    <td className="px-3 py-2">
                      <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[9px] uppercase text-slate-600">
                        {r.channel}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          r.status === "OPEN"
                            ? "bg-sky-100 text-sky-800"
                            : r.status === "INPROGRESS"
                            ? "bg-amber-100 text-amber-800"
                            : r.status === "WAITING_AIRLINE"
                            ? "bg-purple-100 text-purple-800"
                            : r.status === "CLOSED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {r.status
                          .toLowerCase()
                          .replace("_", " ")
                          .replace(/^\w/, (c) => c.toUpperCase())}
                      </span>
                    </td>

                    <td className="px-3 py-2 max-w-[260px]">
                      <div className="text-[10px] text-slate-600 line-clamp-2">
                        A: {r.agentRemark}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2">
                        B/O: {r.backofficeRemark}
                      </div>
                    </td>

                    <td className="px-3 py-2 text-right">
                      <button className="mr-1 rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100">
                        View
                      </button>
                      {r.status !== "CLOSED" && (
                        <button className="mr-1 rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100">
                          Add Note
                        </button>
                      )}
                      {r.status === "OPEN" && (
                        <button className="rounded-full border border-emerald-300 px-2 py-0.5 text-[10px] text-emerald-700 hover:bg-emerald-50">
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-6 text-center text-xs text-slate-400"
                    >
                      No offline requests found for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
            <div>Static demo data. Real project me yahan API + pagination aayega.</div>
            <div>Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
