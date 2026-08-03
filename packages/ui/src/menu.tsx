import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./icons.js";
import { classes, intentClass, type Intent } from "./classes.js";

export interface MenuProps extends HTMLAttributes<HTMLUListElement> {
  children?: ReactNode;
  large?: boolean;
}

export function Menu({
  children,
  className,
  large,
  role = "menu",
  ...props
}: MenuProps) {
  return (
    <ul
      {...props}
      className={classes(
        "kui-menu",
        "bp6-menu",
        large && "bp6-large",
        className,
      )}
      role={role}
    >
      {children}
    </ul>
  );
}

export interface MenuDividerProps extends Omit<
  HTMLAttributes<HTMLLIElement>,
  "title"
> {
  title?: ReactNode;
}

export function MenuDivider({ className, title, ...props }: MenuDividerProps) {
  if (title) {
    return (
      <li
        {...props}
        className={classes("kui-menu-header", "bp6-menu-header", className)}
        role="presentation"
      >
        <h6>{title}</h6>
      </li>
    );
  }
  return (
    <li
      {...props}
      className={classes("kui-menu-divider", "bp6-menu-divider", className)}
      role="separator"
    />
  );
}

export interface MenuItemProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children"
> {
  active?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  icon?: IconName;
  intent?: Intent;
  labelElement?: ReactNode;
  multiline?: boolean;
  text?: ReactNode;
}

export function MenuItem({
  active,
  children,
  className,
  disabled,
  icon,
  intent,
  labelElement,
  multiline,
  onClick,
  text,
  ...anchorProps
}: MenuItemProps) {
  const hasSubmenu = children !== undefined && children !== null;
  return (
    <li
      className={classes("kui-menu-item-shell", hasSubmenu && "bp6-submenu")}
      role="none"
    >
      <a
        {...anchorProps}
        aria-disabled={disabled || undefined}
        className={classes(
          "kui-menu-item",
          "bp6-menu-item",
          active && "bp6-active",
          disabled && "bp6-disabled",
          multiline && "bp6-multiline",
          intentClass(intent),
          className,
        )}
        data-kui-dismiss={hasSubmenu ? undefined : "true"}
        href={disabled ? undefined : anchorProps.href}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        role="menuitem"
        tabIndex={disabled ? -1 : (anchorProps.tabIndex ?? 0)}
      >
        {icon ? <Icon icon={icon} /> : null}
        <span className="bp6-text-overflow-ellipsis">{text}</span>
        {labelElement || hasSubmenu ? (
          <span className="bp6-menu-item-label">
            {labelElement}
            {hasSubmenu ? <Icon icon="chevron-right" /> : null}
          </span>
        ) : null}
      </a>
      {hasSubmenu ? <Menu className="kui-submenu">{children}</Menu> : null}
    </li>
  );
}
