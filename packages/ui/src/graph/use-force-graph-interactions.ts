import {
  useRef,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  clamp,
  createAnchoredViewTransform,
  getDistance,
  getMidpoint,
  screenToGraph,
  type ViewTransform,
} from "./force-graph-geometry.js";
import type {
  ForceGraphCanvasSize,
  ForceGraphEdge,
  ForceGraphNode,
  ForceGraphPosition,
  ForceGraphSimulationNode,
  RuntimeConfig,
} from "./force-graph-types.js";

type CanvasInteraction =
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

const TOUCH_DRAG_THRESHOLD = 8;
const TOUCH_HIT_SLOP = 18;
const POINTER_HIT_SLOP = 7;

interface ForceGraphInteractionOptions<
  Node extends ForceGraphNode,
  Edge extends ForceGraphEdge,
> {
  alphaRef: MutableRefObject<number>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  fitGraph: () => void;
  invalidateCanvas: () => void;
  nodesRef: MutableRefObject<Map<string, ForceGraphSimulationNode<Node>>>;
  propsRef: MutableRefObject<RuntimeConfig<Node, Edge>>;
  sizeRef: MutableRefObject<ForceGraphCanvasSize>;
  viewRef: MutableRefObject<ViewTransform>;
  zoomAt: (multiplier: number, clientPoint?: { x: number; y: number }) => void;
}

export function useForceGraphInteractions<
  Node extends ForceGraphNode,
  Edge extends ForceGraphEdge,
>({
  alphaRef,
  canvasRef,
  fitGraph,
  invalidateCanvas,
  nodesRef,
  propsRef,
  sizeRef,
  viewRef,
  zoomAt,
}: ForceGraphInteractionOptions<Node, Edge>) {
  const interactionRef = useRef<CanvasInteraction | null>(null);
  const activePointersRef = useRef(new Map<number, ForceGraphPosition>());

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      x: clientX - (rect?.left ?? 0),
      y: clientY - (rect?.top ?? 0),
    };
  };

  const findNodeAt = (
    clientX: number,
    clientY: number,
    hitSlop = POINTER_HIT_SLOP,
  ) => {
    const point = getCanvasPoint(clientX, clientY);
    const { width, height } = sizeRef.current;
    const graphPoint = screenToGraph(
      point.x,
      point.y,
      viewRef.current,
      width,
      height,
    );
    const visibleIds = propsRef.current.visibleNodeIds;
    let closest: ForceGraphSimulationNode<Node> | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const node of nodesRef.current.values()) {
      if (!visibleIds.has(node.id)) continue;
      const distance = Math.hypot(node.x - graphPoint.x, node.y - graphPoint.y);
      const radius =
        propsRef.current.getNodeRadius(node) *
          propsRef.current.display.nodeSize +
        hitSlop / viewRef.current.scale;
      if (distance <= radius && distance < closestDistance) {
        closest = node;
        closestDistance = distance;
      }
    }
    return closest;
  };

  const createPinchInteraction = (): CanvasInteraction | null => {
    const pointers = Array.from(activePointersRef.current.entries());
    if (pointers.length < 2) return null;
    const [firstId, first] = pointers[0]!;
    const [secondId, second] = pointers[1]!;
    const midpoint = getMidpoint(first, second);
    const { width, height } = sizeRef.current;
    return {
      mode: "pinch",
      pointerIds: [firstId, secondId],
      startDistance: Math.max(1, getDistance(first, second)),
      startScale: viewRef.current.scale,
      graphAnchor: screenToGraph(
        midpoint.x,
        midpoint.y,
        viewRef.current,
        width,
        height,
      ),
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    const point = getCanvasPoint(event.clientX, event.clientY);
    activePointersRef.current.set(event.pointerId, point);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (activePointersRef.current.size >= 2) {
      interactionRef.current = createPinchInteraction();
      propsRef.current.onHoverNode(null);
      event.currentTarget.classList.remove(
        "is-dragging-node",
        "is-over-node",
        "is-panning",
      );
      event.currentTarget.classList.add("is-pinching");
      return;
    }

    const touchLike = event.pointerType !== "mouse";
    const node = findNodeAt(
      event.clientX,
      event.clientY,
      touchLike ? TOUCH_HIT_SLOP : POINTER_HIT_SLOP,
    );
    if (node) {
      interactionRef.current = {
        mode: "node",
        pointerId: event.pointerId,
        startX: point.x,
        startY: point.y,
        nodeId: node.id,
        dragging: !touchLike,
      };
      if (!touchLike) {
        propsRef.current.onSelectNode(node.id);
        node.fixed = true;
        node.vx = 0;
        node.vy = 0;
        event.currentTarget.classList.add("is-dragging-node");
      }
      return;
    }

    if (!touchLike) propsRef.current.onSelectNode(null);
    interactionRef.current = {
      mode: "pan",
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
      viewX: viewRef.current.x,
      viewY: viewRef.current.y,
      pointerType: event.pointerType,
      moved: false,
    };
    event.currentTarget.classList.add("is-panning");
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (activePointersRef.current.has(event.pointerId)) {
      activePointersRef.current.set(
        event.pointerId,
        getCanvasPoint(event.clientX, event.clientY),
      );
    }
    const interaction = interactionRef.current;
    if (!interaction) {
      const node = findNodeAt(event.clientX, event.clientY);
      propsRef.current.onHoverNode(node?.id ?? null);
      event.currentTarget.classList.toggle("is-over-node", Boolean(node));
      return;
    }

    if (interaction.mode === "pinch") {
      const [firstId, secondId] = interaction.pointerIds;
      const first = activePointersRef.current.get(firstId);
      const second = activePointersRef.current.get(secondId);
      if (!first || !second) return;
      const midpoint = getMidpoint(first, second);
      const nextScale = clamp(
        interaction.startScale *
          (getDistance(first, second) / interaction.startDistance),
        0.28,
        3.2,
      );
      const { width, height } = sizeRef.current;
      viewRef.current = createAnchoredViewTransform(
        nextScale,
        midpoint,
        interaction.graphAnchor,
        width,
        height,
      );
      invalidateCanvas();
      return;
    }

    if (interaction.pointerId !== event.pointerId) return;
    const point = getCanvasPoint(event.clientX, event.clientY);
    if (interaction.mode === "pan") {
      interaction.moved ||=
        Math.hypot(
          point.x - interaction.startX,
          point.y - interaction.startY,
        ) >= TOUCH_DRAG_THRESHOLD;
      viewRef.current.x = interaction.viewX + point.x - interaction.startX;
      viewRef.current.y = interaction.viewY + point.y - interaction.startY;
      invalidateCanvas();
      return;
    }

    const node = nodesRef.current.get(interaction.nodeId);
    if (!node) return;
    if (!interaction.dragging) {
      const moved = Math.hypot(
        point.x - interaction.startX,
        point.y - interaction.startY,
      );
      if (moved < TOUCH_DRAG_THRESHOLD) return;
      interaction.dragging = true;
      propsRef.current.onSelectNode(node.id);
      node.fixed = true;
      event.currentTarget.classList.add("is-dragging-node");
    }
    const { width, height } = sizeRef.current;
    const graphPoint = screenToGraph(
      point.x,
      point.y,
      viewRef.current,
      width,
      height,
    );
    node.x = graphPoint.x;
    node.y = graphPoint.y;
    node.vx = 0;
    node.vy = 0;
    alphaRef.current = Math.max(alphaRef.current, 0.24);
    invalidateCanvas();
  };

  const stopInteraction = (
    event: ReactPointerEvent<HTMLCanvasElement>,
    cancelled = false,
  ) => {
    activePointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const interaction = interactionRef.current;
    if (interaction?.mode === "pinch") {
      if (activePointersRef.current.size >= 2) {
        interactionRef.current = createPinchInteraction();
        return;
      }
      const remaining = activePointersRef.current.entries().next().value as
        [number, ForceGraphPosition] | undefined;
      if (remaining) {
        const [pointerId, point] = remaining;
        interactionRef.current = {
          mode: "pan",
          pointerId,
          startX: point.x,
          startY: point.y,
          viewX: viewRef.current.x,
          viewY: viewRef.current.y,
          pointerType: "touch",
          moved: true,
        };
        event.currentTarget.classList.remove("is-pinching");
        event.currentTarget.classList.add("is-panning");
        return;
      }
    } else if (interaction && interaction.pointerId !== event.pointerId) {
      return;
    }

    if (!cancelled && interaction?.mode === "node" && !interaction.dragging) {
      propsRef.current.onSelectNode(interaction.nodeId);
    }
    if (
      !cancelled &&
      interaction?.mode === "pan" &&
      interaction.pointerType !== "mouse" &&
      !interaction.moved
    ) {
      propsRef.current.onSelectNode(null);
    }

    interactionRef.current = null;
    event.currentTarget.classList.remove(
      "is-panning",
      "is-pinching",
      "is-dragging-node",
    );
  };

  const handleWheel = (event: ReactWheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const point = getCanvasPoint(event.clientX, event.clientY);
    zoomAt(event.deltaY > 0 ? 0.9 : 1.1, point);
  };

  const handleDoubleClick = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const node = findNodeAt(event.clientX, event.clientY);
    if (node) {
      node.fixed = false;
      alphaRef.current = 0.72;
      invalidateCanvas();
    } else {
      fitGraph();
    }
  };

  const handleContextMenu = (event: ReactMouseEvent<HTMLCanvasElement>) => {
    const node = findNodeAt(event.clientX, event.clientY);
    if (!node) return;

    event.preventDefault();
    propsRef.current.onSelectNode(node.id);
    propsRef.current.onContextNode(node, {
      left: event.clientX,
      top: event.clientY,
    });
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (interactionRef.current) return;
    propsRef.current.onHoverNode(null);
    event.currentTarget.classList.remove("is-over-node");
  };

  return {
    onContextMenu: handleContextMenu,
    onDoubleClick: handleDoubleClick,
    onPointerCancel: (event: ReactPointerEvent<HTMLCanvasElement>) =>
      stopInteraction(event, true),
    onPointerDown: handlePointerDown,
    onPointerLeave: handlePointerLeave,
    onPointerMove: handlePointerMove,
    onPointerUp: (event: ReactPointerEvent<HTMLCanvasElement>) =>
      stopInteraction(event),
    onWheel: handleWheel,
  };
}
