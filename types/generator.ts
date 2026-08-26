export interface PrismaERDConfig {
    theme?: string
    /** which diagram renderer to use: 'mermaid' (default) or 'graphviz' */
    renderer?: string
    mmdcPath?: string
    tableOnly?: string
    disableEmoji?: string
    ignoreEnums?: string
    ignoreViews?: string
    ignorePattern?: string
    includeRelationFromFields?: string
    sortFields?: string
    includeComments?: string
    usePrismaNames?: string
    showIndexes?: string
    erdDebug?: string
    puppeteerConfig?: string
    mermaidConfig?: string
    disabled?: string
}
