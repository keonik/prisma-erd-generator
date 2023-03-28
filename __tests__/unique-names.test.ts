import * as child_process from 'child_process';

test('Support unique names. Starting issue https://github.com/keonik/prisma-erd-generator/issues/127', async () => {
    const fileName = 'unique-names.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `prisma generate --schema ./prisma/unique-names.prisma`
    );
    const svgContent = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString();
    // did the model get added
    expect(svgContent).toContain('[Production$My Table]');

    // User has id
    expect(svgContent).toMatch(
        /id="text-entity-ProductionMyTable([^\><]*)-attr-1-name"([^<\>]*)\>id<\/text\>/
    );
});
