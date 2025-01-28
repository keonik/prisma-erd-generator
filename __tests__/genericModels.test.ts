import * as child_process from 'node:child_process';
import { test, expect } from 'vitest';

test('schema.prisma', async () => {
    child_process.execSync('rm -f ERD.svg')
    child_process.execSync('prisma generate')
    const listFile = child_process.execSync('ls -la ERD.svg')
    // did it generate a file
    expect(listFile.toString()).toContain('ERD.svg')

    const svgAsString = child_process.execSync('cat ERD.svg').toString()
    // did it generate a file with the correct content
    expect(svgAsString).toContain('<svg')
    expect(svgAsString).toContain('DefaultCalendar')
    expect(svgAsString).toContain('users')
    expect(svgAsString).toContain('Session')
    expect(svgAsString).toContain('ConnectedCalendar')
    expect(svgAsString).toContain('DailySchedule')
    expect(svgAsString).toContain('Schedule')
    expect(svgAsString).toContain('Booking')
})
