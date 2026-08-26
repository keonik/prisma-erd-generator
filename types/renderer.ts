import type { DML, DMLRendererOptions } from './dml'
import type { PrismaERDConfig } from './generator'

export interface RenderContext {
    /** absolute path the diagram must be written to */
    output: string
    config: PrismaERDConfig
    /** scratch directory, removed by the caller */
    tmpDir: string
    debug: boolean
    theme: string
}

/**
 * A way of turning the datamodel into a diagram.
 *
 * Adding one is a new module under `src/renderers/` plus an entry in the
 * `renderers` table in `generate.ts`. Nothing else in the pipeline needs to
 * know it exists — option parsing, `@map` handling and index marking all
 * happen before a renderer is chosen.
 */
export interface DiagramRenderer {
    /** value users pass to the `renderer` generator option */
    name: string
    /** output extensions this renderer can produce, including the dot */
    extensions: readonly string[]
    /** file extension for the textual source, used for debug output */
    sourceExtension: string
    /** datamodel to diagram source (mermaid text, DOT, ...) */
    source(dml: DML, options: DMLRendererOptions): string
    /** write `ctx.output`; `source` is whatever `source()` returned */
    write(source: string, ctx: RenderContext): Promise<void> | void
}
