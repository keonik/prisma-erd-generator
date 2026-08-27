---
'prisma-erd-generator': minor
---

Add a `renderer` option, with a browser-free `graphviz` renderer (#102)

The mermaid renderer needs a real browser: mermaid lays out with `getBBox()`, so text measurement requires a DOM, which is why `@mermaid-js/mermaid-cli` bundles Chromium at roughly 470 MB. That is a lot to install to draw a diagram in CI or inside a container.

`renderer = "graphviz"` renders through `@hpcc-js/wasm-graphviz` instead — about 2 MB, no browser, no system packages, and it lays out in WebAssembly. It writes `.svg` and `.dot`. Like the mermaid CLI it is an optional peer dependency, so it is only installed if you ask for it:

```bash
npm i -D @hpcc-js/wasm-graphviz
```

The default is unchanged: `renderer` defaults to `mermaid`, and existing generator blocks behave exactly as before. Graphviz produces a plainer diagram — it has no crow's-foot notation, so cardinality is carried by the arrowheads and relation labels — and `mermaidConfig` / `puppeteerConfig` do not apply to it. Raster output stays mermaid-only, since rasterising would reintroduce the browser this renderer exists to avoid.

Every other option (`tableOnly`, `ignoreEnums`, `ignoreViews`, `ignorePattern`, `usePrismaNames`, `showIndexes`, `includeComments`, `sortFields`, `disableEmoji`) applies to both renderers, because the datamodel is fully prepared before a renderer is chosen. Adding another renderer is a module under `src/renderers/` plus one entry in the registry.

Unknown renderer names and unsupported output extensions now fail with a message naming what is available, rather than a confusing downstream error.
