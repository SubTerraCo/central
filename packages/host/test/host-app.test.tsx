import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HostApp } from "../src/HostApp";

describe("HostApp shells", () => {
  it("keeps Central on the default package home without a Profile tab", () => {
    const html = renderToString(<HostApp shellId="central" />);
    expect(html).toContain("Central");
    expect(html).toContain("Marketplace");
    expect(html).not.toContain(">Profile<");
    expect(html.toLowerCase()).not.toContain("e8a54b");
  });
});
