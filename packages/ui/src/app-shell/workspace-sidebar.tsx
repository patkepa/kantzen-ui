import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { clearKeyboardFocusRegions } from "../interactions/focus-regions.js";
import {
  getDirectionalKey,
  shouldIgnorePageShortcut,
} from "../interactions/keyboard.js";
import {
  collectActiveNavigationAncestorHrefs,
  isNavigationPathActive,
  type NavBadge,
  type NavGroup,
  type NavItem,
  type Project,
  type User,
} from "../navigation.js";
import { WorkspaceSidebarFooter } from "./workspace-sidebar-footer.js";
import {
  isSidebarActivationKey,
  SIDEBAR_NAV_ITEM_SELECTOR,
  WorkspaceSidebarNavigation,
} from "./workspace-sidebar-navigation.js";

export interface WorkspaceSidebarProps {
  isCollapsed?: boolean;
  productName: string;
  collapsedProductName?: string;
  currentPath?: string;
  navGroups: NavGroup[];
  navBadges?: Record<string, NavBadge>;
  projects?: Project[];
  user?: User;
  version?: string;
  onLogout?: () => void;
  onExpandSidebar?: () => void;
  onNavigate?: (href: string) => void;
  navigationFooter?: ReactNode;
  sidebarShortcutLabel?: string;
}

export const WorkspaceSidebar = ({
  isCollapsed = false,
  productName,
  collapsedProductName,
  currentPath,
  navGroups,
  navBadges = {},
  projects = [],
  user,
  version,
  onLogout,
  onExpandSidebar,
  onNavigate,
  navigationFooter,
  sidebarShortcutLabel = "⌘B",
}: WorkspaceSidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [expandedItemHrefs, setExpandedItemHrefs] = useState<Set<string>>(
    new Set(),
  );
  const pathname =
    currentPath ??
    (typeof window === "undefined" ? "/" : window.location.pathname);

  const activeParentHrefs = useMemo(
    () =>
      collectActiveNavigationAncestorHrefs(
        navGroups.flatMap((group) => group.items),
        pathname,
      ),
    [navGroups, pathname],
  );

  const toggleExpanded = (href: string) => {
    setExpandedItemHrefs((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  const isActive = (href: string) => isNavigationPathActive(href, pathname);

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
      return;
    }
    window.location.assign(href);
  };

  const activateNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      if (isCollapsed) {
        onExpandSidebar?.();
      }
      toggleExpanded(item.href);
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
      currentItem.click();
      return;
    }

    const direction = getDirectionalKey(event);
    if (!direction) return;

    const navElements = getNavElements();
    const currentIndex = navElements.indexOf(currentItem);
    if (currentIndex === -1) return;

    const hasChildren = currentItem.dataset.hasChildren === "true";
    const isExpanded = currentItem.dataset.expanded === "true";
    const href = currentItem.dataset.href;

    if (direction === "right" && hasChildren && !isExpanded) {
      event.preventDefault();
      if (isCollapsed) {
        onExpandSidebar?.();
      }
      if (href) {
        setExpandedItemHrefs((prev) => new Set(prev).add(href));
      }
      return;
    }

    if (direction === "left" && hasChildren && isExpanded && href) {
      event.preventDefault();
      setExpandedItemHrefs((prev) => {
        const next = new Set(prev);
        next.delete(href);
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
        activeParentHrefs={activeParentHrefs}
        expandedItemHrefs={expandedItemHrefs}
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
