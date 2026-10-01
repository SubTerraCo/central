import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MetroApp } from "./MetroApp";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("Metro root is missing");
}

createRoot(root).render(
  <StrictMode>
    <MetroApp />
  </StrictMode>,
);
