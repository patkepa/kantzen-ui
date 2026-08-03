import { useLayoutEffect, useRef, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { classes } from "./classes.js";

export interface ContextMenuOptions {
  content: ReactNode;
  targetOffset: { left: number; top: number };
  placement?: string;
  popoverClassName?: string;
  transitionDuration?: number;
}

let contextMenuRoot: Root | null = null;
let contextMenuContainer: HTMLDivElement | null = null;

export function hideContextMenu() {
  const root = contextMenuRoot;
  const container = contextMenuContainer;
  contextMenuRoot = null;
  contextMenuContainer = null;
  if (!root || !container) return;
  queueMicrotask(() => {
    root.unmount();
    container.remove();
  });
}

export function showContextMenu(options: ContextMenuOptions) {
  hideContextMenu();
  const container = document.createElement("div");
  container.className = "bp6-portal kui-context-menu-portal";
  document.body.append(container);
  const root = createRoot(container);
  contextMenuContainer = container;
  contextMenuRoot = root;
  root.render(<ContextMenuOverlay {...options} />);
}

function ContextMenuOverlay({
  content,
  popoverClassName,
  targetOffset,
}: ContextMenuOptions) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;
    const bounds = popover.getBoundingClientRect();
    popover.style.left = `${Math.min(targetOffset.left, window.innerWidth - bounds.width - 8)}px`;
    popover.style.top = `${Math.min(targetOffset.top, window.innerHeight - bounds.height - 8)}px`;
    const firstItem = popover.querySelector<HTMLElement>(
      '[role="menuitem"]:not([aria-disabled="true"])',
    );
    firstItem?.focus({ preventScroll: true });
  }, [targetOffset.left, targetOffset.top]);

  useLayoutEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hideContextMenu();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="bp6-overlay bp6-overlay-open kui-context-menu-overlay">
      <div
        className="bp6-context-menu-backdrop bp6-overlay-backdrop"
        onMouseDown={hideContextMenu}
      />
      <div
        className="bp6-popover-transition-container bp6-popover-enter-done"
        style={{
          left: targetOffset.left,
          position: "fixed",
          top: targetOffset.top,
        }}
      >
        <div
          className={classes(
            "bp6-popover",
            "kui-context-menu-popover",
            popoverClassName,
          )}
          data-kui-popover-root="true"
          onClick={(event) => {
            if (
              (event.target as HTMLElement).closest('[data-kui-dismiss="true"]')
            ) {
              hideContextMenu();
            }
          }}
          ref={popoverRef}
        >
          <div className="bp6-popover-content">{content}</div>
        </div>
      </div>
    </div>
  );
}
