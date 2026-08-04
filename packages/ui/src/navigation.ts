import type { IconName } from "@blueprintjs/icons";

export interface NavItem {
  id?: string;
  label: string;
  icon: IconName;
  href: string;
  children?: NavItem[];
}

export interface NavGroup {
  id?: string;
  label: string;
  items: NavItem[];
}

export interface Project {
  name: string;
  environment: string;
  icon: IconName;
  color?: string;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export interface NavBadge {
  count?: number;
  status?: "online" | "warning" | "offline";
}

export type WorkspaceNavItem = NavItem;
export type WorkspaceNavGroup = NavGroup;

export interface SiteNavItem {
  id?: string;
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  children?: SiteNavItem[];
}

export interface SiteNavGroup {
  id?: string;
  label: string;
  items: SiteNavItem[];
}

export interface SiteNavAction {
  id?: string;
  label: string;
  href: string;
  intent?: "primary" | "secondary";
  external?: boolean;
}

interface NavigationTreeItem<Item extends NavigationTreeItem<Item>> {
  children?: readonly Item[];
  href: string;
}

export function normalizeNavigationPath(value: string): string | null {
  const pathEnd = value.search(/[?#]/);
  const path = pathEnd === -1 ? value : value.slice(0, pathEnd);
  if (!path.startsWith("/")) return null;
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function isNavigationPathActive(href: string, currentPath: string) {
  const normalizedHref = normalizeNavigationPath(href);
  const normalizedCurrentPath = normalizeNavigationPath(currentPath);
  if (!normalizedHref || !normalizedCurrentPath) return false;
  if (normalizedHref === "/") return normalizedCurrentPath === "/";
  return (
    normalizedCurrentPath === normalizedHref ||
    normalizedCurrentPath.startsWith(`${normalizedHref}/`)
  );
}

export function isNavigationBranchActive<Item extends NavigationTreeItem<Item>>(
  item: Item,
  currentPath: string,
): boolean {
  return (
    isNavigationPathActive(item.href, currentPath) ||
    (item.children?.some((child) =>
      isNavigationBranchActive(child, currentPath),
    ) ??
      false)
  );
}

export function collectActiveNavigationAncestorHrefs<
  Item extends NavigationTreeItem<Item>,
>(items: readonly Item[], currentPath: string): Set<string> {
  const activeAncestors = new Set<string>();

  const visit = (item: Item): boolean => {
    const hasActiveDescendant = item.children?.some(visit) ?? false;
    if (hasActiveDescendant) activeAncestors.add(item.href);
    return (
      isNavigationPathActive(item.href, currentPath) || hasActiveDescendant
    );
  };

  items.forEach(visit);
  return activeAncestors;
}

export function getNavigationItemKey(
  item: { href: string; id?: string; label: string },
  parentKey = "navigation",
) {
  return `${parentKey}:${item.id ?? normalizeNavigationPath(item.href) ?? item.href ?? item.label}`;
}
