import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, fireEvent } from "@testing-library/react";
import { mount, ref } from "./helpers";

const item = (text: string) => screen.getByText(text).closest('[role="alert"]') as HTMLElement;
const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
const show = (text: string, type: "info" | "error" | "success" = "info", duration?: number, node?: React.ReactNode) => {
  act(() => { ref.api.showFlashMessage(node ?? text, type, duration === undefined ? {} : { duration }); });
};

beforeEach(() => { vi.useFakeTimers(); });

describe("dismissing", () => {
  it("the close button dismisses", () => {
    mount();
    show("Hi", "info", 0);
    fireEvent.click(screen.getByLabelText("Close message"));
    advance(350);
    expect(screen.queryByText("Hi")).not.toBeInTheDocument();
  });

  it("clicking the message body dismisses", () => {
    mount();
    show("Hi", "info", 0);
    fireEvent.click(screen.getByText("Hi"));
    advance(350);
    expect(screen.queryByText("Hi")).not.toBeInTheDocument();
  });

  it("clicking a link inside the message does NOT dismiss it", () => {
    mount();
    show("", "info", 0, <a href="#undo">Undo</a>);
    fireEvent.click(screen.getByText("Undo"));
    advance(1000);
    expect(screen.getByText("Undo")).toBeInTheDocument();
  });

  it("clicking a button inside the message does NOT dismiss it", () => {
    mount();
    show("", "info", 0, <button type="button">Retry</button>);
    fireEvent.click(screen.getByText("Retry"));
    advance(1000);
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("Escape dismisses while focus is inside", () => {
    mount();
    show("Hi", "info", 0);
    const close = screen.getByLabelText("Close message");
    act(() => close.focus());
    fireEvent.keyDown(close, { key: "Escape" });
    advance(350);
    expect(screen.queryByText("Hi")).not.toBeInTheDocument();
  });

  it("rapid double dismiss calls onDismiss once", () => {
    const onDismiss = vi.fn();
    mount({ onDismiss });
    show("Hi", "info", 0);
    const close = screen.getByLabelText("Close message");
    fireEvent.click(close); fireEvent.click(close);
    advance(1000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("can hide the close button", () => {
    mount({ defaultTheme: { showCloseButton: false } });
    show("Hi", "info", 0);
    expect(screen.queryByLabelText("Close message")).not.toBeInTheDocument();
  });

  it("calls onDismiss exactly once with the message, even in StrictMode", () => {
    const onDismiss = vi.fn();
    mount({ onDismiss }, { strict: true });
    let id = "";
    act(() => { id = ref.api.showFlashMessage("Once", "info"); });
    act(() => ref.api.dismissFlashMessage(id));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith(id, expect.objectContaining({ id, message: "Once" }));
  });

  it("works under StrictMode and still dismisses exactly once", () => {
    const onDismiss = vi.fn();
    mount({ onDismiss }, { strict: true });
    show("Hi", "info", 500);
    advance(500 + 350);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
