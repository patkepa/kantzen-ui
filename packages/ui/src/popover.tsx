import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { classes } from "./classes.js";

export const Position = {
  AUTO: "auto",
  TOP: "top",
  TOP_LEFT: "top-start",
  TOP_RIGHT: "top-end",
  BOTTOM: "bottom",
  BOTTOM_LEFT: "bottom-start",
  BOTTOM_RIGHT: "bottom-end",
  LEFT: "left",
  LEFT_TOP: "left-start",
  LEFT_BOTTOM: "left-end",
  RIGHT: "right",
  RIGHT_TOP: "right-start",
  RIGHT_BOTTOM: "right-end",
} as const;

export const PopoverInteractionKind = {
  CLICK: "click",
  CLICK_TARGET_ONLY: "click-target",
  HOVER: "hover",
  HOVER_TARGET_ONLY: "hover-target",
} as const;

export type PopoverPlacement =
  | "auto"
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export interface PopoverProps {
  arrow?: boolean;
  captureDismiss?: boolean;
  children: ReactNode;
  className?: string;
  content?: ReactNode;
  defaultIsOpen?: boolean;
  disabled?: boolean;
  fill?: boolean;
  hoverCloseDelay?: number;
  hoverOpenDelay?: number;
  inheritDarkTheme?: boolean;
  interactionKind?: (typeof PopoverInteractionKind)[keyof typeof PopoverInteractionKind];
  isOpen?: boolean;
  minimal?: boolean;
  modifiers?: unknown;
  onInteraction?: (
    nextOpenState: boolean,
    event?: SyntheticEvent<HTMLElement>,
  ) => void;
  openOnTargetFocus?: boolean;
  placement?: PopoverPlacement | string;
  popoverClassName?: string;
  portalClassName?: string;
  position?: string;
  transitionDuration?: number;
}

interface Coordinates {
  left: number;
  top: number;
}

const VIEWPORT_MARGIN = 8;
const POPOVER_GAP = 6;

function normalizePlacement(placement?: string): PopoverPlacement {
  if (!placement || placement === "auto") return "bottom-start";
  const aliases: Record<string, PopoverPlacement> = {
    "bottom-left": "bottom-start",
    "bottom-right": "bottom-end",
    "top-left": "top-start",
    "top-right": "top-end",
    "left-top": "left-start",
    "left-bottom": "left-end",
    "right-top": "right-start",
    "right-bottom": "right-end",
  };
  return aliases[placement] ?? (placement as PopoverPlacement);
}

function getCoordinates(
  target: DOMRect,
  popover: DOMRect,
  placement: PopoverPlacement,
): Coordinates {
  let left = target.left;
  let top = target.bottom + POPOVER_GAP;

  if (placement.startsWith("top"))
    top = target.top - popover.height - POPOVER_GAP;
  if (placement.startsWith("left"))
    left = target.left - popover.width - POPOVER_GAP;
  if (placement.startsWith("right")) left = target.right + POPOVER_GAP;

  if (placement === "top" || placement === "bottom") {
    left = target.left + (target.width - popover.width) / 2;
  } else if (
    placement.endsWith("end") &&
    !placement.startsWith("left") &&
    !placement.startsWith("right")
  ) {
    left = target.right - popover.width;
  }

  if (placement === "left" || placement === "right") {
    top = target.top + (target.height - popover.height) / 2;
  } else if (
    placement.endsWith("end") &&
    (placement.startsWith("left") || placement.startsWith("right"))
  ) {
    top = target.bottom - popover.height;
  } else if (placement.startsWith("left") || placement.startsWith("right")) {
    top = target.top;
  }

  return {
    left: Math.min(
      Math.max(left, VIEWPORT_MARGIN),
      Math.max(
        VIEWPORT_MARGIN,
        window.innerWidth - popover.width - VIEWPORT_MARGIN,
      ),
    ),
    top: Math.min(
      Math.max(top, VIEWPORT_MARGIN),
      Math.max(
        VIEWPORT_MARGIN,
        window.innerHeight - popover.height - VIEWPORT_MARGIN,
      ),
    ),
  };
}

export function Popover({
  children,
  className,
  content,
  defaultIsOpen = false,
  disabled = false,
  fill,
  hoverCloseDelay = 300,
  hoverOpenDelay = 150,
  interactionKind = PopoverInteractionKind.CLICK,
  isOpen: controlledOpen,
  minimal,
  onInteraction,
  openOnTargetFocus = true,
  placement,
  popoverClassName,
  portalClassName,
  position,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultIsOpen);
  const [coordinates, setCoordinates] = useState<Coordinates>({
    left: 0,
    top: 0,
  });
  const targetRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<number>();
  const closeTimerRef = useRef<number>();
  const isControlled = controlledOpen !== undefined;
  const isOpen = !disabled && (controlledOpen ?? uncontrolledOpen);
  const isHover = interactionKind.startsWith("hover");

  const changeOpen = useCallback(
    (nextOpen: boolean, event?: SyntheticEvent<HTMLElement>) => {
      if (disabled) return;
      if (!isControlled) setUncontrolledOpen(nextOpen);
      onInteraction?.(nextOpen, event);
    },
    [disabled, isControlled, onInteraction],
  );

  const clearTimers = useCallback(() => {
    window.clearTimeout(openTimerRef.current);
    window.clearTimeout(closeTimerRef.current);
  }, []);

  const scheduleOpen = useCallback(() => {
    clearTimers();
    openTimerRef.current = window.setTimeout(
      () => changeOpen(true),
      hoverOpenDelay,
    );
  }, [changeOpen, clearTimers, hoverOpenDelay]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimerRef.current = window.setTimeout(
      () => changeOpen(false),
      hoverCloseDelay,
    );
  }, [changeOpen, clearTimers, hoverCloseDelay]);

  const updatePosition = useCallback(() => {
    const target = targetRef.current;
    const popover = popoverRef.current;
    if (!target || !popover) return;
    setCoordinates(
      getCoordinates(
        target.getBoundingClientRect(),
        popover.getBoundingClientRect(),
        normalizePlacement(placement ?? position),
      ),
    );
  }, [placement, position]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    return () => window.cancelAnimationFrame(frame);
  }, [content, isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const node = event.target as Node;
      if (
        targetRef.current?.contains(node) ||
        popoverRef.current?.contains(node)
      )
        return;
      changeOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") changeOpen(false);
    };
    window.addEventListener("resize", updatePosition, { passive: true });
    window.addEventListener("scroll", updatePosition, {
      capture: true,
      passive: true,
    });
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, { capture: true });
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeOpen, isOpen, updatePosition]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <>
      <span
        className={classes(
          "kui-popover-target",
          "bp6-popover-target",
          fill && "bp6-fill",
          isOpen && "bp6-popover-open",
          className,
        )}
        onClick={(event) => {
          if (!isHover) changeOpen(!isOpen, event);
        }}
        onFocus={isHover && openOnTargetFocus ? scheduleOpen : undefined}
        onBlur={isHover && openOnTargetFocus ? scheduleClose : undefined}
        onMouseEnter={isHover ? scheduleOpen : undefined}
        onMouseLeave={isHover ? scheduleClose : undefined}
        ref={targetRef}
      >
        {children}
      </span>
      {isOpen && content
        ? createPortal(
            <div
              className={classes(
                "kui-popover-portal",
                "bp6-portal",
                portalClassName,
              )}
              onMouseEnter={isHover ? clearTimers : undefined}
              onMouseLeave={isHover ? scheduleClose : undefined}
            >
              <div className="bp6-overlay bp6-overlay-open bp6-overlay-inline">
                <div
                  className="bp6-popover-transition-container bp6-popover-enter-done"
                  style={{
                    left: coordinates.left,
                    position: "fixed",
                    top: coordinates.top,
                  }}
                >
                  <div
                    className={classes(
                      "kui-popover",
                      "bp6-popover",
                      minimal && "bp6-minimal",
                      popoverClassName,
                    )}
                    data-kui-popover-root="true"
                    onClick={(event) => {
                      if (
                        (event.target as HTMLElement).closest(
                          '[data-kui-dismiss="true"]',
                        )
                      ) {
                        changeOpen(false, event);
                      }
                    }}
                    ref={popoverRef}
                  >
                    <div className="bp6-popover-content">{content}</div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export const PopoverNext = Popover;

export interface TooltipProps extends Omit<PopoverProps, "content"> {
  content: ReactNode;
}

export function Tooltip({ content, ...props }: TooltipProps) {
  return (
    <Popover
      {...props}
      interactionKind={PopoverInteractionKind.HOVER}
      minimal
      popoverClassName={classes("bp6-tooltip", props.popoverClassName)}
      content={<div className="bp6-popover-content">{content}</div>}
    />
  );
}
