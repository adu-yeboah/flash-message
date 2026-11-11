import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createParticle, stepParticle, particleOpacity, resolveConfettiOptions,
  fireConfetti, clearConfetti, resolveMessageConfetti,
} from "../src/confetti";

const canvasEl = () => document.querySelector("canvas[data-flashmessage-confetti]");
const FRAME = 16;
let ctx: Record<string, ReturnType<typeof vi.fn> | unknown>;

function fakeContext() {
  return {
    save: vi.fn(), restore: vi.fn(), translate: vi.fn(), rotate: vi.fn(), setTransform: vi.fn(),
    clearRect: vi.fn(), fillRect: vi.fn(), beginPath: vi.fn(), ellipse: vi.fn(), fill: vi.fn(), fillText: vi.fn(),
    fillStyle: "", globalAlpha: 1, font: "", textAlign: "", textBaseline: "",
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  ctx = fakeContext();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as never);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(0), FRAME) as unknown as number);
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as never;
});
afterEach(() => {
  clearConfetti();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("pure physics", () => {
  const o = resolveConfettiOptions({ angle: 90, spread: 0, startVelocity: 20 });

  it("launches straight up for angle 90 with no spread", () => {
    const p = createParticle(o, { x: 100, y: 200 }, () => 1);
    expect(p.vx).toBeCloseTo(0, 5);
    expect(p.vy).toBeLessThan(0); // negative y = up on screen
    expect(p.x).toBe(100);
    expect(p.y).toBe(200);
  });

  it("keeps the fan inside angle ± spread/2", () => {
    const wide = resolveConfettiOptions({ angle: 90, spread: 60, startVelocity: 10 });
    const left = createParticle(wide, { x: 0, y: 0 }, () => 0);   // angle 60 degrees
    const right = createParticle(wide, { x: 0, y: 0 }, () => 1);  // angle 120 degrees
    expect(Math.atan2(-left.vy, left.vx) * (180 / Math.PI)).toBeCloseTo(60, 0);
    expect(Math.atan2(-right.vy, right.vx) * (180 / Math.PI)).toBeCloseTo(120, 0);
  });

  it("slows down, falls, and eventually finishes", () => {
    const p = createParticle(resolveConfettiOptions({ ticks: 10 }), { x: 0, y: 0 }, () => 0.5);
    const speed0 = Math.hypot(p.vx, p.vy);
    stepParticle(p, resolveConfettiOptions({ ticks: 10 }));
    expect(Math.hypot(p.vx, p.vy)).toBeLessThan(speed0);
    let alive = true;
    for (let i = 0; i < 20 && alive; i++) alive = stepParticle(p, resolveConfettiOptions({ ticks: 10 }));
    expect(alive).toBe(false);
  });

  it("is opaque early and transparent at the end of life", () => {
    const p = createParticle(resolveConfettiOptions(), { x: 0, y: 0 }, () => 0.5);
    expect(particleOpacity(p)).toBe(1);
    p.tick = p.life;
    expect(particleOpacity(p)).toBe(0);
  });

  it("wind (drift) pushes particles sideways", () => {
    const windy = resolveConfettiOptions({ drift: 2, spread: 0, angle: 90 });
    const p = createParticle(windy, { x: 0, y: 0 }, () => 0.5);
    stepParticle(p, windy);
    expect(p.vx).toBeGreaterThan(1.9);
  });
});

describe("resolveConfettiOptions", () => {
  it("fills defaults", () => {
    const o = resolveConfettiOptions();
    expect(o.particleCount).toBe(80);
    expect(o.origin).toEqual({ x: 0.5, y: 0.6 });
    expect(o.colors.length).toBeGreaterThan(0);
    expect(o.emojis).toEqual([]);
  });
  it("falls back to defaults for empty arrays and keeps partial origins", () => {
    const o = resolveConfettiOptions({ colors: [], shapes: [], origin: { x: 0.1 } });
    expect(o.colors.length).toBeGreaterThan(0);
    expect(o.shapes.length).toBe(3);
    expect(o.origin).toEqual({ x: 0.1, y: 0.6 });
  });
});

describe("fireConfetti", () => {
  it("adds a hidden full-screen canvas, draws, then cleans up and resolves", async () => {
    const done = fireConfetti({ particleCount: 5, ticks: 10 });
    const el = canvasEl() as HTMLCanvasElement;
    expect(el).not.toBeNull();
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el.style.pointerEvents).toBe("none");
    expect(el.style.position).toBe("fixed");

    await vi.advanceTimersByTimeAsync(FRAME * 2);
    expect((ctx.save as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);

    await vi.advanceTimersByTimeAsync(FRAME * 30);
    await done;
    expect(canvasEl()).toBeNull();
  });

  it("draws emoji with fillText instead of shapes", async () => {
    fireConfetti({ particleCount: 3, ticks: 10, emojis: ["🎉"] });
    await vi.advanceTimersByTimeAsync(FRAME * 2);
    const fillText = ctx.fillText as ReturnType<typeof vi.fn>;
    expect(fillText).toHaveBeenCalled();
    expect(fillText.mock.calls.every((c) => c[0] === "🎉")).toBe(true);
    expect(ctx.fillRect as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();
  });

  it("lets you draw anything with drawParticle", async () => {
    const draw = vi.fn();
    fireConfetti({ particleCount: 4, ticks: 10, drawParticle: draw });
    await vi.advanceTimersByTimeAsync(FRAME);
    expect(draw).toHaveBeenCalledTimes(4);
    expect(draw.mock.calls[0]![0]).toBe(ctx);
    expect(draw.mock.calls[0]![1]).toHaveProperty("size");
  });

  it("survives a drawParticle that throws, and stops the loop", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const done = fireConfetti({ particleCount: 2, ticks: 50, drawParticle: () => { throw new Error("bad"); } });
    await vi.advanceTimersByTimeAsync(FRAME * 2);
    await done;
    expect(canvasEl()).toBeNull();
    expect(err).toHaveBeenCalled();
  });

  it("is skipped when the user prefers reduced motion", async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as never;
    await fireConfetti({ particleCount: 5 });
    expect(canvasEl()).toBeNull();
  });

  it("can ignore reduced motion when explicitly told to", async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as never;
    fireConfetti({ particleCount: 5, ticks: 10, respectReducedMotion: false });
    expect(canvasEl()).not.toBeNull();
  });

  it("shares one canvas between overlapping bursts", () => {
    fireConfetti({ particleCount: 3, ticks: 10 });
    fireConfetti({ particleCount: 3, ticks: 10 });
    expect(document.querySelectorAll("canvas[data-flashmessage-confetti]")).toHaveLength(1);
  });

  it("clearConfetti removes the canvas and resolves pending bursts", async () => {
    const done = fireConfetti({ particleCount: 3, ticks: 500 });
    clearConfetti();
    await done;
    expect(canvasEl()).toBeNull();
  });

  it("does nothing for particleCount 0 or when canvas is unsupported", async () => {
    await fireConfetti({ particleCount: 0 });
    expect(canvasEl()).toBeNull();
    (HTMLCanvasElement.prototype.getContext as ReturnType<typeof vi.fn>).mockReturnValue(null);
    await fireConfetti({ particleCount: 5 });
    expect(canvasEl()).toBeNull();
  });
});

describe("resolveMessageConfetti", () => {
  it("celebration fires by default, other types do not", () => {
    expect(resolveMessageConfetti("celebration", undefined)).toEqual({});
    expect(resolveMessageConfetti("success", undefined)).toBeNull();
  });
  it("confetti: true turns it on for any type; false turns it off even for celebration", () => {
    expect(resolveMessageConfetti("success", true)).toEqual({});
    expect(resolveMessageConfetti("celebration", false)).toBeNull();
  });
  it("merges theme defaults under message options", () => {
    const out = resolveMessageConfetti("info", { emojis: ["🔥"] }, { particleCount: 30, emojis: ["🎉"] });
    expect(out).toEqual({ particleCount: 30, emojis: ["🔥"] });
  });
});
