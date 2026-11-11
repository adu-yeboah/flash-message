import { describe, it, expect } from "vitest";
import { act, screen } from "@testing-library/react";
import { mount, ref } from "./helpers";
import type { FlashMessageOptions, FlashMessageType } from "../src/index";

const show = (text: string, type: FlashMessageType = "info", options: FlashMessageOptions = {}) =>
  act(() => { ref.api.showFlashMessage(text, type, { duration: 0, ...options }); });
// The toast root is the [role="alert"] ancestor of the text; the icon is its
// only aria-hidden span (the close button is a labelled button, not hidden).
const item = (text: string) => screen.getByText(text).closest('[role="alert"]');
const icon = (text: string) => item(text)?.querySelector('span[aria-hidden="true"]');

describe("custom icons", () => {
  it("shows the default icon for the type when nothing is overridden", () => {
    mount();
    show("Saved", "success");
    expect(icon("Saved")).toHaveTextContent("✓");
  });

  it("lets one message use its own emoji", () => {
    mount();
    show("Shipped", "success", { icon: "🚀" });
    expect(icon("Shipped")).toHaveTextContent("🚀");
  });

  it("accepts any React element, such as an inline SVG", () => {
    mount();
    show("Custom", "info", { icon: <svg data-testid="my-svg" width="16" height="16" /> });
    expect(icon("Custom")!.querySelector('[data-testid="my-svg"]')).not.toBeNull();
  });

  it("icon: null hides the icon for that message only", () => {
    mount();
    show("Quiet", "info", { icon: null });
    show("Loud", "info");
    expect(icon("Quiet")).toBeNull();
    expect(icon("Loud")).not.toBeNull();
  });

  it("a theme can change the icon for a whole type", () => {
    mount({ defaultTheme: { success: { bg: "#047857", dark: "#065f46", icon: "🌟" } } });
    show("Themed", "success");
    expect(icon("Themed")).toHaveTextContent("🌟");
  });

  it("a per-message icon beats the theme icon", () => {
    mount({ defaultTheme: { success: { bg: "#047857", dark: "#065f46", icon: "🌟" } } });
    show("Both", "success", { icon: "💚" });
    expect(icon("Both")).toHaveTextContent("💚");
  });
});

describe("custom className", () => {
  it("adds a custom className for per-message styling", () => {
    mount();
    show("Styled", "info", { className: "my-toast" });
    expect(item("Styled")).toHaveClass("my-toast");
  });

  it("messages without a className have no class attribute", () => {
    mount();
    show("Plain", "info");
    expect(item("Plain")).not.toHaveClass();
  });
});
