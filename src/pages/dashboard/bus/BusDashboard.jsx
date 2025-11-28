// src/pages/dashboard/bus/BusDashboard.jsx
import React from "react";
import StatsStrip from "../shared/StatsStrip";
import WorkspacePanel from "../shared/WorkspacePanel";
import QuickActions from "../shared/QuickActions";
import RecentActivity from "../shared/RecentActivity";
import AIAssistantCard from "../shared/AIAssistantCard";

import BusReportsPanel from "./BusReportsPanel";
import {
  busMeta,
  busStats,
  busQuickActions,
  busRecent,
  busWorkspaceSections,
  busAiTitle,
  busAiPlaceholder,
} from "./busConfig";

export default function BusDashboard() {
  return (
    <>
      <div
        className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${busMeta.color}`}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px]">
          {busMeta.icon}
        </span>
        <span className="font-semibold">{busMeta.label}</span>
        <span className="text-[11px] opacity-75">• {busMeta.sub}</span>
      </div>

      <StatsStrip stats={busStats} />

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <WorkspacePanel
          title="Bus Workspace"
          subtitle="Manage bus routes & bookings"
          icon={busMeta.icon}
          sections={busWorkspaceSections}
        />

        <div className="order-3 space-y-4 lg:order-2">
          <QuickActions moduleLabel={busMeta.label} actions={busQuickActions} />
          <RecentActivity moduleLabel={busMeta.label} items={busRecent} />
          <BusReportsPanel />
        </div>

        <div className="order-2 space-y-4 lg:order-3">
          <AIAssistantCard
            title={busAiTitle}
            placeholderQuestion={busAiPlaceholder}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm">
            AI ko route, timing aur sleeper/seater preference dekar customer ke
            liye best option nikalwa sakte ho.
          </div>
        </div>
      </div>
    </>
  );
}
