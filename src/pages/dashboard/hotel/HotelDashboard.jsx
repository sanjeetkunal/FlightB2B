// src/pages/dashboard/hotel/HotelDashboard.jsx
import React from "react";
import StatsStrip from "../shared/StatsStrip";
import WorkspacePanel from "../shared/WorkspacePanel";
import QuickActions from "../shared/QuickActions";
import RecentActivity from "../shared/RecentActivity";
import AIAssistantCard from "../shared/AIAssistantCard";

import HotelReportsPanel from "./HotelReportsPanel";
import {
  hotelMeta,
  hotelStats,
  hotelQuickActions,
  hotelRecent,
  hotelWorkspaceSections,
  hotelAiTitle,
  hotelAiPlaceholder,
} from "./hotelConfig";

export default function HotelDashboard() {
  return (
    <>
      <div
        className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${hotelMeta.color}`}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px]">
          {hotelMeta.icon}
        </span>
        <span className="font-semibold">{hotelMeta.label}</span>
        <span className="text-[11px] opacity-75">• {hotelMeta.sub}</span>
      </div>

      <StatsStrip stats={hotelStats} />

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <WorkspacePanel
          title="Hotel Workspace"
          subtitle="Manage hotel bookings & accounts"
          icon={hotelMeta.icon}
          sections={hotelWorkspaceSections}
        />

        <div className="order-3 space-y-4 lg:order-2">
          <QuickActions
            moduleLabel={hotelMeta.label}
            actions={hotelQuickActions}
          />
          <RecentActivity moduleLabel={hotelMeta.label} items={hotelRecent} />
          <HotelReportsPanel />
        </div>

        <div className="order-2 space-y-4 lg:order-3">
          <AIAssistantCard
            title={hotelAiTitle}
            placeholderQuestion={hotelAiPlaceholder}
          />
          <div className="rounded-md border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm">
            Smart tip: AI se aap quickly city-wise hotel shortlist kar sakte ho
            with distance from landmark, rating & approx budget.
          </div>
        </div>
      </div>
    </>
  );
}
