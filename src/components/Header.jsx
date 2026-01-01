// src/components/layout/Header.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/media/logo.png";

/**
 * Behavior:
 * - ONLY on HomeHero route: header ABSOLUTE + transparent initially, scroll pe FIXED + bg surface
 * - Other pages: header sticky + bg surface always
 *
 * UI:
 * - Hero top (transparent): Support (dropdown) + My Bookings + Wallet (dropdown) + Notifications (dropdown)
 * - White header (scrolled OR other pages): Tabs (Flights/Hotels/Trains/Buses) + Wallet (dropdown) + Notifications (dropdown)
 *
 * Dropdown:
 * - Fade-in + slide-down + arrow
 *
 * Profile:
 * - Hero top => glass/blur enterprise pill
 * - White header => solid enterprise pill
 */
export default function Header({ variant = "private" }) {
  const isPublic = variant === "public";
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ HomeHero detection
  const isHomeHero = location.pathname === "/" || location.pathname === "/home";

  const [walletOpen, setWalletOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

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
  const supportRef = useRef(null);

  const closeAll = () => {
    setWalletOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
    setSupportOpen(false);
  };

  // ✅ outside click closes
  useEffect(() => {
    const onDoc = (e) => {
      if (walletRef.current && !walletRef.current.contains(e.target))
        setWalletOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (supportRef.current && !supportRef.current.contains(e.target))
        setSupportOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // ✅ route change closes
  useEffect(() => {
    closeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // mock data — wire to real later
  const agency = { name: "Sanjeet Kunal", agentId: "V2A-2217", kyc: "Verified" };
  const wallet = { balance: 45230.0, currency: "₹", creditLimit: 200000 };

  const supportLinks = isPublic
    ? [
      { label: "Support", to: "/support" },
      { label: "Help", to: "/help" },
    ]
    : [
      { label: "Help Center", to: "/help" }, // ✅ your Help Center route
    ];

  const tabs = [
    { key: "flights", label: "Flights" },
    { key: "hotels", label: "Hotels" },
    { key: "trains", label: "Trains" },
    { key: "buses", label: "Buses" },
  ];
  const [activeTab, setActiveTab] = useState("flights");

  const go = (path, opts) => {
    closeAll();
    navigate(path, opts);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("tyb_user");
      localStorage.removeItem("tyb_token");
    } catch { }
    closeAll();
    navigate("/login", { replace: true });
  };

  /* =========================
     Hover intent (desktop)
     ========================= */
  const hoverTimers = useRef({
    wallet: null,
    profile: null,
    notif: null,
    support: null,
  });
  const HOVER_CLOSE_DELAY = 160;

  const clearHoverTimer = (which) => {
    if (hoverTimers.current[which]) {
      clearTimeout(hoverTimers.current[which]);
      hoverTimers.current[which] = null;
    }
  };

  const openMenu = (which) => {
    if (!isDesktop) return;
    clearHoverTimer(which);

    setWalletOpen(which === "wallet");
    setProfileOpen(which === "profile");
    setNotifOpen(which === "notif");
    setSupportOpen(which === "support");
  };

  const scheduleCloseMenu = (which) => {
    if (!isDesktop) return;
    clearHoverTimer(which);
    hoverTimers.current[which] = setTimeout(() => {
      if (which === "wallet") setWalletOpen(false);
      if (which === "profile") setProfileOpen(false);
      if (which === "notif") setNotifOpen(false);
      if (which === "support") setSupportOpen(false);
    }, HOVER_CLOSE_DELAY);
  };

  // ✅ click toggle (desktop + mobile)
  const toggleMenu = (which) => {
    setWalletOpen((v) => (which === "wallet" ? !v : false));
    setProfileOpen((v) => (which === "profile" ? !v : false));
    setNotifOpen((v) => (which === "notif" ? !v : false));
    setSupportOpen((v) => (which === "support" ? !v : false));
  };

  /* =========================
     HomeHero scroll behavior
     ========================= */
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  useEffect(() => {
    scrolledRef.current = scrolled;
  }, [scrolled]);

  useEffect(() => {
    if (!isHomeHero) {
      setScrolled(false);
      return;
    }

    const THRESHOLD = 12;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = Math.max(0, window.scrollY || 0);
        const next = y > THRESHOLD;
        if (next !== scrolledRef.current) setScrolled(next);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomeHero]);

  const headerPos = isHomeHero
    ? scrolled
      ? "fixed top-0"
      : "absolute top-0"
    : "sticky top-0";

  const headerBg = isHomeHero
    ? scrolled
      ? "bg-[var(--surface)] text-[var(--text)]"
      : "bg-transparent text-[var(--text)]"
    : "bg-[var(--surface)] text-[var(--text)]";

  const headerBorderShadow = isHomeHero
    ? scrolled
      ? "border-b border-[var(--border)] shadow-sm"
      : "border-b border-transparent"
    : "border-b border-[var(--border)] shadow-sm";

  // ✅ when header is white (scrolled on hero OR any other page)
  const headerIsWhite = !isHomeHero || scrolled;

  // ✅ Tabs only when header is white (and logged-in)
  const showTabs = headerIsWhite && !isPublic;

  // ✅ Support + My Bookings only when transparent on hero (and logged-in)
  const showSupportAndBookings = !headerIsWhite && !isPublic;

  return (
    <header
      className={[
        "left-0 right-0 z-50",
        headerPos,
        "transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)]",
        headerBg,
        headerBorderShadow,
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-0 sm:px-0 lg:px-0">
        <div className="h-16 flex items-center justify-between px-4 gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => go(isPublic ? "/login" : "/")}
              className="flex items-center gap-3"
              aria-label="Go home"
              type="button"
            >
              <img src={logo} className="w-15 sm:w-15 object-contain" alt="Logo" />
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {isPublic ? (
              <button
                onClick={() => go("/agent-register")}
                className="
                  h-10 px-4 inline-flex items-center justify-center rounded-full
                  bg-[var(--primary)] text-white text-sm font-semibold shadow-sm
                  hover:bg-[var(--primaryHover)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30
                "
                type="button"
              >
                Become an Agent
              </button>
            ) : (
              <>
                {/* ===== Desktop strip ===== */}
                <div className="hidden md:flex items-stretch">
                  {/* ✅ Support + My Bookings ONLY when transparent (hero top) */}
                  {showSupportAndBookings && (
                    <>
                      {/* Support */}
                      <div
                        ref={supportRef}
                        className="relative"
                        onMouseEnter={() => openMenu("support")}
                        onMouseLeave={() => scheduleCloseMenu("support")}
                      >
                        <QuickTileButton
                          tone={headerIsWhite ? "dark" : "light"}
                          title="Support"
                          subtitle="Help & contact"
                          icon={<SupportBadgeIcon />}
                          open={supportOpen}
                          caret
                          onClick={() => toggleMenu("support")}
                        />

                        {supportOpen && (
                          <DropdownPanel widthClass="w-80">
                            <div className="px-2">
                              <div className="text-sm font-semibold">Support</div>
                              <div className="mt-1 text-xs text-[var(--muted)]">
                                We’re here to help.
                              </div>

                              <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--surface2)] p-3">
                                <div className="text-xs text-[var(--muted)]">Call</div>
                                <div className="text-sm font-semibold">+91-9876543210</div>
                                <div className="mt-2 text-xs text-[var(--muted)]">Email</div>
                                <div className="text-sm font-semibold break-all">
                                  support@yourdomain.com
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 border-t border-[var(--border)] pt-2">
                              {supportLinks.map((l) => (
                                <DropItem key={l.to} onClick={() => go(l.to)}>
                                  {l.label}
                                </DropItem>
                              ))}
                            </div>
                          </DropdownPanel>
                        )}
                      </div>

                      <QuickSep tone={headerIsWhite ? "dark" : "light"} />

                      {/* My Bookings */}
                      <div className="relative">
                        <QuickTileButton
                          tone={headerIsWhite ? "dark" : "light"}
                          title="My Bookings"
                          subtitle="Manage your trips"
                          icon={<BookingsBadgeIcon />}
                          open={false}
                          caret={false}
                          onClick={() => go("/dashboard/flight/my-bookings")}
                        />
                      </div>

                      <QuickSep tone={headerIsWhite ? "dark" : "light"} />
                    </>
                  )}

                  {/* ✅ Tabs ONLY when white header */}
                  {showTabs && (
                    <>
                      <div className="flex items-center gap-1 px-2">
                        {tabs.map((t) => {
                          const isActive = activeTab === t.key;
                          return (
                            <button
                              key={t.key}
                              type="button"
                              onClick={() => setActiveTab(t.key)}
                              className={[
                                "h-10 px-3 rounded-full text-sm font-semibold transition",
                                isActive
                                  ? "bg-[var(--primarySoft)] text-[var(--text)] border border-[var(--border)]"
                                  : "text-[var(--text)] hover:bg-[var(--surface2)] border border-transparent",
                              ].join(" ")}
                            >
                              {t.label}
                            </button>
                          );
                        })}
                      </div>

                      <QuickSep tone="dark" />
                    </>
                  )}

                  {/* Wallet (always) */}
                  <div
                    ref={walletRef}
                    className="relative"
                    onMouseEnter={() => openMenu("wallet")}
                    onMouseLeave={() => scheduleCloseMenu("wallet")}
                  >
                    <QuickTileButton
                      tone={headerIsWhite ? "dark" : "light"}
                      title={`${wallet.currency}${formatMoney(wallet.balance)}`}
                      subtitle="Wallet balance"
                      icon={<WalletBadgeIcon />}
                      open={walletOpen}
                      caret
                      onClick={() => toggleMenu("wallet")}
                    />

                    {walletOpen && (
                      <DropdownPanel widthClass="w-80">
                        <div className="flex items-center justify-between gap-3">
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
                              px-3 py-2 rounded-md
                              bg-[var(--primary)] text-white
                              text-sm font-semibold
                              hover:bg-[var(--primaryHover)]
                            "
                            onClick={() => go("/wallet/add-funds")}
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

                        <div className="mt-3 border-t border-[var(--border)] pt-3">
                          <DropItem onClick={() => go("/wallet/history")}>
                            Wallet History
                          </DropItem>
                          <DropItem onClick={() => go("/wallet/statement")}>
                            Download Statement
                          </DropItem>
                          <DropItem onClick={() => go("/wallet/refunds")}>
                            Refunds & Adjustments
                          </DropItem>
                        </div>
                      </DropdownPanel>
                    )}
                  </div>

                  <QuickSep tone={headerIsWhite ? "dark" : "light"} />

                  {/* Notifications (always) */}
                  <div
                    ref={notifRef}
                    className="relative"
                    onMouseEnter={() => openMenu("notif")}
                    onMouseLeave={() => scheduleCloseMenu("notif")}
                  >
                    <QuickTileButton
                      tone={headerIsWhite ? "dark" : "light"}
                      title="Notifications"
                      subtitle="Updates"
                      icon={<NotifBadgeIcon />}
                      open={notifOpen}
                      caret
                      onClick={() => toggleMenu("notif")}
                    />

                    {notifOpen && (
                      <DropdownPanel widthClass="w-80">
                        <div className="px-2 py-1 text-sm font-semibold">
                          Notifications
                        </div>
                        <div className="divide-y divide-[var(--border)] max-h-80 overflow-auto">
                          <NotifItem title="PNR AD4K9Q ticketed" meta="Just now" />
                          <NotifItem title="Low wallet threshold crossed" meta="10m ago" />
                          <NotifItem title="Refund processed ₹2,350" meta="Yesterday" />
                        </div>
                      </DropdownPanel>
                    )}
                  </div>
                </div>

                {/* ===== Mobile icons ===== */}
                <div className="md:hidden flex items-center gap-2">
                  {!headerIsWhite && (
                    <>
                      <button
                        onClick={() => toggleMenu("support")}
                        className="h-10 w-10 inline-grid place-items-center rounded-md border border-white/20 bg-white/10 hover:bg-white/15 backdrop-blur-md"
                        type="button"
                        aria-label="Support"
                      >
                        <SupportIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => go("/my-bookings")}
                        className="h-10 w-10 inline-grid place-items-center rounded-md border border-white/20 bg-white/10 hover:bg-white/15 backdrop-blur-md"
                        type="button"
                        aria-label="My Bookings"
                      >
                        <BookingsIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => toggleMenu("wallet")}
                    className="h-10 w-10 inline-grid place-items-center rounded-md border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                    type="button"
                    aria-label="Wallet"
                  >
                    <WalletIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleMenu("notif")}
                    className="h-10 w-10 inline-grid place-items-center rounded-md border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                    type="button"
                    aria-label="Notifications"
                  >
                    <BellIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile dropdown panels */}
                {supportOpen && (
                  <div className="md:hidden absolute left-4 right-4 top-16 z-[90]">
                    <DropdownPanel fullWidth>
                      <div className="px-2">
                        <div className="text-sm font-semibold">Support</div>
                        <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--surface2)] p-3">
                          <div className="text-xs text-[var(--muted)]">Call</div>
                          <div className="text-sm font-semibold">+91-9876543210</div>
                          <div className="mt-2 text-xs text-[var(--muted)]">Email</div>
                          <div className="text-sm font-semibold break-all">
                            support@yourdomain.com
                          </div>
                        </div>
                      </div>
                    </DropdownPanel>
                  </div>
                )}

                {walletOpen && (
                  <div className="md:hidden absolute left-4 right-4 top-16 z-[90]">
                    <DropdownPanel fullWidth>
                      <div className="text-xs text-[var(--muted)]">Available Balance</div>
                      <div className="text-xl font-bold">
                        {wallet.currency}
                        {formatMoney(wallet.balance)}
                      </div>
                    </DropdownPanel>
                  </div>
                )}

                {notifOpen && (
                  <div className="md:hidden absolute left-4 right-4 top-16 z-[90]">
                    <DropdownPanel fullWidth>
                      <div className="px-2 py-1 text-sm font-semibold">Notifications</div>
                      <div className="divide-y divide-[var(--border)] max-h-80 overflow-auto">
                        <NotifItem title="PNR AD4K9Q ticketed" meta="Just now" />
                        <NotifItem title="Low wallet threshold crossed" meta="10m ago" />
                        <NotifItem title="Refund processed ₹2,350" meta="Yesterday" />
                      </div>
                    </DropdownPanel>
                  </div>
                )}

                {/* ✅ Profile (Enterprise pill) */}
                <div
                  className="relative"
                  ref={profileRef}
                  onMouseEnter={() => openMenu("profile")}
                  onMouseLeave={() => scheduleCloseMenu("profile")}
                >
                  <ProfilePill
                    tone={headerIsWhite ? "solid" : "glass"}
                    open={profileOpen}
                    name={agency.name}
                    agentId={agency.agentId}
                    badge={agency.kyc}
                    onClick={() => toggleMenu("profile")}
                  />

                  {profileOpen && (
                    <DropdownPanel widthClass="w-72">
                      <div className="px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold">{agency.name}</div>
                            <div className="text-xs text-[var(--muted)]">
                              Agent ID: {agency.agentId}
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primarySoft)] border border-[var(--border)] text-[var(--text)]">
                            {agency.kyc}
                          </span>
                        </div>
                      </div>

                      <div className="border-t my-2 border-[var(--border)]" />
                      <MenuLink onClick={() => go("/agency-settings")}>My Profile</MenuLink>
                      <MenuLink onClick={() => go("/agency-settings")}>Agency Settings</MenuLink>
                      <MenuLink onClick={closeAll}>GST & KYC</MenuLink>
                      <MenuLink onClick={closeAll}>Payout Accounts</MenuLink>
                      <div className="border-t my-2 border-[var(--border)]" />
                      <MenuLink danger onClick={handleLogout}>
                        Logout
                      </MenuLink>
                    </DropdownPanel>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/* =========================
   Dropdown panel + arrow + animation
   ========================= */
function DropdownPanel({ children, fullWidth = false, widthClass = "w-80" }) {
  return (
    <div
      className={[
        "absolute top-full z-[90]",
        fullWidth ? "left-0 right-0" : `right-0 ${widthClass}`,
        "origin-top animate-[ddIn_.18s_ease-out_forwards]",
        "bg-[var(--surface)] text-[var(--text)]",
        "border border-[var(--border)] rounded-md shadow-xl p-3",
      ].join(" ")}
    >
      {!fullWidth && (
        <div className="absolute -top-2 right-6 w-4 h-4 rotate-45 bg-[var(--surface)] border-l border-t border-[var(--border)]" />
      )}

      <style>{`
        @keyframes ddIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(8px) scale(1); }
        }
      `}</style>

      {children}
    </div>
  );
}

/* =========================
   Strip tile pieces
   ========================= */
function QuickTileButton({
  icon,
  title,
  subtitle,
  open,
  onClick,
  tone = "light",
  caret = true,
}) {
  const isLight = tone === "light"; // light = hero top (text white)
  const titleCls = isLight ? "text-white" : "text-[var(--text)]";
  const subCls = isLight ? "text-white/70" : "text-[var(--muted)]";
  const caretCls = isLight ? "text-white/70" : "text-[var(--muted)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-full px-4 py-2 inline-flex items-center gap-3 text-left transition-colors rounded-md cursor-pointer",
        isLight ? "hover:bg-white/10" : "hover:bg-[var(--surface2)]",
      ].join(" ")}
    >
      <span className="grid place-items-center shrink-0">{icon}</span>

      {(title || subtitle) && (
        <span className="leading-tight">
          {title && (
            <span className={["block text-[13px] font-bold whitespace-nowrap", titleCls].join(" ")}>
              {title}
            </span>
          )}
          {subtitle && (
            <span className={["block text-[11px] whitespace-nowrap", subCls].join(" ")}>
              {subtitle}
            </span>
          )}
        </span>
      )}

      {caret && (
        <span className="ml-2">
          <ChevronDown className={[caretCls, open ? "rotate-180" : ""].join(" ")} />
        </span>
      )}
    </button>
  );
}

function QuickSep({ tone = "light" }) {
  const cls = tone === "light" ? "border-white/30" : "border-[var(--border)]";
  return <div className={["w-px my-2 border-l border-dashed", cls].join(" ")} />;
}

/* =========================
   ✅ Enterprise Profile Pill
   ========================= */
function ProfilePill({ tone = "glass", open, name, agentId, badge, onClick }) {
  const isGlass = tone === "glass";

  const wrapCls = isGlass
    ? "bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md"
    : "bg-[var(--surface)] hover:bg-[var(--surface2)] border border-[var(--border)]";

  const nameCls = isGlass ? "text-white" : "text-[var(--text)]";
  const idCls = isGlass ? "text-white/70" : "text-[var(--muted)]";
  const caretCls = isGlass ? "text-white/70" : "text-[var(--muted)]";

  const badgeCls = isGlass
    ? "bg-white/10 border border-white/15 text-white/90"
    : "bg-[var(--primarySoft)] border border-[var(--border)] text-[var(--text)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-10 pl-1 pr-2 md:pr-3 inline-flex items-center gap-2 rounded-md",
        "transition-colors shadow-sm",
        wrapCls,
      ].join(" ")}
    >
      <Avatar size="sm" />

      <div className="hidden md:flex items-center gap-2 min-w-0">
        <div className="min-w-0 ">
          <div className={["text-[13px] font-semibold leading-tight truncate max-w-[10.5rem]", nameCls].join(" ")}>
            {name}
          </div>
          <div className={["text-[11px] leading-tight truncate", idCls].join(" ")}>
            ID: {agentId}
          </div>
        </div>


      </div>

      <span className="ml-1">
        <ChevronDown className={[caretCls, open ? "rotate-180" : ""].join(" ")} />
      </span>
    </button>
  );
}

/* --- small building blocks --- */
function DropItem({ children, onClick }) {
  return (
    <button
      className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--surface2)] text-sm cursor-pointer" 
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function InfoTile({ title, value }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface2)] p-3">
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
        "w-full text-left px-3 py-2 rounded-md hover:bg-[var(--surface2)] text-sm",
        danger ? "text-red-600 hover:bg-red-50" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Avatar({ size = "md" }) {
  const cls = size === "sm" ? "w-8 h-8 text-[12px]" : "w-9 h-9 text-sm";
  return (
    <div className={[cls, "rounded-full bg-[var(--primary)] text-white grid place-items-center font-bold"].join(" ")}>
      SK
    </div>
  );
}

/* icons */
function ChevronDown({ className = "" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={["w-4 h-4 transition-transform duration-200", className].join(" ")}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5.6 7.6a1 1 0 0 1 1.4 0L10 10.6l3-3a1 1 0 1 1 1.4 1.4l-3.7 3.7a1 1 0 0 1-1.4 0L5.6 9a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}

function SupportBadgeIcon() {
  return (
    <img
      src="https://cdn-icons-png.flaticon.com/128/8743/8743839.png"
      className="w-8"
      alt="Support"
    />
  );
}
function WalletBadgeIcon() {
  return (
    <img
      src="https://cdn-icons-png.flaticon.com/128/17023/17023541.png"
      className="w-8"
      alt="Wallet"
    />
  );
}
function NotifBadgeIcon() {
  return (

    <img
      src="https://cdn-icons-png.flaticon.com/128/890/890941.png"
      className="w-8"
      alt="Wallet"
    />
  );
}
function BookingsBadgeIcon() {
  return (
    <img
      src="https://cdn-icons-png.flaticon.com/128/3078/3078971.png"
      className="w-8"
      alt="Bookings"
    />
  );
}

/* Mobile icons */
function SupportIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2a8 8 0 0 0-8 8v4a3 3 0 0 0 3 3h1v-8H7a5 5 0 0 1 10 0h-1v8h1a3 3 0 0 0 3-3v-4a8 8 0 0 0-8-8Zm-4 17a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-1H8v1Z" />
    </svg>
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
function BookingsIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 8H5v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10Z" />
    </svg>
  );
}

function formatMoney(n) {
  return Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
