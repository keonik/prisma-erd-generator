import { GeneratorOptions } from '@prisma/generator-helper';
import * as path from 'path';
import fs from 'fs';
import os from 'os';
import * as dotenv from 'dotenv';
import * as handlebars from 'handlebars';
import { mainLayout } from './templates';
import { DML, Relationship, TemplateValues } from './models';
import { mapPrismaToDb, parseDataModel } from './parse-data-model';

dotenv.config(); // Load the environment variables

const getRelationships = (dml: DML) => {
    const modellikes = dml.models.concat(dml.types);

    const relationships: Relationship[] = [];

    for (const model of modellikes) {
        for (const field of model.fields) {
            if (field.kind === 'enum') {
                continue;
            }

            const thisSide =  model.name || model.dbName || '';
            const otherSide = field.type;

            // normal relations
            if (
                (field.relationFromFields &&
                    field.relationFromFields.length > 0)
            ) {
                let thisSideMultiplicity: '*' | '1' = '1';
                if (field.isList) {
                    thisSideMultiplicity = '*';
                } else if (!field.isRequired) {
                    thisSideMultiplicity = '1';
                }

                const otherModel = modellikes.find(
                    (model) => model.name === otherSide
                );

                const otherField = otherModel?.fields.find(
                    ({ relationName }) => relationName === field.relationName
                );

                let otherSideMultiplicity: '*' | '1' = '1';
                if (otherField?.isList) {
                    thisSideMultiplicity = '*';
                } else if (!otherField?.isRequired) {
                    thisSideMultiplicity = '1';
                }

                const fromFieldIndex = model.fields.findIndex(
                    (f) => f.type === otherSide
                )
                const toFieldIndex = otherModel?.fields.findIndex(
                    (f) => f.type === thisSide
                )
                if (
                    !relationships.find(
                        (r) =>
                            r.fromTableName === otherSide &&
                            r.toTableName === thisSide
                    )&& fromFieldIndex !== -1 && toFieldIndex && toFieldIndex !== -1
                ) {
                    relationships.push({
                        fromTableName: model.name,
                        fromFieldIndex,
                        fromRelationshipType: thisSideMultiplicity,
                        toTableName: otherModel?.name || otherSide,
                        toFieldIndex,
                        toRelationshipType: otherSideMultiplicity,
                    });
                }
            }
            // many to many
            else if (
                modellikes.find(
                    (m) => m.name === field.type || m.dbName === field.type
                ) &&
                field.relationFromFields?.length === 0 &&
                field.relationToFields?.length
            ) {
                const otherModel = modellikes.find(
                    (model) => model.name === otherSide
                );


                const fromFieldIndex = model.fields.findIndex(
                    (f) => f.type === otherSide
                )
                const toFieldIndex = otherModel?.fields.findIndex(
                    (f) => f.type === thisSide
                )
                if (
                    !relationships.find(
                        (r) =>
                            r.fromTableName === otherSide &&
                            r.toTableName === thisSide
                    )&& fromFieldIndex !== -1 && toFieldIndex && toFieldIndex !== -1
                ) {
                    relationships.push({
                        fromTableName: model.name,
                        fromFieldIndex,
                        fromRelationshipType: '*',
                        toTableName: otherModel?.name || otherSide,
                        toFieldIndex,
                        toRelationshipType: '*',
                    });
                }

            }
            // composite types
            else if (field.kind == 'object') {
                const otherSideCompositeType = dml.types.find(
                    (model) => model.name === otherSide
                );
                if (otherSideCompositeType) {
                    // most logic here is a copy/paste from the normal relation logic
                    // TODO extract and reuse
                    let thisSideMultiplicity: '*' | '1' = '1';
                    if (field.isList) {
                        thisSideMultiplicity = '*';
                    } else if (!field.isRequired) {
                        thisSideMultiplicity = '1';
                    }

                    const otherField = otherSideCompositeType?.fields.find(
                        ({ relationName }) =>
                            relationName === field.relationName
                    );

                    let otherSideMultiplicity: '*' | '1' = '1';
                    if (otherField?.isList) {
                        thisSideMultiplicity = '*';
                    } else if (!otherField?.isRequired) {
                        thisSideMultiplicity = '1';
                    }
                    const otherModel = modellikes.find(
                        (model) => model.name === otherSide
                    );
                    const fromFieldIndex = model.fields.findIndex(
                        (f) => f.type === otherSide
                    )
                    const toFieldIndex = otherModel?.fields.findIndex(
                        (f) => f.type === thisSide
                    )
                    if (
                        !relationships.find(
                            (r) =>
                                r.fromTableName === otherSide &&
                                r.toTableName === thisSide
                        )&& fromFieldIndex !== -1 && toFieldIndex && toFieldIndex !== -1
                    ) {
                        relationships.push({
                            fromTableName: model.name,
                            fromFieldIndex,
                            fromRelationshipType: thisSideMultiplicity,
                            toTableName: otherModel?.name || otherSide,
                            toFieldIndex,
                            toRelationshipType: otherSideMultiplicity,
                        });
                    }
                }
            }
        }
    }

    return relationships;
};

export default async (options: GeneratorOptions) => {
    try {
        const output = options.generator.output?.value || './prisma/ERD.svg';
        const config = options.generator.config;
        const disabled = Boolean(process.env.DISABLE_ERD);
        const debug =
            config.erdDebug === 'true' || Boolean(process.env.ERD_DEBUG);

        if (disabled) {
            return console.log('ERD generator is disabled');
        }
        if (!options.binaryPaths?.queryEngine)
            throw new Error('no query engine found');

        const queryEngine =
            options.binaryPaths?.queryEngine[
                Object.keys(options.binaryPaths?.queryEngine)[0]
            ];

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep + 'prisma-erd-');

        const datamodelString = await parseDataModel(
            queryEngine,
            options.datamodel,
            tmpDir
        );
        if (!datamodelString) {
            throw new Error('could not parse datamodel');
        }

        let dml: DML = JSON.parse(datamodelString);

        // updating dml to map to db table and column names (@map && @@map)
        dml.models = mapPrismaToDb(dml.models, options.datamodel);

        const datamod: TemplateValues = {
            tables: dml.models.map((m) => ({
                name: m.name,
                fields: m.fields.map((f, index) => ({
                    name: f.name,
                    primaryKey: f.isId ? '🗝' : '',
                    type: f.type,
                    rowBgColor: index % 2 === 0 ? '#e1e1e1' : '#f7f7f7',
                })),
            })),
            relationships: getRelationships(dml),
        };
        console.log('getRelationships(dml.models)', getRelationships(dml));
        const template = handlebars.compile(mainLayout);
        const graph = template(datamod);
        console.log('graph', graph);

        const dotFilePath = `${tmpDir}/data_model.dot`;
        fs.writeFileSync(dotFilePath, graph);

        const { exec } = require('child_process');
        await exec(
            `dot -Tsvg ${dotFilePath} -o ${output}`,
            (err: any, stderr: string) => {
                if (err || stderr) {
                    throw stderr;
                }
            }
        );

        if (debug && datamodelString) {
            fs.mkdirSync(path.resolve('prisma/debug'), { recursive: true });
            const dataModelFile = path.resolve('prisma/debug/1-datamodel.json');
            fs.writeFileSync(dataModelFile, datamodelString);
            console.log(`data model written to ${dataModelFile}`);
        }

        // throw error if file was not created
        if (!fs.existsSync(output)) {
            throw new Error(
                `Issue generating ER Diagram. Expected ${output} to be created`
            );
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};
