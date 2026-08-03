import assert from "node:assert/strict";
import test from "node:test";
import { isWorkspacePathActive } from "../../dist/app-shell/workspace-route-matching.js";

test("matches workspace routes on path-segment boundaries", () => {
  assert.equal(isWorkspacePathActive("/users", "/users"), true);
  assert.equal(isWorkspacePathActive("/users", "/users/42"), true);
  assert.equal(isWorkspacePathActive("/user", "/users"), false);
  assert.equal(isWorkspacePathActive("/", "/"), true);
  assert.equal(isWorkspacePathActive("/", "/users"), false);
});

test("normalizes trailing slashes and ignores search and hash fragments", () => {
  assert.equal(isWorkspacePathActive("/users/", "/users/42"), true);
  assert.equal(isWorkspacePathActive("/users?tab=active", "/users"), true);
  assert.equal(isWorkspacePathActive("/users#active", "/users/42"), true);
});
