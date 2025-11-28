// src/pages/dashboard/hotel/HotelReportsPanel.jsx
import React from "react";

export default function HotelReportsPanel() {
  const items = [
    {
      id: 1,
      title: "Today Check-in Report",
      desc: "Aaj ke saare check-in with guest & voucher details.",
      link: "/dashboard/hotel/today-checkin",
    },
    {
      id: 2,
      title: "Hotel Sale Register",
      desc: "Property / city wise monthly revenue.",
      link: "/dashboard/hotel-accounts/sale-register",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold text-slate-800 text-sm">
          Hotel Reports Snapshot
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
