---
'prisma-erd-generator': patch
---

Upgrade TypeScript to 6.x and Vitest to 4.x (dev tooling only)

TypeScript 6's stricter `baseUrl` deprecation check broke tsup's declaration
build because `tsconfig.build.json` relies on `paths` without an explicit
`baseUrl`; added `"ignoreDeprecations": "6.0"` to silence it, matching
TypeScript's own documented migration guidance. Vitest 4 required no changes
to `vitest.config.mts`, `vitest.setup.mjs`, or `vitest.global-setup.mjs` — the
`node:child_process` mock and `globalSetup` both work unmodified. `vite`
stayed on the already-installed ^6 line, which satisfies Vitest 4's peer
range.
