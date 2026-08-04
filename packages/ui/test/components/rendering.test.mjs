import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Alert, FilterPill, Popover, SearchField } from "../../dist/index.js";
import { WorkspaceSidebar } from "../../dist/app-shell/index.js";
import { getContextMenuPosition } from "../../dist/primitives/context-menu.js";

test("renders open overlays safely during server rendering", () => {
  assert.doesNotThrow(() =>
    renderToStaticMarkup(React.createElement(Alert, { isOpen: true })),
  );
  assert.doesNotThrow(() =>
    renderToStaticMarkup(
      React.createElement(
        Popover,
        { content: "Popover content", defaultIsOpen: true },
        React.createElement("button", { type: "button" }, "Open"),
      ),
    ),
  );
});

test("renders direct popover targets without an extra wrapper", () => {
  const html = renderToStaticMarkup(
    React.createElement(Popover, {
      content: "Popover content",
      renderTarget: ({ setTargetElement: _setTargetElement, ...props }) =>
        React.createElement("button", { ...props, type: "button" }, "Open"),
    }),
  );

  assert.match(html, /^<button/);
  assert.doesNotMatch(html, /<span[^>]+kui-popover-target/);
});

test("renders sidebar navigation as semantic nested lists", () => {
  const html = renderToStaticMarkup(
    React.createElement(WorkspaceSidebar, {
      currentPath: "/workspace/settings/members",
      navGroups: [
        {
          label: "Workspace",
          items: [
            {
              href: "/workspace",
              icon: "home",
              label: "Workspace",
              children: [
                {
                  href: "/workspace/settings",
                  icon: "settings",
                  label: "Settings",
                  children: [
                    {
                      href: "/workspace/settings/members",
                      icon: "people",
                      label: "Members",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      productName: "Kantzen",
    }),
  );

  assert.match(html, /<ul[^>]*sidebar-menu[^>]*><li/);
  assert.doesNotMatch(html, /<ul[^>]*>\s*<div/);
  assert.doesNotMatch(html, /<span[^>]*>\s*<li/);
  assert.match(html, /href="\/workspace\/settings\/members"/);
  assert.match(html, /aria-current="page"/);
});

test("gives search controls accessible names", () => {
  const html = renderToStaticMarkup(
    React.createElement(SearchField, {
      ariaLabel: "Search services",
      onChange() {},
      value: "api",
    }),
  );

  assert.match(html, /aria-label="Search services"/);
  assert.match(html, /aria-label="Clear search"/);
  assert.match(html, /type="search"/);
});

test("keeps filter pills from submitting a containing form", () => {
  const html = renderToStaticMarkup(
    React.createElement(FilterPill, {
      active: true,
      label: "All",
      onSelect() {},
      value: "all",
    }),
  );

  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /type="button"/);
});

test("keeps context menus inside the viewport without doubling offsets", () => {
  assert.deepEqual(
    getContextMenuPosition(
      { left: 300, top: 200 },
      { width: 240, height: 180 },
      { width: 1_000, height: 700 },
    ),
    { left: 300, top: 200 },
  );
  assert.deepEqual(
    getContextMenuPosition(
      { left: 900, top: 650 },
      { width: 240, height: 180 },
      { width: 1_000, height: 700 },
    ),
    { left: 752, top: 512 },
  );
  assert.deepEqual(
    getContextMenuPosition(
      { left: -20, top: -10 },
      { width: 240, height: 180 },
      { width: 1_000, height: 700 },
    ),
    { left: 8, top: 8 },
  );
});
