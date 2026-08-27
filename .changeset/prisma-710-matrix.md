---
'prisma-erd-generator': patch
---

Test against Prisma 7.10.0

CI previously pinned each major to a single version, so the newest stable Prisma was never exercised. The matrix now covers 5.22.0, 6.15.0, 7.0.0 and 7.10.0 — the floors of each supported major plus the current release. No code changes were needed; everything passes.

Prisma 8 is deliberately not included: it is still a release candidate, its CLI has no `generate` command, and `@prisma/generator-helper` has no 8.x release, so the generator plugin model this package depends on does not exist there yet. See #315.
