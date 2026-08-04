export interface OverlayPoint {
  left: number;
  top: number;
}

export interface OverlaySize {
  height: number;
  width: number;
}

export type ViewportSize = OverlaySize;

export const OVERLAY_VIEWPORT_MARGIN = 8;

export function clampOverlayToViewport(
  point: OverlayPoint,
  overlaySize: OverlaySize,
  viewportSize: ViewportSize,
  margin = OVERLAY_VIEWPORT_MARGIN,
): OverlayPoint {
  return {
    left: Math.min(
      Math.max(point.left, margin),
      Math.max(margin, viewportSize.width - overlaySize.width - margin),
    ),
    top: Math.min(
      Math.max(point.top, margin),
      Math.max(margin, viewportSize.height - overlaySize.height - margin),
    ),
  };
}

export function getViewportSize(): ViewportSize {
  return {
    height: window.innerHeight,
    width: window.innerWidth,
  };
}
