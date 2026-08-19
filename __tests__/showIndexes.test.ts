import fs from 'node:fs'
import path from 'node:path'
import type { GeneratorOptions } from '@prisma/generator-helper'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import generate, { extractIndexedFields } from '../src/generate'

const tmpDir = path.join(__dirname, 'tmp-show-indexes')

const datamodel = `
model User {
  id        Int    @id
  email     String @unique
  firstName String @map("first_name")
  lastName  String
  tenantId  Int
  bio       String

  @@unique([firstName, lastName])
  @@index([tenantId])
  @@index(fields: [bio(sort: Desc)])
  @@map("users")
}
`

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
    kind: 'scalar',
    type: 'String',
    ...overrides,
})

const dmmfDatamodel = {
    enums: [],
    types: [],
    models: [
        {
            name: 'User',
            dbName: 'users',
            fields: [
                field('id', { isId: true, type: 'Int' }),
                field('email', {
                    isUnique: true,
                    documentation: 'Login address',
                }),
                field('firstName', { dbName: 'first_name' }),
                field('lastName'),
                field('tenantId', { type: 'Int' }),
                field('bio'),
            ],
            idFields: [],
            uniqueFields: [['firstName', 'lastName']],
            uniqueIndexes: [{ name: null, fields: ['firstName', 'lastName'] }],
            isGenerated: false,
            primaryKey: null,
        },
    ],
}

const render = async (
    fileName: string,
    config: Record<string, string> = {}
) => {
    const outputFile = path.join(tmpDir, fileName)

    await generate({
        generator: {
            name: 'erd',
            provider: { fromEnvVar: null, value: 'prisma-erd-generator' },
            output: { fromEnvVar: null, value: outputFile },
            config,
            binaryTargets: [],
            previewFeatures: [],
            sourceFilePath: 'schema.prisma',
        },
        otherGenerators: [],
        schemaPath: 'schema.prisma',
        // the renderer mutates fields in place, so hand it a fresh copy
        dmmf: { datamodel: JSON.parse(JSON.stringify(dmmfDatamodel)) },
        datasources: [],
        datamodel,
        version: 'test',
    } as unknown as GeneratorOptions)

    return fs.readFileSync(outputFile, 'utf8')
}

describe('extractIndexedFields', () => {
    it('collects @@index fields per model', () => {
        expect(extractIndexedFields(datamodel)).toEqual({
            User: ['tenantId', 'bio'],
        })
    })

    it('strips per-field modifiers and handles the fields: form', () => {
        const schema = `
model Post {
  title String
  body  String

  @@index([title(sort: Desc)])
  @@index(fields: [body(ops: raw("x")), title])
}
`
        expect(extractIndexedFields(schema)).toEqual({
            Post: ['title', 'body', 'title'],
        })
    })

    it('does not leak indexes across models', () => {
        const schema = `
model A {
  a Int

  @@index([a])
}

model B {
  b Int
}
`
        expect(extractIndexedFields(schema)).toEqual({ A: ['a'] })
    })

    it('returns nothing for a schema without indexes', () => {
        expect(extractIndexedFields('model A {\n  a Int\n}')).toEqual({})
    })
})

describe('showIndexes', () => {
    beforeEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
        fs.mkdirSync(tmpDir, { recursive: true })
    })

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it('marks nothing by default', async () => {
        const output = await render('default.md')

        expect(output).not.toContain('🔒')
        expect(output).not.toContain('🔍')
    })

    it('marks unique columns and indexed columns when enabled', async () => {
        const output = await render('indexes.md', { showIndexes: 'true' })

        expect(output).toContain('String email "🔒"')
        expect(output).toContain('Int tenantId "🔍"')
        expect(output).toContain('String bio "🔍"')
        // members of an @@unique composite are indexed, but not unique alone
        expect(output).toContain('String lastName "🔍"')
    })

    it('marks @map columns, whose index is declared under the prisma name', async () => {
        const output = await render('mapped.md', { showIndexes: 'true' })

        expect(output).toContain('String first_name "🔍"')
    })

    it('shares the attribute slot with includeComments', async () => {
        const output = await render('with-comments.md', {
            showIndexes: 'true',
            includeComments: 'true',
        })

        // sigils first, human text last, all inside one quoted comment
        expect(output).toContain('String email "\u{1f512} Login address"')
    })

    it('uses text markers when disableEmoji is set', async () => {
        const output = await render('no-emoji.md', {
            showIndexes: 'true',
            disableEmoji: 'true',
        })

        expect(output).toContain('String email "UK"')
        expect(output).toContain('Int tenantId "IDX"')
    })
})
