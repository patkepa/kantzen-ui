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
import { findForceGraphNodeAt } from "../../dist/graph/force-graph-hit-testing.js";
import {
  continueInteractionAfterPinch,
  createNodeInteraction,
  createPinchInteraction,
  didPointerMove,
} from "../../dist/graph/force-graph-interaction-state.js";
import {
  calculateFitViewTransform,
  clampForceGraphScale,
} from "../../dist/graph/force-graph-view.js";

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

test("calculates a bounded fitted view without React state", () => {
  assert.deepEqual(
    calculateFitViewTransform(
      [
        { x: -100, y: -50 },
        { x: 100, y: 50 },
      ],
      { height: 600, pixelRatio: 2, width: 800 },
      { bottom: 40, left: 40, right: 40, top: 40 },
    ),
    { scale: 1.6, x: 0, y: 0 },
  );
  assert.equal(
    calculateFitViewTransform([], { height: 600, pixelRatio: 1, width: 800 }),
    null,
  );
  assert.equal(clampForceGraphScale(0.01), 0.28);
  assert.equal(clampForceGraphScale(10), 3.2);
});

test("hit-tests the closest visible node using display scale and hit slop", () => {
  const nodes = createSimulationNodes([
    { id: "near", label: "Near", radius: 8, x: 2, y: 0 },
    { id: "far", label: "Far", radius: 8, x: 9, y: 0 },
    { id: "hidden", label: "Hidden", radius: 20, x: 0, y: 0 },
  ]);
  const match = findForceGraphNodeAt({
    getNodeRadius: (node) => node.radius,
    graphPoint: { x: 0, y: 0 },
    hitSlop: 4,
    nodeSize: 1,
    nodes: nodes.values(),
    scale: 2,
    visibleNodeIds: new Set(["near", "far"]),
  });

  assert.equal(match.id, "near");
});

test("models pointer thresholds and pinch transitions as pure state", () => {
  const nodeInteraction = createNodeInteraction(
    1,
    { x: 10, y: 12 },
    "node",
    false,
  );
  assert.equal(didPointerMove(nodeInteraction, { x: 15, y: 12 }, 8), false);
  assert.equal(didPointerMove(nodeInteraction, { x: 18, y: 12 }, 8), true);

  const pointers = new Map([
    [1, { x: 0, y: 0 }],
    [2, { x: 10, y: 0 }],
  ]);
  const view = { scale: 1, x: 0, y: 0 };
  const size = { height: 100, pixelRatio: 1, width: 100 };
  const pinch = createPinchInteraction(pointers, view, size);
  assert.deepEqual(pinch.pointerIds, [1, 2]);
  assert.equal(pinch.startDistance, 10);

  pointers.delete(2);
  assert.deepEqual(continueInteractionAfterPinch(pointers, view, size), {
    mode: "pan",
    moved: true,
    pointerId: 1,
    pointerType: "touch",
    startX: 0,
    startY: 0,
    viewX: 0,
    viewY: 0,
  });
});
