import * as child_process from 'child_process';

test('space removal in mapped field names', async () => {
    const fileName = '114.svg';
    const folderName = '__tests__';
    child_process.execSync(`rm -f ${folderName}/${fileName}`);
    child_process.execSync(
        `prisma generate --schema ./prisma/issues/114.prisma`
    );
    const svgContent = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString();
    // did the model get added
    expect(svgContent).toContain('orders');
    expect(svgContent).toContain('customers');
    expect(svgContent).toContain('employees');
    expect(svgContent).toContain('stores');
    // did the field mapped names get added
    expect(svgContent).toContain('customer_id');
    expect(svgContent).toContain('store_id');
    expect(svgContent).toContain('employee_id');
    expect(svgContent).toContain('order_id');
});
