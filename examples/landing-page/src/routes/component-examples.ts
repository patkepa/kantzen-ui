import type { CatalogItem, ComponentCategory } from "./component-catalog";

interface ExampleTemplate {
  body: string;
  imports?: readonly string[];
  reactImports?: readonly string[];
  setup?: string;
}

const importSourceByCategory: Record<ComponentCategory, string> = {
  "App shell": "@kantzen-ui/ui/app-shell",
  Command: "@kantzen-ui/ui/command-palette",
  Components: "@kantzen-ui/ui",
  Graph: "@kantzen-ui/ui/graph",
  Primitives: "@kantzen-ui/ui",
  Site: "@kantzen-ui/ui",
};

const importSourceByExport: Record<string, string> = {
  SiteFooter: "@kantzen-ui/ui/app-shell",
  SiteNavbar: "@kantzen-ui/ui/app-shell",
  SiteShell: "@kantzen-ui/ui/app-shell",
};

const templates: Record<string, ExampleTemplate> = {
  Button: { body: '<Button intent="primary" text="Save changes" />' },
  Card: { body: "<Card>Project status</Card>" },
  InputGroup: {
    body: '<InputGroup fill leftIcon="search" placeholder="Search projects…" />',
  },
  Alert: {
    reactImports: ["useState"],
    imports: ["Button"],
    setup: "  const [open, setOpen] = useState(false);\n",
    body: `<>
      <Button intent="danger" onClick={() => setOpen(true)} text="Delete" />
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        intent="danger"
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        Delete this project?
      </Alert>
    </>`,
  },
  Menu: {
    imports: ["MenuItem"],
    body: `<Menu>
      <MenuItem icon="document-open" text="Open" />
      <MenuItem icon="trash" intent="danger" text="Delete" />
    </Menu>`,
  },
  Popover: {
    imports: ["Button"],
    body: `<Popover content={<div>Deployment ready</div>}>
      <Button text="Open status" />
    </Popover>`,
  },
  showContextMenu: {
    imports: ["Button", "Menu", "MenuItem"],
    body: `<Button
      text="Open menu"
      onClick={(event) =>
        showContextMenu({
          content: <Menu><MenuItem text="Rename" /></Menu>,
          targetOffset: { left: event.clientX, top: event.clientY },
        })
      }
    />`,
  },
  Navbar: {
    imports: ["NavbarGroup", "Button"],
    body: `<Navbar>
      <NavbarGroup><strong>Kantzen</strong></NavbarGroup>
      <NavbarGroup><Button minimal icon="search" /></NavbarGroup>
    </Navbar>`,
  },
  Tag: { body: "<Tag>Ready</Tag>" },
  NonIdealState: {
    imports: ["Button"],
    body: `<NonIdealState
      action={<Button intent="primary" text="Create project" />}
      description="Create a project to begin."
      icon="folder-new"
      title="No projects yet"
    />`,
  },
  Tabs: {
    reactImports: ["useState"],
    setup: '  const [tab, setTab] = useState("overview");\n',
    body: `<Tabs
      ariaLabel="Project views"
      items={[{ id: "overview", label: "Overview" }, { id: "activity", label: "Activity" }]}
      onChange={setTab}
      value={tab}
    />`,
  },
  SegmentedControl: {
    reactImports: ["useState"],
    setup: '  const [mode, setMode] = useState("preview");\n',
    body: `<SegmentedControl
      ariaLabel="View mode"
      items={[{ label: "Preview", value: "preview" }, { label: "Code", value: "code" }]}
      onChange={setMode}
      value={mode}
    />`,
  },
  SearchField: {
    reactImports: ["useState"],
    setup: '  const [query, setQuery] = useState("");\n',
    body: "<SearchField onChange={setQuery} value={query} />",
  },
  ExpandableSearchField: {
    reactImports: ["useState"],
    setup: '  const [query, setQuery] = useState("");\n',
    body: "<ExpandableSearchField onChange={setQuery} value={query} />",
  },
  FilterPill: {
    reactImports: ["useState"],
    setup: '  const [filter, setFilter] = useState("all");\n',
    body: `<FilterPill
      active={filter === "all"}
      count={18}
      label="All"
      onSelect={setFilter}
      value="all"
    />`,
  },
  SelectableList: {
    reactImports: ["useState"],
    setup:
      '  const [selectedId, setSelectedId] = useState<string | null>("design");\n  const items = [{ id: "design", label: "Design system" }, { id: "site", label: "Public site" }];\n',
    body: `<SelectableList
      ariaLabel="Projects"
      empty="No projects"
      items={items}
      onSelect={(item) => setSelectedId(item.id)}
      renderItem={(item) => item.label}
      selectedId={selectedId}
    />`,
  },
  StatusLed: { body: '<StatusLed status="online" />' },
  EmptyState: {
    body: '<EmptyState description="Adjust your filters." icon="search" title="No results" />',
  },
  DemoFrame: {
    body: '<DemoFrame title="Live example">Example content</DemoFrame>',
  },
  WorkspaceToolbar: {
    imports: ["Button"],
    body: '<WorkspaceToolbar><Button minimal icon="select" text="Select" /></WorkspaceToolbar>',
  },
  WorkspaceBottomToolbar: {
    imports: ["Button"],
    body: '<WorkspaceBottomToolbar><Button minimal icon="zoom-in" />100%</WorkspaceBottomToolbar>',
  },
  InspectorWorkspace: {
    body: '<InspectorWorkspace ariaLabel="Node inspector">Inspector content</InspectorWorkspace>',
  },
  SiteHero: {
    imports: ["Button"],
    body: '<SiteHero actions={<Button text="Get started" />} description="A focused UI system." title="Build with precision." />',
  },
  SiteSection: {
    body: '<SiteSection title="Components">Section content</SiteSection>',
  },
  SiteGrid: {
    imports: ["Card"],
    body: '<SiteGrid minColumnWidth="180px"><Card>One</Card><Card>Two</Card></SiteGrid>',
  },
  FeatureGrid: {
    body: `<FeatureGrid features={[
      { icon: "cube", title: "Composable", description: "Small parts, clear ownership." },
      { icon: "flash", title: "Responsive", description: "Layouts adapt deliberately." },
    ]} />`,
  },
  MetricStrip: {
    body: '<MetricStrip metrics={[{ label: "Components", value: "38", description: "Public surfaces" }]} />',
  },
  CtaBar: {
    imports: ["Button"],
    body: '<CtaBar actions={<Button text="Get started" />} description="Use one coherent system." title="Build the product." />',
  },
  SiteNavbar: {
    body: '<SiteNavbar currentPath="/components" navItems={[{ href: "/components", label: "Components" }]} productName="Kantzen" />',
  },
  SiteFooter: {
    body: '<SiteFooter groups={[{ label: "Product", items: [{ href: "/components", label: "Components" }] }]} productName="Kantzen" />',
  },
  SiteShell: {
    body: '<SiteShell productName="Kantzen"><main>Page content</main></SiteShell>',
  },
  WorkspaceNavbar: {
    body: "<WorkspaceNavbar left={<strong>Projects</strong>} right={<span>New project</span>} />",
  },
  WorkspaceSidebar: {
    body: '<WorkspaceSidebar navGroups={[{ label: "Workspace", items: [{ href: "/", icon: "home", label: "Home" }] }]} productName="Kantzen" />',
  },
  WorkspaceShell: {
    reactImports: ["useState"],
    setup: "  const [collapsed, setCollapsed] = useState(false);\n",
    body: `<WorkspaceShell
      navGroups={[]}
      onToggleSidebar={() => setCollapsed((value) => !value)}
      productName="Kantzen"
      sidebarCollapsed={collapsed}
    >
      Workspace content
    </WorkspaceShell>`,
  },
  WorkspacePortal: {
    body: '<WorkspacePortal slot="navbar-end">Portaled action</WorkspacePortal>',
  },
  ErrorBoundary: {
    body: '<ErrorBoundary action="reset">Protected feature</ErrorBoundary>',
  },
  CommandPaletteShell: {
    reactImports: ["useState"],
    imports: ["Command"],
    setup: "  const [open, setOpen] = useState(false);\n",
    body: `<CommandPaletteShell open={open} onOpenChange={setOpen}>
      <Command.Item onSelect={() => setOpen(false)}>Open workspace</Command.Item>
    </CommandPaletteShell>`,
  },
  ForceGraphCanvas: {
    body: '<ForceGraphCanvas nodes={[{ id: "system", label: "System" }]} edges={[]} />',
  },
};

export function getComponentExample(item: CatalogItem) {
  const template = templates[item.exportName];
  if (!template) {
    throw new Error(`Missing component example for ${item.exportName}`);
  }
  const componentImports = Array.from(
    new Set([item.exportName, ...(template.imports ?? [])]),
  ).join(", ");
  const reactImport = template.reactImports?.length
    ? `import { ${template.reactImports.join(", ")} } from "react";\n`
    : "";
  const source =
    importSourceByExport[item.exportName] ??
    importSourceByCategory[item.category];

  return `${reactImport}import { ${componentImports} } from "${source}";\n\nexport function Example() {\n${template.setup ?? ""}  return (\n    ${template.body.replaceAll("\n", "\n    ")}\n  );\n}`;
}
