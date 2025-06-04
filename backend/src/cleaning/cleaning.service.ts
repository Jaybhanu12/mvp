
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';


@Injectable()
export class CleaningService {
  isEmpty(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  isValidNumber(value: any): boolean {
    return typeof value === 'number' || !isNaN(Number(value));
  }

  isValidDate(value: any): boolean {
    return moment(value, [moment.ISO_8601, 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'], true).isValid();
  }

  normalizeDate(value: any): string {
    const date = moment(value, [moment.ISO_8601, 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'], true);
    return date.isValid() ? date.format('YYYY-MM-DD') : value;
  }

  cleanAll(data: any[]): any[] {
    const seen = new Set();

    return data.filter(row => {
      // Check for empty cells
      for (const key in row) {
        if (this.isEmpty(row[key])) return false;
      }

      // Validate and normalize types
      for (const key in row) {
        const val = row[key];
        if (key.toLowerCase().includes('date')) {
          if (!this.isValidDate(val)) return false;
          row[key] = this.normalizeDate(val);
        } else if (this.isValidNumber(val)) {
          row[key] = Number(val);
        } else if (!isNaN(Number(val))) {
          row[key] = Number(val);
        } else if (typeof val === 'string') {
          row[key] = val.trim();
        }
      }

      // Remove duplicates by JSON string match
      const rowKey = JSON.stringify(row);
      if (seen.has(rowKey)) return false;
      seen.add(rowKey);

      return true;
    });
  }
}
