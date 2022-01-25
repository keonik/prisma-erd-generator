import * as child_process from 'child_process';

test('enums.prisma', async () => {
    const fileName = 'Enums.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `npx prisma generate --schema ./prisma/enums.prisma`
    );
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`);
    // did it generate a file
    expect(listFile.toString()).toContain(fileName);

    const svgAsString = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString();

    // did it generate a file with the correct content
    expect(svgAsString).toContain(`<svg`);
    expect(svgAsString).toContain(`Status`);
    expect(svgAsString).toContain(`PENDING`);
    expect(svgAsString).toContain(`CONFIRMED`);
    expect(svgAsString).toContain(`CANCELLED`);
});
