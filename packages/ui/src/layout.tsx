import type { HTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./icons.js";
import { classes } from "./classes.js";

export const Alignment = {
  START: "left",
  LEFT: "left",
  CENTER: "center",
  END: "right",
  RIGHT: "right",
} as const;

export type NavbarProps = HTMLAttributes<HTMLDivElement>;

export function Navbar({ children, className, ...props }: NavbarProps) {
  return (
    <div {...props} className={classes("kui-navbar", "bp6-navbar", className)}>
      {children}
    </div>
  );
}

export interface NavbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  align?: (typeof Alignment)[keyof typeof Alignment];
}

export function NavbarGroup({
  align,
  children,
  className,
  ...props
}: NavbarGroupProps) {
  return (
    <div
      {...props}
      className={classes(
        "kui-navbar-group",
        "bp6-navbar-group",
        align === "right" && "bp6-align-right",
        align === "left" && "bp6-align-left",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function H4({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h4 {...props} className={classes("bp6-heading", className)} />;
}

export interface NonIdealStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  action?: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  title?: ReactNode;
}

export function NonIdealState({
  action,
  children,
  className,
  description,
  icon,
  title,
  ...props
}: NonIdealStateProps) {
  return (
    <div
      {...props}
      className={classes("kui-empty-state", "bp6-non-ideal-state", className)}
    >
      {icon ? <Icon icon={icon} size={48} /> : null}
      <div className="bp6-non-ideal-state-text">
        {title ? <H4>{title}</H4> : null}
        {description ? <div>{description}</div> : null}
        {children}
      </div>
      {action ? (
        <div className="bp6-non-ideal-state-action">{action}</div>
      ) : null}
    </div>
  );
}

export function Collapse({
  children,
  isOpen,
}: {
  children?: ReactNode;
  isOpen: boolean;
}) {
  return (
    <div
      aria-hidden={!isOpen}
      className={classes(
        "kui-collapse",
        "bp6-collapse",
        isOpen && "bp6-collapse-open",
      )}
      hidden={!isOpen}
    >
      <div className="bp6-collapse-body">{children}</div>
    </div>
  );
}

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  minimal?: boolean;
}

export function Tag({ className, minimal, ...props }: TagProps) {
  return (
    <span
      {...props}
      className={classes(
        "kui-tag",
        "bp6-tag",
        minimal && "bp6-minimal",
        className,
      )}
    />
  );
}
