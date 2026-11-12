"use client"; //for NEXT JS applications
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { FlashMessageItemProps, TransitionPreset } from "./types";
import { resolveColor } from "./theme";
import { toMs } from "./utils";
import { fireConfetti, resolveMessageConfetti } from "./confetti";

//  Animation Keyframe Map ──
const ENTER_ANIMATION: Record<
  TransitionPreset,
  Record<"top" | "bottom", string>  
> = {
  slide: {
    top: "fm-slide-in-top",
    bottom: "fm-slide-in-bottom",
  },
  fade: {
    top: "fm-fade-in",
    bottom: "fm-fade-in",
  },
  scale: {
    top: "fm-scale-in",
    bottom: "fm-scale-in",
  },
  bounce: {
    top: "fm-bounce-in",
    bottom: "fm-bounce-in",
  },
  flip: {
    top: "fm-flip-in",
    bottom: "fm-flip-in",
  },
};

// Individual Flash Message Item Component
// Clicks on these never dismiss the message (so links and buttons keep working)
const INTERACTIVE = 'a, button, input, select, textarea, [role="button"]';

export default function FlashMessageItem({
  message,
  onDismiss,
  position,
  theme,
  containerStyle, 
}: FlashMessageItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const paused = isPaused || isFocused;
  const rootRef = useRef<HTMLDivElement>(null);
  const firedConfetti = useRef(false);

  // Stable ref for onDismiss to avoid stale closures in the timer
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const exiting = useRef(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(exitTimer.current), []);

  // Resolve color based on type + variant
  const color = useMemo(
    () => resolveColor(message.type, theme),
    [message.type, theme],
  );

  const isOutline = theme.variant === "outline";
  const isSubtle = theme.variant === "subtle";

  // A per-message icon wins over the theme's icon; `null` means "no icon".
  const icon = message.icon !== undefined ? message.icon : color.icon;
  const hasIcon = icon != null && icon !== false && icon !== "";

  //  Determine animation
  const transition = message.transition ?? "slide";
  const isBottom = position.startsWith("bottom");
  const verticalKey = isBottom ? "bottom" : "top";
  const enterAnimationName = ENTER_ANIMATION[transition][verticalKey];

  //  Start the exit animation, then tell the provider to remove us. Safe to
  //  call many times: only the first call does anything ──
  const exitMs = toMs(theme.animationDuration);
  const handleDismiss = useCallback(() => {
    if (exiting.current) return;
    exiting.current = true;
    setIsExiting(true);
    exitTimer.current = setTimeout(() => onDismissRef.current(message.id), exitMs);
  }, [message.id, exitMs]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
    handleDismiss();
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") handleDismiss();
  };

  //  Fire confetti once, when the message first appears ──
  useEffect(() => {
    if (firedConfetti.current) return;
    const options = resolveMessageConfetti(message.type, message.confetti, theme.confetti);
    if (!options) return;
    firedConfetti.current = true;
    // Burst from the message itself unless the caller chose an origin
    const rect = rootRef.current?.getBoundingClientRect();
    const origin =
      options.origin ??
      (rect && rect.width > 0
        ? {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          }
        : undefined);
    void fireConfetti({ ...options, origin });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //  Auto-dismiss: a single timeout, with the remaining time saved whenever it
  //  is cancelled (hover, focus), so pausing never loses or adds time ──
  const duration = message.duration ?? 0;
  const hasTimer = duration > 0;
  const remaining = useRef(duration);
  useEffect(() => {
    if (!hasTimer || paused) return;
    const startedAt = Date.now();
    const timer = setTimeout(handleDismiss, remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt));
    };
  }, [hasTimer, paused, handleDismiss]);

  //  Errors and warnings interrupt the screen reader; the rest wait politely ──
  const urgent = message.type === "error" || message.type === "warning";

  // Users who prefer reduced motion get toasts without enter/exit animation.
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The icon pops in with a springy scale, just after the toast lands.
  const iconPop = theme.iconPop !== false && !prefersReducedMotion;

  const itemStyle: React.CSSProperties = {
    backgroundColor: color.bg,
    color: color.text || "#ffffff",
    padding: theme.padding ?? "12px 16px",
    borderRadius: theme.borderRadius ?? "10px",
    boxShadow: isOutline
      ? "none"
      : (theme.shadow ?? "0 4px 14px rgba(0,0,0,0.12)"),
    border: isOutline ? `2px solid ${color.dark}` : "none",
    maxWidth: theme.maxWidth ?? "420px",
    minWidth: theme.minWidth ?? "280px",
    cursor: "pointer",
    opacity: isExiting ? 0 : 1,
    transform: isExiting
      ? `translateY(${isBottom ? "20px" : "-20px"}) scale(0.96)`
      : "translateY(0) scale(1)",
    // Longhands (not the `animation` shorthand) so jsdom and tests can read them
    ...(prefersReducedMotion
      ? {}
      : {
          transition: `all ${theme.animationDuration ?? "0.35s"} ${theme.animationEasing ?? "cubic-bezier(0.22, 1, 0.36, 1)"}`,
          animationName: enterAnimationName,
          animationDuration: theme.animationDuration ?? "0.35s",
          animationTimingFunction: theme.animationEasing ?? "cubic-bezier(0.22, 1, 0.36, 1)",
        }),
    position: "relative",
    overflow: "hidden",
    fontFamily: theme.fontFamily ?? "inherit",
    ...containerStyle,
  };

  return (
    <div
      ref={rootRef}
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      aria-atomic="true"
      data-exiting={isExiting}
      className={message.className}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        // Focus moving between children of this message is not "leaving" it
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsFocused(false);
      }}
      style={itemStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Message content row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* Icon */}
        {hasIcon && (
          <span
            aria-hidden="true"
            style={{
              fontSize: "16px",
              flexShrink: 0,
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              backgroundColor:
                isSubtle || isOutline
                  ? `${color.dark}20`
                  : "rgba(255,255,255,0.2)",
              // Longhands so jsdom and tests can read them
              ...(iconPop
                ? {
                    animationName: "fm-icon-pop",
                    animationDuration: "0.4s",
                    animationDelay: "0.2s",
                    animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    animationFillMode: "backwards",
                  }
                : {}),
            }}
          >
            {icon}
          </span>
        )}

        {/* Text */}
        <span style={{ flex: 1, fontSize: "14px", lineHeight: "1.4" }}>
          {message.message}
        </span>

        {/* Close button */}
        {theme.showCloseButton !== false && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            aria-label="Close message"
            style={{
              background: "none",
              border: "none",
              color:
                isSubtle || isOutline ? color.dark : color.text || "#ffffff",
              fontSize: "18px",
              cursor: "pointer",
              padding: "0",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.7,
              borderRadius: "4px",
              transition: "opacity 0.15s, background 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.7";
              (e.currentTarget as HTMLButtonElement).style.background = "none";
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Progress bar — CSS animation, paused in sync with the timer.
          hasTimer is a real boolean; `message.duration && ...` rendered a literal "0" */}
      {hasTimer && theme.showProgress !== false && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: theme.progressHeight ?? "3px",
            backgroundColor:
              isSubtle || isOutline
                ? color.dark
                : color.dark || "rgba(0,0,0,0.15)",
            width: "100%",
            transformOrigin: "left",
            animationName: "fm-progress",
            animationDuration: `${duration}ms`,
            animationTimingFunction: "linear",
            animationFillMode: "forwards",
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      )}
    </div>
  );
}
