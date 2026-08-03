export * from "./primitives/index.js";
export { ThemeProvider, useTheme } from "./theme/theme-provider.js";
export type { Theme } from "./theme/theme-provider.js";
export type {
  NavBadge,
  NavGroup,
  NavItem,
  Project,
  SiteNavAction,
  SiteNavGroup,
  SiteNavItem,
  User,
  WorkspaceNavGroup,
  WorkspaceNavItem,
} from "./navigation.js";

export { WorkspaceBottomToolbar } from "./components/workspace-bottom-toolbar.js";
export type { WorkspaceBottomToolbarProps } from "./components/workspace-bottom-toolbar.js";
export { WorkspaceToolbar } from "./components/workspace-toolbar.js";
export type { WorkspaceToolbarProps } from "./components/workspace-toolbar.js";

/** @deprecated Use WorkspaceBottomToolbar. */
export { WorkspaceBottomToolbar as BottomToolbar } from "./components/workspace-bottom-toolbar.js";
/** @deprecated Use WorkspaceBottomToolbarProps. */
export type { WorkspaceBottomToolbarProps as BottomToolbarProps } from "./components/workspace-bottom-toolbar.js";
/** @deprecated Use WorkspaceToolbar. */
export { WorkspaceToolbar as MainToolbar } from "./components/workspace-toolbar.js";
/** @deprecated Use WorkspaceToolbarProps. */
export type { WorkspaceToolbarProps as MainToolbarProps } from "./components/workspace-toolbar.js";

export { DemoFrame } from "./components/demo-frame.js";
export type { DemoFrameProps } from "./components/demo-frame.js";
export { EmptyState } from "./components/empty-state.js";
export type { EmptyStateProps } from "./components/empty-state.js";
export { ExpandableSearchField } from "./components/expandable-search-field.js";
export type { ExpandableSearchFieldProps } from "./components/expandable-search-field.js";
export { FilterPill } from "./components/filter-pill.js";
export type { FilterPillProps } from "./components/filter-pill.js";
export { InspectorWorkspace } from "./components/inspector-workspace.js";
export type { InspectorWorkspaceProps } from "./components/inspector-workspace.js";
export { SearchField } from "./components/search-field.js";
export type { SearchFieldProps } from "./components/search-field.js";
export { SegmentedControl } from "./components/segmented-control.js";
export type {
  SegmentedControlItem,
  SegmentedControlProps,
} from "./components/segmented-control.js";
export { SelectableList } from "./components/selectable-list.js";
export type { SelectableListProps } from "./components/selectable-list.js";
export { StatusLed } from "./components/status-led.js";
export type { StatusLedProps } from "./components/status-led.js";
export { Tabs } from "./components/tabs.js";
export type { TabItem, TabsProps } from "./components/tabs.js";

export { CtaBar } from "./site/cta-bar.js";
export type { CtaBarProps } from "./site/cta-bar.js";
export { FeatureGrid } from "./site/feature-grid.js";
export type { FeatureGridItem, FeatureGridProps } from "./site/feature-grid.js";
export { MetricStrip } from "./site/metric-strip.js";
export type { MetricStripItem, MetricStripProps } from "./site/metric-strip.js";
export { SiteGrid } from "./site/site-grid.js";
export type { SiteGridProps } from "./site/site-grid.js";
export { SiteHero } from "./site/site-hero.js";
export type { SiteHeroProps } from "./site/site-hero.js";
export { SiteSection } from "./site/site-section.js";
export type { SiteSectionProps } from "./site/site-section.js";
