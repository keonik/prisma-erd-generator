import type { DML, DMLModel } from '../src/types/dml'
import { mapPrismaToDb } from '../src/generate'
import * as child_process from 'node:child_process';
import { test, expect } from 'vitest';

test('@map', async () => {
    const model = `model User {
      id              Int                 @id @default(autoincrement())
      hashedPassword  String?             @map("hashed_password")
    }`
    const dmlModels: DMLModel[] = [
        {
            dbName: null,
            name: 'User',
            fields: [
                {
                    name: 'id',
                    kind: 'scalar',
                    isList: false,
                    isRequired: true,
                    isUnique: false,
                    isId: true,
                    isReadOnly: false,
                    type: 'Int',
                    hasDefaultValue: true,
                    default: { name: 'autoincrement', args: [] },
                    isGenerated: false,
                    isUpdatedAt: false,
                },
                {
                    name: 'hashed_password',
                    kind: 'scalar',
                    isList: false,
                    isRequired: false,
                    isUnique: false,
                    isId: false,
                    isReadOnly: false,
                    type: 'String',
                    hasDefaultValue: false,
                    isGenerated: false,
                    isUpdatedAt: false,
                },
            ],
        },
    ]

    const mapTest = mapPrismaToDb(dmlModels, model)

    expect(mapTest).toEqual([
        {
            dbName: null,
            name: 'User',
            fields: [
                {
                    name: 'id',
                    kind: 'scalar',
                    isList: false,
                    isRequired: true,
                    isUnique: false,
                    isId: true,
                    isReadOnly: false,
                    type: 'Int',
                    hasDefaultValue: true,
                    default: { name: 'autoincrement', args: [] },
                    isGenerated: false,
                    isUpdatedAt: false,
                },
                {
                    name: 'hashed_password',
                    kind: 'scalar',
                    isList: false,
                    isRequired: false,
                    isUnique: false,
                    isId: false,
                    isReadOnly: false,
                    type: 'String',
                    hasDefaultValue: false,
                    isGenerated: false,
                    isUpdatedAt: false,
                },
            ],
        },
    ])
})

test('map e2e', async () => {
    const fileName = 'Mappings.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync('prisma generate --schema ./prisma/mappings.prisma')
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`)
    // did it generate a file
    expect(listFile.toString()).toContain(fileName)

    const svgAsString = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString()
    // did it generate a file with the correct content
    expect(svgAsString).toContain('<svg')

    expect(svgAsString).toContain('users')
    expect(svgAsString).toContain('nick_name')
    expect(svgAsString).toContain('created_at')
    expect(svgAsString).toContain('updated_at')
    expect(svgAsString).toContain('posts')
    expect(svgAsString).toContain('title')
})
