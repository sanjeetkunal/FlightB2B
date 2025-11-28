// src/pages/dashboard/shared/QuickActions.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function toneToClasses(tone) {
  switch (tone) {
    case "primary":
      return "border-sky-100 bg-sky-50 text-sky-900 hover:bg-sky-100";
    case "warning":
      return "border-amber-100 bg-amber-50 text-amber-900 hover:bg-amber-100";
    case "success":
      return "border-emerald-100 bg-emerald-50 text-emerald-900 hover:bg-emerald-100";
    case "neutral":
    default:
      return "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100";
  }
}

export default function QuickActions({ moduleLabel, actions }) {
  const navigate = useNavigate();

  const handleClick = (action) => {
    if (action.path) navigate(action.path);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          Quick Actions ({moduleLabel})
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleClick(action)}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm font-medium ${toneToClasses(
              action.tone
            )}`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg">
              {action.icon}
            </span>
            <span>
              {action.label}
              <div className="text-xs font-normal opacity-80">
                {action.sub}
              </div>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
