import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import generate from '../src/generate'

const tmpDir = path.join(__dirname, 'tmp-dmmf')
const outputFile = path.join(tmpDir, 'erd.md')

const datamodel = `
model User {
  id    Int    @id @map("user_id")
  email String
}
`

const dmmfDatamodel = {
    enums: [],
    types: [],
    models: [
        {
            name: 'User',
            dbName: 'User',
            fields: [
                {
                    name: 'id',
                    hasDefaultValue: true,
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
                    isUnique: true,
                    isUpdatedAt: false,
                    kind: 'scalar',
                    type: 'String',
                },
            ],
            idFields: [],
            uniqueFields: [],
            uniqueIndexes: [],
            isGenerated: false,
            primaryKey: {
                name: null,
                fields: ['id'],
            },
        },
    ],
}

const baseGenerator = {
    name: 'erd',
    provider: { fromEnvVar: null, value: 'prisma-erd-generator' },
    output: { fromEnvVar: null, value: outputFile },
    config: {},
    binaryTargets: [],
    previewFeatures: [],
    sourceFilePath: 'schema.prisma',
}

describe('generate uses provided DMMF datamodel', () => {
    beforeEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
        fs.mkdirSync(tmpDir, { recursive: true })
    })

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it('renders mapped fields without needing engine binaries', async () => {
        await generate({
            generator: baseGenerator as any,
            otherGenerators: [],
            schemaPath: 'schema.prisma',
            dmmf: { datamodel: dmmfDatamodel } as any,
            datasources: [],
            datamodel,
            version: 'test',
        } as any)

        const output = fs.readFileSync(outputFile, 'utf8')
        expect(output).toContain('user_id')
        expect(output).toContain('erDiagram')
    })
})
