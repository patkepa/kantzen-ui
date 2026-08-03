import assert from "node:assert/strict";
import test from "node:test";
import {
  getGridNavigationPosition,
  getItemGridNavigationIndex,
  getLinearNavigationIndex,
} from "../../dist/interactions/navigation-math.js";

test("moves through a vertical list and clamps at its bounds", () => {
  assert.equal(getLinearNavigationIndex("ArrowDown", 1, 4), 2);
  assert.equal(getLinearNavigationIndex("ArrowUp", 0, 4), 0);
  assert.equal(getLinearNavigationIndex("Home", 3, 4), 0);
  assert.equal(getLinearNavigationIndex("End", 0, 4), 3);
  assert.equal(getLinearNavigationIndex("ArrowRight", 1, 4), null);
});

test("supports horizontal composite controls", () => {
  assert.equal(getLinearNavigationIndex("ArrowRight", 1, 3, "horizontal"), 2);
  assert.equal(getLinearNavigationIndex("ArrowLeft", 1, 3, "horizontal"), 0);
  assert.equal(getLinearNavigationIndex("ArrowDown", 1, 3, "horizontal"), null);
});

test("moves across a grid while retaining the nearest available row", () => {
  assert.deepEqual(
    getGridNavigationPosition(
      "ArrowRight",
      { columnIndex: 0, rowIndex: 2 },
      [4, 0, 2],
    ),
    { columnIndex: 2, rowIndex: 1 },
  );
  assert.deepEqual(
    getGridNavigationPosition(
      "ArrowLeft",
      { columnIndex: 2, rowIndex: 1 },
      [4, 0, 2],
    ),
    { columnIndex: 0, rowIndex: 1 },
  );
  assert.deepEqual(
    getGridNavigationPosition(
      "End",
      { columnIndex: 0, rowIndex: 1 },
      [4, 0, 2],
    ),
    { columnIndex: 0, rowIndex: 3 },
  );
});

test("rejects invalid positions and unrelated keys", () => {
  assert.equal(getLinearNavigationIndex("ArrowDown", 0, 0), null);
  assert.equal(
    getGridNavigationPosition("PageDown", { columnIndex: 0, rowIndex: 0 }, [1]),
    null,
  );
});

test("moves through a responsive item grid without wrapping across rows", () => {
  assert.equal(getItemGridNavigationIndex("ArrowRight", 2, 8, 3), 2);
  assert.equal(getItemGridNavigationIndex("ArrowLeft", 3, 8, 3), 3);
  assert.equal(getItemGridNavigationIndex("ArrowDown", 1, 8, 3), 4);
  assert.equal(getItemGridNavigationIndex("ArrowUp", 7, 8, 3), 4);
});

test("moves to the nearest item when the last grid row is incomplete", () => {
  assert.equal(getItemGridNavigationIndex("ArrowDown", 2, 5, 3), 4);
  assert.equal(getItemGridNavigationIndex("ArrowDown", 4, 5, 3), 4);
  assert.equal(getItemGridNavigationIndex("Home", 4, 5, 3), 0);
  assert.equal(getItemGridNavigationIndex("End", 0, 5, 3), 4);
});
