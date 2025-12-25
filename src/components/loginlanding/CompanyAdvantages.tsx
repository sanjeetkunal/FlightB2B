// B2BAdvantagesPro.tsx  (TSX safe; for .jsx remove the type imports + annotations)
import React, { type ComponentType, type SVGProps } from "react";
import { Layers, CircleDollarSign, FileCheck2, ShieldCheck, Server, Headphones, Check, ArrowRight } from "lucide-react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;
type Feature = {
  icon: IconType;
  title: string;
  desc: string;
  bullets: string[];
};

export default function B2BAdvantagesPro() {
  const BRAND = {
    cyan: "#20B9DD",
    green: "#39AA81",
    purple: "#632C8E",
    mint: "#83CEBF",
  };

  const stats = [
    { k: "2M+", v: "annual searches" },
    { k: "1200+", v: "active agencies" },
    { k: "99.96%", v: "uptime SLA" },
  ];

  const items: Feature[] = [
    {
      icon: Layers,
      title: "Unified Supply",
      desc: "NDC, LCC and GDS under one platform for faster issuance and fewer vendor hops.",
      bullets: ["Multi-city & fare families", "Ancillaries & SSRs", "Real-time availability"],
    },
    {
      icon: CircleDollarSign,
      title: "Transparent Earnings",
      desc: "Markup controls and commission engine that keep margins predictable and auditable.",
      bullets: ["Tiered commissions", "TDS & ledger export", "GST-aware markups"],
    },
    {
      icon: FileCheck2,
      title: "Compliance-Ready",
      desc: "Built-in invoicing and reports that meet regulatory and audit requirements.",
      bullets: ["GST invoices", "HSN/SAC support", "Bulk CSV/XLS exports"],
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Security",
      desc: "Protection and control at scale without slowing your team down.",
      bullets: ["SSO (SAML/OIDC)", "IP whitelisting", "Audit trails"],
    },
    {
      icon: Server,
      title: "Reliable Infrastructure",
      desc: "Modern, horizontally scalable stack designed for peak search and booking loads.",
      bullets: ["Global CDN", "Autoscaling", "Observability & alerts"],
    },
    {
      icon: Headphones,
      title: "Dedicated Success",
      desc: "A support model that matches the pace and needs of B2B travel businesses.",
      bullets: ["24×7 helpdesk", "Onboarding & training", "Priority issue handling"],
    },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* enterprise background: gradient + grid */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_460px_at_50%_0%,rgba(131,206,191,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_100%_55%,rgba(32,185,221,0.16),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(850px_420px_at_0%_75%,rgba(99,44,142,0.12),transparent_62%)]" />

        <div className="absolute inset-0 opacity-[0.30] [mask-image:radial-gradient(60%_60%_at_50%_35%,black,transparent)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(2,6,23,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0 py-14">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <span
            className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
            style={{
              borderColor: "rgba(32,185,221,0.30)",
              background: "rgba(32,185,221,0.10)",
              color: BRAND.cyan,
            }}
          >
            Company Advantages
          </span>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="text-3xl sm:text-4xl font-semibold leading-tight text-slate-900">
                Built for{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.cyan}, ${BRAND.green})`,
                  }}
                >
                  B2B at Scale
                </span>
              </h3>
              <p className="mt-2 max-w-2xl text-slate-600">
                Drive consistent margins and reliable operations with transparent earnings, enterprise security and
                audit-ready reporting—all in one modern platform.
              </p>
            </div>

            {/* KPI chips */}
            <div className="flex flex-wrap items-center gap-2">
              {stats.map((s) => (
                <span
                  key={s.k}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 backdrop-blur px-3 py-1.5 shadow-sm"
                >
                  <span className="text-sm font-semibold text-slate-900">{s.k}</span>
                  <span className="text-xs text-slate-500">{s.v}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((it) => (
            <FeatureCard key={it.title} {...it} brand={BRAND} />
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#"
            aria-label="Talk to Sales"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(32,185,221,0.20)] transition hover:opacity-95"
            style={{
              backgroundImage: `linear-gradient(90deg, ${BRAND.cyan}, ${BRAND.green})`,
            }}
          >
            Talk to Sales <ArrowRight className="h-4 w-4" />
          </a>

          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 backdrop-blur px-4 py-2 text-sm text-slate-800 hover:bg-white"
          >
            Download Capability Deck
          </a>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  bullets,
  brand,
}: Feature & { brand: { cyan: string; green: string; purple: string; mint: string } }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/85 backdrop-blur p-5 sm:p-6 transition-all duration-300 hover:shadow-[0_22px_60px_rgba(2,6,23,0.12)] hover:-translate-y-0.5">
      {/* top gradient rail (logo palette) */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${brand.purple}, ${brand.cyan}, ${brand.green})`,
        }}
      />

      {/* inner soft highlight */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
             style={{ background: "rgba(32,185,221,0.18)" }} />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl"
             style={{ background: "rgba(57,170,129,0.14)" }} />
      </div>

      <div className="relative flex items-start gap-3">
        <div
          className="shrink-0 rounded-2xl border p-2.5"
          style={{
            borderColor: "rgba(2,6,23,0.08)",
            background: `linear-gradient(135deg, rgba(99,44,142,0.10), rgba(32,185,221,0.10), rgba(57,170,129,0.08))`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: brand.cyan }} />
        </div>

        <div>
          <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
          <p className="mt-1 text-sm text-slate-600">{desc}</p>
        </div>
      </div>

      <ul className="relative mt-4 space-y-2">
        {bullets.map((b, i) => (
          <li key={`${title}-${i}`} className="flex items-start gap-2 text-sm text-slate-700">
            <span
              className="mt-0.5 rounded-full p-1"
              style={{ background: "rgba(32,185,221,0.12)", color: brand.cyan }}
            >
              <Check className="h-3.5 w-3.5" />
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {/* hover ring */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-transparent group-hover:ring-slate-900/5" />
    </div>
  );
}
