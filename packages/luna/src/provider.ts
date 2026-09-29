export type AgentProvider = "local-ollama" | "cloud-gemini";

export const DEFAULT_LOCAL_MODEL = "gemma4:12b";

const toolByCode: Record<string, string> = {
  OD: "tasks",
  OS: "mail",
  OB: "ledger",
  BI: "invoices",
  TK: "shows",
  OG: "gigs",
  CH: "community",
  FM: "forum",
  HA: "home",
  MA: "cues",
  BS: "bank",
};

export function modelFor(provider: AgentProvider): string {
  switch (provider) {
    case "local-ollama":
      return DEFAULT_LOCAL_MODEL;
    case "cloud-gemini":
      return "gemini";
    default: {
      const unreachable: never = provider;
      return unreachable;
    }
  }
}

export function toolsForInstalled(codes: readonly string[]): string[] {
  return codes.flatMap((code) => {
    const tool = toolByCode[code];
    return tool ? [tool] : [];
  });
}
