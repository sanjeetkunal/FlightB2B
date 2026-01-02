// src/components/footer/B2BFooter.jsx
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock,
  ExternalLink,
  Globe,
  Handshake,
  Headphones,
  HelpCircle,
  Laptop,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

// ✅ NOTE: path apne project structure ke hisaab se adjust kar lena
// Example: "../../assets/media/support-women.png" (agar assets src/assets me hai)
import supportWoman from "../assets/media/support-women.png";

/**
 * B2BFooter.jsx — Top-level Enterprise Footer (theme vars only)
 * ✅ No static colors (ONLY CSS vars)
 * Expected vars:
 * --surface, --surface2, --text, --muted, --border,
 * --primary, --primaryHover, --primarySoft
 */

function cx(...cls) {
  return cls.filter(Boolean).join(" ");
}

export default function B2BFooter() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [email, setEmail] = useState("");

  const columns = useMemo(
    () => [
      {
        title: "Products",
        links: [
          { label: "Flights (GDS / NDC)", href: "#" },
          { label: "Hotels & Apartments", href: "#" },
          { label: "Trains & Buses", href: "#" },
          { label: "Insurance & Add-ons", href: "#" },
          { label: "Wallet & Credit", href: "#" },
        ],
      },
      {
        title: "Solutions",
        links: [
          { label: "For Small Agencies", href: "#" },
          { label: "For Enterprises / TMCs", href: "#" },
          { label: "Corporate Booking", href: "#" },
          { label: "API / White-label", href: "#" },
          { label: "Group Desk", href: "#" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Help Center", href: "/help" },
          { label: "Knowledge Base", href: "#" },
          { label: "Ticketing SLA", href: "#" },
          { label: "Release Notes", href: "#" },
          { label: "Developer Docs", href: "#" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Partners", href: "#" },
          { label: "Careers", href: "#" },
          { label: "Press", href: "#" },
          { label: "Contact", href: "/contact" },
        ],
      },
    ],
    []
  );

  const legal = useMemo(
    () => [
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Responsible Disclosure", href: "#" },
      { label: "Compliance", href: "#" },
    ],
    []
  );

  const trustBadges = useMemo(
    () => ["PCI-DSS", "ISO 27001", "IATA TIDS", "GST Ready", "24×7 Ops Desk"],
    []
  );

  const partnerLogos = useMemo(
    () => [
      {
        name: "Amadeus",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Amadeus_%28CRS%29_Logo.svg/1200px-Amadeus_%28CRS%29_Logo.svg.png",
        w: 92,
        h: 22,
      },
      {
        name: "Sabre",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Sabre_Corporation_logo.svg/2560px-Sabre_Corporation_logo.svg.png",
        w: 78,
        h: 22,
      },
      {
        name: "Travelport",
        src: "https://i0.wp.com/www.opendestinations.com/wp-content/uploads/2018/03/logo-travelport.png?fit=799%2C250&ssl=1",
        w: 104,
        h: 22,
      },
    ],
    []
  );

  return (
    <footer className="relative border-t border-[color:var(--border)] bg-[var(--surface2)] text-[var(--text)]">
      <Backdrop />

      {/* ===== Top CTA (Enterprise band) ===== */}
      <section className="relative border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-0">
          <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)]">
            {/* premium backdrop */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.9]"
              style={{
                background:
                  "radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--primarySoft) 92%, transparent), transparent 56%)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.55]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, color-mix(in srgb, var(--border) 70%, transparent) 1px, transparent 1px),
                  linear-gradient(to bottom, color-mix(in srgb, var(--border) 70%, transparent) 1px, transparent 1px)
                `,
                backgroundSize: "56px 56px",
                maskImage: "radial-gradient(circle at 22% 0%, black 0%, transparent 58%)",
              }}
            />

            {/* content */}
            <div className="relative p-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px] lg:items-stretch">
                {/* Left */}
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[var(--muted)]">
                    <ShieldCheck size={14} />
                    Enterprise B2B Travel Platform
                  </div>

                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
                    Build faster operations with clear controls & finance visibility.
                  </h3>

                  <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                    Unified inventory, wallet-ledger tracking, GST invoices, refund logs, and support-led workflows —
                    designed for scale.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Pill icon={<Sparkles size={14} />}>Multi-product bookings</Pill>
                    <Pill icon={<BadgeCheck size={14} />}>Audit-ready reporting</Pill>
                    <Pill icon={<Headphones size={14} />}>Structured support</Pill>
                  </div>

                  {/* Micro KPIs */}
                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <MiniKpi label="Avg. SLA" value="2–4 hrs" />
                    <MiniKpi label="Refund Tracking" value="End-to-end" />
                    <MiniKpi label="Finance Exports" value="CSV / XLSX / PDF" />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <AButton href="/contact" tone="primary" iconLeft={<Handshake size={16} />}>
                      Talk to Sales
                    </AButton>
                    <AButton href="/help" tone="ghost" iconLeft={<HelpCircle size={16} />}>
                      Help Center
                    </AButton>
                    <AButton href="/demo" tone="ghost" iconLeft={<Laptop size={16} />}>
                      Request Demo
                    </AButton>
                  </div>
                </div>

                {/* Right visual */}
                <SupportVisual
                  src={supportWoman}
                  title="Priority Support Desk"
                  sub="Share PNR / Booking Ref for faster resolution"
                  chips={["24×7 Escalation", "Ticketing SLA", "Refund Assistance"]}
                />
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {trustBadges.map((b) => (
              <TrustBadge key={b}>{b}</TrustBadge>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Main footer content ===== */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-0">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Brand + Contacts + Newsletter */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)]">
                  <div className="absolute inset-0 bg-[var(--primarySoft)] opacity-90" />
                  <div className="relative flex h-full w-full items-center justify-center text-sm font-black">
                    V2A
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="text-lg font-semibold tracking-tight">Virtual2Actual</div>
                  <div className="text-xs text-[var(--muted)]">Turning Vision Into Reality</div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
                One contract. Worldwide supply. A clean B2B portal for agencies and businesses — built for speed, accuracy,
                compliance, and post-booking resolution.
              </p>

              {/* Contact card */}
              <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primarySoft)]">
                    <Building2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Support & Sales</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      Share PNR/Booking Ref for faster resolution.
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <InfoRow icon={<Phone size={16} />} label="Phone" value="+91-XXXXXXXXXX" />
                  <InfoRow icon={<Mail size={16} />} label="Email" value="support@yourcompany.com" />
                  <InfoRow icon={<Clock size={16} />} label="Hours" value="Mon–Sat, 10:00 AM – 7:00 PM" />
                  <InfoRow icon={<MapPin size={16} />} label="Office" value="Your City, India" />
                </div>
              </div>

          
            </div>

            {/* Link columns */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
                {columns.map((c) => (
                  <LinkBlock key={c.title} title={c.title} links={c.links} />
                ))}
              </div>

              {/* Partner + selectors + socials */}
              <div className="mt-10 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[var(--muted)]">Preferred partners</div>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      {partnerLogos.map((l) => (
                        <img
                          key={l.name}
                          src={l.src}
                          width={l.w}
                          height={l.h}
                          alt={l.name}
                          loading="lazy"
                          className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition"
                          style={{ filter: "grayscale(1) contrast(1.05)" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <Selector icon={<Globe size={16} />} label="Language" options={["English", "Hindi"]} />
                      <Selector icon={<Sparkles size={16} />} label="Currency" options={["INR", "USD", "EUR", "GBP"]} />
                    </div>

                    <div className="flex items-center gap-2">
                      <Social icon="x" href="#" />
                      <Social icon="linkedin" href="#" />
                      <Social icon="youtube" href="#" />
                      <Social icon="facebook" href="#" />
                    </div>
                  </div>
                </div>
              </div>

              {/* App badges + highlights */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StoreBadge kind="apple" />
                  <StoreBadge kind="google" />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]">
                  <MiniStat icon={<ShieldCheck size={14} />} text="Secure transactions" />
                  <MiniStat icon={<BadgeCheck size={14} />} text="Compliance-first" />
                  <MiniStat icon={<Headphones size={14} />} text="Support-led ops" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom legal bar */}
          <div className="mt-10 border-t border-[color:var(--border)] pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-[var(--muted)]">
                © {year} Virtual2Actual Pvt. Ltd. All rights reserved. CIN U12345XX2020PTC000000
              </p>
              <ul className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
                {legal.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="hover:text-[var(--text)] underline-offset-4 hover:underline">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

/* ================= UI parts ================= */

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: `
            linear-gradient(to right, color-mix(in srgb, var(--border) 65%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--border) 65%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(circle at 18% 0%, black 0%, transparent 60%)",
        }}
      />
      {/* soft blobs */}
      <div
        className="absolute -right-40 -top-40 h-[680px] w-[680px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 62%)",
        }}
      />
      <div
        className="absolute -left-40 bottom-[-280px] h-[760px] w-[760px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--primarySoft) 85%, transparent), transparent 64%)",
        }}
      />
    </div>
  );
}

function SupportVisual({ src, title, sub, chips = [] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface2)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.85]"
        style={{
          background:
            "radial-gradient(circle at 30% 10%, color-mix(in srgb, var(--primarySoft) 85%, transparent), transparent 60%)",
        }}
      />

      <div className="relative h-[260px] w-full lg:h-full">
        <img
          src={src}
          alt="Support representative"
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        {/* top badge */}
        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">
            <Headphones size={14} className="opacity-80" />
            Human Support
          </span>
        </div>

        {/* overlay card */}
        <div
          className="absolute left-4 right-4 bottom-4 rounded-2xl border border-[color:var(--border)] p-4"
          style={{
            background: "color-mix(in srgb, var(--surface) 86%, transparent)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="text-sm font-semibold text-[var(--text)]">{title}</div>
          <div className="mt-1 text-xs text-[var(--muted)]">{sub}</div>

          {chips?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.slice(0, 3).map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)]"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MiniKpi({ label, value }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface2)] px-4 py-3">
      <div className="text-[11px] font-semibold text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--text)]">{value}</div>
    </div>
  );
}

function Pill({ icon, children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold",
        "border-[color:var(--border)] bg-[var(--surface2)] text-[var(--muted)]"
      )}
    >
      {icon ? <span className="opacity-90">{icon}</span> : null}
      {children}
    </span>
  );
}

function TrustBadge({ children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold",
        "border-[color:var(--border)] bg-[var(--surface)] text-[var(--muted)]"
      )}
    >
      {children}
    </span>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2.5">
      <div className="inline-flex items-center gap-2">
        <span className="opacity-80">{icon}</span>
        <span className="text-[12px] font-semibold">{label}</span>
      </div>
      <span className="text-[12px] text-[var(--muted)]">{value}</span>
    </div>
  );
}

function LinkBlock({ title, links }) {
  return (
    <nav aria-label={title}>
      <h4 className="text-sm font-semibold tracking-wide">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className={cx(
                "group inline-flex items-center gap-2 text-sm text-[var(--muted)]",
                "hover:text-[var(--text)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface2)]"
              )}
            >
              <span className="relative">
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
              </span>
              <ExternalLink
                size={14}
                className="opacity-0 -translate-x-1 transition group-hover:opacity-80 group-hover:translate-x-0"
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Selector({ label, options, icon }) {
  return (
    <label
      className={cx(
        "relative inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm",
        "border-[color:var(--border)] bg-[var(--surface2)]"
      )}
    >
      {icon ? <span className="opacity-80">{icon}</span> : null}
      <span className="text-[11px] font-semibold text-[var(--muted)]">{label}</span>
      <select
        className="appearance-none bg-transparent outline-none text-sm font-semibold text-[var(--text)]"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="pointer-events-none opacity-80">
        <path d="M5 7l5 6 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

function Social({ icon, href }) {
  const path = {
    x: "M18 2.01c-1.1.66-2.3 1.15-3.55 1.4A6.17 6.17 0 0 0 9.8 3.2C7.2 4.4 5.7 7.1 6.2 9.8 3.1 9.6 0.4 8.1 0 5.9c0 0-.8 4.8 3.7 6.8-1.4.9-3.2 1-4.7.4 0 0 1.5 4.2 6.4 4.6C2.9 19.8.6 21 0 21c4.9 3.1 11.5 1.4 14.7-3.7 2.1-3.2 2.2-7.1 1.7-10.1A9.3 9.3 0 0 0 18 2Z",
    linkedin:
      "M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM0 7h5v13H0V7Zm7 0h5v2h.1c.7-1.3 2.5-2.6 5.1-2.6 5.4 0 6.4 3.5 6.4 8.1V20H18v-5.8c0-1.4 0-3.2-2-3.2s-2.4 1.6-2.4 3.1V20H7V7Z",
    youtube:
      "M23.5 6.2c-.3-1.2-1.2-2.1-2.4-2.4C18.9 3.3 12 3.3 12 3.3s-6.9 0-9.1.5C1.7 4.1.8 5 0 6.2-.5 8.4-.5 12-.5 12s0 3.6.5 5.8c.3 1.2 1.2 2.1 2.4 2.4 2.3.5 9.1.5 9.1.5s6.9 0 9.1-.5c1.2-.3 2.1-1.2 2.4-2.4.5-2.2.5-5.8.5-5.8s0-3.6-.5-5.8ZM9.6 15.5V8.5L15.8 12l-6.2 3.5Z",
    facebook: "M13.5 22V12h3l.5-4h-3.5V6.1c0-1 .3-1.7 1.8-1.7H17V1.2C16.6 1.1 15.7 1 14.6 1 12 1 10.2 2.6 10.2 5.5V8H7v4h3.2v10h3.3Z",
  }[icon];

  return (
    <a
      href={href}
      aria-label={icon}
      className={cx(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
        "border-[color:var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface2)]"
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
      </svg>
    </a>
  );
}

function StoreBadge({ kind }) {
  const base = cx(
    "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 transition",
    "border-[color:var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface2)]"
  );

  if (kind === "apple") {
    return (
      <a href="#" className={base} aria-label="Download on the App Store">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-90">
          <path d="M16.365 1.43a5.6 5.6 0 0 1-1.36 4.305 5.1 5.1 0 0 1-3.84 1.746 5.682 5.682 0 0 1 1.386-4.39A5.32 5.32 0 0 1 16.364 1.43ZM21.64 17.86c-.36.826-.78 1.59-1.26 2.29-.67.97-1.22 1.64-1.66 2.01-.66.61-1.36.93-2.12.95-.54 0-1.2-.16-2-.48-.8-.32-1.53-.48-2.18-.48-.68 0-1.43.16-2.25.48-.82.32-1.48.49-1.98.5-.74.03-1.46-.29-2.16-.96-.47-.4-1.03-1.08-1.68-2.04-.72-1.04-1.31-2.25-1.77-3.62-.5-1.53-.75-3-.75-4.35 0-1.6.35-2.98 1.04-4.14a6.52 6.52 0 0 1 2.39-2.45c.95-.55 1.97-.84 3.05-.86.6 0 1.39.18 2.37.55.98.37 1.61.56 1.9.56.2 0 .87-.21 2.03-.62 1.09-.38 2.01-.54 2.78-.51 2.05.17 3.6.97 4.66 2.4-1.85 1.12-2.77 2.7-2.77 4.72 0 1.57.58 2.88 1.73 3.94.52.5 1.1.88 1.73 1.15-.14.4-.3.8-.47 1.2Z" />
        </svg>
        <div className="leading-none">
          <div className="text-[10px] text-[var(--muted)]">Download on the</div>
          <div className="text-xs font-semibold">App Store</div>
        </div>
      </a>
    );
  }

  return (
    <a href="#" className={base} aria-label="Get it on Google Play">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-90">
        <path d="M3.6 2.2 14 12 3.6 21.8c-.4-.3-.6-.8-.6-1.3v-17c0-.5.2-1 .6-1.3Zm10.2 9.8 2.5 2.5-8.7 5c-.4.2-.9.2-1.2 0l7.4-7.5Zm3.5-3.6 2.1 1.2c.4.2.6.6.6 1s-.2.8-.6 1l-2.1 1.2-2.9-2.9 2.9-2.9Z" />
      </svg>
      <div className="leading-none">
        <div className="text-[10px] text-[var(--muted)]">Get it on</div>
        <div className="text-xs font-semibold">Google Play</div>
      </div>
    </a>
  );
}

function MiniStat({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-3 py-1 font-semibold">
      <span className="opacity-80">{icon}</span>
      {text}
    </span>
  );
}

function AButton({ href, children, tone = "ghost", iconLeft }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition";
  const style =
    tone === "primary"
      ? "border-[color:var(--primary)] bg-[var(--primarySoft)] hover:opacity-90"
      : "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]";

  return (
    <a
      href={href}
      className={cx(
        base,
        style,
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface2)]"
      )}
    >
      {iconLeft ? <span className="opacity-90">{iconLeft}</span> : null}
      {children}
    </a>
  );
}
