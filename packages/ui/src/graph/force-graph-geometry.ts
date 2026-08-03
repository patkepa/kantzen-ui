export interface ForceGraphPoint {
  x: number;
  y: number;
}

export interface ViewTransform extends ForceGraphPoint {
  scale: number;
}

export function createAnchoredViewTransform(
  scale: number,
  screenPoint: ForceGraphPoint,
  graphPoint: ForceGraphPoint,
  width: number,
  height: number,
): ViewTransform {
  return {
    scale,
    x: screenPoint.x - width / 2 - graphPoint.x * scale,
    y: screenPoint.y - height / 2 - graphPoint.y * scale,
  };
}

export function screenToGraph(
  x: number,
  y: number,
  view: ViewTransform,
  width: number,
  height: number,
): ForceGraphPoint {
  return {
    x: (x - width / 2 - view.x) / view.scale,
    y: (y - height / 2 - view.y) / view.scale,
  };
}

export function getMidpoint(
  first: ForceGraphPoint,
  second: ForceGraphPoint,
): ForceGraphPoint {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

export function getDistance(first: ForceGraphPoint, second: ForceGraphPoint) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}
