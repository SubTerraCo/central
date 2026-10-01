import { describe, expect, it } from "vitest";
import { INTEGRATION_CLASSIFICATION, notImplementedWrite } from "../src/index";

describe("integration adapter", () => {
  it("classifies adapters as integration only", () => {
    expect(INTEGRATION_CLASSIFICATION).toBe("integration");
  });

  it("returns a 501 stub Hermes and Anytype can share for later writes", () => {
    const tag = notImplementedWrite("createDevelopmentTag");
    const view = notImplementedWrite("createDevelopmentView");
    expect(tag.status).toBe(501);
    expect(tag.implemented).toBe(false);
    expect(view.operation).toBe("createDevelopmentView");
  });
});
