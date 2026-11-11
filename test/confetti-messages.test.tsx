import { describe, it, expect, vi, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { mount, ref } from "./helpers";

vi.mock("../src/confetti", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/confetti")>();
  return { ...actual, fireConfetti: vi.fn(() => Promise.resolve()) };
});
import { fireConfetti } from "../src/confetti";
const fire = vi.mocked(fireConfetti);

beforeEach(() => fire.mockClear());

describe("confetti on messages", () => {
  it("celebration messages fire confetti by default", () => {
    mount();
    act(() => { ref.api.showFlashMessage("You did it!", "celebration"); });
    expect(fire).toHaveBeenCalledTimes(1);
  });

  it("other types do not, unless asked", () => {
    mount();
    act(() => { ref.api.showFlashMessage("Saved", "success"); });
    expect(fire).not.toHaveBeenCalled();
    act(() => { ref.api.showFlashMessage("Saved again", "success", { confetti: true }); });
    expect(fire).toHaveBeenCalledTimes(1);
  });

  it("confetti: false silences a celebration", () => {
    mount();
    act(() => { ref.api.showFlashMessage("Quiet win", "celebration", { confetti: false }); });
    expect(fire).not.toHaveBeenCalled();
  });

  it("fires exactly once even in StrictMode (effects run twice in dev)", () => {
    mount({}, { strict: true });
    act(() => { ref.api.showFlashMessage("Once", "celebration"); });
    expect(fire).toHaveBeenCalledTimes(1);
  });

  it("passes users' own emoji and options through", () => {
    mount();
    act(() => {
      ref.api.showFlashMessage("Goal!", "success", { confetti: { emojis: ["⚽", "🥅"], particleCount: 40 } });
    });
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ emojis: ["⚽", "🥅"], particleCount: 40 }));
  });

  it("theme confetti options are the base, message options win", () => {
    mount({ defaultTheme: { confetti: { particleCount: 25, colors: ["#ff0000"] } } });
    act(() => { ref.api.showFlashMessage("Mixed", "celebration", { confetti: { particleCount: 99 } }); });
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ particleCount: 99, colors: ["#ff0000"] }));
  });

  it("respects an explicit origin", () => {
    mount();
    act(() => { ref.api.showFlashMessage("Top left", "celebration", { confetti: { origin: { x: 0, y: 0 } } }); });
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ origin: { x: 0, y: 0 } }));
  });

  // Note: "a queued celebration fires when it appears, not when it is queued"
  // joins in the queue-stacking phase, together with the real queue behavior.
});

describe("confetti() from the hook", () => {
  it("fires on demand without a message, using theme defaults", () => {
    mount({ defaultTheme: { confetti: { particleCount: 10 } } });
    act(() => { void ref.api.confetti({ emojis: ["🎂"] }); });
    expect(fire).toHaveBeenCalledWith({ particleCount: 10, emojis: ["🎂"] });
  });
});
