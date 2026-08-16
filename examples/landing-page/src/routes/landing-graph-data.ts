import type { ForceGraphEdge, ForceGraphNode } from "@patkepa/kantzen-ui/graph";

export interface LandingGraphNode extends ForceGraphNode {
  kind: "core" | "service";
}

export const landingGraphNodes: readonly LandingGraphNode[] = [
  {
    id: "kantzen",
    label: "Kantzen system",
    kind: "core",
    x: 0,
    y: 0,
    radius: 15,
  },
  { id: "theme", label: "Theme", kind: "service", x: 0, y: -130, radius: 9 },
  {
    id: "components",
    label: "Components",
    kind: "service",
    x: 145,
    y: -56,
    radius: 9,
  },
  {
    id: "interactions",
    label: "Interactions",
    kind: "service",
    x: 122,
    y: 104,
    radius: 9,
  },
  {
    id: "graph",
    label: "Graph",
    kind: "service",
    x: -118,
    y: 104,
    radius: 9,
  },
  {
    id: "shells",
    label: "Shells",
    kind: "service",
    x: -145,
    y: -56,
    radius: 9,
  },
];

export const landingGraphEdges: readonly ForceGraphEdge[] = landingGraphNodes
  .filter((node) => node.id !== "kantzen")
  .map((node) => ({
    id: `kantzen-${node.id}`,
    source: "kantzen",
    target: node.id,
  }));
