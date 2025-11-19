// src/pages/dashboard/components/SideMenu.tsx
import { JSX } from "react";
import { useNavigate } from "react-router-dom";

export type DashboardSection =
  | "overview"
  | "bookings"
  | "wallet"
  | "profile"
  | "support";

type SideMenuProps = {
  active: DashboardSection;
  onChange: (section: DashboardSection) => void;
  onLogout?: () => void;
};

const menuItems: { key: DashboardSection; label: string; icon: (props: { className?: string }) => JSX.Element }[] = [
  { key: "overview", label: "Overview", icon: HomeIcon },
  { key: "bookings", label: "My Bookings", icon: TicketIcon },
  { key: "wallet", label: "Wallet", icon: WalletIcon },
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "support", label: "Support", icon: HeadsetIcon },
];

export default function SideMenu({ active, onChange, onLogout }: SideMenuProps) {
  const navigate = useNavigate();

  const handleItemClick = (key: DashboardSection) => {
    onChange(key);
    // optional: agar route split karna ho to yahan navigate use kar sakte ho
    // if (key === "bookings") navigate("/dashboard/bookings");
  };

  return (
    <aside className="h-full rounded-2xl bg-slate-900 text-slate-100 p-3 flex flex-col shadow-xl">
      {/* Top brand / mini logo */}
      <div className="mb-4 flex items-center gap-3 px-2">
        <div className="h-9 w-9 rounded-xl bg-blue-500/90 grid place-items-center text-white font-bold text-lg">
          ✈
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide">Flight Console</div>
          <div className="text-[11px] text-slate-400">Agent Dashboard</div>
        </div>
      </div>

      {/* Menu items */}
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleItemClick(item.key)}
              className={[
                "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : "text-slate-200 hover:bg-slate-800/70 hover:text-white",
              ].join(" ")}
            >
              <Icon
                className={
                  "h-4 w-4 " +
                  (isActive ? "text-blue-600" : "text-slate-300 group-hover:text-white")
                }
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom section: quick CTA + logout */}
      <div className="mt-4 border-t border-slate-700 pt-3 space-y-2">
        <button
          type="button"
          onClick={() => navigate("/flight-search")}
          className="w-full rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold py-2.5 shadow-sm"
        >
          + New Flight Booking
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-transparent py-2 text-xs font-semibold text-red-200 hover:bg-red-500/10"
        >
          <LogoutIcon className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

/* === icons === */

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 3 3 10h2v10h5v-6h4v6h5V10h2L12 3Z" />
    </svg>
  );
}
function TicketIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4 6a2 2 0 0 0-2 2v2.5a1.5 1.5 0 1 1 0 3V16a2 2 0 0 0 2 2h16V6H4Zm11 2h3v2h-3V8Zm0 4h3v2h-3v-2Z" />
    </svg>
  );
}
function WalletIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 7a3 3 0 0 1 3-3h12v2H6a1 1 0 0 0-1 1v1h15a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7Zm18 5h-5v4h5a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c-4.418 0-8 2.015-8 4.5V20h16v-1.5C20 16.015 16.418 14 12 14Z" />
    </svg>
  );
}
function HeadsetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 3a7 7 0 0 0-7 7v6a3 3 0 0 0 3 3h1v-5H7v-4a5 5 0 0 1 10 0v4h-2v5h1a3 3 0 0 0 3-3v-6a7 7 0 0 0-7-7Z" />
    </svg>
  );
}
function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M10 5h9a1 1 0 0 1 1 1v4h-2V7h-8v10h8v-3h2v4a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm3.293 4.293 1.414-1.414L19.828 13l-5.12 5.121-1.415-1.415L16 14h-7v-2h7l-2.707-2.707Z" />
    </svg>
  );
}
