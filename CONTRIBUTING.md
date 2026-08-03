# Contributing

## Development

Use Node.js 22.14 or newer.

```bash
npm ci
npm run format:check
npm run lint
npm test
npm run verify:packages
npm run build:playground
```

Use `npm run dev:playground` to preview the component playground locally.

## Pull Requests

- Keep changes scoped to the affected package module or example.
- Add or update README examples when public APIs change.
- Run the full validation commands before requesting review.
- Do not commit generated `dist/`, package tarballs, local caches, or `node_modules`.

## Package Changes

The public package lives in `packages/ui`. The playground in
`examples/playground` is private and should not be published.

When preparing a release, bump the `@kantzen-ui/ui` package version.
