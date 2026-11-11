export { FlashMessageProvider, useFlashMessage } from "./FlashMessageProvider";

// Theme utilities
export { defaultTheme, mergeTheme, resolveColor, MESSAGE_TYPES } from "./theme";

// Confetti
export { fireConfetti, clearConfetti } from "./confetti";

// Types
export type {
  FlashMessageType,
  FlashMessagePosition,
  FlashMessage,
  ColorScheme,
  FlashMessageTheme,
  FlashMessageOptions,
  FlashMessageContextProps,
  FlashMessageProviderProps,
  FlashMessageItemProps,
  TransitionPreset,
} from "./types";

export type {
  ConfettiOptions,
  ConfettiParticle,
  ConfettiShape,
} from "./confetti";