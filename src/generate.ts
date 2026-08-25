import type { GeneratorOptions } from '@prisma/generator-helper'
import * as path from 'node:path'
import * as child_process from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import { pathToFileURL } from 'node:url'
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

// Mermaid attribute comments are double-quoted single-line strings, so a `///`
// comment has to lose its own quotes and line breaks to survive the round trip.
const sanitizeComment = (comment: string) =>
    comment.replace(/"/g, "'").replace(/\s+/g, ' ').trim()

function renderDml(dml: DML, options?: DMLRendererOptions) {
    const {
        tableOnly = false,
        ignoreEnums = false,
        ignoreViews = false,
        ignorePattern = [],
        includeRelationFromFields = false,
        disableEmoji = false,
        sortFields = false,
        includeComments = false,
        usePrismaNames = false,
        showIndexes = false,
    } = options ?? {}

    const diagram = 'erDiagram'

    // `@@map` / `@map` names win by default; `usePrismaNames` keeps the schema
    // names instead. Field names are handled upstream by `mapPrismaToDb`.
    const displayName = (entity: { name: string; dbName?: string | null }) =>
        usePrismaNames ? entity.name : entity.dbName || entity.name

    // Combine Models and Types as they are pretty similar
    // If ignoreViews is enabled, exclude views from the models
    let models = dml.models
    if (ignoreViews && dml.views) {
        const viewNames = new Set(dml.views.map((v) => v.name))
        models = models.filter((m) => !viewNames.has(m.name))
    }

    // Filter out models matching ignore patterns
    if (ignorePattern.length > 0) {
        models = models.filter(
            (m) => !matchesIgnorePattern(m.name, ignorePattern)
        )
    }

    const modellikes = models.concat(dml.types)
    const enums =
        tableOnly || ignoreEnums
            ? ''
            : dml.enums
                  .map(
                      (model: DMLEnum) => `
        ${displayName(model)} {
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

    const pkSigil = disableEmoji ? 'PK' : '🗝️'
    const nullableSigil = disableEmoji ? 'nullable' : '❓'
    const uniqueSigil = disableEmoji ? 'UK' : '🔒'
    const indexSigil = disableEmoji ? 'IDX' : '🔍'
    const getShownFields = (model: DMLModel) => {
        const fields = model.fields.filter(
            isFieldShownInSchema(model, includeRelationFromFields)
        )

        return sortFields
            ? fields.sort((a, b) => a.name.localeCompare(b.name))
            : fields
    }
    const classes = modellikes
        .map(
            (model) =>
                `  "${displayName(model)}" {
${
    tableOnly
        ? ''
        : getShownFields(model)
              // the replace is a hack to make MongoDB style ID columns like _id valid for Mermaid
              .map((field) => {
                  const notes = []
                  if (
                      field.isId ||
                      model.primaryKey?.fields?.includes(field.name)
                  ) {
                      notes.push(pkSigil)
                  }
                  if (!field.isRequired) {
                      notes.push(nullableSigil)
                  }
                  if (showIndexes && field.isUnique) {
                      notes.push(uniqueSigil)
                  }
                  if (showIndexes && field.isIndexed) {
                      notes.push(indexSigil)
                  }
                  if (includeComments && field.documentation) {
                      notes.push(sanitizeComment(field.documentation))
                  }

                  return `    ${field.type.trimStart()} ${field.name.replace(
                      /^_/,
                      'z_'
                  )} ${notes.length ? `"${notes.join(' ')}"` : ''}`
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
            const thisSide = `"${displayName(model)}"`
            // enums are searched too so that an `@@map`ed enum lands on the same
            // node the enum block rendered, instead of an empty duplicate
            const otherEntity =
                modellikes.find(
                    (ml) => ml.name === field.type || ml.dbName === field.type
                ) ??
                dml.enums.find(
                    (e) => e.name === field.type || e.dbName === field.type
                )
            const otherSide = `"${
                otherEntity ? displayName(otherEntity) : field.type
            }"`
            // normal relations
            if (
                (field.relationFromFields &&
                    field.relationFromFields.length > 0) ||
                isEnum
            ) {
                const otherModel = modellikes.find(
                    (model) =>
                        model.name === field.type || model.dbName === field.type
                )

                const otherField = otherModel?.fields.find(
                    ({ relationName }) => relationName === field.relationName
                )

                // thisSideMultiplicity: how many of THIS side per one of OTHER side
                // Based on otherField (if otherField is a list, there are many of this side)
                let thisSideMultiplicity = '||'
                if (otherField?.isList) {
                    thisSideMultiplicity = '}o'
                } else if (!otherField?.isRequired) {
                    thisSideMultiplicity = '|o'
                }

                // otherSideMultiplicity: how many of OTHER side per one of THIS side
                // Based on field (if field is required, there is exactly one of other side)
                let otherSideMultiplicity = '||'
                if (field.isList) {
                    otherSideMultiplicity = '}o'
                } else if (!field.isRequired) {
                    otherSideMultiplicity = '|o'
                }

                relationships += `    ${thisSide} ${thisSideMultiplicity}--${otherSideMultiplicity} ${otherSide} : "${relationshipName}"\n`
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
                    // Check if the other side has relationFromFields (foreign keys)
                    // If it does, this is NOT a many-to-many, it's a one-to-many
                    // that's already being handled when we process the other side
                    const otherField = otherModel.fields.find(
                        ({ relationName }) =>
                            relationName === field.relationName
                    )
                    const isOtherSideOneToMany =
                        otherField?.relationFromFields &&
                        otherField.relationFromFields.length > 0

                    // Only treat as many-to-many if the other side also has no foreign keys
                    if (!isOtherSideOneToMany) {
                        const thisIndex = modellikes.indexOf(model)
                        const otherIndex = modellikes.indexOf(otherModel)
                        if (thisIndex < otherIndex) {
                            relationships += `    ${thisSide} o{--}o ${otherSide} : ""\n`
                        }
                    }
                }
            } else if (field.kind === 'object') {
                const otherSideCompositeType = dml.types.find(
                    (model) =>
                        model.name
                            .replace(/^_/, 'z_') // replace leading underscores
                            .replace(/\s/g, '') === field.type // remove spaces
                )
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

                    relationships += `    ${thisSide} ${thisSideMultiplicity}--${otherSideMultiplicity} "${displayName(
                        otherSideCompositeType
                    )}" : "${relationshipName}"\n`
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
 * Collects the fields covered by a `@@index` for every model in the schema,
 * keyed by model name.
 *
 * Prisma does not put non-unique indexes on the DMMF at all — only `@unique`
 * and `@@unique` survive — so the schema text is the only source for them.
 */
export const extractIndexedFields = (
    dataModel: string
): Record<string, string[]> => {
    const indexed: Record<string, string[]> = {}
    let currentModel: string | null = null

    for (const rawLine of dataModel?.split('\n') ?? []) {
        const line = rawLine.trim()

        const modelMatch = line.match(/^model\s+(\w+)\s*{/)
        if (modelMatch?.[1]) {
            currentModel = modelMatch[1]
            continue
        }
        if (line === '}') {
            currentModel = null
            continue
        }
        if (!currentModel) continue

        // matches both `@@index([a, b])` and `@@index(fields: [a, b])`
        const indexMatch = line.match(
            /^@@index\(\s*(?:fields\s*:\s*)?\[([^\]]+)\]/
        )
        if (!indexMatch?.[1]) continue

        const fields = indexMatch[1]
            .split(',')
            // drop per-field modifiers like `title(sort: Desc)` or `bio(length: 10)`
            .map((field) => field.split('(')[0]?.trim())
            .filter((field): field is string => Boolean(field))

        indexed[currentModel] = (indexed[currentModel] ?? []).concat(fields)
    }

    return indexed
}

/**
 * Flags fields that sit behind an index so the renderer can mark them.
 *
 * Must run before `mapPrismaToDb`, which rewrites field names to their `@map`
 * values — the schema refers to them by their prisma names.
 */
export const markIndexedFields = (
    dmlModels: DMLModel[],
    dataModel: string
): DMLModel[] => {
    const indexedByModel = extractIndexedFields(dataModel)

    return dmlModels.map((model) => {
        const indexed = new Set([
            ...(indexedByModel[model.name] ?? []),
            // `@@unique` composites: the individual fields are not `isUnique`
            ...(model.uniqueFields ?? []).flat(),
        ])

        for (const field of model.fields) {
            if (indexed.has(field.name)) {
                field.isIndexed = true
            }
        }

        return model
    })
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
        .replace(/\*/g, '.*') // * = any characters
        .replace(/\?/g, '.') // ? = single character

    return new RegExp(`^${escaped}$`)
}

/**
 * Check if a model name matches any of the ignore patterns
 */
export const matchesIgnorePattern = (
    modelName: string,
    patterns: string[]
): boolean => {
    return patterns.some((pattern) => {
        const regex = patternToRegex(pattern)
        return regex.test(modelName)
    })
}

/**
 * Last-ditch search for the `mmdc` binary outside the local `node_modules/.bin`
 * — hoisted installs and monorepos routinely put it a couple of levels up.
 *
 * `find` does not exist on stock Windows, and a missing directory makes it exit
 * non-zero, so a failed search is a "not found", never a crash.
 */
/**
 * Candidate filenames for a bin shim.
 *
 * Windows has no extensionless executables, so package managers write shims —
 * and which ones they write differs by installer. npm and pnpm write both a
 * `mmdc` shell script and a `mmdc.cmd`; bun writes only `mmdc.exe`. Probing the
 * variants keeps resolution from depending on who did the install.
 */
export const binaryCandidates = (binPath: string) =>
    process.platform === 'win32'
        ? [binPath, `${binPath}.cmd`, `${binPath}.exe`, `${binPath}.ps1`]
        : [binPath]

export const resolveBinary = (binPath: string) =>
    binaryCandidates(binPath).find((candidate) => fs.existsSync(candidate))

const findMmdc = (): string | undefined => {
    try {
        const found = child_process
            .execSync('find ../.. -name mmdc', {
                stdio: ['ignore', 'pipe', 'ignore'],
            })
            .toString()
            .split('\n')
            .filter((line) => line)
            .pop()

        return found && fs.existsSync(found) ? path.resolve(found) : undefined
    } catch {
        return undefined
    }
}

const missingMermaidCliMessage = (searchedPath: string) =>
    `
prisma-erd-generator: could not find the mermaid CLI (mmdc).

Rendering to .svg, .png or .pdf needs @mermaid-js/mermaid-cli, which is an
optional peer dependency so that it is not installed for everyone:

    npm i -D @mermaid-js/mermaid-cli puppeteer

Already installed? Point the generator at the binary instead:

    generator erd {
      provider = "prisma-erd-generator"
      mmdcPath = "node_modules/.bin"
    }

Don't need an image? Markdown output renders with no browser at all:

    output = "../ERD.md"

Searched ${searchedPath} and \`find ../.. -name mmdc\`.
`

export const mapPrismaToDb = (dmlModels: DMLModel[]) => {
    return dmlModels.map((model) => {
        return {
            ...model,
            fields: model.fields.map((field) => {
                if (field.dbName) {
                    field.name = field.dbName
                        .replace(/^_/, 'z_') // replace leading underscores
                        .replace(/\s/g, '') // remove spaces
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
        const sortFields = config.sortFields === 'true'
        const includeComments = config.includeComments === 'true'
        const usePrismaNames = config.usePrismaNames === 'true'
        const showIndexes = config.showIndexes === 'true'
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

        // `@@index` lives only in the schema text and refers to fields by their
        // prisma names, so this has to happen before @map rewrites them below
        dml.models = markIndexedFields(dml.models, options.datamodel)

        // updating dml to map to db table and column names (@map && @@map)
        if (!usePrismaNames) {
            dml.models = mapPrismaToDb(dml.models)
        }

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
            sortFields,
            includeComments,
            usePrismaNames,
            showIndexes,
        })
        if (debug && mermaid) {
            const mermaidFile = path.resolve('prisma/debug/3-mermaid.mmd')
            fs.writeFileSync(mermaidFile, mermaid)
            console.log(`mermaid written to ${mermaidFile}`)
        }

        if (!mermaid)
            throw new Error('failed to construct mermaid instance from dml')

        // Text output is rendered here and needs no browser, so return before
        // anything reaches for the mermaid CLI.
        if (output.endsWith('.md'))
            return fs.writeFileSync(output, `\`\`\`mermaid\n${mermaid}\`\`\`\n`)

        if (output.endsWith('.mmd')) return fs.writeFileSync(output, mermaid)

        const tempMermaidFile = path.resolve(path.join(tmpDir, 'prisma.mmd'))
        fs.writeFileSync(tempMermaidFile, mermaid)

        // default config parameters https://github.com/mermaid-js/mermaid/blob/master/packages/mermaid/src/defaultConfig.ts
        const defaultMermaidConfig: MermaidConfig = {
            deterministicIds: true,
            maxTextSize: 90000,
            er: {
                useMaxWidth: true,
            },
            // Mermaid defaults to putting every label in a `<foreignObject>`,
            // which embeds HTML in the SVG. That is optional in the SVG spec:
            // browsers honour it, but Inkscape, librsvg and ImageMagick skip
            // it and render a diagram of empty boxes (#245). Plain `<text>`
            // looks the same in a browser and survives everywhere else, which
            // matters for a generator whose main output is an .svg file.
            // Set `htmlLabels: true` in `mermaidConfig` to opt back in.
            htmlLabels: false,
            theme,
        }
        let mermaidConfig = defaultMermaidConfig

        if (config?.mermaidConfig) {
            const configPath = path.resolve(config.mermaidConfig)
            const imported = await import(pathToFileURL(configPath).href)
            // `module.exports = config` and `export default config` both arrive
            // wrapped in a namespace object; spreading that would bury the whole
            // config under a `default` key and silently ignore it
            const importedMermaidConfig = imported.default ?? imported
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

        // Resolve the CLI before hunting for a browser: the puppeteer config
        // below only exists to be handed to mmdc, so without mmdc its noise
        // (including the arm64 `which chromium` probe) buries the real problem.
        if (config.mmdcPath) {
            const resolved = resolveBinary(mermaidCliNodePath)
            if (!resolved) {
                throw new Error(
                    `\nMermaid CLI provided path does not exist. \n${mermaidCliNodePath}`
                )
            }
            mermaidCliNodePath = resolved
        } else {
            const resolved = resolveBinary(mermaidCliNodePath) ?? findMmdc()
            if (!resolved) {
                throw new Error(missingMermaidCliMessage(mermaidCliNodePath))
            }
            mermaidCliNodePath = resolved
        }

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
