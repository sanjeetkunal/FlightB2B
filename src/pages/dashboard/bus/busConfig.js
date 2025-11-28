// src/pages/dashboard/bus/busConfig.js
export const busMeta = {
  label: "Bus",
  color: "text-orange-600 bg-orange-50 border-orange-100",
  sub: "Seat bookings, boarding & cancellations",
  icon: "🚌",
};

export const busStats = [
  {
    label: "Today’s Bus Bookings",
    value: "9",
    sub: "Seats booked today",
  },
  {
    label: "Next Departures",
    value: "6",
    sub: "Within 24 hours",
  },
  {
    label: "Cancelled Seats",
    value: "4",
    sub: "Today",
  },
  {
    label: "Bus Revenue",
    value: "₹58K",
    sub: "This month",
  },
];

export const busQuickActions = [
  {
    label: "Search Buses",
    sub: "Routes & operators",
    icon: "🚌",
    tone: "primary",
    path: "/bus/search",
  },
  {
    label: "Bus Bookings",
    sub: "Seat & boarding pass",
    icon: "📄",
    tone: "neutral",
    path: "/bus/bookings",
  },
  {
    label: "Cancelled Trips",
    sub: "Refund & reschedule",
    icon: "⚠️",
    tone: "warning",
    path: "/bus/cancelled",
  },
  {
    label: "Bus Reports",
    sub: "Sales summary",
    icon: "📊",
    tone: "success",
    path: "/bus/reports",
  },
];

export const busRecent = [
  {
    id: 1,
    title: "Delhi → Jaipur · Sleeper",
    subtitle: "Today 22:00 · 3 Seats",
    meta: "₹3,600",
    status: "Boarding",
  },
  {
    id: 2,
    title: "Mumbai → Pune · AC Seater",
    subtitle: "Tomorrow 07:30 · 2 Seats",
    meta: "₹1,800",
    status: "Confirmed",
  },
];

export const busWorkspaceSections = [
  {
    id: "bus-core",
    label: "Bus",
    icon: "🚌",
    links: [
      { label: "Bus Bookings", path: "/dashboard/bus/bookings" },
      { label: "Today Departures", path: "/dashboard/bus/today" },
      {
        label: "Cancel / Refund Report",
        path: "/dashboard/bus/cancel-report",
      },
      { label: "Route Map", path: "/dashboard/bus/routes" },
    ],
  },
  {
    id: "bus-accounts",
    label: "Bus Accounts",
    icon: "📊",
    links: [
      { label: "Bus Ledger", path: "/dashboard/bus-accounts/ledger" },
      {
        label: "Bus Sale Register",
        path: "/dashboard/bus-accounts/sale-register",
      },
    ],
  },
  {
    id: "bus-settings",
    label: "Bus Settings",
    icon: "⚙️",
    links: [
      {
        label: "Operator Setup",
        path: "/dashboard/bus-setting/operators",
      },
      {
        label: "Routes & Markup",
        path: "/dashboard/bus-setting/routes",
      },
    ],
  },
];

export const busAiTitle = "Bus Booking AI Assistant";
export const busAiPlaceholder =
  "Delhi–Jaipur overnight AC sleeper bus options batao with approx fare…";
