// src/pages/dashboard/components/DashboardMain.tsx
import { useState } from "react";
import SideMenu, { type DashboardSection } from "./SideMenu";

type Booking = {
  id: string;
  sector: string;
  date: string;
  pnr: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  amount: string;
};

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "1",
    sector: "DEL → BOM",
    date: "20 Nov 2025 · 09:30",
    pnr: "AD4K9Q",
    status: "Upcoming",
    amount: "₹7,850",
  },
  {
    id: "2",
    sector: "BOM → DXB",
    date: "28 Nov 2025 · 01:15",
    pnr: "DXB778",
    status: "Upcoming",
    amount: "₹21,340",
  },
  {
    id: "3",
    sector: "DEL → GOI",
    date: "05 Oct 2025 · 15:20",
    pnr: "G4A221",
    status: "Completed",
    amount: "₹6,420",
  },
];

const MOCK_TRANSACTIONS = [
  { id: 1, label: "Wallet Top-up", time: "Today · 10:22 AM", amount: "+ ₹25,000" },
  { id: 2, label: "Commission Credit (AD4K9Q)", time: "Yesterday · 06:10 PM", amount: "+ ₹1,250" },
  { id: 3, label: "Ticket Purchase (DEL → BOM)", time: "Yesterday · 02:45 PM", amount: "− ₹6,600" },
];

export default function DashboardMain() {
  const [section, setSection] = useState<DashboardSection>("overview");

  const handleLogout = () => {
    // yahan tu header wala logout logic reuse kar sakta hai
    console.log("logout from dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="py-6">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* Left: side menu */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <SideMenu active={section} onChange={setSection} onLogout={handleLogout} />
          </div>

          {/* Right: main content */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9">
            {section === "overview" && <Overview />}
            {section === "bookings" && <Bookings />}
            {section === "wallet" && <Wallet />}
            {section === "profile" && <Profile />}
            {section === "support" && <Support />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================== Sections ================== */

function Overview() {
  return (
    <div className="space-y-5">
      {/* Greeting + quick CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Good evening, Sanjeet 👋
          </h1>
          <p className="text-sm text-slate-500">
            Track your flight bookings, wallet balance and commissions in one place.
          </p>
        </div>

        <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
          + New Flight Search
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Upcoming Trips"
          value="02"
          chip="Next 7 days"
          tone="blue"
        />
        <StatCard
          label="Completed Trips"
          value="18"
          chip="Last 30 days"
          tone="green"
        />
        <StatCard
          label="Wallet Balance"
          value="₹45,230"
          chip="Available now"
          tone="amber"
        />
        <StatCard
          label="Commission Earned"
          value="₹12,540"
          chip="This month"
          tone="violet"
        />
      </div>

      {/* Two-column layout: upcoming + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming flights */}
        <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm border border-slate-200">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Upcoming Flights
              </h2>
              <p className="text-xs text-slate-500">
                Next 10 days – quickly manage your departures.
              </p>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-500">
              View all
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_BOOKINGS.slice(0, 3).map((b) => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {b.sector}
                  </div>
                  <div className="text-xs text-slate-500">{b.date}</div>
                  <div className="text-[11px] text-slate-400">
                    PNR: <span className="font-mono">{b.pnr}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm font-semibold text-slate-900">
                    {b.amount}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-100">
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
          <div className="px-4 pt-4 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Activity
            </h2>
            <p className="text-xs text-slate-500">
              Wallet top-ups, refunds and commissions.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_TRANSACTIONS.map((t) => (
              <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-900">{t.label}</div>
                  <div className="text-[11px] text-slate-500">{t.time}</div>
                </div>
                <div className="text-xs font-semibold text-slate-900">{t.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bookings() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            My Bookings
          </h2>
          <p className="text-sm text-slate-500">
            Manage, modify or cancel your flight tickets.
          </p>
        </div>
        <div className="flex gap-2">
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
            <option>All statuses</option>
            <option>Upcoming</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
          <input
            placeholder="Search by PNR / sector"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 w-44"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/80 text-xs text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Sector</th>
              <th className="px-4 py-3 text-left">Date / Time</th>
              <th className="px-4 py-3 text-left">PNR</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_BOOKINGS.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{b.sector}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{b.date}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{b.pnr}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium border",
                      b.status === "Upcoming"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : b.status === "Completed"
                        ? "bg-slate-50 text-slate-700 border-slate-200"
                        : "bg-red-50 text-red-700 border-red-100",
                    ].join(" ")}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                  {b.amount}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-500">
                    View details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {MOCK_BOOKINGS.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-slate-500">
            No bookings found.
          </div>
        )}
      </div>
    </div>
  );
}

function Wallet() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Wallet</h2>
          <p className="text-sm text-slate-500">
            Add funds, view statements and track refunds.
          </p>
        </div>
        <button className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500">
          + Add Funds
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Available Balance</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">₹45,230.00</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Credit Limit</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">₹2,00,000</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">On Hold</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">₹0.00</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Recent Wallet Activity</h3>
            <p className="text-xs text-slate-500">Last 10 transactions</p>
          </div>
          <button className="text-xs text-blue-600 font-semibold hover:text-blue-500">
            Download Statement
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {MOCK_TRANSACTIONS.map((t) => (
            <div key={t.id} className="px-4 py-3 flex items-center justify-between text-sm">
              <div>
                <div className="text-slate-900">{t.label}</div>
                <div className="text-[11px] text-slate-500">{t.time}</div>
              </div>
              <div className="font-semibold text-slate-900">{t.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Profile() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-white grid place-items-center text-lg font-bold">
            SK
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Sanjeet Kunal</div>
            <div className="text-xs text-slate-500">Agent ID: V2A-2217</div>
            <span className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-100">
              KYC Verified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-slate-500">Email</div>
            <div className="text-slate-900">youremail@example.com</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Mobile</div>
            <div className="text-slate-900">+91-9876543210</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Agency Name</div>
            <div className="text-slate-900">Your Travel Agency</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Location</div>
            <div className="text-slate-900">New Delhi, India</div>
          </div>
        </div>

        <button className="mt-2 inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          Edit Profile
        </button>
      </div>
    </div>
  );
}

function Support() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Support</h2>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 text-sm">
        <p className="text-slate-600">
          Need help with a booking, refund or payment? Reach out to our 24x7 B2B
          support team.
        </p>
        <div className="space-y-2">
          <div>
            <div className="text-xs text-slate-500">Support Hotline</div>
            <div className="text-slate-900 font-semibold">+91-9876543210</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Email</div>
            <div className="text-slate-900 font-semibold">b2b-support@yourdomain.com</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">WhatsApp</div>
            <div className="text-slate-900 font-semibold">+91-9876543210</div>
          </div>
        </div>

        <button className="mt-2 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500">
          Create Support Ticket
        </button>
      </div>
    </div>
  );
}

/* helper stat card */
type StatTone = "blue" | "green" | "amber" | "violet";

function StatCard({
  label,
  value,
  chip,
  tone,
}: {
  label: string;
  value: string;
  chip?: string;
  tone: StatTone;
}) {
  const toneMap: Record<StatTone, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900">{value}</div>
      {chip && (
        <span
          className={[
            "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium",
            toneMap[tone],
          ].join(" ")}
        >
          {chip}
        </span>
      )}
    </div>
  );
}
