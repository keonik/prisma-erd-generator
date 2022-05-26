import * as child_process from 'child_process';

test('nullables.prisma', async () => {
    const fileName = 'nullables.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `npx prisma generate --schema ./prisma/nullables.prisma`
    );
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`);
    // did it generate a file
    expect(listFile.toString()).toContain(fileName);

    const svgAsString = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString();

    // did it generate a file with the correct content
    expect(svgAsString).toContain(`<svg`);
    expect(svgAsString).toContain(`nullable`);
    expect(svgAsString).toContain(`inviteeEmail`);
    expect(svgAsString).toContain(`cancelCode`);
    expect(svgAsString).toContain(`name`);
});
