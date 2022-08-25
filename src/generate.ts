import { GeneratorOptions } from '@prisma/generator-helper';
import * as path from 'path';
import fs from 'fs';
import os from 'os';
import * as dotenv from 'dotenv';
import * as handlebars from 'handlebars';
import { mainLayout } from './templates';
import { DML, DMLModel, Relationship, TemplateValues } from './models';
import { mapPrismaToDb, parseDataModel } from './parse-data-model';

dotenv.config(); // Load the environment variables

const getRelationships = (model: DMLModel[]) => {
    const relationShips: Relationship[] = [];
    model.forEach((table) => {
        table.fields.forEach((field, fieldIndex) => {
            if (
                field.relationFromFields?.length &&
                field.relationFromFields?.length
            ) {
                relationShips.push({
                    fromTableName: table.name,
                    fromFieldIndex: fieldIndex,
                    fromRelationshipType: '1',
                    toTableName: field.type,
                    toFieldIndex:
                        model
                            .find((t) => t.name === field.type)
                            ?.fields.findIndex(
                                (f) => f.name === field?.relationToFields?.[0]
                            ) ?? 0,
                    toRelationshipType: '1',
                });
            }
        });
    });
    return relationShips;
};

export default async (options: GeneratorOptions) => {
    try {
        const output = options.generator.output?.value || './prisma/ERD.svg';
        const config = options.generator.config;
        const tableOnly = config.tableOnly === 'true';
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
            relationships: getRelationships(dml.models),
        };

        const template = handlebars.compile(mainLayout);
        const graph = template(datamod);
        const dotFilePath = `${tmpDir}/data_model.dot`;
        fs.writeFileSync(dotFilePath, graph);

        const { exec } = require('child_process');
        await exec(
            `dot -Tsvg ${dotFilePath} -o ${output}`,
            (err: any, stderr: string) => {
                if (err) {
                    throw stderr;
                }
            }
        );

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
