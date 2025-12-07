// src/pages/dashboard/wallet/WalletHistory.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const SAMPLE_TXN = [
  {
    id: 1,
    date: "2025-11-28",
    time: "10:22",
    type: "CREDIT",
    category: "TOPUP",
    ref: "TXN-88921",
    amount: 10000,
    status: "SUCCESS",
  },
  {
    id: 2,
    date: "2025-11-27",
    time: "18:10",
    type: "DEBIT",
    category: "FLIGHT_BOOKING",
    ref: "PNR-AB12CD",
    amount: 5400,
    status: "SUCCESS",
  },
  {
    id: 3,
    date: "2025-11-26",
    time: "12:40",
    type: "DEBIT",
    category: "HOLD_BLOCK",
    ref: "HOLD-7721",
    amount: 12000,
    status: "HOLD",
  },
];

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function WalletHistory() {
  const nav = useNavigate();
  const [type, setType] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    return Array.from(new Set(SAMPLE_TXN.map((t) => t.category)));
  }, []);

  const filtered = useMemo(() => {
    return SAMPLE_TXN.filter((t) => {
      if (type !== "ALL" && t.type !== type) return false;
      if (category !== "ALL" && t.category !== category) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const h = `${t.ref} ${t.category} ${t.type}`.toLowerCase();
        if (!h.includes(q)) return false;
      }
      return true;
    });
  }, [type, category, search]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Wallet History
            </h1>
            <p className="text-xs text-slate-500">
              Credits, debits, holds, booking deductions — all in one ledger.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => nav("/admin/wallet/statement")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Download Statement
            </button>
            <button
              onClick={() => nav(-1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px]"
              >
                <option value="ALL">All</option>
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px]"
              >
                <option value="ALL">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500">
                Search Ref / Category
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="PNR / TXN / HOLD"
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 text-[11px] text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> transactions
            </div>
            <div>Demo ledger (API-ready)</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-50">
                <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2 text-left">Date/Time</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Reference</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">
                      {t.date} <span className="text-slate-400">·</span> {t.time}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 font-semibold ${
                        t.type === "CREDIT"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">{t.category}</td>
                    <td className="px-4 py-2 font-semibold text-slate-800">{t.ref}</td>
                    <td className="px-4 py-2 text-right">{formatINR(t.amount)}</td>
                    <td className="px-4 py-2">{t.status}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
