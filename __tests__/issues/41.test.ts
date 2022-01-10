import * as child_process from 'child_process';

test('Skip Generating', async () => {
    const fileName = 'SKIP.png';
    const folderName = '__tests__';
    child_process.execSync(
        `SKIP_ERD=true npx prisma generate --schema ./prisma/41.prisma`
    );
    const listFile = child_process.execSync(`ls -la ${folderName}`);
    // did it generate a file
    expect(listFile.toString()).not.toContain(fileName);
});
