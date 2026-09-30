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
    install("subterra-metro", "OD");
    expect(listInstalled("subterra-metro")).toEqual(["OD"]);
    expect(listInstalled("web-shell")).toEqual([]);
  });

  it("removes only the package that was turned off", () => {
    install("subterra-metro", "OD");
    install("subterra-metro", "OS");
    uninstall("subterra-metro", "OD");
    expect(listInstalled("subterra-metro")).toEqual(["OS"]);
  });
});

describe("shell bridge", () => {
  it("stays off until the owner links the shells", () => {
    expect(bridgeEnabled()).toBe(false);
    writeRecords("subterra-metro", "day", [{ id: "1" }]);
    expect(readRecords("web-shell", "day")).toEqual([]);
  });

  it("shares books, bill, and day when linked", () => {
    setBridge(true);
    writeRecords("subterra-metro", "books", [{ id: "rent" }]);
    writeRecords("subterra-metro", "bill", [{ id: "inv" }]);
    writeRecords("subterra-metro", "day", [{ id: "task" }]);
    expect(readRecords("web-shell", "books")).toEqual([{ id: "rent" }]);
    expect(readRecords("web-shell", "bill")).toEqual([{ id: "inv" }]);
    expect(readRecords("web-shell", "day")).toEqual([{ id: "task" }]);
  });

  it("copies finance and time that already existed when the link turns on", () => {
    writeRecords("subterra-metro", "books", [{ id: "rent" }]);
    writeRecords("web-shell", "day", [{ id: "shift" }]);
    setBridge(true);
    expect(readRecords("web-shell", "books")).toEqual([{ id: "rent" }]);
    expect(readRecords("subterra-metro", "day")).toEqual([{ id: "shift" }]);
  });

  it("does not share mail when linked", () => {
    setBridge(true);
    writeRecords("subterra-metro", "sort", [{ id: "rule" }]);
    expect(recordKey("web-shell", "sort")).not.toBe(recordKey("subterra-metro", "sort"));
    expect(readRecords("web-shell", "sort")).toEqual([]);
  });
});
