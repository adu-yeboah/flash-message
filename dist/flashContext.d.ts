import React, { ReactNode } from "react";
import FlashMessage from "./FlashMessage";
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
export declare const FlashMessageProvider: React.FC<FlashMessageProviderProps>;
export declare const useFlashMessage: () => FlashMessageContextProps;
export {};
//# sourceMappingURL=flashContext.d.ts.map