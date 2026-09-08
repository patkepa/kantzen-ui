---
title: Theme reference
description: Representative documentation elements for visual and build validation.
---

The fixture includes common documentation elements so changes to the theme can
be reviewed in one place.

:::note
Projects can add their own CSS after the theme when they need a local extension.
:::

## Installation

```bash
npm install @patkepa/kantzen-ui @patkepa/kantzen-starlight
```

## Responsibilities

| Theme package         | Consuming project        |
| --------------------- | ------------------------ |
| Color and typography  | Title and description    |
| Navigation chrome     | Logo and favicon         |
| Markdown presentation | Sidebar and integrations |
| Code-block defaults   | Documentation content    |

> Keep product-specific rules in the consuming project unless they are useful
> to every Kantzen documentation site.
