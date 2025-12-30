// src/styles/ThemeProvider.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEME_KEY = "v2a_theme_v1";

/**
 * NOTE: Topbar is NOT part of theme (always black in Header).
 */
const PRESETS = [
  {
    id: "logo-default",
    name: "Logo Default",
    vars: {
      surface: "#ffffff",
      surface2: "#f6f8fb",
      text: "#0b1220",
      muted: "#667085",
      border: "rgba(15, 23, 42, 0.12)",

      primary: "#10b6d9",
      primaryHover: "#0ea5c3",
      primarySoft: "rgba(16, 182, 217, 0.14)",

      accent: "#7c3aed",

      success: "#16a34a",
      warning: "#f59e0b",
      danger: "#ef4444",
    },
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    vars: {
      surface: "#ffffff",
      surface2: "#f6f9ff",
      text: "#071529",
      muted: "#5b6b7d",
      border: "rgba(2, 8, 23, 0.12)",

      primary: "#2563eb",
      primaryHover: "#1d4ed8",
      primarySoft: "rgba(37, 99, 235, 0.14)",

      accent: "#06b6d4",

      success: "#16a34a",
      warning: "#f59e0b",
      danger: "#ef4444",
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    vars: {
      surface: "#ffffff",
      surface2: "#f7fffb",
      text: "#06130b",
      muted: "#64748b",
      border: "rgba(2, 8, 23, 0.12)",

      primary: "#22c55e",
      primaryHover: "#16a34a",
      primarySoft: "rgba(34, 197, 94, 0.14)",

      accent: "#10b6d9",

      success: "#16a34a",
      warning: "#f59e0b",
      danger: "#ef4444",
    },
  },
  {
    id: "purple",
    name: "Purple",
    vars: {
      surface: "#ffffff",
      surface2: "#faf7ff",
      text: "#120a22",
      muted: "#6b7280",
      border: "rgba(17, 24, 39, 0.14)",

      primary: "#7c3aed",
      primaryHover: "#6d28d9",
      primarySoft: "rgba(124, 58, 237, 0.14)",

      accent: "#10b6d9",

      success: "#16a34a",
      warning: "#f59e0b",
      danger: "#ef4444",
    },
  },
  {
  id: "dark",
  name: "Dark",
  vars: {
    surface: "#0b1220",
    surface2: "#0f1a2e",
    text: "#e6edf7",
    muted: "#9aa6b2",
    border: "rgba(148, 163, 184, 0.18)",

    // ✅ darker cyan so white text works
    primary: "#0a7a99",
    primaryHover: "#086b85",
    primarySoft: "rgba(10, 122, 153, 0.18)",

    accent: "#a78bfa",

    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
  },
}

];

function clampHex(hex) {
  if (!hex) return "#10b6d9";
  let h = String(hex).trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h)) return "#10b6d9";
  if (h.length === 4) {
    const r = h[1],
      g = h[2],
      b = h[3];
    h = `#${r}${r}${g}${g}${b}${b}`;
  }
  return h.toLowerCase();
}

function hexToRgb(hex) {
  const h = clampHex(hex).replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

function makeSoft(hex, alpha = 0.14) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ===================== NEW: onPrimary auto ===================== */

function srgbToLin(v) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance({ r, g, b }) {
  const R = srgbToLin(r);
  const G = srgbToLin(g);
  const B = srgbToLin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(L1, L2) {
  const a = Math.max(L1, L2);
  const b = Math.min(L1, L2);
  return (a + 0.05) / (b + 0.05);
}

function pickOnPrimary(primaryHex) {
  const bg = hexToRgb(primaryHex);
  const Lbg = luminance(bg);

  const cWhite = contrastRatio(Lbg, 1); // white luminance
  const cBlack = contrastRatio(Lbg, 0); // black luminance

  // white or dark (use your default dark text tone)
  return cWhite >= cBlack ? "#ffffff" : "#0b1220";
}

/* =============================================================== */

function applyVars(vars) {
  const root = document.documentElement;

  root.style.setProperty("--surface", vars.surface);
  root.style.setProperty("--surface2", vars.surface2);
  root.style.setProperty("--text", vars.text);
  root.style.setProperty("--muted", vars.muted);
  root.style.setProperty("--border", vars.border);

  root.style.setProperty("--primary", vars.primary);
  root.style.setProperty("--primaryHover", vars.primaryHover);
  root.style.setProperty("--primarySoft", vars.primarySoft);

  // ✅ NEW: onPrimary token (button text color)
  root.style.setProperty("--onPrimary", pickOnPrimary(vars.primary));

  // ✅ IMPORTANT: accent should exist so right-side wash changes too
  root.style.setProperty("--accent", vars.accent || vars.primary);

  if (vars.success) root.style.setProperty("--success", vars.success);
  if (vars.warning) root.style.setProperty("--warning", vars.warning);
  if (vars.danger) root.style.setProperty("--danger", vars.danger);
}

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(THEME_KEY) || "null");
  } catch {
    return null;
  }
}

function saveTheme(data) {
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(data));
  } catch {}
}

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [presetId, setPresetId] = useState("logo-default");
  const [customPrimary, setCustomPrimary] = useState("#10b6d9");
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    const saved = loadSaved();
    if (!saved) return;
    if (saved.presetId) setPresetId(saved.presetId);
    if (saved.useCustom != null) setUseCustom(!!saved.useCustom);
    if (saved.customPrimary) setCustomPrimary(clampHex(saved.customPrimary));
  }, []);

  const activePreset = useMemo(() => {
    return PRESETS.find((p) => p.id === presetId) || PRESETS[0];
  }, [presetId]);

  const computedVars = useMemo(() => {
    const base = activePreset.vars;
    if (!useCustom) return base;

    const p = clampHex(customPrimary);
    return {
      ...base,
      primary: p,
      primaryHover: p, // (tera existing behavior)
      primarySoft: makeSoft(p, 0.14),
      accent: base.accent || p, // ✅ keep preset accent, fallback to custom primary
    };
  }, [activePreset, useCustom, customPrimary]);

  useEffect(() => {
    applyVars(computedVars);
    saveTheme({ presetId, useCustom, customPrimary });
  }, [computedVars, presetId, useCustom, customPrimary]);

  const api = useMemo(
    () => ({
      presets: PRESETS,
      presetId,
      setPresetId,
      useCustom,
      setUseCustom,
      customPrimary,
      setCustomPrimary,
      vars: computedVars,
      reset: () => {
        setPresetId("logo-default");
        setUseCustom(false);
        setCustomPrimary("#10b6d9");
      },
    }),
    [presetId, useCustom, customPrimary, computedVars]
  );

  return <ThemeCtx.Provider value={api}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
