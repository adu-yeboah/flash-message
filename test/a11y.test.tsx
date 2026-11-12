import { describe, it, expect, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import { mount, ref } from "./helpers";

const item = (text: string) => screen.getByText(text).closest('[role="alert"], [role="status"]') as HTMLElement;
const show = (text: string, type: "error" | "warning" | "success" | "info" | "celebration" = "info") => {
  act(() => { ref.api.showFlashMessage(text, type, { duration: 0 }); });
};

describe("screen reader roles", () => {
  it("errors interrupt (role=alert, assertive)", () => {
    mount();
    show("Boom", "error");
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
  });

  it("warnings interrupt too", () => {
    mount();
    show("Careful", "warning");
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
  });

  it("success waits politely (role=status, polite)", () => {
    mount();
    show("Done", "success");
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("info and celebration wait politely too", () => {
    mount();
    show("Note", "info");
    show("Yay", "celebration");
    expect(screen.getAllByRole("status")).toHaveLength(2);
  });

  it("hides the decorative icon from screen readers", () => {
    mount();
    show("Done", "success");
    expect(item("Done").querySelector('span[aria-hidden="true"]')).toHaveAttribute("aria-hidden", "true");
  });
});

describe("reduced motion", () => {
  it("skips enter/exit animation when the user prefers reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as never;
    mount();
    show("Hi");
    expect(item("Hi").style.animationName).toBe("");
    expect(item("Hi").style.transition).toBe("");
  });

  it("keeps animations when reduced motion is off", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as never;
    mount();
    show("Hi");
    expect(item("Hi").style.animationName).toBe("fm-slide-in-top");
    expect(item("Hi").style.transition).not.toBe("");
  });
});
