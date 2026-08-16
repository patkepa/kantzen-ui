import type { IconName } from "@patkepa/kantzen-ui";

export type ComponentCategory =
  "Primitives" | "Components" | "Site" | "App shell" | "Command" | "Graph";

export interface CatalogItem {
  id: string;
  name: string;
  exportName: string;
  category: ComponentCategory;
  icon: IconName;
  description: string;
}

interface CatalogGroup {
  label: ComponentCategory;
  items: readonly CatalogItem[];
}

const defineItem = (
  category: ComponentCategory,
  name: string,
  exportName: string,
  icon: IconName,
  description: string,
): CatalogItem => ({
  category,
  description,
  exportName,
  icon,
  id: exportName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  name,
});

export const catalogGroups: readonly CatalogGroup[] = [
  {
    label: "Primitives",
    items: [
      defineItem(
        "Primitives",
        "Button",
        "Button",
        "cube",
        "Triggers actions with clear intent and accessible states.",
      ),
      defineItem(
        "Primitives",
        "Card",
        "Card",
        "panel-stats",
        "Groups related content in a compact, composable surface.",
      ),
      defineItem(
        "Primitives",
        "Input Group",
        "InputGroup",
        "form",
        "Combines text input, icons, and inline actions.",
      ),
      defineItem(
        "Primitives",
        "Alert",
        "Alert",
        "warning-sign",
        "Requests confirmation for consequential actions.",
      ),
      defineItem(
        "Primitives",
        "Menu",
        "Menu",
        "menu",
        "Presents structured actions and nested choices.",
      ),
      defineItem(
        "Primitives",
        "Popover",
        "Popover",
        "widget-button",
        "Positions contextual content beside a trigger.",
      ),
      defineItem(
        "Primitives",
        "Context Menu",
        "showContextMenu",
        "select",
        "Opens relevant commands at the pointer position.",
      ),
      defineItem(
        "Primitives",
        "Navbar",
        "Navbar",
        "horizontal-distribution",
        "Aligns application controls in a stable top rail.",
      ),
      defineItem(
        "Primitives",
        "Tag",
        "Tag",
        "tag",
        "Adds compact metadata to content and controls.",
      ),
      defineItem(
        "Primitives",
        "Non Ideal State",
        "NonIdealState",
        "disable",
        "Explains empty, unavailable, or incomplete states.",
      ),
    ],
  },
  {
    label: "Components",
    items: [
      defineItem(
        "Components",
        "Tabs",
        "Tabs",
        "applications",
        "Switches between peer views with keyboard navigation.",
      ),
      defineItem(
        "Components",
        "Segmented Control",
        "SegmentedControl",
        "segmented-control",
        "Selects one view or mode from a short set.",
      ),
      defineItem(
        "Components",
        "Search Field",
        "SearchField",
        "search",
        "Provides a focused search input with a clear action.",
      ),
      defineItem(
        "Components",
        "Expandable Search Field",
        "ExpandableSearchField",
        "search-template",
        "Keeps search compact until the user needs it.",
      ),
      defineItem(
        "Components",
        "Filter Pill",
        "FilterPill",
        "filter",
        "Applies a visible, count-aware result filter.",
      ),
      defineItem(
        "Components",
        "Selectable List",
        "SelectableList",
        "list",
        "Supports roving focus and single-item selection.",
      ),
      defineItem(
        "Components",
        "Status LED",
        "StatusLed",
        "signal-search",
        "Communicates live operational status at a glance.",
      ),
      defineItem(
        "Components",
        "Empty State",
        "EmptyState",
        "inbox",
        "Pairs a clear explanation with an empty view.",
      ),
      defineItem(
        "Components",
        "Demo Frame",
        "DemoFrame",
        "widget-header",
        "Frames examples with optional context and actions.",
      ),
      defineItem(
        "Components",
        "Workspace Toolbar",
        "WorkspaceToolbar",
        "control",
        "Organizes primary canvas and workspace commands.",
      ),
      defineItem(
        "Components",
        "Bottom Toolbar",
        "WorkspaceBottomToolbar",
        "applications",
        "Holds persistent view and status controls.",
      ),
      defineItem(
        "Components",
        "Inspector Workspace",
        "InspectorWorkspace",
        "property",
        "Creates a semantic home for inspector content.",
      ),
    ],
  },
  {
    label: "Site",
    items: [
      defineItem(
        "Site",
        "Hero",
        "SiteHero",
        "header",
        "Introduces a public page with copy, actions, and media.",
      ),
      defineItem(
        "Site",
        "Section",
        "SiteSection",
        "panel-stats",
        "Provides consistent public-page spacing and hierarchy.",
      ),
      defineItem(
        "Site",
        "Grid",
        "SiteGrid",
        "grid-view",
        "Builds responsive content grids from a minimum width.",
      ),
      defineItem(
        "Site",
        "Feature Grid",
        "FeatureGrid",
        "multi-select",
        "Presents product capabilities in a responsive grid.",
      ),
      defineItem(
        "Site",
        "Metric Strip",
        "MetricStrip",
        "comparison",
        "Shows a concise row of tabular proof points.",
      ),
      defineItem(
        "Site",
        "CTA Bar",
        "CtaBar",
        "arrow-right",
        "Closes a section with focused copy and an action.",
      ),
      defineItem(
        "Site",
        "Site Navbar",
        "SiteNavbar",
        "application",
        "Provides responsive navigation for public pages.",
      ),
      defineItem(
        "Site",
        "Site Footer",
        "SiteFooter",
        "application",
        "Organizes product identity and secondary navigation.",
      ),
      defineItem(
        "Site",
        "Site Shell",
        "SiteShell",
        "application",
        "Composes public navigation, content, and footer.",
      ),
    ],
  },
  {
    label: "App shell",
    items: [
      defineItem(
        "App shell",
        "Workspace Navbar",
        "WorkspaceNavbar",
        "header",
        "Frames global workspace controls and utilities.",
      ),
      defineItem(
        "App shell",
        "Workspace Sidebar",
        "WorkspaceSidebar",
        "panel-stats",
        "Navigates dense product areas with keyboard support.",
      ),
      defineItem(
        "App shell",
        "Workspace Shell",
        "WorkspaceShell",
        "application",
        "Composes the complete keyboard-aware application frame.",
      ),
      defineItem(
        "App shell",
        "Workspace Portal",
        "WorkspacePortal",
        "move",
        "Mounts feature controls into named shell slots.",
      ),
      defineItem(
        "App shell",
        "Error Boundary",
        "ErrorBoundary",
        "error",
        "Keeps route failures contained and recoverable.",
      ),
    ],
  },
  {
    label: "Command",
    items: [
      defineItem(
        "Command",
        "Command Palette",
        "CommandPaletteShell",
        "console",
        "Creates a fast, keyboard-first command surface.",
      ),
    ],
  },
  {
    label: "Graph",
    items: [
      defineItem(
        "Graph",
        "Force Graph Canvas",
        "ForceGraphCanvas",
        "graph",
        "Renders interactive, styled node-link systems.",
      ),
    ],
  },
];

export const catalogItems = catalogGroups.flatMap((group) => group.items);

export const getCatalogItem = (id: string | null) =>
  catalogItems.find((item) => item.id === id) ?? catalogItems[0]!;
