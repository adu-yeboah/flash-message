import type { FlashMessageTheme, ColorScheme, FlashMessageType } from "./types";

// ─── Default Color Schemes ───────────────────────────────────────
const success: ColorScheme = {
  bg: "#10b981",
  dark: "#059669",
  text: "#ffffff",
  icon: "✓",
};

const error: ColorScheme = {
  bg: "#ef4444",
  dark: "#dc2626",
  text: "#ffffff",
  icon: "✕",
};

const info: ColorScheme = {
  bg: "#0ea5e9",
  dark: "#0284c7",
  text: "#ffffff",
  icon: "ℹ",
};

const warning: ColorScheme = {
  bg: "#f59e0b",
  dark: "#d97706",
  text: "#ffffff",
  icon: "⚠",
};

const celebration: ColorScheme = {
  bg: "#8b5cf6",
  dark: "#7c3aed",
  text: "#ffffff",
  icon: "🎉",
};

// ─── Default Theme ───────────────────────────────────────────────
export const defaultTheme: FlashMessageTheme = {
  success,
  error,
  info,
  warning,
  celebration,

  borderRadius: "10px",
  padding: "12px 16px",
  fontFamily: "inherit",
  shadow: "0 4px 14px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)",
  maxWidth: "420px",
  minWidth: "280px",
  gap: "10px",
  animationDuration: "0.35s",
  animationEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
  progressHeight: "3px",
  showProgress: true,
  showCloseButton: true,
  variant: "solid",
};

// ─── Resolve effective color for a type ──────────────────────────
export function resolveColor(
  type: FlashMessageType,
  theme: FlashMessageTheme,
  variant?: FlashMessageTheme["variant"]
): ColorScheme {
  const effectiveVariant = variant ?? theme.variant ?? "solid";
  const base = theme[type] ?? defaultTheme[type]!;
  const fallback = defaultTheme[type]!;

  if (effectiveVariant === "outline") {
    return {
      bg: "transparent",
      dark: base.dark || fallback.dark,
      text: base.dark || fallback.dark,
      icon: base.icon || fallback.icon,
    };
  }

  if (effectiveVariant === "subtle") {
    return {
      bg: `${base.bg || fallback.bg}18`,
      dark: base.dark || fallback.dark,
      text: base.dark || fallback.dark,
      icon: base.icon || fallback.icon,
    };
  }

  return {
    bg: base.bg || fallback.bg,
    dark: base.dark || fallback.dark,
    text: base.text || fallback.text || "#ffffff",
    icon: base.icon || fallback.icon,
  };
}

// ─── Merge user theme with defaults ──────────────────────────────
export function mergeTheme(
  userTheme?: FlashMessageTheme
): FlashMessageTheme {
  if (!userTheme) return { ...defaultTheme };
  return {
    ...defaultTheme,
    ...userTheme,
    success: userTheme.success
      ? { ...defaultTheme.success, ...userTheme.success }
      : defaultTheme.success,
    error: userTheme.error
      ? { ...defaultTheme.error, ...userTheme.error }
      : defaultTheme.error,
    info: userTheme.info
      ? { ...defaultTheme.info, ...userTheme.info }
      : defaultTheme.info,
    warning: userTheme.warning
      ? { ...defaultTheme.warning, ...userTheme.warning }
      : defaultTheme.warning,
    celebration: userTheme.celebration
      ? { ...defaultTheme.celebration, ...userTheme.celebration }
      : defaultTheme.celebration,
  };
}