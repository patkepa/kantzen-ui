import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  type ForwardedRef,
} from "react";
import {
  createAnchoredViewTransform,
  screenToGraph,
  type ViewTransform,
} from "./force-graph-geometry.js";
import { createSimulationNodes } from "./force-graph-simulation.js";
import {
  calculateFitViewTransform,
  clampForceGraphScale,
} from "./force-graph-view.js";
import type {
  ForceGraphCanvasProps,
  ForceGraphCanvasSize,
  ForceGraphDisplay,
  ForceGraphEdge,
  ForceGraphForces,
  ForceGraphHandle,
  ForceGraphNode,
  RuntimeConfig,
} from "./force-graph-types.js";
import { useForceGraphInteractions } from "./use-force-graph-interactions.js";
import {
  useForceGraphAnimation,
  useForceGraphResize,
} from "./use-force-graph-runtime.js";

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
  const alphaRef = useRef(1);
  const fittedRef = useRef(false);
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

    const padding = config.getFitPadding?.(sizeRef.current) ?? {};
    const nextView = calculateFitViewTransform(
      visibleNodes,
      sizeRef.current,
      padding,
    );
    if (!nextView) return;
    viewRef.current = nextView;
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
      const nextScale = clampForceGraphScale(view.scale * multiplier);
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

  useForceGraphResize({
    canvasRef,
    fittedRef,
    fitGraph,
    invalidateCanvas,
    sizeRef,
  });

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

  useForceGraphAnimation({
    alphaRef,
    canvasRef,
    invalidateCanvas,
    needsRedrawRef,
    nodesRef,
    propsRef,
    scheduleRenderRef,
    sizeRef,
    viewRef,
  });

  const canvasInteractionProps = useForceGraphInteractions({
    alphaRef,
    canvasRef,
    fitGraph,
    invalidateCanvas,
    nodesRef,
    propsRef,
    sizeRef,
    viewRef,
    zoomAt,
  });

  return (
    <canvas
      ref={canvasRef}
      className={["kui-force-graph-canvas", "force-graph-canvas", className]
        .filter(Boolean)
        .join(" ")}
      tabIndex={0}
      role="img"
      aria-label={ariaLabel}
      {...canvasInteractionProps}
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
