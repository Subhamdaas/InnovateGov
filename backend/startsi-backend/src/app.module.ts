import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChallengesModule } from './challenges/challenges.module';
import { StartupsModule } from './startups/startups.module';
import { ApplicationsModule } from './applications/applications.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { PilotsModule } from './pilots/pilots.module';
import { AiModule } from './ai/ai.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UploadsModule } from './uploads/uploads.module';
import { DepartmentsModule } from './departments/departments.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ChallengesModule,
    StartupsModule,
    ApplicationsModule,
    EvaluationsModule,
    PilotsModule,
    AiModule,
    DashboardModule,
    UploadsModule,
    DepartmentsModule,
    ReportsModule,
  ],
})
export class AppModule {}
