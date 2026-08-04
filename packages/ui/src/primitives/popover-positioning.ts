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

export interface PopoverCoordinates {
  left: number;
  top: number;
}

const POPOVER_GAP = 6;

export function normalizePlacement(placement?: string): PopoverPlacement {
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

export function getPopoverCoordinates(
  target: DOMRect,
  popover: DOMRect,
  placement: PopoverPlacement,
  modifiers?: PopoverModifiers,
  viewportSize: ViewportSize = getViewportSize(),
): PopoverCoordinates {
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

  return clampOverlayToViewport({ left, top }, popover, viewportSize);
}
import {
  clampOverlayToViewport,
  getViewportSize,
  type ViewportSize,
} from "./overlay-positioning.js";
