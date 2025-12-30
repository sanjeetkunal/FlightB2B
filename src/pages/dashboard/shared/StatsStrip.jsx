// src/pages/dashboard/shared/StatsStrip.jsx
import React from "react";

export default function StatsStrip({ stats }) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {s.label}
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-800">
            {s.value}
          </div>
          <div className="mt-1 text-xs text-slate-500">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}
