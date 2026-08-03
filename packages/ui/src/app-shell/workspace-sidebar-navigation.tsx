import type { ReactNode } from "react";
import { StatusLed } from "../components/status-led.js";
import { Icon } from "../icons/icon.js";
import { Collapse, Tag } from "../primitives/layout.js";
import { Menu, MenuDivider, MenuItem } from "../primitives/menu.js";
import { Position, Tooltip } from "../primitives/popover.js";
import type { NavBadge, NavGroup, NavItem } from "../navigation.js";

export const SIDEBAR_NAV_ITEM_SELECTOR = '[data-sidebar-nav-item="true"]';

export const isSidebarActivationKey = (key: string) =>
  key === "Enter" || key === " " || key === "Spacebar";

interface SidebarNavItemProps {
  activeParentLabels: ReadonlySet<string>;
  depth?: number;
  expandedItems: ReadonlySet<string>;
  isActive: (href: string) => boolean;
  isCollapsed: boolean;
  item: NavItem;
  navBadges: Readonly<Record<string, NavBadge>>;
  onActivate: (item: NavItem) => void;
}

function SidebarNavItem({
  activeParentLabels,
  depth = 0,
  expandedItems,
  isActive,
  isCollapsed,
  item,
  navBadges,
  onActivate,
}: SidebarNavItemProps) {
  const hasChildren = Boolean(item.children?.length);
  const isExpanded =
    expandedItems.has(item.label) || activeParentLabels.has(item.label);
  const active = hasChildren ? false : isActive(item.href);
  const badge = navBadges[item.label];
  const menuItem = (
    <MenuItem
      icon={item.icon}
      text={isCollapsed ? undefined : item.label}
      active={active}
      onClick={() => onActivate(item)}
      onKeyDown={(event) => {
        if (!isSidebarActivationKey(event.key)) return;
        event.preventDefault();
        event.stopPropagation();
        onActivate(item);
      }}
      labelElement={
        isCollapsed ? undefined : (
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
        )
      }
      aria-expanded={hasChildren ? isExpanded : undefined}
      data-sidebar-nav-item="true"
      data-has-children={hasChildren ? "true" : undefined}
      data-expanded={hasChildren ? String(isExpanded) : undefined}
      data-focus-region-initial={active ? "true" : undefined}
      data-label={item.label}
      data-href={item.href}
      className={
        [
          active && "sidebar-item-active",
          hasChildren && isExpanded && "sidebar-item-expanded",
        ]
          .filter(Boolean)
          .join(" ") || undefined
      }
    />
  );

  return (
    <div style={{ paddingLeft: `${depth * 16}px` }}>
      {isCollapsed ? (
        <Tooltip content={item.label} position={Position.RIGHT} minimal>
          {menuItem}
        </Tooltip>
      ) : (
        menuItem
      )}
      {hasChildren && !isCollapsed ? (
        <Collapse isOpen={isExpanded}>
          <div className="sidebar-submenu">
            {item.children?.map((child) => (
              <SidebarNavItem
                activeParentLabels={activeParentLabels}
                depth={depth + 1}
                expandedItems={expandedItems}
                isActive={isActive}
                isCollapsed={isCollapsed}
                item={child}
                key={child.label}
                navBadges={navBadges}
                onActivate={onActivate}
              />
            ))}
          </div>
        </Collapse>
      ) : null}
    </div>
  );
}

interface WorkspaceSidebarNavigationProps {
  activeParentLabels: ReadonlySet<string>;
  expandedItems: ReadonlySet<string>;
  isActive: (href: string) => boolean;
  isCollapsed: boolean;
  navBadges: Readonly<Record<string, NavBadge>>;
  navGroups: readonly NavGroup[];
  navigationFooter?: ReactNode;
  onActivate: (item: NavItem) => void;
}

export function WorkspaceSidebarNavigation({
  activeParentLabels,
  expandedItems,
  isActive,
  isCollapsed,
  navBadges,
  navGroups,
  navigationFooter,
  onActivate,
}: WorkspaceSidebarNavigationProps) {
  return (
    <div className="sidebar-nav" id="workspace-sidebar-navigation">
      {navGroups.map((group, index) => (
        <div key={group.label} className="nav-group">
          {!isCollapsed ? (
            <div className="nav-group-label">{group.label.toUpperCase()}</div>
          ) : null}
          {isCollapsed && index > 0 ? <MenuDivider /> : null}
          <Menu className="sidebar-menu">
            {group.items.map((item) => (
              <SidebarNavItem
                activeParentLabels={activeParentLabels}
                expandedItems={expandedItems}
                isActive={isActive}
                isCollapsed={isCollapsed}
                item={item}
                key={item.label}
                navBadges={navBadges}
                onActivate={onActivate}
              />
            ))}
          </Menu>
        </div>
      ))}
      {navigationFooter}
    </div>
  );
}
