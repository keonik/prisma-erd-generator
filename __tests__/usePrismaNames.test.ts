import fs from 'node:fs'
import path from 'node:path'
import type { GeneratorOptions } from '@prisma/generator-helper'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import generate from '../src/generate'

const tmpDir = path.join(__dirname, 'tmp-use-prisma-names')

const datamodel = `
model User {
  id        Int      @id
  nickName  String   @map("nick_name")
  posts     Post[]
  role      Role

  @@map("users")
}

model Post {
  id       Int  @id
  author   User @relation(fields: [authorId], references: [id])
  authorId Int

  @@map("posts")
}

enum Role {
  ADMIN
  USER

  @@map("roles")
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
    types: [],
    enums: [
        {
            name: 'Role',
            dbName: 'roles',
            values: [
                { name: 'ADMIN', dbName: null },
                { name: 'USER', dbName: null },
            ],
        },
    ],
    models: [
        {
            name: 'User',
            dbName: 'users',
            fields: [
                field('id', { isId: true, type: 'Int' }),
                field('nickName', { dbName: 'nick_name' }),
                field('posts', {
                    kind: 'object',
                    type: 'Post',
                    isList: true,
                    relationName: 'PostToUser',
                    relationFromFields: [],
                    relationToFields: [],
                }),
                field('role', { kind: 'enum', type: 'Role' }),
            ],
            idFields: [],
            uniqueFields: [],
            uniqueIndexes: [],
            isGenerated: false,
            primaryKey: null,
        },
        {
            name: 'Post',
            dbName: 'posts',
            fields: [
                field('id', { isId: true, type: 'Int' }),
                field('author', {
                    kind: 'object',
                    type: 'User',
                    relationName: 'PostToUser',
                    relationFromFields: ['authorId'],
                    relationToFields: ['id'],
                }),
                field('authorId', { type: 'Int' }),
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
        // the renderer mutates field names in place, so hand it a fresh copy
        dmmf: { datamodel: JSON.parse(JSON.stringify(dmmfDatamodel)) },
        datasources: [],
        datamodel,
        version: 'test',
    } as unknown as GeneratorOptions)

    return fs.readFileSync(outputFile, 'utf8')
}

describe('usePrismaNames', () => {
    beforeEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
        fs.mkdirSync(tmpDir, { recursive: true })
    })

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it('uses @@map / @map database names by default', async () => {
        const output = await render('db-names.md')

        expect(output).toContain('"users" {')
        expect(output).toContain('"posts" {')
        expect(output).toContain('nick_name')
        expect(output).not.toContain('"User" {')
        expect(output).not.toContain('nickName')
    })

    it('uses prisma model and field names when enabled', async () => {
        const output = await render('prisma-names.md', {
            usePrismaNames: 'true',
        })

        expect(output).toContain('"User" {')
        expect(output).toContain('"Post" {')
        expect(output).toContain('nickName')
        expect(output).not.toContain('"users" {')
        expect(output).not.toContain('nick_name')
    })

    it('points relationships at the same node the entity was rendered as', async () => {
        const dbNames = await render('db-relations.md')

        expect(dbNames).toContain('"posts" }o--|| "users"')
        // the enum block renders as `roles`, so the relation has to say `roles`
        // too, otherwise mermaid draws an extra empty `Role` node
        expect(dbNames).toContain('"users" |o--|| "roles"')
        expect(dbNames).not.toContain('"Role"')

        const prismaNames = await render('prisma-relations.md', {
            usePrismaNames: 'true',
        })

        expect(prismaNames).toContain('"Post" }o--|| "User"')
        expect(prismaNames).toContain('"User" |o--|| "Role"')
        expect(prismaNames).not.toContain('"roles"')
    })
})
