---
"prisma-erd-generator": major
---

BREAKING CHANGES

- Removal of Node 16 support

Features

- Added support for Prisma v6 [#249](https://github.com/keonik/prisma-erd-generator/issues/249)
- Local testing migration to vitest
- Migration to pnpm for dependency management
- Migration to biome for linting and style guide
- Update to all minor dependencies to include latest mermaid configuration allowed with mermaid cli
- Output commonjs and module exports for better compatibility with other tools
- Migrate to tsup for bundling

Bug Fixes

- Remove config option from child_process that was hiding output [#250](https://github.com/keonik/prisma-erd-generator/issues/250)
