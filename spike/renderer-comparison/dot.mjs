// Spike: emit Graphviz DOT from the same DML the mermaid renderer consumes.
// Mirrors renderDml's entity/field/relationship selection so the comparison is
// like for like — same sigils, same @map handling, same relationship pairs.
import fs from 'node:fs'

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])

export function dmlToDot(dml, { showIndexes = false } = {}) {
    const models = dml.models.concat(dml.types ?? [])
    const name = (e) => e.dbName || e.name
    const byType = new Map()
    for (const m of models) byType.set(m.name, m)
    for (const e of dml.enums ?? []) byType.set(e.name, e)

    const rows = (m) =>
        m.fields
            .filter((f) => f.kind !== 'object')
            .map((f) => {
                const marks = []
                if (f.isId || m.primaryKey?.fields?.includes(f.name)) marks.push('PK')
                if (showIndexes && f.isUnique) marks.push('UK')
                if (!f.isRequired) marks.push('?')
                const tag = marks.length ? ` <FONT COLOR="#888">${marks.join(' ')}</FONT>` : ''
                return `<TR><TD ALIGN="LEFT" PORT="${esc(f.name)}"><FONT COLOR="#555">${esc(
                    f.type
                )}</FONT>  ${esc(f.dbName || f.name)}${tag}</TD></TR>`
            })
            .join('\n            ')

    const nodes = models
        .map(
            (m) => `    "${esc(name(m))}" [label=<
        <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="6">
            <TR><TD BGCOLOR="#e8eaf6"><B>${esc(name(m))}</B></TD></TR>
            ${rows(m)}
        </TABLE>>];`
        )
        .join('\n')

    const enums = (dml.enums ?? [])
        .map(
            (e) => `    "${esc(name(e))}" [label=<
        <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="6">
            <TR><TD BGCOLOR="#fff3e0"><B>${esc(name(e))}</B></TD></TR>
            ${e.values.map((v) => `<TR><TD ALIGN="LEFT">${esc(v.dbName || v.name)}</TD></TR>`).join('\n            ')}
        </TABLE>>];`
        )
        .join('\n')

    // one edge per relation pair, same de-duplication the mermaid path relies on
    const seen = new Set()
    const edges = []
    for (const m of models) {
        for (const f of m.fields) {
            if (f.kind !== 'object' && f.kind !== 'enum') continue
            const other = byType.get(f.type)
            if (!other) continue
            const key = [name(m), name(other), f.relationName ?? f.name].sort().join('~')
            if (seen.has(key)) continue
            seen.add(key)
            const head = f.isList ? 'crow' : 'none'
            edges.push(
                `    "${esc(name(m))}" -> "${esc(name(other))}" [arrowhead=${head}, arrowtail=none, dir=both, label="${esc(f.name)}", fontsize=10, color="#666"];`
            )
        }
    }

    return `digraph ERD {
    graph [rankdir=LR, splines=ortho, nodesep=0.6, ranksep=1.2, bgcolor="transparent"];
    node  [shape=plaintext, fontname="Helvetica", fontsize=11];
    edge  [fontname="Helvetica"];
${nodes}
${enums}
${edges.join('\n')}
}
`
}

const dml = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
fs.writeFileSync(process.argv[3], dmlToDot(dml, { showIndexes: true }))
console.log('wrote', process.argv[3])
