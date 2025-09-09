import * as child_process from 'node:child_process'
import { test, expect } from 'vitest'

test('simple-1-n.prisma', async () => {
    const fileName = 'simple-1-n.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync(
        'prisma generate --schema ./prisma/simple-1-n.prisma'
    )
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`)
    // did it generate a file
    expect(listFile.toString()).toContain(fileName)

    const svgAsString = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString()

    // did it generate a file with the correct content
    expect(svgAsString).toContain('<svg')
    expect(svgAsString).toContain('Product')
    expect(svgAsString).toContain('Foo')
    expect(svgAsString).toContain(
        `marker-start="url(#my-svg_er-zeroOrOneStart)"`
    )
    expect(svgAsString).toContain(`marker-end="url(#my-svg_er-onlyOneEnd)"`)
})
