// src/pages/public/AboutUs.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CircleCheck,
  FileText,
  Globe,
  Handshake,
  Headphones,
  Layers,
  Lock,
  PieChart,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

/**
 * Enterprise About Us (B2B Travel Portal)
 * ✅ No static colors (theme vars only)
 * Expected vars:
 * --surface, --surface2, --text, --muted, --border,
 * --primary, --primaryHover, --primarySoft
 */

function cx(...cls) {
  return cls.filter(Boolean).join(" ");
}

/* ---------- visuals (theme-only) ---------- */

function PatternBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              color-mix(in srgb, var(--border) 65%, transparent) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              color-mix(in srgb, var(--border) 65%, transparent) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(circle at 22% 0%, black 0%, transparent 55%)",
        }}
      />
      <div
        className="absolute -right-24 -top-24 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 62%)",
        }}
      />
      <div
        className="absolute -left-28 bottom-[-180px] h-[620px] w-[620px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--primarySoft) 85%, transparent), transparent 64%)",
        }}
      />
    </div>
  );
}

function CardShell({ children, className }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-[color:var(--border)] bg-[var(--surface)]",
        "shadow-[0_18px_40px_color-mix(in_srgb,var(--text),transparent_92%)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function Pill({ icon, children, tone = "muted" }) {
  const cls =
    tone === "primary"
      ? "border-[color:var(--primary)] bg-[var(--primarySoft)] text-[var(--text)]"
      : "border-[color:var(--border)] bg-[var(--surface2)] text-[var(--muted)]";

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold",
        cls
      )}
    >
      {icon ? <span className="opacity-90">{icon}</span> : null}
      {children}
    </span>
  );
}

function Stat({ icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primarySoft)]">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[18px] font-semibold leading-none">{value}</div>
          <div className="mt-1 text-xs font-semibold">{label}</div>
          {hint ? (
            <div className="mt-1 text-[11px] text-[var(--muted)]">{hint}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primarySoft)]">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, desc }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <div className="text-[11px] font-semibold text-[var(--muted)]">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
      {desc ? (
        <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
          {desc}
        </p>
      ) : null}
    </div>
  );
}

function TimelineItem({ step, title, desc }) {
  return (
    <div className="relative pl-10">
      <div className="absolute left-0 top-0">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface2)] text-xs font-bold">
          {step}
        </div>
      </div>
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-4">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
          {desc}
        </div>
      </div>
    </div>
  );
}

export default function AboutUs() {
  const nav = useNavigate();

  // ✅ replace with real info (or fetch from config)
  const COMPANY = {
    name: "Virtualtoactual",
    tagline: "Turning vision into reality",
    blurb:
      "We build enterprise-ready B2B travel technology that helps agencies and businesses book and manage Flights, Hotels, Trains, and Buses through a single, secure portal — with clear controls, reporting, and reliable post-booking support.",
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[var(--surface2)] text-[var(--text)]">
      <PatternBackdrop />

      <div className="relative mx-auto max-w-7xl px-4 py-6 space-y-4">
        {/* HERO */}
        <CardShell className="overflow-hidden">
          <div className="relative p-6">
            <div
              className="absolute inset-0 opacity-[0.85]"
              style={{
                background:
                  "radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--primarySoft) 90%, transparent), transparent 58%)",
              }}
            />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="text-[12px] text-[var(--muted)]">
                  Company <span className="opacity-60">/</span> About Us
                </div>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  {COMPANY.name}
                </h1>
                <div className="mt-2 text-sm text-[var(--muted)] font-semibold">
                  {COMPANY.tagline}
                </div>

                <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed">
                  {COMPANY.blurb}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Pill tone="primary" icon={<BadgeCheck size={14} />}>
                    Enterprise-ready
                  </Pill>
                  <Pill icon={<ShieldCheck size={14} />}>Secure workflows</Pill>
                  <Pill icon={<PieChart size={14} />}>Audit-friendly reporting</Pill>
                  <Pill icon={<Headphones size={14} />}>Support-led operations</Pill>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => nav(-1)}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold",
                      "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                    )}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => nav("/contact")}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold",
                      "border-[color:var(--primary)] bg-[var(--primarySoft)] hover:opacity-90"
                    )}
                  >
                    <Handshake size={16} />
                    Talk to Sales
                  </button>

                  <button
                    type="button"
                    onClick={() => nav("/help")}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold",
                      "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                    )}
                  >
                    <FileText size={16} />
                    Help Center
                  </button>
                </div>
              </div>

              {/* HERO SIDE CARD */}
              <div className="w-full max-w-[360px]">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primarySoft)]">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Built for B2B scale</div>
                      <div className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                        Fast search → controlled ticketing → clear finance trails → predictable support.
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    {[
                      "Unified bookings across products",
                      "Wallet + ledger control",
                      "GST & invoices",
                      "Refund visibility & logs",
                    ].map((t) => (
                      <div
                        key={t}
                        className="flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2"
                      >
                        <CircleCheck size={16} className="opacity-85" />
                        <span className="font-semibold">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardShell>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={<Layers size={18} />}
            value="Multi-product"
            label="Travel Inventory"
            hint="Flights • Hotels • Trains • Buses"
          />
          <Stat
            icon={<Lock size={18} />}
            value="Controls"
            label="Policy-ready Flows"
            hint="Approvals, roles, compliance"
          />
          <Stat
            icon={<PieChart size={18} />}
            value="Reports"
            label="Finance Visibility"
            hint="Statements & exports"
          />
          <Stat
            icon={<Headphones size={18} />}
            value="Support"
            label="Post-booking Ops"
            hint="Amendments • Refunds • Logs"
          />
        </div>

        {/* MISSION / VISION */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CardShell className="p-6">
            <SectionHeader
              eyebrow="Our mission"
              title="Simplify B2B travel operations with clarity and control."
              desc="We help teams and agencies move faster with reliable workflows, transparent pricing, and finance-ready reporting — without operational chaos."
            />
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Feature
                icon={<Target size={18} />}
                title="Operational speed"
                desc="Low-friction booking and ticketing designed for daily high-volume usage."
              />
              <Feature
                icon={<ShieldCheck size={18} />}
                title="Trust & compliance"
                desc="Clear logs, role-based actions, and policy-friendly structures."
              />
            </div>
          </CardShell>

          <CardShell className="p-6">
            <SectionHeader
              eyebrow="Our vision"
              title="Build the most trusted B2B travel platform for scale."
              desc="We aim to combine strong engineering, clean user experience, and support-led operations to become a dependable travel backbone for businesses."
            />
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Feature
                icon={<Rocket size={18} />}
                title="Scale-ready product"
                desc="Performance-first architecture built for growth and real-world traffic."
              />
              <Feature
                icon={<Users size={18} />}
                title="Customer-first"
                desc="Support, onboarding, and workflows that match how travel teams work."
              />
            </div>
          </CardShell>
        </div>

        {/* WHAT WE OFFER */}
        <CardShell className="p-6">
          <SectionHeader
            eyebrow="What we do"
            title="Everything your team needs for B2B travel — in one portal."
            desc="From booking to reconciliation: wallet, invoices, refunds, and visibility built-in."
          />

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={<Globe size={18} />}
              title="Unified booking"
              desc="Search, compare, and book across travel products with consistent workflows."
            />
            <Feature
              icon={<Building2 size={18} />}
              title="Business controls"
              desc="Role-based actions, operational checks, and policy-aligned flows."
            />
            <Feature
              icon={<FileText size={18} />}
              title="GST & invoices"
              desc="Invoice-ready transactions with structured details for business needs."
            />
            <Feature
              icon={<PieChart size={18} />}
              title="Statements & exports"
              desc="Download statements for finance, audits, and reconciliation (CSV/XLSX/PDF)."
            />
            <Feature
              icon={<ShieldCheck size={18} />}
              title="Refund transparency"
              desc="Status visibility and logs for cancellations, refunds, and adjustments."
            />
            <Feature
              icon={<Headphones size={18} />}
              title="Post-booking support"
              desc="Standardized support process for amendments, schedule changes, and issues."
            />
          </div>
        </CardShell>

        {/* HOW IT WORKS */}
        <CardShell className="p-6">
          <SectionHeader
            eyebrow="How it works"
            title="A clean flow from booking to closure."
            desc="Designed for faster daily operations with fewer support escalations."
          />

          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <TimelineItem
              step="01"
              title="Search & select"
              desc="Compare options and choose the right fare or policy-approved inventory."
            />
            <TimelineItem
              step="02"
              title="Pay & confirm"
              desc="Use wallet/approved payment workflows and confirm with clear references."
            />
            <TimelineItem
              step="03"
              title="Manage & reconcile"
              desc="Handle changes/refunds with logs, then export statements for finance."
            />
          </div>
        </CardShell>

        {/* TRUST / CTA */}
        <CardShell className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <SectionHeader
                eyebrow="Trust & governance"
                title="Built for reliability, reporting, and accountability."
                desc="Enterprise-friendly UI, transparent operations, and support processes that keep travel moving."
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill icon={<Lock size={14} />}>Secure-by-design</Pill>
                <Pill icon={<ShieldCheck size={14} />}>Audit-ready logs</Pill>
                <Pill icon={<BadgeCheck size={14} />}>Process consistency</Pill>
              </div>
            </div>

            <div className="w-full max-w-[420px] rounded-2xl border border-[color:var(--border)] bg-[var(--surface2)] p-5">
              <div className="text-sm font-semibold">Ready to onboard?</div>
              <div className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                Share your requirements and we’ll set up a workflow that fits your agency/team operations.
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => nav("/contact")}
                  className={cx(
                    "inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold",
                    "border-[color:var(--primary)] bg-[var(--primarySoft)] hover:opacity-90"
                  )}
                >
                  <Handshake size={16} />
                  Contact
                </button>
                <button
                  type="button"
                  onClick={() => nav("/demo")}
                  className={cx(
                    "inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold",
                    "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                  )}
                >
                  <BadgeCheck size={16} />
                  Request demo
                </button>
              </div>

              <div className="mt-3 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-[11px] text-[var(--muted)]">
                Tip: Keep your GST details and preferred payment workflow ready for faster setup.
              </div>
            </div>
          </div>
        </CardShell>
      </div>
    </div>
  );
}
