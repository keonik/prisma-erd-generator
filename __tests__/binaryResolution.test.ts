import fs from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { binaryCandidates, resolveBinary } from '../src/generate'

const tmpDir = path.join(__dirname, 'tmp-binary-resolution')

const isWindows = process.platform === 'win32'

describe('mermaid CLI binary resolution', () => {
    beforeAll(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
        fs.mkdirSync(tmpDir, { recursive: true })
    })

    afterAll(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it('probes shim extensions only on windows', () => {
        const candidates = binaryCandidates('/somewhere/mmdc')

        if (isWindows) {
            // bun writes only `mmdc.exe`; npm and pnpm write `mmdc` + `mmdc.cmd`
            expect(candidates).toEqual([
                '/somewhere/mmdc',
                '/somewhere/mmdc.cmd',
                '/somewhere/mmdc.exe',
                '/somewhere/mmdc.ps1',
            ])
        } else {
            expect(candidates).toEqual(['/somewhere/mmdc'])
        }
    })

    it('finds an extensionless binary on any platform', () => {
        const bare = path.join(tmpDir, 'bare')
        fs.writeFileSync(bare, '')

        expect(resolveBinary(bare)).toBe(bare)
    })

    it('returns undefined when nothing matches', () => {
        expect(resolveBinary(path.join(tmpDir, 'absent'))).toBeUndefined()
    })

    it.skipIf(!isWindows)(
        'finds a .cmd shim when the extensionless file is absent',
        () => {
            const shimBase = path.join(tmpDir, 'cmdonly')
            fs.writeFileSync(`${shimBase}.cmd`, '')

            // this is the bun-on-Windows layout that used to report
            // "could not find the mermaid CLI (mmdc)" despite a working install
            expect(resolveBinary(shimBase)).toBe(`${shimBase}.cmd`)
        }
    )
})
