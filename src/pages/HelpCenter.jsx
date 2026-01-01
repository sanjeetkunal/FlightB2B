// src/pages/dashboard/help/HelpCenter.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Bus,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  Headphones,
  Hotel,
  Info,
  LifeBuoy,
  Mail,
  Phone,
  Search as SearchIcon,
  ShieldCheck,
  Ticket,
  Train,
} from "lucide-react";

/**
 * Enterprise Help Center (B2B Travel Portal)
 * ✅ No static colors (theme vars only)
 * Expected vars:
 * --surface, --surface2, --text, --muted, --border,
 * --primary, --primaryHover, --primarySoft
 *
 * Notes:
 * - Replace CONTACT + LINKS with your real details
 * - Replace "nav(...)" routes as per your app
 */

function cx(...cls) {
  return cls.filter(Boolean).join(" ");
}

const CATEGORIES = [
  {
    key: "FLIGHT",
    title: "Flights",
    icon: <Ticket size={18} />,
    desc: "Booking, cancellation, reschedule, baggage, refunds, GST invoicing, fare rules.",
  },
  {
    key: "HOTEL",
    title: "Hotels",
    icon: <Hotel size={18} />,
    desc: "Voucher, check-in, amendments, cancellation policy, invoice, GST, support.",
  },
  {
    key: "TRAIN",
    title: "Trains",
    icon: <Train size={18} />,
    desc: "PNR, seat availability, cancellation/refund, schedule changes, agent workflow.",
  },
  {
    key: "BUS",
    title: "Buses",
    icon: <Bus size={18} />,
    desc: "Seat selection, operator rules, cancellation/refund, boarding point, support.",
  },
];

const FAQ = [
  // FLIGHTS
  {
    id: "F1",
    category: "FLIGHT",
    q: "How do I book a flight for an agent/customer?",
    a: "Search → select fare → review traveller details → add GST (if required) → pay using wallet → confirm booking. Always verify fare rules before issuing.",
    tags: ["booking", "workflow", "wallet"],
  },
  {
    id: "F2",
    category: "FLIGHT",
    q: "What is a HOLD / fare block and when is it used?",
    a: "A HOLD temporarily blocks wallet/fare for validation or ticketing window. If ticket is not issued within the time limit, the hold may auto-release.",
    tags: ["hold", "ticketing", "wallet"],
  },
  {
    id: "F3",
    category: "FLIGHT",
    q: "Cancellation and refund timeline?",
    a: "Refund depends on airline policy and fare type. After cancellation, the refund is processed as per airline settlement; status is visible in Refunds & Adjustments.",
    tags: ["refund", "cancel", "timeline"],
  },
  {
    id: "F4",
    category: "FLIGHT",
    q: "How do I add GST details / invoice?",
    a: "On traveller/payment step, enter GSTIN + company details. GST invoice is generated based on applicable services and may vary by product.",
    tags: ["gst", "invoice"],
  },

  // HOTELS
  {
    id: "H1",
    category: "HOTEL",
    q: "How do I get hotel voucher after booking?",
    a: "After confirmation, download voucher from booking details. Share voucher with guest for check-in. Keep ID requirements in mind.",
    tags: ["voucher", "booking"],
  },
  {
    id: "H2",
    category: "HOTEL",
    q: "Can I change guest name or dates?",
    a: "Depends on property policy. If amendable, raise an amendment request from booking details; otherwise cancel & rebook may be required.",
    tags: ["amend", "dates", "guest"],
  },
  {
    id: "H3",
    category: "HOTEL",
    q: "Hotel cancellation policy where to check?",
    a: "Open hotel details → cancellation policy section. Always check cutoff timings and penalty amounts before confirming with customer.",
    tags: ["policy", "cancel"],
  },

  // TRAINS
  {
    id: "T1",
    category: "TRAIN",
    q: "Where can I track PNR / live status?",
    a: "Use booking details page for PNR status. Schedule updates can happen; share status with customer before departure.",
    tags: ["pnr", "status"],
  },
  {
    id: "T2",
    category: "TRAIN",
    q: "Train cancellation and refund rules?",
    a: "Refunds depend on cancellation time and railway rules. Once cancelled, refund status is shown in transaction ledger / refunds.",
    tags: ["cancel", "refund"],
  },

  // BUS
  {
    id: "B1",
    category: "BUS",
    q: "How to choose boarding point and seat?",
    a: "Select bus → choose boarding & dropping points → seat layout → confirm traveller details → pay and download ticket.",
    tags: ["boarding", "seat", "ticket"],
  },
  {
    id: "B2",
    category: "BUS",
    q: "Bus cancellation / partial refund?",
    a: "Operator policy applies. Cancellation charges vary by time before departure. Check policy before confirming.",
    tags: ["policy", "refund"],
  },

  // WALLET & ACCOUNT (Common)
  {
    id: "C1",
    category: "FLIGHT",
    q: "How does wallet top-up work (agent vs admin)?",
    a: "Agent creates a top-up request with UTR/proof → admin verifies → wallet is credited. Until approval, request stays pending.",
    tags: ["wallet", "topup", "admin"],
  },
  {
    id: "C2",
    category: "HOTEL",
    q: "How do I download statement for finance?",
    a: "Go to Wallet → Statement Export → choose period and format (CSV/XLSX/PDF). Use CSV for reconciliation, PDF for audits.",
    tags: ["statement", "export"],
  },
];

const CONTACT = {
  phone: "+91-XXXXXXXXXX",
  email: "support@yourcompany.com",
  hours: "Mon–Sat, 10:00 AM – 7:00 PM",
  sla: "Typical response: within 2–4 business hours",
};

const QUICK_LINKS = [
  { label: "Wallet & Top-up Requests", hint: "Ledger, statement, add funds", route: "/admin/wallet" },
  { label: "My Bookings", hint: "Flights / Hotels / Trains / Buses", route: "/admin/bookings" },
  { label: "Refunds & Adjustments", hint: "Refund status & logs", route: "/admin/wallet/refunds" },
  { label: "Company Profile / GST", hint: "GSTIN & invoices", route: "/admin/settings/company" },
];

function Pill({ children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        "border-[color:var(--border)] bg-[var(--surface2)] text-[var(--muted)]"
      )}
    >
      {children}
    </span>
  );
}

function EmptyState({ title, desc }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-6 text-center">
      <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primarySoft)]">
        <Info size={18} />
      </div>
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-[var(--muted)]">{desc}</div>
    </div>
  );
}

export default function HelpCenter() {
  const nav = useNavigate();

  const [activeCat, setActiveCat] = useState("FLIGHT");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const filteredFaq = useMemo(() => {
    const q = query.trim().toLowerCase();

    return FAQ.filter((x) => {
      if (activeCat !== "ALL" && x.category !== activeCat) return false;
      if (!q) return true;

      const hay = `${x.q} ${x.a} ${(x.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [activeCat, query]);

  const showAll = useMemo(() => query.trim().length > 0, [query]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--surface2)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[260px]">
            <div className="text-[12px] text-[var(--muted)]">
              Support <span className="opacity-60">/</span> Help Center
            </div>
            <h1 className="mt-1 text-xl font-semibold">Help Center</h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Find quick answers for B2B Flights, Hotels, Trains & Buses — plus wallet and refunds.
            </p>
          </div>

          <button
            onClick={() => nav(-1)}
            type="button"
            className={cx(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold",
              "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
            )}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Top: Search + Contact */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Search card */}
          <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="border-b border-[color:var(--border)] p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primarySoft)]">
                  <BookOpen size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">Search help articles</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    Try: “refund timeline”, “GST invoice”, “hold”, “PNR”, “voucher”.
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 focus-within:border-[color:var(--primary)]">
                <SearchIcon size={16} className="opacity-70" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setOpenId(null);
                  }}
                  placeholder="Search in Help Center..."
                  className="w-full bg-transparent text-[12px] outline-none"
                />
                {query?.trim() ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setOpenId(null);
                    }}
                    className="rounded-md border border-[color:var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] font-semibold hover:bg-[var(--surface2)]"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            {/* Category tabs */}
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCat("ALL");
                    setOpenId(null);
                  }}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold",
                    activeCat === "ALL" || showAll
                      ? "border-[color:var(--primary)] bg-[var(--primarySoft)]"
                      : "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                  )}
                  title="Show all categories"
                >
                  <LifeBuoy size={16} />
                  All
                </button>

                {CATEGORIES.map((c) => {
                  const active = activeCat === c.key && !showAll;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setActiveCat(c.key);
                        setOpenId(null);
                      }}
                      className={cx(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold",
                        active
                          ? "border-[color:var(--primary)] bg-[var(--primarySoft)]"
                          : "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                      )}
                      title={c.desc}
                    >
                      {c.icon}
                      {c.title}
                    </button>
                  );
                })}
              </div>

              {/* Category description */}
              <div className="mt-3 rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2 text-[11px] text-[var(--muted)]">
                <div className="flex items-start gap-2">
                  <Info size={14} className="mt-0.5" />
                  <div>
                    {showAll ? (
                      <span>
                        Showing <b>all</b> results because you searched “{query.trim()}”.
                      </span>
                    ) : (
                      <span>
                        {CATEGORIES.find((x) => x.key === activeCat)?.desc ||
                          "Browse all categories or search above."}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact card */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primarySoft)]">
                  <Headphones size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">Contact support</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">{CONTACT.sla}</div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2">
                  <div className="inline-flex items-center gap-2">
                    <Phone size={16} />
                    <span className="font-semibold">Phone</span>
                  </div>
                  <span className="text-[var(--muted)]">{CONTACT.phone}</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2">
                  <div className="inline-flex items-center gap-2">
                    <Mail size={16} />
                    <span className="font-semibold">Email</span>
                  </div>
                  <span className="text-[var(--muted)]">{CONTACT.email}</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2">
                  <div className="inline-flex items-center gap-2">
                    <Clock size={16} />
                    <span className="font-semibold">Hours</span>
                  </div>
                  <span className="text-[var(--muted)]">{CONTACT.hours}</span>
                </div>
              </div>

              <div className="mt-4 inline-flex items-start gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2 text-[11px] text-[var(--muted)]">
                <ShieldCheck size={14} className="mt-0.5" />
                <span>
                  For faster resolution, share <b>PNR / Booking Ref</b>, passenger name and
                  issue summary.
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primarySoft)]">
                  <FileText size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">Quick links</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    Jump to commonly used pages.
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {QUICK_LINKS.map((x) => (
                  <button
                    key={x.label}
                    type="button"
                    onClick={() => nav(x.route)}
                    className={cx(
                      "w-full rounded-lg border px-3 py-2 text-left text-xs",
                      "border-[color:var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold">{x.label}</div>
                        <div className="text-[11px] text-[var(--muted)]">{x.hint}</div>
                      </div>
                      <ExternalLink size={16} className="opacity-70" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ list */}
        <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--border)] px-5 py-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold">
              <LifeBuoy size={16} />
              FAQs
            </div>
            <div className="text-[11px] text-[var(--muted)]">
              Showing <b className="text-[var(--text)]">{filteredFaq.length}</b> result(s)
            </div>
          </div>

          <div className="p-4 space-y-2">
            {filteredFaq.length === 0 ? (
              <EmptyState
                title="No results found"
                desc="Try different keywords like “refund”, “GST”, “voucher”, “PNR”, “hold”, “cancellation”."
              />
            ) : (
              filteredFaq.map((item) => {
                const open = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : item.id)}
                      className="w-full px-4 py-3 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{item.q}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Pill>
                              {item.category === "FLIGHT"
                                ? "Flights"
                                : item.category === "HOTEL"
                                ? "Hotels"
                                : item.category === "TRAIN"
                                ? "Trains"
                                : "Buses"}
                            </Pill>
                            {(item.tags || []).slice(0, 3).map((t) => (
                              <Pill key={t}>{t}</Pill>
                            ))}
                          </div>
                        </div>
                        <ChevronDown
                          size={18}
                          className={cx("mt-1 opacity-70 transition", open && "rotate-180")}
                        />
                      </div>
                    </button>

                    {open ? (
                      <div className="border-t border-[color:var(--border)] px-4 py-3 text-sm">
                        <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2 text-[12px] text-[var(--muted)]">
                          {item.a}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category cards (discoverability) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setActiveCat(c.key);
                setQuery("");
                setOpenId(null);
              }}
              className={cx(
                "rounded-xl border p-4 text-left shadow-sm transition",
                "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
              )}
              title={c.desc}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primarySoft)]">
                  {c.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold">{c.title}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">{c.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
