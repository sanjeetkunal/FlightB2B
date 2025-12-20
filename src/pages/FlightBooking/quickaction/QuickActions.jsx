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
  {
    key: "import_pnr",
    label: "Import PNR",
    icon: Download,
    route: "/import-pnr",
    desc: "Retrieve booking using PNR",
    primary: true,
  },
  {
    key: "book_hold",
    label: "Book & Hold",
    icon: PauseCircle,
    route: "/book-hold",
    desc: "Reserve fare without ticketing",
    disabledReason: "Insufficient credit limit",
  },
  {
    key: "issue",
    label: "Issue Ticket",
    icon: Ticket,
    route: "/issue",
    desc: "Confirm & issue ticket",
  },
  {
    key: "reschedule",
    label: "Reschedule",
    icon: RefreshCcw,
    route: "/reschedule",
    desc: "Modify travel dates",
  },
  {
    key: "cancel",
    label: "Cancel Booking",
    icon: XCircle,
    route: "/cancel",
    desc: "Cancel issued ticket",
  },
  {
    key: "refund",
    label: "Refund Status",
    icon: Wallet,
    route: "/refunds",
    desc: "Track refund progress",
  },
];

export default function QuickActions({ disabledKeys = [] }) {
  const navigate = useNavigate();

  return (
    <div className="mt-6">
      {/* ===== Header ===== */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          Quick Actions
        </h3>
        <p className="text-xs text-gray-500">
          Common tasks for faster flight operations
        </p>
      </div>

      {/* ===== Action Dock ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const disabled = disabledKeys.includes(a.key);

          return (
            <button
              key={a.key}
              onClick={() => !disabled && navigate(a.route)}
              disabled={disabled}
              title={disabled ? a.disabledReason : a.desc}
              className={`
                group relative rounded-2xl bg-white px-4 py-4
                flex flex-col items-center gap-2 text-sm font-medium text-center
                transition-all
                shadow-[0_2px_8px_rgba(0,0,0,0.06)]
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${
                  disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:-translate-y-0.5 hover:shadow-md"
                }
                ${a.primary ? "ring-1 ring-blue-100" : ""}
              `}
            >
              {/* Icon */}
              <span
                className={`
                  flex h-11 w-11 items-center justify-center rounded-full
                  ${
                    a.primary
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-600"
                  }
                `}
              >
                <Icon size={20} />
              </span>

              {/* Label */}
              <span>{a.label}</span>

              {/* Helper text (hover) */}
              <span
                className="
                  pointer-events-none absolute -bottom-7
                  text-[10px] text-gray-500 opacity-0
                  group-hover:opacity-100 transition
                "
              >
                {a.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
