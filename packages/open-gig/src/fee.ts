export type GigRole = "freelancer" | "crew-manager";

/** A solo freelancer lists for free. A crew of 5 or more pays. */
export function gigFeeApplies(role: GigRole, crewSize: number): boolean {
  return role === "crew-manager" && crewSize >= 5;
}
