import { describe, expect, it } from "vitest";
import { catalog, catalogFor } from "../src/catalog";

describe("catalog", () => {
  it("gives every package one code", () => {
    const codes = catalog.map((entry) => entry.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toEqual(["OT", "OS", "OB", "OL", "PR", "TK", "OG", "CM", "FM", "HA", "MD", "BK"]);
  });

  it("keeps mail, banking, and the local agent off the public shell", () => {
    const web = catalogFor("metro").map((entry) => entry.code);
    expect(web).toEqual(["OT", "OB", "OL", "TK", "OG", "CM", "FM"]);
  });

  it("offers the local packages on Central", () => {
    const local = catalogFor("central").map((entry) => entry.code);
    expect(local).toContain("OS");
    expect(local).toContain("PR");
    expect(local).toContain("HA");
    expect(local).toContain("OG");
  });
});
