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
        find: "@kantzen-ui/ui/app-shell/styles.css",
        replacement: fromRoot("examples/landing-page/src/app-shell-source.css"),
      },
      {
        find: "@kantzen-ui/ui/command-palette/styles.css",
        replacement: fromRoot(
          "packages/ui/src/command-palette/command-palette.css",
        ),
      },
      {
        find: "@kantzen-ui/ui/graph/styles.css",
        replacement: fromRoot("packages/ui/src/graph/graph.css"),
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
        find: "@kantzen-ui/ui/app-shell",
        replacement: fromRoot("packages/ui/src/app-shell/index.ts"),
      },
      {
        find: "@kantzen-ui/ui/command-palette",
        replacement: fromRoot("packages/ui/src/command-palette/index.ts"),
      },
      {
        find: "@kantzen-ui/ui/graph",
        replacement: fromRoot("packages/ui/src/graph/index.ts"),
      },
      {
        find: "@kantzen-ui/ui",
        replacement: fromRoot("packages/ui/src/index.ts"),
      },
    ],
  },
});
