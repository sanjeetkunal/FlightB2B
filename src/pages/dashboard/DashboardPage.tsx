import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings,
  LifeBuoy,
} from "lucide-react";

import FlightDashboard from "./flight/FlightDashboard";
import HotelDashboard from "./hotel/HotelDashboard";
import BusDashboard from "./bus/BusDashboard";
// import TrainDashboard from "./train/TrainDashboard"; // later

import ModuleTopTabs, { type ModuleKey } from "./shared/ModuleTopTabs";
import DashboardSidebar from "./shared/DashboardSidebar";
import { SidebarItem } from "./shared/DashboardSidebar";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type ViewKey = "dashboard" | "bookings" | "reports" | "settings" | "support";

function moduleLabel(m: ModuleKey) {
  if (m === "flight") return "Flight";
  if (m === "hotel") return "Hotel";
  if (m === "train") return "Train";
  return "Bus";
}

export default function DashboardPage() {
  const nav = useNavigate();

  const [module, setModule] = useState<ModuleKey>("flight");
  const [view, setView] = useState<ViewKey>("dashboard");

  const menu: SidebarItem[] = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard, hint: "Overview & quick actions" },
      { key: "bookings", label: "Bookings", Icon: ClipboardList, hint: "Manage & search bookings" },
      { key: "reports", label: "Reports", Icon: BarChart3, hint: "Exports & reconciliation" },
      { key: "settings", label: "Settings", Icon: Settings, hint: "Markup, preferences, rules" },
      { key: "support", label: "Help & Support", Icon: LifeBuoy, hint: "FAQs, tickets & contact" },
    ],
    []
  );

  const handleModuleChange = (m: ModuleKey) => {
    setModule(m);
    setView("dashboard"); // module switch pe default view
  };

  const goBookings = () => {
    if (module === "flight") return nav("/dashboard/flight/my-bookings");
    // hotel/bus/train routes later
    alert(`${moduleLabel(module)} bookings route connect pending.`);
  };

  const goReports = () => {
    if (module === "flight") return nav("/dashboard/flight/report");
    alert(`${moduleLabel(module)} reports route connect pending.`);
  };

  const goSettings = () => {
    // abhi common settings page
    return nav("/agency-settings");
  };

  const goSupport = () => nav("/help-center");

  const renderDashboard = () => {
    if (module === "hotel") return <HotelDashboard />;
    if (module === "bus") return <BusDashboard />;
    if (module === "train") {
      return (
        <EmptyState
          title="Train Dashboard"
          desc="Train module integration pending. Yahan TrainDashboard attach hoga."
          actionText="Open Help Center"
          onAction={goSupport}
        />
      );
    }
    return <FlightDashboard />;
  };

  const renderRight = () => {
    if (view === "dashboard") return renderDashboard();

    if (view === "bookings") {
      return (
        <EmptyState
          title={`${moduleLabel(module)} Bookings`}
          desc="Yahan module-wise bookings list/manage screen aayega."
          actionText="Open Bookings"
          onAction={goBookings}
        />
      );
    }

    if (view === "reports") {
      return (
        <EmptyState
          title={`${moduleLabel(module)} Reports`}
          desc="Yahan module-wise reports attach honge (FlightReport etc.)."
          actionText="Open Reports"
          onAction={goReports}
        />
      );
    }

    if (view === "settings") {
      return (
        <EmptyState
          title={`${moduleLabel(module)} Settings`}
          desc="Yahan module settings attach honge (Flight/Hotel/Train/Bus Settings)."
          actionText="Open Settings"
          onAction={goSettings}
        />
      );
    }

    if (view === "support") {
      return (
        <EmptyState
          title="Help & Support"
          desc="Help Center + FAQs + raise ticket. Isko tumhare HelpCenter component se replace kar dena."
          actionText="Open Help Center"
          onAction={goSupport}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--surface2)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        {/* Header + Top Tabs */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-[260px]">
            <div className="text-[12px] text-[var(--muted)]">
              Dashboard <span className="opacity-60">/</span> {moduleLabel(module)}
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-semibold">
              Smart Travel Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
              Switch modules and manage bookings, reports, settings and support.
            </p>
          </div>

          <ModuleTopTabs active={module} onChange={handleModuleChange} />
        </div>

        {/* Layout */}
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <DashboardSidebar
            title={`${moduleLabel(module)} Options`}
            subtitle="Select what you want to manage."
            items={menu}
            activeKey={view}
            onSelect={(k) => setView(k as ViewKey)}
            footerTip="Tip: Later yahan role-based menu + permissions add kar dena."
          />

          <main className="min-w-0">{renderRight()}</main>
        </div>
      </div>
    </div>
  );
}

/* Small UI */
function EmptyState({
  title,
  desc,
  actionText,
  onAction,
}: {
  title: string;
  desc: string;
  actionText?: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm p-6">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-[var(--muted)]">{desc}</div>

      {actionText ? (
        <button
          type="button"
          onClick={onAction}
          className={cx(
            "mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold text-white",
            "bg-[var(--primary)] hover:bg-[var(--primaryHover)]"
          )}
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
}
