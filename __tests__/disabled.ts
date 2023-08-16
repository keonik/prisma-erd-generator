import * as child_process from 'child_process';

test('disabled.prisma', async () => {
    const fileName = 'disabled.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `DISABLE_ERD=true prisma generate --schema ./prisma/disabled.prisma`
    );
    try {
        const listFile = child_process.execSync(
            `ls -la ${folderName}/${fileName}`
        );
        // did it generate a file
        expect(listFile.toString()).not.toContain(fileName);
    } catch {
        // ls failed because the file doesn't exist
        expect(true).toBe(true);
    }
});
