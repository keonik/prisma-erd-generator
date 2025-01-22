import * as child_process from 'node:child_process'

test('many-to-many.prisma', async () => {
    const fileName = '66.png'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync(`prisma generate --schema ./prisma/issues/66.prisma`)
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`)
    // did it generate a file
    expect(listFile.toString()).toContain(fileName)
})
