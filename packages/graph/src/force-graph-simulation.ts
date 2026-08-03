import type {
  ForceGraphEdge,
  ForceGraphForces,
  ForceGraphNode,
  ForceGraphPosition,
  ForceGraphSimulationNode,
} from "./force-graph-canvas.js";
import { clamp } from "./force-graph-geometry.js";

interface MutableValue<Value> {
  current: Value;
}

interface ForceGraphSimulationConfig<
  Node extends ForceGraphNode,
  Edge extends ForceGraphEdge,
> {
  forces: ForceGraphForces;
  getCenterWeight: (node: Node) => number;
  getEdgeDistanceMultiplier: (edge: Edge) => number;
  getNodeRadius: (node: Node) => number;
}

export function createSimulationNodes<Node extends ForceGraphNode>(
  nodes: readonly Node[],
  getInitialPosition?: (node: Node, index: number) => ForceGraphPosition,
) {
  const simulationNodes = new Map<string, ForceGraphSimulationNode<Node>>();
  for (const [index, node] of nodes.entries()) {
    const position =
      getInitialPosition?.(node, index) ?? defaultPosition(node, index);
    simulationNodes.set(node.id, {
      ...node,
      x: position.x,
      y: position.y,
      vx: 0,
      vy: 0,
      fixed: false,
    });
  }
  return simulationNodes;
}

export function defaultPosition(
  node: ForceGraphNode,
  index: number,
): ForceGraphPosition {
  if (typeof node.x === "number" && typeof node.y === "number") {
    return { x: node.x, y: node.y };
  }
  const angle = index * 2.399963229728653;
  const distance = 40 + Math.sqrt(index) * 32;
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
}

export function simulateGraph<
  Node extends ForceGraphNode,
  Edge extends ForceGraphEdge,
>(
  nodesById: Map<string, ForceGraphSimulationNode<Node>>,
  visibleNodeIds: ReadonlySet<string>,
  edges: readonly Edge[],
  config: ForceGraphSimulationConfig<Node, Edge>,
  alphaRef: MutableValue<number>,
) {
  const nodes = Array.from(nodesById.values()).filter((node) =>
    visibleNodeIds.has(node.id),
  );
  const alpha = alphaRef.current;
  const centerCoefficient = config.forces.center * 0.0022 * alpha;

  for (const node of nodes) {
    if (node.fixed) continue;
    const centerWeight = config.getCenterWeight(node);
    node.vx += -node.x * centerCoefficient * centerWeight;
    node.vy += -node.y * centerCoefficient * centerWeight;
  }

  for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
    const left = nodes[leftIndex]!;
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < nodes.length;
      rightIndex += 1
    ) {
      const right = nodes[rightIndex]!;
      let dx = right.x - left.x;
      let dy = right.y - left.y;
      let distanceSquared = dx * dx + dy * dy;
      if (distanceSquared < 0.01) {
        dx = 0.1;
        dy = 0.1;
        distanceSquared = 0.02;
      }
      const distance = Math.sqrt(distanceSquared);
      const repel =
        (config.forces.repel * 5.4 * alpha) / Math.max(distanceSquared, 110);
      const forceX = (dx / distance) * repel;
      const forceY = (dy / distance) * repel;

      if (!left.fixed) {
        left.vx -= forceX;
        left.vy -= forceY;
      }
      if (!right.fixed) {
        right.vx += forceX;
        right.vy += forceY;
      }

      const minimumDistance =
        config.getNodeRadius(left) + config.getNodeRadius(right) + 8;
      if (distance < minimumDistance) {
        const overlap =
          ((minimumDistance - distance) / Math.max(distance, 1)) * 0.16 * alpha;
        if (!left.fixed) {
          left.vx -= dx * overlap;
          left.vy -= dy * overlap;
        }
        if (!right.fixed) {
          right.vx += dx * overlap;
          right.vy += dy * overlap;
        }
      }
    }
  }

  for (const edge of edges) {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    if (!source || !target) continue;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const edgeDistance =
      config.forces.distance * config.getEdgeDistanceMultiplier(edge);
    const spring =
      ((distance - edgeDistance) / distance) *
      config.forces.link *
      0.021 *
      alpha;
    const forceX = dx * spring;
    const forceY = dy * spring;

    if (!source.fixed) {
      source.vx += forceX;
      source.vy += forceY;
    }
    if (!target.fixed) {
      target.vx -= forceX;
      target.vy -= forceY;
    }
  }

  for (const node of nodes) {
    if (node.fixed) continue;
    node.vx = clamp(node.vx * 0.84, -9, 9);
    node.vy = clamp(node.vy * 0.84, -9, 9);
    node.x += node.vx;
    node.y += node.vy;
  }

  alphaRef.current *= 0.987;
}
