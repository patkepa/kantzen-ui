# Workspace and Site UI Implementation Plan

> Historical implementation record. The original package boundaries referenced
> below were consolidated before the standalone npm release. Current consumers
> use `@kantzen-ui/ui` and its subpath exports; see
> `reusable-ui-npm-packages.md` for the supported package surface.

This plan expands the UI package workspace from a single application-shell model into two clear layout families:

- `Workspace*`: authenticated SaaS application surfaces where users do their primary work.
- `Site*`: public-facing website surfaces such as product pages, blog pages, galleries, docs landing pages, and marketing content.

`Admin*` should be reserved for true administrative or internal control surfaces. `Product*` should be used only for components that are specifically tied to product-page storytelling and would not naturally fit a broader public site page.

## Goals

- Keep the existing logged-in SaaS shell behavior intact.
- Rename the current app shell concepts toward `Workspace*` names.
- Add a separate public-site shell and navigation model.
- Reuse the current dark theme, Blueprint integration, spacing, borders, and interaction style.
- Avoid forcing fixed-viewport admin behavior onto public site pages.
- Preserve backward compatibility for current consumers during the migration.

## Naming Model

### Workspace Family

Use `Workspace*` for the authenticated client application.

Initial canonical names:

- `WorkspaceShell`
- `WorkspaceSidebar`
- `WorkspaceNavbar`
- `WorkspaceToolbar`
- `WorkspaceBottomToolbar`

The current `AppShell`, `AppSidebar`, `MainToolbar`, and `BottomToolbar` components map into this family.

### Site Family

Use `Site*` for public-facing layout and navigation.

Initial components:

- `SiteShell`
- `SiteNavbar`
- `SiteFooter`
- `SiteSection`
- `SiteHero`
- `SiteGrid`

The site family should support homepage, product page, blog, gallery, docs, and other public content surfaces without assuming authentication or workspace navigation.

### Specific Content Components

Use functional names by default:

- `FeatureGrid`
- `MetricStrip`
- `DemoFrame`
- `CtaBar`
- `ArticleCard`
- `GalleryGrid`

Use `Product*`, `Blog*`, or `Gallery*` only when the component has content-specific behavior or structure:

- `ProductDemoFrame`
- `ProductFeatureMatrix`
- `BlogArticleLayout`
- `GalleryLightbox`

## Package Structure

Keep `@kantzen-ui/app-shell` as the package for high-level layout chrome:

```text
packages/app-shell/src/
  workspace-shell.tsx
  workspace-sidebar.tsx
  workspace-shell.css
  workspace-sidebar.css
  site-shell.tsx
  site-navbar.tsx
  site-footer.tsx
  site-shell.css
  error-boundary.tsx
  index.ts
  styles.css
```

Keep `@kantzen-ui/ui` for lower-level reusable primitives:

```text
packages/ui/src/
  workspace-toolbar.tsx
  workspace-bottom-toolbar.tsx
  site-section.tsx
  site-hero.tsx
  site-grid.tsx
  feature-grid.tsx
  metric-strip.tsx
  demo-frame.tsx
  cta-bar.tsx
```

Keep `@kantzen-ui/navigation` for shared navigation data contracts:

```text
packages/navigation/src/index.ts
```

Add separate navigation types instead of stretching the current sidebar-oriented type too far.

## Navigation Types

Keep the existing `NavItem` and `NavGroup` for workspace sidebar navigation initially.

Add site-specific types:

```ts
export interface SiteNavItem {
  label: string;
  href: string;
  external?: boolean;
  children?: SiteNavItem[];
}

export interface SiteNavAction {
  label: string;
  href: string;
  intent?: "primary" | "secondary";
  external?: boolean;
}

export interface SiteNavGroup {
  label: string;
  items: SiteNavItem[];
}
```

Later, the workspace types can be renamed to `WorkspaceNavItem`, `WorkspaceNavGroup`, and aliased back to `NavItem` and `NavGroup`.

## Compatibility Strategy

Rename internals to the new canonical names, then keep deprecated aliases.

Example:

```ts
export { WorkspaceShell } from "./workspace-shell";
export { WorkspaceSidebar } from "./workspace-sidebar";

/** @deprecated Use WorkspaceShell instead. */
export { WorkspaceShell as AppShell } from "./workspace-shell";

/** @deprecated Use WorkspaceSidebar instead. */
export { WorkspaceSidebar as AppSidebar } from "./workspace-sidebar";
```

Do the same for prop types:

```ts
export type { WorkspaceShellProps } from "./workspace-shell";

/** @deprecated Use WorkspaceShellProps instead. */
export type { WorkspaceShellProps as AppShellProps } from "./workspace-shell";
```

This lets existing consumers upgrade without an immediate breaking change.

## CSS Strategy

Move workspace-only fixed-layout behavior out of the global theme and into workspace shell styles.

Current issue:

```css
body {
  overflow: hidden;
}
```

This is correct for a fixed workspace shell, but wrong for public site pages that need normal document scrolling.

Recommended change:

- Remove `overflow: hidden` from `packages/theme/src/theme.css`.
- Add fixed-viewport behavior to `WorkspaceShell` CSS.
- Let `SiteShell` use normal page scrolling.

Workspace CSS should own:

```css
.workspace-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
```

Site CSS should own:

```css
.site-shell {
  min-height: 100vh;
  background-color: var(--content-bg);
}

.site-main {
  min-height: 100vh;
}
```

## Public Site Layout Requirements

`SiteShell` should support:

- sticky top navbar
- public navigation links
- dropdown navigation groups
- right-aligned calls to action
- optional footer
- normal page scrolling
- mobile menu or drawer
- route-aware active nav state when used with `react-router-dom`

`SiteNavbar` should use the same theme tokens and Blueprint button/icon conventions while feeling appropriate for public browsing.

## Workspace Layout Requirements

`WorkspaceShell` should preserve the current behavior:

- left sidebar
- collapsible sidebar
- top navbar with breadcrumb area
- command palette trigger
- focus-region keyboard behavior
- fixed viewport
- scrollable workspace content area
- error boundary around page content

No behavior should change during the rename except class names and exports.

## Migration Phases

### Phase 1: Rename Workspace Internals

- Rename `app-shell.tsx` to `workspace-shell.tsx`.
- Rename `app-sidebar.tsx` to `workspace-sidebar.tsx`.
- Rename `main-layout.css` to `workspace-shell.css`.
- Rename `app-sidebar.css` to `workspace-sidebar.css`.
- Update class names from `main-*`, `app-sidebar`, and `top-navbar` to `workspace-*`.
- Export `WorkspaceShell` and `WorkspaceSidebar`.
- Keep `AppShell` and `AppSidebar` as deprecated aliases.
- Update `packages/app-shell/README.md` with the new canonical names.

### Phase 2: Scope Fixed Viewport Behavior

- Remove `body { overflow: hidden; }` from `packages/theme/src/theme.css`.
- Add fixed viewport and overflow behavior to `WorkspaceShell`.
- Verify existing workspace consumers still behave as before.

### Phase 3: Add Site Shell

- Add `site-shell.tsx`.
- Add `site-navbar.tsx`.
- Add `site-footer.tsx`.
- Add `site-shell.css`.
- Export `SiteShell`, `SiteNavbar`, and `SiteFooter`.
- Update `@kantzen-ui/app-shell/styles.css` to import both workspace and site CSS.

### Phase 4: Add Site Primitives

- Add `SiteSection`.
- Add `SiteHero`.
- Add `SiteGrid`.
- Add `FeatureGrid`.
- Add `MetricStrip`.
- Add `DemoFrame`.
- Add `CtaBar`.
- Export these from `@kantzen-ui/ui`.
- Keep styles restrained and compatible with the current dark technical visual language.

### Phase 5: Add Navigation Types

- Add `SiteNavItem`, `SiteNavGroup`, and `SiteNavAction`.
- Optionally add `WorkspaceNavItem` and `WorkspaceNavGroup`.
- Keep `NavItem` and `NavGroup` aliases for compatibility.

### Phase 6: Documentation and Examples

- Update root `README.md` package descriptions.
- Update `packages/app-shell/README.md` with `WorkspaceShell` and `SiteShell` examples.
- Update `packages/ui/README.md` with public site primitives.
- Update `docs/reusable-ui-npm-packages.md` to show `WorkspaceShell` as canonical while mentioning the deprecated `AppShell` alias.

### Phase 7: Validation

Run:

```bash
npm run format:check
npm run lint
npm run build
```

If formatting changes are needed, run:

```bash
npm run format
```

## Suggested First Implementation Slice

Start with a compatibility-safe slice:

1. Add `WorkspaceShell` and `WorkspaceSidebar` as aliases around the existing components.
2. Update docs to call the workspace names canonical.
3. Add `SiteShell` and `SiteNavbar` without changing existing CSS behavior.
4. Move `body { overflow: hidden; }` into workspace CSS only after the site shell is in place and verified.

This keeps the first change small while establishing the naming model.

## Breaking Change Policy

Avoid breaking existing imports in the first release that introduces `Workspace*` and `Site*`.

Safe first release:

- Add new exports.
- Keep old exports.
- Mark old names as deprecated in documentation and TypeScript comments.

Future major release:

- Remove deprecated `AppShell`, `AppSidebar`, `AppShellProps`, and `AppSidebarProps` aliases.
- Require consumers to use `Workspace*` names.
