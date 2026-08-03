import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as appShell from "@kantzen-ui/ui/app-shell";
import * as commandPalette from "@kantzen-ui/ui/command-palette";
import * as graph from "@kantzen-ui/ui/graph";
import { Icon, Icons } from "@kantzen-ui/ui/icons";
import * as interactions from "@kantzen-ui/ui/interactions";
import { Button, Card, ThemeProvider } from "@kantzen-ui/ui";
import * as ui from "@kantzen-ui/ui";

const expectedUiComponents = [
  "BottomToolbar",
  "CtaBar",
  "DemoFrame",
  "EmptyState",
  "ExpandableSearchField",
  "FeatureGrid",
  "FilterPill",
  "MainToolbar",
  "MetricStrip",
  "SearchField",
  "SegmentedControl",
  "SelectableList",
  "SiteGrid",
  "SiteHero",
  "SiteSection",
  "StatusLed",
  "Tabs",
  "InspectorWorkspace",
  "WorkspaceBottomToolbar",
  "WorkspaceToolbar",
];
const expectedShellComponents = [
  "AppShell",
  "AppSidebar",
  "ErrorBoundary",
  "SiteFooter",
  "SiteNavbar",
  "SiteShell",
  "WorkspaceNavbar",
  "WorkspaceShell",
  "WorkspaceSidebar",
  "WorkspacePortal",
];

for (const name of expectedUiComponents) {
  assert.equal(typeof ui[name], "function", `Missing UI export: ${name}`);
}
for (const name of expectedShellComponents) {
  assert.equal(
    typeof appShell[name],
    "function",
    `Missing app-shell export: ${name}`,
  );
}

assert.equal(typeof commandPalette.CommandPaletteShell, "function");
assert.equal(typeof graph.ForceGraphCanvas, "object");
assert.equal(typeof interactions.useRovingFocus, "function");
assert.equal(typeof ThemeProvider, "function");
assert.equal(ui.BottomToolbar, ui.WorkspaceBottomToolbar);
assert.equal(ui.MainToolbar, ui.WorkspaceToolbar);
assert.equal(appShell.AppShell, appShell.WorkspaceShell);
assert.equal(appShell.AppSidebar, appShell.WorkspaceSidebar);
assert.equal(ui.PopoverNext, ui.Popover);

await Icons.load("add", 16);
const html = renderToStaticMarkup(
  React.createElement(
    Card,
    null,
    React.createElement(Button, { icon: "add", text: "Create" }),
    React.createElement(Icon, { icon: "add" }),
  ),
);
assert.match(html, /kui-card/);
assert.match(html, /kui-button/);
assert.match(html, /<path/);

for (const stylesheet of [
  "@kantzen-ui/ui/app-shell/styles.css",
  "@kantzen-ui/ui/command-palette/styles.css",
  "@kantzen-ui/ui/graph/styles.css",
  "@kantzen-ui/ui/styles.css",
  "@kantzen-ui/ui/theme.css",
]) {
  assert.match(import.meta.resolve(stylesheet), /^file:/);
}

console.log(
  `Kantzen package smoke test passed (${expectedUiComponents.length} UI components, ${expectedShellComponents.length} shell components).`,
);
