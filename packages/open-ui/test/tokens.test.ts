import { argbFromHex, Hct } from "@material/material-color-utilities";
import { describe, expect, it } from "vitest";
import { darkColorRoles } from "../src/palette";
import { colorRoles } from "../src/scheme";
import { FONT_STATUS, seeds, space, spacePx, tokens, typeScale, typeStyle } from "../src/tokens";

function hueDelta(a: string, b: string): number {
  const left = Hct.fromInt(argbFromHex(a)).hue;
  const right = Hct.fromInt(argbFromHex(b)).hue;
  const delta = Math.abs(left - right);
  return Math.min(delta, 360 - delta);
}

describe("Powerline tokens", () => {
  it("keeps the four Powerline seeds and retires amber", () => {
    expect(seeds).toEqual({
      primary: "#400080",
      secondary: "#ED1CAD",
      tertiary: "#1CEDC5",
      accent: "#008080",
    });
    expect(tokens.seed).toBe("#400080");
    expect(tokens.seeds).toEqual(seeds);
    expect(JSON.stringify(tokens).toLowerCase()).not.toContain("e8a54b");
  });

  it("snapshots dark roles from material-color-utilities", () => {
    expect(darkColorRoles).toEqual(colorRoles(true));
  });

  it("maps generated roles onto the Powerline palettes", () => {
    expect(hueDelta(tokens.primary, seeds.primary)).toBeLessThan(20);
    expect(hueDelta(tokens.secondary, seeds.secondary)).toBeLessThan(20);
    expect(hueDelta(tokens.tertiary, seeds.tertiary)).toBeLessThan(20);
    expect(hueDelta(tokens.accent, seeds.accent)).toBeLessThan(20);
    expect(tokens.primary).not.toBe(seeds.primary);
    expect(tokens.onPrimary).toMatch(/^#[0-9a-f]{6}$/);
    expect(tokens.surface).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("specifies the interim Material 3 type scale and 4dp grid", () => {
    expect(tokens.type.status).toBe("interim");
    expect(FONT_STATUS).toBe("interim");
    expect(tokens.type.fontFamily).toContain("Roboto");
    expect(typeScale.headlineMedium.size).toBe(28);
    expect(typeStyle("bodyLarge")).toEqual({
      fontFamily: tokens.type.fontFamily,
      fontSize: "16px",
      lineHeight: "24px",
      fontWeight: 400,
      letterSpacing: "0.5px",
    });
    expect(space[1]).toBe(4);
    expect(space[4]).toBe(16);
    expect(spacePx(6)).toBe("24px");
    expect(tokens.space).toEqual(space);
  });
});
