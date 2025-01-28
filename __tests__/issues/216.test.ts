import * as child_process from 'node:child_process';
import { test, expect } from 'vitest';

test('many-to-many.prisma', async () => {
    const fileName = '216.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync(
        `prisma generate --schema ./prisma/issues/216.prisma`
    )
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`)
    // did it generate a file
    expect(listFile.toString()).toContain(fileName)
})
