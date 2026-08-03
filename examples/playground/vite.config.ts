import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const fromRoot = (path: string) =>
  fileURLToPath(new URL(`../../${path}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@kantzen-ui/ui/styles.css",
        replacement: fromRoot("packages/ui/src/styles.css"),
      },
      {
        find: "@kantzen-ui/app-shell/styles.css",
        replacement: fromRoot("examples/playground/src/app-shell-source.css"),
      },
      {
        find: "@kantzen-ui/graph/styles.css",
        replacement: fromRoot("packages/graph/src/graph.css"),
      },
      {
        find: "@kantzen-ui/ui/interactions",
        replacement: fromRoot("packages/ui/src/interactions/index.ts"),
      },
      {
        find: "@kantzen-ui/ui/navigation",
        replacement: fromRoot("packages/ui/src/navigation.ts"),
      },
      {
        find: "@kantzen-ui/app-shell",
        replacement: fromRoot("packages/app-shell/src/index.ts"),
      },
      {
        find: "@kantzen-ui/graph",
        replacement: fromRoot("packages/graph/src/index.ts"),
      },
      {
        find: "@kantzen-ui/ui",
        replacement: fromRoot("packages/ui/src/index.ts"),
      },
    ],
  },
});
