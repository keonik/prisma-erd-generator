---
'prisma-erd-generator': major
---

**Breaking:** `@mermaid-js/mermaid-cli` is now an optional peer dependency instead of a hard dependency (#293, #176)

It is only ever invoked as an external binary, and never at all for text output, so installing it (plus `mermaid` and a headless Chromium) for every user was dead weight. If you render `.svg` / `.png` / `.pdf`, install it yourself:

```bash
npm i -D @mermaid-js/mermaid-cli puppeteer
```

If you render `.md` or `.mmd`, you can drop it and skip the Chromium download entirely.

Also in this release:

- Added `.mmd` output, which writes bare mermaid with no code fence.
- A missing mermaid CLI now fails with an actionable message naming the package to install, instead of a bare "package was not found".
- The CLI is resolved before the puppeteer config is built, so a missing CLI no longer hides behind the arm64 `which chromium` probe.
- The fallback `find ../.. -name mmdc` search no longer crashes where `find` is unavailable (Windows).
