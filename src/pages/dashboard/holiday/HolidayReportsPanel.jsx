// src/pages/dashboard/holiday/HolidayReportsPanel.jsx
import React from "react";

export default function HolidayReportsPanel() {
  const items = [
    {
      id: 1,
      title: "Lead Conversion Report",
      desc: "Kitne leads enquiry se confirmed trip tak gaye.",
      link: "/dashboard/holiday-accounts/profit",
    },
    {
      id: 2,
      title: "Package Profitability",
      desc: "Package wise margin & commission.",
      link: "/dashboard/holiday-accounts/ledger",
    },
  ];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold text-slate-800 text-sm">
          Holiday Reports Snapshot
        </div>
      </div>
      <div className="space-y-2">
        {items.map((r) => (
          <a
            href={r.link}
            key={r.id}
            className="block rounded-md border border-slate-100 bg-slate-50 px-3 py-2 hover:border-slate-300 hover:bg-slate-100"
          >
            <div className="text-[13px] font-semibold text-slate-800">
              {r.title}
            </div>
            <div className="text-[11px] text-slate-500">{r.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
