import * as child_process from 'node:child_process'
import { test, expect } from 'vitest'

test('setting mmdcPath works', async () => {
    const fileName = 'mmdcPath.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync('prisma generate --schema ./prisma/mmdcPath.prisma')
    const svgContent = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString()
    // did the model get added
    expect(svgContent).toContain('users')

    // User has id
    // plain <text>/<tspan>, not a <foreignObject> HTML label — see #245
    expect(svgContent).toMatch(/<tspan[^>]*>id<\/tspan>/)
})
