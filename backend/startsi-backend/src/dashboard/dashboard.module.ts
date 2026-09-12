import { Module } from '@nestjs/common'; import { DashboardController } from './dashboard.controller'; import { ChallengesModule } from '../challenges/challenges.module';
@Module({imports:[ChallengesModule],controllers:[DashboardController]}) export class DashboardModule {}
