// src/pages/dashboard/shared/WorkspacePanel.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function WorkspacePanel({ title, subtitle, icon, sections }) {
  return (
    <aside className="order-1 lg:order-1">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {title}
            </div>
            <div className="text-[11px] text-slate-400">{subtitle}</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/90 text-sm text-slate-50">
            {icon}
          </div>
        </div>

        <div className="space-y-3 text-[11px]">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-2"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm">
                    {section.icon}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700">
                    {section.label}
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {section.links.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      [
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px]",
                        "transition hover:bg-slate-900 hover:text-slate-50 hover:border-slate-900",
                        isActive
                          ? "border-sky-500 bg-sky-500 text-white"
                          : "border-slate-200 bg-white text-slate-700",
                      ].join(" ")
                    }
                  >
                    <span className="mr-1 text-[8px] text-slate-400">•</span>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
