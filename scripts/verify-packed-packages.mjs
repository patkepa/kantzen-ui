import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const tarballDir = resolve(rootDir, "dist", "package-tarballs");
const typescriptBin = resolve(
  rootDir,
  "node_modules",
  "typescript",
  "bin",
  "tsc",
);
const packageManifest = JSON.parse(
  readFileSync(resolve(rootDir, "packages", "ui", "package.json"), "utf8"),
);
const reactRouterVersion = packageManifest.peerDependencies["react-router-dom"];
const tarballs = readdirSync(tarballDir)
  .filter((file) => file.endsWith(".tgz"))
  .sort()
  .map((file) => resolve(tarballDir, file));

function run(command, args, cwd, npmCacheDir) {
  const result = spawnSync(command, args, {
    cwd,
    env: {
      ...process.env,
      npm_config_cache: npmCacheDir,
    },
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

function verifyReactVersion(reactVersion) {
  const reactMajor = reactVersion.split(".")[0];
  const consumerDir = mkdtempSync(
    join(tmpdir(), `kantzen-ui-react-${reactMajor}-`),
  );
  const npmCacheDir = resolve(consumerDir, ".npm-cache");

  writeFileSync(
    resolve(consumerDir, "package.json"),
    `${JSON.stringify({ name: `kantzen-ui-react-${reactMajor}-smoke`, private: true, type: "module" }, null, 2)}\n`,
  );

  writeFileSync(
    resolve(consumerDir, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          jsx: "react-jsx",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          noEmit: true,
          strict: true,
        },
        include: ["consumer.tsx"],
      },
      null,
      2,
    )}\n`,
  );

  writeFileSync(
    resolve(consumerDir, "consumer.tsx"),
    `import { WorkspaceShell } from "@kantzen-ui/ui/app-shell";
import { CommandPaletteShell } from "@kantzen-ui/ui/command-palette";
import { ForceGraphCanvas } from "@kantzen-ui/ui/graph";
import { Button, Card, ThemeProvider } from "@kantzen-ui/ui";
import type { NavGroup } from "@kantzen-ui/ui/navigation";

const navGroups: NavGroup[] = [];
void <ThemeProvider><Card><Button text="Create" /></Card></ThemeProvider>;
void <WorkspaceShell productName="Test" navGroups={navGroups} sidebarCollapsed={false} onToggleSidebar={() => undefined}>Content</WorkspaceShell>;
void CommandPaletteShell;
void ForceGraphCanvas;
`,
  );

  writeFileSync(
    resolve(consumerDir, "smoke.mjs"),
    `import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkspaceShell } from "@kantzen-ui/ui/app-shell";
import { CommandPaletteShell } from "@kantzen-ui/ui/command-palette";
import { ForceGraphCanvas } from "@kantzen-ui/ui/graph";
import { Button, Card, ThemeProvider } from "@kantzen-ui/ui";
import { Icon } from "@kantzen-ui/ui/icons";
import { getLinearNavigationIndex } from "@kantzen-ui/ui/interactions";

assert.equal(typeof WorkspaceShell, "function");
assert.equal(typeof CommandPaletteShell, "function");
assert.equal(typeof ForceGraphCanvas, "object");
assert.equal(typeof ThemeProvider, "function");
assert.equal(getLinearNavigationIndex("ArrowDown", 0, 2), 1);

const html = renderToStaticMarkup(
  React.createElement(Card, null, React.createElement(Button, { text: "Create" }), React.createElement(Icon, { icon: "add", autoLoad: false })),
);
assert.match(html, /kui-card/);
assert.match(html, /kui-button/);

for (const stylesheet of [
  "@kantzen-ui/ui/app-shell/styles.css",
  "@kantzen-ui/ui/command-palette/styles.css",
  "@kantzen-ui/ui/graph/styles.css",
  "@kantzen-ui/ui/styles.css",
  "@kantzen-ui/ui/theme.css",
]) {
  assert.match(import.meta.resolve(stylesheet), /^file:/);
}
`,
  );

  try {
    run(
      "npm",
      [
        "install",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        ...tarballs,
        `react@${reactVersion}`,
        `react-dom@${reactVersion}`,
        `react-router-dom@${reactRouterVersion}`,
        `@types/react@${reactMajor}`,
        `@types/react-dom@${reactMajor}`,
      ],
      consumerDir,
      npmCacheDir,
    );
    run(
      "node",
      [typescriptBin, "-p", "tsconfig.json"],
      consumerDir,
      npmCacheDir,
    );
    run("node", ["smoke.mjs"], consumerDir, npmCacheDir);
    console.log(`Packed package smoke test passed with React ${reactMajor}.`);
  } finally {
    rmSync(consumerDir, { recursive: true, force: true });
  }
}

if (tarballs.length !== 1) {
  throw new Error(`Expected 1 package tarball, found ${tarballs.length}`);
}

for (const reactVersion of ["18.3.1", "19"]) {
  verifyReactVersion(reactVersion);
}
