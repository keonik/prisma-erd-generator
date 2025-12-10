# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.4.0](https://github.com/keonik/prisma-erd-generator/compare/v2.3.0...v2.4.0) (2025-12-10)


### Features

* **ignoreViews and ignorePattern:** adding ignoreViews and ignorePattern parameter ([#270](https://github.com/keonik/prisma-erd-generator/issues/270)) ([7403c94](https://github.com/keonik/prisma-erd-generator/commit/7403c9477f7b9828507571f839d2d908b1664606))


### Bug Fixes

* corrected error and existing tests to make remove the excessive many to many error ([#271](https://github.com/keonik/prisma-erd-generator/issues/271)) ([ac64ede](https://github.com/keonik/prisma-erd-generator/commit/ac64ede21a2983f5223396b347423ab2e73ee0e5))

## 2.3.0

### Minor Changes

- b8e664d: Prisma v7 support

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.2.1](https://github.com/keonik/prisma-erd-generator/compare/v2.1.0...v2.2.1) (2025-11-22)

## 2.1.0

### Minor Changes

- d5717ed: Upgrade mermaid dependency and resolve duplicate many to many connections

## 2.0.4

### Patch Changes

- 464d8b9: Rename .mjs files to .js for binary references to work within prisma generator calls

## 2.0.2

### Patch Changes

- b438731: CommonJS bin file connection

## 2.0.1

### Patch Changes

- 94e16d6: Point bin and main files to commonjs

## 2.0.1

### Patch Changes

- 48c2882: Revert back to commonjs

## 2.0.0

### Major Changes

- abe34ac: BREAKING CHANGES

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

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.11.1](https://github.com/keonik/prisma-erd-generator/compare/v1.11.0...v1.11.1) (2023-08-22)

## [1.11.0](https://github.com/keonik/prisma-erd-generator/compare/v1.9.1-0...v1.11.0) (2023-08-10)

### Features

- Enable Prisma v5 as a peer dependency. Update all other dependencies. Enabled Logging of config in debug mode. ([#231](https://github.com/keonik/prisma-erd-generator/issues/231)) ([85faec5](https://github.com/keonik/prisma-erd-generator/commit/85faec52ed288214a4ac80f1f031d0238105c814))
- Option to disable emoji output ([#229](https://github.com/keonik/prisma-erd-generator/issues/229)) ([f86ff4d](https://github.com/keonik/prisma-erd-generator/commit/f86ff4d7652e69f6d940a34773197ac1792b5436)), closes [#226](https://github.com/keonik/prisma-erd-generator/issues/226)

### Bug Fixes

- Remove generator options logging ([#230](https://github.com/keonik/prisma-erd-generator/issues/230)) ([d891310](https://github.com/keonik/prisma-erd-generator/commit/d8913100a3829f6444556f1543dfa73f0e434ccb))
- unlock versions of prisma dependencies to include 4 and 5 ([b7137d2](https://github.com/keonik/prisma-erd-generator/commit/b7137d26b7658834e6f43370ea865d1672dd0d46))
- Update DISABLE_ERD environment variable to match js truthy expectations ([#227](https://github.com/keonik/prisma-erd-generator/issues/227)) ([60a78ba](https://github.com/keonik/prisma-erd-generator/commit/60a78ba4d8a5f383b3047d1b394703286bbe0a89)), closes [#225](https://github.com/keonik/prisma-erd-generator/issues/225)

## [1.9.0](https://github.com/keonik/prisma-erd-generator/compare/v1.8.0...v1.9.0) (2023-07-19)

### Features

- Support Prisma v5 ([#221](https://github.com/keonik/prisma-erd-generator/issues/221)) ([539990e](https://github.com/keonik/prisma-erd-generator/commit/539990e7da237d92b5834d38cd497b60bfaae8e4))
- Support unique names ([#190](https://github.com/keonik/prisma-erd-generator/issues/190)) ([496c55a](https://github.com/keonik/prisma-erd-generator/commit/496c55a909af59aefe3758bf2f7aeca1fb41a869))

### Bug Fixes

- Default version outdated ([233afe0](https://github.com/keonik/prisma-erd-generator/commit/233afe062e705dacf02941312b906f980fdc21de))
- Dependency upgrade ([757f57f](https://github.com/keonik/prisma-erd-generator/commit/757f57f0122481c4e30a698ee7d22dd217875f7b))
- Improve logging for arm64 macos users. Force version 5 prisma to match prisma generator helper ([872d6a2](https://github.com/keonik/prisma-erd-generator/commit/872d6a258d15d3a92a4602e11cf65def9961d200))
- Match [@mermaid-cli](https://github.com/mermaid-cli) puppeteer-config.json as default to troubleshoot issue [#199](https://github.com/keonik/prisma-erd-generator/issues/199) ([6a61964](https://github.com/keonik/prisma-erd-generator/commit/6a619649bd47f46b0e4583bcb670f1756cdeec0c))
- No changes. Just attempting to align versions. ([881a0ef](https://github.com/keonik/prisma-erd-generator/commit/881a0efda7163a3af5e4d6a08ec53165ddb66f72))
- Prerelease config for GitHub ([6a2ec99](https://github.com/keonik/prisma-erd-generator/commit/6a2ec994f292036dab0c95839a74baaa8e1ec9f7))
- Remove Git semantic release plugin ([fba4a7d](https://github.com/keonik/prisma-erd-generator/commit/fba4a7dd7fd74a175dcaec7520483bd255b23d23))
- Trim mmdc from mmdcPath. Added test and documentation for how to utilize new config ption. Resolve tests from nullable and primary key changes. ([9c56a47](https://github.com/keonik/prisma-erd-generator/commit/9c56a4767f00317d6e87cf67ff6443a7a7b48406))
- Versioning mismatches ([8e31427](https://github.com/keonik/prisma-erd-generator/commit/8e31427d5dcd913aa06506774b441eee97a11e3b))

### [1.4.5](https://github.com/keonik/prisma-erd-generator/compare/v1.4.4...v1.4.5) (2023-03-25)

### Bug Fixes

- Add type definitions to package. remove markdown files from package output. ([561a98f](https://github.com/keonik/prisma-erd-generator/commit/561a98f75dbbde2e723b4e197542f845e0e9619f))

### [1.4.4](https://github.com/keonik/prisma-erd-generator/compare/v1.4.3...v1.4.4) (2023-03-25)

### Bug Fixes

- tarball and deployment setup for releaserc ([5f3ee76](https://github.com/keonik/prisma-erd-generator/commit/5f3ee762a25ed583a1db2c588a704ed3b4a61ad9))

### [1.4.3](https://github.com/keonik/prisma-erd-generator/compare/v1.4.2...v1.4.3) (2023-03-25)

### Bug Fixes

- Improve labeling of nullable and primary keys in table ([dbd9117](https://github.com/keonik/prisma-erd-generator/commit/dbd911776edf0992dd2879d20097ed2590037e8e))

### [1.4.2](https://github.com/keonik/prisma-erd-generator/compare/v1.4.1...v1.4.2) (2023-03-25)

### [1.4.1](https://github.com/keonik/prisma-erd-generator/compare/v1.4.0...v1.4.1) (2023-03-25)

### Bug Fixes

- Add back in prepublish script ([4ab1dd5](https://github.com/keonik/prisma-erd-generator/commit/4ab1dd5d6d6986b8c1cbab4870ed35bbb81f6bd7))
- remove duplicate build step ([23d86c3](https://github.com/keonik/prisma-erd-generator/commit/23d86c382ed3261bfdccfa27a66ec5a7f98aaf19))
- Revert removal of ts files from npm package ([a4628e7](https://github.com/keonik/prisma-erd-generator/commit/a4628e760a3cfaf8ede5f408ca2dbdbd978df6ac))

## [1.4.0](https://github.com/keonik/prisma-erd-generator/compare/v1.3.2...v1.4.0) (2023-03-25)

### Features

- Option to specify mmdcPath ([#188](https://github.com/keonik/prisma-erd-generator/issues/188)) ([39088ae](https://github.com/keonik/prisma-erd-generator/commit/39088aee8dbaaff079f4f1357d6999107bb0c333))
- Upgrade Mermaid dependency to v10.0.2 ([#175](https://github.com/keonik/prisma-erd-generator/issues/175)) ([efe5959](https://github.com/keonik/prisma-erd-generator/commit/efe5959567ffb095b20f7fb31a5f7ba3dea27908))

## [1.8.0](https://github.com/keonik/prisma-erd-generator/compare/v1.5.2...v1.8.0) (2023-05-25)

### Features

- Add option to hide enums ([#201](https://github.com/keonik/prisma-erd-generator/issues/201)) ([8b3bf99](https://github.com/keonik/prisma-erd-generator/commit/8b3bf99a3fcc420e6bdcf49c35686014c0b3af27))

### Bug Fixes

- Composite type relationship lookup resolution. Dependency upgrades: @mermaid-js/mermaid-cli ([94ddfd2](https://github.com/keonik/prisma-erd-generator/commit/94ddfd28526a793be913dc5b0f0ccc0636e6aeb7))
- Typo in documentation ([#193](https://github.com/keonik/prisma-erd-generator/issues/193)) ([e6a3838](https://github.com/keonik/prisma-erd-generator/commit/e6a38382aed47c940cb37c645c5ec81079d23c05))

### [1.5.2](https://github.com/keonik/prisma-erd-generator/compare/v1.5.1...v1.5.2) (2023-03-28)

### Bug Fixes

- Resolve many to many issue since adding in double quotes to names ([69164bd](https://github.com/keonik/prisma-erd-generator/commit/69164bde12858137a3b3defb1d48eabeeb8690dc))

### [1.5.1](https://github.com/keonik/prisma-erd-generator/compare/v1.4.6...v1.5.1) (2023-03-28)

### Features

- Merge in alpha branch. Replace node v14 with node v18 for github actions tests ([#191](https://github.com/keonik/prisma-erd-generator/issues/191)) ([1b1d618](https://github.com/keonik/prisma-erd-generator/commit/1b1d618dee8741b6ca3478a232cf6e9f5d107ba0)), closes [#175](https://github.com/keonik/prisma-erd-generator/issues/175) [#188](https://github.com/keonik/prisma-erd-generator/issues/188) [#190](https://github.com/keonik/prisma-erd-generator/issues/190)
- Missing @prisma/generator-helper dependency ([ce040d3](https://github.com/keonik/prisma-erd-generator/commit/ce040d3cce0f862eb64de322443fe9868b7fd556))

### [1.4.5](https://github.com/keonik/prisma-erd-generator/compare/v1.4.4...v1.4.5) (2023-03-25)

### Bug Fixes

- Add type definitions to package. remove markdown files from package output. ([561a98f](https://github.com/keonik/prisma-erd-generator/commit/561a98f75dbbde2e723b4e197542f845e0e9619f))

### [1.4.4](https://github.com/keonik/prisma-erd-generator/compare/v1.4.3...v1.4.4) (2023-03-25)

### Bug Fixes

- tarball and deployment setup for releaserc ([5f3ee76](https://github.com/keonik/prisma-erd-generator/commit/5f3ee762a25ed583a1db2c588a704ed3b4a61ad9))

### [1.4.3](https://github.com/keonik/prisma-erd-generator/compare/v1.4.2...v1.4.3) (2023-03-25)

### Bug Fixes

- Improve labeling of nullable and primary keys in table ([dbd9117](https://github.com/keonik/prisma-erd-generator/commit/dbd911776edf0992dd2879d20097ed2590037e8e))

### [1.4.4](https://github.com/keonik/prisma-erd-generator/compare/v1.4.2...v1.4.4) (2023-03-25)

### [1.4.2](https://github.com/keonik/prisma-erd-generator/compare/v1.4.1...v1.4.2) (2023-03-25)

### [1.4.1](https://github.com/keonik/prisma-erd-generator/compare/v1.4.0...v1.4.1) (2023-03-25)

### Bug Fixes

- Add back in prepublish script ([4ab1dd5](https://github.com/keonik/prisma-erd-generator/commit/4ab1dd5d6d6986b8c1cbab4870ed35bbb81f6bd7))
- remove duplicate build step ([23d86c3](https://github.com/keonik/prisma-erd-generator/commit/23d86c382ed3261bfdccfa27a66ec5a7f98aaf19))
- Revert removal of ts files from npm package ([a4628e7](https://github.com/keonik/prisma-erd-generator/commit/a4628e760a3cfaf8ede5f408ca2dbdbd978df6ac))

## [1.4.0](https://github.com/keonik/prisma-erd-generator/compare/v1.3.2...v1.4.0) (2023-03-25)

### Features

- Option to specify mmdcPath ([#188](https://github.com/keonik/prisma-erd-generator/issues/188)) ([39088ae](https://github.com/keonik/prisma-erd-generator/commit/39088aee8dbaaff079f4f1357d6999107bb0c333))
- Upgrade Mermaid dependency to v10.0.2 ([#175](https://github.com/keonik/prisma-erd-generator/issues/175)) ([efe5959](https://github.com/keonik/prisma-erd-generator/commit/efe5959567ffb095b20f7fb31a5f7ba3dea27908))

### [1.3.2](https://github.com/keonik/prisma-erd-generator/compare/v1.3.0...v1.3.2) (2023-03-22)

### Bug Fixes

- Bump verison to deploy to main ([fec903a](https://github.com/keonik/prisma-erd-generator/commit/fec903aea288b01e7648b395aef60c57ce17d80c))
- Documentation to assist users with puppeteer issues ([bf46791](https://github.com/keonik/prisma-erd-generator/commit/bf46791b784f8a3e1c80013829d90e3fcfe3e363))

## [1.3.0](https://github.com/keonik/prisma-erd-generator/compare/v1.2.5...v1.3.0) (2023-03-22)

### Features

- Upgrade to mermaid version 10. Support for early release branching. Resolve new version of ERD on every generate. ([#185](https://github.com/keonik/prisma-erd-generator/issues/185)) ([2a6f2cb](https://github.com/keonik/prisma-erd-generator/commit/2a6f2cb9b941c0ce083f3ae8e4de293d972fe9e5)), closes [#175](https://github.com/keonik/prisma-erd-generator/issues/175)

### [1.2.5](https://github.com/keonik/prisma-erd-generator/compare/v1.2.4...v1.2.5) (2023-01-12)

### Bug Fixes

- Downgrade @mermaid/cli to version 8 to resolve deterministic id configuration parameter. Fix for test issue 138 ([#162](https://github.com/keonik/prisma-erd-generator/issues/162)) ([84a6287](https://github.com/keonik/prisma-erd-generator/commit/84a6287d3059c4e0ccc80be3ece88fe472a19adf))

### [1.2.4](https://github.com/keonik/prisma-erd-generator/compare/v1.2.3...v1.2.4) (2022-11-17)

### Bug Fixes

- Issue 138 map FK and PK overwrite ([#149](https://github.com/keonik/prisma-erd-generator/issues/149)) ([d5208cf](https://github.com/keonik/prisma-erd-generator/commit/d5208cfc5ee2d9ca37cd6b0250469ee0dd9fac24))

### [1.2.3](https://github.com/keonik/prisma-erd-generator/compare/v1.2.2...v1.2.3) (2022-11-08)

### Bug Fixes

- Remove prefix npx from tests to ensure current version in package.json usage of prisma ([1c6e285](https://github.com/keonik/prisma-erd-generator/commit/1c6e285bd549c336e863a8604d7e3b02551ce815))

### [1.2.2](https://github.com/keonik/prisma-erd-generator/compare/v1.2.1...v1.2.2) (2022-10-31)

### [1.2.1](https://github.com/keonik/prisma-erd-generator/compare/v1.2.0...v1.2.1) (2022-09-29)

## [1.2.0](https://github.com/keonik/prisma-erd-generator/compare/v1.1.2...v1.2.0) (2022-09-10)

### Features

- Added possibility to generate diagram with relation fields and Fixed generation of ERD with composite keys.(Closes [#135](https://github.com/keonik/prisma-erd-generator/issues/135)) ([#136](https://github.com/keonik/prisma-erd-generator/issues/136)) ([f36325b](https://github.com/keonik/prisma-erd-generator/commit/f36325b719ddc9a58de0343ee706bd7d03f3c59c))

### [1.1.2](https://github.com/keonik/prisma-erd-generator/compare/v1.1.1...v1.1.2) (2022-09-08)

### Bug Fixes

- Zero to many relationship linking incorrect ([#125](https://github.com/keonik/prisma-erd-generator/issues/125)) ([c283fc8](https://github.com/keonik/prisma-erd-generator/commit/c283fc8edd737ca36b32db1109fb249fb7b74f14))

### [1.1.1](https://github.com/keonik/prisma-erd-generator/compare/v1.1.0...v1.1.1) (2022-09-08)

## [1.1.0](https://github.com/keonik/prisma-erd-generator/compare/v1.0.2...v1.1.0) (2022-08-19)

### Features

- Prisma version 4.2.x ([#126](https://github.com/keonik/prisma-erd-generator/issues/126)) ([a5878c9](https://github.com/keonik/prisma-erd-generator/commit/a5878c94f0b400b9f8304329daf55a36bfce3d0b))

### [1.0.2](https://github.com/keonik/prisma-erd-generator/compare/v1.0.1...v1.0.2) (2022-07-26)

### Bug Fixes

- Issue with matching names when overwritting field names to [@map](https://github.com/map) names ([#115](https://github.com/keonik/prisma-erd-generator/issues/115)) ([6ffc13f](https://github.com/keonik/prisma-erd-generator/commit/6ffc13fb20d939c9a778feb5455588b8b1710b85))

### [1.0.1](https://github.com/keonik/prisma-erd-generator/compare/v0.11.4...v1.0.1) (2022-07-11)

### [0.11.5](https://github.com/keonik/prisma-erd-generator/compare/v0.11.4...v0.11.5) (2022-07-11)

### [0.11.4](https://github.com/keonik/prisma-erd-generator/compare/v0.11.3...v0.11.4) (2022-05-26)

### Features

- Nullable keys in ERD ([f7d7304](https://github.com/keonik/prisma-erd-generator/commit/f7d7304b61ddcc5b7166db9a46526e343ea87923))

### [0.11.3](https://github.com/keonik/prisma-erd-generator/compare/v0.11.2...v0.11.3) (2022-05-09)

### [0.11.2](https://github.com/keonik/prisma-erd-generator/compare/v0.11.1...v0.11.2) (2022-05-09)

### Features

- Support table-only mode ([#90](https://github.com/keonik/prisma-erd-generator/issues/90)) ([c349c97](https://github.com/keonik/prisma-erd-generator/commit/c349c97c0fac2d1e6ff5b3c11159c3ed219bb8b8))

### [0.11.1](https://github.com/keonik/prisma-erd-generator/compare/v0.11.0...v0.11.1) (2022-04-04)

### [0.10.2](https://github.com/keonik/prisma-erd-generator/compare/v0.10.1...v0.10.2) (2022-04-04)
