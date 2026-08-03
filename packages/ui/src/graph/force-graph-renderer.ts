import type { ViewTransform } from "./force-graph-geometry.js";
import type {
  ForceGraphEdge,
  ForceGraphEdgeState,
  ForceGraphNode,
  ForceGraphNodeState,
  ForceGraphNodeStyle,
  ForceGraphSimulationNode,
  ForceGraphCanvasSize,
  RuntimeConfig,
} from "./force-graph-types.js";

const EMPTY_NODE_IDS = new Set<string>();
const NODE_IMAGE_SIZE = 128;
const MAXIMUM_NODE_IMAGE_COUNT = 64;

interface NodeImageCacheEntry {
  bitmap: ImageBitmap | null;
  failed: boolean;
  listeners: Set<() => void>;
}

const nodeImageCache = new Map<string, NodeImageCacheEntry>();

function lightenColor(color: string, amount: number) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (!match) return color;
  const lighten = (value: string) =>
    Math.round(
      Number.parseInt(value, 16) + (255 - Number.parseInt(value, 16)) * amount,
    );
  return `rgb(${lighten(match[1]!)}, ${lighten(match[2]!)}, ${lighten(match[3]!)})`;
}

export function drawGraph<
  Node extends ForceGraphNode,
  Edge extends ForceGraphEdge,
>(
  canvas: HTMLCanvasElement | null,
  nodesById: Map<string, ForceGraphSimulationNode<Node>>,
  size: ForceGraphCanvasSize,
  view: ViewTransform,
  config: RuntimeConfig<Node, Edge>,
  invalidateCanvas: () => void,
) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  context.setTransform(size.pixelRatio, 0, 0, size.pixelRatio, 0, 0);
  context.clearRect(0, 0, size.width, size.height);
  context.save();
  context.translate(size.width / 2 + view.x, size.height / 2 + view.y);
  context.scale(view.scale, view.scale);

  const focusNodeId = config.hoveredNodeId ?? config.selectedNodeId;
  const focusedNode = focusNodeId ? (nodesById.get(focusNodeId) ?? null) : null;
  const connections = focusNodeId
    ? createConnectionSet(config.visibleEdges, focusNodeId)
    : EMPTY_NODE_IDS;
  const visibleNodes = Array.from(nodesById.values()).filter((node) =>
    config.visibleNodeIds.has(node.id),
  );
  config.drawBackground?.(context, visibleNodes, focusedNode);

  context.lineCap = "round";
  for (const edge of config.visibleEdges) {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    if (!source || !target) continue;
    const state: ForceGraphEdgeState = {
      focused: focusNodeId === edge.source || focusNodeId === edge.target,
      searched:
        config.searchMatches.has(edge.source) ||
        config.searchMatches.has(edge.target),
      faded: Boolean(
        focusNodeId &&
        focusNodeId !== edge.source &&
        focusNodeId !== edge.target,
      ),
      scale: view.scale,
    };
    const style = config.getEdgeStyle?.(edge, state) ?? {
      stroke: state.focused
        ? "rgba(59, 130, 246, 0.78)"
        : state.searched
          ? "rgba(96, 165, 250, 0.48)"
          : state.faded
            ? "rgba(157, 168, 182, 0.055)"
            : "rgba(160, 170, 185, 0.2)",
      width: state.focused ? 1.55 : 0.9,
    };
    context.beginPath();
    context.moveTo(source.x, source.y);
    context.lineTo(target.x, target.y);
    context.strokeStyle = style.stroke;
    context.lineWidth = (style.width ?? 0.9) / view.scale;
    context.setLineDash((style.dash ?? []).map((value) => value / view.scale));
    context.stroke();
    if (config.display.arrows && !state.faded) {
      drawArrowhead(
        context,
        source,
        target,
        config.getNodeRadius(target) * config.display.nodeSize,
        view.scale,
        state.focused,
        style.stroke,
      );
    }
  }
  context.setLineDash([]);

  for (const node of visibleNodes) {
    const state = createNodeState(
      node,
      focusNodeId,
      connections,
      config.searchMatches,
      view.scale,
    );
    const radius = config.getNodeRadius(node) * config.display.nodeSize;
    const style = config.getNodeStyle?.(node, state) ?? {
      fill: node.color ?? "#3b82f6",
      stroke: lightenColor(node.color ?? "#3b82f6", 0.2),
      strokeWidth: 1,
    };

    context.save();
    context.globalAlpha = state.faded ? 0.2 : 1;
    if (state.focused || state.searched) {
      context.beginPath();
      traceNodeShape(
        context,
        style.shape,
        node.x,
        node.y,
        radius + (state.focused ? 6 : 4),
      );
      context.strokeStyle = state.focused
        ? "rgba(59, 130, 246, 0.9)"
        : "rgba(96, 165, 250, 0.72)";
      context.lineWidth = 1.2 / view.scale;
      context.stroke();
    }
    context.beginPath();
    traceNodeShape(context, style.shape, node.x, node.y, radius);
    context.fillStyle = style.fill;
    context.strokeStyle = style.stroke;
    context.lineWidth = (style.strokeWidth ?? 1) / view.scale;
    context.fill();
    context.stroke();

    const imageUrl = config.getNodeImageUrl?.(node);
    const image = imageUrl
      ? getLoadedNodeImage(imageUrl, invalidateCanvas)
      : null;
    if (image) {
      context.save();
      context.beginPath();
      traceNodeShape(context, style.shape, node.x, node.y, radius);
      context.clip();
      drawImageCover(
        context,
        image,
        node.x - radius,
        node.y - radius,
        radius * 2,
        radius * 2,
      );
      context.restore();

      context.beginPath();
      traceNodeShape(context, style.shape, node.x, node.y, radius);
      context.stroke();
    }

    if (node.fixed) {
      context.beginPath();
      traceNodeShape(context, style.shape, node.x, node.y, radius + 3.2);
      context.strokeStyle = "rgba(225, 229, 238, 0.38)";
      context.lineWidth = 0.8 / view.scale;
      context.stroke();
    }
    context.restore();
  }

  if (config.display.labels) {
    for (const node of visibleNodes) {
      const state = createNodeState(
        node,
        focusNodeId,
        connections,
        config.searchMatches,
        view.scale,
      );
      if (config.isLabelVisible && !config.isLabelVisible(node, state))
        continue;
      const radius = config.getNodeRadius(node) * config.display.nodeSize;
      const style = config.getLabelStyle?.(node, state) ?? {};
      context.save();
      context.globalAlpha =
        style.opacity ??
        (state.faded
          ? 0.12
          : state.focused || state.connected || state.searched
            ? 1
            : 0.72);
      context.font = `${style.fontWeight ?? 500} ${(style.fontSize ?? 10) / view.scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillStyle = style.color ?? "#dfe2e8";
      context.shadowColor = "rgba(2, 4, 8, 0.95)";
      context.shadowBlur = 4 / view.scale;
      context.fillText(node.label, node.x, node.y + radius + 6 / view.scale);
      context.restore();
    }
  }

  context.restore();
}

function getLoadedNodeImage(url: string, onLoad: () => void) {
  let entry = nodeImageCache.get(url);
  if (entry) {
    nodeImageCache.delete(url);
    nodeImageCache.set(url, entry);
    if (!entry.bitmap && !entry.failed) entry.listeners.add(onLoad);
    return entry.bitmap;
  }

  entry = { bitmap: null, failed: false, listeners: new Set([onLoad]) };
  nodeImageCache.set(url, entry);
  trimNodeImageCache();
  const pendingEntry = entry;
  void loadNodeImageBitmap(url)
    .then((bitmap) => {
      if (nodeImageCache.get(url) !== pendingEntry) {
        bitmap.close();
        return;
      }
      pendingEntry.bitmap = bitmap;
      for (const listener of pendingEntry.listeners) listener();
      pendingEntry.listeners.clear();
    })
    .catch(() => {
      if (nodeImageCache.get(url) === pendingEntry) {
        pendingEntry.failed = true;
        pendingEntry.listeners.clear();
      }
    });
  return null;
}

async function loadNodeImageBitmap(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Node image returned ${response.status}`);
  const source = await createImageBitmap(await response.blob());
  const cropSize = Math.min(source.width, source.height);
  const sourceX = (source.width - cropSize) / 2;
  const sourceY = (source.height - cropSize) / 2;
  try {
    return await createImageBitmap(
      source,
      sourceX,
      sourceY,
      cropSize,
      cropSize,
      {
        resizeWidth: NODE_IMAGE_SIZE,
        resizeHeight: NODE_IMAGE_SIZE,
        resizeQuality: "high",
      },
    );
  } finally {
    source.close();
  }
}

function trimNodeImageCache() {
  while (nodeImageCache.size > MAXIMUM_NODE_IMAGE_COUNT) {
    const oldestUrl = nodeImageCache.keys().next().value;
    if (typeof oldestUrl !== "string") return;
    nodeImageCache.get(oldestUrl)?.bitmap?.close();
    nodeImageCache.delete(oldestUrl);
  }
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: ImageBitmap,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageRatio = image.width / image.height;
  const targetRatio = width / height;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.width;
  let sourceHeight = image.height;

  if (imageRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else if (imageRatio < targetRatio) {
    sourceHeight = image.width / targetRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

function traceNodeShape(
  context: CanvasRenderingContext2D,
  shape: ForceGraphNodeStyle["shape"],
  x: number,
  y: number,
  radius: number,
) {
  if (shape === "square") {
    context.rect(x - radius, y - radius, radius * 2, radius * 2);
    return;
  }
  context.arc(x, y, radius, 0, Math.PI * 2);
}

function createNodeState<Node extends ForceGraphNode>(
  node: ForceGraphSimulationNode<Node>,
  focusNodeId: string | null,
  connections: ReadonlySet<string>,
  searchMatches: ReadonlySet<string>,
  scale: number,
): ForceGraphNodeState {
  const focused = node.id === focusNodeId;
  const connected = connections.has(node.id);
  return {
    focused,
    connected,
    searched: searchMatches.has(node.id),
    faded: Boolean(focusNodeId && !focused && !connected),
    scale,
  };
}

function createConnectionSet<Edge extends ForceGraphEdge>(
  edges: readonly Edge[],
  nodeId: string,
) {
  const connected = new Set<string>();
  for (const edge of edges) {
    if (edge.source === nodeId) connected.add(edge.target);
    if (edge.target === nodeId) connected.add(edge.source);
  }
  return connected;
}

function drawArrowhead<Node extends ForceGraphNode>(
  context: CanvasRenderingContext2D,
  source: ForceGraphSimulationNode<Node>,
  target: ForceGraphSimulationNode<Node>,
  targetRadius: number,
  scale: number,
  focused: boolean,
  color: string,
) {
  const angle = Math.atan2(target.y - source.y, target.x - source.x);
  const x = target.x - Math.cos(angle) * (targetRadius + 4 / scale);
  const y = target.y - Math.sin(angle) * (targetRadius + 4 / scale);
  const size = (focused ? 5 : 4) / scale;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(
    x - Math.cos(angle - Math.PI / 6) * size,
    y - Math.sin(angle - Math.PI / 6) * size,
  );
  context.lineTo(
    x - Math.cos(angle + Math.PI / 6) * size,
    y - Math.sin(angle + Math.PI / 6) * size,
  );
  context.closePath();
  context.fillStyle = color;
  context.fill();
}
