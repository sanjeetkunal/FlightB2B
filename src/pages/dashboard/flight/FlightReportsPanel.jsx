// src/pages/dashboard/flight/FlightReportsPanel.jsx
import React from "react";

export default function FlightReportsPanel() {
  const items = [
    {
      id: 1,
      title: "Today Ticket Report",
      desc: "All tickets issued today with airline & sector wise breakup.",
      link: "/dashboard/flight/ticket-report",
    },
    {
      id: 2,
      title: "Refund & Reissue Summary",
      desc: "Refunds, reissues & ADMs for current month.",
      link: "/dashboard/flight/refund-report",
    },
    {
      id: 3,
      title: "Domestic vs International Sales",
      desc: "Compare your domestic and international ticket sales.",
      link: "/dashboard/accounts/dom-sale-register",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold text-slate-800 text-sm">
          Flight Reports Snapshot
        </div>
      </div>
      <div className="space-y-2">
        {items.map((r) => (
          <a
            href={r.link}
            key={r.id}
            className="block rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 hover:border-slate-300 hover:bg-slate-100"
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
