import * as child_process from 'child_process';

test('id not override before key name', async () => {
    const fileName = '138.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `prisma generate --schema ./prisma/issues/138.prisma`
    );
    const svgContent = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString();
    // did the model get added
    expect(svgContent).toContain('User');
    expect(svgContent).toContain('UserSetting');

    // User has id
    expect(svgContent).toContain(
        'id="entity-User-attr-1-name" class="er entityLabel">id</text>'
    );
    // UserSetting has id and userId
    expect(svgContent).toContain(
        'id="entity-UserSetting-attr-1-name" class="er entityLabel">id'
    );
    expect(svgContent).toContain(
        'id="entity-UserSetting-attr-2-name" class="er entityLabel">user_id'
    );
    // // UserSetting has a relation to User
    expect(svgContent).toContain('id="rel1" class="er relationshipLabel">user');
});
