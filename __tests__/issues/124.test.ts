import * as child_process from 'child_process';

test('Zero to many relationship', async () => {
    const fileName = '124.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `npx prisma generate --schema ./prisma/issues/124.prisma`
    );
    const svgContent = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString();
    // did the model get added
    expect(svgContent).toContain('Post');
    expect(svgContent).toContain('User');

    // did the relationships get added correctly
    // Past has zero to one user
    // User has zero to many posts
    expect(svgContent).toContain('author');
    expect(svgContent).toContain('marker-start="url(#ZERO_OR_MORE_START)"');
    expect(svgContent).toContain('marker-end="url(#ZERO_OR_ONE_END)"');
});
