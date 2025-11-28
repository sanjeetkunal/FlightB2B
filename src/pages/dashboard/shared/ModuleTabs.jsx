// src/pages/dashboard/shared/ModuleTabs.jsx
import React from "react";

const MODULES = {
  flight: { label: "Flight", icon: "✈️" },
  hotel: { label: "Hotel", icon: "🏨" },
  bus: { label: "Bus", icon: "🚌" },
  holiday: { label: "Holidays AI", icon: "🎒" },
};

export default function ModuleTabs({ activeModule, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 p-1 text-xs text-slate-100 shadow-lg">
      {Object.entries(MODULES).map(([key, meta]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition ${
            activeModule === key
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-200 hover:bg-slate-800/70"
          }`}
        >
          <span className="text-base">{meta.icon}</span>
          <span className="hidden sm:inline">{meta.label}</span>
        </button>
      ))}
    </div>
  );
}
