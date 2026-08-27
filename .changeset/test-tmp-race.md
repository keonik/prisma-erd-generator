---
'prisma-erd-generator': patch
---

Fix a test-harness race that intermittently failed CI

Every vitest worker wrote its temporary Prisma schemas under one shared `tmp/vitest` directory and deleted that whole tree in its own `process.on('exit')` handler. The first worker to finish therefore removed the schemas out from under the workers still running, which surfaced as:

> Could not load `--schema` from provided path ...: file or directory not found

It is timing-dependent, so it showed up as a single red cell in the matrix rather than a reproducible failure. Adding a fourth Prisma version to the matrix made runs longer and the overlap more likely.

Each worker now owns `tmp/vitest/w<pid>`, and the shared `tmp/vitest` and `prisma/debug` directories are cleaned once from the global setup's teardown, after every worker has finished. Test harness only — no change to the published package.
