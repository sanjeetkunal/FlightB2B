import { useEffect, useRef, useState } from "react";
import logo from "../assets/media/logo.png"

export default function Header() {
  const [active, setActive] = useState("flights");
  const [walletOpen, setWalletOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const walletRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!walletRef.current?.contains(e.target)) setWalletOpen(false);
      if (!profileRef.current?.contains(e.target)) setProfileOpen(false);
      if (!notifRef.current?.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const tabs = [
    { key: "flights", label: "Flights", icon: AirplaneIcon },
    { key: "hotels", label: "Hotels", icon: HotelIcon },
    { key: "trains", label: "Trains", icon: TrainIcon },
    { key: "buses", label: "Buses", icon: BusIcon },
  ];

  // mock data — wire up to real
  const agency = { name: "Sanjeet Kunal", agentId: "V2A-2217", kyc: "Verified" };
  const wallet = { balance: 45230.0, currency: "₹", creditLimit: 200000 };

  return (
    <header className="bg-white border border-gray-200 sticky top-0 z-30">
      {/* TOP BAR */}
      <div className="hidden sm:block bg-black text-white">
        <div className="max-w-[90rem] mx-auto px-4">
          <div className="h-11 flex items-center justify-between gap-3">
            {/* Contact Info */}
            <div className="flex items-center gap-6 text-sm">
              <span>📞 +91-9876543210</span>
              <span>✉️ support@yourdomain.com</span>
            </div>

            {/* Quick links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {["Manage", "Reports", "Support", "Help"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  {l}
                </a>
              ))}
            </nav>

            {/* Mobile chip */}
            <button className="md:hidden h-8 px-3 rounded-full border border-white text-xs font-semibold">
              Menu
            </button>
          </div>
        </div>
      </div>


      {/* BOTTOM BAR */}
      <div className="max-w-[90rem] mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Logo + product tabs */}
          <div className="flex items-center gap-6 min-w-0">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-extrabold text-orange-500 tracking-tight hidden sm:block"><img src={logo} className="w-[125px]" /></div>
              <div className="hidden sm:block w-px h-6 bg-gray-200" />
              <span className="hidden sm:block text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                B2B Partner Portal
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-3 overflow-x-auto">
              {tabs.map((t) => {
                const Icon = t.icon;
                const isActive = active === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActive(t.key)}
                    className={[
                      "relative px-3 h-9 inline-flex items-center gap-2 rounded-full border text-sm font-semibold",
                      isActive
                        ? "border-gray-400 text-gray-400 bg-blue-50"
                        : "border-transparent text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="whitespace-nowrap">{t.label}</span>
                    {t.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white">
                        {t.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Wallet, Notifications, Profile */}
          <div className="flex items-center gap-2">
            {/* Wallet */}
            <div className="relative" ref={walletRef}>
              <button
                onClick={() => setWalletOpen((v) => !v)}
                className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                title="Wallet"
              >
                <WalletIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {wallet.currency}
                  {formatMoney(wallet.balance)}
                </span>
                <span className="text-[10px] text-gray-500 hidden sm:inline">Wallet</span>
              </button>
              {walletOpen && (
                <div className="absolute left-0  sm:right-0 sm:left-0  mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">Available Balance</div>
                      <div className="text-xl font-bold">
                        {wallet.currency}
                        {formatMoney(wallet.balance)}
                      </div>
                    </div>
                    <button className="px-3 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-300 cursor-pointer">
                      Add Funds
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <InfoTile title="Credit Limit" value={`${wallet.currency}${formatMoney(wallet.creditLimit)}`} />
                    <InfoTile title="Hold Amount" value={`${wallet.currency}0.00`} />
                  </div>
                  <div className="mt-3 border-t pt-3">
                    <DropItem>Wallet History</DropItem>
                    <DropItem>Download Statement</DropItem>
                    <DropItem>Refunds & Adjustments</DropItem>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="h-10 w-10 inline-grid place-items-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                aria-label="Notifications"
              >
                <BellIcon className="w-4 h-4" />
              </button>
              {notifOpen && (
                <div className="absolute mt-2 w-80 left-1/2 -translate-x-1/2 
            sm:right-0 sm:left-auto sm:translate-x-0
            bg-white border border-gray-200 rounded-2xl shadow-xl p-3">
                  <div className="px-2 py-1 text-sm font-semibold">Notifications</div>
                  <div className="divide-y max-h-80 overflow-auto">
                    <NotifItem title="PNR AD4K9Q ticketed" meta="Just now" />
                    <NotifItem title="Low wallet threshold crossed" meta="10m ago" />
                    <NotifItem title="Refund processed ₹2,350" meta="Yesterday" />
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="h-10 px-3 inline-flex items-center gap-3 rounded-xl bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Avatar />
                <div className="text-left">
                  <div className="text-sm font-semibold leading-tight truncate max-w-[10rem]">
                    {agency.name}
                  </div>
                  <div className="text-[11px] text-gray-500 leading-tight">ID: {agency.agentId}</div>
                </div>

              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-2">
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{agency.name}</div>
                        <div className="text-xs text-gray-500">Agent ID: {agency.agentId}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        {agency.kyc}
                      </span>
                    </div>
                  </div>
                  <div className="border-t my-2" />
                  <MenuLink>My Profile</MenuLink>
                  <MenuLink>Agency Settings</MenuLink>
                  <MenuLink>GST & KYC</MenuLink>
                  <MenuLink>Payout Accounts</MenuLink>
                  <div className="border-t my-2" />
                  <MenuLink danger>Logout</MenuLink>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile product scroller */}
        <div className="md:hidden py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={[
                  "px-3 h-8 inline-flex items-center gap-2 rounded-full border text-xs font-semibold",
                  isActive ? "border-blue-600 text-blue-700 bg-blue-50" : "border-gray-200 text-gray-700",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

/* --- small building blocks --- */
function DropItem({ children }) {
  return (
    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">{children}</button>
  );
}
function InfoTile({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
function NotifItem({ title, meta }) {
  return (
    <div className="px-3 py-3 hover:bg-gray-50">
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-gray-500">{meta}</div>
    </div>
  );
}
function MenuLink({ children, danger }) {
  return (
    <button
      className={[
        "w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm",
        danger ? "text-red-600 hover:bg-red-50" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
function Avatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-white grid place-items-center text-sm font-bold">
      SK
    </div>
  );
}

/* icons */
function AirplaneIcon({ className }) { return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M21 16v2l-8-2-3 5h-2l2-6-6-1v-2l6-1-2-6h2l3 5 8-2v2l-6 2 6 2z" /></svg>; }
function HotelIcon({ className }) { return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M3 21v-9a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v9h-2v-4H5v4H3Zm4-8h10a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2Z" /></svg>; }
function TrainIcon({ className }) { return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M8 3h8a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4l2 2h-2l-2-2h-4l-2 2H6l2-2a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm8 9H8v2h8v-2Zm0-4H8v2h8V8Z" /></svg>; }
function BusIcon({ className }) { return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M6 3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3v2h-2v-2H8v2H6v-2a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm0 4h12V6H6v1Zm0 6h5V9H6v4Zm7 0h5V9h-5v4Zm-6 3h2v2H7v-2Zm8 0h2v2h-2v-2Z" /></svg>; }
function WalletIcon({ className }) { return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M3 7a3 3 0 0 1 3-3h12v2H6a1 1 0 0 0-1 1v1h15a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7Zm18 5h-5v4h5a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z" /></svg>; }
function BellIcon({ className }) { return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M12 2a6 6 0 0 0-6 6v3.3l-1.3 2.6A1 1 0 0 0 5.6 16h12.8a1 1 0 0 0 .9-1.5L18 11.3V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z" /></svg>; }
function SearchIcon({ className }) { return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M10 2a8 8 0 1 1-5.3 13.9l-2.4 2.4 1.4 1.4 2.4-2.4A8 8 0 0 1 10 2Zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 10 4Z" /></svg>; }

function formatMoney(n) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
