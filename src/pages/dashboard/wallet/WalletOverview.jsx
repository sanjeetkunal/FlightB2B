// src/pages/dashboard/wallet/WalletOverview.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import WalletStatsStrip from "../../../components/wallet/WalletStatsStrip";

const MOCK_WALLET = {
  balance: 45230,
  currency: "₹",
  creditLimit: 200000,
  holdAmount: 0,
  lowBalanceLimit: 5000,
};

const MOCK_RECENT_TXN = [
  {
    id: 1,
    date: "2025-11-28 10:22",
    type: "CREDIT",
    category: "TOPUP",
    ref: "TXN-88921",
    description: "UPI Top-up",
    amount: 10000,
    closing: 45230,
    status: "SUCCESS",
  },
  {
    id: 2,
    date: "2025-11-27 18:10",
    type: "DEBIT",
    category: "FLIGHT_BOOKING",
    ref: "PNR-AB12CD",
    description: "Booking debit",
    amount: 5400,
    closing: 35230,
    status: "SUCCESS",
  },
];

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function WalletOverview() {
  const nav = useNavigate();

  const summary = useMemo(() => {
    return {
      ...MOCK_WALLET,
      availableToSpend: Math.max(
        0,
        MOCK_WALLET.balance + MOCK_WALLET.creditLimit - MOCK_WALLET.holdAmount
      ),
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Wallet Overview
            </h1>
            <p className="text-xs text-slate-500">
              B2B agents ke liye live balance, credit, holds, top-ups & booking debits.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => nav("/admin/wallet/add-funds")}
              className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              + Add Funds
            </button>
            <button
              onClick={() => nav("/admin/wallet/statement")}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Download Statement
            </button>
          </div>
        </div>

        {/* Stats */}
        <WalletStatsStrip wallet={summary} />

        {/* Quick actions */}
        <div className="grid gap-3 md:grid-cols-3">
          <ActionCard
            title="Wallet History"
            desc="All credits/debits, booking holds, refunds"
            action="Open"
            onClick={() => nav("/admin/wallet/history")}
          />
          <ActionCard
            title="Refunds & Adjustments"
            desc="Airline refunds, portal adjustments, disputes"
            action="Open"
            onClick={() => nav("/admin/wallet/refunds")}
          />
          <ActionCard
            title="Low Balance Rules"
            desc={`Alert threshold: ${formatINR(MOCK_WALLET.lowBalanceLimit)}`}
            action="Manage"
            onClick={() => nav("/admin/agency-settings")}
          />
        </div>

        {/* Recent transactions */}
        <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Recent Transactions
            </div>
            <button
              onClick={() => nav("/admin/wallet/history")}
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-50">
                <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Reference</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-right">Closing</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RECENT_TXN.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{t.date}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 font-semibold ${
                          t.type === "CREDIT"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">{t.category}</td>
                    <td className="px-4 py-2 font-semibold text-slate-800">
                      {t.ref}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatINR(t.amount)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatINR(t.closing)}
                    </td>
                    <td className="px-4 py-2">{t.status}</td>
                  </tr>
                ))}
                {MOCK_RECENT_TXN.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-xs text-slate-400"
                    >
                      No recent transactions.
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

function ActionCard({ title, desc, action, onClick }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{desc}</div>
      <button
        onClick={onClick}
        className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
      >
        {action}
      </button>
    </div>
  );
}
