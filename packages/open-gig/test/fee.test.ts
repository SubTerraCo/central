import { describe, expect, it } from "vitest";
import { gigFeeApplies } from "../src/fee";

describe("gig fee", () => {
  it("is free for a freelancer", () => {
    expect(gigFeeApplies("freelancer", 1)).toBe(false);
    expect(gigFeeApplies("freelancer", 8)).toBe(false);
  });

  it("is free for a crew under 5", () => {
    expect(gigFeeApplies("crew-manager", 4)).toBe(false);
  });

  it("applies at 5 crew members", () => {
    expect(gigFeeApplies("crew-manager", 5)).toBe(true);
  });
});
