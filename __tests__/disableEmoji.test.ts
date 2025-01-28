import * as child_process from 'node:child_process';
import { test, expect } from 'vitest';

test('disableEmoji.prisma', async () => {
    const fileName = 'disableEmoji.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync(
        'prisma generate --schema ./prisma/disableEmoji.prisma'
    )
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`)
    // did it generate a file
    expect(listFile.toString()).toContain(fileName)

    const svgAsString = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString()

    // did it generate a file with the correct content
    expect(svgAsString).toContain('<svg')
    expect(svgAsString).not.toContain('❓')
    expect(svgAsString).not.toContain('🗝️')
    expect(svgAsString).toContain('nullable')
    expect(svgAsString).toContain('PK')
    expect(svgAsString).toContain('inviteeEmail')
    expect(svgAsString).toContain('cancelCode')
    expect(svgAsString).toContain('name')
})
