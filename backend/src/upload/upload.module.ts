// src/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { AnalysisModule } from '../analysis/analysis.module';
// import { ParserModule } from '../parser/parser.module';

@Module({
  imports: [
    // MulterModule.register({ dest: './uploads' }),
    AnalysisModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
