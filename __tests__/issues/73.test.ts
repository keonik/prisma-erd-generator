import * as child_process from 'child_process';

test('space removal in mapped field names', async () => {
    const fileName = '73.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `npx prisma generate --schema ./prisma/issues/73.prisma`
    );
    const svgContent = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString();
    // did the model get added
    expect(svgContent).toContain('trips');
    // Are the spaces removed from fields?
    expect(svgContent).not.toContain('birth year');
    expect(svgContent).not.toContain('end station id');
    expect(svgContent).not.toContain('end station location');
    expect(svgContent).not.toContain('start station id');
    expect(svgContent).not.toContain('start station location');
    expect(svgContent).not.toContain('start station name');
    expect(svgContent).not.toContain('start time');
    expect(svgContent).not.toContain('stop time');

    // Did columns with spaces become unspaced?
    expect(svgContent).toContain('birthyear');
    expect(svgContent).toContain('endstationid');
    expect(svgContent).toContain('endstationlocation');
    expect(svgContent).toContain('startstationid');
    expect(svgContent).toContain('startstationlocation');
    expect(svgContent).toContain('startstationname');
    expect(svgContent).toContain('starttime');
    expect(svgContent).toContain('stoptime');
});
