// src/pages/dashboard/wallet/RefundsAdjustments.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const SAMPLE = [
  {
    id: 1,
    date: "2025-11-22",
    ref: "PNR-KL55MN",
    type: "REFUND",
    amount: 900,
    status: "PROCESSED",
    note: "Airline refund credited",
  },
  {
    id: 2,
    date: "2025-11-25",
    ref: "ADJ-221",
    type: "ADJUSTMENT",
    amount: -200,
    status: "DONE",
    note: "Service fee correction",
  },
];

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function RefundsAdjustments() {
  const nav = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Refunds & Adjustments
            </h1>
            <p className="text-xs text-slate-500">
              Airline refunds, portal adjustments, dispute resolution logs.
            </p>
          </div>
          <button
            onClick={() => nav(-1)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-50">
                <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Reference</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{r.date}</td>
                    <td className="px-4 py-2 font-semibold text-slate-800">
                      {r.ref}
                    </td>
                    <td className="px-4 py-2">{r.type}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={r.amount < 0 ? "text-rose-600 font-semibold" : "text-emerald-700 font-semibold"}>
                        {formatINR(r.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-2">{r.status}</td>
                    <td className="px-4 py-2 text-slate-500">{r.note}</td>
                  </tr>
                ))}
                {SAMPLE.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">
                      No refund/adjustment records.
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
