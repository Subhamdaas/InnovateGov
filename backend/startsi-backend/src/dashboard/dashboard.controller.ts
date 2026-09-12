import { Controller, Get } from '@nestjs/common'; import { ChallengesService } from '../challenges/challenges.service';
@Controller('dashboard') export class DashboardController { constructor(private s:ChallengesService){} @Get('summary') summary(){return this.s.dashboardSummary();} }
