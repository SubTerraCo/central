import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { listInstalled } from "@luna/hub";
import { LunaShell, type ShellSection } from "@luna/open-ui";

function App() {
  const [section, setSection] = useState<ShellSection>("home");
  const installed = listInstalled();

  return (
    <LunaShell section={section} installed={installed} onSection={setSection} />
  );
}

const root = document.getElementById("root");
if (root === null) {
  throw new Error("Luna OS root is missing");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
