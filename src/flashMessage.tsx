import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the FlashMessage type
interface FlashMessage {
  message: string;
  type: "success" | "error" | "info";
}

// Define the context props
interface FlashMessageContextProps {
  flashMessage: FlashMessage | null;
  showFlashMessage: (message: string, type: "success" | "error" | "info", duration?: number) => void;
}

// Create the context
const FlashMessageContext = createContext<FlashMessageContextProps | undefined>(undefined);

// Define provider props
interface FlashMessageProviderProps {
  children: ReactNode;
}

// FlashMessage component
interface FlashMessageProps {
  message: string | null;
  type: "success" | "error" | "info";
  onDismiss?: () => void;
}

const FlashMessage: React.FC<FlashMessageProps> = ({ message, type, onDismiss }) => {
  if (!message) return null;

  const bgColor =
    type === "success" ? "bg-green-500" : type === "info" ? "bg-blue-500" : "bg-red-500";

  return (
    <div
      className={`fixed top-4 z-50 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md text-white shadow-lg ${bgColor}`}
      style={{ maxWidth: "90%", textAlign: "center" }}
      onClick={onDismiss}
    >
      {message}
    </div>
  );
};

// FlashMessageProvider component
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

// Hook to use the flash message context
export const useFlashMessage = () => {
  const context = useContext(FlashMessageContext);
  if (!context) {
    throw new Error("useFlashMessage must be used within a FlashMessageProvider");
  }
  return context;
};

// Export FlashMessage if you want to use it standalone elsewhere
export default FlashMessage;