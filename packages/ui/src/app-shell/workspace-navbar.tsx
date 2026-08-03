import { Alignment, Navbar, NavbarGroup } from "@kantzen-ui/ui";
import type { ReactNode } from "react";

export interface WorkspaceNavbarProps {
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  expanded?: boolean;
  expandedContent?: ReactNode;
  className?: string;
  barClassName?: string;
}

export const WorkspaceNavbar = ({
  left,
  right,
  children,
  expanded = false,
  expandedContent,
  className,
  barClassName,
}: WorkspaceNavbarProps) => {
  const shellClassNames = ["workspace-navbar-shell", className]
    .filter(Boolean)
    .join(" ");
  const barClassNames = ["top-navbar", "workspace-navbar", barClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={shellClassNames}>
      <Navbar className={barClassNames}>
        <NavbarGroup className="workspace-navbar-group workspace-navbar-group--left">
          {left}
          {children}
        </NavbarGroup>
        {right && (
          <NavbarGroup
            align={Alignment.END}
            className="workspace-navbar-group workspace-navbar-group--right"
          >
            {right}
          </NavbarGroup>
        )}
      </Navbar>
      {expanded && expandedContent && (
        <div className="workspace-navbar-expanded">{expandedContent}</div>
      )}
    </header>
  );
};
