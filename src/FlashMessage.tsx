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
export default function FlashMessageItem({
  message,
  onDismiss,
  position,
  theme,
  containerStyle, 
}: FlashMessageItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const rootRef = useRef<HTMLDivElement>(null);
  const firedConfetti = useRef(false);

  // Stable ref for onDismiss to avoid stale closures in the timer
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // Resolve color based on type + variant
  const color = useMemo(
    () => resolveColor(message.type, theme),
    [message.type, theme],
  );

  const isOutline = theme.variant === "outline";
  const isSubtle = theme.variant === "subtle";

  //  Determine animation
  const transition = message.transition ?? "slide";
  const isBottom = position.startsWith("bottom");
  const verticalKey = isBottom ? "bottom" : "top";
  const enterAnimationName = ENTER_ANIMATION[transition][verticalKey];

  //  Dismiss handler (stable via ref) ──
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismissRef.current(message.id), 350);
  }, [message.id]);

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

  //  Auto-dismiss timer with progress bar ─
  useEffect(() => {
    if (!message.duration || isPaused) return;

    const interval = 50;
    const decrement = (interval / message.duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        if (next <= 0) {
          handleDismiss();
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [message.duration, isPaused, handleDismiss]);

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
    transition: `all ${theme.animationDuration ?? "0.35s"} ${theme.animationEasing ?? "cubic-bezier(0.22, 1, 0.36, 1)"}`,
    animation: `${enterAnimationName} ${theme.animationDuration ?? "0.35s"} ${theme.animationEasing ?? "cubic-bezier(0.22, 1, 0.36, 1)"}`,
    position: "relative",
    overflow: "hidden",
    fontFamily: theme.fontFamily ?? "inherit",
    ...containerStyle,
  };

  return (
    <div
      ref={rootRef}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={itemStyle}
      onClick={handleDismiss}
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
        {color.icon && (
          <span
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
            }}
          >
            {color.icon}
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

      {/* Progress bar */}
      {message.duration && theme.showProgress !== false && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: theme.progressHeight ?? "3px",
            backgroundColor:
              isSubtle || isOutline
                ? color.dark
                : color.dark || "rgba(0,0,0,0.15)",
            width: `${progress}%`,
            transition: "width 0.05s linear",
          }}
        />
      )}
    </div>
  );
}
