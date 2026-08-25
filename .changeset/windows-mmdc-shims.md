---
'prisma-erd-generator': patch
---

Find the mermaid CLI on Windows when it was installed by bun

The generator looked for an extensionless `node_modules/.bin/mmdc`. Windows has no extensionless executables, so package managers write shims instead — npm and pnpm write both a `mmdc` shell script and a `mmdc.cmd`, which is why this went unnoticed, but bun writes only `mmdc.exe`. On a Windows project installed with bun, `.svg` / `.png` / `.pdf` output failed with "could not find the mermaid CLI (mmdc)" despite a correct install, and the `find ../.. -name mmdc` fallback cannot help because `find` is not present on stock Windows.

Resolution now probes `mmdc`, `mmdc.cmd`, `mmdc.exe` and `mmdc.ps1` on Windows, so it no longer depends on which package manager did the install. This applies to `mmdcPath` too.
