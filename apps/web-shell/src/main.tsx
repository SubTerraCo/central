import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HostApp } from "@luna/host";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("SubTerra Central root is missing");
}

createRoot(root).render(
  <StrictMode>
    <HostApp shellId="web-shell" />
  </StrictMode>,
);
