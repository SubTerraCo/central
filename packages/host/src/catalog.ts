import type { ComponentType } from "react";
import type { PackagePanelProps, ShellId } from "@luna/hub";

export type CatalogEntry = {
  code: string;
  name: string;
  summary: string;
  shells: readonly ShellId[];
  load: () => Promise<ComponentType<PackagePanelProps>>;
};

const both: readonly ShellId[] = ["subterra-metro", "web-shell"];
const local: readonly ShellId[] = ["subterra-metro"];

export const catalog: readonly CatalogEntry[] = [
  {
    code: "OD",
    name: "Open Day",
    summary: "Tasks, Quick Blocks, crew draft, coverage, and the time clock.",
    shells: both,
    load: () => import("@luna/open-day").then((mod) => mod.OpenDayPanel),
  },
  {
    code: "OS",
    name: "Open Sort",
    summary: "Label and archive rules. Nothing is deleted.",
    shells: local,
    load: () => import("@luna/open-sort").then((mod) => mod.OpenSortPanel),
  },
  {
    code: "OB",
    name: "Open Books",
    summary: "Local ledger. Actual Budget is the engine to wrap next.",
    shells: both,
    load: () => import("@luna/open-books").then((mod) => mod.OpenBooksPanel),
  },
  {
    code: "BI",
    name: "Open Bill",
    summary: "Invoices and 1099 notes, separate from the ledger.",
    shells: both,
    load: () => import("@luna/open-bill").then((mod) => mod.OpenBillPanel),
  },
  {
    code: "LU",
    name: "Luna",
    summary: "Local Gemma 4 through Ollama, or cloud Gemini.",
    shells: local,
    load: () => import("@luna/agent").then((mod) => mod.LunaAgentPanel),
  },
  {
    code: "TK",
    name: "Subtoken",
    summary: "Anonymous event page. A tag UID is not a login.",
    shells: both,
    load: () => import("@luna/subtoken").then((mod) => mod.SubtokenPanel),
  },
  {
    code: "OG",
    name: "Open Gig",
    summary: "A profile, a rate, and a request for a date. Free until a crew of 5.",
    shells: both,
    load: () => import("@luna/open-gig").then((mod) => mod.OpenGigPanel),
  },
  {
    code: "CH",
    name: "Community",
    summary: "Crew or public notes. Forum is not required.",
    shells: both,
    load: () => import("@luna/community").then((mod) => mod.CommunityPanel),
  },
  {
    code: "FM",
    name: "Forum",
    summary: "Optional topics and votes. Community runs without this.",
    shells: both,
    load: () => import("@luna/forum").then((mod) => mod.ForumPanel),
  },
  {
    code: "HA",
    name: "Home Assistant",
    summary: "Address of a Home Assistant server on this machine.",
    shells: local,
    load: () => import("@luna/home-assistant").then((mod) => mod.HomeAssistantPanel),
  },
  {
    code: "MA",
    name: "Media",
    summary: "Show cues for OBS, DaVinci, and Loupedeck.",
    shells: local,
    load: () => import("@luna/media").then((mod) => mod.MediaPanel),
  },
  {
    code: "BS",
    name: "Banking",
    summary: "SimpleFIN or GoCardless labels. Credentials stay on this machine.",
    shells: local,
    load: () => import("@luna/banking").then((mod) => mod.BankingPanel),
  },
];

export function catalogFor(shellId: ShellId): readonly CatalogEntry[] {
  return catalog.filter((entry) => entry.shells.includes(shellId));
}
