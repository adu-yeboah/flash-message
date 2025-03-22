'use strict';

var React = require('react');

const FlashMessageContext = React.createContext(undefined);
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
    const [flashMessage, setFlashMessage] = React.useState(null);
    const showFlashMessage = (message, type, duration = 3000) => {
        setFlashMessage({ message, type });
        setTimeout(() => setFlashMessage(null), duration);
    };
    return (React.createElement(FlashMessageContext.Provider, { value: { flashMessage, showFlashMessage } },
        children,
        flashMessage && (React.createElement(FlashMessage, { message: flashMessage.message, type: flashMessage.type, onDismiss: () => setFlashMessage(null) }))));
};
const useFlashMessage = () => {
    const context = React.useContext(FlashMessageContext);
    if (!context)
        throw new Error("useFlashMessage must be used within a FlashMessageProvider");
    return context;
};

exports.FlashMessage = FlashMessage;
exports.FlashMessageProvider = FlashMessageProvider;
exports.useFlashMessage = useFlashMessage;
//# sourceMappingURL=index.cjs.js.map
