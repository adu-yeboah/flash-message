import React, { createContext, useState, useContext } from 'react';

const FlashMessageContext = createContext(undefined);
const FlashMessage = ({ message, type, onDismiss }) => {
    if (!message)
        return null;
    const bgColor = type === "success" ? "bg-green-500" : type === "info" ? "bg-blue-500" : "bg-red-500";
    return (React.createElement("div", { className: `fixed top-4 z-50 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md text-white shadow-lg ${bgColor}`, style: { maxWidth: "90%", textAlign: "center" }, onClick: onDismiss }, message));
};
const FlashMessageProvider = ({ children }) => {
    const [flashMessage, setFlashMessage] = useState(null);
    const showFlashMessage = (message, type, duration = 3000) => {
        setFlashMessage({ message, type });
        setTimeout(() => setFlashMessage(null), duration);
    };
    return (React.createElement(FlashMessageContext.Provider, { value: { flashMessage, showFlashMessage } },
        children,
        flashMessage && (React.createElement(FlashMessage, { message: flashMessage.message, type: flashMessage.type, onDismiss: () => setFlashMessage(null) }))));
};
const useFlashMessage = () => {
    const context = useContext(FlashMessageContext);
    if (!context) {
        throw new Error("useFlashMessage must be used within a FlashMessageProvider");
    }
    return context;
};

export { FlashMessageProvider, FlashMessage as default, useFlashMessage };
//# sourceMappingURL=index.esm.js.map
