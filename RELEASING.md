# Releasing

Releases are automated with [Changesets](https://github.com/changesets/changesets) and
published to npm via **OIDC trusted publishing** — there is no `NPM_TOKEN` secret to
manage or rotate.

## Day-to-day flow

1. **Every PR that changes published behavior includes a changeset.** Run:

   ```sh
   bunx changeset
   ```

   Pick the bump level (patch/minor/major) and write a human-readable summary —
   this becomes the changelog entry users read.

   CI enforces this: a PR that touches the package without a changeset fails the
   `changeset` check. For docs- or CI-only work that genuinely needs no release,
   apply the **`skip-changeset`** label instead.

   Do *not* reach for `bunx changeset add --empty` to silence the check. An empty
   changeset makes `changesets/action` stop at *"All changesets are empty; not
   creating PR"* **without publishing**, so one sitting on `main` blocks any pending
   release — see #308, where it would have stranded `3.0.1` a second time.

2. **Merging changesets to `main`** triggers the `Publish` workflow, which opens (or
   updates) a **"Version Packages"** PR. That PR bumps the version and updates
   `CHANGELOG.md`.

3. **Merging the "Version Packages" PR** publishes the new version to npm
   automatically. That's the whole release — no manual `npm publish`.

## Why there's no npm token

The `Publish` workflow (`.github/workflows/publish.yml`) authenticates to npm using
GitHub Actions **OIDC** rather than a long-lived token. This requires:

- `permissions: id-token: write` in the workflow (present).
- npm `>= 11.5.1` (the workflow upgrades npm before publishing).
- **No** `_authToken` in any `.npmrc` — so the workflow intentionally omits
  `setup-node`'s `registry-url` and passes no `NPM_TOKEN`/`NODE_AUTH_TOKEN`. If a token
  is present, npm uses it instead of OIDC.
- A **trusted publisher** configured on npmjs.com for this package:
  - npm → package → **Settings** → **Trusted Publisher** → **GitHub Actions**
  - Repository: `keonik/prisma-erd-generator`
  - Workflow filename: `publish.yml`

Provenance attestations are published automatically under trusted publishing.

## Historical note

This project previously also had `standard-version` wired up. It only bumped the
version and tagged locally — it never published to npm — which is why `2.4.0` and
`2.4.1` exist as tags/commits but were never released. It has been removed; changesets
is the single source of truth for releases.
