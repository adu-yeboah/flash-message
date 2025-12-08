export type FlashMessageType = "success" | "error" | "info" | "warning";

export type FlashMessagePosition = 
  | "top" 
  | "bottom" 
  | "top-left" 
  | "top-right" 
  | "bottom-left" 
  | "bottom-right";

export interface FlashMessage {
  id: string;
  message: string;
  type: FlashMessageType;
  duration?: number;
}

export interface ColorScheme {
  bg: string;
  dark: string;
  text?: string;
}

export interface FlashMessageTheme {
  success?: ColorScheme;
  error?: ColorScheme;
  info?: ColorScheme;
  warning?: ColorScheme;
}

export interface FlashMessageOptions {
  duration?: number;
}

export interface FlashMessageContextProps {
  messages: FlashMessage[];
  showFlashMessage: (
    message: string, 
    type: FlashMessageType, 
    options?: FlashMessageOptions
  ) => string;
  dismissFlashMessage: (id: string) => void;
  clearAllMessages: () => void;
  position: FlashMessagePosition;
  setPosition: (position: FlashMessagePosition) => void;
  theme: FlashMessageTheme;
  setTheme: (theme: FlashMessageTheme) => void;
}

export interface FlashMessageProviderProps {
  children: React.ReactNode;
  defaultPosition?: FlashMessagePosition;
  maxMessages?: number;
  defaultTheme?: FlashMessageTheme;
}

export interface FlashMessageItemProps {
  message: FlashMessage;
  onDismiss: (id: string) => void;
  theme: FlashMessageTheme;
}
