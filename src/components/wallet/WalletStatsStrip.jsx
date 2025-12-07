// src/components/wallet/WalletStatsStrip.jsx
import React from "react";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function WalletStatsStrip({ wallet }) {
  const {
    balance = 0,
    creditLimit = 0,
    holdAmount = 0,
    availableToSpend = 0,
  } = wallet || {};

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Tile label="Available Balance" value={formatINR(balance)} />
      <Tile label="Credit Limit" value={formatINR(creditLimit)} />
      <Tile label="Hold Amount" value={formatINR(holdAmount)} />
      <Tile
        label="Spendable (Balance + Credit - Hold)"
        value={formatINR(availableToSpend)}
        highlighted
      />
    </div>
  );
}

function Tile({ label, value, highlighted }) {
  return (
    <div
      className={`rounded-xl border shadow-sm px-4 py-3 ${
        highlighted
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className={`text-[10px] uppercase tracking-wide ${highlighted ? "text-white/70" : "text-slate-500"}`}>
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
