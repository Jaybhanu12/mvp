// src/analysis/analysis.service.ts
import { Injectable } from '@nestjs/common';
import { CleaningService } from '../cleaning/cleaning.service';
import { InsightService } from '../insight/insight.service';

@Injectable()
export class AnalysisService {
  constructor(
    private cleaningService: CleaningService,
    private insightService: InsightService,
  ) {}

  process(data: any[]) {
    const cleaned = this.cleaningService.cleanAll(data);
    // const insights = this.insightService.(cleaned);
    // return { cleaned, insights };
  }
}
