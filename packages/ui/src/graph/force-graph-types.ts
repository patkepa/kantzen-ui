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
