# Kantzen UI

Kantzen UI is Patryk Kępa's reusable React interface system for workspace
applications and websites.

Explore the [Kantzen UI landing page and component playground](https://patkepa.github.io/kantzen-ui/).
See the [Kantzen Starlight theme showcase](https://patkepa.github.io/kantzen-ui/starlight/).

The project publishes the core UI package and a companion Starlight theme.
Blueprint Icons is the intentional icon provider; Kantzen UI does not depend
on Blueprint Core.

## Package surface

- `@patkepa/kantzen-ui` — theme, icons, primitives, interactions, navigation contracts, and general components
- `@patkepa/kantzen-ui/app-shell` — router-agnostic application and website shells
- `@patkepa/kantzen-ui/command-palette` — command-palette composition built around `cmdk`
- `@patkepa/kantzen-ui/graph` — data-agnostic force-directed graph canvas
- `@patkepa/kantzen-starlight` — reusable Kantzen theme for Astro Starlight documentation sites

## Install

```sh
npm install @patkepa/kantzen-ui
```

```tsx
import { WorkspaceShell } from "@patkepa/kantzen-ui/app-shell";
import { CommandPaletteShell } from "@patkepa/kantzen-ui/command-palette";
import { ForceGraphCanvas } from "@patkepa/kantzen-ui/graph";
import { Button, Card, ThemeProvider } from "@patkepa/kantzen-ui";
import { useRovingFocus } from "@patkepa/kantzen-ui/interactions";
import type { NavGroup } from "@patkepa/kantzen-ui/navigation";
import "@patkepa/kantzen-ui/styles.css";
import "@patkepa/kantzen-ui/app-shell/styles.css";
import "@patkepa/kantzen-ui/command-palette/styles.css";
import "@patkepa/kantzen-ui/graph/styles.css";
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
`npm run dev:starlight` for the documentation theme fixture. Run
`npm run pack:packages` to build the installable package tarballs.

The playground and published package use the experimental native Rust React
Compiler. Package output targets React 18 through `react-compiler-runtime`, so
the existing React 18 and React 19 peer range remains supported.

## GitHub Pages

Every push to `main` builds and deploys the landing-page workspace at the site
root and the Starlight showcase at `/starlight/`. For the first deployment, set
**Settings → Pages → Build and deployment → Source** to **GitHub Actions**, then
run the **Deploy Showcases** workflow or push to `main`.

## Publishing

Releases are published from GitHub Actions with npm trusted publishing. The
initial package version must first be bootstrapped by an npm scope owner.

See [`NOTICE.md`](NOTICE.md) for provenance.
