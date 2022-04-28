import * as child_process from 'child_process';

test('table-only.prisma', async () => {
    const fileName = 'TableOnly.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `npx prisma generate --schema ./prisma/table-only.prisma`
    );
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`);
    // did it generate a file
    expect(listFile.toString()).toContain(fileName);

    const svgAsString = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString();

    // did it generate a file without enum
    expect(svgAsString).toContain(`<svg`);
    expect(svgAsString).toContain(`Status`);
    expect(svgAsString).not.toContain(`PENDING`);
    expect(svgAsString).not.toContain(`CONFIRMED`);
    expect(svgAsString).not.toContain(`CANCELLED`);
});
