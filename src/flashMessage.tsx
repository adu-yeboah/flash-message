"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface FlashMessage {
  message: string;
  type: "success" | "error" | "info";
}

interface FlashMessageContextProps {
  flashMessage: FlashMessage | null;
  showFlashMessage: (message: string, type: "success" | "error" | "info", duration?: number) => void;
}

const FlashMessageContext = createContext<FlashMessageContextProps | undefined>(undefined);

interface FlashMessageProviderProps {
  children: ReactNode;
}

const FlashMessage: React.FC<FlashMessageProps> = ({ message, type, onDismiss }) => {
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: type === "success" ? "green" : type === "info" ? "blue" : "red",
        color: "white",
        padding: "10px",
        zIndex: 50,
      }}
      onClick={onDismiss}
    >
      {message}
    </div>
  );
};

export const FlashMessageProvider: React.FC<FlashMessageProviderProps> = ({ children }) => {
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);

  const showFlashMessage = (message: string, type: "success" | "error" | "info", duration = 3000) => {
    setFlashMessage({ message, type });
    setTimeout(() => setFlashMessage(null), duration);
  };

  return (
    <FlashMessageContext.Provider value={{ flashMessage, showFlashMessage }}>
      {children}
      {flashMessage && (
        <FlashMessage
          message={flashMessage.message}
          type={flashMessage.type}
          onDismiss={() => setFlashMessage(null)}
        />
      )}
    </FlashMessageContext.Provider>
  );
};

export const useFlashMessage = () => {
  const context = useContext(FlashMessageContext);
  if (!context) throw new Error("useFlashMessage must be used within a FlashMessageProvider");
  return context;
};

interface FlashMessageProps {
  message: string | null;
  type: "success" | "error" | "info";
  onDismiss?: () => void;
}