import * as child_process from 'node:child_process'
import fs from 'fs'

test('disabled-config.prisma', async () => {
    const fileName = 'disabled-config.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync(
        `npx cross-env prisma generate --schema ./prisma/disabled-config.prisma`
    )
    const exists = fs.existsSync(`${folderName}/${fileName}`)
    expect(exists).toBe(false)
})
