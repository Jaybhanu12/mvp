// src/analysis/analysis.module.ts
import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { CleaningService } from '../cleaning/cleaning.service';
import { InsightService } from '../insight/insight.service';
import { UploadService } from 'src/upload/upload.service';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { PdfService } from 'src/dashboard/pdf.service';
import { AnalysisController } from './analysis.controller';

@Module({
    providers: [AnalysisService, CleaningService, InsightService, UploadService, DashboardService, PdfService],
    controllers: [AnalysisController],
    // exports: [AnalysisService], // 👈 export this
})
export class AnalysisModule { }
