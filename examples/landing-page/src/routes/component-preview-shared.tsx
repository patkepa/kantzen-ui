import type { ReactNode } from "react";
import { Icon } from "@patkepa/kantzen-ui";

export const componentPreviewListItems = [
  { id: "design", label: "Design system" },
  { id: "workspace", label: "Workspace app" },
  { id: "public", label: "Public site" },
];

export const componentPreviewGraphNodes = [
  { id: "system", label: "System", x: 0, y: 0 },
  { id: "theme", label: "Theme", x: -120, y: -70 },
  { id: "components", label: "Components", x: 125, y: -65 },
  { id: "shell", label: "Shell", x: 0, y: 120 },
];

export const componentPreviewGraphEdges = [
  { id: "system-theme", source: "system", target: "theme" },
  { id: "system-components", source: "system", target: "components" },
  { id: "system-shell", source: "system", target: "shell" },
];

export const componentPreviewWorkspaceNav = [
  {
    label: "Workspace",
    items: [
      { href: "/components", icon: "grid-view" as const, label: "Overview" },
      {
        href: "/components/activity",
        icon: "pulse" as const,
        label: "Activity",
      },
      {
        href: "/components/settings",
        icon: "settings" as const,
        label: "Settings",
      },
    ],
  },
];

export function LabelledSample({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="wiki-labelled-sample">
      <span>{label}</span>
      {children}
    </div>
  );
}

export function ShellDiagram({ active = "CONTENT" }: { active?: string }) {
  return (
    <div className="wiki-shell-diagram" aria-label={`${active} shell anatomy`}>
      <div>BRAND</div>
      <div>NAVBAR</div>
      <div>SIDEBAR</div>
      <strong>{active}</strong>
      <div>UTILITY SLOT</div>
    </div>
  );
}

export function FaultyDemo({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Preview failure requested");
  return (
    <div className="wiki-boundary-ok">
      <Icon icon="confirm" size={24} />
      <strong>Feature mounted safely</strong>
      <span>Trigger a failure to inspect the recovery state.</span>
    </div>
  );
}
