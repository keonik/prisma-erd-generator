---
'prisma-erd-generator': patch
---

Fix `mermaidConfig` being silently ignored for CommonJS config files

`await import()` wraps `module.exports = config` in a namespace object, so the whole config was spread in under a `default` key and never reached mermaid — including for the shape documented in the README and shipped as `example-mermaid-config.js`.
