import type { MouseEvent, ReactNode } from "react";
import { StatusLed } from "../components/status-led.js";
import { Icon } from "../icons/icon.js";
import { Collapse, Tag } from "../primitives/layout.js";
import { Menu, MenuDivider } from "../primitives/menu.js";
import {
  Position,
  Tooltip,
  type PopoverTargetProps,
} from "../primitives/popover.js";
import {
  getNavigationItemKey,
  type NavBadge,
  type NavGroup,
  type NavItem,
} from "../navigation.js";
import { classes } from "../primitives/classes.js";

export const SIDEBAR_NAV_ITEM_SELECTOR = '[data-sidebar-nav-item="true"]';

export const isSidebarActivationKey = (key: string) =>
  key === "Enter" || key === " " || key === "Spacebar";

interface SidebarNavItemProps {
  activeParentHrefs: ReadonlySet<string>;
  depth?: number;
  expandedItemHrefs: ReadonlySet<string>;
  isActive: (href: string) => boolean;
  isCollapsed: boolean;
  item: NavItem;
  itemKey: string;
  navBadges: Readonly<Record<string, NavBadge>>;
  onActivate: (item: NavItem) => void;
}

function SidebarNavItem({
  activeParentHrefs,
  depth = 0,
  expandedItemHrefs,
  isActive,
  isCollapsed,
  item,
  itemKey,
  navBadges,
  onActivate,
}: SidebarNavItemProps) {
  const hasChildren = Boolean(item.children?.length);
  const isExpanded =
    expandedItemHrefs.has(item.href) || activeParentHrefs.has(item.href);
  const active = hasChildren ? false : isActive(item.href);
  const badge = navBadges[item.id ?? item.href] ?? navBadges[item.label];

  const renderTarget = (targetProps: PopoverTargetProps) => {
    const { setTargetElement, ...elementProps } = targetProps;
    const handleClick = (
      event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    ) => {
      targetProps.onClick?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      onActivate(item);
    };
    const content = (
      <>
        <Icon icon={item.icon} />
        {!isCollapsed ? (
          <span className="bp6-text-overflow-ellipsis">{item.label}</span>
        ) : null}
        {!isCollapsed ? (
          <span className="nav-item-right">
            {badge?.status ? (
              <StatusLed status={badge.status} />
            ) : badge?.count ? (
              <Tag minimal className="nav-count-badge">
                {badge.count}
              </Tag>
            ) : null}
            {hasChildren ? (
              <Icon
                icon={isExpanded ? "chevron-down" : "chevron-right"}
                size={12}
              />
            ) : null}
          </span>
        ) : null}
      </>
    );
    const props = {
      ...elementProps,
      "aria-current": active ? ("page" as const) : undefined,
      "aria-expanded": hasChildren ? isExpanded : undefined,
      className: classes(
        "kui-menu-item",
        "bp6-menu-item",
        active && "bp6-active sidebar-item-active",
        hasChildren && isExpanded && "sidebar-item-expanded",
        elementProps.className,
      ),
      "data-expanded": hasChildren ? String(isExpanded) : undefined,
      "data-focus-region-initial": active ? "true" : undefined,
      "data-has-children": hasChildren ? "true" : undefined,
      "data-href": item.href,
      "data-item-key": itemKey,
      "data-sidebar-nav-item": "true",
      onClick: handleClick,
      ref: setTargetElement,
      role: "menuitem",
      tabIndex: 0,
    };

    return hasChildren ? (
      <button {...props} type="button">
        {content}
      </button>
    ) : (
      <a {...props} href={item.href}>
        {content}
      </a>
    );
  };

  return (
    <li
      className="kui-menu-item-shell"
      style={{ paddingLeft: `${depth * 16}px` }}
    >
      <Tooltip
        content={item.label}
        disabled={!isCollapsed}
        position={Position.RIGHT}
        minimal
        renderTarget={renderTarget}
      />
      {hasChildren && !isCollapsed ? (
        <Collapse isOpen={isExpanded}>
          <Menu className="sidebar-submenu">
            {item.children?.map((child) => (
              <SidebarNavItem
                activeParentHrefs={activeParentHrefs}
                depth={depth + 1}
                expandedItemHrefs={expandedItemHrefs}
                isActive={isActive}
                isCollapsed={isCollapsed}
                item={child}
                itemKey={getNavigationItemKey(child, itemKey)}
                key={getNavigationItemKey(child, itemKey)}
                navBadges={navBadges}
                onActivate={onActivate}
              />
            ))}
          </Menu>
        </Collapse>
      ) : null}
    </li>
  );
}

interface WorkspaceSidebarNavigationProps {
  activeParentHrefs: ReadonlySet<string>;
  expandedItemHrefs: ReadonlySet<string>;
  isActive: (href: string) => boolean;
  isCollapsed: boolean;
  navBadges: Readonly<Record<string, NavBadge>>;
  navGroups: readonly NavGroup[];
  navigationFooter?: ReactNode;
  onActivate: (item: NavItem) => void;
}

export function WorkspaceSidebarNavigation({
  activeParentHrefs,
  expandedItemHrefs,
  isActive,
  isCollapsed,
  navBadges,
  navGroups,
  navigationFooter,
  onActivate,
}: WorkspaceSidebarNavigationProps) {
  return (
    <div className="sidebar-nav" id="workspace-sidebar-navigation">
      {navGroups.map((group, index) => {
        const groupKey = group.id ?? group.label;
        return (
          <div key={groupKey} className="nav-group">
            {!isCollapsed ? (
              <div className="nav-group-label">{group.label.toUpperCase()}</div>
            ) : null}
            {isCollapsed && index > 0 ? <MenuDivider /> : null}
            <Menu className="sidebar-menu">
              {group.items.map((item) => (
                <SidebarNavItem
                  activeParentHrefs={activeParentHrefs}
                  expandedItemHrefs={expandedItemHrefs}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                  item={item}
                  itemKey={getNavigationItemKey(item, groupKey)}
                  key={getNavigationItemKey(item, groupKey)}
                  navBadges={navBadges}
                  onActivate={onActivate}
                />
              ))}
            </Menu>
          </div>
        );
      })}
      {navigationFooter}
    </div>
  );
}
