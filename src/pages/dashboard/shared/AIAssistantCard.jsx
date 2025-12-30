// src/pages/dashboard/shared/AIAssistantCard.jsx
import React from "react";

export default function AIAssistantCard({ title, placeholderQuestion }) {
  return (
    <div className="rounded-md border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 shadow-lg text-slate-50">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">
            AI Assistant
          </div>
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700/80 text-lg">
          🤖
        </div>
      </div>

      <p className="mb-3 text-xs text-slate-300">
        Ask AI to help you with routing, best fares, hotel suggestions or to
        design a perfect holiday itinerary for your customer.
      </p>

      <div className="rounded-md bg-slate-900/70 p-3 text-xs text-slate-300">
        <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">
          Example question
        </div>
        <div className="text-[11px] italic text-slate-200">
          “{placeholderQuestion}”
        </div>
      </div>

      <button className="mt-4 w-full rounded-md bg-sky-500 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-sky-400">
        Open AI Chat (coming soon)
      </button>
    </div>
  );
}
