import { GeneratorOptions } from '@prisma/generator-helper';
import * as path from 'path';
import * as child_process from 'child_process';
import fs from 'fs';
import os from 'os';
import * as dotenv from 'dotenv';

dotenv.config(); // Load the environment variables

export interface DMLModel {
    name: string;
    isEmbedded: boolean;
    dbName: string | null;
    fields: DMLField[];
    idFields: any[];
    uniqueFields: any[];
    uniqueIndexes: any[];
    isGenerated: boolean;
    primaryKey: {
        name: string | null;
        fields: string[];
    } | null;
}

export interface DMLRendererOptions {
    tableOnly?: boolean;
    includeRelationFromFields?: boolean;
}

// Copy paste of the DMLModel
// TODO Adapt to real type of composite types - and then make them concat-enable anyway
export interface DMLType {
    name: string;
    isEmbedded: boolean;
    dbName: string | null;
    fields: DMLField[];
    idFields: any[];
    uniqueFields: any[];
    uniqueIndexes: any[];
    isGenerated: boolean;
    primaryKey: {
        name: string | null;
        fields: string[];
    } | null;
}

export interface DMLField {
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
}

export interface DMLEnum {
    name: string;
    dbName: string | null;
    values: Array<{
        name: string;
        dbName: string;
    }>;
}

export interface DML {
    enums: DMLEnum[];
    models: DMLModel[];
    types: DMLType[];
}

function getDataModelFieldWithoutParsing(parsed: string) {
    const startOfField = parsed.indexOf('"datamodel"');
    const openingBracket = parsed.indexOf('{', startOfField);

    let numberOfOpeningBrackets = 0;
    let closingBracket = openingBracket;
    while (closingBracket < parsed.length) {
        const char = parsed[closingBracket++];

        if (char === '{') {
            numberOfOpeningBrackets++;
        } else if (char === '}') {
            numberOfOpeningBrackets--;

            if (numberOfOpeningBrackets === 0) {
                break;
            }
        }
    }

    return parsed.slice(openingBracket, closingBracket);
}

export async function parseDatamodel(
    engine: string,
    model: string,
    tmpDir: string
) {
    // Could theoretically use original file instead of re-writing the option
    // string to new file but logic for finding correct schema.prisma in
    // monorepos and containers can be tricky (see Prisma issue log) so safer
    // to rely on given content
    const tmpSchema = path.resolve(path.join(tmpDir, 'schema.prisma'));

    fs.writeFileSync(tmpSchema, model);

    const parsed: string = await new Promise((resolve, reject) => {
        const process = child_process.exec(
            `${engine} --datamodel-path=${tmpSchema} cli dmmf`
        );
        let output = '';
        process.stderr?.on('data', (l) => {
            if (l.includes('error:')) {
                reject(l.slice(l.indexOf('error:'), l.indexOf('\\n')));
            }
        });
        process.stdout?.on('data', (d) => (output += d));
        process.on('exit', () => {
            resolve(output);
        });
    });

    return getDataModelFieldWithoutParsing(parsed);
}

function renderDml(dml: DML, options?: DMLRendererOptions) {
    const { tableOnly = false, includeRelationFromFields = false } =
        options ?? {};

    const diagram = 'erDiagram';

    // Combine Models and Types as they are pretty similar
    const modellikes = dml.models.concat(dml.types);

    const enums = tableOnly
        ? ''
        : dml.enums
              .map(
                  (model: DMLEnum) => `
        ${model.dbName || model.name} {
            ${model.values
                .map(
                    (value) =>
                        `${value.name || value.dbName} ${
                            value.dbName || value.name
                        }`
                )
                .join('\n')}
        }
    `
              )
              .join('\n\n');

    const classes = modellikes
        .map(
            (model) =>
                `  ${model.dbName || model.name} {
${
    tableOnly
        ? ''
        : model.fields
              .filter(isFieldShownInSchema(model, includeRelationFromFields))
              // the replace is a hack to make MongoDB style ID columns like _id valid for Mermaid
              .map((field) => {
                  return `    ${field.type.trimStart()} ${field.name.replace(
                      /^_/,
                      'z_'
                  )} ${
                      field.isId ||
                      model.primaryKey?.fields?.includes(field.name)
                          ? 'PK'
                          : ''
                  } ${field.isRequired ? '' : '"nullable"'}`;
              })
              .join('\n')
}
    }
  `
        )
        .join('\n\n');

    let relationships = '';
    for (const model of modellikes) {
        for (const field of model.fields) {
            const isEnum = field.kind === 'enum';
            if (tableOnly && isEnum) {
                continue;
            }

            const relationshipName = `${isEnum ? 'enum:' : ''}${field.name}`;
            const thisSide = model.dbName || model.name;
            const otherSide = field.type;

            // normal relations
            if (
                (field.relationFromFields &&
                    field.relationFromFields.length > 0) ||
                isEnum
            ) {
                let thisSideMultiplicity = '||';
                if (field.isList) {
                    thisSideMultiplicity = '}o';
                } else if (!field.isRequired) {
                    thisSideMultiplicity = '|o';
                }

                const otherModel = modellikes.find(
                    (model) => model.name === otherSide
                );

                const otherField = otherModel?.fields.find(
                    ({ relationName }) => relationName === field.relationName
                );

                let otherSideMultiplicity = thisSideMultiplicity;
                if (otherField?.isList) {
                    thisSideMultiplicity = 'o{';
                } else if (!otherField?.isRequired) {
                    thisSideMultiplicity = 'o|';
                }

                relationships += `    ${thisSide} ${thisSideMultiplicity}--${otherSideMultiplicity} ${
                    otherModel?.dbName || otherSide
                } : "${relationshipName}"\n`;
            }
            // many to many
            else if (
                modellikes.find(
                    (m) => m.name === field.type || m.dbName === field.type
                ) &&
                field.relationFromFields?.length === 0 &&
                field.relationToFields?.length
            ) {
                relationships += `    ${thisSide} o{--}o ${otherSide} : ""\n`;
            }
            // composite types
            else if (field.kind == 'object') {
                const otherSideCompositeType = dml.types.find(
                    (model) => model.name === otherSide
                );
                if (otherSideCompositeType) {
                    // most logic here is a copy/paste from the normal relation logic
                    // TODO extract and reuse
                    let thisSideMultiplicity = '||';
                    if (field.isList) {
                        thisSideMultiplicity = '}o';
                    } else if (!field.isRequired) {
                        thisSideMultiplicity = '|o';
                    }

                    const otherField = otherSideCompositeType?.fields.find(
                        ({ relationName }) =>
                            relationName === field.relationName
                    );

                    let otherSideMultiplicity = thisSideMultiplicity;
                    if (otherField?.isList) {
                        thisSideMultiplicity = 'o{';
                    } else if (!otherField?.isRequired) {
                        thisSideMultiplicity = 'o|';
                    }

                    relationships += `    ${thisSide} ${thisSideMultiplicity}--${otherSideMultiplicity} ${
                        otherSideCompositeType.dbName || otherSide
                    } : "${relationshipName}"\n`;
                }
            }
        }
    }

    return diagram + '\n' + enums + '\n' + classes + '\n' + relationships;
}

const isFieldShownInSchema =
    (model: DMLModel, includeRelationFromFields: boolean) =>
    (field: DMLField) => {
        if (includeRelationFromFields) {
            return field.kind !== 'object';
        }

        return (
            field.kind !== 'object' &&
            !model.fields.find(
                ({ relationFromFields }) =>
                    relationFromFields &&
                    relationFromFields.includes(field.name)
            )
        );
    };

export const mapPrismaToDb = (dmlModels: DMLModel[], dataModel: string) => {
    const splitDataModel = dataModel
        ?.split('\n')
        .filter((line) => line.includes('@map') || line.includes('model '))
        .map((line) => line.trim());

    return dmlModels.map((model) => {
        return {
            ...model,
            fields: model.fields.map((field) => {
                let filterStatus: 'None' | 'Match' | 'End' = 'None';
                // get line with field to \n
                const lineInDataModel = splitDataModel
                    // filter the current model
                    .filter((line) => {
                        if (
                            filterStatus === 'Match' &&
                            line.includes('model ')
                        ) {
                            filterStatus = 'End';
                        }
                        if (
                            filterStatus === 'None' &&
                            line.includes(`model ${model.name} `)
                        ) {
                            filterStatus = 'Match';
                        }
                        return filterStatus === 'Match';
                    })
                    .find(
                        (line) =>
                            line.includes(`${field.name} `) &&
                            line.includes('@map')
                    );
                if (lineInDataModel) {
                    const regex = new RegExp(/@map\(\"(.*?)\"\)/, 'g');
                    const match = regex.exec(lineInDataModel);

                    if (match?.[1]) {
                        const name = match[1]
                            .replace(/^_/, 'z_') // replace leading underscores
                            .replace(/\s/g, ''); // remove spaces

                        field = {
                            ...field,
                            name: name,
                        };
                    }
                }

                return field;
            }),
        };
    });
};

export default async (options: GeneratorOptions) => {
    try {
        const output = options.generator.output?.value || './prisma/ERD.svg';
        const config = options.generator.config;
        const theme = config.theme || 'forest';
        const tableOnly = config.tableOnly === 'true';
        const includeRelationFromFields =
            config.includeRelationFromFields === 'true';
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

        const datamodelString = await parseDatamodel(
            queryEngine,
            options.datamodel,
            tmpDir
        );
        if (!datamodelString) {
            throw new Error('could not parse datamodel');
        }

        if (debug && datamodelString) {
            fs.mkdirSync(path.resolve('prisma/debug'), { recursive: true });
            const dataModelFile = path.resolve('prisma/debug/1-datamodel.json');
            fs.writeFileSync(dataModelFile, datamodelString);
            console.log(`data model written to ${dataModelFile}`);
        }

        let dml: DML = JSON.parse(datamodelString);

        // updating dml to map to db table and column names (@map && @@map)
        dml.models = mapPrismaToDb(dml.models, options.datamodel);

        // default types to empty array
        if (!dml.types) {
            dml.types = [];
        }
        if (debug && dml.models) {
            const mapAppliedFile = path.resolve(
                'prisma/debug/2-datamodel-map-applied.json'
            );
            fs.writeFileSync(mapAppliedFile, JSON.stringify(dml, null, 2));
            console.log(`applied @map to fields written to ${mapAppliedFile}`);
        }

        const mermaid = renderDml(dml, {
            tableOnly,
            includeRelationFromFields,
        });
        if (debug && mermaid) {
            const mermaidFile = path.resolve('prisma/debug/3-mermaid.mmd');
            fs.writeFileSync(mermaidFile, mermaid);
            console.log(`mermaid written to ${mermaidFile}`);
        }

        if (!mermaid)
            throw new Error('failed to construct mermaid instance from dml');

        if (output.endsWith('.md'))
            return fs.writeFileSync(
                output,
                '```mermaid' + `\n` + mermaid + '```' + `\n`
            );

        const tempMermaidFile = path.resolve(path.join(tmpDir, 'prisma.mmd'));
        fs.writeFileSync(tempMermaidFile, mermaid);

        const tempConfigFile = path.resolve(path.join(tmpDir, 'config.json'));
        fs.writeFileSync(
            tempConfigFile,
            JSON.stringify({ deterministicIds: true, maxTextSize: 90000 })
        );

        let mermaidCliNodePath = path.resolve(
            path.join('node_modules', '.bin', 'mmdc')
        );

        if (!fs.existsSync(mermaidCliNodePath)) {
            const findMermaidCli = child_process
                .execSync('find ../.. -name mmdc')
                .toString()
                .split('\n')
                .filter((path) => path)
                .pop();
            if (!findMermaidCli || !fs.existsSync(findMermaidCli)) {
                throw new Error(
                    `Expected mermaid CLI at \n${mermaidCliNodePath}\n\nor\n${findMermaidCli}\n but this package was not found.`
                );
            } else {
                mermaidCliNodePath = findMermaidCli;
            }
        }

        const mermaidCommand = `${mermaidCliNodePath} -i ${tempMermaidFile} -o ${output} -t ${theme} -c ${tempConfigFile}`;
        if (debug && mermaidCommand)
            console.log('mermaid command: ', mermaidCommand);
        child_process.execSync(mermaidCommand, {
            stdio: 'ignore',
        });

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
