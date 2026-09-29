import { describe, expect, it } from "vitest";
import { modelFor, toolsForInstalled } from "../src/provider";

describe("Luna provider", () => {
  it("defaults the local runtime to Gemma 4 12B", () => {
    expect(modelFor("local-ollama")).toBe("gemma4:12b");
  });

  it("offers tools only for installed packages", () => {
    expect(toolsForInstalled(["OD", "OS"])).toEqual(["tasks", "mail"]);
    expect(toolsForInstalled(["ZZ"])).toEqual([]);
  });
});
