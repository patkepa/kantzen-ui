import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type WorkspaceSlotName =
  "main-overlay" | "navbar-end" | "sidebar-nav-end" | "topbar";

type WorkspaceSlotTargets = Record<WorkspaceSlotName, HTMLElement | null>;

interface WorkspaceSlotsContextValue {
  registerTarget: (slot: WorkspaceSlotName, target: HTMLElement | null) => void;
  targets: WorkspaceSlotTargets;
}

const emptyTargets: WorkspaceSlotTargets = {
  "main-overlay": null,
  "navbar-end": null,
  "sidebar-nav-end": null,
  topbar: null,
};

const WorkspaceSlotsContext = createContext<WorkspaceSlotsContextValue | null>(
  null,
);

export function WorkspaceSlotsProvider({ children }: { children: ReactNode }) {
  const [targets, setTargets] = useState<WorkspaceSlotTargets>(emptyTargets);
  const registerTarget = useCallback(
    (slot: WorkspaceSlotName, target: HTMLElement | null) => {
      setTargets((current) =>
        current[slot] === target ? current : { ...current, [slot]: target },
      );
    },
    [],
  );
  const value = useMemo(
    () => ({ registerTarget, targets }),
    [registerTarget, targets],
  );

  return (
    <WorkspaceSlotsContext.Provider value={value}>
      {children}
    </WorkspaceSlotsContext.Provider>
  );
}

function useWorkspaceSlotsContext() {
  const context = useContext(WorkspaceSlotsContext);
  if (!context) {
    throw new Error("Workspace slots must be used inside WorkspaceShell.");
  }
  return context;
}

export function useWorkspaceSlotTarget(slot: WorkspaceSlotName) {
  const { registerTarget } = useWorkspaceSlotsContext();
  return useCallback(
    (target: HTMLElement | null) => registerTarget(slot, target),
    [registerTarget, slot],
  );
}

export interface WorkspaceSlotHostProps extends HTMLAttributes<HTMLDivElement> {
  slot: WorkspaceSlotName;
}

export function WorkspaceSlotHost({ slot, ...props }: WorkspaceSlotHostProps) {
  const targetRef = useWorkspaceSlotTarget(slot);
  return <div {...props} data-workspace-slot={slot} ref={targetRef} />;
}

export interface WorkspacePortalProps {
  children: ReactNode;
  slot: WorkspaceSlotName;
}

export function WorkspacePortal({ children, slot }: WorkspacePortalProps) {
  const context = useContext(WorkspaceSlotsContext);
  const target = context?.targets[slot];
  return target ? createPortal(children, target) : children;
}
