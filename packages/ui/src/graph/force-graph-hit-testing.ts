import type {
  ForceGraphNode,
  ForceGraphPosition,
  ForceGraphSimulationNode,
} from "./force-graph-types.js";

interface HitTestOptions<Node extends ForceGraphNode> {
  getNodeRadius: (node: Node) => number;
  graphPoint: ForceGraphPosition;
  hitSlop: number;
  nodeSize: number;
  nodes: Iterable<ForceGraphSimulationNode<Node>>;
  scale: number;
  visibleNodeIds: ReadonlySet<string>;
}

export function findForceGraphNodeAt<Node extends ForceGraphNode>({
  getNodeRadius,
  graphPoint,
  hitSlop,
  nodeSize,
  nodes,
  scale,
  visibleNodeIds,
}: HitTestOptions<Node>): ForceGraphSimulationNode<Node> | null {
  let closest: ForceGraphSimulationNode<Node> | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const node of nodes) {
    if (!visibleNodeIds.has(node.id)) continue;
    const distance = Math.hypot(node.x - graphPoint.x, node.y - graphPoint.y);
    const radius = getNodeRadius(node) * nodeSize + hitSlop / scale;
    if (distance <= radius && distance < closestDistance) {
      closest = node;
      closestDistance = distance;
    }
  }

  return closest;
}
