import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { AnalysisService } from '../analysis/analysis.service';

@Injectable()
export class UploadService {
  constructor(private analysisService: AnalysisService) {}

  async parseExcel(filePath: string) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    fs.unlinkSync(filePath);
    return this.analysisService.process(data);
  }

  async parseCSV(filePath: string) {
    const results: any[] = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', row => results.push(row))
        .on('end', () => {
          fs.unlinkSync(filePath);
          resolve(this.analysisService.process(results));
        })
        .on('error', reject);
    });
  }
  // src/upload/upload.service.ts

async parseExcelRaw(filePath: string): Promise<any[]> {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  fs.unlinkSync(filePath);
  return data;
}

async parseCsvRaw(filePath: string): Promise<any[]> {
  const results: any[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', row => results.push(row))
      .on('end', () => {
        fs.unlinkSync(filePath);
        resolve(results);
      })
      .on('error', reject);
  });
}

}
