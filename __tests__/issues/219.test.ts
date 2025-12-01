import * as child_process from 'node:child_process'
import { test, expect } from 'vitest'

test('issue 219: unnecessary many-to-many relation lines', async () => {
    const fileName = '219.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync(
        'prisma generate --schema ./prisma/issues/219.prisma'
    )
    const svgContent = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString()

    // Verify both models are present
    expect(svgContent).toContain('Schedule')
    expect(svgContent).toContain('DailySchedule')

    // The key issue: we should NOT have a many-to-many relationship line (o{--}o)
    // between Schedule and DailySchedule. This is a one-to-many relationship.
    
    // For a one-to-many relationship like DailySchedule }o--|| Schedule:
    // - DailySchedule side: zeroOrMoreStart (}o) - many DailySchedules per Schedule
    // - Schedule side: onlyOneEnd (||) - one Schedule per DailySchedule
    
    // Check that we have the correct one-to-many markers (count usages, not definitions)
    // marker-start="url(#...)" indicates actual usage
    const zeroOrMoreStartUsages = (svgContent.match(/marker-start="url\(#[^"]*zeroOrMoreStart[^"]*\)"/g) || []).length
    const onlyOneEndUsages = (svgContent.match(/marker-end="url\(#[^"]*onlyOneEnd[^"]*\)"/g) || []).length
    
    // We should have exactly one one-to-many relationship
    expect(zeroOrMoreStartUsages).toBe(1) // One }o marker on DailySchedule side
    expect(onlyOneEndUsages).toBe(1) // One || marker on Schedule side
    
    // Count the number of relationship paths in the SVG
    // There should be exactly ONE relationship line, not two
    const relationshipPaths = (svgContent.match(/class="[^"]*relationshipLine[^"]*"/g) || []).length
    expect(relationshipPaths).toBe(1)
})
