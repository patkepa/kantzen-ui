import { useLayoutEffect, useRef, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { classes } from "./classes.js";
import { clampOverlayToViewport } from "./overlay-positioning.js";
import { useDismissibleLayer } from "./use-dismissible-layer.js";

export interface ContextMenuOptions {
  content: ReactNode;
  targetOffset: { left: number; top: number };
  placement?: string;
  popoverClassName?: string;
  transitionDuration?: number;
}

export function getContextMenuPosition(
  targetOffset: ContextMenuOptions["targetOffset"],
  popoverSize: { height: number; width: number },
  viewportSize: { height: number; width: number },
) {
  return clampOverlayToViewport(targetOffset, popoverSize, viewportSize);
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
  const transitionRef = useRef<HTMLDivElement>(null);

  useDismissibleLayer({
    dismissOnOutsidePointer: false,
    enabled: true,
    onDismiss: hideContextMenu,
  });

  useLayoutEffect(() => {
    const popover = popoverRef.current;
    const transition = transitionRef.current;
    if (!popover || !transition) return;
    const bounds = popover.getBoundingClientRect();
    const position = getContextMenuPosition(
      { left: targetOffset.left, top: targetOffset.top },
      bounds,
      {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    );
    transition.style.left = `${position.left}px`;
    transition.style.top = `${position.top}px`;
    const firstItem = popover.querySelector<HTMLElement>(
      '[role="menuitem"]:not([aria-disabled="true"])',
    );
    firstItem?.focus({ preventScroll: true });
  }, [targetOffset.left, targetOffset.top]);

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
        ref={transitionRef}
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
