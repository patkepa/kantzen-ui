# Repository Guidelines

## Project Structure & Module Organization

This npm workspace publishes `packages/ui` as `@patkepa/kantzen-ui`; `examples/playground` is a private Vite app for visual development. Library code lives in `packages/ui/src`, grouped by responsibility: `primitives`, `components`, `theme`, `icons`, `site`, and bounded features such as `app-shell`, `command-palette`, `graph`, and `interactions`. Tests are under `packages/ui/test` and mirror those domains. Repository automation lives in `scripts/`, while design references belong in `design/`.

Keep small components flat within their domain. Add a component directory only when it owns several implementation, style, or test files. Barrels are for public entry points; internal code should import concrete modules.

## Build, Test, and Development Commands

Use Node.js 22.14+ and npm 10.

- `npm ci` installs the locked dependency tree.
- `npm run dev:playground` starts the Vite playground on all interfaces.
- `npm run build` cleans and compiles the UI package, including CSS assets.
- `npm test` builds, smoke-tests, and runs package tests.
- `npm run lint` checks TypeScript, React hooks, examples, and scripts.
- `npm run format:check` verifies Prettier formatting; `npm run format` applies it.
- `npm run verify:packages` packs the package and validates it in a clean consumer.
- `npm run build:playground` performs the production playground build.

## Coding Style & Naming Conventions

Write strict TypeScript and React function components. Prettier defines formatting (two-space indentation, double quotes, semicolons, and trailing commas). ESLint enforces recommended TypeScript rules and React Hooks correctness. Use PascalCase for components and exported types, camelCase for functions and hooks (`useRovingFocus`), and kebab-case filenames (`workspace-shell.tsx`). Keep CSS feature-local and use the existing `kui-` class prefix. Include `.js` extensions in relative TypeScript imports, matching ESM output.

## Testing Guidelines

Tests use `node:test` with `node:assert/strict` and follow `*.test.mjs`. Add focused tests under the matching `packages/ui/test/<domain>` directory. Because tests import compiled files from `dist`, prefer `npm test` over invoking `node --test` directly. No numeric coverage threshold is configured; cover new behavior and regressions.

## Commit & Pull Request Guidelines

History favors short, descriptive subjects such as `Update landing-page.css` or `move files around for better organization`; Conventional Commits are not required. Keep commits focused. Pull requests should explain intent, stay scoped to one module or example, link relevant issues, and include screenshots for visual changes. Update README examples for public API changes and run the full CI command set before review. Do not commit `dist/`, tarballs, caches, or `node_modules`.
