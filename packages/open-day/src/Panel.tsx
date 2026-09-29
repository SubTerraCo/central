import { useState } from "react";
import type { PackagePanelProps } from "@luna/hub";
import { PanelFrame, useDomain } from "@luna/open-ui";
import {
  isTaskStatus,
  moveTask,
  onTimeline,
  quickBlock,
  taskStatusLabels,
  taskStatuses,
  type DayTask,
} from "./board";
import { grantTimeOff, punchMinutes, scheduleIsLocked, type Punch } from "./crew";

type CrewItem = {
  id: string;
  name: string;
  wishlist: string;
  drafted: boolean;
  punches: Punch[];
};

type ScheduleState = { id: string; state: "draft" | "published" };

const MIN_COVERAGE = 1;

function crewTime(item: CrewItem, now: string): string {
  const open = item.punches.some((entry) => entry.in !== null && entry.out === null);
  const minutes = punchMinutes(item.punches, now);
  if (open && minutes < 1) return "clocked in";
  return `${minutes}m`;
}

export function OpenDayPanel({ shellId }: PackagePanelProps) {
  const [tasks, saveTasks] = useDomain<DayTask>(shellId, "day");
  const [crew, saveCrew] = useDomain<CrewItem>(shellId, "crew");
  const [schedule, saveSchedule] = useDomain<ScheduleState>(shellId, "schedule");
  const [title, setTitle] = useState("");
  const [member, setMember] = useState("");
  const [shift, setShift] = useState("");
  const [notice, setNotice] = useState("");
  const locked = scheduleIsLocked(schedule[0]?.state ?? "draft");
  const now = new Date().toISOString();

  function addTask(nextTitle: string, status: DayTask["status"], minutes: number) {
    if (nextTitle.trim() === "") return;
    saveTasks([
      ...tasks,
      { id: crypto.randomUUID(), title: nextTitle.trim(), status, minutes },
    ]);
    setTitle("");
  }

  function addCrew() {
    if (member.trim() === "") return;
    saveCrew([
      ...crew,
      {
        id: crypto.randomUUID(),
        name: member.trim(),
        wishlist: shift.trim(),
        drafted: false,
        punches: [],
      },
    ]);
    setMember("");
    setShift("");
  }

  function draft(item: CrewItem) {
    if (locked) {
      setNotice("This schedule is published. Central can show it, and the draft stays put.");
      return;
    }
    if (!item.drafted) {
      setNotice("");
      saveCrew(crew.map((row) => (row.id === item.id ? { ...row, drafted: true } : row)));
      return;
    }
    const alreadyOff = crew.filter((row) => !row.drafted).map((row) => row.id);
    const result = grantTimeOff({
      teamSize: crew.length,
      alreadyOff,
      memberId: item.id,
      minCoverage: MIN_COVERAGE,
    });
    if (!result.ok) {
      setNotice("Taking them off would drop the crew under coverage.");
      return;
    }
    setNotice("");
    saveCrew(crew.map((row) => (row.id === item.id ? { ...row, drafted: false } : row)));
  }

  function punch(item: CrewItem) {
    const open = item.punches.find((entry) => entry.in && !entry.out);
    const punches = open
      ? item.punches.map((entry) => (entry === open ? { ...entry, out: new Date().toISOString() } : entry))
      : [...item.punches, { in: new Date().toISOString(), out: null }];
    saveCrew(crew.map((row) => (row.id === item.id ? { ...row, punches } : row)));
  }

  return (
    <PanelFrame title="Open Day" wide>
      <p>Tasks use the Blocks columns. Crew drafting, coverage, and the time clock come from Festy Blocks.</p>
      <p>Doing: {onTimeline(tasks).map((task) => task.title).join(", ") || "nobody"}</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          addTask(title, "todo", 30);
        }}
      >
        <input
          aria-label="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Task"
        />
        <button type="submit">Add task</button>
        <button
          type="button"
          onClick={() => {
            const block = quickBlock();
            addTask(block.title, block.status, block.minutes);
          }}
        >
          Quick block
        </button>
      </form>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
        {taskStatuses.map((status) => (
          <div key={status}>
            <strong>{taskStatusLabels[status]}</strong>
            <ul>
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <li key={task.id}>
                    {task.title} · {task.minutes}m{" "}
                    <select
                      aria-label={`${task.title} status`}
                      value={task.status}
                      onChange={(event) => {
                        const next = event.target.value;
                        if (!isTaskStatus(next)) return;
                        saveTasks(moveTask(tasks, task.id, next));
                      }}
                    >
                      {taskStatuses.map((option) => (
                        <option key={option} value={option}>
                          {taskStatusLabels[option]}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <h2>Crew draft</h2>
      <p>{locked ? "Published schedule is read-only." : "Draft is still open."}</p>
      <button
        type="button"
        onClick={() =>
          saveSchedule([{ id: "grant", state: locked ? "draft" : "published" }])
        }
      >
        {locked ? "Reopen draft" : "Publish schedule"}
      </button>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          addCrew();
        }}
      >
        <input
          aria-label="Crew member"
          value={member}
          onChange={(event) => setMember(event.target.value)}
          placeholder="Name"
        />
        <input
          aria-label="Wishlist shift"
          value={shift}
          onChange={(event) => setShift(event.target.value)}
          placeholder="Wishlist shift"
        />
        <button type="submit">Add to wishlist</button>
      </form>
      {notice ? <p role="status">{notice}</p> : null}
      <ul>
        {crew.map((item) => (
          <li key={item.id}>
            {item.name} wants {item.wishlist || "any shift"} · {crewTime(item, now)}{" "}
            <button type="button" onClick={() => draft(item)}>
              {item.drafted ? "On the schedule" : "Draft"}
            </button>{" "}
            <button type="button" onClick={() => punch(item)}>
              {item.punches.some((entry) => entry.in && !entry.out) ? "Clock out" : "Clock in"}
            </button>
          </li>
        ))}
      </ul>
    </PanelFrame>
  );
}
