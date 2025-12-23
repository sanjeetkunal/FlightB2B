// src/components/layout/Header.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/media/logo.png";

/**
 * Use as:
 *  <Header variant="public" />   // login page (only Become an Agent)
 *  <Header />                    // default private header after login
 */
export default function Header({ variant = "private" }) {
  const isPublic = variant === "public";
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState("flights");
  const [walletOpen, setWalletOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // ✅ detect desktop for hover behavior
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const walletRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const closeAll = () => {
    setWalletOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  };

  // ✅ Close dropdowns on outside click (useful for mobile click mode)
  useEffect(() => {
    const onDoc = (e) => {
      if (walletRef.current && !walletRef.current.contains(e.target)) setWalletOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // ✅ Close dropdowns on route change
  useEffect(() => {
    closeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const tabs = useMemo(
    () => [
      { key: "flights", label: "Flights", icon: AirplaneIcon },
      { key: "hotels", label: "Hotels", icon: HotelIcon },
      { key: "trains", label: "Trains", icon: TrainIcon },
      { key: "buses", label: "Buses", icon: BusIcon },
    ],
    []
  );

  // mock data — wire to real later
  const agency = { name: "Sanjeet Kunal", agentId: "V2A-2217", kyc: "Verified" };
  const wallet = { balance: 45230.0, currency: "₹", creditLimit: 200000 };

  const handleLogout = () => {
    try {
      localStorage.removeItem("tyb_user");
      localStorage.removeItem("tyb_token");
    } catch {}
    closeAll();
    navigate("/login", { replace: true });
  };

  const topLinks = isPublic ? ["Support", "Help"] : ["Manage", "Reports", "Support", "Help"];

  // ✅ Safe navigate wrapper that closes dropdowns first
  const go = (path, opts) => {
    closeAll();
    navigate(path, opts);
  };

  // ✅ desktop hover handlers
  const hoverOpen = (which) => {
    if (!isDesktop) return;
    if (which === "wallet") {
      setWalletOpen(true);
      setProfileOpen(false);
      setNotifOpen(false);
    }
    if (which === "profile") {
      setProfileOpen(true);
      setWalletOpen(false);
      setNotifOpen(false);
    }
    if (which === "notif") {
      setNotifOpen(true);
      setWalletOpen(false);
      setProfileOpen(false);
    }
  };
  const hoverClose = (which) => {
    if (!isDesktop) return;
    if (which === "wallet") setWalletOpen(false);
    if (which === "profile") setProfileOpen(false);
    if (which === "notif") setNotifOpen(false);
  };

  // ✅ mobile click toggles
  const toggleWallet = () => {
    if (isDesktop) return;
    setWalletOpen((v) => {
      const next = !v;
      if (next) {
        setProfileOpen(false);
        setNotifOpen(false);
      }
      return next;
    });
  };
  const toggleProfile = () => {
    if (isDesktop) return;
    setProfileOpen((v) => {
      const next = !v;
      if (next) {
        setWalletOpen(false);
        setNotifOpen(false);
      }
      return next;
    });
  };
  const toggleNotif = () => {
    if (isDesktop) return;
    setNotifOpen((v) => {
      const next = !v;
      if (next) {
        setWalletOpen(false);
        setProfileOpen(false);
      }
      return next;
    });
  };

  return (
    <header className="bg-white sticky top-0 z-30">
      {/* TOP BAR – only after login */}
      {!isPublic && (
        <div className="hidden sm:block bg-black text-white">
          <div className="mx-auto max-w-7xl px-0 sm:px-0 lg:px-0">
            <div className="h-11 flex items-center justify-between gap-3 px-4">
              <div className="flex items-center gap-6 text-sm">
                <span>📞 +91-9876543210</span>
                <span>✉️ support@yourdomain.com</span>
              </div>

              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                {topLinks.map((l) => (
                  <a key={l} href="#" className="hover:text-blue-400 transition-colors">
                    {l}
                  </a>
                ))}
              </nav>

              <button className="md:hidden h-8 px-3 rounded-full border border-white text-xs font-semibold">
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className="border border-gray-200">
        <div className="mx-auto max-w-7xl px-0 sm:px-0 lg:px-0">
          <div className="h-16 flex items-center justify-between px-4">
            {/* Left: Logo (✅ mobile also visible) */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => go(isPublic ? "/login" : "/")}
                className="flex items-center gap-3"
                aria-label="Go home"
              >
                <img
                  src={logo}
                  className="w-36 sm:w-[260px] object-contain"
                  alt="Logo"
                />
                <div className="hidden sm:block w-px h-6 bg-gray-200" />
              </button>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              {isPublic ? (
                <button
                  onClick={() => go("/agent-register")}
                  className="h-10 px-4 inline-flex items-center justify-center rounded-full bg-orange-500 text-white text-sm font-semibold shadow-sm hover:bg-orange-600"
                >
                  Become an Agent
                </button>
              ) : (
                <>
                  {/* ✅ Tabs show only on desktop, hidden on mobile */}
                  <nav className="hidden md:flex items-center gap-3 overflow-x-auto">
                    {tabs.map((t) => {
                      const isActive = active === t.key;
                      return (
                        <button
                          key={t.key}
                          onClick={() => setActive(t.key)}
                          className={[
                            "relative px-3 h-9 inline-flex items-center gap-2 rounded-full border text-sm font-semibold",
                            isActive
                              ? "border-gray-400 text-gray-700 bg-blue-50"
                              : "border-transparent text-gray-700 hover:bg-gray-50",
                          ].join(" ")}
                        >
                          <span className="whitespace-nowrap">{t.label}</span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* Wallet, Notifications, Profile */}
                  <div className="flex items-center gap-2">
                    {/* Wallet (✅ mobile icon only, desktop full) */}
                    <div
                      className="relative"
                      ref={walletRef}
                      onMouseEnter={() => hoverOpen("wallet")}
                      onMouseLeave={() => hoverClose("wallet")}
                    >
                      <button
                        onClick={toggleWallet}
                        className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                        title="Wallet"
                        type="button"
                      >
                        <WalletIcon className="w-4 h-4" />
                        {isDesktop && (
                          <>
                            <span className="text-sm font-semibold">
                              {wallet.currency}
                              {formatMoney(wallet.balance)}
                            </span>
                            <span className="text-[10px] text-gray-500 hidden sm:inline">
                              Wallet
                            </span>
                          </>
                        )}
                      </button>

                      {walletOpen && (
                        <div className="absolute left-0 sm:right-0 sm:left-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-gray-500">Available Balance</div>
                              <div className="text-xl font-bold">
                                {wallet.currency}
                                {formatMoney(wallet.balance)}
                              </div>
                            </div>
                            <button
                              className="px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-gray-700"
                              onClick={() => go("/admin/wallet/add-funds")}
                              type="button"
                            >
                              Add Funds
                            </button>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <InfoTile
                              title="Credit Limit"
                              value={`${wallet.currency}${formatMoney(wallet.creditLimit)}`}
                            />
                            <InfoTile title="Hold Amount" value={`${wallet.currency}0.00`} />
                          </div>

                          <div className="mt-3 border-t border-gray-200 pt-3">
                            <DropItem onClick={() => go("/admin/wallet/history")}>
                              Wallet History
                            </DropItem>
                            <DropItem onClick={() => go("/admin/wallet/statement")}>
                              Download Statement
                            </DropItem>
                            <DropItem onClick={() => go("/admin/wallet/refunds")}>
                              Refunds & Adjustments
                            </DropItem>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notifications */}
                    <div
                      className="relative"
                      ref={notifRef}
                      onMouseEnter={() => hoverOpen("notif")}
                      onMouseLeave={() => hoverClose("notif")}
                    >
                      <button
                        onClick={toggleNotif}
                        className="h-10 w-10 inline-grid place-items-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                        aria-label="Notifications"
                        type="button"
                      >
                        <BellIcon className="w-4 h-4" />
                      </button>

                      {notifOpen && (
                        <div className="absolute mt-2 w-80 left-1/2 -translate-x-1/2 sm:right-0 sm:left-auto sm:translate-x-0 bg-white border border-gray-200 rounded-2xl shadow-xl p-3">
                          <div className="px-2 py-1 text-sm font-semibold">Notifications</div>
                          <div className="divide-y max-h-80 overflow-auto">
                            <NotifItem title="PNR AD4K9Q ticketed" meta="Just now" />
                            <NotifItem title="Low wallet threshold crossed" meta="10m ago" />
                            <NotifItem title="Refund processed ₹2,350" meta="Yesterday" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Profile (✅ mobile avatar only, desktop full + hover dropdown) */}
                    <div
                      className="relative"
                      ref={profileRef}
                      onMouseEnter={() => hoverOpen("profile")}
                      onMouseLeave={() => hoverClose("profile")}
                    >
                      <button
                        onClick={toggleProfile}
                        className="h-10 px-0 md:px-3 inline-flex items-center gap-3 rounded-xl bg-white hover:bg-gray-50 cursor-pointer"
                        type="button"
                      >
                        <Avatar />
                        {isDesktop && (
                          <div className="text-left">
                            <div className="text-sm font-semibold leading-tight truncate max-w-[10rem]">
                              {agency.name}
                            </div>
                            <div className="text-[11px] text-gray-500 leading-tight">
                              ID: {agency.agentId}
                            </div>
                          </div>
                        )}
                      </button>

                      {profileOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-2">
                          <div className="px-3 py-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{agency.name}</div>
                                <div className="text-xs text-gray-500">
                                  Agent ID: {agency.agentId}
                                </div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                {agency.kyc}
                              </span>
                            </div>
                          </div>

                          <div className="border-t my-2 border-gray-200" />
                          <MenuLink onClick={() => go("/agency-settings")}>My Profile</MenuLink>
                          <MenuLink onClick={() => go("/agency-settings")}>
                            Agency Settings
                          </MenuLink>
                          <MenuLink onClick={closeAll}>GST & KYC</MenuLink>
                          <MenuLink onClick={closeAll}>Payout Accounts</MenuLink>
                          <div className="border-t my-2 border-gray-200" />
                          <MenuLink danger onClick={handleLogout}>
                            Logout
                          </MenuLink>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ✅ REMOVED: Mobile tabs scroller (Flights/Hotels/Trains/Buses hide on mobile) */}
        </div>
      </div>
    </header>
  );
}

/* --- small building blocks --- */
function DropItem({ children, onClick }) {
  return (
    <button
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
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
function MenuLink({ children, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
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
function AirplaneIcon({ className }) {
  return (
    <img
      src="https://cdn-icons-png.flaticon.com/128/6789/6789671.png"
      className={className || "w-[35px]"}
      alt="Flights"
    />
  );
}
function HotelIcon({ className }) {
  return (
    <img
      src="https://cdn-icons-png.flaticon.com/128/10472/10472597.png"
      className={className || "w-[35px]"}
      alt="Hotels"
    />
  );
}
function TrainIcon({ className }) {
  return (
    <img
      src="https://cdn-icons-png.flaticon.com/128/8713/8713890.png"
      className={className || "w-[35px]"}
      alt="Trains"
    />
  );
}
function BusIcon({ className }) {
  return (
    <img
      src="https://cdn-icons-png.flaticon.com/128/4707/4707853.png"
      className={className || "w-[35px]"}
      alt="Buses"
    />
  );
}
function WalletIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 7a3 3 0 0 1 3-3h12v2H6a1 1 0 0 0-1 1v1h15a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7Zm18 5h-5v4h5a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z" />
    </svg>
  );
}
function BellIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2a6 6 0 0 0-6 6v3.3l-1.3 2.6A1 1 0 0 0 5.6 16h12.8a1 1 0 0 0 .9-1.5L18 11.3V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z" />
    </svg>
  );
}

function formatMoney(n) {
  return Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
