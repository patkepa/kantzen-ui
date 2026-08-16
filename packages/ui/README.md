# @patkepa/kantzen-ui

The Kantzen UI package contains the theme, Blueprint-backed icon adapter,
interactive primitives, keyboard and focus utilities, navigation contracts,
application shells, command palette, graph visualization, and reusable
workspace/public-site components.

## Install

```sh
npm install @patkepa/kantzen-ui
```

React and React DOM are peer dependencies. Application shells accept navigation
state and callbacks without requiring a particular router. Packed artifacts are
tested against both React 18 and React 19 before release.

## Main entry point

```tsx
import {
  Button,
  Card,
  EmptyState,
  SearchField,
  ThemeProvider,
} from "@patkepa/kantzen-ui";
import "@patkepa/kantzen-ui/styles.css";
```

`styles.css` includes the semantic theme, primitive styles, and component
styles in the correct order.

## Subpath exports

- `@patkepa/kantzen-ui/icons` — icon component, Blueprint icon loader, and icon types
- `@patkepa/kantzen-ui/interactions` — keyboard, focus, roving-focus, and form-navigation helpers
- `@patkepa/kantzen-ui/navigation` — workspace and site navigation contracts
- `@patkepa/kantzen-ui/primitives` — the lower-level component surface
- `@patkepa/kantzen-ui/theme` — `ThemeProvider`, `useTheme`, and theme types
- `@patkepa/kantzen-ui/app-shell` — workspace and public-site shells
- `@patkepa/kantzen-ui/command-palette` — `cmdk`-backed command palette composition
- `@patkepa/kantzen-ui/graph` — force-directed graph canvas and simulation utilities
- `@patkepa/kantzen-ui/styles.css` — complete default stylesheet
- `@patkepa/kantzen-ui/theme.css` — tokens and Blueprint compatibility without a document reset
- `@patkepa/kantzen-ui/tokens.css` — design tokens only
- `@patkepa/kantzen-ui/reset.css` — optional document reset and global utilities
- `@patkepa/kantzen-ui/blueprint-compat.css` — optional Blueprint-compatible theme overrides

```tsx
import { useRovingFocus } from "@patkepa/kantzen-ui/interactions";
import type { NavGroup } from "@patkepa/kantzen-ui/navigation";
```

Feature styles are exported next to their modules. They extend the base
stylesheet rather than importing it, so applications should import
`@patkepa/kantzen-ui/styles.css` exactly once and then add only the feature styles
they use:

```tsx
import { WorkspaceShell } from "@patkepa/kantzen-ui/app-shell";
import { CommandPaletteShell } from "@patkepa/kantzen-ui/command-palette";
import { ForceGraphCanvas } from "@patkepa/kantzen-ui/graph";

import "@patkepa/kantzen-ui/styles.css";
import "@patkepa/kantzen-ui/app-shell/styles.css";
import "@patkepa/kantzen-ui/command-palette/styles.css";
import "@patkepa/kantzen-ui/graph/styles.css";
```

`WorkspaceShell`, `WorkspaceSidebar`, `WorkspaceToolbar`, and
`WorkspaceBottomToolbar` are the canonical workspace component names. The
older `AppShell`, `AppSidebar`, `MainToolbar`, and `BottomToolbar` exports remain
available as deprecated compatibility aliases.

## Site components

```tsx
import {
  CtaBar,
  FeatureGrid,
  SiteHero,
  SiteSection,
} from "@patkepa/kantzen-ui";
import "@patkepa/kantzen-ui/styles.css";

export function ProductPage() {
  return (
    <>
      <SiteHero
        title="Operate every deployment from one workspace"
        description="Reuse the same technical design language outside the workspace shell."
      />
      <SiteSection title="Capabilities">
        <FeatureGrid
          features={[
            {
              title: "Live operations",
              description:
                "Track active systems, incidents, and delivery state.",
              icon: "pulse",
            },
          ]}
        />
      </SiteSection>
      <CtaBar title="See the workspace in action" />
    </>
  );
}
```
