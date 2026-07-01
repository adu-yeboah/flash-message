import type { ReactNode, CSSProperties } from "react";

//  Message Types 
export type FlashMessageType =
  | "success"
  | "error"
  | "info"
  | "warning"

//  Position ─
export type FlashMessagePosition =
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";


//  Transition Presets 
export type TransitionPreset = "slide" | "fade" | "scale" | "bounce" | "flip";

//  Core Message 
export interface FlashMessage {
  id: string;
  message: ReactNode;
  type: FlashMessageType;
  duration?: number;
  transition?: TransitionPreset;
}

//  Color Scheme 
export interface ColorScheme {
  bg: string;
  dark: string;
  text?: string;
  icon?: string;
}

//  Theme 
export interface FlashMessageTheme {
  // Per-type color schemes
  success?: ColorScheme;
  error?: ColorScheme;
  info?: ColorScheme;
  warning?: ColorScheme;
  celebration?: ColorScheme;

  // Global layout overrides
  borderRadius?: string;
  padding?: string;
  fontFamily?: string;
  shadow?: string;
  maxWidth?: string;
  minWidth?: string;
  gap?: string;

  // Animation overrides
  animationDuration?: string;
  animationEasing?: string;
  progressHeight?: string;
  showProgress?: boolean;
  showCloseButton?: boolean;

  // Variant system: solid / outline / subtle
  variant?: "solid" | "outline" | "subtle";
}

//  Options ──
export interface FlashMessageOptions {
  duration?: number;
  transition?: TransitionPreset;
}


//  Context ──
export interface FlashMessageContextProps {
  messages: FlashMessage[];
  showFlashMessage: (
    message: ReactNode,
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

//  Provider Props ─
export interface FlashMessageProviderProps {
  children: ReactNode;
  defaultPosition?: FlashMessagePosition;
  maxMessages?: number;
  defaultTheme?: FlashMessageTheme;
  onDismiss?: (id: string, message: FlashMessage) => void;
  stacking?: "stack" | "replace" | "queue";
}

//  Item Props ──
export interface FlashMessageItemProps {
  message: FlashMessage;
  onDismiss: (id: string) => void;
  theme: FlashMessageTheme;
  position: FlashMessagePosition;
  containerStyle?: CSSProperties;
}

