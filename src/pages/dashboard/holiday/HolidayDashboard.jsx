// src/pages/dashboard/holiday/HolidayDashboard.jsx
import React from "react";
import StatsStrip from "../shared/StatsStrip";
import WorkspacePanel from "../shared/WorkspacePanel";
import QuickActions from "../shared/QuickActions";
import RecentActivity from "../shared/RecentActivity";
import AIAssistantCard from "../shared/AIAssistantCard";

import HolidayReportsPanel from "./HolidayReportsPanel";
import {
  holidayMeta,
  holidayStats,
  holidayQuickActions,
  holidayRecent,
  holidayWorkspaceSections,
  holidayAiTitle,
  holidayAiPlaceholder,
} from "./holidayConfig";

export default function HolidayDashboard() {
  return (
    <>
      <div
        className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${holidayMeta.color}`}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px]">
          {holidayMeta.icon}
        </span>
        <span className="font-semibold">{holidayMeta.label}</span>
        <span className="text-[11px] opacity-75">• {holidayMeta.sub}</span>
      </div>

      <StatsStrip stats={holidayStats} />

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <WorkspacePanel
          title="Holiday Workspace"
          subtitle="Packages, leads & profitability"
          icon={holidayMeta.icon}
          sections={holidayWorkspaceSections}
        />

        <div className="order-3 space-y-4 lg:order-2">
          <QuickActions
            moduleLabel={holidayMeta.label}
            actions={holidayQuickActions}
          />
          <RecentActivity
            moduleLabel={holidayMeta.label}
            items={holidayRecent}
          />
          <HolidayReportsPanel />
        </div>

        <div className="order-2 space-y-4 lg:order-3">
          <AIAssistantCard
            title={holidayAiTitle}
            placeholderQuestion={holidayAiPlaceholder}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm">
            Yahin se aap AI se itinerary, inclusions, exclusions, pricing note
            aur WhatsApp message sab bana sakte ho.
          </div>
        </div>
      </div>
    </>
  );
}
