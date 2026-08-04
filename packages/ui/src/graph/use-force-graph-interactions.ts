import {
  useRef,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  createAnchoredViewTransform,
  getDistance,
  getMidpoint,
  screenToGraph,
  type ViewTransform,
} from "./force-graph-geometry.js";
import { findForceGraphNodeAt } from "./force-graph-hit-testing.js";
import {
  continueInteractionAfterPinch,
  createNodeInteraction,
  createPanInteraction,
  createPinchInteraction,
  didPointerMove,
  type ForceGraphInteraction,
} from "./force-graph-interaction-state.js";
import type {
  ForceGraphCanvasSize,
  ForceGraphEdge,
  ForceGraphNode,
  ForceGraphPosition,
  ForceGraphSimulationNode,
  RuntimeConfig,
} from "./force-graph-types.js";
import { clampForceGraphScale } from "./force-graph-view.js";

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
  const interactionRef = useRef<ForceGraphInteraction | null>(null);
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
    return findForceGraphNodeAt({
      getNodeRadius: propsRef.current.getNodeRadius,
      graphPoint,
      hitSlop,
      nodeSize: propsRef.current.display.nodeSize,
      nodes: nodesRef.current.values(),
      scale: viewRef.current.scale,
      visibleNodeIds: propsRef.current.visibleNodeIds,
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    const point = getCanvasPoint(event.clientX, event.clientY);
    activePointersRef.current.set(event.pointerId, point);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (activePointersRef.current.size >= 2) {
      interactionRef.current = createPinchInteraction(
        activePointersRef.current,
        viewRef.current,
        sizeRef.current,
      );
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
      interactionRef.current = createNodeInteraction(
        event.pointerId,
        point,
        node.id,
        !touchLike,
      );
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
    interactionRef.current = createPanInteraction(
      event.pointerId,
      point,
      viewRef.current,
      event.pointerType,
    );
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
      const nextScale = clampForceGraphScale(
        interaction.startScale *
          (getDistance(first, second) / interaction.startDistance),
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
      interaction.moved ||= didPointerMove(
        interaction,
        point,
        TOUCH_DRAG_THRESHOLD,
      );
      viewRef.current.x = interaction.viewX + point.x - interaction.startX;
      viewRef.current.y = interaction.viewY + point.y - interaction.startY;
      invalidateCanvas();
      return;
    }

    const node = nodesRef.current.get(interaction.nodeId);
    if (!node) return;
    if (!interaction.dragging) {
      if (!didPointerMove(interaction, point, TOUCH_DRAG_THRESHOLD)) return;
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
      interactionRef.current = continueInteractionAfterPinch(
        activePointersRef.current,
        viewRef.current,
        sizeRef.current,
      );
      if (interactionRef.current?.mode === "pinch") {
        return;
      }
      if (interactionRef.current?.mode === "pan") {
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
