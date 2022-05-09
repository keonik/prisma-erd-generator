import * as child_process from 'child_process';

test('simple-1-n.prisma', async () => {
    const fileName = 'simple-1-n.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `npx prisma generate --schema ./prisma/simple-1-n.prisma`
    );
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`);
    // did it generate a file
    expect(listFile.toString()).toContain(fileName);

    const svgAsString = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString();

    // did it generate a file with the correct content
    expect(svgAsString).toContain(`<svg`);
    expect(svgAsString).toContain(`Product`);
    expect(svgAsString).toContain(`Foo`);
    expect(svgAsString).toContain(`marker-start="url(#ZERO_OR_MORE_START)"`);
    expect(svgAsString).toContain(`marker-end="url(#ONLY_ONE_END)"`);
});
