# Publishing Kantzen UI to npm

Kantzen UI is a standalone npm workspace that publishes four public packages
under the `@kantzen-ui` scope. Consumer applications install released versions
from npm; Git dependencies and submodules are not part of the stable contract.

## Public packages

| Package                       | Purpose                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| `@kantzen-ui/ui`              | Main theme, icons, primitives, interactions, navigation, and components. |
| `@kantzen-ui/app-shell`       | Optional React Router application and site shells.                       |
| `@kantzen-ui/command-palette` | Optional `cmdk` command-palette composition.                             |
| `@kantzen-ui/graph`           | Optional data-agnostic force graph.                                      |

All packages use the same version initially. React and React DOM remain peer
dependencies; package-specific implementation libraries are normal
dependencies.

## Validate packed artifacts

```sh
npm ci
npm test
npm run build:playground
npm run pack:packages
```

Tarballs are written to `dist/package-tarballs/`. Install them into a temporary
consumer before the first release to verify JavaScript, declarations, styles,
and peer dependency behavior.

## One-time npm bootstrap

1. Create or reserve the `kantzen-ui` organization on npm.
2. Enable two-factor authentication for the publishing account.
3. Confirm every package name, version, repository URL, and `files` list.
4. Preview every artifact with `npm publish --dry-run --workspace <name>`.
5. Sign in and publish the initial versions:

```sh
npm login
npm whoami
npm run publish:packages
```

Scoped packages are private by default, so the publish scripts explicitly use
`--access public`.

## Configure trusted publishing

After the packages exist on npm, open each package's settings and add the same
GitHub Actions trusted publisher:

- GitHub owner: `patkepa`
- repository: `kantzen-ui`
- workflow filename: `release.yml`
- allowed action: `npm publish`

The release workflow grants `id-token: write` and uses a supported Node/npm
combination. It contains no long-lived npm token. Once one OIDC release succeeds,
disallow traditional token publishing and revoke any bootstrap automation token.

Automatic npm provenance requires the repository and packages to be public.
OIDC publishing still works while the GitHub repository is private, but npm does
not generate provenance for a private source repository.

References:

- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [Publishing scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)

## Release a new version

1. Record user-visible changes and update every package version together.
2. Update internal `@kantzen-ui/*` dependency ranges to the same version.
3. Run the full local validation.
4. Commit the release changes.
5. Create and push a matching Git tag:

```sh
git tag v0.2.0
git push origin main
git push origin v0.2.0
```

The tag triggers `.github/workflows/release.yml`. npm rejects versions that have
already been published.

For prereleases, use a semantic prerelease version such as `0.2.0-beta.1` and
publish it with the `next` dist-tag rather than replacing `latest`.
