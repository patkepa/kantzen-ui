# @patkepa/kantzen-starlight

Kantzen's dark documentation theme for Astro Starlight. The plugin registers
the theme stylesheet and matching Expressive Code defaults while leaving site
branding, navigation, and content configuration with the consuming project.

## Install

```sh
npm install @patkepa/kantzen-ui @patkepa/kantzen-starlight
```

## Usage

```js
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import kantzenStarlight from "@patkepa/kantzen-starlight";

export default defineConfig({
  integrations: [
    starlight({
      title: "Product Docs",
      logo: {
        src: "./src/assets/logo.svg",
      },
      plugins: [kantzenStarlight()],
    }),
  ],
});
```

The package uses `@patkepa/kantzen-ui/theme.css` for the shared design tokens.
It intentionally does not register a logo, favicon, sidebar, or Starlight
component override.

The theme stylesheet loads before the site's `customCss` entries so local
styles can override theme rules with matching specificity. If you include the
theme stylesheet in `customCss` explicitly, the plugin preserves its position.

To keep a project's existing Expressive Code configuration unchanged, disable
the plugin's code preset:

```js
plugins: [kantzenStarlight({ expressiveCode: false })];
```

Consumer-provided Expressive Code values take precedence over the defaults.
