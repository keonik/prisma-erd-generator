import fs from 'node:fs'
import path from 'node:path'
import type { GeneratorOptions } from '@prisma/generator-helper'
import { afterEach, beforeEach, expect, test } from 'vitest'
import generate from '../../src/generate'

const tmpDir = path.join(__dirname, 'tmp-259')

/**
 * issue 259: ULID ids
 *
 * The renderer never reads `field.default`, so an id renders from its scalar
 * type and `isId` regardless of which function produced it. This pins that
 * down for every generated-id function Prisma offers, so a future change that
 * starts special-casing defaults can't silently drop support for one.
 *
 * Kept off the schema-driven e2e harness on purpose: `ulid()` only exists from
 * Prisma 6 on, and CI runs the suite against 5.22 as well.
 */
const ID_FUNCTIONS = [
    { fn: 'ulid', type: 'String' },
    { fn: 'cuid', type: 'String' },
    { fn: 'uuid', type: 'String' },
    { fn: 'nanoid', type: 'String' },
    { fn: 'autoincrement', type: 'Int' },
]

const datamodel = ID_FUNCTIONS.map(
    ({ fn, type }) => `model ${fn}Model {
  id ${type} @id @default(${fn}())
}`
).join('\n\n')

const dmmfDatamodel = {
    enums: [],
    types: [],
    models: ID_FUNCTIONS.map(({ fn, type }) => ({
        name: `${fn}Model`,
        dbName: null,
        fields: [
            {
                name: 'id',
                hasDefaultValue: true,
                default: { name: fn, args: [] },
                isGenerated: false,
                isId: true,
                isList: false,
                isReadOnly: false,
                isRequired: true,
                isUnique: false,
                isUpdatedAt: false,
                kind: 'scalar',
                type,
            },
        ],
        idFields: [],
        uniqueFields: [],
        uniqueIndexes: [],
        isGenerated: false,
        primaryKey: null,
    })),
}

beforeEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    fs.mkdirSync(tmpDir, { recursive: true })
})

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
})

test('issue 259: generated id defaults all render as primary keys', async () => {
    const outputFile = path.join(tmpDir, 'erd.md')

    await generate({
        generator: {
            name: 'erd',
            provider: { fromEnvVar: null, value: 'prisma-erd-generator' },
            output: { fromEnvVar: null, value: outputFile },
            config: { disableEmoji: 'true' },
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

    const output = fs.readFileSync(outputFile, 'utf8')

    for (const { fn, type } of ID_FUNCTIONS) {
        expect(output).toContain(`"${fn}Model" {`)
        expect(output).toContain(`${type} id "PK"`)
    }
})
