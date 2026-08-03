import { useEffect, type MutableRefObject, type RefObject } from "react";
import type { ViewTransform } from "./force-graph-geometry.js";
import { drawGraph } from "./force-graph-renderer.js";
import { simulateGraph } from "./force-graph-simulation.js";
import type {
  ForceGraphCanvasSize,
  ForceGraphEdge,
  ForceGraphNode,
  ForceGraphSimulationNode,
  RuntimeConfig,
} from "./force-graph-types.js";

interface ResizeRuntimeOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  fittedRef: MutableRefObject<boolean>;
  fitGraph: () => void;
  invalidateCanvas: () => void;
  sizeRef: MutableRefObject<ForceGraphCanvasSize>;
}

export function useForceGraphResize({
  canvasRef,
  fittedRef,
  fitGraph,
  invalidateCanvas,
  sizeRef,
}: ResizeRuntimeOptions) {
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
  }, [canvasRef, fitGraph, fittedRef, invalidateCanvas, sizeRef]);
}

interface AnimationRuntimeOptions<
  Node extends ForceGraphNode,
  Edge extends ForceGraphEdge,
> {
  alphaRef: MutableRefObject<number>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  invalidateCanvas: () => void;
  needsRedrawRef: MutableRefObject<boolean>;
  nodesRef: MutableRefObject<Map<string, ForceGraphSimulationNode<Node>>>;
  propsRef: MutableRefObject<RuntimeConfig<Node, Edge>>;
  scheduleRenderRef: MutableRefObject<() => void>;
  sizeRef: MutableRefObject<ForceGraphCanvasSize>;
  viewRef: MutableRefObject<ViewTransform>;
}

export function useForceGraphAnimation<
  Node extends ForceGraphNode,
  Edge extends ForceGraphEdge,
>({
  alphaRef,
  canvasRef,
  invalidateCanvas,
  needsRedrawRef,
  nodesRef,
  propsRef,
  scheduleRenderRef,
  sizeRef,
  viewRef,
}: AnimationRuntimeOptions<Node, Edge>) {
  useEffect(() => {
    let active = true;
    let frame: number | null = null;
    let canvasVisible = true;

    const cancelScheduledFrame = () => {
      if (frame === null) return;
      window.cancelAnimationFrame(frame);
      frame = null;
    };

    const scheduleRender = () => {
      if (!active || document.hidden || !canvasVisible || frame !== null) {
        return;
      }
      frame = window.requestAnimationFrame(renderFrame);
    };

    const renderFrame = () => {
      frame = null;
      if (!active || document.hidden || !canvasVisible) return;

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
      canvasVisible = entry?.isIntersecting ?? true;
      if (canvasVisible) invalidateCanvas();
      else cancelScheduledFrame();
    });

    scheduleRenderRef.current = scheduleRender;
    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (canvasRef.current) intersectionObserver.observe(canvasRef.current);
    invalidateCanvas();

    return () => {
      active = false;
      scheduleRenderRef.current = () => {};
      cancelScheduledFrame();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      intersectionObserver.disconnect();
    };
  }, [
    alphaRef,
    canvasRef,
    invalidateCanvas,
    needsRedrawRef,
    nodesRef,
    propsRef,
    scheduleRenderRef,
    sizeRef,
    viewRef,
  ]);
}
