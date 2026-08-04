import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { classes } from "./classes.js";
import {
  getPopoverCoordinates,
  normalizePlacement,
  type PopoverCoordinates,
  type PopoverModifiers,
  type PopoverPlacement,
} from "./popover-positioning.js";
import { useDismissibleLayer } from "./use-dismissible-layer.js";

export { Position } from "./popover-positioning.js";
export type {
  PopoverModifiers,
  PopoverOffsetModifier,
  PopoverPlacement,
} from "./popover-positioning.js";

export const PopoverInteractionKind = {
  CLICK: "click",
  CLICK_TARGET_ONLY: "click-target",
  HOVER: "hover",
  HOVER_TARGET_ONLY: "hover-target",
} as const;

export interface PopoverProps {
  arrow?: boolean;
  captureDismiss?: boolean;
  children?: ReactNode;
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
  renderTarget?: (props: PopoverTargetProps) => ReactElement;
  transitionDuration?: number;
}

export interface PopoverTargetProps extends HTMLAttributes<HTMLElement> {
  setTargetElement: (element: HTMLElement | null) => void;
}

type PopoverTransitionStyle = CSSProperties & {
  "--kui-popover-transition-duration": string;
};

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

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
  renderTarget,
  transitionDuration = 100,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultIsOpen);
  const [coordinates, setCoordinates] = useState<PopoverCoordinates>({
    left: 0,
    top: 0,
  });
  const targetRef = useRef<HTMLElement | null>(null);
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
      getPopoverCoordinates(
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

  const dismissibleRefs = useMemo(() => [targetRef, popoverRef] as const, []);
  const dismissPopover = useCallback(() => changeOpen(false), [changeOpen]);

  useDismissibleLayer({
    dismissOnOutsidePointer: true,
    enabled: isOpen,
    insideRefs: dismissibleRefs,
    onDismiss: dismissPopover,
  });

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("resize", updatePosition, { passive: true });
    window.addEventListener("scroll", updatePosition, {
      capture: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, { capture: true });
    };
  }, [isOpen, updatePosition]);

  useEffect(() => clearTimers, [clearTimers]);

  const targetProps: PopoverTargetProps = {
    className: classes(
      !renderTarget && "kui-popover-target",
      !renderTarget && "bp6-popover-target",
      fill && "bp6-fill",
      isOpen && "bp6-popover-open",
      className,
    ),
    onBlur:
      isHover && !disabled && openOnTargetFocus ? scheduleClose : undefined,
    onClick: (event) => {
      if (!isHover) changeOpen(!isOpen, event);
    },
    onFocus:
      isHover && !disabled && openOnTargetFocus ? scheduleOpen : undefined,
    onMouseEnter: isHover && !disabled ? scheduleOpen : undefined,
    onMouseLeave: isHover && !disabled ? scheduleClose : undefined,
    setTargetElement: (element) => {
      targetRef.current = element;
    },
  };
  const { setTargetElement, ...targetElementProps } = targetProps;
  const renderedTarget = renderTarget ? (
    // The target receives a callback setter, never the mutable ref object.
    // eslint-disable-next-line react-hooks/refs
    renderTarget(targetProps)
  ) : (
    <span {...targetElementProps} ref={setTargetElement}>
      {children}
    </span>
  );

  return (
    <>
      {renderedTarget}
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

/** @deprecated Use Popover. */
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
      content={content}
    />
  );
}
