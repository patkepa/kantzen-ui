import assert from "node:assert/strict";
import test from "node:test";

import kantzenStarlight, { kantzenExpressiveCode } from "../dist/index.js";

async function runSetup(config = {}, options) {
  const plugin = kantzenStarlight(options);
  const setup = plugin.hooks["config:setup"];
  assert.equal(typeof setup, "function");

  let update;
  await setup({
    config,
    updateConfig(value) {
      update = value;
    },
  });
  return update;
}

test("loads the theme before consumer styles and adds the code theme", async () => {
  const update = await runSetup({ customCss: ["./src/custom.css"] });

  assert.deepEqual(update.customCss, [
    "@patkepa/kantzen-starlight/styles.css",
    "./src/custom.css",
  ]);
  assert.deepEqual(update.expressiveCode, kantzenExpressiveCode);
});

test("preserves consumer Expressive Code overrides", async () => {
  const update = await runSetup({
    expressiveCode: {
      themes: ["dracula"],
      styleOverrides: { codeFontSize: "1rem" },
    },
  });

  assert.deepEqual(update.expressiveCode.themes, ["dracula"]);
  assert.equal(update.expressiveCode.styleOverrides.codeFontSize, "1rem");
  assert.equal(update.expressiveCode.styleOverrides.borderColor, "#414d61");
});

test("honors disabled Expressive Code configuration", async () => {
  const update = await runSetup({ expressiveCode: false });

  assert.equal("expressiveCode" in update, false);
  assert.deepEqual(update.customCss, ["@patkepa/kantzen-starlight/styles.css"]);
});

test("does not register the stylesheet twice", async () => {
  const update = await runSetup({
    customCss: ["@patkepa/kantzen-starlight/styles.css"],
  });

  assert.deepEqual(update.customCss, ["@patkepa/kantzen-starlight/styles.css"]);
});

test("preserves code configuration when the plugin preset is disabled", async () => {
  const update = await runSetup(
    { expressiveCode: { themes: ["dracula"] } },
    { expressiveCode: false },
  );

  assert.equal("expressiveCode" in update, false);
  assert.deepEqual(update.customCss, ["@patkepa/kantzen-starlight/styles.css"]);
});
