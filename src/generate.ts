import type { GeneratorOptions } from '@prisma/generator-helper'
import * as path from 'node:path'
import * as child_process from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import { pathToFileURL } from "node:url";
import * as dotenv from 'dotenv'
import type { Configuration as PuppeteerConfiguration } from 'puppeteer'
import type { PrismaERDConfig } from '@/types/generator'
import type {
    DML,
    DMLRendererOptions,
    DMLEnum,
    DMLModel,
    DMLField,
} from '@/types/dml'
import type { MermaidConfig } from 'mermaid'

dotenv.config() // Load the environment variables

function renderDml(dml: DML, options?: DMLRendererOptions) {
    const {
        tableOnly = false,
        ignoreEnums = false,
        ignoreViews = false,
        ignorePattern = [],
        includeRelationFromFields = false,
        disableEmoji = false,
    } = options ?? {}

    const diagram = 'erDiagram'

    // Combine Models and Types as they are pretty similar
    // If ignoreViews is enabled, exclude views from the models
    let models = dml.models
    if (ignoreViews && dml.views) {
        const viewNames = new Set(dml.views.map(v => v.name))
        models = models.filter(m => !viewNames.has(m.name))
    }

    // Filter out models matching ignore patterns
    if (ignorePattern.length > 0) {
        models = models.filter(m => !matchesIgnorePattern(m.name, ignorePattern))
    }

    const modellikes = models.concat(dml.types)
    const enums =
        tableOnly || ignoreEnums
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
                  .join('\n\n')

    const pkSigil = disableEmoji ? '"PK"' : '"🗝️"'
    const nullableSigil = disableEmoji ? '"nullable"' : '"❓"'
    const classes = modellikes
        .map(
            (model) =>
                `  "${model.dbName || model.name}" {
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
                          ? pkSigil
                          : ''
                  }${field.isRequired ? '' : nullableSigil}`
              })
              .join('\n')
}
    }
  `
        )
        .join('\n\n')

    let relationships = ''
    for (const model of modellikes) {
        for (const field of model.fields) {
            const isEnum = field.kind === 'enum'
            if (isEnum && (tableOnly || ignoreEnums)) {
                continue
            }

            const relationshipName = `${isEnum ? 'enum:' : ''}${field.name}`
            const thisSide = `"${model.dbName || model.name}"`
            const otherSide = `"${
                modellikes.find((ml) => ml.name === field.type)?.dbName ||
                field.type
            }"`
            // normal relations
            if (
                (field.relationFromFields &&
                    field.relationFromFields.length > 0) ||
                isEnum
            ) {
                let thisSideMultiplicity = '||'
                if (field.isList) {
                    thisSideMultiplicity = '}o'
                } else if (!field.isRequired) {
                    thisSideMultiplicity = '|o'
                }

                const otherModel = modellikes.find(
                    (model) => model.name === otherSide
                )

                const otherField = otherModel?.fields.find(
                    ({ relationName }) => relationName === field.relationName
                )

                const otherSideMultiplicity = thisSideMultiplicity
                if (otherField?.isList) {
                    thisSideMultiplicity = 'o{'
                } else if (!otherField?.isRequired) {
                    thisSideMultiplicity = 'o|'
                }

                relationships += `    ${thisSide} ${thisSideMultiplicity}--${otherSideMultiplicity} ${
                    otherModel?.dbName || otherSide
                } : "${relationshipName}"\n`
            }
            // many to many
            else if (
                modellikes.find(
                    (m) => m.name === field.type || m.dbName === field.type
                ) &&
                field.relationFromFields?.length === 0
                // && field.relationToFields?.length
            ) {
                // Only render many-to-many once: from the first model in order
                const otherModel = modellikes.find(
                    (m) => m.name === field.type || m.dbName === field.type
                )
                if (otherModel) {
                    const thisIndex = modellikes.indexOf(model)
                    const otherIndex = modellikes.indexOf(otherModel)
                    if (thisIndex < otherIndex) {
                        relationships += `    ${thisSide} o{--}o ${otherSide} : ""\n`
                    }
                }
            } else if (field.kind === 'object') {
                const otherSideCompositeType = dml.types.find(
                    (model) =>
                        model.name
                            .replace(/^_/, 'z_') // replace leading underscores
                            .replace(/\s/g, '') // remove spaces === otherSide
                )
                console.log(otherSide, otherSideCompositeType)
                if (otherSideCompositeType) {
                    // most logic here is a copy/paste from the normal relation logic
                    // TODO extract and reuse
                    let thisSideMultiplicity = '||'
                    if (field.isList) {
                        thisSideMultiplicity = '}o'
                    } else if (!field.isRequired) {
                        thisSideMultiplicity = '|o'
                    }

                    const otherField = otherSideCompositeType?.fields.find(
                        ({ relationName }) =>
                            relationName === field.relationName
                    )

                    const otherSideMultiplicity = thisSideMultiplicity
                    if (otherField?.isList) {
                        thisSideMultiplicity = 'o{'
                    } else if (!otherField?.isRequired) {
                        thisSideMultiplicity = 'o|'
                    }

                    relationships += `    ${thisSide} ${thisSideMultiplicity}--${otherSideMultiplicity} ${
                        otherSideCompositeType.dbName || otherSide
                    } : "${relationshipName}"\n`
                }
            }
        }
    }

    return `${diagram}\n${enums}\n${classes}\n${relationships}`
}

const isFieldShownInSchema =
    (model: DMLModel, includeRelationFromFields: boolean) =>
    (field: DMLField) => {
        if (includeRelationFromFields) {
            return field.kind !== 'object'
        }

        return (
            field.kind !== 'object' &&
            !model.fields.find(({ relationFromFields }) =>
                relationFromFields?.includes(field.name)
            )
        )
    }

export const extractViewNames = (dataModel: string): string[] => {
    const viewNames: string[] = []
    const lines = dataModel?.split('\n') || []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]?.trim()
        if (!line) continue
        // Match lines like "view ViewName {" or "view ViewName{"
        const viewMatch = line.match(/^view\s+(\w+)\s*{/)
        if (viewMatch && viewMatch[1]) {
            viewNames.push(viewMatch[1])
        }
    }

    return viewNames
}

/**
 * Converts a glob-like pattern to a RegExp
 * Supports: * (any characters), ? (single character), exact names
 * Examples:
 *   "sys_*" matches "sys_logs", "sys_audit"
 *   "_*" matches "_prisma_migrations", "_internal"
 *   "temp_?" matches "temp_1", "temp_a"
 *   "Session" matches exactly "Session"
 */
export const patternToRegex = (pattern: string): RegExp => {
    // Escape special regex characters except * and ?
    const escaped = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')  // * = any characters
        .replace(/\?/g, '.')   // ? = single character

    return new RegExp(`^${escaped}$`)
}

/**
 * Check if a model name matches any of the ignore patterns
 */
export const matchesIgnorePattern = (
    modelName: string,
    patterns: string[]
): boolean => {
    return patterns.some(pattern => {
        const regex = patternToRegex(pattern)
        return regex.test(modelName)
    })
}

export const mapPrismaToDb = (dmlModels: DMLModel[], dataModel: string) => {
    const splitDataModel = dataModel
        ?.split('\n')
        .filter((line) => line.includes('@map') || line.includes('model '))
        .map((line) => line.trim())

    return dmlModels.map((model) => {
        return {
            ...model,
            fields: model.fields.map((field) => {
                let filterStatus: 'None' | 'Match' | 'End' = 'None'
                // get line with field to \n
                const lineInDataModel = splitDataModel
                    // filter the current model
                    .filter((line) => {
                        if (
                            filterStatus === 'Match' &&
                            line.includes('model ')
                        ) {
                            filterStatus = 'End'
                        }
                        if (
                            filterStatus === 'None' &&
                            line.includes(`model ${model.name} `)
                        ) {
                            filterStatus = 'Match'
                        }
                        return filterStatus === 'Match'
                    })
                    .find(
                        (line) =>
                            line.includes(`${field.name} `) &&
                            line.includes('@map')
                    )
                if (lineInDataModel) {
                    const regex = new RegExp(/@map\(\"(.*?)\"\)/, 'g')
                    const match = regex.exec(lineInDataModel)

                    if (match?.[1]) {
                        const name = match[1]
                            .replace(/^_/, 'z_') // replace leading underscores
                            .replace(/\s/g, '') // remove spaces

                        field.name = name
                    }
                }

                return field
            }),
        }
    })
}

export default async (options: GeneratorOptions) => {
    try {
        const output = options.generator.output?.value || './prisma/ERD.svg'
        const config = options.generator.config as PrismaERDConfig

        const theme: MermaidConfig['theme'] =
            (config.theme as MermaidConfig['theme']) ?? 'forest'
        let mermaidCliNodePath = path.resolve(
            path.join(config.mmdcPath || 'node_modules/.bin', 'mmdc')
        )
        const tableOnly = config.tableOnly === 'true'
        const disableEmoji = config.disableEmoji === 'true'
        const ignoreEnums = config.ignoreEnums === 'true'
        const ignoreViews = config.ignoreViews === 'true'
        const ignorePattern = config.ignorePattern
            ? config.ignorePattern.split(',').map((p) => p.trim())
            : []
        const includeRelationFromFields =
            config.includeRelationFromFields === 'true'
        const disabled =
            process.env.DISABLE_ERD === 'true' || config.disabled === 'true'
        const debug =
            config.erdDebug === 'true' || Boolean(process.env.ERD_DEBUG)

        if (debug) {
            console.log('debug mode enabled')
            console.log('config', config)
        }

        if (disabled) {
            return console.log('ERD generator is disabled')
        }

        const tmpDir = fs.mkdtempSync(`${os.tmpdir() + path.sep}prisma-erd-`)

        // Prisma 5–7 pass the already-built DMMF to generators; rely on it instead
        // of invoking engine binaries (the query engine is removed in Prisma 7).
        if (!options.dmmf?.datamodel) {
            throw new Error('Datamodel is missing from generator options')
        }

        const dml: DML = JSON.parse(
            JSON.stringify(options.dmmf.datamodel)
        ) as DML

        if (debug && dml) {
            fs.mkdirSync(path.resolve('prisma/debug'), { recursive: true })
            const dataModelFile = path.resolve('prisma/debug/1-datamodel.json')
            fs.writeFileSync(dataModelFile, JSON.stringify(dml, null, 2))
            console.log(`data model written to ${dataModelFile}`)
        }

        // updating dml to map to db table and column names (@map && @@map)
        dml.models = mapPrismaToDb(dml.models, options.datamodel)

        // default types to empty array
        if (!dml.types) {
            dml.types = []
        }

        // Extract view names from schema and populate dml.views
        // Since Prisma's DMMF doesn't separate views from models, we parse the schema
        const viewNames = extractViewNames(options.datamodel)
        dml.views = dml.models.filter((model) => viewNames.includes(model.name))
        if (debug && dml.models) {
            const mapAppliedFile = path.resolve(
                'prisma/debug/2-datamodel-map-applied.json'
            )
            fs.writeFileSync(mapAppliedFile, JSON.stringify(dml, null, 2))
            console.log(`applied @map to fields written to ${mapAppliedFile}`)
        }

        const mermaid = renderDml(dml, {
            tableOnly,
            ignoreEnums,
            ignoreViews,
            ignorePattern,
            includeRelationFromFields,
            disableEmoji,
        })
        if (debug && mermaid) {
            const mermaidFile = path.resolve('prisma/debug/3-mermaid.mmd')
            fs.writeFileSync(mermaidFile, mermaid)
            console.log(`mermaid written to ${mermaidFile}`)
        }

        if (!mermaid)
            throw new Error('failed to construct mermaid instance from dml')

        if (output.endsWith('.md'))
            return fs.writeFileSync(output, `\`\`\`mermaid\n${mermaid}\`\`\`\n`)

        const tempMermaidFile = path.resolve(path.join(tmpDir, 'prisma.mmd'))
        fs.writeFileSync(tempMermaidFile, mermaid)

        // default config parameters https://github.com/mermaid-js/mermaid/blob/master/packages/mermaid/src/defaultConfig.ts
        const defaultMermaidConfig: MermaidConfig = {
            deterministicIds: true,
            maxTextSize: 90000,
            er: {
                useMaxWidth: true,
            },
            theme,
        }
        let mermaidConfig = defaultMermaidConfig

        if (config?.mermaidConfig) {
            const configPath = path.resolve(config.mermaidConfig)
            const importedMermaidConfig = await import(pathToFileURL(configPath).href)
            if (debug) {
                console.log('imported mermaid config: ', importedMermaidConfig)
            }
            // merge default config with imported config
            mermaidConfig = {
                ...defaultMermaidConfig,
                ...importedMermaidConfig,
            }
        }

        const tempConfigFile = path.resolve(path.join(tmpDir, 'config.json'))
        fs.writeFileSync(tempConfigFile, JSON.stringify(mermaidConfig))

        // Generator option to adjust puppeteer
        let puppeteerConfig = config.puppeteerConfig
        if (puppeteerConfig && !fs.existsSync(puppeteerConfig)) {
            throw new Error(
                `Puppeteer config file "${puppeteerConfig}" does not exist`
            )
        }

        // if no config is provided, use a default
        if (!puppeteerConfig) {
            // Referencing default mermaid-js puppeteer-config.json
            // https://github.com/mermaid-js/mermaid-cli/blob/master/puppeteer-config.json
            const tempPuppeteerConfigFile = path.resolve(
                path.join(tmpDir, 'puppeteerConfig.json')
            )
            let executablePath: string | undefined
            const puppeteerConfigJson: PuppeteerConfiguration & {
                args?: string[]
            } = {
                logLevel: debug ? 'warn' : 'error',
                executablePath,
            }
            // if MacOS M1/M2, provide your own path to chromium
            if (os.platform() === 'darwin' && os.arch() === 'arm64') {
                try {
                    const executablePath = child_process
                        .execSync('which chromium')
                        .toString()
                        .replace('\n', '')
                    if (!executablePath) {
                        throw new Error(
                            'Could not find chromium executable. Refer to https://github.com/keonik/prisma-erd-generator#issues for next steps.'
                        )
                    }
                    puppeteerConfigJson.executablePath = executablePath
                    puppeteerConfigJson.args = ['--no-sandbox']
                } catch (error) {
                    console.error(error)
                    console.log(
                        `\nPrisma ERD Generator: Unable to find chromium path for you MacOS arm64 machine. Attempting to use the default at ${executablePath}. To learn more visit https://github.com/keonik/prisma-erd-generator#-arm64-users-\n`
                    )
                    executablePath = '/usr/bin/chromium-browser'
                }
            }
            fs.writeFileSync(
                tempPuppeteerConfigFile,
                JSON.stringify(puppeteerConfigJson)
            )
            puppeteerConfig = tempPuppeteerConfigFile
        }
        if (config.mmdcPath) {
            if (!fs.existsSync(mermaidCliNodePath)) {
                throw new Error(
                    `\nMermaid CLI provided path does not exist. \n${mermaidCliNodePath}`
                )
            }
        } else if (!fs.existsSync(mermaidCliNodePath)) {
            const findMermaidCli = child_process
                .execSync('find ../.. -name mmdc')
                .toString()
                .split('\n')
                .filter((path) => path)
                .pop()
            if (!findMermaidCli || !fs.existsSync(findMermaidCli)) {
                throw new Error(
                    `Expected mermaid CLI at \n${mermaidCliNodePath}\n\nor\n${findMermaidCli}\n but this package was not found.`
                )
            }
            mermaidCliNodePath = path.resolve(findMermaidCli)
        }

        const mermaidCommand = `"${mermaidCliNodePath}" -i "${tempMermaidFile}" -o "${output}" -c "${tempConfigFile}" -p "${puppeteerConfig}"`
        if (debug && mermaidCommand)
            console.log('mermaid command: ', mermaidCommand)
        child_process.execSync(mermaidCommand)

        // throw error if file was not created
        if (!fs.existsSync(output)) {
            throw new Error(
                `Issue generating ER Diagram. Expected ${output} to be created`
            )
        }
    } catch (error) {
        console.error(error)
        throw error
    }
}
