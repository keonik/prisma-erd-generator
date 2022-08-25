import { DMLEnum, DMLType } from './generate_old';

export interface TemplateValues {
    tables: Table[];
    relationships: Relationship[];
}

export interface Table {
    name: string;
    fields: {
        name: string;
        primaryKey: string;
        rowBgColor: string;
    }[];
}

export interface Relationship {
    fromTableName: string;
    fromFieldIndex: number;
    fromRelationshipType: '1' | '*';
    toTableName: string;
    toFieldIndex: number;
    toRelationshipType: '1' | '*';
}

export interface DMLModel {
    name: string;
    isEmbedded: boolean;
    dbName: string | null;
    fields: {
        name: string;
        hasDefaultValue: boolean;
        isGenerated: boolean;
        isId: boolean;
        isList: boolean;
        isReadOnly: boolean;
        isRequired: boolean;
        isUnique: boolean;
        isUpdatedAt: boolean;
        kind: 'scalar' | 'object' | 'enum';
        type: string;
        relationFromFields?: any[];
        relationName?: string;
        relationOnDelete?: string;
        relationToFields?: any[];
    }[];
    idFields: any[];
    uniqueFields: any[];
    uniqueIndexes: any[];
    isGenerated: boolean;
}

export interface DML {
    enums: DMLEnum[];
    models: DMLModel[];
    types: DMLType[];
}
