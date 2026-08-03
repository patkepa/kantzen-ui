# @kantzen-ui/graph

A reusable, data-agnostic force-directed graph rendered on a responsive canvas.
It includes pan, wheel and pinch zoom, node dragging, selection, filtering,
custom node and edge styling, image nodes, and an imperative fit/focus API.

```tsx
import { ForceGraphCanvas } from "@kantzen-ui/graph";
import "@kantzen-ui/graph/styles.css";

export function ServiceGraph() {
  return (
    <ForceGraphCanvas
      nodes={[
        { id: "api", label: "API" },
        { id: "db", label: "Database" },
      ]}
      edges={[{ id: "api-db", source: "api", target: "db" }]}
    />
  );
}
```

Keep domain-specific controls, filtering, and inspector content in the
consuming application and provide presentation through the callback props.
