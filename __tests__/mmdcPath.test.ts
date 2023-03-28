import * as child_process from 'child_process';

test('setting mmdcPath works', async () => {
    const fileName = 'mmdcPath.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(`prisma generate --schema ./prisma/mmdcPath.prisma`);
    const svgContent = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString();
    // did the model get added
    expect(svgContent).toContain('users');

    // User has id
    expect(svgContent).toMatch(
        /id="text-entity-users([^\><]*)-attr-1-name"([^<\>]*)\>id<\/text\>/
    );
});
