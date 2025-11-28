// src/pages/dashboard/DashboardPage.jsx
import React, { useState } from "react";
import ModuleTabs from "./shared/ModuleTabs";

import FlightDashboard from "./flight/FlightDashboard";
import HotelDashboard from "./hotel/HotelDashboard";
import BusDashboard from "./bus/BusDashboard";
import HolidayDashboard from "./holiday/HolidayDashboard";

export default function DashboardPage() {
  const [module, setModule] = useState("flight"); // "flight" | "hotel" | "bus" | "holiday"

  const renderModule = () => {
    switch (module) {
      case "hotel":
        return <HotelDashboard />;
      case "bus":
        return <BusDashboard />;
      case "holiday":
        return <HolidayDashboard />;
      case "flight":
      default:
        return <FlightDashboard />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-0 py-6">
        {/* Top bar */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Smart Travel Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Manage Flights, Hotels, Buses & Holiday packages from one screen.
            </p>
          </div>

          <ModuleTabs activeModule={module} onChange={setModule} />
        </div>

        {/* Active module body */}
        {renderModule()}
      </div>
    </div>
  );
}
