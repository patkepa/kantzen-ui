import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Alert, FilterPill, Popover, SearchField } from "../../dist/index.js";

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
