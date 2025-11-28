// src/pages/dashboard/hotel/hotelConfig.js
export const hotelMeta = {
  label: "Hotel",
  color: "text-emerald-600 bg-emerald-50 border-emerald-100",
  sub: "Room bookings, vouchers & refunds",
  icon: "🏨",
};

export const hotelStats = [
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
];

export const hotelQuickActions = [
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
];

export const hotelRecent = [
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
];

export const hotelWorkspaceSections = [
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
];

export const hotelAiTitle = "Hotel Booking AI Assistant";
export const hotelAiPlaceholder =
  "Goa me 3N ke liye family-friendly beach side hotel suggest karo, budget 5k per night…";
