import * as child_process from 'node:child_process'
import { test, expect } from 'vitest'

test('ignore-pattern.prisma', async () => {
    const fileName = 'ignorePattern.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync(
        'prisma generate --schema ./prisma/ignore-pattern.prisma'
    )
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`)
    // did it generate a file
    expect(listFile.toString()).toContain(fileName)

    const svgAsString = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString()

    // did it generate a file with filtered models
    expect(svgAsString).toContain('<svg')

    // Include regular models
    expect(svgAsString).toContain('User')
    expect(svgAsString).toContain('Product')
    expect(svgAsString).toContain('email')
    expect(svgAsString).toContain('name')
    expect(svgAsString).toContain('price')

    // Exclude system tables (sys_*)
    expect(svgAsString).not.toContain('sys_logs')
    expect(svgAsString).not.toContain('sys_audit')
    expect(svgAsString).not.toContain('message')
    expect(svgAsString).not.toContain('action')

    // Exclude internal tables (Internal*)
    expect(svgAsString).not.toContain('InternalMigrations')
    expect(svgAsString).not.toContain('InternalCache')
    expect(svgAsString).not.toContain('migration_name')
    expect(svgAsString).not.toContain('checksum')

    // Exclude exact match (Session)
    expect(svgAsString).not.toContain('Session')
    expect(svgAsString).not.toContain('token')
})
