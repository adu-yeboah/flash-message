import React, { ReactNode } from "react";
interface FlashMessage {
    message: string;
    type: "success" | "error" | "info";
}
interface FlashMessageContextProps {
    flashMessage: FlashMessage | null;
    showFlashMessage: (message: string, type: "success" | "error" | "info", duration?: number) => void;
}
interface FlashMessageProviderProps {
    children: ReactNode;
}
export declare const FlashMessage: React.FC<FlashMessageProps>;
export declare const FlashMessageProvider: React.FC<FlashMessageProviderProps>;
export declare const useFlashMessage: () => FlashMessageContextProps;
interface FlashMessageProps {
    message: string | null;
    type: "success" | "error" | "info";
    onDismiss?: () => void;
}
export {};
//# sourceMappingURL=FlashMessage.d.ts.map