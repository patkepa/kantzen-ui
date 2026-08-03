import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
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

export interface PopoverOffsetModifier {
  enabled?: boolean;
  options?: {
    offset?: readonly [skidding: number, distance: number];
  };
}

export interface PopoverModifiers {
  offset?: PopoverOffsetModifier;
}

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
  modifiers?: PopoverModifiers;
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

type PopoverTransitionStyle = CSSProperties & {
  "--kui-popover-transition-duration": string;
};

const VIEWPORT_MARGIN = 8;
const POPOVER_GAP = 6;
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

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
  modifiers?: PopoverModifiers,
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

  const offsetModifier = modifiers?.offset;
  if (offsetModifier?.enabled !== false) {
    const [skidding = 0, distance = 0] = offsetModifier?.options?.offset ?? [];
    if (placement.startsWith("top")) {
      left += skidding;
      top -= distance;
    } else if (placement.startsWith("bottom")) {
      left += skidding;
      top += distance;
    } else if (placement.startsWith("left")) {
      left -= distance;
      top += skidding;
    } else if (placement.startsWith("right")) {
      left += distance;
      top += skidding;
    }
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
  arrow = true,
  captureDismiss = false,
  children,
  className,
  content,
  defaultIsOpen = false,
  disabled = false,
  fill,
  hoverCloseDelay = 300,
  hoverOpenDelay = 150,
  inheritDarkTheme = true,
  interactionKind = PopoverInteractionKind.CLICK,
  isOpen: controlledOpen,
  minimal,
  modifiers,
  onInteraction,
  openOnTargetFocus = true,
  placement,
  popoverClassName,
  portalClassName,
  position,
  transitionDuration = 100,
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
  const normalizedPlacement = normalizePlacement(placement ?? position);
  const canUseDOM = typeof document !== "undefined";

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
        normalizedPlacement,
        modifiers,
      ),
    );
  }, [modifiers, normalizedPlacement]);

  useIsomorphicLayoutEffect(() => {
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
      {isOpen && content && canUseDOM
        ? createPortal(
            <div
              className={classes(
                "kui-popover-portal",
                "bp6-portal",
                inheritDarkTheme && "bp6-dark kui-dark dark",
                portalClassName,
              )}
              onMouseEnter={isHover ? clearTimers : undefined}
              onMouseLeave={isHover ? scheduleClose : undefined}
            >
              <div className="bp6-overlay bp6-overlay-open bp6-overlay-inline">
                <div
                  className="kui-popover-transition bp6-popover-transition-container bp6-popover-enter-done"
                  style={
                    {
                      "--kui-popover-transition-duration": `${Math.max(0, transitionDuration)}ms`,
                      left: coordinates.left,
                      position: "fixed",
                      top: coordinates.top,
                    } as PopoverTransitionStyle
                  }
                >
                  <div
                    className={classes(
                      "kui-popover",
                      "bp6-popover",
                      minimal && "bp6-minimal",
                      popoverClassName,
                    )}
                    data-kui-popover-root="true"
                    data-placement={normalizedPlacement}
                    onClick={(event) => {
                      const dismissTarget = (
                        event.target as HTMLElement
                      ).closest<HTMLElement>('[data-kui-dismiss="true"]');
                      if (!dismissTarget) return;

                      const dismissPopover = dismissTarget.closest(
                        '[data-kui-popover-root="true"]',
                      );
                      if (
                        captureDismiss ||
                        dismissPopover === event.currentTarget
                      ) {
                        changeOpen(false, event);
                      }
                    }}
                    ref={popoverRef}
                  >
                    {arrow ? (
                      <svg
                        aria-hidden="true"
                        className="bp6-popover-arrow"
                        viewBox="0 0 16 8"
                      >
                        <path
                          className="bp6-popover-arrow-border"
                          d="M0 8 8 0l8 8"
                        />
                        <path
                          className="bp6-popover-arrow-fill"
                          d="M1 8 8 1l7 7"
                        />
                      </svg>
                    ) : null}
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
