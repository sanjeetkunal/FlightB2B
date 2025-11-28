// src/pages/dashboard/flight/FlightDashboard.jsx
import React from "react";

import StatsStrip from "../shared/StatsStrip";
import WorkspacePanel from "../shared/WorkspacePanel";
import QuickActions from "../shared/QuickActions";
import RecentActivity from "../shared/RecentActivity";
import AIAssistantCard from "../shared/AIAssistantCard";

import FlightReportsPanel from "./FlightReportsPanel";
import {
  flightMeta,
  flightStats,
  flightQuickActions,
  flightRecent,
  flightWorkspaceSections,
  flightAiTitle,
  flightAiPlaceholder,
} from "./flightConfig";

export default function FlightDashboard() {
  return (
    <>
      {/* Active module chip */}
      <div
        className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${flightMeta.color}`}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px]">
          {flightMeta.icon}
        </span>
        <span className="font-semibold">{flightMeta.label}</span>
        <span className="text-[11px] opacity-75">• {flightMeta.sub}</span>
      </div>

      <StatsStrip stats={flightStats} />

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {/* Left: workspace */}
        <WorkspacePanel
          title="Flight Workspace"
          subtitle="Quick sections for flight module"
          icon={flightMeta.icon}
          sections={flightWorkspaceSections}
        />

        {/* Center: quick actions + recent + reports snapshot */}
        <div className="order-3 space-y-4 lg:order-2">
          <QuickActions
            moduleLabel={flightMeta.label}
            actions={flightQuickActions}
          />
          <RecentActivity
            moduleLabel={flightMeta.label}
            items={flightRecent}
          />
          <FlightReportsPanel />
        </div>

        {/* Right: AI assistant */}
        <div className="order-2 space-y-4 lg:order-3">
          <AIAssistantCard
            title={flightAiTitle}
            placeholderQuestion={flightAiPlaceholder}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm">
            <div className="mb-1 text-[11px] font-semibold text-slate-700">
              Tip for you
            </div>
            Flight AI se aap complex routing (multi-city, fare rules, baggage,
            change penalty) ke baare me turant explanation le sakte hain aur
            customer ko WhatsApp pe ek hi baar me clear info bhej sakte hain.
          </div>
        </div>
      </div>
    </>
  );
}
