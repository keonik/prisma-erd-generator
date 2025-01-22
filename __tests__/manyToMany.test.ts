import * as child_process from 'node:child_process'

test('many-to-many.prisma', async () => {
    const fileName = 'ManyToMany.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync(
        'prisma generate --schema ./prisma/many-to-many.prisma'
    )
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`)
    // did it generate a file
    expect(listFile.toString()).toContain(fileName)

    const svgAsString = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString()

    // did it generate a file with the correct content
    expect(svgAsString).toContain('<svg')
    expect(svgAsString).toContain('Booking')
    expect(svgAsString).toContain('Event')
    expect(svgAsString).toContain(`marker-start="url(#ZERO_OR_MORE_START)"`)
    expect(svgAsString).toContain(`marker-end="url(#ZERO_OR_MORE_END)"`)
})
