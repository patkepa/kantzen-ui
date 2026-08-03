# @kantzen-ui/ui

The Kantzen UI package contains the theme, Blueprint-backed icon adapter,
interactive primitives, keyboard and focus utilities, navigation contracts,
application shells, command palette, graph visualization, and reusable
workspace/public-site components.

## Install

```sh
npm install @kantzen-ui/ui
```

React and React DOM are peer dependencies. React Router is an optional peer used
by the app-shell subpath. Packed artifacts are tested against both React 18 and
React 19 before release.

## Main entry point

```tsx
import {
  Button,
  Card,
  EmptyState,
  SearchField,
  ThemeProvider,
} from "@kantzen-ui/ui";
import "@kantzen-ui/ui/styles.css";
```

`styles.css` includes the semantic theme, primitive styles, and component
styles in the correct order.

## Subpath exports

- `@kantzen-ui/ui/icons` — icon component, Blueprint icon loader, and icon types
- `@kantzen-ui/ui/interactions` — keyboard, focus, roving-focus, and form-navigation helpers
- `@kantzen-ui/ui/navigation` — workspace and site navigation contracts
- `@kantzen-ui/ui/primitives` — the lower-level component surface
- `@kantzen-ui/ui/theme` — `ThemeProvider`, `useTheme`, and theme types
- `@kantzen-ui/ui/app-shell` — workspace and public-site shells
- `@kantzen-ui/ui/command-palette` — `cmdk`-backed command palette composition
- `@kantzen-ui/ui/graph` — force-directed graph canvas and simulation utilities
- `@kantzen-ui/ui/styles.css` — complete default stylesheet
- `@kantzen-ui/ui/theme.css` — theme tokens and global theme styles only

```tsx
import { useRovingFocus } from "@kantzen-ui/ui/interactions";
import type { NavGroup } from "@kantzen-ui/ui/navigation";
```

Feature styles are exported next to their modules. They extend the base
stylesheet rather than importing it, so applications should import
`@kantzen-ui/ui/styles.css` exactly once and then add only the feature styles
they use:

```tsx
import { WorkspaceShell } from "@kantzen-ui/ui/app-shell";
import { CommandPaletteShell } from "@kantzen-ui/ui/command-palette";
import { ForceGraphCanvas } from "@kantzen-ui/ui/graph";

import "@kantzen-ui/ui/styles.css";
import "@kantzen-ui/ui/app-shell/styles.css";
import "@kantzen-ui/ui/command-palette/styles.css";
import "@kantzen-ui/ui/graph/styles.css";
```

`WorkspaceShell`, `WorkspaceSidebar`, `WorkspaceToolbar`, and
`WorkspaceBottomToolbar` are the canonical workspace component names. The
older `AppShell`, `AppSidebar`, `MainToolbar`, and `BottomToolbar` exports remain
available as deprecated compatibility aliases.

## Site components

```tsx
import { CtaBar, FeatureGrid, SiteHero, SiteSection } from "@kantzen-ui/ui";
import "@kantzen-ui/ui/styles.css";

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
