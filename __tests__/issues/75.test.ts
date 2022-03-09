import * as child_process from 'child_process';

test('many-to-many.prisma', async () => {
    const fileName = '75.png';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(`npx prisma generate --schema ./prisma/75.prisma`);
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`);
    // did it generate a file
    expect(listFile.toString()).toContain(fileName);
});
