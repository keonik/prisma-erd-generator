import * as child_process from 'child_process';
import fs from 'fs';

test('disabled-env.prisma', async () => {
    const fileName = 'disabled.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `npx cross-env DISABLE_ERD=true prisma generate --schema ./prisma/disabled-env.prisma`
    );
    const exists = fs.existsSync(`${folderName}/${fileName}`);
    expect(exists).toBe(false);
});
