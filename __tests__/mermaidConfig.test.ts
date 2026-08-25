import * as child_process from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, expect, test } from 'vitest'

const tmpDir = path.join(__dirname, 'tmp-mermaid-config')
const outputFile = path.join(tmpDir, 'erd.svg')

const schemaPath = path.join(tmpDir, 'schema.prisma')
const cjsConfigPath = path.join(tmpDir, 'mermaid.config.cjs')

beforeAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    fs.mkdirSync(tmpDir, { recursive: true })

    // the shape the README and example-mermaid-config.js document
    fs.writeFileSync(
        cjsConfigPath,
        'module.exports = { er: { useMaxWidth: false } }\n'
    )
    fs.writeFileSync(
        schemaPath,
        `generator erd {
    provider      = "node ${path
        .resolve(__dirname, '../dist/index.cjs')
        .replace(/\\/g, '/')}"
    output        = "${outputFile.replace(/\\/g, '/')}"
    mermaidConfig = "${cjsConfigPath.replace(/\\/g, '/')}"
}

datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

model User {
    id    Int    @id
    email String
}
`
    )
})

afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
})

test('a commonjs mermaidConfig is applied, not buried under `default`', () => {
    child_process.execSync(`prisma generate --schema ${schemaPath}`)

    const svg = fs.readFileSync(outputFile, 'utf8')

    // useMaxWidth: false makes mermaid emit absolute dimensions. If the config
    // were ignored the default (true) would give width="100%" + a max-width
    // style, which is also what stops Inkscape rendering the file (#245).
    expect(svg).toMatch(/width="\d/)
    expect(svg).toMatch(/height="\d/)
    expect(svg).not.toContain('width="100%"')
})
