import { useNavigate } from "react-router-dom";
import {
  Download,
  PauseCircle,
  Ticket,
  RefreshCcw,
  XCircle,
  Wallet,
} from "lucide-react";

const ACTIONS = [
  { key: "import_pnr", label: "Import PNR", icon: Download, route: "/import-pnr" },
  { key: "book_hold", label: "Book & Hold", icon: PauseCircle, route: "/book-hold" },
  { key: "issue", label: "Issue Ticket", icon: Ticket, route: "/issue" },
  { key: "reschedule", label: "Reschedule", icon: RefreshCcw, route: "/reschedule" },
  { key: "cancel", label: "Cancel Booking", icon: XCircle, route: "/cancel" },
  { key: "refund", label: "Refund Status", icon: Wallet, route: "/refunds" },
];

export default function QuickActions({ disabledKeys = [] }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        const disabled = disabledKeys.includes(a.key);

        return (
          <button
            key={a.key}
            onClick={() => !disabled && navigate(a.route)}
            disabled={disabled}
            className={`
              relative rounded-2xl border bg-white px-4 py-4
              flex flex-col items-center gap-2 text-sm font-medium
              transition shadow-[0_1px_3px_rgba(0,0,0,0.06)]
              ${disabled
                ? "opacity-40 cursor-not-allowed"
                : "hover:-translate-y-0.5 hover:shadow-md"}
            `}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <Icon size={20} className="text-blue-600" />
            </span>
            <span className="text-center">{a.label}</span>
          </button>
        );
      })}
    </div>
  );
}
