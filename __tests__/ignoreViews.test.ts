import * as child_process from 'child_process';

test('ignore-views.prisma', async () => {
    const fileName = 'ignoreViews.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `prisma generate --schema ./prisma/ignore-views.prisma`
    );
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`);
    // did it generate a file
    expect(listFile.toString()).toContain(fileName);

    const svgAsString = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString();

    // did it generate a file without enum
    expect(svgAsString).toContain(`<svg`);
    // include tables
    expect(svgAsString).toContain(`Booking`);
    expect(svgAsString).toContain(`Event`);
    // include table columns
    expect(svgAsString).toContain(`name`);
    expect(svgAsString).toContain(`startDate`);
    expect(svgAsString).toContain(`status`);
    expect(svgAsString).toContain(`inviteeEmail`);
    expect(svgAsString).toContain(`startDateUTC`);
    expect(svgAsString).toContain(`cancelCode`);
    // include enum names
    expect(svgAsString).toContain(`Status`);
    // include enums
    expect(svgAsString).toContain(`PENDING`);
    expect(svgAsString).toContain(`CONFIRMED`);
    expect(svgAsString).toContain(`CANCELLED`);
    // exclude views
    expect(svgAsString).not.toContain(`Attendance`);
    expect(svgAsString).not.toContain(`email`);
    expect(svgAsString).not.toContain(`eventDate`);
    expect(svgAsString).not.toContain(`bookingStatus`);
});
