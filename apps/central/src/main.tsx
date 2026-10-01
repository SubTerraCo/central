import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HostApp } from "@central/host";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("Central root is missing");
}

createRoot(root).render(
  <StrictMode>
    <HostApp shellId="central" />
  </StrictMode>,
);
