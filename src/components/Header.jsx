// src/components/layout/Header.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/media/logo.png";

/**
 * Theme-ready Header (uses CSS vars from ThemeProvider)
 * Required CSS vars (set on :root):
 * --surface, --surface2, --text, --muted, --border,
 * --primary, --primaryHover, --primarySoft,
 * --topbarBg, --topbarText
 *
 * Use as:
 *  <Header variant="public" />
 *  <Header />
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
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : true
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

  // ✅ Close dropdowns on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (walletRef.current && !walletRef.current.contains(e.target))
        setWalletOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
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
    } catch { }
    closeAll();
    navigate("/login", { replace: true });
  };

  const topLinks = isPublic
    ? ["Support", "Help"]
    : ["Manage", "Reports", "Support", "Help"];

  // ✅ Safe navigate wrapper
  const go = (path, opts) => {
    closeAll();
    navigate(path, opts);
  };

  /* =========================
     Hover Intent Timers
     ========================= */
  const hoverTimers = useRef({ wallet: null, profile: null, notif: null });
  const HOVER_CLOSE_DELAY = 180;

  const clearHoverTimer = (which) => {
    if (hoverTimers.current[which]) {
      clearTimeout(hoverTimers.current[which]);
      hoverTimers.current[which] = null;
    }
  };

  const openMenu = (which) => {
    if (!isDesktop) return;
    clearHoverTimer(which);

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

  const scheduleCloseMenu = (which) => {
    if (!isDesktop) return;
    clearHoverTimer(which);
    hoverTimers.current[which] = setTimeout(() => {
      if (which === "wallet") setWalletOpen(false);
      if (which === "profile") setProfileOpen(false);
      if (which === "notif") setNotifOpen(false);
    }, HOVER_CLOSE_DELAY);
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
    <header className="sticky top-0 z-30 bg-[var(--surface)] text-[var(--text)]">
      {/* TOP BAR – only after login */}
      {!isPublic && (
        <div className="hidden sm:block bg-black text-white">
          <div className="mx-auto max-w-7xl px-0 sm:px-0 lg:px-0">
            <div className="h-11 flex items-center justify-between gap-3 px-4">
              <div className="flex items-center gap-6 text-sm opacity-95">
                <span>📞 +91-9876543210</span>
                <span>✉️ support@yourdomain.com</span>
              </div>

              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                {topLinks.map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="hover:text-blue-300 transition-colors"
                  >
                    {l}
                  </a>
                ))}
              </nav>

              <button className="md:hidden h-8 px-3 rounded-full border border-white/30 text-xs font-semibold">
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-0 sm:px-0 lg:px-0">
          <div className="h-16 flex items-center justify-between px-4">
            {/* Left: Logo */}
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
                <div className="hidden sm:block w-px h-6 bg-[var(--border)]" />
              </button>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              {isPublic ? (
                <button
                  onClick={() => go("/agent-register")}
                  className="
                    h-10 px-4 inline-flex items-center justify-center rounded-full
                    bg-[var(--primary)] text-white text-sm font-semibold shadow-sm
                    hover:bg-[var(--primaryHover)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30
                  "
                >
                  Become an Agent
                </button>
              ) : (
                <>
                  <nav className="hidden md:flex items-center gap-3 overflow-x-auto">
                    {tabs.map((t) => {
                      const isActive = active === t.key;
                      return (
                        <button
                          key={t.key}
                          onClick={() => setActive(t.key)}
                          className={[
                            "relative px-3 h-9 inline-flex items-center gap-2 rounded-full border text-sm font-semibold transition",
                            isActive
                              ? "border-[var(--border)] text-[var(--text)] bg-[var(--primarySoft)]"
                              : "border-transparent text-[var(--text)] hover:bg-[var(--surface2)]",
                          ].join(" ")}
                        >
                          <span className="whitespace-nowrap">{t.label}</span>
                        </button>
                      );
                    })}
                  </nav>

                  <div className="flex items-center gap-2">
                    {/* ✅ Wallet */}
                    <div
                      className="relative"
                      ref={walletRef}
                      onMouseEnter={() => openMenu("wallet")}
                      onMouseLeave={() => scheduleCloseMenu("wallet")}
                    >
                      <button
                        onClick={toggleWallet}
                        className="
                          h-10 px-3 inline-flex items-center gap-2 rounded-xl
                          border border-[var(--border)]
                          bg-[var(--surface)]
                          hover:bg-[var(--surface2)]
                          cursor-pointer
                        "
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
                            <span className="text-[10px] text-[var(--muted)] hidden sm:inline">
                              Wallet
                            </span>
                          </>
                        )}
                      </button>

                      {walletOpen && (
                        <div
                          onMouseEnter={() => openMenu("wallet")}
                          onMouseLeave={() => scheduleCloseMenu("wallet")}
                          className="
                            absolute left-0 sm:right-0 sm:left-auto
                            top-full translate-y-2
                            w-80
                            bg-[var(--surface)]
                            border border-[var(--border)]
                            rounded-2xl shadow-xl p-3
                          "
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-[var(--muted)]">
                                Available Balance
                              </div>
                              <div className="text-xl font-bold">
                                {wallet.currency}
                                {formatMoney(wallet.balance)}
                              </div>
                            </div>
                            <button
                              className="
                                px-3 py-2 rounded-lg
                                bg-[var(--primary)] text-white
                                text-sm font-semibold
                                hover:bg-[var(--primaryHover)]
                              "
                              onClick={() => go("/admin/wallet/add-funds")}
                              type="button"
                            >
                              Add Funds
                            </button>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <InfoTile
                              title="Credit Limit"
                              value={`${wallet.currency}${formatMoney(
                                wallet.creditLimit
                              )}`}
                            />
                            <InfoTile
                              title="Hold Amount"
                              value={`${wallet.currency}0.00`}
                            />
                          </div>

                          <div className="mt-3 border-t border-[var(--border)] pt-3">
                            <DropItem onClick={() => go("/admin/wallet/history")}>
                              Wallet History
                            </DropItem>
                            <DropItem
                              onClick={() => go("/admin/wallet/statement")}
                            >
                              Download Statement
                            </DropItem>
                            <DropItem onClick={() => go("/admin/wallet/refunds")}>
                              Refunds & Adjustments
                            </DropItem>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ✅ Notifications */}
                    <div
                      className="relative"
                      ref={notifRef}
                      onMouseEnter={() => openMenu("notif")}
                      onMouseLeave={() => scheduleCloseMenu("notif")}
                    >
                      <button
                        onClick={toggleNotif}
                        className="
                          h-10 w-10 inline-grid place-items-center rounded-xl
                          border border-[var(--border)]
                          bg-[var(--surface)]
                          hover:bg-[var(--surface2)]
                          cursor-pointer
                        "
                        aria-label="Notifications"
                        type="button"
                      >
                        <BellIcon className="w-4 h-4" />
                      </button>

                      {notifOpen && (
                        <div
                          onMouseEnter={() => openMenu("notif")}
                          onMouseLeave={() => scheduleCloseMenu("notif")}
                          className="
                            absolute top-full translate-y-2
                            w-80 left-1/2 -translate-x-1/2
                            sm:right-0 sm:left-auto sm:translate-x-0
                            bg-[var(--surface)]
                            border border-[var(--border)]
                            rounded-2xl shadow-xl p-3
                          "
                        >
                          <div className="px-2 py-1 text-sm font-semibold">
                            Notifications
                          </div>
                          <div className="divide-y divide-[var(--border)] max-h-80 overflow-auto">
                            <NotifItem title="PNR AD4K9Q ticketed" meta="Just now" />
                            <NotifItem
                              title="Low wallet threshold crossed"
                              meta="10m ago"
                            />
                            <NotifItem title="Refund processed ₹2,350" meta="Yesterday" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ✅ Profile */}
                    <div
                      className="relative"
                      ref={profileRef}
                      onMouseEnter={() => openMenu("profile")}
                      onMouseLeave={() => scheduleCloseMenu("profile")}
                    >
                      <button
                        onClick={toggleProfile}
                        className="
                          h-10 px-0 md:px-3 inline-flex items-center gap-3 rounded-xl
                          bg-[var(--surface)] hover:bg-[var(--surface2)] cursor-pointer
                        "
                        type="button"
                      >
                        <Avatar />
                        {isDesktop && (
                          <div className="text-left">
                            <div className="text-sm font-semibold leading-tight truncate max-w-[10rem]">
                              {agency.name}
                            </div>
                            <div className="text-[11px] text-[var(--muted)] leading-tight">
                              ID: {agency.agentId}
                            </div>
                          </div>
                        )}
                      </button>

                      {profileOpen && (
                        <div
                          onMouseEnter={() => openMenu("profile")}
                          onMouseLeave={() => scheduleCloseMenu("profile")}
                          className="
                            absolute right-0 top-full translate-y-2
                            w-72
                            bg-[var(--surface)]
                            border border-[var(--border)]
                            rounded-2xl shadow-xl p-2
                          "
                        >
                          <div className="px-3 py-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{agency.name}</div>
                                <div className="text-xs text-[var(--muted)]">
                                  Agent ID: {agency.agentId}
                                </div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                {agency.kyc}
                              </span>
                            </div>
                          </div>

                          <div className="border-t my-2 border-[var(--border)]" />
                          <MenuLink onClick={() => go("/agency-settings")}>
                            My Profile
                          </MenuLink>
                          <MenuLink onClick={() => go("/agency-settings")}>
                            Agency Settings
                          </MenuLink>
                          <MenuLink onClick={closeAll}>GST & KYC</MenuLink>
                          <MenuLink onClick={closeAll}>Payout Accounts</MenuLink>
                          <div className="border-t my-2 border-[var(--border)]" />
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
        </div>
      </div>
    </header>
  );
}

/* --- small building blocks --- */
function DropItem({ children, onClick }) {
  return (
    <button
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--surface2)] text-sm"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function InfoTile({ title, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface2)] p-3">
      <div className="text-xs text-[var(--muted)]">{title}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function NotifItem({ title, meta }) {
  return (
    <div className="px-3 py-3 hover:bg-[var(--surface2)]">
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-[var(--muted)]">{meta}</div>
    </div>
  );
}

function MenuLink({ children, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={[
        "w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--surface2)] text-sm",
        danger ? "text-red-600 hover:bg-red-50" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Avatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white grid place-items-center text-sm font-bold">
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
