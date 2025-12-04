// src/pages/dashboard/config/dashboardConfig.js

export const MODULE_KEYS = ["flight", "hotel", "bus", "holiday"];

export const moduleMeta = {
  flight: {
    label: "Flight",
    color: "text-sky-600 bg-sky-50 border-sky-100",
    sub: "PNR, tickets, cancellations & reissues",
  },
  hotel: {
    label: "Hotel",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    sub: "Room bookings, vouchers & refunds",
  },
  bus: {
    label: "Bus",
    color: "text-orange-600 bg-orange-50 border-orange-100",
    sub: "Seat bookings, boarding & cancellations",
  },
  holiday: {
    label: "Holidays (AI)",
    color: "text-purple-600 bg-purple-50 border-purple-100",
    sub: "Packages, itineraries & AI suggestions",
  },
};

// ───────── Stats per module ─────────
export const statsMap = {
  flight: [
    {
      label: "Today's Flight Bookings",
      value: "12",
      sub: "Tickets issued today",
    },
    {
      label: "Upcoming Departures",
      value: "8",
      sub: "Next 7 days",
    },
    {
      label: "Pending Refunds",
      value: "3",
      sub: "Awaiting airline/ADM",
    },
    {
      label: "Flight Revenue",
      value: "₹2.45L",
      sub: "This month",
    },
  ],
  hotel: [
    {
      label: "Today’s Check-in",
      value: "5",
      sub: "Guests arriving today",
    },
    {
      label: "Active Vouchers",
      value: "18",
      sub: "Upcoming hotel stays",
    },
    {
      label: "Pending Cancellations",
      value: "2",
      sub: "Hotel confirmation awaited",
    },
    {
      label: "Hotel Revenue",
      value: "₹1.32L",
      sub: "This month",
    },
  ],
  bus: [
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
  ],
  holiday: [
    {
      label: "Package Enquiries",
      value: "21",
      sub: "Today’s leads",
    },
    {
      label: "Active Quotes",
      value: "7",
      sub: "Sent to customers",
    },
    {
      label: "Confirmations",
      value: "4",
      sub: "Trips confirmed this week",
    },
    {
      label: "Holiday Revenue",
      value: "₹3.10L",
      sub: "This month",
    },
  ],
};

// ───────── Quick actions per module ─────────
export const quickActionsMap = {
  flight: [
    {
      label: "New Flight Search",
      sub: "Oneway, Roundtrip, Intl",
      icon: "✈️",
      tone: "primary",
      path: "/",
    },
    {
      label: "My Flight Bookings",
      sub: "View & manage PNRs",
      icon: "📄",
      tone: "neutral",
      path: "/bookings",
    },
    {
      label: "Hold PNRs",
      sub: "Check expiry & issue",
      icon: "⏳",
      tone: "warning",
      path: "/hold-bookings",
    },
    {
      label: "Flight Reports",
      sub: "Sales & commission",
      icon: "📊",
      tone: "success",
      path: "/reports",
    },
  ],
  hotel: [
    {
      label: "Search Hotels",
      sub: "City, dates & rooms",
      icon: "🏨",
      tone: "primary",
      path: "/hotel/search",
    },
    {
      label: "Hotel Bookings",
      sub: "Vouchers & status",
      icon: "📄",
      tone: "neutral",
      path: "/hotel/bookings",
    },
    {
      label: "Pending Vouchers",
      sub: "Confirmation awaited",
      icon: "🕒",
      tone: "warning",
      path: "/hotel/pending",
    },
    {
      label: "Hotel Reports",
      sub: "Revenue & margins",
      icon: "📊",
      tone: "success",
      path: "/hotel/reports",
    },
  ],
  bus: [
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
  ],
  holiday: [
    {
      label: "Create New Package",
      sub: "Custom or fixed departure",
      icon: "📦",
      tone: "primary",
      path: "/holidays/create",
    },
    {
      label: "Lead Manager",
      sub: "Follow-up & status",
      icon: "📇",
      tone: "neutral",
      path: "/holidays/leads",
    },
    {
      label: "Quotation Builder",
      sub: "Send proposal in 2 mins",
      icon: "📝",
      tone: "warning",
      path: "/holidays/quotes",
    },
    {
      label: "Holiday Reports",
      sub: "Profit & performance",
      icon: "📊",
      tone: "success",
      path: "/holidays/reports",
    },
  ],
};

// ───────── Recent activity per module ─────────
export const listItemsMap = {
  flight: [
    {
      id: 1,
      title: "DEL → BOM · 2 ADT",
      subtitle: "PNR AB12CD · Vistara · Today 08:30",
      meta: "₹15,400",
      status: "Ticketed",
    },
    {
      id: 2,
      title: "BOM → DXB · 1 ADT 1 CHD",
      subtitle: "PNR ZX98PQ · Emirates · Tomorrow 22:45",
      meta: "₹42,800",
      status: "On Hold",
    },
  ],
  hotel: [
    {
      id: 1,
      title: "Taj Palace, Delhi",
      subtitle: "Check-in Today · 2N · 2 ADT 1 CHD",
      meta: "₹24,500",
      status: "Confirmed",
    },
    {
      id: 2,
      title: "Marina Bay, Goa",
      subtitle: "Check-in 30 Nov · 3N · 4 ADT",
      meta: "₹31,200",
      status: "Voucher Pending",
    },
  ],
  bus: [
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
  ],
  holiday: [
    {
      id: 1,
      title: "6D/5N Kashmir Delight",
      subtitle: "Lead: Rahul Sharma · Travel 15 Dec",
      meta: "₹78,500",
      status: "Quote Sent",
    },
    {
      id: 2,
      title: "4D/3N Dubai with Expo",
      subtitle: "Lead: Ananya Verma · Travel 10 Jan",
      meta: "₹92,000",
      status: "Follow-up",
    },
  ],
};

// ───────── Side workspace menus per module ─────────
export const sectionMenusMap = {
  flight: [
    {
      id: "flight-core",
      label: "Flight",
      icon: "✈️",
      links: [
        { label: "Ticket Report", path: "/dashboard/flight/ticket-report" },
        { label: "Travel Calendar", path: "/dashboard/flight/travel-calendar" },
        { label: "Refund Report", path: "/dashboard/flight/refund-report" },
        { label: "Reissue Report", path: "/dashboard/flight/reissue-report" },
        { label: "Hold PNR Report", path: "/dashboard/flight/hold-pnr" },
      ],
    },
    {
      id: "flight-status",
      label: "Status & Import",
      icon: "📥",
      links: [
        {
          label: "Ticket Status Report",
          path: "/dashboard/flight/ticket-status-report",
        },
        { label: "Import PNR", path: "/dashboard/flight/import-pnr" },
        {
          label: "Offline Request",
          path: "/dashboard/flight/offline-request",
        },
        {
          label: "Offline Status",
          path: "/dashboard/flight/offline-status",
        },
      ],
    },
    {
      id: "flight-accounts",
      label: "Accounts",
      icon: "📊",
      links: [
        { label: "Ledger (Pax Wise)", path: "/dashboard/accounts/ledger-pax" },
        {
          label: "Ledger (Txn Wise)",
          path: "/dashboard/accounts/ledger-txn",
        },
        {
          label: "Staff Transaction",
          path: "/dashboard/accounts/staff-transaction",
        },
        {
          label: "Dom. Sale Register",
          path: "/dashboard/accounts/dom-sale-register",
        },
        {
          label: "Intl. Sale Register",
          path: "/dashboard/accounts/intl-sale-register",
        },
      ],
    },
    {
      id: "flight-wallet",
      label: "Wallet",
      icon: "💳",
      links: [
        {
          label: "Upload Request",
          path: "/dashboard/wallet/upload-request",
        },
        {
          label: "Upload Status",
          path: "/dashboard/wallet/upload-status",
        },
        {
          label: "CashInFlow Report",
          path: "/dashboard/wallet/cashinflow",
        },
        {
          label: "Online Transfer",
          path: "/dashboard/wallet/online-transfer",
        },
        { label: "Bank Details", path: "/dashboard/wallet/bank-details" },
      ],
    },
    {
      id: "flight-settings",
      label: "Settings",
      icon: "⚙️",
      links: [
        {
          label: "Dom. Airline Markup",
          path: "/dashboard/setting/dom-airline-markup",
        },
        {
          label: "Intl. Airline Markup",
          path: "/dashboard/setting/intl-airline-markup",
        },
        {
          label: "Hotel Markup",
          path: "/dashboard/setting/hotel-markup",
        },
        { label: "Add Staff", path: "/dashboard/setting/add-staff" },
      ],
    },
  ],

  hotel: [
    {
      id: "hotel-core",
      label: "Hotel",
      icon: "🏨",
      links: [
        { label: "Booking List", path: "/dashboard/hotel/bookings" },
        { label: "Today Check-in", path: "/dashboard/hotel/today-checkin" },
        { label: "Upcoming Stays", path: "/dashboard/hotel/upcoming" },
        {
          label: "Cancel Requests",
          path: "/dashboard/hotel/cancel-requests",
        },
      ],
    },
    {
      id: "hotel-accounts",
      label: "Hotel Accounts",
      icon: "📊",
      links: [
        { label: "Hotel Ledger", path: "/dashboard/hotel-accounts/ledger" },
        {
          label: "Hotel Sale Register",
          path: "/dashboard/hotel-accounts/sale-register",
        },
      ],
    },
    {
      id: "hotel-settings",
      label: "Hotel Settings",
      icon: "⚙️",
      links: [
        { label: "Hotel Markup", path: "/dashboard/hotel-setting/markup" },
        {
          label: "Preferred Hotels",
          path: "/dashboard/hotel-setting/preferred",
        },
      ],
    },
  ],

  bus: [
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
  ],

  holiday: [
    {
      id: "holiday-core",
      label: "Holiday Packages",
      icon: "🎒",
      links: [
        { label: "All Packages", path: "/dashboard/holiday/packages" },
        { label: "Leads / Enquiries", path: "/dashboard/holiday/leads" },
        { label: "Quotes Sent", path: "/dashboard/holiday/quotes" },
        { label: "Confirmed Trips", path: "/dashboard/holiday/confirmed" },
      ],
    },
    {
      id: "holiday-docs",
      label: "Docs & Vouchers",
      icon: "📁",
      links: [
        { label: "Vouchers", path: "/dashboard/holiday/vouchers" },
        { label: "Travel Docs", path: "/dashboard/holiday/docs" },
      ],
    },
    {
      id: "holiday-accounts",
      label: "Holiday Accounts",
      icon: "📊",
      links: [
        {
          label: "Holiday Ledger",
          path: "/dashboard/holiday-accounts/ledger",
        },
        {
          label: "Holiday Profitability",
          path: "/dashboard/holiday-accounts/profit",
        },
      ],
    },
    {
      id: "holiday-settings",
      label: "Holiday Settings",
      icon: "⚙️",
      links: [
        {
          label: "Package Templates",
          path: "/dashboard/holiday-setting/templates",
        },
        {
          label: "Inclusion Library",
          path: "/dashboard/holiday-setting/inclusions",
        },
      ],
    },
  ],
};

// ───────── AI helpers ─────────
export function getAiTitle(module) {
  if (module === "holiday") return "Holiday Package AI Assistant";
  if (module === "flight") return "Flight Booking AI Assistant";
  if (module === "hotel") return "Hotel Booking AI Assistant";
  return "Bus Booking AI Assistant";
}

export function getAiPlaceholder(module) {
  switch (module) {
    case "flight":
      return "Delhi se Dubai 2 adults ke liye sabse sasta option batao…";
    case "hotel":
      return "Goa me 3N ke liye family-friendly hotel suggest karo…";
    case "bus":
      return "Delhi–Jaipur ke liye overnight AC sleeper options batao…";
    case "holiday":
    default:
      return "Budget 50k ke andar 4D/3N couple package suggest karo…";
  }
}
