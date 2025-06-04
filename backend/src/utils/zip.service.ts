import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as archiver from 'archiver';
import * as path from 'path';

@Injectable()
export class ZipService {
  async zipFiles(filePaths: string[], zipName: string): Promise<string> {
    const zipPath = path.join(__dirname, '../../outputs', `${zipName}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      archive.pipe(output);

      filePaths.forEach(file => {
        const name = path.basename(file);
        archive.file(file, { name });
      });

      archive.finalize();

      output.on('close', () => resolve(zipPath));
      archive.on('error', err => reject(err));
    });
  }
}
