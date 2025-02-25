interface FlashMessageProps {
    message: string | null;
    type: "success" | "error" | "info";
    onDismiss?: () => void;
}
declare const FlashMessage: React.FC<FlashMessageProps>;
export default FlashMessage;
//# sourceMappingURL=FlashMessage.d.ts.map