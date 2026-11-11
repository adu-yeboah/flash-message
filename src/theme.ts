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
/** Every message type the library knows about. Add new types here once. */
export const MESSAGE_TYPES: readonly FlashMessageType[] = [
  "success",
  "error",
  "info",
  "warning",
  "celebration",
];

export const defaultTheme: FlashMessageTheme & Record<FlashMessageType, ColorScheme> = {
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

// ─── Helpers ─────────────────────────────────────────────────────
/** Drop keys whose value is undefined so they cannot overwrite defaults. */
function defined<T extends object>(obj?: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj ?? {}).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

/** A soft tint of any CSS color. Appending hex alpha only works for #rrggbb. */
function softBackground(color: string): string {
  return /^#[0-9a-f]{6}$/i.test(color)
    ? `${color}18`
    : `color-mix(in srgb, ${color} 9%, transparent)`;
}

// ─── Resolve effective color for a type ──────────────────────────
export function resolveColor(
  type: FlashMessageType,
  theme: FlashMessageTheme,
  variant?: FlashMessageTheme["variant"]
): ColorScheme {
  const effectiveVariant = variant ?? theme.variant ?? "solid";
  const fallback = defaultTheme[type];
  const user = theme[type];

  const bg = user?.bg ?? fallback.bg;
  const dark = user?.dark ?? fallback.dark;
  const text = user?.text ?? fallback.text ?? "#ffffff";
  // `??` (not `||`) so a user can pass "" to remove the icon.
  const icon = user?.icon ?? fallback.icon;

  if (effectiveVariant === "outline") {
    return { bg: "transparent", dark, text: dark, icon };
  }
  if (effectiveVariant === "subtle") {
    return { bg: softBackground(bg), dark, text: dark, icon };
  }
  return { bg, dark, text, icon };
}

// ─── Merge user theme with defaults ──────────────────────────────
export function mergeTheme(userTheme?: FlashMessageTheme): FlashMessageTheme {
  const merged: FlashMessageTheme = { ...defaultTheme, ...defined(userTheme) };
  for (const type of MESSAGE_TYPES) {
    merged[type] = { ...defaultTheme[type], ...defined(userTheme?.[type]) };
  }
  return merged;
}
