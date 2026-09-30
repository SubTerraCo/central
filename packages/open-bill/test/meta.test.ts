import { describe, expect, it } from "vitest";
import { OPEN_BILL_DEWEY, OPEN_BILL_HUB_DOMAIN, OPEN_BILL_NAME, OPEN_BILL_PATH, openBillMeta } from "../src/meta";

describe("Open Bill Dewey", () => {
  it("keeps BI, Open Bill, and hub domain bill", () => {
    expect(OPEN_BILL_DEWEY).toBe("BI");
    expect(OPEN_BILL_NAME).toBe("Open Bill");
    expect(OPEN_BILL_PATH).toBe("packages/open-bill");
    expect(OPEN_BILL_HUB_DOMAIN).toBe("bill");
    expect(openBillMeta.code).toBe("BI");
    expect(openBillMeta.dewey).toBe("BI");
  });
});
