import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/**/test/**/*.test.{ts,tsx}",
      "apps/**/test/**/*.test.{ts,tsx}",
      "integrations/**/test/**/*.test.{ts,tsx}",
    ],
    server: {
      deps: {
        inline: ["@material/material-color-utilities"],
      },
    },
  },
});
