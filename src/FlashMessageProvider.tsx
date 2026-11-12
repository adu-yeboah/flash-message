"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type {
  FlashMessage,
  FlashMessageType,
  FlashMessagePosition,
  FlashMessageTheme,
  FlashMessageOptions,
  FlashMessageContextProps,
  FlashMessageProviderProps,
} from "./types";
import type { ConfettiOptions } from "./confetti";
import { fireConfetti } from "./confetti";
import { mergeTheme } from "./theme";
import { addMessage, visibleMessages } from "./messages";
import "./style.css";
import FlashMessageItem from "./FlashMessage";

//  Context 
const FlashMessageContext = createContext<FlashMessageContextProps | undefined>(
  undefined
);

//  Position → Container Styles 
function getContainerStyles(
  position: FlashMessagePosition,
  gap: string
): CSSProperties {
  const base: CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap,
    pointerEvents: "none",
  };

  switch (position) {
    case "top":
      return { ...base, top: "20px", left: "50%", transform: "translateX(-50%)" };
    case "bottom":
      return { ...base, bottom: "20px", left: "50%", transform: "translateX(-50%)" };
    case "top-left":
      return { ...base, top: "20px", left: "20px" };
    case "top-right":
      return { ...base, top: "20px", right: "20px" };
    case "bottom-left":
      return { ...base, bottom: "20px", left: "20px" };
    case "bottom-right":
      return { ...base, bottom: "20px", right: "20px" };
    default:
      return { ...base, top: "20px", left: "50%", transform: "translateX(-50%)" };
  }
}


//  Provider 
export function FlashMessageProvider({
  children,
  defaultPosition = "top",
  maxMessages = 5,
  defaultTheme: userTheme,
  onDismiss,
  stacking = "stack",
}: FlashMessageProviderProps) {
  const [messages, setMessages] = useState<FlashMessage[]>([]);
  const [position, setPosition] = useState<FlashMessagePosition>(defaultPosition);
  const [theme, setThemeState] = useState<FlashMessageTheme>(
    () => mergeTheme(userTheme)
  );

  // The ref is the source of truth for the list; state only mirrors it for
  // rendering. That lets us read the current list inside event handlers
  // without putting side effects inside a state updater function.
  const store = useRef<FlashMessage[]>([]);
  const commit = useCallback((next: FlashMessage[]) => {
    store.current = next;
    setMessages(next);
  }, []);

  // A partial theme is merged over the defaults, never replaces them.
  const setTheme = useCallback(
    (next: FlashMessageTheme) => setThemeState(mergeTheme(next)),
    []
  );

  //  Show a new flash message 
  const showFlashMessage = useCallback(
    (
      message: ReactNode,
      type: FlashMessageType,
      options: FlashMessageOptions = {}
    ): string => {
      const id = `fm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const duration = options.duration ?? 3000;

      const newMsg: FlashMessage = {
        id,
        message,
        type,
        duration,
        transition: options.transition,
        confetti: options.confetti,
        icon: options.icon,
        className: options.className,
      };

      commit(addMessage(store.current, newMsg, stacking, maxMessages));

      return id;
    },
    [commit, maxMessages, stacking]
  );


  //  Dismiss a specific message 
  const dismissFlashMessage = useCallback(
    (id: string) => {
      const msg = store.current.find((m) => m.id === id);
      if (!msg) return; // already gone: nothing to do, nothing to report
      commit(store.current.filter((m) => m.id !== id));
      onDismiss?.(id, msg); // outside any state updater, so it runs exactly once
    },
    [commit, onDismiss]
  );

  //  Clear all 
  const clearAllMessages = useCallback(() => {
    commit([]);
  }, [commit]);

  //  Fire a confetti burst on demand, using theme options as the base 
  const confetti = useCallback(
    (options?: ConfettiOptions) => fireConfetti({ ...theme.confetti, ...options }),
    [theme.confetti]
  );

  //  Memoized container styles 
  const containerStyle = useMemo(
    () => getContainerStyles(position, theme.gap ?? "10px"),
    [position, theme.gap]
  );

  //  Context value (stable) 
  const contextValue = useMemo<FlashMessageContextProps>(
    () => ({
      messages,
      showFlashMessage,
      dismissFlashMessage,
      clearAllMessages,
      position,
      setPosition,
      theme,
      setTheme,
      confetti,
    }),
    [messages, showFlashMessage, dismissFlashMessage, clearAllMessages, position, theme, confetti]
  );

  return (
    <FlashMessageContext.Provider value={contextValue}>
      {children}

      {/* Message Container (queued messages wait their turn) */}
      {messages.length > 0 && (
        <div style={containerStyle}>
          {visibleMessages(messages, maxMessages).map((msg) => (
            <div key={msg.id} style={{ pointerEvents: "auto" }}>
              <FlashMessageItem
                message={msg}
                onDismiss={dismissFlashMessage}
                theme={theme}
                position={position}
              />
            </div>
          ))}
        </div>
      )}

    </FlashMessageContext.Provider>
  );
}

//  Hook 
export function useFlashMessage(): FlashMessageContextProps {
  const context = useContext(FlashMessageContext);
  if (!context) {
    throw new Error(
      "useFlashMessage must be used within a <FlashMessageProvider>"
    );
  }
  return context;
}