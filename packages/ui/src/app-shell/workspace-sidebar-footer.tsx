import { useState } from "react";
import { Icon } from "../icons/icon.js";
import { Collapse } from "../primitives/layout.js";
import { Popover, Position } from "../primitives/popover.js";
import type { Project, User } from "../navigation.js";

const environmentColors: Record<string, string> = {
  Development: "hsl(var(--accent))",
  Testing: "hsl(var(--warning))",
  Production: "hsl(var(--success))",
};

function getProjectColor(project: Project) {
  return (
    project.color ??
    environmentColors[project.environment] ??
    "hsl(var(--accent))"
  );
}

interface ProjectOptionsProps {
  onSelect: (environment: string) => void;
  projects: readonly Project[];
  selectedProject: Project | null;
}

function ProjectOptions({
  onSelect,
  projects,
  selectedProject,
}: ProjectOptionsProps) {
  return (
    <div className="footer-env-options">
      {projects.map((project) => {
        const selected = selectedProject?.environment === project.environment;
        return (
          <button
            aria-pressed={selected}
            className={`env-option ${selected ? "active" : ""}`}
            key={project.environment}
            onClick={() => onSelect(project.environment)}
            type="button"
          >
            <span
              className="env-dot"
              style={{ backgroundColor: getProjectColor(project) }}
            />
            <span className="env-option-label">{project.environment}</span>
            {selected ? (
              <Icon icon="tick" size={12} className="env-option-check" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function SignOutAction({ onLogout }: { onLogout?: () => void }) {
  if (!onLogout) return null;
  return (
    <button className="footer-action" onClick={onLogout} type="button">
      <Icon icon="log-out" size={14} />
      <span>Sign out</span>
    </button>
  );
}

interface WorkspaceSidebarFooterProps {
  isCollapsed: boolean;
  onLogout?: () => void;
  projects: readonly Project[];
  user: User;
  version?: string;
}

export function WorkspaceSidebarFooter({
  isCollapsed,
  onLogout,
  projects,
  user,
  version,
}: WorkspaceSidebarFooterProps) {
  const [selectedProjectEnvironment, setSelectedProjectEnvironment] = useState<
    string | null
  >(() => projects[0]?.environment ?? null);
  const [footerOpen, setFooterOpen] = useState(false);
  const selectedProject =
    projects.find(
      (project) => project.environment === selectedProjectEnvironment,
    ) ??
    projects[0] ??
    null;

  if (isCollapsed) {
    return (
      <div className="sidebar-footer">
        <Popover
          position={Position.RIGHT_TOP}
          minimal
          modifiers={{
            offset: { enabled: true, options: { offset: [0, 16] } },
          }}
          content={
            <div className="collapsed-popover">
              <div className="collapsed-popover-header">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
              <div className="footer-divider" />
              <div className="footer-section-label">ENVIRONMENT</div>
              <ProjectOptions
                onSelect={setSelectedProjectEnvironment}
                projects={projects}
                selectedProject={selectedProject}
              />
              <div className="footer-divider" />
              <SignOutAction onLogout={onLogout} />
            </div>
          }
        >
          <button
            aria-label={`Open ${user.name} menu`}
            className="user-avatar collapsed-avatar"
            type="button"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        </Popover>
      </div>
    );
  }

  return (
    <div className="sidebar-footer">
      <div className={`footer-panel ${footerOpen ? "open" : ""}`}>
        <button
          aria-expanded={footerOpen}
          className="footer-panel-trigger"
          onClick={() => setFooterOpen((open) => !open)}
          type="button"
        >
          <div className="footer-trigger-left">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div
                className={`user-email footer-email ${footerOpen ? "visible" : ""}`}
              >
                {user.email}
              </div>
            </div>
          </div>
          <Icon
            icon="double-caret-vertical"
            size={12}
            className="footer-panel-caret"
          />
        </button>
        <Collapse isOpen={footerOpen}>
          <div className="footer-panel-content">
            <div className="footer-section-label">ENVIRONMENT</div>
            <ProjectOptions
              onSelect={setSelectedProjectEnvironment}
              projects={projects}
              selectedProject={selectedProject}
            />
            <div className="footer-divider" />
            <SignOutAction onLogout={onLogout} />
          </div>
        </Collapse>
        {selectedProject ? (
          <div className={`footer-env-badge ${footerOpen ? "hidden" : ""}`}>
            <span
              className="env-dot"
              style={{ backgroundColor: getProjectColor(selectedProject) }}
            />
            <span className="env-text mono-data">
              {selectedProject.environment.toUpperCase()}
            </span>
            {version ? (
              <span className="version-text mono-data">{version}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
