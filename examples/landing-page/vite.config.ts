import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const fromRoot = (path: string) =>
  fileURLToPath(new URL(`../../${path}`, import.meta.url));

export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@patkepa/kantzen-ui/styles.css",
        replacement: fromRoot("packages/ui/src/styles.css"),
      },
      {
        find: "@patkepa/kantzen-ui/app-shell/styles.css",
        replacement: fromRoot("examples/landing-page/src/app-shell-source.css"),
      },
      {
        find: "@patkepa/kantzen-ui/command-palette/styles.css",
        replacement: fromRoot(
          "packages/ui/src/command-palette/command-palette.css",
        ),
      },
      {
        find: "@patkepa/kantzen-ui/graph/styles.css",
        replacement: fromRoot("packages/ui/src/graph/graph.css"),
      },
      {
        find: "@patkepa/kantzen-ui/interactions",
        replacement: fromRoot("packages/ui/src/interactions/index.ts"),
      },
      {
        find: "@patkepa/kantzen-ui/navigation",
        replacement: fromRoot("packages/ui/src/navigation.ts"),
      },
      {
        find: "@patkepa/kantzen-ui/app-shell",
        replacement: fromRoot("packages/ui/src/app-shell/index.ts"),
      },
      {
        find: "@patkepa/kantzen-ui/command-palette",
        replacement: fromRoot("packages/ui/src/command-palette/index.ts"),
      },
      {
        find: "@patkepa/kantzen-ui/graph",
        replacement: fromRoot("packages/ui/src/graph/index.ts"),
      },
      {
        find: "@patkepa/kantzen-ui",
        replacement: fromRoot("packages/ui/src/index.ts"),
      },
    ],
  },
});
