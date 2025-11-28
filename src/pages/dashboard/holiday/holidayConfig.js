// src/pages/dashboard/holiday/holidayConfig.js
export const holidayMeta = {
  label: "Holidays (AI)",
  color: "text-purple-600 bg-purple-50 border-purple-100",
  sub: "Packages, itineraries & AI suggestions",
  icon: "🎒",
};

export const holidayStats = [
  { label: "Package Enquiries", value: "21", sub: "Today’s leads" },
  { label: "Active Quotes", value: "7", sub: "Sent to customers" },
  {
    label: "Confirmations",
    value: "4",
    sub: "Trips confirmed this week",
  },
  { label: "Holiday Revenue", value: "₹3.10L", sub: "This month" },
];

export const holidayQuickActions = [
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
];

export const holidayRecent = [
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
];

export const holidayWorkspaceSections = [
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
];

export const holidayAiTitle = "Holiday Package AI Assistant";
export const holidayAiPlaceholder =
  "Budget 50k ke andar 4D/3N couple package suggest karo (flight + hotel + sightseeing)…";
