import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearKeyboardFocusRegions } from "../interactions/focus-regions.js";
import {
  getDirectionalKey,
  shouldIgnorePageShortcut,
} from "../interactions/keyboard.js";
import type {
  NavBadge,
  NavGroup,
  NavItem,
  Project,
  User,
} from "../navigation.js";
import { WorkspaceSidebarFooter } from "./workspace-sidebar-footer.js";
import {
  isSidebarActivationKey,
  SIDEBAR_NAV_ITEM_SELECTOR,
  WorkspaceSidebarNavigation,
} from "./workspace-sidebar-navigation.js";
import { isWorkspacePathActive } from "./workspace-route-matching.js";

export interface WorkspaceSidebarProps {
  isCollapsed?: boolean;
  productName: string;
  collapsedProductName?: string;
  navGroups: NavGroup[];
  navBadges?: Record<string, NavBadge>;
  projects?: Project[];
  user?: User;
  version?: string;
  onLogout?: () => void;
  onExpandSidebar?: () => void;
  navigationFooter?: ReactNode;
  sidebarShortcutLabel?: string;
}

/** Check if any child route is currently active */
const hasActiveChild = (item: NavItem, pathname: string): boolean => {
  if (!item.children) return false;
  return item.children.some((child) =>
    isWorkspacePathActive(child.href, pathname),
  );
};

export const WorkspaceSidebar = ({
  isCollapsed = false,
  productName,
  collapsedProductName,
  navGroups,
  navBadges = {},
  projects = [],
  user,
  version,
  onLogout,
  onExpandSidebar,
  navigationFooter,
  sidebarShortcutLabel = "⌘B",
}: WorkspaceSidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const focusedNavLabelRef = useRef<string | null>(null);
  const prevCollapsedRef = useRef(isCollapsed);
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const activeParentLabels = useMemo(() => {
    const labels = new Set<string>();
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.children && hasActiveChild(item, location.pathname)) {
          labels.add(item.label);
        }
      }
    }
    return labels;
  }, [location.pathname, navGroups]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isActive = (href: string) =>
    isWorkspacePathActive(href, location.pathname);

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  const activateNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      if (isCollapsed) {
        onExpandSidebar?.();
      }
      toggleExpanded(item.label);
    } else {
      handleNavigation(item.href);
    }
  };

  const getNavElements = useCallback(
    () =>
      Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          SIDEBAR_NAV_ITEM_SELECTOR,
        ) ?? [],
      ),
    [],
  );

  const focusNavElement = useCallback(
    (index: number) => {
      const navElements = getNavElements();
      if (navElements.length === 0) return;

      const nextIndex = Math.min(Math.max(index, 0), navElements.length - 1);
      navElements[nextIndex]?.focus();
    },
    [getNavElements],
  );

  const focusActiveOrFirstNavElement = useCallback(() => {
    const navElements = getNavElements();
    const activeIndex = navElements.findIndex((element) =>
      element.classList.contains("sidebar-item-active"),
    );
    focusNavElement(activeIndex >= 0 ? activeIndex : 0);
  }, [focusNavElement, getNavElements]);

  useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "F6" || shouldIgnorePageShortcut(event)) return;

      event.preventDefault();
      focusActiveOrFirstNavElement();
    };

    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown);
  }, [focusActiveOrFirstNavElement]);

  // Restore focus when sidebar collapse state changes.
  // DOM elements are recreated (Tooltip wrap/unwrap), which moves focus to body.
  useLayoutEffect(() => {
    if (prevCollapsedRef.current === isCollapsed) return;
    prevCollapsedRef.current = isCollapsed;

    // Only restore if focus was lost (removed element → focus moved to body)
    const active = document.activeElement;
    if (active !== document.body && active !== document.documentElement) return;

    const label = focusedNavLabelRef.current;
    if (!label) return;

    if (label === "__sidebar__") {
      sidebarRef.current?.focus();
      return;
    }

    const navElements = getNavElements();
    const match = navElements.find((el) => el.dataset.label === label);
    if (match) {
      match.focus();
    } else {
      focusActiveOrFirstNavElement();
    }
  }, [focusActiveOrFirstNavElement, getNavElements, isCollapsed]);

  const handleSidebarMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    clearKeyboardFocusRegions();

    if (!(event.target instanceof HTMLElement)) return;

    const navItem = event.target.closest<HTMLElement>(
      SIDEBAR_NAV_ITEM_SELECTOR,
    );
    if (navItem) {
      navItem.focus();
      return;
    }

    if (
      event.target.closest(
        'button, a, input, select, textarea, [role="button"]',
      )
    )
      return;

    sidebarRef.current?.focus();
  };

  const handleSidebarKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;

    const currentItem =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLElement>(SIDEBAR_NAV_ITEM_SELECTOR)
        : null;
    if (!currentItem) {
      const direction = getDirectionalKey(event);
      if (!direction && !isSidebarActivationKey(event.key)) return;

      event.preventDefault();
      focusActiveOrFirstNavElement();
      return;
    }

    if (isSidebarActivationKey(event.key)) {
      event.preventDefault();
      const hasChildren = currentItem.dataset.hasChildren === "true";
      const label = currentItem.dataset.label;
      const href = currentItem.dataset.href;

      if (hasChildren && label) {
        if (isCollapsed) {
          onExpandSidebar?.();
        }
        toggleExpanded(label);
      } else if (href) {
        handleNavigation(href);
      }
      return;
    }

    const direction = getDirectionalKey(event);
    if (!direction) return;

    const navElements = getNavElements();
    const currentIndex = navElements.indexOf(currentItem);
    if (currentIndex === -1) return;

    const hasChildren = currentItem.dataset.hasChildren === "true";
    const isExpanded = currentItem.dataset.expanded === "true";
    const label = currentItem.dataset.label;

    if (direction === "right" && hasChildren && !isExpanded) {
      event.preventDefault();
      if (isCollapsed) {
        onExpandSidebar?.();
      }
      if (label) {
        setExpandedItems((prev) => new Set(prev).add(label));
      }
      return;
    }

    if (direction === "left" && hasChildren && isExpanded && label) {
      event.preventDefault();
      setExpandedItems((prev) => {
        const next = new Set(prev);
        next.delete(label);
        return next;
      });
      return;
    }

    let nextIndex = currentIndex;
    if (direction === "down" || direction === "right")
      nextIndex = currentIndex + 1;
    if (direction === "up" || direction === "left")
      nextIndex = currentIndex - 1;
    if (direction === "first") nextIndex = 0;
    if (direction === "last") nextIndex = navElements.length - 1;

    event.preventDefault();
    focusNavElement(nextIndex);
  };

  return (
    <div
      className={`workspace-sidebar app-sidebar ${isCollapsed ? "collapsed" : ""}`}
      ref={sidebarRef}
      data-focus-region="sidebar"
      tabIndex={-1}
      onKeyDown={handleSidebarKeyDown}
      onMouseDown={handleSidebarMouseDown}
      onFocusCapture={(e) => {
        const navItem = (e.target as HTMLElement).closest<HTMLElement>(
          SIDEBAR_NAV_ITEM_SELECTOR,
        );
        focusedNavLabelRef.current = navItem
          ? (navItem.dataset.label ?? null)
          : "__sidebar__";
      }}
    >
      {/* Header */}
      <button
        aria-controls="workspace-sidebar-navigation"
        aria-expanded={!isCollapsed}
        aria-keyshortcuts="Meta+B Control+B"
        aria-label={`${isCollapsed ? "Expand" : "Collapse"} sidebar`}
        className="sidebar-header sidebar-header-toggle"
        onClick={onExpandSidebar}
        title={`${isCollapsed ? "Expand" : "Collapse"} sidebar (${sidebarShortcutLabel})`}
        type="button"
      >
        <div className="sidebar-logo">
          <span className="sidebar-title">
            {isCollapsed
              ? (collapsedProductName ?? productName.slice(0, 2))
              : productName}
          </span>
        </div>
      </button>

      <WorkspaceSidebarNavigation
        activeParentLabels={activeParentLabels}
        expandedItems={expandedItems}
        isActive={isActive}
        isCollapsed={isCollapsed}
        navBadges={navBadges}
        navGroups={navGroups}
        navigationFooter={navigationFooter}
        onActivate={activateNavItem}
      />

      {user ? (
        <WorkspaceSidebarFooter
          isCollapsed={isCollapsed}
          onLogout={onLogout}
          projects={projects}
          user={user}
          version={version}
        />
      ) : null}
    </div>
  );
};
