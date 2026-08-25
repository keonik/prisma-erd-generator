---
'prisma-erd-generator': minor
---

Emit plain SVG text instead of embedded HTML, so diagrams open outside a browser (#245)

Mermaid defaults to wrapping every label in a `<foreignObject>`, which embeds HTML inside the SVG. That element is optional in the SVG spec: browsers implement it, but Inkscape, librsvg and ImageMagick do not, and they render the diagram as a set of empty boxes with no text at all. For a generator whose primary output is an `.svg` file, a diagram that only browsers can read is the wrong default.

The generator now sets `htmlLabels: false`. Output is visually the same in a browser and renders correctly in every other SVG consumer. Set `htmlLabels: true` in your `mermaidConfig` to restore the previous behaviour — note it must be top level, since mermaid has deprecated the per-diagram variants and silently ignores `{ er: { htmlLabels: ... } }`.

The committed `ERD.svg` has been regenerated and now contains 222 `<text>` elements where it previously had 458 `<foreignObject>`.
