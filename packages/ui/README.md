# @kantzen-ui/ui

The main Kantzen UI package. It contains the theme, Blueprint-backed icon
adapter, interactive primitives, keyboard and focus utilities, navigation
contracts, and reusable workspace/public-site components.

## Install

```sh
npm install @kantzen-ui/ui
```

React and React DOM are peer dependencies. Packed artifacts are tested against
both React 18 and React 19 before release.

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
- `@kantzen-ui/ui/styles.css` — complete default stylesheet
- `@kantzen-ui/ui/theme.css` — theme tokens and global theme styles only

```tsx
import { useRovingFocus } from "@kantzen-ui/ui/interactions";
import type { NavGroup } from "@kantzen-ui/ui/navigation";
```

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
