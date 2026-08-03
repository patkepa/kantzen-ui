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
  WorkspacePortal,
  WorkspaceSidebar,
  WorkspaceShell,
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

function FaultyDemo({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Preview failure requested");
  return (
    <div className="wiki-boundary-ok">
      <Icon icon="confirm" size={24} />
      <strong>Feature mounted safely</strong>
      <span>Trigger a failure to inspect the recovery state.</span>
    </div>
  );
}

export function ComponentPreview({ item }: ComponentPreviewProps) {
  const [activeCard, setActiveCard] = useState("selected");
  const [alertOpen, setAlertOpen] = useState(false);
  const [controlValue, setControlValue] = useState("preview");
  const [createdProjects, setCreatedProjects] = useState(0);
  const [demoFrameExpanded, setDemoFrameExpanded] = useState(false);
  const [feedback, setFeedback] = useState(`${item.name} ready`);
  const [faultyPreview, setFaultyPreview] = useState(false);
  const [filter, setFilter] = useState("all");
  const [inputValue, setInputValue] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sitePath, setSitePath] = useState("/components");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedItem, setSelectedItem] = useState("design");
  const [selectedNode, setSelectedNode] = useState<string | null>("system");
  const [tab, setTab] = useState("overview");
  const [tool, setTool] = useState("Select");
  const [zoom, setZoom] = useState(100);

  const openContextMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      showContextMenu({
        content: (
          <Menu>
            <MenuItem
              icon="duplicate"
              text="Duplicate"
              onClick={() => setFeedback("Surface duplicated")}
            />
            <MenuItem
              icon="edit"
              text="Rename"
              onClick={() => setFeedback("Rename action selected")}
            />
            <MenuDivider />
            <MenuItem
              icon="trash"
              intent="danger"
              text="Delete"
              onClick={() => setFeedback("Delete action selected")}
            />
          </Menu>
        ),
        targetOffset: { left: event.clientX, top: event.clientY },
      });
    },
    [],
  );

  const renderPreview = () => {
    switch (item.exportName) {
    case "Button":
      return (
        <div className="wiki-preview-row wiki-preview-row--buttons">
          <LabelledSample label="Primary">
            <Button
              large
              intent="primary"
              text="Button"
              onClick={() => setFeedback("Primary action pressed")}
            />
          </LabelledSample>
          <LabelledSample label="Secondary">
            <Button
              large
              outlined
              text="Button"
              onClick={() => setFeedback("Secondary action pressed")}
            />
          </LabelledSample>
          <LabelledSample label="Minimal">
            <Button
              large
              minimal
              text="Button"
              onClick={() => setFeedback("Minimal action pressed")}
            />
          </LabelledSample>
          <LabelledSample label="Danger">
            <Button
              large
              intent="danger"
              text="Button"
              onClick={() => setFeedback("Danger action pressed")}
            />
          </LabelledSample>
          <LabelledSample label="Disabled">
            <Button disabled large text="Button" />
          </LabelledSample>
        </div>
      );
    case "Card":
      return (
        <div className="wiki-preview-row">
          <Card
            interactive
            onClick={() => {
              setActiveCard("default");
              setFeedback("Default card selected");
            }}
            selected={activeCard === "default"}
          >
            <strong>Default card</strong>
            <p>Related content, without unnecessary decoration.</p>
          </Card>
          <Card
            elevation={2}
            interactive
            onClick={() => {
              setActiveCard("interactive");
              setFeedback("Interactive card selected");
            }}
            selected={activeCard === "interactive"}
          >
            <strong>Interactive card</strong>
            <p>Hover to see the active surface treatment.</p>
          </Card>
          <Card
            interactive
            onClick={() => {
              setActiveCard("selected");
              setFeedback("Selected card selected");
            }}
            selected={activeCard === "selected"}
          >
            <strong>Selected card</strong>
            <p>A clear current-state treatment.</p>
          </Card>
        </div>
      );
    case "InputGroup":
      return (
        <div className="wiki-preview-stack wiki-preview-narrow">
          <InputGroup
            fill
            leftIcon="search"
            onChange={(event) => {
              setInputValue(event.target.value);
              setFeedback(
                event.target.value
                  ? `Searching for “${event.target.value}”`
                  : "Search cleared",
              );
            }}
            placeholder="Search projects…"
            value={inputValue}
          />
          <InputGroup
            fill
            leftIcon="link"
            placeholder="Paste a URL"
            rightElement={
              <Button
                aria-label="Submit URL"
                minimal
                icon="arrow-right"
                onClick={() => setFeedback("URL submitted")}
              />
            }
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
            onClose={(confirmed) => {
              setAlertOpen(false);
              setFeedback(
                confirmed ? "Project deleted" : "Deletion cancelled",
              );
            }}
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
          <MenuItem
            icon="document-open"
            text="Open"
            labelElement="⌘O"
            onClick={() => setFeedback("Project opened")}
          />
          <MenuItem
            icon="duplicate"
            text="Duplicate"
            onClick={() => setFeedback("Project duplicated")}
          />
          <MenuItem
            icon="share"
            text="Share"
            onClick={() => setFeedback("Share action selected")}
          />
          <MenuDivider />
          <MenuItem
            icon="trash"
            intent="danger"
            text="Delete"
            onClick={() => setFeedback("Delete action selected")}
          />
        </Menu>
      );
    case "Popover":
      return (
        <Popover
          content={
            <div className="wiki-popover-content">
              <strong>Deployment ready</strong>
              <p>All checks passed in production.</p>
              <Button
                fill
                intent="primary"
                text="Deploy"
                onClick={() => setFeedback("Deployment started")}
              />
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
            <Button
              active={sitePath === "/projects"}
              minimal
              text="Projects"
              onClick={() => {
                setSitePath("/projects");
                setFeedback("Projects view selected");
              }}
            />
            <Button
              active={sitePath === "/activity"}
              minimal
              text="Activity"
              onClick={() => {
                setSitePath("/activity");
                setFeedback("Activity view selected");
              }}
            />
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <Button
              aria-label="Search"
              minimal
              icon="search"
              onClick={() => setFeedback("Search opened")}
            />
            <Button
              intent="primary"
              text="New project"
              onClick={() => {
                setCreatedProjects((count) => count + 1);
                setFeedback("New project created");
              }}
            />
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
      return createdProjects > 0 ? (
        <div className="wiki-created-state">
          <Icon icon="folder-open" size={30} />
          <strong>Project created</strong>
          <span>Your empty state resolved successfully.</span>
        </div>
      ) : (
        <NonIdealState
          action={
            <Button
              intent="primary"
              text="Create project"
              onClick={() => {
                setCreatedProjects(1);
                setFeedback("Project created");
              }}
            />
          }
          description="Create a project to start organizing your work."
          icon="folder-new"
          title="No projects yet"
        />
      );
    case "Tabs":
      return (
        <div className="wiki-control-demo">
          <Tabs
            ariaLabel="Example tabs"
            items={[
              { id: "overview", label: "Overview" },
              { id: "activity", label: "Activity" },
              { id: "settings", label: "Settings" },
            ]}
            onChange={(value) => {
              setTab(value);
              setFeedback(`${value} tab selected`);
            }}
            value={tab}
          />
          <div className="wiki-control-panel" role="tabpanel">
            <span className="mono-data">{tab.toUpperCase()}</span>
            <strong>{tab[0]!.toUpperCase() + tab.slice(1)} panel</strong>
          </div>
        </div>
      );
    case "SegmentedControl":
      return (
        <div className="wiki-control-demo">
          <SegmentedControl
            ariaLabel="Preview mode"
            items={[
              { icon: "eye-open", label: "Preview", value: "preview" },
              { icon: "code", label: "Code", value: "code" },
              { icon: "document", label: "Docs", value: "docs" },
            ]}
            onChange={(value) => {
              setControlValue(value);
              setFeedback(`${value} mode selected`);
            }}
            value={controlValue}
            variant="joined"
          />
          <div className="wiki-mode-readout mono-data">
            MODE / {controlValue.toUpperCase()}
          </div>
        </div>
      );
    case "SearchField":
      return (
        <div className="wiki-preview-narrow">
          <SearchField
            onChange={(value) => {
              setQuery(value);
              setFeedback(
                value ? `Found ${Math.max(1, 8 - value.length)} matches` : "Search ready",
              );
            }}
            placeholder="Search components…"
            value={query}
          />
        </div>
      );
    case "ExpandableSearchField":
      return (
        <div className="wiki-preview-narrow">
          <ExpandableSearchField
            onChange={(value) => {
              setQuery(value);
              setFeedback(value ? `Filtering by “${value}”` : "Filter cleared");
            }}
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
              onSelect={(nextFilter) => {
                setFilter(nextFilter);
                setFeedback(`${String(label)} filter applied`);
              }}
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
          onSelect={(entry) => {
            setSelectedItem(entry.id);
            setFeedback(`${entry.label} selected`);
          }}
          renderItem={(entry) => (
            <>
              <Icon icon="cube" size={13} />
              <span>{entry.label}</span>
              <Icon icon="chevron-right" size={12} />
            </>
          )}
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
          actions={
            <Button
              aria-label="Toggle deployment details"
              active={demoFrameExpanded}
              minimal
              icon={demoFrameExpanded ? "chevron-up" : "more"}
              onClick={() => {
                setDemoFrameExpanded((expanded) => !expanded);
                setFeedback(
                  demoFrameExpanded ? "Details collapsed" : "Details expanded",
                );
              }}
            />
          }
          eyebrow="LIVE EXAMPLE"
          footer="Keyboard accessible"
          title="Deployment status"
        >
          <div className="wiki-demo-content">
            <StatusLed status="online" />
            <strong>All systems operational</strong>
            {demoFrameExpanded ? (
              <span className="mono-data">12 / 12 CHECKS PASSED</span>
            ) : null}
          </div>
        </DemoFrame>
      );
    case "WorkspaceToolbar":
      return (
        <WorkspaceToolbar>
          <Button
            active={tool === "Select"}
            minimal
            icon="select"
            text="Select"
            onClick={() => {
              setTool("Select");
              setFeedback("Select tool active");
            }}
          />
          <Button
            active={tool === "Pan"}
            minimal
            icon="hand"
            text="Pan"
            onClick={() => {
              setTool("Pan");
              setFeedback("Pan tool active");
            }}
          />
          <span className="wiki-toolbar-spacer" />
          <span className="wiki-toolbar-readout mono-data">{tool}</span>
          <Button
            icon="plus"
            intent="primary"
            text={`Add node${createdProjects ? ` · ${createdProjects}` : ""}`}
            onClick={() => {
              setCreatedProjects((count) => count + 1);
              setFeedback("Node added to workspace");
            }}
          />
        </WorkspaceToolbar>
      );
    case "WorkspaceBottomToolbar":
      return (
        <WorkspaceBottomToolbar>
          <span className="mono-data">x: 1284.22&nbsp;&nbsp; y: 842.11</span>
          <span className="wiki-toolbar-spacer" />
          <Button
            aria-label="Zoom out"
            minimal
            icon="zoom-out"
            onClick={() => {
              setZoom((value) => Math.max(25, value - 25));
              setFeedback("Zoom decreased");
            }}
          />
          <span className="mono-data">{zoom}%</span>
          <Button
            aria-label="Zoom in"
            minimal
            icon="zoom-in"
            onClick={() => {
              setZoom((value) => Math.min(200, value + 25));
              setFeedback("Zoom increased");
            }}
          />
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
          actions={
            <Button
              intent="primary"
              text="Explore components"
              onClick={() => setFeedback("Component explorer opened")}
            />
          }
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
          actions={
            <Button
              rightIcon="arrow-right"
              text="Get started"
              onClick={() => setFeedback("Getting-started flow opened")}
            />
          }
          description="Use the same system from landing page to workspace."
          title="Build the complete product."
        />
      );
    case "SiteNavbar":
      return (
        <SiteNavbar
          className="wiki-site-component"
          currentPath={sitePath}
          productName="Kantzen"
          navItems={[
            { href: "/product", label: "Product" },
            { href: "/components", label: "Components" },
            { href: "/docs", label: "Docs" },
          ]}
          actions={[
            { href: "/components", label: "Get started", intent: "primary" },
          ]}
          onNavigate={(href) => {
            setSitePath(href);
            setFeedback(`Navigated to ${href}`);
          }}
        />
      );
    case "SiteFooter":
      return (
        <SiteFooter
          className="wiki-site-component"
          productName="Kantzen"
          onNavigate={(href) => setFeedback(`Footer link selected: ${href}`)}
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
            actions={[
              { href: "/start", label: "Get started", intent: "primary" },
            ]}
            currentPath={sitePath}
            onNavigate={(href) => {
              setSitePath(href);
              setFeedback(`Shell navigated to ${href}`);
            }}
          >
            <div className="wiki-shell-page">
              PUBLIC PAGE CONTENT / {sitePath.toUpperCase()}
            </div>
          </SiteShell>
        </div>
      );
    case "WorkspaceNavbar":
      return (
        <WorkspaceNavbar
          className="wiki-demo-workspace-navbar"
          left={
            <>
              <Button
                aria-label="Toggle navigation"
                active={sidebarCollapsed}
                minimal
                icon="menu"
                onClick={() => {
                  setSidebarCollapsed((value) => !value);
                  setFeedback("Workspace navigation toggled");
                }}
              />
              <strong>Projects</strong>
            </>
          }
          right={
            <>
              <Button
                aria-label="Search projects"
                minimal
                icon="search"
                onClick={() => setFeedback("Workspace search opened")}
              />
              <Button
                intent="primary"
                text="New project"
                onClick={() => {
                  setCreatedProjects((count) => count + 1);
                  setFeedback("Workspace project created");
                }}
              />
            </>
          }
        />
      );
    case "WorkspaceSidebar":
      return (
        <div className="wiki-sidebar-preview">
          <WorkspaceSidebar
            currentPath={sitePath}
            isCollapsed={sidebarCollapsed}
            navGroups={workspaceNav}
            onExpandSidebar={() => setSidebarCollapsed((value) => !value)}
            onNavigate={(href) => {
              setSitePath(href);
              setFeedback(`Workspace navigated to ${href}`);
            }}
            productName="Kantzen"
            version="0.1.0"
          />
        </div>
      );
    case "WorkspaceShell":
      return (
        <div className="wiki-workspace-shell-preview">
          <WorkspaceShell
            breadcrumb="Project / Components"
            currentPath={sitePath}
            navGroups={workspaceNav}
            onNavigate={(href) => {
              setSitePath(href);
              setFeedback(`Shell navigated to ${href}`);
            }}
            onOpenCommandPalette={() => {
              setPaletteOpen(true);
              setFeedback("Command palette opened from shell");
            }}
            onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
            productName="Kantzen"
            sidebarCollapsed={sidebarCollapsed}
          >
            <div className="wiki-shell-workspace-content">
              <span className="mono-data">ACTIVE ROUTE</span>
              <strong>{sitePath}</strong>
            </div>
          </WorkspaceShell>
        </div>
      );
    case "WorkspacePortal":
      return (
        <div className="wiki-workspace-shell-preview">
          <WorkspaceShell
            breadcrumb="Portal slots"
            currentPath={sitePath}
            navGroups={workspaceNav}
            onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
            productName="Kantzen"
            sidebarCollapsed={sidebarCollapsed}
          >
            <WorkspacePortal slot="topbar">
              <div className="wiki-portal-slot mono-data">
                TOPBAR PORTAL / CONNECTED
              </div>
            </WorkspacePortal>
            <WorkspacePortal slot="navbar-end">
              <Button
                small
                intent="primary"
                text="Portaled action"
                onClick={() => setFeedback("Portaled navbar action pressed")}
              />
            </WorkspacePortal>
            <div className="wiki-shell-workspace-content">
              <span className="mono-data">NAMED SLOTS</span>
              <strong>Content remains in the main region.</strong>
            </div>
          </WorkspaceShell>
        </div>
      );
    case "ErrorBoundary":
      return (
        <div className="wiki-error-demo">
          <ErrorBoundary
            actionLabel="Recover preview"
            description="The requested preview failure stayed inside this frame."
            onError={() => queueMicrotask(() => setFaultyPreview(false))}
          >
            <FaultyDemo shouldThrow={faultyPreview} />
          </ErrorBoundary>
          {!faultyPreview ? (
            <Button
              intent="danger"
              text="Trigger preview error"
              onClick={() => {
                setFaultyPreview(true);
                setFeedback("Error contained by boundary");
              }}
            />
          ) : null}
        </div>
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
              {[
                "Browse components",
                "Open workspace",
                "View graph demo",
              ].map((command) => (
                <Command.Item
                  key={command}
                  onSelect={() => {
                    setFeedback(`${command} selected`);
                    setPaletteOpen(false);
                  }}
                >
                  {command}
                </Command.Item>
              ))}
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
            onSelectNode={(nodeId) => {
              setSelectedNode(nodeId);
              setFeedback(
                nodeId ? `${nodeId} node selected` : "Graph selection cleared",
              );
            }}
            running={false}
            selectedNodeId={selectedNode}
          />
        </div>
      );
    default:
      return <ShellDiagram active={item.exportName.toUpperCase()} />;
    }
  };

  return (
    <div className="wiki-preview-stage">
      <div className="wiki-preview-content">{renderPreview()}</div>
      <output className="wiki-demo-feedback" aria-live="polite">
        <span>STATE</span>
        {feedback}
      </output>
    </div>
  );
}
