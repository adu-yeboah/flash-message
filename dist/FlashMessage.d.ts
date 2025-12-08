import React from "react";
import { FlashMessageTheme, FlashMessageContextProps, FlashMessageProviderProps } from "./types";
export declare const defaultTheme: FlashMessageTheme;
export declare function FlashMessageProvider({ children, defaultPosition, maxMessages, defaultTheme: customDefaultTheme }: FlashMessageProviderProps): React.JSX.Element;
export declare const useFlashMessage: () => FlashMessageContextProps;
//# sourceMappingURL=FlashMessage.d.ts.map