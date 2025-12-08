"use client"; //for NEXT JS applications 
import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect 
} from "react";
import {
  FlashMessage,
  FlashMessageType,
  FlashMessagePosition,
  FlashMessageTheme,
  FlashMessageOptions,
  FlashMessageContextProps,
  FlashMessageProviderProps,
  FlashMessageItemProps,
  ColorScheme
} from "./types";


// Default theme configuration
export const defaultTheme: FlashMessageTheme = {
  success: { bg: "#10b981", dark: "#059669", text: "#ffffff" },
  error: { bg: "#ef4444", dark: "#dc2626", text: "#ffffff" },
  info: { bg: "#3b82f6", dark: "#2563eb", text: "#ffffff" },
  warning: { bg: "#f59e0b", dark: "#d97706", text: "#ffffff" }
};

// Create Context
const FlashMessageContext = createContext<FlashMessageContextProps | undefined>(
  undefined
);

// Individual Flash Message Item Component
function FlashMessageItem ({ 
  message, 
  onDismiss, 
  theme 
}: FlashMessageItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  // Auto-dismiss timer with progress bar
  useEffect(() => {
    if (!message.duration || isPaused) return;

    const interval = 50; // Update every 50ms for smooth progress
    const decrement = (interval / message.duration) * 100;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev - decrement;
        if (next <= 0) {
          handleDismiss();
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [message.duration, isPaused]);

  // Handle dismiss with exit animation
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(message.id), 300);
  };

  // Get color scheme for message type
  const color: ColorScheme = 
    theme[message.type] || defaultTheme[message.type]!;

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        backgroundColor: color.bg,
        color: color.text || "#ffffff",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        marginBottom: "10px",
        minWidth: "300px",
        maxWidth: "500px",
        cursor: "pointer",
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "translateY(-20px)" : "translateY(0)",
        transition: "all 0.3s ease-in-out",
        animation: "flashMessageSlideIn 0.3s ease-out",
        position: "relative",
        overflow: "hidden"
      }}
      onClick={handleDismiss}
    >
      {/* Message content and close button */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <span style={{ flex: 1, marginRight: "12px" }}>
          {message.message}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          aria-label="Close message"
          style={{
            background: "none",
            border: "none",
            color: color.text || "#ffffff",
            fontSize: "20px",
            cursor: "pointer",
            padding: "0",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.8
          }}
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      {message.duration && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "3px",
            backgroundColor: color.dark,
            width: `${progress}%`,
            transition: "width 0.05s linear"
          }}
        />
      )}
    </div>
  );
};

// Main Provider Component
export function FlashMessageProvider ({ 
  children, 
  defaultPosition = "top",
  maxMessages = 5,
  defaultTheme: customDefaultTheme
}: FlashMessageProviderProps ) {
  const [messages, setMessages] = useState<FlashMessage[]>([]);
  const [position, setPosition] = useState<FlashMessagePosition>(defaultPosition);
  const [theme, setTheme] = useState<FlashMessageTheme>({
    ...defaultTheme,
    ...customDefaultTheme
  });

  // Show a new flash message
  const showFlashMessage = useCallback((
    message: string, 
    type: FlashMessageType, 
    options: FlashMessageOptions = {}
  ): string => {
    const id = `flash-${Date.now()}-${Math.random()}`;
    const duration = options.duration ?? 3000;
    
    setMessages(prev => {
      const newMessages = [...prev, { id, message, type, duration }];
      return newMessages.slice(-maxMessages);
    });
    
    return id;
  }, [maxMessages]);

  // Dismiss a specific message by ID
  const dismissFlashMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // Clear all messages
  const clearAllMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Calculate position styles based on position prop
  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "fixed",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
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
  };

  return (
    <FlashMessageContext.Provider 
      value={{ 
        messages, 
        showFlashMessage, 
        dismissFlashMessage, 
        clearAllMessages,
        position,
        setPosition,
        theme,
        setTheme
      }}
    >
      {children}
      
      {/* CSS Animation */}
      <style>{`
        @keyframes flashMessageSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Message Container */}
      {messages.length > 0 && (
        <div style={getPositionStyles()}>
          {messages.map(msg => (
            <FlashMessageItem
              key={msg.id}
              message={msg}
              onDismiss={dismissFlashMessage}
              theme={theme}
            />
          ))}
        </div>
      )}
    </FlashMessageContext.Provider>
  );
};

// Custom Hook
export const useFlashMessage = (): FlashMessageContextProps => {
  const context = useContext(FlashMessageContext);
  if (!context) {
    throw new Error(
      "useFlashMessage must be used within a FlashMessageProvider"
    );
  }
  return context;
};