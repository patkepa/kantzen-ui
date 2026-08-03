import assert from "node:assert/strict";
import test from "node:test";
import {
  clamp,
  createAnchoredViewTransform,
  getDistance,
  getMidpoint,
  screenToGraph,
} from "../../dist/graph/force-graph-geometry.js";
import {
  createSimulationNodes,
  defaultPosition,
  simulateGraph,
} from "../../dist/graph/force-graph-simulation.js";

test("keeps a graph point anchored while zooming", () => {
  const screenPoint = { x: 200, y: 100 };
  const graphPoint = { x: 30, y: -10 };
  const view = createAnchoredViewTransform(
    2,
    screenPoint,
    graphPoint,
    400,
    200,
  );

  assert.deepEqual(view, { x: -60, y: 20, scale: 2 });
  assert.deepEqual(screenToGraph(200, 100, view, 400, 200), graphPoint);
  assert.deepEqual(getMidpoint({ x: 0, y: 2 }, { x: 4, y: 6 }), {
    x: 2,
    y: 4,
  });
  assert.equal(getDistance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
  assert.equal(clamp(12, -3, 9), 9);
});

test("creates simulation state and advances only visible nodes", () => {
  const nodes = [
    { id: "a", label: "A", x: -10, y: 0 },
    { id: "b", label: "B", x: 10, y: 0 },
    { id: "hidden", label: "Hidden", x: 50, y: 50 },
  ];
  const simulationNodes = createSimulationNodes(nodes);
  const alpha = { current: 1 };

  simulateGraph(
    simulationNodes,
    new Set(["a", "b"]),
    [{ id: "a-b", source: "a", target: "b" }],
    {
      forces: { center: 0, repel: 0, link: 1, distance: 10 },
      getCenterWeight: () => 1,
      getEdgeDistanceMultiplier: () => 1,
      getNodeRadius: () => 0,
    },
    alpha,
  );

  assert.ok(simulationNodes.get("a").x > -10);
  assert.ok(simulationNodes.get("b").x < 10);
  assert.deepEqual(
    {
      x: simulationNodes.get("hidden").x,
      y: simulationNodes.get("hidden").y,
    },
    { x: 50, y: 50 },
  );
  assert.equal(alpha.current, 0.987);
  assert.deepEqual(
    defaultPosition({ id: "fixed", label: "Fixed", x: 2, y: 3 }, 9),
    {
      x: 2,
      y: 3,
    },
  );
});
