// src/pages/dashboard/shared/RecentActivity.jsx
import React from "react";

export default function RecentActivity({ moduleLabel, items }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          Recent {moduleLabel} Activity
        </h2>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
          View all
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
          >
            <div>
              <div className="font-medium text-slate-800">{item.title}</div>
              <div className="text-xs text-slate-500">{item.subtitle}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-800">
                {item.meta}
              </div>
              <div className="mt-1">
                <span className="inline-flex rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold text-slate-50">
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-400">
            No data yet. Start by using one of the quick actions above.
          </div>
        )}
      </div>
    </div>
  );
}
