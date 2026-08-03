# Kantzen UI

Kantzen UI is Patryk Kępa's reusable React interface system for workspace
applications and websites.

The project is maintained as one npm workspace with a deliberately small public
package surface. Blueprint Icons is the intentional icon provider; Kantzen UI
does not depend on Blueprint Core.

## Packages

- `@kantzen-ui/ui` — theme, icons, primitives, interactions, navigation contracts, and general components
- `@kantzen-ui/app-shell` — optional application and website shells built around React Router
- `@kantzen-ui/command-palette` — optional command-palette composition built around `cmdk`
- `@kantzen-ui/graph` — optional, data-agnostic force-directed graph canvas

## Install

Most applications need only the main package:

```sh
npm install @kantzen-ui/ui
```

Install optional capabilities as needed:

```sh
npm install @kantzen-ui/app-shell @kantzen-ui/command-palette @kantzen-ui/graph
```

```tsx
import { Button, Card, ThemeProvider } from "@kantzen-ui/ui";
import { useRovingFocus } from "@kantzen-ui/ui/interactions";
import type { NavGroup } from "@kantzen-ui/ui/navigation";
import "@kantzen-ui/ui/styles.css";
```

## Development

Use Node.js 22.14 or newer.

```sh
npm ci
npm test
npm run build:playground
npm run lint
npm run format:check
```

Run `npm run dev:playground` for the visual component playground and
`npm run pack:packages` to build installable tarballs for all public packages.

## Publishing

Releases are published from GitHub Actions with npm trusted publishing. The
initial package versions must first be bootstrapped by an npm scope owner; see
[`docs/reusable-ui-npm-packages.md`](docs/reusable-ui-npm-packages.md) for the
complete setup and release procedure.

See [`NOTICE.md`](NOTICE.md) for provenance.
