# Contributing

## Development

Use Node.js 22.14 or newer.

```bash
npm ci
npm run format:check
npm run lint
npm test
npm run verify:packages
npm run build:playground
```

Use `npm run dev:playground` to preview the component playground locally.

## Source Organization

The `packages/ui/src` tree is organized by responsibility:

- `theme` and `icons` contain shared design-system infrastructure.
- `primitives` contains low-level reusable controls and overlays.
- `components` contains composed controls used across products.
- `site` contains public-site sections and layouts.
- `app-shell`, `command-palette`, `graph`, and `interactions` are bounded feature modules.

Keep small, single-file components flat inside their domain. Create a dedicated
component folder only when it owns multiple implementation, style, or test
files. Public entry points may use barrels; implementation files should import
the concrete module they depend on.

The base `styles.css` composes theme, primitive, component, and site styles.
Feature stylesheets do not import it and must remain independently additive.

## Pull Requests

- Keep changes scoped to the affected package module or example.
- Add or update README examples when public APIs change.
- Run the full validation commands before requesting review.
- Do not commit generated `dist/`, package tarballs, local caches, or `node_modules`.

## Package Changes

The public package lives in `packages/ui`. The playground in
`examples/landing-page` is private and should not be published.

When preparing a release, bump the `@patkepa/kantzen-ui` package version.
