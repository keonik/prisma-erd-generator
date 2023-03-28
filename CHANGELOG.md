# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.5.1](https://github.com/keonik/prisma-erd-generator/compare/v1.4.6...v1.5.1) (2023-03-28)

### Features

-   Merge in alpha branch. Replace node v14 with node v18 for github actions tests ([#191](https://github.com/keonik/prisma-erd-generator/issues/191)) ([1b1d618](https://github.com/keonik/prisma-erd-generator/commit/1b1d618dee8741b6ca3478a232cf6e9f5d107ba0)), closes [#175](https://github.com/keonik/prisma-erd-generator/issues/175) [#188](https://github.com/keonik/prisma-erd-generator/issues/188) [#190](https://github.com/keonik/prisma-erd-generator/issues/190)
-   Missing @prisma/generator-helper dependency ([ce040d3](https://github.com/keonik/prisma-erd-generator/commit/ce040d3cce0f862eb64de322443fe9868b7fd556))

### [1.4.5](https://github.com/keonik/prisma-erd-generator/compare/v1.4.4...v1.4.5) (2023-03-25)

### Bug Fixes

-   Add type definitions to package. remove markdown files from package output. ([561a98f](https://github.com/keonik/prisma-erd-generator/commit/561a98f75dbbde2e723b4e197542f845e0e9619f))

### [1.4.4](https://github.com/keonik/prisma-erd-generator/compare/v1.4.3...v1.4.4) (2023-03-25)

### Bug Fixes

-   tarball and deployment setup for releaserc ([5f3ee76](https://github.com/keonik/prisma-erd-generator/commit/5f3ee762a25ed583a1db2c588a704ed3b4a61ad9))

### [1.4.3](https://github.com/keonik/prisma-erd-generator/compare/v1.4.2...v1.4.3) (2023-03-25)

### Bug Fixes

-   Improve labeling of nullable and primary keys in table ([dbd9117](https://github.com/keonik/prisma-erd-generator/commit/dbd911776edf0992dd2879d20097ed2590037e8e))

### [1.4.4](https://github.com/keonik/prisma-erd-generator/compare/v1.4.2...v1.4.4) (2023-03-25)

### [1.4.2](https://github.com/keonik/prisma-erd-generator/compare/v1.4.1...v1.4.2) (2023-03-25)

### [1.4.1](https://github.com/keonik/prisma-erd-generator/compare/v1.4.0...v1.4.1) (2023-03-25)

### Bug Fixes

-   Add back in prepublish script ([4ab1dd5](https://github.com/keonik/prisma-erd-generator/commit/4ab1dd5d6d6986b8c1cbab4870ed35bbb81f6bd7))
-   remove duplicate build step ([23d86c3](https://github.com/keonik/prisma-erd-generator/commit/23d86c382ed3261bfdccfa27a66ec5a7f98aaf19))
-   Revert removal of ts files from npm package ([a4628e7](https://github.com/keonik/prisma-erd-generator/commit/a4628e760a3cfaf8ede5f408ca2dbdbd978df6ac))

## [1.4.0](https://github.com/keonik/prisma-erd-generator/compare/v1.3.2...v1.4.0) (2023-03-25)

### Features

-   Option to specify mmdcPath ([#188](https://github.com/keonik/prisma-erd-generator/issues/188)) ([39088ae](https://github.com/keonik/prisma-erd-generator/commit/39088aee8dbaaff079f4f1357d6999107bb0c333))
-   Upgrade Mermaid dependency to v10.0.2 ([#175](https://github.com/keonik/prisma-erd-generator/issues/175)) ([efe5959](https://github.com/keonik/prisma-erd-generator/commit/efe5959567ffb095b20f7fb31a5f7ba3dea27908))

### [1.3.2](https://github.com/keonik/prisma-erd-generator/compare/v1.3.0...v1.3.2) (2023-03-22)

### Bug Fixes

-   Bump verison to deploy to main ([fec903a](https://github.com/keonik/prisma-erd-generator/commit/fec903aea288b01e7648b395aef60c57ce17d80c))
-   Documentation to assist users with puppeteer issues ([bf46791](https://github.com/keonik/prisma-erd-generator/commit/bf46791b784f8a3e1c80013829d90e3fcfe3e363))

## [1.3.0](https://github.com/keonik/prisma-erd-generator/compare/v1.2.5...v1.3.0) (2023-03-22)

### Features

-   Upgrade to mermaid version 10. Support for early release branching. Resolve new version of ERD on every generate. ([#185](https://github.com/keonik/prisma-erd-generator/issues/185)) ([2a6f2cb](https://github.com/keonik/prisma-erd-generator/commit/2a6f2cb9b941c0ce083f3ae8e4de293d972fe9e5)), closes [#175](https://github.com/keonik/prisma-erd-generator/issues/175)

### [1.2.5](https://github.com/keonik/prisma-erd-generator/compare/v1.2.4...v1.2.5) (2023-01-12)

### Bug Fixes

-   Downgrade @mermaid/cli to version 8 to resolve deterministic id configuration parameter. Fix for test issue 138 ([#162](https://github.com/keonik/prisma-erd-generator/issues/162)) ([84a6287](https://github.com/keonik/prisma-erd-generator/commit/84a6287d3059c4e0ccc80be3ece88fe472a19adf))

### [1.2.4](https://github.com/keonik/prisma-erd-generator/compare/v1.2.3...v1.2.4) (2022-11-17)

### Bug Fixes

-   Issue 138 map FK and PK overwrite ([#149](https://github.com/keonik/prisma-erd-generator/issues/149)) ([d5208cf](https://github.com/keonik/prisma-erd-generator/commit/d5208cfc5ee2d9ca37cd6b0250469ee0dd9fac24))

### [1.2.3](https://github.com/keonik/prisma-erd-generator/compare/v1.2.2...v1.2.3) (2022-11-08)

### Bug Fixes

-   Remove prefix npx from tests to ensure current version in package.json usage of prisma ([1c6e285](https://github.com/keonik/prisma-erd-generator/commit/1c6e285bd549c336e863a8604d7e3b02551ce815))

### [1.2.2](https://github.com/keonik/prisma-erd-generator/compare/v1.2.1...v1.2.2) (2022-10-31)

### [1.2.1](https://github.com/keonik/prisma-erd-generator/compare/v1.2.0...v1.2.1) (2022-09-29)

## [1.2.0](https://github.com/keonik/prisma-erd-generator/compare/v1.1.2...v1.2.0) (2022-09-10)

### Features

-   Added possibility to generate diagram with relation fields and Fixed generation of ERD with composite keys.(Closes [#135](https://github.com/keonik/prisma-erd-generator/issues/135)) ([#136](https://github.com/keonik/prisma-erd-generator/issues/136)) ([f36325b](https://github.com/keonik/prisma-erd-generator/commit/f36325b719ddc9a58de0343ee706bd7d03f3c59c))

### [1.1.2](https://github.com/keonik/prisma-erd-generator/compare/v1.1.1...v1.1.2) (2022-09-08)

### Bug Fixes

-   Zero to many relationship linking incorrect ([#125](https://github.com/keonik/prisma-erd-generator/issues/125)) ([c283fc8](https://github.com/keonik/prisma-erd-generator/commit/c283fc8edd737ca36b32db1109fb249fb7b74f14))

### [1.1.1](https://github.com/keonik/prisma-erd-generator/compare/v1.1.0...v1.1.1) (2022-09-08)

## [1.1.0](https://github.com/keonik/prisma-erd-generator/compare/v1.0.2...v1.1.0) (2022-08-19)

### Features

-   Prisma version 4.2.x ([#126](https://github.com/keonik/prisma-erd-generator/issues/126)) ([a5878c9](https://github.com/keonik/prisma-erd-generator/commit/a5878c94f0b400b9f8304329daf55a36bfce3d0b))

### [1.0.2](https://github.com/keonik/prisma-erd-generator/compare/v1.0.1...v1.0.2) (2022-07-26)

### Bug Fixes

-   Issue with matching names when overwritting field names to [@map](https://github.com/map) names ([#115](https://github.com/keonik/prisma-erd-generator/issues/115)) ([6ffc13f](https://github.com/keonik/prisma-erd-generator/commit/6ffc13fb20d939c9a778feb5455588b8b1710b85))

### [1.0.1](https://github.com/keonik/prisma-erd-generator/compare/v0.11.4...v1.0.1) (2022-07-11)

### [0.11.5](https://github.com/keonik/prisma-erd-generator/compare/v0.11.4...v0.11.5) (2022-07-11)

### [0.11.4](https://github.com/keonik/prisma-erd-generator/compare/v0.11.3...v0.11.4) (2022-05-26)

### Features

-   Nullable keys in ERD ([f7d7304](https://github.com/keonik/prisma-erd-generator/commit/f7d7304b61ddcc5b7166db9a46526e343ea87923))

### [0.11.3](https://github.com/keonik/prisma-erd-generator/compare/v0.11.2...v0.11.3) (2022-05-09)

### [0.11.2](https://github.com/keonik/prisma-erd-generator/compare/v0.11.1...v0.11.2) (2022-05-09)

### Features

-   Support table-only mode ([#90](https://github.com/keonik/prisma-erd-generator/issues/90)) ([c349c97](https://github.com/keonik/prisma-erd-generator/commit/c349c97c0fac2d1e6ff5b3c11159c3ed219bb8b8))

### [0.11.1](https://github.com/keonik/prisma-erd-generator/compare/v0.11.0...v0.11.1) (2022-04-04)

### [0.10.2](https://github.com/keonik/prisma-erd-generator/compare/v0.10.1...v0.10.2) (2022-04-04)
