import * as path from 'path';
import * as child_process from 'child_process';
import fs from 'fs';
import { DMLModel } from './models';

export function getDataModelFieldWithoutParsing(parsed: string) {
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

export async function parseDataModel(
    engine: string,
    model: string,
    tmpDir: string
) {
    // Could theoretically use original file instead of re-writing the option
    // string to new file but logic for finding correct schema2.prisma in
    // monorepos and containers can be tricky (see Prisma issue log) so safer
    // to rely on given content
    const tmpSchema = path.resolve(path.join(tmpDir, 'schema2.prisma'));

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

export const mapPrismaToDb = (dmlModels: DMLModel[], dataModel: string) => {
    const splitDataModel = dataModel
        ?.split('\n')
        .filter((line) => line.includes('@map') || line.includes('model '))
        .map((line) => line.trim());

    return dmlModels.map((model) => {
        return {
            ...model,
            fields: model.fields.map((field) => {
                // get line with field to \n
                const lineInDataModel = splitDataModel
                    // skip lines before the current model
                    .slice(
                        splitDataModel.findIndex((line) =>
                            line.includes(`model ${model.name}`)
                        )
                    )
                    .find((line) => line.includes(`${field.name}`));
                if (lineInDataModel) {
                    const regex = new RegExp(/@map\(\"(.*?)\"\)/, 'g');
                    const match = regex.exec(lineInDataModel);
                    if (match?.[1]) {
                        // remove spaces
                        field = {
                            ...field,
                            name: match[1]
                                // replace leading underscores and spaces in @map column
                                .replace(/^_/, 'z_')
                                .replace(/\s/g, ''),
                        };
                    }
                }

                return field;
            }),
        };
    });
};
