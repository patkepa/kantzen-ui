import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  type ForwardedRef,
  type PointerEvent as ReactPointerEvent,
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
import {
  createSimulationNodes,
  simulateGraph,
} from "./force-graph-simulation.js";
import { drawGraph } from "./force-graph-renderer.js";

/** The minimum data needed to render a graph node. */
export interface ForceGraphNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  color?: string;
  radius?: number;
}

/** The minimum data needed to render a graph edge. */
export interface ForceGraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface ForceGraphForces {
  center: number;
  repel: number;
  link: number;
  distance: number;
}

export interface ForceGraphDisplay {
  arrows: boolean;
  labels: boolean;
  nodeSize: number;
}

export interface ForceGraphHandle {
  fit: () => void;
  focusNode: (nodeId: string) => void;
  reheat: () => void;
  zoomBy: (multiplier: number) => void;
}

export interface ForceGraphCanvasSize {
  width: number;
  height: number;
  pixelRatio: number;
}

export interface ForceGraphPosition {
  x: number;
  y: number;
}

export interface ForceGraphPadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface ForceGraphNodeState {
  focused: boolean;
  connected: boolean;
  searched: boolean;
  faded: boolean;
  scale: number;
}

export interface ForceGraphEdgeState {
  focused: boolean;
  searched: boolean;
  faded: boolean;
  scale: number;
}

export interface ForceGraphNodeStyle {
  fill: string;
  stroke: string;
  strokeWidth?: number;
  shape?: "circle" | "square";
}

export interface ForceGraphEdgeStyle {
  stroke: string;
  width?: number;
  dash?: number[];
}

export interface ForceGraphLabelStyle {
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  opacity?: number;
}

export type ForceGraphSimulationNode<Node extends ForceGraphNode> = Node & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed: boolean;
};

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

export interface RuntimeConfig<
  Node extends ForceGraphNode,
  Edge extends ForceGraphEdge,
> {
  visibleNodeIds: ReadonlySet<string>;
  visibleEdges: readonly Edge[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  searchMatches: ReadonlySet<string>;
  forces: ForceGraphForces;
  display: ForceGraphDisplay;
  running: boolean;
  getFitPadding?: (size: ForceGraphCanvasSize) => ForceGraphPadding;
  getCenterWeight: (node: Node) => number;
  getEdgeDistanceMultiplier: (edge: Edge) => number;
  getNodeRadius: (node: Node) => number;
  getNodeStyle?: (
    node: Node,
    state: ForceGraphNodeState,
  ) => ForceGraphNodeStyle;
  getNodeImageUrl?: (node: Node) => string | undefined;
  getEdgeStyle?: (
    edge: Edge,
    state: ForceGraphEdgeState,
  ) => ForceGraphEdgeStyle;
  getLabelStyle?: (
    node: Node,
    state: ForceGraphNodeState,
  ) => ForceGraphLabelStyle;
  isLabelVisible?: (node: Node, state: ForceGraphNodeState) => boolean;
  drawBackground?: (
    context: CanvasRenderingContext2D,
    nodes: ForceGraphSimulationNode<Node>[],
    focusedNode: ForceGraphSimulationNode<Node> | null,
  ) => void;
  onSelectNode: (nodeId: string | null) => void;
  onHoverNode: (nodeId: string | null) => void;
  onContextNode: (node: Node, point: { left: number; top: number }) => void;
}

export interface ForceGraphCanvasProps<
  Node extends ForceGraphNode,
  Edge extends ForceGraphEdge,
> {
  /** The graph data. Extra fields remain available in the renderer callbacks. */
  nodes: readonly Node[];
  edges: readonly Edge[];
  /** Defaults to every node. Pass a subset to hide nodes without rebuilding data. */
  visibleNodeIds?: ReadonlySet<string>;
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  searchMatches?: ReadonlySet<string>;
  forces?: ForceGraphForces;
  display?: ForceGraphDisplay;
  running?: boolean;
  className?: string;
  ariaLabel?: string;
  getFitPadding?: (size: ForceGraphCanvasSize) => ForceGraphPadding;
  /** Maps source coordinates into the simulation's local coordinate system. */
  getInitialPosition?: (node: Node, index: number) => ForceGraphPosition;
  getCenterWeight?: (node: Node) => number;
  getEdgeDistanceMultiplier?: (edge: Edge) => number;
  getNodeRadius?: (node: Node) => number;
  getNodeStyle?: (
    node: Node,
    state: ForceGraphNodeState,
  ) => ForceGraphNodeStyle;
  /** Draws an image inside the node shape when the returned URL is available. */
  getNodeImageUrl?: (node: Node) => string | undefined;
  getEdgeStyle?: (
    edge: Edge,
    state: ForceGraphEdgeState,
  ) => ForceGraphEdgeStyle;
  getLabelStyle?: (
    node: Node,
    state: ForceGraphNodeState,
  ) => ForceGraphLabelStyle;
  isLabelVisible?: (node: Node, state: ForceGraphNodeState) => boolean;
  /** Draws behind edges and nodes, after the canvas transform is applied. */
  drawBackground?: (
    context: CanvasRenderingContext2D,
    nodes: ForceGraphSimulationNode<Node>[],
    focusedNode: ForceGraphSimulationNode<Node> | null,
  ) => void;
  onSelectNode?: (nodeId: string | null) => void;
  onHoverNode?: (nodeId: string | null) => void;
  onContextNode?: (node: Node, point: { left: number; top: number }) => void;
}

const DEFAULT_FORCES: ForceGraphForces = {
  center: 0.22,
  repel: 180,
  link: 0.9,
  distance: 180,
};
const DEFAULT_DISPLAY: ForceGraphDisplay = {
  arrows: false,
  labels: true,
  nodeSize: 1,
};
const EMPTY_NODE_IDS = new Set<string>();
const NOOP = () => {};
const DEFAULT_CENTER_WEIGHT = () => 1;
const DEFAULT_EDGE_DISTANCE_MULTIPLIER = () => 1;
const DEFAULT_NODE_RADIUS = (node: ForceGraphNode) => node.radius ?? 8;
const TOUCH_DRAG_THRESHOLD = 8;
const TOUCH_HIT_SLOP = 18;
const POINTER_HIT_SLOP = 7;
function ForceGraphCanvasInner<
  Node extends ForceGraphNode,
  Edge extends ForceGraphEdge,
>(
  {
    nodes,
    edges,
    visibleNodeIds: visibleNodeIdsProp,
    selectedNodeId = null,
    hoveredNodeId = null,
    searchMatches = EMPTY_NODE_IDS,
    forces = DEFAULT_FORCES,
    display = DEFAULT_DISPLAY,
    running = true,
    className,
    ariaLabel = "Interactive force-directed graph. Drag nodes to pin them, drag the background to pan, and use the mouse wheel to zoom.",
    getFitPadding,
    getInitialPosition,
    getCenterWeight = DEFAULT_CENTER_WEIGHT,
    getEdgeDistanceMultiplier = DEFAULT_EDGE_DISTANCE_MULTIPLIER,
    getNodeRadius = DEFAULT_NODE_RADIUS,
    getNodeStyle,
    getNodeImageUrl,
    getEdgeStyle,
    getLabelStyle,
    isLabelVisible,
    drawBackground,
    onSelectNode = NOOP,
    onHoverNode = NOOP,
    onContextNode = NOOP,
  }: ForceGraphCanvasProps<Node, Edge>,
  ref: ForwardedRef<ForceGraphHandle>,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const allNodeIds = useMemo(
    () => new Set(nodes.map((node) => node.id)),
    [nodes],
  );
  const visibleNodeIds = visibleNodeIdsProp ?? allNodeIds;
  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (edge) =>
          visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
      ),
    [edges, visibleNodeIds],
  );
  const nodesRef = useLazyRef(() =>
    createSimulationNodes(nodes, getInitialPosition),
  );
  const sourceNodesRef = useRef(nodes);
  const sizeRef = useRef<ForceGraphCanvasSize>({
    width: 1,
    height: 1,
    pixelRatio: 1,
  });
  const viewRef = useRef<ViewTransform>({ x: 0, y: 0, scale: 0.8 });
  const interactionRef = useRef<CanvasInteraction | null>(null);
  const activePointersRef = useRef(new Map<number, ForceGraphPosition>());
  const alphaRef = useRef(1);
  const fittedRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const canvasVisibleRef = useRef(true);
  const needsRedrawRef = useRef(true);
  const scheduleRenderRef = useRef<() => void>(NOOP);
  const propsRef = useLatest<RuntimeConfig<Node, Edge>>({
    visibleNodeIds,
    visibleEdges,
    selectedNodeId,
    hoveredNodeId,
    searchMatches,
    forces,
    display,
    running,
    getFitPadding,
    getCenterWeight,
    getEdgeDistanceMultiplier,
    getNodeRadius,
    getNodeStyle,
    getNodeImageUrl,
    getEdgeStyle,
    getLabelStyle,
    isLabelVisible,
    drawBackground,
    onSelectNode,
    onHoverNode,
    onContextNode,
  });

  const invalidateCanvas = useCallback(() => {
    needsRedrawRef.current = true;
    scheduleRenderRef.current();
  }, []);

  useLayoutEffect(() => {
    invalidateCanvas();
  });

  const fitGraph = useCallback(() => {
    const { width, height } = sizeRef.current;
    const config = propsRef.current;
    const visibleNodes = Array.from(nodesRef.current.values()).filter((node) =>
      config.visibleNodeIds.has(node.id),
    );
    if (!visibleNodes.length || width <= 1 || height <= 1) return;

    const bounds = visibleNodes.reduce(
      (current, node) => ({
        minX: Math.min(current.minX, node.x),
        minY: Math.min(current.minY, node.y),
        maxX: Math.max(current.maxX, node.x),
        maxY: Math.max(current.maxY, node.y),
      }),
      {
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      },
    );
    const padding = config.getFitPadding?.(sizeRef.current) ?? {};
    const leftInset = padding.left ?? 44;
    const rightInset = padding.right ?? 44;
    const topInset = padding.top ?? 88;
    const bottomInset = padding.bottom ?? 72;
    const contentWidth = Math.max(240, width - leftInset - rightInset);
    const contentHeight = Math.max(220, height - topInset - bottomInset);
    const graphWidth = Math.max(240, bounds.maxX - bounds.minX + 110);
    const graphHeight = Math.max(200, bounds.maxY - bounds.minY + 100);
    const scale = clamp(
      Math.min(contentWidth / graphWidth, contentHeight / graphHeight),
      width < 640 ? 0.3 : 0.42,
      1.6,
    );
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const availableCenterX = leftInset + contentWidth / 2;
    const availableCenterY = topInset + contentHeight / 2;
    viewRef.current = {
      x: availableCenterX - width / 2 - centerX * scale,
      y: availableCenterY - height / 2 - centerY * scale,
      scale,
    };
    invalidateCanvas();
  }, [invalidateCanvas, nodesRef, propsRef]);

  const focusNode = useCallback(
    (nodeId: string) => {
      const node = nodesRef.current.get(nodeId);
      if (!node) return;
      const { width, height } = sizeRef.current;
      const scale = Math.max(viewRef.current.scale, 1.05);
      viewRef.current = {
        x: -node.x * scale,
        y: -node.y * scale,
        scale,
      };
      if (width < 760) viewRef.current.y -= height * 0.05;
      invalidateCanvas();
    },
    [invalidateCanvas, nodesRef],
  );

  const zoomAt = useCallback(
    (multiplier: number, clientPoint?: { x: number; y: number }) => {
      if (!canvasRef.current) return;
      const { width, height } = sizeRef.current;
      const view = viewRef.current;
      const nextScale = clamp(view.scale * multiplier, 0.28, 3.2);
      const point = clientPoint ?? { x: width / 2, y: height / 2 };
      const graphPoint = screenToGraph(point.x, point.y, view, width, height);
      viewRef.current = createAnchoredViewTransform(
        nextScale,
        point,
        graphPoint,
        width,
        height,
      );
      invalidateCanvas();
    },
    [invalidateCanvas],
  );

  useImperativeHandle(
    ref,
    () => ({
      fit: fitGraph,
      focusNode,
      reheat: () => {
        alphaRef.current = 1;
        invalidateCanvas();
      },
      zoomBy: zoomAt,
    }),
    [fitGraph, focusNode, invalidateCanvas, zoomAt],
  );

  useEffect(() => {
    if (sourceNodesRef.current === nodes) return;
    sourceNodesRef.current = nodes;
    nodesRef.current = createSimulationNodes(nodes, getInitialPosition);
    alphaRef.current = 1;
    fittedRef.current = false;
    invalidateCanvas();
  }, [getInitialPosition, invalidateCanvas, nodes, nodesRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = {
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
        pixelRatio,
      };
      canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
      if (!fittedRef.current && rect.width > 1 && rect.height > 1) {
        fittedRef.current = true;
        fitGraph();
      }
      invalidateCanvas();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => observer.disconnect();
  }, [fitGraph, invalidateCanvas]);

  useEffect(() => {
    alphaRef.current = 1;
    invalidateCanvas();
  }, [
    forces,
    getCenterWeight,
    getEdgeDistanceMultiplier,
    getNodeRadius,
    invalidateCanvas,
    visibleEdges,
    visibleNodeIds,
  ]);

  useEffect(() => {
    let active = true;

    const cancelScheduledFrame = () => {
      if (frameRef.current === null) return;
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };

    const scheduleRender = () => {
      if (
        !active ||
        document.hidden ||
        !canvasVisibleRef.current ||
        frameRef.current !== null
      ) {
        return;
      }
      frameRef.current = window.requestAnimationFrame(renderFrame);
    };

    const renderFrame = () => {
      frameRef.current = null;
      if (!active || document.hidden || !canvasVisibleRef.current) return;

      const config = propsRef.current;
      const simulationActive = config.running && alphaRef.current > 0.006;
      if (simulationActive) {
        simulateGraph(
          nodesRef.current,
          config.visibleNodeIds,
          config.visibleEdges,
          config,
          alphaRef,
        );
      }

      if (simulationActive || needsRedrawRef.current) {
        needsRedrawRef.current = false;
        drawGraph(
          canvasRef.current,
          nodesRef.current,
          sizeRef.current,
          viewRef.current,
          config,
          invalidateCanvas,
        );
      }

      if (config.running && alphaRef.current > 0.006) scheduleRender();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelScheduledFrame();
        return;
      }
      invalidateCanvas();
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      canvasVisibleRef.current = entry?.isIntersecting ?? true;
      if (canvasVisibleRef.current) invalidateCanvas();
      else cancelScheduledFrame();
    });

    scheduleRenderRef.current = scheduleRender;
    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (canvasRef.current) intersectionObserver.observe(canvasRef.current);
    invalidateCanvas();

    return () => {
      active = false;
      scheduleRenderRef.current = NOOP;
      cancelScheduledFrame();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      intersectionObserver.disconnect();
    };
  }, [invalidateCanvas, nodesRef, propsRef]);

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

  const handleContextMenu = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const node = findNodeAt(event.clientX, event.clientY);
    if (!node) return;

    event.preventDefault();
    propsRef.current.onSelectNode(node.id);
    propsRef.current.onContextNode(node, {
      left: event.clientX,
      top: event.clientY,
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className={["kui-force-graph-canvas", "force-graph-canvas", className]
        .filter(Boolean)
        .join(" ")}
      tabIndex={0}
      role="img"
      aria-label={ariaLabel}
      onContextMenu={handleContextMenu}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => stopInteraction(event)}
      onPointerCancel={(event) => stopInteraction(event, true)}
      onPointerLeave={(event) => {
        if (!interactionRef.current) {
          propsRef.current.onHoverNode(null);
          event.currentTarget.classList.remove("is-over-node");
        }
      }}
      onDoubleClick={handleDoubleClick}
    />
  );
}

export const ForceGraphCanvas = forwardRef(ForceGraphCanvasInner) as <
  Node extends ForceGraphNode,
  Edge extends ForceGraphEdge,
>(
  props: ForceGraphCanvasProps<Node, Edge> & {
    ref?: ForwardedRef<ForceGraphHandle>;
  },
) => React.ReactElement | null;

function useLazyRef<Value extends object>(createValue: () => Value) {
  const valueRef = useRef<Value | null>(null);
  if (valueRef.current === null) valueRef.current = createValue();
  return valueRef as React.MutableRefObject<Value>;
}

function useLatest<Value>(value: Value) {
  const valueRef = useRef(value);
  useLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);
  return valueRef;
}
