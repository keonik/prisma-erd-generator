import * as child_process from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { renderDot } from '../src/renderers/graphviz'
import type { DML } from '../types/dml'

const tmpDir = path.join(__dirname, 'tmp-renderer')

const field = (name: string, overrides: Record<string, unknown> = {}) => ({
    name,
    dbName: null,
    hasDefaultValue: false,
    isGenerated: false,
    isId: false,
    isList: false,
    isReadOnly: false,
    isRequired: true,
    isUnique: false,
    isUpdatedAt: false,
    kind: 'scalar' as const,
    type: 'String',
    ...overrides,
})

const dml = {
    enums: [
        {
            name: 'Role',
            dbName: null,
            values: [
                { name: 'ADMIN', dbName: 'ADMIN' },
                { name: 'USER', dbName: 'USER' },
            ],
        },
    ],
    types: [],
    models: [
        {
            name: 'User',
            dbName: 'users',
            primaryKey: null,
            uniqueFields: [],
            fields: [
                field('id', { isId: true, type: 'Int' }),
                field('email', { isUnique: true }),
                field('nickName', { dbName: 'nick_name', isRequired: false }),
                field('role', { kind: 'enum', type: 'Role' }),
                field('posts', {
                    kind: 'object',
                    type: 'Post',
                    isList: true,
                    relationName: 'PostToUser',
                }),
            ],
        },
        {
            name: 'Post',
            dbName: null,
            primaryKey: null,
            uniqueFields: [],
            fields: [
                field('id', { isId: true, type: 'Int' }),
                field('author', {
                    kind: 'object',
                    type: 'User',
                    relationName: 'PostToUser',
                }),
            ],
        },
    ],
} as unknown as DML

describe('renderDot', () => {
    it('draws a node per model using its @@map name', () => {
        const dot = renderDot(dml)

        expect(dot).toContain('"users" [label=<')
        expect(dot).toContain('"Post" [label=<')
    })

    it('uses prisma names when usePrismaNames is set', () => {
        const dot = renderDot(dml, { usePrismaNames: true })

        expect(dot).toContain('"User" [label=<')
        expect(dot).not.toContain('"users" [label=<')
    })

    it('marks primary keys, uniques and nullables', () => {
        const dot = renderDot(dml, { showIndexes: true })

        expect(dot).toMatch(/Int<\/FONT>\s+id .*🗝️/)
        expect(dot).toMatch(/email .*🔒/)
        expect(dot).toMatch(/nick_name .*❓/)
    })

    it('honours disableEmoji', () => {
        const dot = renderDot(dml, { showIndexes: true, disableEmoji: true })

        expect(dot).toContain('PK')
        expect(dot).toContain('UK')
        expect(dot).not.toContain('🗝️')
    })

    it('draws one edge per relation, not one per side', () => {
        const dot = renderDot(dml)
        const relationEdges = dot
            .split('\n')
            .filter((line) => line.includes('->') && line.includes('"Post"'))

        // User.posts and Post.author describe the same relationship
        expect(relationEdges).toHaveLength(1)
    })

    it('renders enums as their own node and drops them with ignoreEnums', () => {
        expect(renderDot(dml)).toContain('"Role" [label=<')
        expect(renderDot(dml, { ignoreEnums: true })).not.toContain(
            '"Role" [label=<'
        )
    })

    it('omits fields in tableOnly mode but keeps the entities', () => {
        const dot = renderDot(dml, { tableOnly: true })

        expect(dot).toContain('"users" [label=<')
        expect(dot).not.toContain('nick_name')
    })

    it('escapes markup characters in labels', () => {
        const angled = {
            ...dml,
            enums: [],
            models: [
                {
                    ...dml.models[0],
                    dbName: 'a<b>c&d',
                    fields: [field('id', { isId: true, type: 'Int' })],
                },
            ],
        } as unknown as DML

        expect(renderDot(angled)).toContain('a&lt;b&gt;c&amp;d')
    })
})

describe('renderer option end to end', () => {
    const schemaFor = (output: string, renderer?: string) => `generator erd {
    provider = "node ${path
        .resolve(__dirname, '../dist/index.cjs')
        .replace(/\\/g, '/')}"
    output   = "${output.replace(/\\/g, '/')}"${
        renderer ? `\n    renderer = "${renderer}"` : ''
    }
}

datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

model User {
    id    Int    @id
    email String
    posts Post[]
}

model Post {
    id       Int  @id
    authorId Int
    author   User @relation(fields: [authorId], references: [id])
}
`

    const run = (name: string, output: string, renderer?: string) => {
        const schemaPath = path.join(tmpDir, `${name}.prisma`)
        fs.writeFileSync(schemaPath, schemaFor(output, renderer))
        return child_process.execSync(
            `npx prisma generate --schema ${schemaPath}`,
            { stdio: 'pipe' }
        )
    }

    beforeAll(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
        fs.mkdirSync(tmpDir, { recursive: true })
    })

    afterAll(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it('writes DOT with no browser involved', () => {
        const output = path.join(tmpDir, 'erd.dot')
        run('dot', output, 'graphviz')

        const dot = fs.readFileSync(output, 'utf8')
        expect(dot).toContain('digraph ERD {')
        expect(dot).toContain('"User" [label=<')
        expect(dot).toContain('->')
    })

    it('writes SVG through the wasm layout engine', () => {
        const output = path.join(tmpDir, 'erd.svg')
        run('svg', output, 'graphviz')

        const svg = fs.readFileSync(output, 'utf8')
        expect(svg).toContain('<svg')
        // plain text, never a foreignObject — the whole point of this path
        expect(svg).toContain('<text')
        expect(svg).not.toContain('foreignObject')
    })

    it('still defaults to mermaid', () => {
        const output = path.join(tmpDir, 'erd.md')
        run('default', output)

        expect(fs.readFileSync(output, 'utf8')).toContain('```mermaid')
    })

    it('rejects an output format the renderer cannot produce', () => {
        const output = path.join(tmpDir, 'erd.png')

        expect(() => run('badformat', output, 'graphviz')).toThrow(
            /cannot write "\.png"/
        )
    })

    it('rejects an unknown renderer by name', () => {
        const output = path.join(tmpDir, 'erd2.svg')

        expect(() => run('badrenderer', output, 'nope')).toThrow(
            /Unknown renderer "nope"/
        )
    })
})
