import { useState } from "react";
import type { PackagePanelProps } from "@central/hub";
import { PanelFrame, useDomain } from "@central/open-ui";
import { modelFor, toolsForInstalled, type AgentProvider } from "./provider";

type Settings = { id: string; provider: AgentProvider; modelId: string };

export function PepperAgentPanel({ shellId, installedCodes = [] }: PackagePanelProps) {
  const [settings, save] = useDomain<Settings>(shellId, "agent");
  const current = settings[0] ?? {
    id: "local",
    provider: "local-ollama" as const,
    modelId: modelFor("local-ollama"),
  };
  const [provider, setProvider] = useState<AgentProvider>(current.provider);
  const tools = toolsForInstalled(installedCodes.filter((code) => code !== "PR"));

  return (
    <PanelFrame title="Pepper">
      <p>Ollama is the local runtime. Gemma 4 12B is the daily model on a 16GB card. Cloud Gemini stays available.</p>
      <p>Keys are not stored in the repo. Tools appear only for packages you have installed.</p>
      <p>
        Provider: {provider}. Model: {modelFor(provider)}.
      </p>
      <p>{tools.length === 0 ? "No package tools yet." : `Tools: ${tools.join(", ")}.`}</p>
      <button
        type="button"
        onClick={() => {
          const next: AgentProvider = provider === "local-ollama" ? "cloud-gemini" : "local-ollama";
          setProvider(next);
          save([{ id: "local", provider: next, modelId: modelFor(next) }]);
        }}
      >
        Switch provider
      </button>
    </PanelFrame>
  );
}
