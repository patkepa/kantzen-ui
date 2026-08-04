import { clamp, type ViewTransform } from "./force-graph-geometry.js";
import type {
  ForceGraphCanvasSize,
  ForceGraphPadding,
  ForceGraphPosition,
} from "./force-graph-types.js";

export const MIN_FORCE_GRAPH_SCALE = 0.28;
export const MAX_FORCE_GRAPH_SCALE = 3.2;

export function clampForceGraphScale(scale: number) {
  return clamp(scale, MIN_FORCE_GRAPH_SCALE, MAX_FORCE_GRAPH_SCALE);
}

export function calculateFitViewTransform(
  nodes: readonly ForceGraphPosition[],
  size: ForceGraphCanvasSize,
  padding: ForceGraphPadding = {},
): ViewTransform | null {
  if (nodes.length === 0 || size.width <= 1 || size.height <= 1) return null;

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x);
    maxY = Math.max(maxY, node.y);
  }

  const leftInset = padding.left ?? 44;
  const rightInset = padding.right ?? 44;
  const topInset = padding.top ?? 88;
  const bottomInset = padding.bottom ?? 72;
  const contentWidth = Math.max(240, size.width - leftInset - rightInset);
  const contentHeight = Math.max(220, size.height - topInset - bottomInset);
  const graphWidth = Math.max(240, maxX - minX + 110);
  const graphHeight = Math.max(200, maxY - minY + 100);
  const scale = clamp(
    Math.min(contentWidth / graphWidth, contentHeight / graphHeight),
    size.width < 640 ? 0.3 : 0.42,
    1.6,
  );
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const availableCenterX = leftInset + contentWidth / 2;
  const availableCenterY = topInset + contentHeight / 2;

  return {
    x: availableCenterX - size.width / 2 - centerX * scale,
    y: availableCenterY - size.height / 2 - centerY * scale,
    scale,
  };
}
