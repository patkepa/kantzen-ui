import { useCallback, useState, type MouseEvent, type ReactNode } from "react";
import {
  Alert,
  Alignment,
  Button,
  Card,
  CtaBar,
  DemoFrame,
  EmptyState,
  ExpandableSearchField,
  FeatureGrid,
  FilterPill,
  Icon,
  InputGroup,
  InspectorWorkspace,
  Menu,
  MenuDivider,
  MenuItem,
  MetricStrip,
  Navbar,
  NavbarGroup,
  NonIdealState,
  Popover,
  SearchField,
  SegmentedControl,
  SelectableList,
  showContextMenu,
  SiteGrid,
  SiteHero,
  SiteSection,
  StatusLed,
  Tabs,
  Tag,
  WorkspaceBottomToolbar,
  WorkspaceToolbar,
} from "@kantzen-ui/ui";
import {
  ErrorBoundary,
  SiteFooter,
  SiteNavbar,
  SiteShell,
  WorkspaceNavbar,
  WorkspaceSidebar,
} from "@kantzen-ui/ui/app-shell";
import { Command, CommandPaletteShell } from "@kantzen-ui/ui/command-palette";
import { ForceGraphCanvas } from "@kantzen-ui/ui/graph";
import type { CatalogItem } from "./component-catalog";

interface ComponentPreviewProps {
  item: CatalogItem;
}

const listItems = [
  { id: "design", label: "Design system" },
  { id: "workspace", label: "Workspace app" },
  { id: "public", label: "Public site" },
];

const graphNodes = [
  { id: "system", label: "System", x: 0, y: 0 },
  { id: "theme", label: "Theme", x: -120, y: -70 },
  { id: "components", label: "Components", x: 125, y: -65 },
  { id: "shell", label: "Shell", x: 0, y: 120 },
];

const graphEdges = [
  { id: "system-theme", source: "system", target: "theme" },
  { id: "system-components", source: "system", target: "components" },
  { id: "system-shell", source: "system", target: "shell" },
];

const workspaceNav = [
  {
    label: "Workspace",
    items: [
      { href: "/components", icon: "grid-view" as const, label: "Overview" },
      {
        href: "/components/activity",
        icon: "pulse" as const,
        label: "Activity",
      },
      {
        href: "/components/settings",
        icon: "settings" as const,
        label: "Settings",
      },
    ],
  },
];

function LabelledSample({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="wiki-labelled-sample">
      <span>{label}</span>
      {children}
    </div>
  );
}

function ShellDiagram({ active = "CONTENT" }: { active?: string }) {
  return (
    <div className="wiki-shell-diagram" aria-label={`${active} shell anatomy`}>
      <div>BRAND</div>
      <div>NAVBAR</div>
      <div>SIDEBAR</div>
      <strong>{active}</strong>
      <div>UTILITY SLOT</div>
    </div>
  );
}

export function ComponentPreview({ item }: ComponentPreviewProps) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [controlValue, setControlValue] = useState("preview");
  const [filter, setFilter] = useState("all");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState("design");
  const [selectedNode, setSelectedNode] = useState<string | null>("system");
  const [tab, setTab] = useState("overview");

  const openContextMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      showContextMenu({
        content: (
          <Menu>
            <MenuItem icon="duplicate" text="Duplicate" />
            <MenuItem icon="edit" text="Rename" />
            <MenuDivider />
            <MenuItem icon="trash" intent="danger" text="Delete" />
          </Menu>
        ),
        targetOffset: { left: event.clientX, top: event.clientY },
      });
    },
    [],
  );

  switch (item.exportName) {
    case "Button":
      return (
        <div className="wiki-preview-row wiki-preview-row--buttons">
          <LabelledSample label="Primary">
            <Button large intent="primary" text="Button" />
          </LabelledSample>
          <LabelledSample label="Secondary">
            <Button large outlined text="Button" />
          </LabelledSample>
          <LabelledSample label="Minimal">
            <Button large minimal text="Button" />
          </LabelledSample>
          <LabelledSample label="Danger">
            <Button large intent="danger" text="Button" />
          </LabelledSample>
          <LabelledSample label="Disabled">
            <Button disabled large text="Button" />
          </LabelledSample>
        </div>
      );
    case "Card":
      return (
        <div className="wiki-preview-row">
          <Card>
            <strong>Default card</strong>
            <p>Related content, without unnecessary decoration.</p>
          </Card>
          <Card elevation={2} interactive>
            <strong>Interactive card</strong>
            <p>Hover to see the active surface treatment.</p>
          </Card>
          <Card selected>
            <strong>Selected card</strong>
            <p>A clear current-state treatment.</p>
          </Card>
        </div>
      );
    case "InputGroup":
      return (
        <div className="wiki-preview-stack wiki-preview-narrow">
          <InputGroup fill leftIcon="search" placeholder="Search projects…" />
          <InputGroup
            fill
            leftIcon="link"
            placeholder="Paste a URL"
            rightElement={<Button minimal icon="arrow-right" />}
          />
          <InputGroup disabled fill placeholder="Disabled input" />
        </div>
      );
    case "Alert":
      return (
        <>
          <Button
            intent="danger"
            icon="trash"
            text="Delete project"
            onClick={() => setAlertOpen(true)}
          />
          <Alert
            canEscapeKeyCancel
            canOutsideClickCancel
            cancelButtonText="Cancel"
            confirmButtonText="Delete"
            icon="trash"
            intent="danger"
            isOpen={alertOpen}
            onClose={() => setAlertOpen(false)}
          >
            <h3>Delete project?</h3>
            <p>This action cannot be undone.</p>
          </Alert>
        </>
      );
    case "Menu":
      return (
        <Menu className="wiki-demo-menu">
          <MenuDivider title="Project" />
          <MenuItem icon="document-open" text="Open" labelElement="⌘O" />
          <MenuItem icon="duplicate" text="Duplicate" />
          <MenuItem icon="share" text="Share" />
          <MenuDivider />
          <MenuItem icon="trash" intent="danger" text="Delete" />
        </Menu>
      );
    case "Popover":
      return (
        <Popover
          content={
            <div className="wiki-popover-content">
              <strong>Deployment ready</strong>
              <p>All checks passed in production.</p>
            </div>
          }
        >
          <Button rightIcon="caret-down" text="Open popover" />
        </Popover>
      );
    case "showContextMenu":
      return (
        <button
          className="wiki-context-target"
          type="button"
          onClick={openContextMenu}
          onContextMenu={openContextMenu}
        >
          <Icon icon="select" size={22} />
          <strong>Right-click this surface</strong>
          <span>or click to open the context menu</span>
        </button>
      );
    case "Navbar":
      return (
        <Navbar className="wiki-demo-navbar">
          <NavbarGroup>
            <strong>KANTZEN</strong>
            <Button minimal text="Projects" />
            <Button minimal text="Activity" />
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <Button minimal icon="search" />
            <Button intent="primary" text="New project" />
          </NavbarGroup>
        </Navbar>
      );
    case "Tag":
      return (
        <div className="wiki-preview-row">
          <Tag>Default</Tag>
          <Tag minimal>Minimal</Tag>
          <Tag className="wiki-tag-success">Ready</Tag>
        </div>
      );
    case "NonIdealState":
      return (
        <NonIdealState
          action={<Button intent="primary" text="Create project" />}
          description="Create a project to start organizing your work."
          icon="folder-new"
          title="No projects yet"
        />
      );
    case "Tabs":
      return (
        <Tabs
          ariaLabel="Example tabs"
          items={[
            { id: "overview", label: "Overview" },
            { id: "activity", label: "Activity" },
            { id: "settings", label: "Settings" },
          ]}
          onChange={setTab}
          value={tab}
        />
      );
    case "SegmentedControl":
      return (
        <SegmentedControl
          ariaLabel="Preview mode"
          items={[
            { icon: "eye-open", label: "Preview", value: "preview" },
            { icon: "code", label: "Code", value: "code" },
            { icon: "document", label: "Docs", value: "docs" },
          ]}
          onChange={setControlValue}
          value={controlValue}
          variant="joined"
        />
      );
    case "SearchField":
      return (
        <div className="wiki-preview-narrow">
          <SearchField
            onChange={setQuery}
            placeholder="Search components…"
            value={query}
          />
        </div>
      );
    case "ExpandableSearchField":
      return (
        <div className="wiki-preview-narrow">
          <ExpandableSearchField
            onChange={setQuery}
            placeholder="Filter components"
            value={query}
          />
        </div>
      );
    case "FilterPill":
      return (
        <div className="wiki-preview-row">
          {[
            ["all", "All", 18],
            ["ready", "Ready", 12],
            ["review", "In review", 6],
          ].map(([value, label, count]) => (
            <FilterPill
              active={filter === value}
              count={Number(count)}
              key={value}
              label={String(label)}
              onSelect={setFilter}
              value={String(value)}
            />
          ))}
        </div>
      );
    case "SelectableList":
      return (
        <SelectableList
          ariaLabel="Example projects"
          className="component-gallery-list wiki-demo-list"
          empty={<span>No results</span>}
          items={listItems}
          onSelect={(entry) => setSelectedItem(entry.id)}
          renderItem={(entry) => entry.label}
          selectedId={selectedItem}
        />
      );
    case "StatusLed":
      return (
        <div className="wiki-preview-row">
          <LabelledSample label="Online">
            <span className="wiki-status">
              <StatusLed status="online" />
              Running
            </span>
          </LabelledSample>
          <LabelledSample label="Warning">
            <span className="wiki-status">
              <StatusLed status="warning" />
              Queued
            </span>
          </LabelledSample>
          <LabelledSample label="Offline">
            <span className="wiki-status">
              <StatusLed status="offline" />
              Failed
            </span>
          </LabelledSample>
        </div>
      );
    case "EmptyState":
      return (
        <EmptyState
          description="Try adjusting your filters or create a new item."
          icon="search"
          title="No matching components"
        />
      );
    case "DemoFrame":
      return (
        <DemoFrame
          actions={<Button minimal icon="more" />}
          eyebrow="LIVE EXAMPLE"
          footer="Keyboard accessible"
          title="Deployment status"
        >
          <div className="wiki-demo-content">
            <StatusLed status="online" />
            <strong>All systems operational</strong>
          </div>
        </DemoFrame>
      );
    case "WorkspaceToolbar":
      return (
        <WorkspaceToolbar>
          <Button minimal icon="select" text="Select" />
          <Button minimal icon="hand" text="Pan" />
          <span className="wiki-toolbar-spacer" />
          <Button icon="plus" intent="primary" text="Add node" />
        </WorkspaceToolbar>
      );
    case "WorkspaceBottomToolbar":
      return (
        <WorkspaceBottomToolbar>
          <span className="mono-data">x: 1284.22&nbsp;&nbsp; y: 842.11</span>
          <span className="wiki-toolbar-spacer" />
          <Button minimal icon="zoom-out" />
          <span>100%</span>
          <Button minimal icon="zoom-in" />
        </WorkspaceBottomToolbar>
      );
    case "InspectorWorkspace":
      return (
        <InspectorWorkspace
          ariaLabel="Node inspector"
          className="wiki-inspector"
        >
          <header>NODE INSPECTOR</header>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>API service</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusLed status="online" /> Online
              </dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>eu-central-1</dd>
            </div>
          </dl>
        </InspectorWorkspace>
      );
    case "SiteHero":
      return (
        <SiteHero
          className="wiki-site-component"
          actions={<Button intent="primary" text="Explore components" />}
          description="A focused React system for expressive sites and dense workspaces."
          title="Build interfaces with a point of view."
        />
      );
    case "SiteSection":
      return (
        <SiteSection
          className="wiki-site-component"
          description="Consistent spacing, hierarchy, and action placement."
          title="A section with structure"
        >
          <p>Section content stays deliberately open and composable.</p>
        </SiteSection>
      );
    case "SiteGrid":
      return (
        <SiteGrid className="wiki-demo-site-grid" minColumnWidth="140px">
          {["Tokens", "Components", "Patterns"].map((label) => (
            <Card key={label}>{label}</Card>
          ))}
        </SiteGrid>
      );
    case "FeatureGrid":
      return (
        <FeatureGrid
          className="wiki-site-component"
          features={[
            {
              icon: "cube",
              meta: "01",
              title: "Composable",
              description: "Small parts with clear ownership.",
            },
            {
              icon: "flash",
              meta: "02",
              title: "Responsive",
              description: "Layouts that adapt deliberately.",
            },
          ]}
        />
      );
    case "MetricStrip":
      return (
        <MetricStrip
          className="wiki-site-component"
          metrics={[
            {
              label: "Components",
              value: "38",
              description: "Public surfaces",
            },
            {
              label: "Packages",
              value: "01",
              description: "One coherent system",
            },
            { label: "Theme", value: "Dark", description: "High contrast" },
          ]}
        />
      );
    case "CtaBar":
      return (
        <CtaBar
          className="wiki-site-component"
          actions={<Button rightIcon="arrow-right" text="Get started" />}
          description="Use the same system from landing page to workspace."
          title="Build the complete product."
        />
      );
    case "SiteNavbar":
      return (
        <SiteNavbar
          className="wiki-site-component"
          currentPath="/components"
          productName="Kantzen"
          navItems={[
            { href: "/product", label: "Product" },
            { href: "/components", label: "Components" },
            { href: "/docs", label: "Docs" },
          ]}
          actions={[
            { href: "/components", label: "Get started", intent: "primary" },
          ]}
          onNavigate={() => undefined}
        />
      );
    case "SiteFooter":
      return (
        <SiteFooter
          className="wiki-site-component"
          productName="Kantzen"
          groups={[
            {
              label: "Product",
              items: [
                { href: "#components", label: "Components" },
                { href: "#patterns", label: "Patterns" },
              ],
            },
            {
              label: "Resources",
              items: [
                { href: "#docs", label: "Documentation" },
                { href: "#github", label: "GitHub" },
              ],
            },
          ]}
        />
      );
    case "SiteShell":
      return (
        <div className="wiki-shell-preview">
          <SiteShell
            className="wiki-site-component"
            productName="Kantzen"
            navItems={[{ href: "/components", label: "Components" }]}
            currentPath="/components"
          >
            <div className="wiki-shell-page">PUBLIC PAGE CONTENT</div>
          </SiteShell>
        </div>
      );
    case "WorkspaceNavbar":
      return (
        <WorkspaceNavbar
          className="wiki-demo-workspace-navbar"
          left={
            <>
              <Button minimal icon="menu" />
              <strong>Projects</strong>
            </>
          }
          right={
            <>
              <Button minimal icon="search" />
              <Button intent="primary" text="New project" />
            </>
          }
        />
      );
    case "WorkspaceSidebar":
      return (
        <div className="wiki-sidebar-preview">
          <WorkspaceSidebar
            currentPath="/components"
            navGroups={workspaceNav}
            onNavigate={() => undefined}
            productName="Kantzen"
            version="0.1.0"
          />
        </div>
      );
    case "WorkspaceShell":
      return <ShellDiagram active="WORKSPACE CONTENT" />;
    case "WorkspacePortal":
      return <ShellDiagram active="NAMED PORTAL SLOTS" />;
    case "ErrorBoundary":
      return (
        <ErrorBoundary>
          <div className="wiki-boundary-ok">
            <Icon icon="confirm" size={24} />
            <strong>Feature mounted safely</strong>
            <span>Errors stay contained inside this boundary.</span>
          </div>
        </ErrorBoundary>
      );
    case "CommandPaletteShell":
      return (
        <>
          <Button
            icon="console"
            text="Open command palette"
            onClick={() => setPaletteOpen(true)}
          />
          <CommandPaletteShell open={paletteOpen} onOpenChange={setPaletteOpen}>
            <Command.Group heading="Navigation">
              <Command.Item>Browse components</Command.Item>
              <Command.Item>Open workspace</Command.Item>
              <Command.Item>View graph demo</Command.Item>
            </Command.Group>
          </CommandPaletteShell>
        </>
      );
    case "ForceGraphCanvas":
      return (
        <div className="wiki-graph-preview">
          <ForceGraphCanvas
            ariaLabel="Kantzen package graph"
            edges={graphEdges}
            getInitialPosition={(node) => ({ x: node.x ?? 0, y: node.y ?? 0 })}
            nodes={graphNodes}
            onSelectNode={setSelectedNode}
            running={false}
            selectedNodeId={selectedNode}
          />
        </div>
      );
    default:
      return <ShellDiagram active={item.exportName.toUpperCase()} />;
  }
}
