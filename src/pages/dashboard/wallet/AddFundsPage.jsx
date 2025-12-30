// src/pages/dashboard/wallet/AddFundsPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const METHODS = [
  { key: "UPI", label: "UPI" },
  { key: "BANK", label: "Bank Transfer" },
  { key: "CARD", label: "Debit/Credit Card" },
];

export default function AddFundsPage() {
  const nav = useNavigate();
  const [amount, setAmount] = useState(5000);
  const [method, setMethod] = useState("UPI");
  const [refId, setRefId] = useState("");

  const submit = () => {
    // ✅ Later integrate real payment/topup API
    console.log("ADD FUNDS", { amount, method, refId });
    alert("Demo: Add funds initiated.");
    nav("/admin/wallet");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Add Funds</h1>
            <p className="text-xs text-slate-500">
              B2B agent wallet top-up with audit-friendly reference.
            </p>
          </div>
          <button
            onClick={() => nav(-1)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-600">
              Amount (₹)
            </label>
            <input
              type="number"
              min={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value || 0))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {[2000, 5000, 10000, 25000].map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ₹{a.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600">
              Payment Method
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold border ${
                    method === m.key
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600">
              Reference / Remark (optional)
            </label>
            <input
              value={refId}
              onChange={(e) => setRefId(e.target.value)}
              placeholder="UTR / UPI Ref / Internal note"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => nav("/admin/wallet")}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Proceed to Add Funds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
