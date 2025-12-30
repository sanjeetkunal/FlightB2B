// src/components/theme/ThemeSwitcher.jsx
import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider.jsx";

export default function ThemeSwitcher() {
  const {
    presets,
    presetId,
    setPresetId,
    useCustom,
    setUseCustom,
    customPrimary,
    setCustomPrimary,
    reset,
  } = useTheme();

  const [open, setOpen] = useState(false);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          fixed bottom-5 right-5 z-[60]
          h-12 w-12 rounded-full
          border border-[var(--border)]
          bg-[var(--surface)]
          shadow-lg
          grid place-items-center
          hover:bg-[var(--surface2)]
          transition
        "
        aria-label="Open Theme Settings"
        title="Theme"
      >
        {/* simple palette icon */}
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--text)]" fill="currentColor">
          <path d="M12 2a10 10 0 0 0 0 20h3a3 3 0 0 0 0-6h-1a1 1 0 0 1 0-2h1a5 5 0 0 0 0-10h-3Zm-4 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm8-3a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-6 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-[59] bg-black/30"
          onClick={() => setOpen(false)}
          aria-label="Close Theme Settings"
        />
      )}

      {/* Drawer */}
      <aside
        className={[
          "fixed top-0 right-0 h-full w-[340px] max-w-[92vw] z-[61]",
          "bg-[var(--surface)] text-[var(--text)]",
          "border-l border-[var(--border)] shadow-2xl",
          "transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-label="Theme Settings"
      >
        <div className="h-14 px-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="font-bold">Theme Settings</div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-9 w-9 rounded-md hover:bg-[var(--surface2)] grid place-items-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Presets */}
          <div>
            <div className="text-xs text-[var(--muted)] font-semibold mb-2">
              PRESETS
            </div>

            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => {
                const active = p.id === presetId && !useCustom;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setUseCustom(false);
                      setPresetId(p.id);
                    }}
                    className={[
                      "rounded-md border p-3 text-left transition",
                      active
                        ? "border-[var(--primary)] bg-[var(--primarySoft)]"
                        : "border-[var(--border)] hover:bg-[var(--surface2)]",
                    ].join(" ")}
                  >
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Swatch c={p.vars.primary} />
                      <Swatch c={p.vars.surface2} />
                      <Swatch c={p.vars.text} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom */}
          <div className="rounded-md border border-[var(--border)] p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Custom Theme</div>
                <div className="text-xs text-[var(--muted)]">
                  Pick your primary brand color
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                  className="accent-[var(--primary)]"
                />
                Enable
              </label>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <input
                type="color"
                value={customPrimary}
                onChange={(e) => setCustomPrimary(e.target.value)}
                className="h-10 w-12 rounded-md border border-[var(--border)] bg-transparent"
                disabled={!useCustom}
                title="Primary Color"
              />
              <input
                type="text"
                value={customPrimary}
                onChange={(e) => setCustomPrimary(e.target.value)}
                disabled={!useCustom}
                className="
                  h-10 flex-1 rounded-md border border-[var(--border)]
                  bg-[var(--surface2)] px-3 text-sm
                  outline-none
                "
                placeholder="#10b6d9"
              />
            </div>

            <div className="mt-3 text-xs text-[var(--muted)]">
              Tip: Logo colors — <b>#10b6d9</b> (cyan), <b>#22c55e</b> (green),{" "}
              <b>#7c3aed</b> (purple)
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="
                flex-1 h-10 rounded-md border border-[var(--border)]
                bg-[var(--surface)] hover:bg-[var(--surface2)]
                text-sm font-semibold
              "
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                flex-1 h-10 rounded-md
                bg-[var(--primary)] hover:bg-[var(--primaryHover)]
                text-white text-sm font-semibold
              "
            >
              Done
            </button>
          </div>

          {/* Note about topbar */}
         <div className="text-xs text-[var(--muted)]">
  Note: The header top bar is <b>always black</b> and won’t be affected by theme changes.
</div>
        </div>
      </aside>
    </>
  );
}

function Swatch({ c }) {
  return (
    <span
      className="h-4 w-4 rounded-full border border-black/10"
      style={{ background: c }}
      title={c}
    />
  );
}
