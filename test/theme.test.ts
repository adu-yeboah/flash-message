import { describe, it, expect } from "vitest";
import { defaultTheme, mergeTheme, resolveColor, MESSAGE_TYPES } from "../src/index";
import type { FlashMessageType } from "../src/index";

describe("types", () => {
  it('accepts "celebration" as a message type (compile-time check)', () => {
    const t: FlashMessageType = "celebration";
    expect(MESSAGE_TYPES).toContain(t);
  });
  it("has a default color scheme for every message type", () => {
    for (const type of MESSAGE_TYPES) expect(defaultTheme[type].bg).toBeTruthy();
  });
});

describe("mergeTheme", () => {
  it("returns a copy, never the shared defaults", () => {
    const merged = mergeTheme();
    expect(merged).not.toBe(defaultTheme);
    expect(merged.success).not.toBe(defaultTheme.success);
  });

  it("keeps unspecified fields of a partial color scheme", () => {
    const merged = mergeTheme({ success: { bg: "#000000", dark: "#111111" } });
    expect(merged.success?.bg).toBe("#000000");
    expect(merged.success?.icon).toBe(defaultTheme.success.icon);
    expect(merged.error).toEqual(defaultTheme.error);
  });

  it("merges every type, including celebration, with one code path", () => {
    for (const type of MESSAGE_TYPES) {
      const merged = mergeTheme({ [type]: { bg: "#123456", dark: "#654321" } });
      expect(merged[type]?.bg).toBe("#123456");
    }
  });

  it("ignores explicit undefined so it cannot erase defaults", () => {
    const merged = mergeTheme({ gap: undefined, success: { bg: undefined as unknown as string, dark: "#111111" } });
    expect(merged.gap).toBe(defaultTheme.gap);
    expect(merged.success?.bg).toBe(defaultTheme.success.bg);
  });

  it("does not mutate the defaults", () => {
    const before = JSON.stringify(defaultTheme);
    mergeTheme({ success: { bg: "#000000", dark: "#000000" }, gap: "99px" });
    expect(JSON.stringify(defaultTheme)).toBe(before);
  });
});

describe("resolveColor", () => {
  it("resolves celebration like any other type", () => {
    expect(resolveColor("celebration", mergeTheme()).bg).toBe(defaultTheme.celebration.bg);
  });

  it("solid uses bg and text from the scheme", () => {
    const c = resolveColor("error", mergeTheme());
    expect(c.bg).toBe(defaultTheme.error.bg);
    expect(c.text).toBe(defaultTheme.error.text);
  });

  it("outline is transparent and uses the dark color for text", () => {
    const c = resolveColor("info", mergeTheme({ variant: "outline" }));
    expect(c.bg).toBe("transparent");
    expect(c.text).toBe(defaultTheme.info.dark);
  });

  it("subtle appends alpha to a #rrggbb color", () => {
    const c = resolveColor("success", mergeTheme({ variant: "subtle", success: { bg: "#10b981", dark: "#065f46" } }));
    expect(c.bg).toBe("#10b98118");
  });

  it("subtle still works for non-hex colors (rgb, hsl, names)", () => {
    const c = resolveColor("success", mergeTheme({ variant: "subtle", success: { bg: "rgb(16 185 129)", dark: "#065f46" } }));
    expect(c.bg).toBe("color-mix(in srgb, rgb(16 185 129) 9%, transparent)");
  });

  it("lets a user remove an icon with an empty string", () => {
    const c = resolveColor("success", mergeTheme({ success: { bg: "#000000", dark: "#000000", icon: "" } }));
    expect(c.icon).toBe("");
  });

  it("falls back to defaults when the theme has no entry for a type", () => {
    expect(resolveColor("warning", {}).bg).toBe(defaultTheme.warning.bg);
  });
});
