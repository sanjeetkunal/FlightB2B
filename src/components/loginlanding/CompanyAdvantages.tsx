// B2BAdvantagesPro.tsx  (TSX safe; for .jsx remove the type imports + annotations)
import React, { type ComponentType, type SVGProps } from "react";
import {
  Layers,
  CircleDollarSign,
  FileCheck2,
  ShieldCheck,
  Server,
  Headphones,
  Check,
  ArrowRight,
} from "lucide-react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;
type Feature = {
  icon: IconType;
  title: string;
  desc: string;
  bullets: string[];
};

export default function B2BAdvantagesPro() {
  const stats = [
    { k: "2M+", v: "annual searches" },
    { k: "1200+", v: "active agencies" },
    { k: "99.96%", v: "uptime SLA" },
  ];

  const items: Feature[] = [
    {
      icon: Layers,
      title: "Unified Supply",
      desc:
        "NDC, LCC and GDS under one platform for faster issuance and fewer vendor hops.",
      bullets: ["Multi-city & fare families", "Ancillaries & SSRs", "Real-time availability"],
    },
    {
      icon: CircleDollarSign,
      title: "Transparent Earnings",
      desc:
        "Markup controls and commission engine that keep margins predictable and auditable.",
      bullets: ["Tiered commissions", "TDS & ledger export", "GST-aware markups"],
    },
    {
      icon: FileCheck2,
      title: "Compliance-Ready",
      desc:
        "Built-in invoicing and reports that meet regulatory and audit requirements.",
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
      desc:
        "Modern, horizontally scalable stack designed for peak search and booking loads.",
      bullets: ["Global CDN", "Autoscaling", "Observability & alerts"],
    },
    {
      icon: Headphones,
      title: "Dedicated Success",
      desc:
        "A support model that matches the pace and needs of B2B travel businesses.",
      bullets: ["24×7 helpdesk", "Onboarding & training", "Priority issue handling"],
    },
  ];

  return (
    <section className="relative bg-white isolate overflow-hidden">
      {/* subtle background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#004aad]/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[#E67514]/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#004aad]/25 bg-[#004aad]/10 px-3 py-1 text-xs font-semibold text-[#004aad]">
            Company Advantages
          </span>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="text-3xl sm:text-4xl font-semibold leading-tight text-slate-900">
                Built for <span className="text-[#004aad]">B2B at Scale</span>
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
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5"
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
            <FeatureCard key={it.title} {...it} />
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#"
            aria-label="Talk to Sales"
            className="inline-flex items-center gap-2 rounded-full bg-[#004aad] hover:bg-[#003b87] text-white px-5 py-2.5 text-sm font-medium"
          >
            Talk to Sales <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Download Capability Deck
          </a>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc, bullets }: Feature) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      {/* top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#004aad] via-[#4c86ff] to-[#E67514]" />

      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-xl border border-[#004aad]/20 bg-[#004aad]/10 text-[#004aad] p-2">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
          <p className="mt-1 text-sm text-slate-600">{desc}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {bullets.map((b, i) => (
          <li key={`${title}-${i}`} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-0.5 rounded-full bg-[#004aad]/10 text-[#004aad] p-1">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {/* hover ring */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-[#004aad]/10" />
    </div>
  );
}
