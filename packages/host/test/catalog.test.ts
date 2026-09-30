import { describe, expect, it } from "vitest";
import { catalog, catalogFor } from "../src/catalog";

describe("catalog", () => {
  it("gives every package one code", () => {
    const codes = catalog.map((entry) => entry.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toEqual(["OD", "OS", "OB", "BI", "LU", "TK", "OG", "CH", "FM", "HA", "MA", "BS"]);
  });

  it("keeps mail, banking, and the local agent off the Metro web entry", () => {
    const web = catalogFor("web-shell").map((entry) => entry.code);
    expect(web).toEqual(["OD", "OB", "BI", "TK", "OG", "CH", "FM"]);
  });

  it("offers the local packages on SubTerra Metro", () => {
    const local = catalogFor("subterra-metro").map((entry) => entry.code);
    expect(local).toContain("OS");
    expect(local).toContain("LU");
    expect(local).toContain("HA");
    expect(local).toContain("OG");
  });
});
