import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { CleaningService } from './cleaning/cleaning.service';
import { InsightService } from './insight/insight.service';
import { AnalysisService } from './analysis/analysis.service';
import { DashboardService } from './dashboard/dashboard.service';
import { AnalysisModule } from './analysis/analysis.module';

@Module({
  imports: [AnalysisModule],
  controllers: [AppController],
  providers: [AppService, CleaningService, InsightService, AnalysisService, DashboardService],
})
export class AppModule {}
