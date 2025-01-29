import * as child_process from 'node:child_process';
import { test, expect } from 'vitest';

test('include-relation-from-fields.prisma', async () => {
    const fileName = 'includeRelationFromFields.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync(
        'prisma generate --schema ./prisma/include-relation-from-fields.prisma'
    )
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`)
    // did it generate a file
    expect(listFile.toString()).toContain(fileName)

    const svgAsString = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString()

    // did it generate a file with the correct content
    expect(svgAsString).toContain('<svg')
    expect(svgAsString).toContain('User')
    expect(svgAsString).toContain('Product')
    expect(svgAsString).toContain('FavoriteProducts')
    expect(svgAsString).toContain('userId')
    expect(svgAsString).toContain('productId')
})
