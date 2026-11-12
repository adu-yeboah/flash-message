import type { FlashMessageType } from "./types";

//  Confetti Types 
export type ConfettiShape = "square" | "circle" | "ribbon";

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  wobble: number;
  wobbleSpeed: number;
  tick: number;
  life: number;
  color: string;
  shape: ConfettiShape;
  emoji?: string;
}

export interface ConfettiOptions {
  /** How many particles. Default 80. */
  particleCount?: number;
  /** Direction in degrees: 90 = straight up, 0 = right, 180 = left. Default 90. */
  angle?: number;
  /** Width of the fan in degrees. Default 70. */
  spread?: number;
  /** Launch speed in px per frame. Default 28. */
  startVelocity?: number;
  /** How fast particles fall. Default 1. */
  gravity?: number;
  /** Speed kept each frame (0 to 1). Lower stops sooner. Default 0.93. */
  decay?: number;
  /** Constant sideways push per frame (wind). Default 0. */
  drift?: number;
  /** Lifetime in frames (about 60 per second). Default 180. */
  ticks?: number;
  /** Size multiplier. Default 1. */
  scalar?: number;
  /** Where the burst starts, as 0 to 1 of the viewport. Default { x: 0.5, y: 0.6 }. */
  origin?: { x?: number; y?: number };
  /** CSS colors for the paper pieces. */
  colors?: string[];
  /** Use these emoji (or any text) as the particles instead of paper pieces. */
  emojis?: string[];
  /** Paper shapes to mix. Default all three. */
  shapes?: ConfettiShape[];
  /** CSS z-index of the canvas. Default 10000. */
  zIndex?: number;
  /** Skip the effect when the user prefers reduced motion. Default true. */
  respectReducedMotion?: boolean;
  /**
   * Draw each particle yourself. The canvas is already moved to the particle,
   * rotated, and faded, so draw around (0, 0).
   */
  drawParticle?: (ctx: CanvasRenderingContext2D, particle: ConfettiParticle) => void;
}

export interface ResolvedConfettiOptions
  extends Required<Omit<ConfettiOptions, "origin" | "drawParticle">> {
  origin: { x: number; y: number };
  drawParticle?: ConfettiOptions["drawParticle"];
}

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const DEFAULT_COLORS = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
const DEFAULT_SHAPES: ConfettiShape[] = ["square", "circle", "ribbon"];

/** Fill in every default. Pure. */
export function resolveConfettiOptions(o: ConfettiOptions = {}): ResolvedConfettiOptions {
  return {
    particleCount: o.particleCount ?? 80,
    angle: o.angle ?? 90,
    spread: o.spread ?? 70,
    startVelocity: o.startVelocity ?? 28,
    gravity: o.gravity ?? 1,
    decay: o.decay ?? 0.93,
    drift: o.drift ?? 0,
    ticks: o.ticks ?? 180,
    scalar: o.scalar ?? 1,
    zIndex: o.zIndex ?? 10000,
    respectReducedMotion: o.respectReducedMotion ?? true,
    origin: { x: o.origin?.x ?? 0.5, y: o.origin?.y ?? 0.6 },
    colors: o.colors?.length ? o.colors : DEFAULT_COLORS,
    shapes: o.shapes?.length ? o.shapes : DEFAULT_SHAPES,
    emojis: o.emojis ?? [],
    drawParticle: o.drawParticle,
  };
}

/** Pure: build one particle. `rand` is injectable so tests are deterministic. */
export function createParticle(
  o: ResolvedConfettiOptions,
  origin: { x: number; y: number },
  rand: () => number = Math.random
): ConfettiParticle {
  const angle = ((o.angle + (rand() - 0.5) * o.spread) * Math.PI) / 180;
  const speed = o.startVelocity * (0.5 + rand() * 0.5);
  return {
    x: origin.x,
    y: origin.y,
    vx: Math.cos(angle) * speed,
    vy: -Math.sin(angle) * speed, // screen y grows downward, so "up" is negative
    size: (6 + rand() * 6) * o.scalar,
    rotation: rand() * Math.PI * 2,
    spin: (rand() - 0.5) * 0.4,
    wobble: rand() * Math.PI * 2,
    wobbleSpeed: 0.1 + rand() * 0.15,
    tick: 0,
    life: Math.round(o.ticks * (0.7 + rand() * 0.3)),
    color: o.colors[Math.floor(rand() * o.colors.length)]!,
    shape: o.shapes[Math.floor(rand() * o.shapes.length)]!,
    emoji: o.emojis.length ? o.emojis[Math.floor(rand() * o.emojis.length)] : undefined,
  };
}

/** Pure: advance one frame. Returns false when the particle is finished. */
export function stepParticle(p: ConfettiParticle, o: ResolvedConfettiOptions): boolean {
  p.vx = p.vx * o.decay + o.drift;
  p.vy = p.vy * o.decay + o.gravity * 0.4;
  p.x += p.vx;
  p.y += p.vy;
  p.rotation += p.spin;
  p.wobble += p.wobbleSpeed;
  p.tick += 1;
  return p.tick < p.life;
}

/** Pure: fully visible for 70% of life, then fades out. */
export function particleOpacity(p: ConfettiParticle): number {
  const fadeStart = p.life * 0.7;
  if (p.tick <= fadeStart) return 1;
  return Math.max(0, 1 - (p.tick - fadeStart) / (p.life - fadeStart));
}

export function drawDefaultParticle(ctx: CanvasRenderingContext2D, p: ConfettiParticle): void {
  if (p.emoji) {
    ctx.font = `${p.size * 2}px ${EMOJI_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.emoji, 0, 0);
    return;
  }
  ctx.fillStyle = p.color;
  const flip = Math.max(0.15, Math.abs(Math.cos(p.wobble))); // fake 3D tumble
  if (p.shape === "circle") {
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size / 2, (p.size / 2) * flip, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.shape === "ribbon") {
    ctx.fillRect(-p.size, (-p.size * 0.15) * flip, p.size * 2, p.size * 0.3 * flip);
  } else {
    ctx.fillRect(-p.size / 2, (-p.size / 2) * flip, p.size, p.size * flip);
  }
}

// Runner: one shared full-screen canvas, one animation loop 
interface Burst {
  remaining: number;
  resolve: () => void;
}
interface Active {
  p: ConfettiParticle;
  o: ResolvedConfettiOptions;
  burst: Burst;
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let active: Active[] = [];
let raf = 0;

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sizeCanvas(): void {
  if (!canvas || !ctx) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels, render in device pixels
}

function ensureCanvas(zIndex: number): boolean {
  if (canvas) return true;
  const el = document.createElement("canvas");
  const context = el.getContext("2d");
  if (!context) return false; // no canvas support: skip silently
  el.setAttribute("aria-hidden", "true");
  el.setAttribute("data-flashmessage-confetti", "");
  Object.assign(el.style, {
    position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
    pointerEvents: "none", zIndex: String(zIndex),
  });
  document.body.appendChild(el);
  canvas = el;
  ctx = context;
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);
  return true;
}

function teardown(): void {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  window.removeEventListener("resize", sizeCanvas);
  canvas?.remove();
  canvas = null;
  ctx = null;
}

function frame(): void {
  raf = 0;
  if (!canvas || !ctx) return;
  const c = ctx;
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  try {
    active = active.filter((a) => {
      const alive = stepParticle(a.p, a.o);
      if (alive) {
        c.save();
        c.translate(a.p.x, a.p.y);
        c.rotate(a.p.rotation);
        c.globalAlpha = particleOpacity(a.p);
        (a.o.drawParticle ?? drawDefaultParticle)(c, a.p);
        c.restore();
      } else if (--a.burst.remaining === 0) {
        a.burst.resolve();
      }
      return alive;
    });
  } catch (error) {
    // A broken custom drawParticle must not leave a runaway loop behind
    console.error("[flashmessage-js] confetti stopped:", error);
    clearConfetti();
    return;
  }
  if (active.length) raf = requestAnimationFrame(frame);
  else teardown();
}

/**
 * Fire one burst of confetti. Resolves when every particle has finished (or
 */
export function fireConfetti(options: ConfettiOptions = {}): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return Promise.resolve();
  const o = resolveConfettiOptions(options);
  if (o.particleCount <= 0) return Promise.resolve();
  if (o.respectReducedMotion && prefersReducedMotion()) return Promise.resolve();
  if (!ensureCanvas(o.zIndex)) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const burst: Burst = { remaining: o.particleCount, resolve };
    const origin = { x: o.origin.x * window.innerWidth, y: o.origin.y * window.innerHeight };
    for (let i = 0; i < o.particleCount; i++) {
      active.push({ p: createParticle(o, origin), o, burst });
    }
    if (!raf) raf = requestAnimationFrame(frame);
  });
}

/** Stop everything now and remove the canvas. */
export function clearConfetti(): void {
  if (typeof window === "undefined") return;
  const bursts = new Set(active.map((a) => a.burst));
  active = [];
  teardown();
  bursts.forEach((b) => b.resolve());
}

/**
 * What should a message fire?
 */
export function resolveMessageConfetti(
  type: FlashMessageType,
  option: boolean | ConfettiOptions | undefined,
  themeDefaults?: ConfettiOptions
): ConfettiOptions | null {
  const enabled = option === undefined ? type === "celebration" : option !== false;
  if (!enabled) return null;
  return { ...themeDefaults, ...(typeof option === "object" ? option : {}) };
}
