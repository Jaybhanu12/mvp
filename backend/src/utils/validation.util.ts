import moment from 'moment';
import * as ExcelJS from 'exceljs';
export function validateRow(row: any, expectedTypes: Record<string, 'number' | 'string' | 'date'>): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const key of Object.keys(expectedTypes)) {
    const value = row[key];
    const expected = expectedTypes[key];

    if (value === null || value === undefined || value === '') {
      errors[key] = 'empty';
    } else if (expected === 'number' && typeof value !== 'number') {
      errors[key] = 'type';
    } else if (expected === 'date' && !isValidDate(value)) {
      errors[key] = 'date';
    }
  }

  return errors;
}

function isValidDate(value: any): boolean {
  return moment(value, [moment.ISO_8601, 'YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], true).isValid();
}


export async function createExcelWithHighlight(data: any[], highlightMap: Record<string, string>) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Results');

  // Add header row
  const headers = Object.keys(data[0] || {});
  worksheet.addRow(headers);

  // Add data rows
  data.forEach((row) => {
    worksheet.addRow(headers.map(h => row[h]));
  });

  // Apply highlights
  for (const key in highlightMap) {
    const [rowIndexStr, header] = key.split('-');
    const rowIndex = parseInt(rowIndexStr, 10) + 2; // +2 because Excel rows start at 1 and first row is header
    const colIndex = headers.indexOf(header) + 1; // Excel columns start at 1

    if (rowIndex && colIndex) {
      const cell = worksheet.getRow(rowIndex).getCell(colIndex);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' }, // Yellow with full opacity (ARGB)
      };
    }
  }

  // Save to file
  const filePath = `./outputs/${Date.now()}.xlsx`;
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}