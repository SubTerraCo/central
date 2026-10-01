import type { ComponentType } from "react";
import type { PackagePanelProps, ShellId } from "@central/hub";

export type CatalogEntry = {
  code: string;
  name: string;
  summary: string;
  shells: readonly ShellId[];
  load: () => Promise<ComponentType<PackagePanelProps>>;
};

const both: readonly ShellId[] = ["central", "metro"];
const local: readonly ShellId[] = ["central"];

export const catalog: readonly CatalogEntry[] = [
  {
    code: "OT",
    name: "Open Time",
    summary: "Tasks, Quick Blocks, crew draft, coverage, and the time clock.",
    shells: both,
    load: () => import("@central/open-time").then((mod) => mod.OpenTimePanel),
  },
  {
    code: "OS",
    name: "Open Sort",
    summary: "Label and archive rules. Nothing is deleted.",
    shells: local,
    load: () => import("@central/open-sort").then((mod) => mod.OpenSortPanel),
  },
  {
    code: "OB",
    name: "Open Books",
    summary: "Local ledger. Actual Budget is the engine to wrap next.",
    shells: both,
    load: () => import("@central/open-books").then((mod) => mod.OpenBooksPanel),
  },
  {
    code: "OL",
    name: "Open Bill",
    summary: "Invoices and 1099 notes, separate from the ledger.",
    shells: both,
    load: () => import("@central/open-bill").then((mod) => mod.OpenBillPanel),
  },
  {
    code: "PR",
    name: "Pepper",
    summary: "Local Gemma 4 through Ollama, or cloud Gemini.",
    shells: local,
    load: () => import("@central/pepper").then((mod) => mod.PepperAgentPanel),
  },
  {
    code: "TK",
    name: "Subtoken",
    summary: "Anonymous event page. A tag UID is not a login.",
    shells: both,
    load: () => import("@central/subtoken").then((mod) => mod.SubtokenPanel),
  },
  {
    code: "OG",
    name: "Open Gig",
    summary: "A profile, a rate, and a request for a date. Free until a crew of 5.",
    shells: both,
    load: () => import("@central/open-gig").then((mod) => mod.OpenGigPanel),
  },
  {
    code: "CM",
    name: "Community",
    summary: "Crew or public notes. Forum is not required.",
    shells: both,
    load: () => import("@central/community").then((mod) => mod.CommunityPanel),
  },
  {
    code: "FM",
    name: "Forum",
    summary: "Optional topics and votes. Community runs without this.",
    shells: both,
    load: () => import("@central/forum").then((mod) => mod.ForumPanel),
  },
  {
    code: "HA",
    name: "Home Assistant",
    summary: "Address of a Home Assistant server on this machine.",
    shells: local,
    load: () => import("@central/home-assistant").then((mod) => mod.HomeAssistantPanel),
  },
  {
    code: "MD",
    name: "Media",
    summary: "Show cues for OBS, DaVinci, and Loupedeck.",
    shells: local,
    load: () => import("@central/media").then((mod) => mod.MediaPanel),
  },
  {
    code: "BK",
    name: "Banking",
    summary: "SimpleFIN or GoCardless labels. Credentials stay on this machine.",
    shells: local,
    load: () => import("@central/banking").then((mod) => mod.BankingPanel),
  },
];

export function catalogFor(shellId: ShellId): readonly CatalogEntry[] {
  return catalog.filter((entry) => entry.shells.includes(shellId));
}
