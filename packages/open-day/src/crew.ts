export type Punch = { in: string | null; out: string | null };

export type CoverageInput = {
  teamSize: number;
  alreadyOff: readonly string[];
  memberId: string;
  minCoverage: number;
};

export type CoverageResult =
  | { ok: true }
  | { ok: false; reason: "already-off" | "below-coverage" };

/** Time off is refused when the slot would drop to the coverage floor. */
export function grantTimeOff(input: CoverageInput): CoverageResult {
  if (input.alreadyOff.includes(input.memberId)) {
    return { ok: false, reason: "already-off" };
  }
  const working = input.teamSize - input.alreadyOff.length;
  if (working <= input.minCoverage) {
    return { ok: false, reason: "below-coverage" };
  }
  return { ok: true };
}

export function peopleWorking(teamSize: number, offCount: number): number {
  return teamSize - offCount;
}

export function punchMinutes(punches: readonly Punch[], nowIso: string): number {
  let total = 0;
  for (const punch of punches) {
    if (!punch.in) continue;
    const start = Date.parse(punch.in);
    const end = Date.parse(punch.out ?? nowIso);
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) continue;
    total += Math.round((end - start) / 60000);
  }
  return total;
}

/** A published schedule is the read-only grant Central can show. */
export function scheduleIsLocked(state: "draft" | "published"): boolean {
  return state === "published";
}
