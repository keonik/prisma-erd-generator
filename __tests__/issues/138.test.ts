import * as child_process from 'node:child_process'
import { test, expect } from 'vitest'

test('id not override before key name', async () => {
    const fileName = '138.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync(
        'prisma generate --schema ./prisma/issues/138.prisma'
    )
    const svgContent = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString()
    // did the model get added
    expect(svgContent).toContain('User')
    expect(svgContent).toContain('UserSetting')

    // User has id
    expect(svgContent).toMatch(/<p\>id\<\/\p>/)

    // UserSetting has id and userId

    expect(svgContent).toMatch(/<p\>user_id\<\/\p>/)
    // UserSetting has a relation to User
    expect(svgContent).toMatch(/<p\>user\<\/\p>/)
    // expect(svgContent).toContain('>user</text>');
})
