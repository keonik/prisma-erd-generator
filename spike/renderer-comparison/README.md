# Renderer comparison spike (#102)

Throwaway comparison of rendering the repo's own `prisma/schema.prisma`
three ways. Not wired into the generator — this exists to make the #102
discussion concrete.

| file | what it is |
| --- | --- |
| `dot.mjs` | emits Graphviz DOT from the same DML the mermaid renderer consumes |
| `erd.dot` | its output for `prisma/schema.prisma` |
| `graphviz.svg` / `.png` | rendered by `@hpcc-js/wasm-graphviz`, no browser |
| `mermaid.svg` / `.png` | current default output (mmdc + Chromium) |
| `mermaid-nohtml.svg` / `.png` | same, with `htmlLabels: false` |

The `.png` files are rendered with librsvg, which — like Inkscape — ignores
`<foreignObject>`. That is why `mermaid.png` has empty boxes and
`mermaid-nohtml.png` does not. See #245.

| | install | render | svg |
| --- | --- | --- | --- |
| mermaid + Chromium | ~570 MB | 0.65s | 196 KB |
| Graphviz WASM | 2 MB | 0.05s | 37 KB |
