// src/pages/dashboard/bus/BusReportsPanel.jsx
import React from "react";

export default function BusReportsPanel() {
  const items = [
    {
      id: 1,
      title: "Today Bus Bookings",
      desc: "Aaj ke sabhi confirmed & cancelled bus bookings.",
      link: "/dashboard/bus/bookings",
    },
    {
      id: 2,
      title: "Bus Sales Summary",
      desc: "Route wise sale & commission details.",
      link: "/dashboard/bus-accounts/sale-register",
    },
  ];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold text-slate-800 text-sm">
          Bus Reports Snapshot
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
