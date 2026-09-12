import { Controller, Get, Inject } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(@Inject(ReportsService) private readonly service: ReportsService) {}

  @Get('metrics')
  getMetrics() {
    return this.service.getReportsMetrics();
  }
}
