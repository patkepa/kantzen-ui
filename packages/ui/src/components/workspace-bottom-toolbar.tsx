import type { ReactNode } from "react";

export interface WorkspaceBottomToolbarProps {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const WorkspaceBottomToolbar = ({
  children,
  className,
  ariaLabel = "Bottom toolbar",
}: WorkspaceBottomToolbarProps) => {
  const classNames = ["workspace-bottom-toolbar", "bottom-toolbar", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} role="toolbar" aria-label={ariaLabel}>
      {children}
    </div>
  );
};
