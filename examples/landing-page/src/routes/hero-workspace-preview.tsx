import { useEffect, useState } from "react";
import { Icon, StatusLed } from "@patkepa/kantzen-ui";
import {
  ForceGraphCanvas,
  type ForceGraphEdge,
  type ForceGraphEdgeState,
  type ForceGraphNodeState,
} from "@patkepa/kantzen-ui/graph";
import { BrandMark } from "./landing-brand-mark.js";
import {
  landingGraphEdges,
  landingGraphNodes,
  type LandingGraphNode,
} from "./landing-graph-data.js";

export interface HeroWorkspacePreviewProps {
  onNavigate: (href: string) => void;
}

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

const workspaceNav = [
  { label: "Overview", icon: "grid-view" as const },
  { label: "Services", icon: "cube" as const },
  { label: "Runs", icon: "pulse" as const },
  { label: "Deployments", icon: "git-branch" as const },
  { label: "Graphs", icon: "graph" as const },
];

const workspaceEvents = [
  "api scaled to 6 pods",
  "deploy started by deploy.yml",
  "worker queued",
  "web rollout succeeded",
] as const;

const previewGraphDisplay = {
  arrows: false,
  labels: true,
  nodeSize: 1,
} as const;

const previewGraphForces = {
  center: 0.08,
  repel: 80,
  link: 0.16,
  distance: 145,
} as const;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function getPreviewInitialPosition(node: LandingGraphNode) {
  return { x: node.x ?? 0, y: node.y ?? 0 };
}

function getPreviewNodeStyle(
  node: LandingGraphNode,
  state: ForceGraphNodeState,
) {
  return {
    fill: state.focused || node.kind === "core" ? "#2e6dd7" : "#111111",
    stroke: state.focused ? "#78a7ff" : "#6d7480",
    strokeWidth: state.focused ? 2 : 1,
    shape: "square" as const,
  };
}

function getPreviewEdgeStyle(
  _edge: ForceGraphEdge,
  state: ForceGraphEdgeState,
) {
  return {
    stroke: state.focused ? "#5b8fdf" : "rgba(255,255,255,.28)",
    width: state.focused ? 1.5 : 1,
  };
}

function getPreviewLabelStyle() {
  return {
    color: "#d8dbe0",
    fontSize: 11,
    fontWeight: 560,
  };
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(reducedMotionQuery).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(reducedMotionQuery);
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener("change", updatePreference);
    updatePreference();
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

export function HeroWorkspacePreview({
  onNavigate,
}: HeroWorkspacePreviewProps) {
  const [activeRun, setActiveRun] = useState<string>(deploymentRows[0].id);
  const [selectedNode, setSelectedNode] = useState<string | null>("kantzen");
  const prefersReducedMotion = usePrefersReducedMotion();

  const activeDeployment = deploymentRows.find((row) => row.id === activeRun);

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
              <dd>{activeDeployment?.service}</dd>
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
          <div className="hero-graph-drift">
            <div className="hero-graph-motion">
              <ForceGraphCanvas
                ariaLabel="Interactive graph of Kantzen UI system capabilities"
                display={previewGraphDisplay}
                edges={landingGraphEdges}
                forces={previewGraphForces}
                getInitialPosition={getPreviewInitialPosition}
                getNodeStyle={getPreviewNodeStyle}
                getEdgeStyle={getPreviewEdgeStyle}
                getLabelStyle={getPreviewLabelStyle}
                nodes={landingGraphNodes}
                onSelectNode={setSelectedNode}
                running={!prefersReducedMotion}
                selectedNodeId={selectedNode}
              />
            </div>
          </div>
        </div>

        <div className="hero-event-pane">
          <div className="hero-pane-heading">
            <span>EVENTS</span>
            <span>View all</span>
          </div>
          {workspaceEvents.map((event, index) => (
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
