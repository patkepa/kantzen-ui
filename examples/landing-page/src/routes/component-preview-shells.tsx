import { useState } from "react";
import { Button } from "@patkepa/kantzen-ui";
import {
  ErrorBoundary,
  WorkspaceNavbar,
  WorkspacePortal,
  WorkspaceShell,
  WorkspaceSidebar,
} from "@patkepa/kantzen-ui/app-shell";
import {
  Command,
  CommandPaletteShell,
} from "@patkepa/kantzen-ui/command-palette";
import { ForceGraphCanvas } from "@patkepa/kantzen-ui/graph";
import {
  componentPreviewGraphEdges,
  componentPreviewGraphNodes,
  componentPreviewWorkspaceNav,
  FaultyDemo,
} from "./component-preview-shared";
import type {
  ComponentDemoProps,
  ComponentDemoRegistry,
} from "./component-preview-types";

function WorkspaceNavbarDemo({ onFeedback }: ComponentDemoProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [createdProjects, setCreatedProjects] = useState(0);
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
              onFeedback("Workspace navigation toggled");
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
            onClick={() => onFeedback("Workspace search opened")}
          />
          <Button
            intent="primary"
            text={`New project${createdProjects ? ` · ${createdProjects}` : ""}`}
            onClick={() => {
              setCreatedProjects((count) => count + 1);
              onFeedback("Workspace project created");
            }}
          />
        </>
      }
    />
  );
}

function WorkspaceSidebarDemo({ onFeedback }: ComponentDemoProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sitePath, setSitePath] = useState("/components");
  return (
    <div className="wiki-sidebar-preview">
      <WorkspaceSidebar
        currentPath={sitePath}
        isCollapsed={sidebarCollapsed}
        navGroups={componentPreviewWorkspaceNav}
        onExpandSidebar={() => setSidebarCollapsed((value) => !value)}
        onNavigate={(href) => {
          setSitePath(href);
          onFeedback(`Workspace navigated to ${href}`);
        }}
        productName="Kantzen"
        version="0.1.0"
      />
    </div>
  );
}

function WorkspaceShellDemo({ onFeedback }: ComponentDemoProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sitePath, setSitePath] = useState("/components");
  return (
    <div className="wiki-workspace-shell-preview">
      <WorkspaceShell
        breadcrumb="Project / Components"
        currentPath={sitePath}
        navGroups={componentPreviewWorkspaceNav}
        onNavigate={(href) => {
          setSitePath(href);
          onFeedback(`Shell navigated to ${href}`);
        }}
        onOpenCommandPalette={() =>
          onFeedback("Command palette opened from shell")
        }
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
}

function WorkspacePortalDemo({ onFeedback }: ComponentDemoProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className="wiki-workspace-shell-preview">
      <WorkspaceShell
        breadcrumb="Portal slots"
        currentPath="/components"
        navGroups={componentPreviewWorkspaceNav}
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
            onClick={() => onFeedback("Portaled navbar action pressed")}
          />
        </WorkspacePortal>
        <div className="wiki-shell-workspace-content">
          <span className="mono-data">NAMED SLOTS</span>
          <strong>Content remains in the main region.</strong>
        </div>
      </WorkspaceShell>
    </div>
  );
}

function ErrorBoundaryDemo({ onFeedback }: ComponentDemoProps) {
  const [faultyPreview, setFaultyPreview] = useState(false);
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
            onFeedback("Error contained by boundary");
          }}
        />
      ) : null}
    </div>
  );
}

function CommandPaletteDemo({ onFeedback }: ComponentDemoProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  return (
    <>
      <Button
        icon="console"
        text="Open command palette"
        onClick={() => setPaletteOpen(true)}
      />
      <CommandPaletteShell open={paletteOpen} onOpenChange={setPaletteOpen}>
        <Command.Group heading="Navigation">
          {["Browse components", "Open workspace", "View graph demo"].map(
            (command) => (
              <Command.Item
                key={command}
                onSelect={() => {
                  onFeedback(`${command} selected`);
                  setPaletteOpen(false);
                }}
              >
                {command}
              </Command.Item>
            ),
          )}
        </Command.Group>
      </CommandPaletteShell>
    </>
  );
}

function ForceGraphCanvasDemo({ onFeedback }: ComponentDemoProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>("system");
  return (
    <div className="wiki-graph-preview">
      <ForceGraphCanvas
        ariaLabel="Kantzen package graph"
        edges={componentPreviewGraphEdges}
        getInitialPosition={(node) => ({
          x: node.x ?? 0,
          y: node.y ?? 0,
        })}
        nodes={componentPreviewGraphNodes}
        onSelectNode={(nodeId) => {
          setSelectedNode(nodeId);
          onFeedback(
            nodeId ? `${nodeId} node selected` : "Graph selection cleared",
          );
        }}
        running={false}
        selectedNodeId={selectedNode}
      />
    </div>
  );
}

export const shellComponentDemos = {
  CommandPaletteShell: CommandPaletteDemo,
  ErrorBoundary: ErrorBoundaryDemo,
  ForceGraphCanvas: ForceGraphCanvasDemo,
  WorkspaceNavbar: WorkspaceNavbarDemo,
  WorkspacePortal: WorkspacePortalDemo,
  WorkspaceShell: WorkspaceShellDemo,
  WorkspaceSidebar: WorkspaceSidebarDemo,
} satisfies ComponentDemoRegistry;
