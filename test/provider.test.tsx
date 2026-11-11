import { describe, it, expect, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { mount, ref } from "./helpers";
import { useFlashMessage } from "../src/index";

const show = (text: string, type: "info" | "success" = "info") => {
  let id = "";
  act(() => { id = ref.api.showFlashMessage(text, type); });
  return id;
};

// Note: "onDismiss fires exactly once, even in StrictMode" joins in the
// dismiss-guards phase; "setTheme merges a partial theme" joins in the
// theme-merge phase, together with those behavior changes.

describe("showFlashMessage / dismissFlashMessage", () => {
  it("shows a message and returns its id", () => {
    mount();
    const id = show("Saved!");
    expect(id).toMatch(/^fm-/);
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("removes a message when dismissed by id", () => {
    mount();
    const id = show("Bye");
    act(() => ref.api.dismissFlashMessage(id));
    expect(screen.queryByText("Bye")).not.toBeInTheDocument();
  });

  it("ignores an unknown id", () => {
    const onDismiss = vi.fn();
    mount({ onDismiss });
    act(() => ref.api.dismissFlashMessage("nope"));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("clears everything", () => {
    mount();
    show("a"); show("b");
    act(() => ref.api.clearAllMessages());
    expect(screen.queryByText("a")).not.toBeInTheDocument();
    expect(screen.queryByText("b")).not.toBeInTheDocument();
  });
});

describe("stacking modes", () => {
  it("stack: keeps the newest maxMessages", () => {
    mount({ stacking: "stack", maxMessages: 2 });
    show("first"); show("second"); show("third");
    expect(screen.queryByText("first")).not.toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
    expect(screen.getByText("third")).toBeInTheDocument();
  });

  it("replace: shows only the latest", () => {
    mount({ stacking: "replace" });
    show("first"); show("second");
    expect(screen.queryByText("first")).not.toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });

  it("queue: shows maxMessages, holds the rest, and releases them as space frees up", () => {
    mount({ stacking: "queue", maxMessages: 2 });
    const first = show("first"); show("second"); show("third");
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
    expect(screen.queryByText("third")).not.toBeInTheDocument(); // waiting
    expect(ref.api.messages).toHaveLength(3); // nothing was dropped

    act(() => ref.api.dismissFlashMessage(first));
    expect(screen.getByText("third")).toBeInTheDocument(); // its turn
  });
});

describe("theme and position", () => {
  it("setPosition changes the position", () => {
    mount();
    act(() => ref.api.setPosition("bottom-right"));
    expect(ref.api.position).toBe("bottom-right");
  });

  it("useFlashMessage throws a helpful error outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useFlashMessage())).toThrow(/within a <FlashMessageProvider>/);
    spy.mockRestore();
  });
});
