import { beforeEach, describe, expect, it } from "vitest";
import {
  bridgeEnabled,
  install,
  listInstalled,
  readRecords,
  recordKey,
  resetHub,
  setBridge,
  uninstall,
  writeRecords,
} from "../src/index";

beforeEach(() => {
  resetHub();
});

describe("installed packages", () => {
  it("installs one package without turning on another", () => {
    install("luna-os", "OD");
    expect(listInstalled("luna-os")).toEqual(["OD"]);
    expect(listInstalled("web-shell")).toEqual([]);
  });

  it("removes only the package that was turned off", () => {
    install("luna-os", "OD");
    install("luna-os", "OS");
    uninstall("luna-os", "OD");
    expect(listInstalled("luna-os")).toEqual(["OS"]);
  });
});

describe("shell bridge", () => {
  it("stays off until the owner links the shells", () => {
    expect(bridgeEnabled()).toBe(false);
    writeRecords("luna-os", "day", [{ id: "1" }]);
    expect(readRecords("web-shell", "day")).toEqual([]);
  });

  it("shares books, bill, and day when linked", () => {
    setBridge(true);
    writeRecords("luna-os", "books", [{ id: "rent" }]);
    writeRecords("luna-os", "bill", [{ id: "inv" }]);
    writeRecords("luna-os", "day", [{ id: "task" }]);
    expect(readRecords("web-shell", "books")).toEqual([{ id: "rent" }]);
    expect(readRecords("web-shell", "bill")).toEqual([{ id: "inv" }]);
    expect(readRecords("web-shell", "day")).toEqual([{ id: "task" }]);
  });

  it("copies finance and time that already existed when the link turns on", () => {
    writeRecords("luna-os", "books", [{ id: "rent" }]);
    writeRecords("web-shell", "day", [{ id: "shift" }]);
    setBridge(true);
    expect(readRecords("web-shell", "books")).toEqual([{ id: "rent" }]);
    expect(readRecords("luna-os", "day")).toEqual([{ id: "shift" }]);
  });

  it("does not share mail when linked", () => {
    setBridge(true);
    writeRecords("luna-os", "sort", [{ id: "rule" }]);
    expect(recordKey("web-shell", "sort")).not.toBe(recordKey("luna-os", "sort"));
    expect(readRecords("web-shell", "sort")).toEqual([]);
  });
});
