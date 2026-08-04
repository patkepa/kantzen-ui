import {
  getDistance,
  getMidpoint,
  screenToGraph,
  type ViewTransform,
} from "./force-graph-geometry.js";
import type {
  ForceGraphCanvasSize,
  ForceGraphPosition,
} from "./force-graph-types.js";

export type ForceGraphInteraction =
  | {
      mode: "pan";
      pointerId: number;
      startX: number;
      startY: number;
      viewX: number;
      viewY: number;
      pointerType: string;
      moved: boolean;
    }
  | {
      mode: "node";
      pointerId: number;
      startX: number;
      startY: number;
      nodeId: string;
      dragging: boolean;
    }
  | {
      mode: "pinch";
      pointerIds: [number, number];
      startDistance: number;
      startScale: number;
      graphAnchor: ForceGraphPosition;
    };

export function createPanInteraction(
  pointerId: number,
  point: ForceGraphPosition,
  view: ViewTransform,
  pointerType: string,
  moved = false,
): ForceGraphInteraction {
  return {
    mode: "pan",
    moved,
    pointerId,
    pointerType,
    startX: point.x,
    startY: point.y,
    viewX: view.x,
    viewY: view.y,
  };
}

export function createNodeInteraction(
  pointerId: number,
  point: ForceGraphPosition,
  nodeId: string,
  dragging: boolean,
): ForceGraphInteraction {
  return {
    dragging,
    mode: "node",
    nodeId,
    pointerId,
    startX: point.x,
    startY: point.y,
  };
}

export function createPinchInteraction(
  activePointers: ReadonlyMap<number, ForceGraphPosition>,
  view: ViewTransform,
  size: ForceGraphCanvasSize,
): ForceGraphInteraction | null {
  const pointers = Array.from(activePointers.entries());
  if (pointers.length < 2) return null;
  const [firstId, first] = pointers[0]!;
  const [secondId, second] = pointers[1]!;
  const midpoint = getMidpoint(first, second);
  return {
    graphAnchor: screenToGraph(
      midpoint.x,
      midpoint.y,
      view,
      size.width,
      size.height,
    ),
    mode: "pinch",
    pointerIds: [firstId, secondId],
    startDistance: Math.max(1, getDistance(first, second)),
    startScale: view.scale,
  };
}

export function didPointerMove(
  interaction: { startX: number; startY: number },
  point: ForceGraphPosition,
  threshold: number,
) {
  return (
    Math.hypot(point.x - interaction.startX, point.y - interaction.startY) >=
    threshold
  );
}

export function continueInteractionAfterPinch(
  activePointers: ReadonlyMap<number, ForceGraphPosition>,
  view: ViewTransform,
  size: ForceGraphCanvasSize,
): ForceGraphInteraction | null {
  if (activePointers.size >= 2) {
    return createPinchInteraction(activePointers, view, size);
  }
  const remaining = activePointers.entries().next().value as
    [number, ForceGraphPosition] | undefined;
  return remaining
    ? createPanInteraction(remaining[0], remaining[1], view, "touch", true)
    : null;
}
