import type { HTMLAttributes } from "react";

export interface InspectorWorkspaceProps extends HTMLAttributes<HTMLElement> {
  ariaLabel: string;
}

export function InspectorWorkspace({
  ariaLabel,
  className,
  ...props
}: InspectorWorkspaceProps) {
  return (
    <section
      {...props}
      aria-label={ariaLabel}
      className={["kui-inspector-workspace", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
