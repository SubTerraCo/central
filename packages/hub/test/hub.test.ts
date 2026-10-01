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
    install("central", "OT");
    expect(listInstalled("central")).toEqual(["OT"]);
    expect(listInstalled("metro")).toEqual([]);
  });

  it("removes only the package that was turned off", () => {
    install("central", "OT");
    install("central", "OS");
    uninstall("central", "OT");
    expect(listInstalled("central")).toEqual(["OS"]);
  });
});

describe("shell bridge", () => {
  it("stays off until the owner links the shells", () => {
    expect(bridgeEnabled()).toBe(false);
    writeRecords("central", "time", [{ id: "1" }]);
    expect(readRecords("metro", "time")).toEqual([]);
  });

  it("shares books, bill, time, and anytype when linked", () => {
    setBridge(true);
    writeRecords("central", "books", [{ id: "rent" }]);
    writeRecords("central", "bill", [{ id: "inv" }]);
    writeRecords("central", "time", [{ id: "task" }]);
    writeRecords("central", "anytype", [{ id: "note" }]);
    expect(readRecords("metro", "books")).toEqual([{ id: "rent" }]);
    expect(readRecords("metro", "bill")).toEqual([{ id: "inv" }]);
    expect(readRecords("metro", "time")).toEqual([{ id: "task" }]);
    expect(readRecords("metro", "anytype")).toEqual([{ id: "note" }]);
  });

  it("copies finance and time that already existed when the link turns on", () => {
    writeRecords("central", "books", [{ id: "rent" }]);
    writeRecords("metro", "time", [{ id: "shift" }]);
    setBridge(true);
    expect(readRecords("metro", "books")).toEqual([{ id: "rent" }]);
    expect(readRecords("central", "time")).toEqual([{ id: "shift" }]);
  });

  it("does not share mail when linked", () => {
    setBridge(true);
    writeRecords("central", "sort", [{ id: "rule" }]);
    expect(recordKey("metro", "sort")).not.toBe(recordKey("central", "sort"));
    expect(readRecords("metro", "sort")).toEqual([]);
  });
});
