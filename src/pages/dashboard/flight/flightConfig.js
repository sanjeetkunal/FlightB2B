// src/pages/dashboard/flight/flightConfig.js

export const flightMeta = {
  label: "Flight",
  color: "text-sky-600 bg-sky-50 border-sky-100",
  sub: "PNR, tickets, cancellations & reissues",
  icon: "✈️",
};

export const flightStats = [
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
];

export const flightQuickActions = [
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
    // ✅ ab ye direct FlightReport page open karega
    path: "/dashboard/flight/my-bookings",
  },
  {
    label: "Hold PNRs",
    sub: "Check expiry & issue",
    icon: "⏳",
    tone: "warning",
    path: "/dashboard/flight/hold-pnr",
  },
  {
    label: "Flight Reports",
    sub: "Sales & commission",
    icon: "📊",
    tone: "success",
    path: "/dashboard/flight/ticket-report",
  },
];


export const flightRecent = [
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
];

export const flightWorkspaceSections = [
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
        path: "/dashboard/flight/ticket-status",
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
];

export const flightAiTitle = "Flight Booking AI Assistant";
export const flightAiPlaceholder =
  "Delhi se Dubai 2 adults ke liye sabse best & sasta option suggest karo…";
