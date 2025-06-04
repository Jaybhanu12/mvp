import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class InsightService {
  // === UTILITIES SIMILAR TO CLEANING ===
  isEmpty(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  isValidNumber(value: any): boolean {
    return typeof value === 'number' || (!isNaN(Number(value)) && value !== '');
  }

  isValidDate(value: any): boolean {
    return moment(value, [moment.ISO_8601, 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'], true).isValid();
  }

  normalizeDate(value: any): string {
    const date = moment(value, [moment.ISO_8601, 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'], true);
    return date.isValid() ? date.format('YYYY-MM-DD') : value;
  }

findAnomalies(data: any[]): { highlighted: any[], highlightMap: Record<string, string> } {
  const highlightMap: Record<string, string> = {};
  const seen = new Set<string>();
  const headers = Object.keys(data[0] || {});

  // Step 1: Infer column types using up to 5 non-empty valid rows
  const columnTypes: Record<string, 'number' | 'date' | 'string'> = {};

  for (const header of headers) {
    const columnValues = data
      .map(row => row[header])
      .filter(val => val !== undefined && val !== null && val !== '')
      .slice(0, 2); // Check more than 2 values

    const numericCount = columnValues.filter(val => !isNaN(Number(val))).length;
    const dateCount = columnValues.filter(val => this.isValidDate(val)).length;

    if (numericCount >= columnValues.length * 0.8) {
      columnTypes[header] = 'number';
    } else if (dateCount >= columnValues.length * 0.8) {
      columnTypes[header] = 'date';
    } else {
      columnTypes[header] = 'string';
    }
  }
  // Step 2: Validate rows
  const anomalies = data.map((row, rowIndex) => {
    const rowKey = JSON.stringify(row);
    const isDuplicate = seen.has(rowKey);

    if (isDuplicate) {
      headers.forEach(header => {
        highlightMap[`${rowIndex}-${header}`] = 'yellow';
      });
    } else {
      seen.add(rowKey);
    }

    for (const header of headers) {
      const value = row[header];
      const expectedType = columnTypes[header];

      if (value === undefined || value === null || value === '') {
        highlightMap[`${rowIndex}-${header}`] = 'yellow'; // Empty cell
      } else if (expectedType === 'number' && isNaN(Number(value))) {
        highlightMap[`${rowIndex}-${header}`] = 'yellow'; // Invalid number
      } else if (expectedType === 'date' && !this.isValidDate(value)) {
        highlightMap[`${rowIndex}-${header}`] = 'yellow'; // Invalid date
      }
    }

    return row;
  });

  return { highlighted: anomalies, highlightMap };
}



  // === TRENDS & SUMMARY ===
  summarize(data: any[]) {
    const summary: any = {};
    if (!data.length) return summary;
    const keys = Object.keys(data[0]);

    for (const key of keys) {
      const numericValues = data.map(row => row[key]).filter(val => typeof val === 'number');
      if (numericValues.length) {
        summary[key] = {
          average: this.avg(numericValues),
          sum: this.sum(numericValues),
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
        };
      }
    }
    return summary;
  }

  detectTrends(data: any[]): any[] {
    const trends: any[] = [];
    if (!data.length) return trends;

    const keys = Object.keys(data[0]);
    const dateFields = keys.filter(key => this.detectColumnType(data, key) === 'date');

    for (const key of keys) {
      if (typeof data[0][key] !== 'number') continue;
      const values = data.map(r => r[key]);
      const diff = values[values.length - 1] - values[0];
      let trend = 'fluctuating';
      if (diff > 0) trend = 'increasing';
      else if (diff < 0) trend = 'decreasing';

      trends.push({ field: key, trend, basedOn: dateFields[0] || 'row order' });
    }

    return trends;
  }

  detectColumnType(data: any[], field: string): 'number' | 'string' | 'date' {
    const samples = data.map(r => r[field]).filter(Boolean).slice(0, 5);
    if (samples.every(v => typeof v === 'number')) return 'number';
    if (samples.every(v => this.isValidDate(v))) return 'date';
    return 'string';
  }

  avg(arr: number[]): number {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  sum(arr: number[]): number {
    return arr.reduce((sum, val) => sum + val, 0);
  }
}
