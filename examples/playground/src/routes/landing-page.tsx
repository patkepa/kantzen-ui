import { useCallback, useState } from "react";
import { Button, Icon, SelectableList, StatusLed } from "@kantzen-ui/ui";
import {
  ForceGraphCanvas,
  type ForceGraphEdge,
  type ForceGraphNode,
} from "@kantzen-ui/ui/graph";
import "./landing-page.css";

interface LandingPageProps {
  onNavigate: (href: string) => void;
}

interface GraphNode extends ForceGraphNode {
  kind: "core" | "service";
}

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  icon: "application" | "cube" | "graph";
  href: string;
}

const installCommand = "npm install @kantzen-ui/ui";

const deploymentRows = [
  { id: "run_2d7b9e11", service: "api", status: "online", time: "10:42:03" },
  { id: "run_8f3a1c7e", service: "ingest", status: "online", time: "10:42:18" },
  {
    id: "run_c91a2d4b",
    service: "worker",
    status: "warning",
    time: "10:41:55",
  },
  { id: "run_a4e2b6f9", service: "web", status: "online", time: "10:41:27" },
] as const;

const graphNodes: readonly GraphNode[] = [
  {
    id: "kantzen",
    label: "Kantzen system",
    kind: "core",
    x: 0,
    y: 0,
    radius: 15,
  },
  { id: "theme", label: "Theme", kind: "service", x: 0, y: -130, radius: 9 },
  {
    id: "components",
    label: "Components",
    kind: "service",
    x: 145,
    y: -56,
    radius: 9,
  },
  {
    id: "interactions",
    label: "Interactions",
    kind: "service",
    x: 122,
    y: 104,
    radius: 9,
  },
  { id: "graph", label: "Graph", kind: "service", x: -118, y: 104, radius: 9 },
  {
    id: "shells",
    label: "Shells",
    kind: "service",
    x: -145,
    y: -56,
    radius: 9,
  },
];

const graphEdges: readonly ForceGraphEdge[] = graphNodes
  .filter((node) => node.id !== "kantzen")
  .map((node) => ({
    id: `kantzen-${node.id}`,
    source: "kantzen",
    target: node.id,
  }));

const commandItems: readonly CommandItem[] = [
  {
    id: "workspace",
    label: "Open workspace",
    hint: "↵",
    icon: "application",
    href: "/workspace",
  },
  {
    id: "components",
    label: "Browse components",
    hint: "⌘ B",
    icon: "cube",
    href: "/components",
  },
  {
    id: "graph",
    label: "View graph demo",
    hint: "⌘ G",
    icon: "graph",
    href: "/components#graph",
  },
];

const workspaceNav = [
  { label: "Overview", icon: "grid-view" as const },
  { label: "Services", icon: "cube" as const },
  { label: "Runs", icon: "pulse" as const },
  { label: "Deployments", icon: "git-branch" as const },
  { label: "Graphs", icon: "graph" as const },
];

const workspaceTableRows = [
  ["Kantzen redesign", "In progress", "Today"],
  ["Command system", "Ready", "Yesterday"],
  ["Graph canvas", "In review", "May 08"],
  ["Public site", "Planning", "May 06"],
] as const;

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={["landing-brand-mark", compact && "is-compact"]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" role="presentation">
        <path d="M7 3v26M8 16 23 3M8 16l15 13M13 12l11-9M13 20l11 9" />
      </svg>
    </span>
  );
}

function ArrowLink({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}) {
  return (
    <button className="landing-arrow-link" type="button" onClick={onClick}>
      <span>{children}</span>
      <Icon icon="arrow-right" size={14} />
    </button>
  );
}

function LandingHeader({ onNavigate }: LandingPageProps) {
  return (
    <header className="landing-header">
      <a className="landing-brand" href="#top" aria-label="Kantzen UI home">
        <BrandMark />
        <span>KANTZEN UI</span>
      </a>
      <nav className="landing-nav" aria-label="Landing page navigation">
        <button type="button" onClick={() => onNavigate("/components")}>
          Components
        </button>
        <button type="button" onClick={() => onNavigate("/workspace")}>
          Workspace
        </button>
        <a href="#patterns">Patterns</a>
      </nav>
      <Button
        className="landing-header-action"
        intent="primary"
        rightIcon="arrow-right"
        text="Explore system"
        onClick={() => onNavigate("/components")}
      />
    </header>
  );
}

function HeroWorkspace({ onNavigate }: LandingPageProps) {
  const [activeRun, setActiveRun] = useState<string>(deploymentRows[0].id);
  const [selectedNode, setSelectedNode] = useState<string | null>("kantzen");

  return (
    <div
      className="hero-workspace"
      aria-label="Interactive Kantzen workspace preview"
    >
      <aside className="hero-workspace-sidebar">
        <BrandMark compact />
        <nav aria-label="Workspace preview navigation">
          {workspaceNav.map((item, index) => (
            <button
              className={index === 0 ? "is-active" : undefined}
              key={item.label}
              type="button"
            >
              <Icon icon={item.icon} size={14} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          className="hero-workspace-user"
          type="button"
          onClick={() => onNavigate("/workspace")}
        >
          <span>AK</span>
          <span>
            Alex Kim<small>alex@kantzen.dev</small>
          </span>
        </button>
      </aside>

      <div className="hero-workspace-main">
        <button
          className="hero-command-bar"
          type="button"
          onClick={() => onNavigate("/components")}
        >
          <Icon icon="console" size={14} />
          <span>Type a command or search…</span>
          <kbd>⌘ K</kbd>
        </button>

        <div className="hero-runs">
          <div className="hero-pane-heading">
            <span>ACTIVE RUNS</span>
            <button type="button" onClick={() => onNavigate("/workspace")}>
              View all runs <Icon icon="arrow-right" size={12} />
            </button>
          </div>
          <div className="hero-run-header">
            <span>Run</span>
            <span>Service</span>
            <span>Status</span>
            <span>Updated</span>
          </div>
          {deploymentRows.map((row) => (
            <button
              className={["hero-run-row", activeRun === row.id && "is-selected"]
                .filter(Boolean)
                .join(" ")}
              key={row.id}
              type="button"
              onClick={() => setActiveRun(row.id)}
            >
              <span>{row.id}</span>
              <span>{row.service}</span>
              <span>
                <StatusLed status={row.status} />
                {row.status === "online" ? "Running" : "Queued"}
              </span>
              <span>{row.time}</span>
            </button>
          ))}
        </div>

        <aside className="hero-run-detail">
          <strong>{activeRun}</strong>
          <div className="hero-detail-tabs">
            <span className="is-active">Details</span>
            <span>Logs</span>
            <span>Events</span>
          </div>
          <dl>
            <div>
              <dt>Service</dt>
              <dd>
                {deploymentRows.find((row) => row.id === activeRun)?.service}
              </dd>
            </div>
            <div>
              <dt>Environment</dt>
              <dd>production</dd>
            </div>
            <div>
              <dt>Commit</dt>
              <dd>9c3d7e1</dd>
            </div>
            <div>
              <dt>Started</dt>
              <dd>2m 15s ago</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>iad-1</dd>
            </div>
          </dl>
        </aside>

        <div className="hero-graph-pane">
          <div className="hero-pane-heading">
            <span>SYSTEM GRAPH</span>
            <span>
              Live <StatusLed status="online" />
            </span>
          </div>
          <ForceGraphCanvas
            ariaLabel="Interactive graph of Kantzen UI system capabilities"
            display={{ arrows: false, labels: true, nodeSize: 1 }}
            edges={graphEdges}
            getInitialPosition={(node) => ({ x: node.x ?? 0, y: node.y ?? 0 })}
            getNodeStyle={(node) => ({
              fill:
                node.id === selectedNode || node.kind === "core"
                  ? "#2e6dd7"
                  : "#111111",
              stroke: node.id === selectedNode ? "#78a7ff" : "#6d7480",
              strokeWidth: node.id === selectedNode ? 2 : 1,
              shape: "square",
            })}
            getEdgeStyle={(_, state) => ({
              stroke: state.focused ? "#5b8fdf" : "rgba(255,255,255,.28)",
              width: state.focused ? 1.5 : 1,
            })}
            getLabelStyle={() => ({
              color: "#d8dbe0",
              fontSize: 11,
              fontWeight: 560,
            })}
            nodes={graphNodes}
            onSelectNode={setSelectedNode}
            running={false}
            selectedNodeId={selectedNode}
          />
        </div>

        <div className="hero-event-pane">
          <div className="hero-pane-heading">
            <span>EVENTS</span>
            <span>View all</span>
          </div>
          {[
            "api scaled to 6 pods",
            "deploy started by deploy.yml",
            "worker queued",
            "web rollout succeeded",
          ].map((event, index) => (
            <div className="hero-event" key={event}>
              <span>{`10:4${2 - index}:0${index + 2}`}</span>
              <span>{event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LandingHero({ onNavigate }: LandingPageProps) {
  const [copied, setCopied] = useState(false);

  const copyInstallCommand = useCallback(() => {
    void navigator.clipboard?.writeText(installCommand).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  }, []);

  return (
    <section className="landing-hero" id="top">
      <div className="landing-hero-copy">
        <h1>
          Build interfaces
          <br />
          with a point of view.
        </h1>
        <p>
          A focused React system for expressive sites, dense workspaces, and the
          interactions between them.
        </p>
        <div className="landing-hero-actions">
          <Button
            large
            intent="primary"
            rightIcon="arrow-right"
            text="Explore components"
            onClick={() => onNavigate("/components")}
          />
          <Button
            large
            outlined
            rightIcon="arrow-right"
            text="Open workspace"
            onClick={() => onNavigate("/workspace")}
          />
        </div>
        <button
          className="landing-install"
          type="button"
          onClick={copyInstallCommand}
        >
          <span aria-hidden="true">›</span>
          <code>{installCommand}</code>
          <Icon icon={copied ? "confirm" : "clipboard"} size={14} />
          <span className="sr-only" aria-live="polite">
            {copied ? "Install command copied" : "Copy install command"}
          </span>
        </button>
      </div>
      <HeroWorkspace onNavigate={onNavigate} />
      <div className="landing-hero-footnote" aria-hidden="true">
        <span />
        <span>DESIGNED FOR HOW YOU BUILD</span>
      </div>
    </section>
  );
}

function MiniSiteSurface({ onNavigate }: LandingPageProps) {
  return (
    <div className="surface-site">
      <div className="surface-mini-nav">
        <strong>KANTZEN</strong>
        <span>Product</span>
        <span>Docs</span>
        <i />
      </div>
      <div className="surface-site-body">
        <h3>Design systems for products that operate at scale.</h3>
        <p>Composable. Performant. Consistent.</p>
        <Button
          small
          intent="primary"
          rightIcon="arrow-right"
          text="Explore"
          onClick={() => onNavigate("/components")}
        />
        <svg
          className="surface-wireframe"
          viewBox="0 0 220 180"
          aria-hidden="true"
        >
          <path d="M28 80 110 24l82 56-82 56L28 80Zm0 0v34l82 52 82-52V80M110 24v112M69 52l82 56M151 52 69 108" />
        </svg>
      </div>
      <div className="surface-site-meta">
        <span>REACT FIRST</span>
        <span>THEMEABLE</span>
        <span>BUILT TO SCALE</span>
      </div>
    </div>
  );
}

function MiniWorkspaceSurface() {
  return (
    <div className="surface-workspace">
      <div className="surface-workspace-head">
        <strong>Projects</strong>
        <span>
          <Icon icon="search" size={12} /> Search projects…
        </span>
        <button type="button">+ New project</button>
      </div>
      <div className="surface-workspace-tabs">
        <span className="is-active">All projects</span>
        <span>Active</span>
        <span>Archived</span>
      </div>
      <div className="surface-workspace-table">
        <div className="is-header">
          <span>Name</span>
          <span>Status</span>
          <span>Updated</span>
        </div>
        {workspaceTableRows.map(([name, status, updated], index) => (
          <button type="button" key={name}>
            <span>
              <i className={index === 0 ? "is-checked" : undefined} />
              {name}
            </span>
            <span>
              <StatusLed status={index === 2 ? "warning" : "online"} />
              {status}
            </span>
            <span>{updated}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniGraphSurface() {
  const [selectedNode, setSelectedNode] = useState<string | null>("kantzen");
  return (
    <div className="surface-graph">
      <div className="surface-graph-tools">
        <Icon icon="select" size={13} />
        <Icon icon="zoom-in" size={13} />
        <Icon icon="zoom-out" size={13} />
      </div>
      <ForceGraphCanvas
        ariaLabel="Interactive Kantzen UI package graph"
        display={{ arrows: false, labels: true, nodeSize: 1 }}
        edges={graphEdges}
        getInitialPosition={(node) => ({ x: node.x ?? 0, y: node.y ?? 0 })}
        getNodeStyle={(node) => ({
          fill:
            node.id === selectedNode || node.kind === "core"
              ? "#2e6dd7"
              : "#090909",
          stroke: node.id === selectedNode ? "#8bb4ff" : "#838891",
          strokeWidth: node.id === selectedNode ? 2 : 1,
          shape: "circle",
        })}
        getEdgeStyle={() => ({ stroke: "rgba(91,143,223,.7)", width: 1 })}
        getLabelStyle={() => ({
          color: "#f4f4f4",
          fontSize: 12,
          fontWeight: 600,
        })}
        nodes={graphNodes}
        onSelectNode={setSelectedNode}
        running={false}
        selectedNodeId={selectedNode}
      />
      <span className="surface-graph-zoom">100%</span>
    </div>
  );
}

function SurfaceShowcase({ onNavigate }: LandingPageProps) {
  return (
    <section className="landing-section landing-surfaces" id="surfaces">
      <div className="landing-section-copy">
        <span className="landing-section-label">
          ONE SYSTEM / EVERY SURFACE
        </span>
        <h2>
          Move from idea to interface
          <br />
          without changing languages.
        </h2>
        <p>
          Public pages, product workspaces, and complex interactions share the
          same tokens, ergonomics, and visual discipline.
        </p>
        <ArrowLink onClick={() => onNavigate("/components")}>
          See every component
        </ArrowLink>
      </div>

      <div className="surface-rail">
        <article>
          <header>
            <span>
              <b>01</b> / SITE
            </span>
            <strong>Tell the story.</strong>
          </header>
          <MiniSiteSurface onNavigate={onNavigate} />
        </article>
        <article>
          <header>
            <span>
              <b>02</b> / WORKSPACE
            </span>
            <strong>Run the work.</strong>
          </header>
          <MiniWorkspaceSurface />
        </article>
        <article>
          <header>
            <span>
              <b>03</b> / GRAPH
            </span>
            <strong>See the system.</strong>
          </header>
          <MiniGraphSurface />
        </article>
      </div>
    </section>
  );
}

function CommandWorkbench({ onNavigate }: LandingPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>("workspace");

  const selectCommand = useCallback((item: CommandItem) => {
    setSelectedId(item.id);
  }, []);

  const renderCommand = useCallback(
    (item: CommandItem) => (
      <>
        <Icon icon={item.icon} size={16} />
        <span>{item.label}</span>
        <kbd>{item.hint}</kbd>
      </>
    ),
    [],
  );

  return (
    <div className="momentum-workbench">
      <section className="workbench-command">
        <h3>Command menu</h3>
        <div className="workbench-command-input">
          <Icon icon="console" size={14} />
          <span>Jump to anything…</span>
        </div>
        <SelectableList
          ariaLabel="Landing page command menu preview"
          className="workbench-command-list"
          empty={null}
          items={commandItems}
          onSelect={selectCommand}
          renderItem={renderCommand}
          selectedId={selectedId}
        />
        <button
          className="workbench-open-command"
          type="button"
          onClick={() => {
            const selected = commandItems.find(
              (item) => item.id === selectedId,
            );
            if (selected) onNavigate(selected.href);
          }}
        >
          Open selected <Icon icon="arrow-right" size={13} />
        </button>
      </section>

      <section className="workbench-focus">
        <h3>Roving focus</h3>
        <div className="workbench-focus-list">
          {["Dashboard", "Components", "Patterns", "Data", "Settings"].map(
            (item, index) => (
              <button
                className={index === 1 ? "is-active" : undefined}
                type="button"
                key={item}
              >
                <span aria-hidden="true">⠿</span>
                <Icon icon={index === 4 ? "settings" : "cube"} size={14} />
                <span>{item}</span>
              </button>
            ),
          )}
        </div>
        <footer>Tab / Shift + Tab</footer>
      </section>

      <section className="workbench-responsive">
        <h3>Responsive shell</h3>
        <div className="responsive-devices">
          <div className="device-desktop">
            <i />
            <span />
            <span />
            <span />
            <b />
            <b />
          </div>
          <div className="device-tablet">
            <i />
            <span />
            <span />
            <b />
          </div>
          <div className="device-mobile">
            <i />
            <span />
            <span />
            <b />
          </div>
        </div>
        <footer>
          <span>md</span>
          <strong>lg</strong>
          <span>xl</span>
        </footer>
      </section>

      <section className="workbench-status">
        <h3>Status &amp; intent</h3>
        <div className="status-samples">
          <div>
            <StatusLed status="online" />
            <span>
              <strong>Success</strong>
              <small>Your changes have been saved.</small>
            </span>
          </div>
          <div>
            <StatusLed status="warning" />
            <span>
              <strong>Warning</strong>
              <small>Please review the changes.</small>
            </span>
          </div>
          <div>
            <StatusLed status="offline" />
            <span>
              <strong>Error</strong>
              <small>Something needs attention.</small>
            </span>
          </div>
        </div>
        <footer>
          <span>info</span>
          <span>success</span>
          <span>warning</span>
          <span>error</span>
        </footer>
      </section>
    </div>
  );
}

function MomentumSection({ onNavigate }: LandingPageProps) {
  return (
    <section className="landing-section landing-momentum" id="patterns">
      <div className="momentum-intro">
        <span className="landing-section-label">BUILT FOR MOMENTUM</span>
        <h2>
          The details are
          <br />
          already in
          <br />
          conversation.
        </h2>
        <p>
          Keyboard paths, focus states, command surfaces, responsive shells, and
          high-density views—designed to work together before your app has to.
        </p>
      </div>
      <CommandWorkbench onNavigate={onNavigate} />
    </section>
  );
}

function LandingCta({ onNavigate }: LandingPageProps) {
  return (
    <section className="landing-cta">
      <div className="landing-cta-mark" aria-hidden="true">
        <span />
        <span />
      </div>
      <h2>
        Ship something
        <br />
        unmistakable.
      </h2>
      <p>
        Start with a system that already knows how serious product work should
        feel.
      </p>
      <div className="landing-cta-actions">
        <Button
          large
          rightIcon="arrow-right"
          text="Explore components"
          onClick={() => onNavigate("/components")}
        />
        <a
          href="https://github.com/patkepa/kantzen-ui"
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub <Icon icon="share" size={14} />
        </a>
      </div>
    </section>
  );
}

function LandingFooter({ onNavigate }: LandingPageProps) {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-brand">
        <BrandMark />
        <div>
          <strong>KANTZEN UI</strong>
          <p>
            React interface system for products
            <br />
            with a point of view.
          </p>
        </div>
      </div>
      <nav aria-label="Footer navigation">
        <button type="button" onClick={() => onNavigate("/components")}>
          Components
        </button>
        <button type="button" onClick={() => onNavigate("/workspace")}>
          Workspace
        </button>
        <a href="#patterns">Patterns</a>
        <a
          href="https://github.com/patkepa/kantzen-ui"
          target="_blank"
          rel="noreferrer"
        >
          GitHub <Icon icon="share" size={12} />
        </a>
      </nav>
    </footer>
  );
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="landing-page">
      <LandingHeader onNavigate={onNavigate} />
      <main>
        <LandingHero onNavigate={onNavigate} />
        <SurfaceShowcase onNavigate={onNavigate} />
        <MomentumSection onNavigate={onNavigate} />
        <LandingCta onNavigate={onNavigate} />
      </main>
      <LandingFooter onNavigate={onNavigate} />
    </div>
  );
}
