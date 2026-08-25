import fs from 'node:fs'
import path from 'node:path'
import type { GeneratorOptions } from '@prisma/generator-helper'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import generate from '../src/generate'
import packageJson from '../package.json'

const tmpDir = path.join(__dirname, 'tmp-text-output')

const datamodel = `
model User {
  id    Int    @id
  email String
}
`

const dmmfDatamodel = {
    enums: [],
    types: [],
    models: [
        {
            name: 'User',
            dbName: null,
            fields: [
                {
                    name: 'id',
                    hasDefaultValue: false,
                    isGenerated: false,
                    isId: true,
                    isList: false,
                    isReadOnly: false,
                    isRequired: true,
                    isUnique: false,
                    isUpdatedAt: false,
                    kind: 'scalar',
                    type: 'Int',
                },
                {
                    name: 'email',
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
                },
            ],
            idFields: [],
            uniqueFields: [],
            uniqueIndexes: [],
            isGenerated: false,
            primaryKey: null,
        },
    ],
}

const render = async (fileName: string) => {
    const outputFile = path.join(tmpDir, fileName)

    await generate({
        generator: {
            name: 'erd',
            provider: { fromEnvVar: null, value: 'prisma-erd-generator' },
            output: { fromEnvVar: null, value: outputFile },
            config: {},
            binaryTargets: [],
            previewFeatures: [],
            sourceFilePath: 'schema.prisma',
        },
        otherGenerators: [],
        schemaPath: 'schema.prisma',
        dmmf: { datamodel: JSON.parse(JSON.stringify(dmmfDatamodel)) },
        datasources: [],
        datamodel,
        version: 'test',
    } as unknown as GeneratorOptions)

    return fs.readFileSync(outputFile, 'utf8')
}

describe('browser-free text output', () => {
    beforeEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
        fs.mkdirSync(tmpDir, { recursive: true })
    })

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it('wraps .md output in a mermaid code fence', async () => {
        const output = await render('erd.md')

        expect(output.startsWith('```mermaid\nerDiagram')).toBe(true)
        expect(output.endsWith('```\n')).toBe(true)
        expect(output).toContain('"User" {')
    })

    it('writes .mmd output as bare mermaid', async () => {
        const output = await render('erd.mmd')

        expect(output.startsWith('erDiagram')).toBe(true)
        expect(output).not.toContain('```')
        expect(output).toContain('"User" {')
    })

    it('keeps the mermaid CLI out of the required install', () => {
        // .md / .mmd never shell out to mmdc, so a plain install must not drag
        // in the CLI and its headless Chromium — see #293 / #176
        expect(packageJson.dependencies).not.toHaveProperty(
            '@mermaid-js/mermaid-cli'
        )
        expect(packageJson.peerDependenciesMeta).toHaveProperty(
            ['@mermaid-js/mermaid-cli', 'optional'],
            true
        )
    })
})
