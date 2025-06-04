import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import * as multer from 'multer';
import * as XLSX from 'xlsx';
import * as csvParser from 'csv-parser';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, './uploads');
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}${ext}`;
        cb(null, filename);
      },
    }),
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Parse file based on its type (Excel or CSV)
    const filePath = path.join(__dirname, '../uploads', file.filename);
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (fileExt === '.xlsx') {
      return this.uploadService.parseExcel(filePath);
    } else if (fileExt === '.csv') {
      return this.uploadService.parseCSV(filePath);
    } else {
      throw new Error('Invalid file type. Only Excel and CSV are allowed.');
    }
  }
}
