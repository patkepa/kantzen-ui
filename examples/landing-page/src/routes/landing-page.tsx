import { useCallback, useState } from "react";
import { Button, Icon, SelectableList, StatusLed } from "@kantzen-ui/ui";
import { ForceGraphCanvas } from "@kantzen-ui/ui/graph";
import { HeroWorkspacePreview } from "./hero-workspace-preview.js";
import { BrandMark } from "./landing-brand-mark.js";
import { landingGraphEdges, landingGraphNodes } from "./landing-graph-data.js";
import "./landing-page.css";

export { BrandMark };

export interface LandingPageProps {
  onNavigate: (href: string) => void;
}

interface LandingHeaderProps extends LandingPageProps {
  activeItem?: "components" | "motivation" | "examples";
  isHome?: boolean;
}

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  icon: "application" | "cube" | "graph";
  href: string;
}

const installCommand = "npm install @kantzen-ui/ui";

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

const workspaceTableRows = [
  ["Kantzen redesign", "In progress", "Today"],
  ["Command system", "Ready", "Yesterday"],
  ["Graph canvas", "In review", "May 08"],
  ["Public site", "Planning", "May 06"],
] as const;

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

export function LandingHeader({
  activeItem,
  isHome = false,
  onNavigate,
}: LandingHeaderProps) {
  return (
    <header className="landing-header">
      <a
        className="landing-brand"
        href="/"
        aria-label="Kantzen UI home"
        onClick={(event) => {
          event.preventDefault();
          if (!isHome) onNavigate("/");
        }}
      >
        <BrandMark />
        <span>KANTZEN UI</span>
      </a>
      <nav className="landing-nav" aria-label="Landing page navigation">
        <button
          aria-current={activeItem === "components" ? "page" : undefined}
          type="button"
          onClick={() => onNavigate("/components")}
        >
          Components
        </button>
        <button
          aria-current={activeItem === "motivation" ? "page" : undefined}
          type="button"
          onClick={() => onNavigate("/motivation")}
        >
          Motivation
        </button>
        <button
          aria-current={activeItem === "examples" ? "page" : undefined}
          type="button"
          onClick={() => onNavigate("/examples")}
        >
          Examples
        </button>
      </nav>
    </header>
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
          <span className="landing-install-prompt" aria-hidden="true">
            ›
          </span>
          <code>{installCommand}</code>
          <span className="landing-install-action" aria-hidden="true">
            <Icon icon={copied ? "confirm" : "clipboard"} size={14} />
            <span>{copied ? "Copied" : "Copy"}</span>
          </span>
          <span className="sr-only" aria-live="polite">
            {copied ? "Install command copied" : "Copy install command"}
          </span>
        </button>
      </div>
      <HeroWorkspacePreview onNavigate={onNavigate} />
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
        edges={landingGraphEdges}
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
        nodes={landingGraphNodes}
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

export function CommandWorkbench({ onNavigate }: LandingPageProps) {
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
    <section className="landing-section landing-momentum" id="motivation">
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

export function LandingFooter() {
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
      <LandingHeader isHome onNavigate={onNavigate} />
      <main>
        <LandingHero onNavigate={onNavigate} />
        <SurfaceShowcase onNavigate={onNavigate} />
        <MomentumSection onNavigate={onNavigate} />
        <LandingCta onNavigate={onNavigate} />
      </main>
      <LandingFooter />
    </div>
  );
}
