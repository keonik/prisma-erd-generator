import { GeneratorOptions } from '@prisma/generator-helper';
import * as path from 'path';
import * as child_process from 'child_process';
import fs from 'fs';
import os from 'os';

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
    enums: any[];
    models: DMLModel[];
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

export async function parseDatamodel(engine: string, model: string) {
    const modelB64 = Buffer.from(model).toString('base64');

    const parsed: string = await new Promise((resolve, reject) => {
        const process = child_process.exec(
            `${engine} --datamodel=${modelB64} cli dmmf`
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

function renderDml(dml: DML) {
    const diagram = 'erDiagram';

    const classes = dml.models
        .map(
            (model) =>
                `  ${model.dbName || model.name} {
  ${model.fields
      .filter(
          (field) =>
              field.kind !== 'object' &&
              !model.fields.find(
                  ({ relationFromFields }) =>
                      relationFromFields &&
                      relationFromFields.includes(field.name)
              )
      )
      .map((field) => `    ${field.type} ${field.name}`)
      .join('\n')}  
    }
  `
        )
        .join('\n\n');

    let relationships = '';
    for (const model of dml.models) {
        for (const field of model.fields) {
            if (
                field.relationFromFields &&
                field.relationFromFields.length > 0
            ) {
                const relationshipName = field.name;
                const thisSide = model.dbName || model.name;
                const otherSide = field.type;

                let thisSideMultiplicity = '||';
                if (field.isList) {
                    thisSideMultiplicity = '}o';
                } else if (!field.isRequired) {
                    thisSideMultiplicity = '|o';
                }
                const otherModel = dml.models.find(
                    (model) => model.name === otherSide
                );
                const otherField = otherModel?.fields.find(
                    ({ relationName }) => relationName === field.relationName
                );

                let otherSideMultiplicity = '||';
                if (otherField?.isList) {
                    thisSideMultiplicity = 'o{';
                } else if (!otherField?.isRequired) {
                    thisSideMultiplicity = 'o|';
                }

                relationships += `    ${thisSide} ${thisSideMultiplicity}--${otherSideMultiplicity} ${
                    otherModel?.dbName || otherSide
                } : "${relationshipName}"\n`;
            }
        }
    }

    return diagram + '\n' + classes + '\n' + relationships;
}

export const mapPrismaToDb = (dmlModels: DMLModel[], dataModel: string) => {
    const splitDataModel = dataModel
        ?.split('\n')
        .filter((line) => line.includes('@map'))
        .map((line) => line.trim());

    return dmlModels.map((model) => {
        return {
            ...model,
            fields: model.fields.map((field) => {
                // get line with field to \n
                const lineInDataModel = splitDataModel.find((line) =>
                    line.includes(`${field.name}`)
                );
                if (lineInDataModel) {
                    const startingMapIndex =
                        lineInDataModel.indexOf('@map') + 6;
                    const modelField = lineInDataModel.substring(
                        startingMapIndex,
                        lineInDataModel
                            .substring(startingMapIndex)
                            .indexOf('")') + startingMapIndex
                    );
                    if (modelField) {
                        field = { ...field, name: modelField };
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

        if (!options.binaryPaths?.queryEngine)
            throw new Error('no query engine found');

        const queryEngine =
            options.binaryPaths?.queryEngine[
                Object.keys(options.binaryPaths?.queryEngine)[0]
            ];

        // https://github.com/notiz-dev/prisma-dbml-generator
        const datamodelString = await parseDatamodel(
            queryEngine,
            options.datamodel
        );
        if (!datamodelString) throw new Error('could not parse datamodel');

        let dml: DML = JSON.parse(datamodelString);

        // updating dml to map to db table and column names (@map && @@map)
        dml.models = mapPrismaToDb(dml.models, options.datamodel);

        const mermaid = renderDml(dml);

        if (!mermaid)
            throw new Error('failed to construct mermaid instance from dml');

        if (output.endsWith('.md'))
            return fs.writeFileSync(
                output,
                '```mermaid' + `\n` + mermaid + '```' + `\n`
            );

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep + 'prisma-erd-');

        const tempMermaidFile = path.resolve(path.join(tmpDir, 'prisma.mmd'));
        fs.writeFileSync(tempMermaidFile, mermaid);

        const tempConfigFile = path.resolve(path.join(tmpDir, 'config.json'));
        fs.writeFileSync(
            tempConfigFile,
            JSON.stringify({ deterministicIds: true })
        );

        const mermaidCliNodePath = path.resolve(
            path.join(__dirname, '../node_modules', '.bin', 'mmdc')
        );

        child_process.execSync(
            `${mermaidCliNodePath} -i ${tempMermaidFile} -o ${output} -t ${theme} -c ${tempConfigFile}`,
            {
                stdio: 'inherit',
            }
        );
    } catch (error) {
        console.error(error);
    }
};
