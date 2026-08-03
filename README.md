# Kantzen UI

Kantzen UI is Patryk Kępa's reusable React interface system for workspace
applications and websites.

Explore the [Kantzen UI landing page and component playground](https://patkepa.github.io/kantzen-ui/).

The project publishes one npm package with subpath exports for optional,
specialized capabilities. Blueprint Icons is the intentional icon provider;
Kantzen UI does not depend on Blueprint Core.

## Package surface

- `@kantzen-ui/ui` — theme, icons, primitives, interactions, navigation contracts, and general components
- `@kantzen-ui/ui/app-shell` — router-agnostic application and website shells
- `@kantzen-ui/ui/command-palette` — command-palette composition built around `cmdk`
- `@kantzen-ui/ui/graph` — data-agnostic force-directed graph canvas

## Install

```sh
npm install @kantzen-ui/ui
```

```tsx
import { WorkspaceShell } from "@kantzen-ui/ui/app-shell";
import { CommandPaletteShell } from "@kantzen-ui/ui/command-palette";
import { ForceGraphCanvas } from "@kantzen-ui/ui/graph";
import { Button, Card, ThemeProvider } from "@kantzen-ui/ui";
import { useRovingFocus } from "@kantzen-ui/ui/interactions";
import type { NavGroup } from "@kantzen-ui/ui/navigation";
import "@kantzen-ui/ui/styles.css";
import "@kantzen-ui/ui/app-shell/styles.css";
import "@kantzen-ui/ui/command-palette/styles.css";
import "@kantzen-ui/ui/graph/styles.css";
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
`npm run pack:packages` to build the installable package tarball.

## GitHub Pages

Every push to `main` builds and deploys the landing-page workspace with GitHub
Actions. For the first deployment, set **Settings → Pages → Build and
deployment → Source** to **GitHub Actions**, then run the **Deploy Landing
Page** workflow or push to `main`.

## Publishing

Releases are published from GitHub Actions with npm trusted publishing. The
initial package version must first be bootstrapped by an npm scope owner.

See [`NOTICE.md`](NOTICE.md) for provenance.
