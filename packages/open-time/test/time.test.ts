import { describe, expect, it } from "vitest";
import { moveTask, onTimeline, quickBlock } from "../src/board";
import { grantTimeOff, peopleWorking, punchMinutes, scheduleIsLocked } from "../src/crew";

describe("time board", () => {
  it("drops a quick block on To-Do for 30 minutes", () => {
    expect(quickBlock()).toEqual({ title: "Quick block", status: "todo", minutes: 30 });
  });

  it("keeps only Doing tasks on the clock", () => {
    const tasks = [
      { id: "1", status: "todo" as const },
      { id: "2", status: "doing" as const },
    ];
    expect(onTimeline(moveTask(tasks, "1", "doing")).map((task) => task.id)).toEqual(["1", "2"]);
  });
});

describe("crew coverage", () => {
  it("refuses time off that would pass the coverage floor", () => {
    const result = grantTimeOff({
      teamSize: 4,
      alreadyOff: ["a"],
      memberId: "b",
      minCoverage: 3,
    });
    expect(result).toEqual({ ok: false, reason: "below-coverage" });
    expect(peopleWorking(4, 1)).toBe(3);
  });

  it("grants time off while coverage holds", () => {
    expect(
      grantTimeOff({ teamSize: 6, alreadyOff: [], memberId: "a", minCoverage: 3 }),
    ).toEqual({ ok: true });
  });

  it("locks a published schedule", () => {
    expect(scheduleIsLocked("draft")).toBe(false);
    expect(scheduleIsLocked("published")).toBe(true);
  });

  it("sums closed and open punches", () => {
    const minutes = punchMinutes(
      [{ in: "2026-09-29T12:00:00.000Z", out: "2026-09-29T13:30:00.000Z" }],
      "2026-09-29T14:00:00.000Z",
    );
    expect(minutes).toBe(90);
  });
});
