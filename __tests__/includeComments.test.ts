import fs from 'node:fs'
import path from 'node:path'
import type { GeneratorOptions } from '@prisma/generator-helper'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import generate from '../src/generate'

const tmpDir = path.join(__dirname, 'tmp-include-comments')

const datamodel = `
/// An article
model Article {
  /// Primary key
  id    String  @id
  /// Page title
  title String
  /// Page "content"
  /// spanning lines
  body  String?
  plain String
}
`

const field = (name: string, overrides: Record<string, unknown> = {}) => ({
    name,
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
            name: 'Article',
            dbName: null,
            documentation: 'An article',
            fields: [
                field('id', { isId: true, documentation: 'Primary key' }),
                field('title', { documentation: 'Page title' }),
                field('body', {
                    isRequired: false,
                    documentation: 'Page "content"\nspanning lines',
                }),
                field('plain'),
            ],
            idFields: [],
            uniqueFields: [],
            uniqueIndexes: [],
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
        dmmf: { datamodel: dmmfDatamodel },
        datasources: [],
        datamodel,
        version: 'test',
    } as unknown as GeneratorOptions)

    return fs.readFileSync(outputFile, 'utf8')
}

describe('includeComments', () => {
    beforeEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
        fs.mkdirSync(tmpDir, { recursive: true })
    })

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it('omits documentation by default', async () => {
        const output = await render('default.md')

        expect(output).toContain('String id "🗝️"')
        expect(output).not.toContain('Primary key')
    })

    it('renders documentation alongside the key and nullable sigils', async () => {
        const output = await render('comments.md', { includeComments: 'true' })

        expect(output).toContain('String id "🗝️ Primary key"')
        expect(output).toContain('String title "Page title"')
        expect(output).toContain('String plain \n')
    })

    it('flattens quotes and line breaks so mermaid can parse the comment', async () => {
        const output = await render('multiline.md', { includeComments: 'true' })

        expect(output).toContain(
            'String body "❓ Page \'content\' spanning lines"'
        )
    })

    it('uses the non-emoji sigils when disableEmoji is set', async () => {
        const output = await render('no-emoji.md', {
            includeComments: 'true',
            disableEmoji: 'true',
        })

        expect(output).toContain('String id "PK Primary key"')
        expect(output).toContain(
            'String body "nullable Page \'content\' spanning lines"'
        )
    })
})
