import React, { createContext, useState, useContext } from 'react';

const FlashMessageContext = createContext(undefined);
const FlashMessage = ({ message, type, onDismiss }) => {
    if (!message)
        return null;
    return (React.createElement("div", { style: {
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: type === "success" ? "green" : type === "info" ? "blue" : "red",
            color: "white",
            padding: "10px",
            zIndex: 50,
        }, onClick: onDismiss }, message));
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
    if (!context)
        throw new Error("useFlashMessage must be used within a FlashMessageProvider");
    return context;
};

export { FlashMessage, FlashMessageProvider, useFlashMessage };
//# sourceMappingURL=index.esm.js.map
