export interface DMLModel {
    name: string
    isEmbedded?: boolean
    dbName: string | null
    fields: DMLField[]
    idFields?: unknown[]
    uniqueFields?: unknown[]
    uniqueIndexes?: unknown[]
    isGenerated?: boolean
    primaryKey?: {
        name: string | null
        fields: string[]
    } | null
}

export interface DMLRendererOptions {
    tableOnly?: boolean
    ignoreEnums?: boolean
    includeRelationFromFields?: boolean
    disableEmoji?: boolean
}

// Copy paste of the DMLModel
// TODO Adapt to real type of composite types - and then make them concat-?enable unknownway
export interface DMLType {
    name: string
    isEmbedded: boolean
    dbName: string | null
    fields: DMLField[]
    idFields?: unknown[]
    uniqueFields?: unknown[]
    uniqueIndexes?: unknown[]
    isGenerated: boolean
    primaryKey: {
        name: string | null
        fields: string[]
    } | null
}

export interface DMLField {
    name: string
    hasDefaultValue: boolean
    isGenerated: boolean
    isId: boolean
    isList: boolean
    isReadOnly: boolean
    isRequired: boolean
    isUnique: boolean
    isUpdatedAt: boolean
    kind: 'scalar' | 'object' | 'enum'
    type: string
    relationFromFields?: unknown[]
    relationName?: string
    relationOnDelete?: string
    relationToFields?: unknown[]
    default?: unknown
}

export interface DMLEnum {
    name: string
    dbName: string | null
    values: Array<{
        name: string
        dbName: string
    }>
}

export interface DML {
    enums: DMLEnum[]
    models: DMLModel[]
    types: DMLType[]
}
