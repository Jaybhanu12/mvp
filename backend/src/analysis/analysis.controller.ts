import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx-style';


import { UploadService } from '../upload/upload.service';
import { CleaningService } from '../cleaning/cleaning.service';
import { InsightService } from '../insight/insight.service';
import { AnalysisService } from '../analysis/analysis.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { PdfService } from '../dashboard/pdf.service';
import * as ExcelJS from 'exceljs';
import { createExcelWithHighlight } from 'src/utils/validation.util';


@Controller('analyze')
export class AnalysisController {
    constructor(
        private uploadService: UploadService,
        private cleaningService: CleaningService,
        private insightService: InsightService,
        private analysisService: AnalysisService,
        private dashboardService: DashboardService,
        private pdfService: PdfService,
    ) { }



    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: multer.diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname);
                cb(null, `${Date.now()}${ext}`);
            },
        }),
    }))
    async handleUpload(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: {
            options: string[]; // ['cleaning', 'summary', 'anomaly', 'trend']
            outputFormat: 'json' | 'excel' | 'csv' | 'pdf' | 'dashboard';
        },
    ) {
        const ext = path.extname(file.originalname).toLowerCase();
        const filePath = path.join('./uploads', file.filename);

        // Parse uploaded file to JSON array
        let data: any[];
        if (ext === '.xlsx') {
            data = await this.uploadService.parseExcelRaw(filePath);
        } else if (ext === '.csv') {
            data = await this.uploadService.parseCsvRaw(filePath);
        } else {
            throw new Error('Unsupported file type');
        }

        let processed = data;
        let highlightMap: Record<string, string> = {};

        // Cleaning option: remove rows with empty cells or wrong data types, normalize dates, remove duplicates
        if (body.options.includes('cleaning')) {
            processed = this.cleaningService.cleanAll(processed);
        }

        // If anomaly option selected, get anomalies and highlight map 
        if (body.options.includes('anomaly')) {
            const anomalyResult = this.insightService.findAnomalies(processed);
            processed = anomalyResult.highlighted; // typically same as input, but use safe
            highlightMap = anomalyResult.highlightMap;
        }

        // Get insights summary and trends if requested
        const insights = {
            summary: body.options.includes('summary') ? this.insightService.summarize(processed) : undefined,
            anomalies: body.options.includes('anomaly') ? highlightMap : undefined,
            trends: body.options.includes('trend') ? this.insightService.detectTrends(processed) : undefined,
        };

        const filename = `${Date.now()}`;


        switch (body.outputFormat) {
            case 'excel': {
                const highlightMap = body.options.includes('anomaly')
                    ? this.insightService.findAnomalies(processed).highlightMap
                    : {};

                const excelPath = await createExcelWithHighlight(processed, highlightMap);
                return { download: excelPath,insights };
            }
            case 'csv': {
                const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(processed));
                const csvPath = `./outputs/${filename}.csv`;
                fs.writeFileSync(csvPath, csv);
                return { download: csvPath };
            }
            case 'pdf': { 
                const htmlForPdf = this.dashboardService.generateHTML(processed, insights.trends || []);
                const pdfPath = await this.pdfService.generatePdfFromHtml(htmlForPdf, filename);
                return { download: pdfPath };
            }
            case 'dashboard': {
                const htmlPath = this.dashboardService.saveDashboard(
                    this.dashboardService.generateHTML(processed, insights.trends || []),
                    filename,
                );
                return { dashboard: htmlPath };
            }
            default:
                // Default: JSON response with cleaned data and insights
                return { cleaned: processed, insights };
        }
    }
}
