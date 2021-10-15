import { DML, DMLModel, mapPrismaToDb } from '../src/generate';
test('@map', async () => {
    const model = `model User {
      id              Int                 @id @default(autoincrement())
      hashedPassword  String?             @map("hashed_password")
    }`;
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
    ];

    const mapTest = mapPrismaToDb(dmlModels, model);

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
    ]);
});
