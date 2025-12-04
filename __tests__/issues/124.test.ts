import * as child_process from 'node:child_process'
import { test, expect } from 'vitest'

test('Zero to many relationship', async () => {
    const fileName = '124.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync(
        'prisma generate --schema ./prisma/issues/124.prisma'
    )
    const svgContent = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString()
    // did the model get added
    expect(svgContent).toContain('Post')
    expect(svgContent).toContain('User')

    // did the relationships get added correctly
    // Post.author is optional (zero or one User per Post) → zeroOrOneEnd
    // User.posts is a list (zero or more Posts per User) → zeroOrMoreStart
    expect(svgContent).toContain('author')
    expect(svgContent).toContain(
        'marker-start="url(#my-svg_er-zeroOrMoreStart)"'
    )
    expect(svgContent).toContain('marker-end="url(#my-svg_er-zeroOrOneEnd)"')
})
