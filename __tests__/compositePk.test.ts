import * as child_process from 'child_process';

test('composite-pk.prisma', async () => {
    const fileName = 'CompositePk.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `prisma generate --schema ./prisma/composite-pk.prisma`
    );
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`);
    // did it generate a file
    expect(listFile.toString()).toContain(fileName);

    const svgAsString = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString();

    const pks = svgAsString.match(/🗝️/g);

    // did it generate a file with the correct content
    expect(svgAsString).toContain(`<svg`);
    expect(svgAsString).toContain(`Booking`);
    expect(pks).toHaveLength(2);
});
