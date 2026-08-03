import { useEffect, type ReactNode } from "react";
import { Button } from "@kantzen-ui/ui";
import {
  clearKeyboardFocusRegions,
  hasOpenBlockingOverlay,
  isEditableTarget,
  moveFocusRegion,
} from "@kantzen-ui/ui/interactions";
import type {
  NavBadge,
  NavGroup,
  Project,
  User,
} from "@kantzen-ui/ui/navigation";
import { AppSidebar } from "./app-sidebar.js";
import { ErrorBoundary } from "./error-boundary.js";
import { WorkspaceNavbar } from "./workspace-navbar.js";
import {
  WorkspaceSlotHost,
  WorkspaceSlotsProvider,
  useWorkspaceSlotTarget,
} from "./workspace-slots.js";

export interface AppShellProps {
  children: ReactNode;
  productName: string;
  collapsedProductName?: string;
  navGroups: NavGroup[];
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  breadcrumb?: ReactNode;
  navBadges?: Record<string, NavBadge>;
  projects?: Project[];
  user?: User;
  version?: string;
  onLogout?: () => void;
  onOpenCommandPalette?: () => void;
  commandPalette?: ReactNode;
  sidebarShortcutLabel?: string;
}

function getFocusRegionDirection(key: string): "left" | "right" | null {
  if (key === "ArrowLeft" || key.toLowerCase() === "a") return "left";
  if (key === "ArrowRight" || key.toLowerCase() === "d") return "right";
  return null;
}

const AppShellLayout = ({
  children,
  productName,
  collapsedProductName,
  navGroups,
  sidebarCollapsed,
  onToggleSidebar,
  breadcrumb,
  navBadges,
  projects,
  user,
  version,
  onLogout,
  onOpenCommandPalette,
  commandPalette,
  sidebarShortcutLabel,
}: AppShellProps) => {
  const mainOverlayTargetRef = useWorkspaceSlotTarget("main-overlay");
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (e.shiftKey) {
          window.dispatchEvent(new CustomEvent("toggle-right-sidebar"));
        } else {
          onToggleSidebar();
        }
        return;
      }

      const focusRegionDirection = getFocusRegionDirection(e.key);
      if (
        focusRegionDirection &&
        e.shiftKey &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.defaultPrevented &&
        !e.isComposing &&
        !isEditableTarget(e.target) &&
        !hasOpenBlockingOverlay()
      ) {
        e.preventDefault();
        moveFocusRegion(focusRegionDirection);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleSidebar]);

  return (
    <div className="main-layout">
      <AppSidebar
        isCollapsed={sidebarCollapsed}
        productName={productName}
        collapsedProductName={collapsedProductName}
        navGroups={navGroups}
        navBadges={navBadges}
        projects={projects}
        user={user}
        version={version}
        onLogout={onLogout}
        onExpandSidebar={onToggleSidebar}
        sidebarShortcutLabel={sidebarShortcutLabel}
        navigationFooter={
          <WorkspaceSlotHost
            className="workspace-sidebar-nav-slot"
            slot="sidebar-nav-end"
          />
        }
      />

      <div className="main-content" ref={mainOverlayTargetRef}>
        <WorkspaceNavbar
          left={
            <>
              <Button
                className="desktop-collapse-button"
                icon={
                  sidebarCollapsed
                    ? "double-chevron-right"
                    : "double-chevron-left"
                }
                minimal
                onClick={onToggleSidebar}
                title="Toggle Sidebar (⌘B)"
              />
              {breadcrumb && (
                <span className="navbar-breadcrumb">{breadcrumb}</span>
              )}
            </>
          }
          right={
            <>
              {onOpenCommandPalette && (
                <Button
                  icon="search"
                  minimal
                  title="Search (⌘K)"
                  onClick={onOpenCommandPalette}
                />
              )}
              <WorkspaceSlotHost
                className="workspace-navbar-end-slot"
                slot="navbar-end"
              />
            </>
          }
        />

        <WorkspaceSlotHost className="workspace-topbar-slot" slot="topbar" />

        <div
          className="page-content"
          data-focus-region="main"
          tabIndex={-1}
          onMouseDown={() => clearKeyboardFocusRegions()}
        >
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </div>

      {commandPalette}
    </div>
  );
};

export const AppShell = (props: AppShellProps) => (
  <WorkspaceSlotsProvider>
    <AppShellLayout {...props} />
  </WorkspaceSlotsProvider>
);
