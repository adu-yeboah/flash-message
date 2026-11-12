import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, fireEvent } from "@testing-library/react";
import { mount, ref } from "./helpers";

const item = (text: string) => screen.getByText(text).closest('[role="alert"], [role="status"]') as HTMLElement;
// The progress bar is the item's only aria-hidden div (the icon is a span).
const bar = (text: string) => item(text)?.querySelector('div[aria-hidden="true"]');
const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
const show = (text: string, type: "info" | "error" | "success" = "info", duration?: number) => {
  act(() => { ref.api.showFlashMessage(text, type, duration === undefined ? {} : { duration }); });
};

// Note: StrictMode single-dismiss, Escape/interactive-child guards and the
// other dismissal tests join in the dismiss-guards phase.

beforeEach(() => { vi.useFakeTimers(); });

describe("auto-dismiss", () => {
  it("starts exiting after `duration`, then is removed after the exit animation", () => {
    const onDismiss = vi.fn();
    mount({ onDismiss });
    show("Hi", "info", 1000);
    advance(999);
    expect(item("Hi")).toHaveAttribute("data-exiting", "false");
    advance(1);
    expect(item("Hi")).toHaveAttribute("data-exiting", "true");
    advance(350);
    expect(screen.queryByText("Hi")).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("waits as long as the theme animation duration before removing", () => {
    mount({ defaultTheme: { animationDuration: "1s" } });
    show("Slow", "info", 100);
    advance(100 + 350);
    expect(screen.getByText("Slow")).toBeInTheDocument();
    advance(650);
    expect(screen.queryByText("Slow")).not.toBeInTheDocument();
  });

  it("duration 0 stays until dismissed and renders no stray \"0\" or progress bar", () => {
    mount();
    show("Loading", "info", 0);
    advance(60_000);
    expect(item("Loading").textContent).not.toMatch(/0$/);
    expect(bar("Loading")).toBeNull();
  });
});

describe("pausing", () => {
  it("pauses on hover and resumes with exactly the time that was left", () => {
    mount();
    show("Hi", "info", 1000);
    advance(600);
    fireEvent.mouseEnter(item("Hi"));
    advance(10_000);
    expect(item("Hi")).toHaveAttribute("data-exiting", "false");
    fireEvent.mouseLeave(item("Hi"));
    advance(399);
    expect(item("Hi")).toHaveAttribute("data-exiting", "false");
    advance(1);
    expect(item("Hi")).toHaveAttribute("data-exiting", "true");
  });

  it("also pauses while keyboard focus is inside the message", () => {
    mount();
    show("Hi", "info", 1000);
    const close = screen.getByLabelText("Close message");
    act(() => close.focus());
    advance(5000);
    expect(item("Hi")).toHaveAttribute("data-exiting", "false");
    act(() => close.blur());
    advance(1000);
    expect(item("Hi")).toHaveAttribute("data-exiting", "true");
  });

  it("pauses the progress bar animation together with the timer", () => {
    mount();
    show("Hi", "info", 1000);
    const progress = bar("Hi") as HTMLElement;
    expect(progress.style.animationDuration).toBe("1000ms");
    expect(progress.style.animationPlayState).toBe("running");
    fireEvent.mouseEnter(item("Hi"));
    expect(progress.style.animationPlayState).toBe("paused");
  });

  it("hides the progress bar when showProgress is false", () => {
    mount({ defaultTheme: { showProgress: false } });
    show("Hi", "info", 1000);
    expect(bar("Hi")).toBeNull();
  });
});
