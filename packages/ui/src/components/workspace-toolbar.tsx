import type { ReactNode } from "react";

export interface WorkspaceToolbarProps {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const WorkspaceToolbar = ({
  children,
  className,
  ariaLabel = "Workspace toolbar",
}: WorkspaceToolbarProps) => {
  const classNames = ["workspace-toolbar", "main-toolbar", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} role="toolbar" aria-label={ariaLabel}>
      {children}
    </div>
  );
};
