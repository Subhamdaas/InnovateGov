import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // MODEL 1: Match problem statement against database startups
  @Post('match-problem')
  async matchProblem(
    @Body() body: { problemStatement: string; topK?: number }
  ) {
    const topK = body.topK ? Number(body.topK) : 5;
    return this.aiService.matchProblem(body.problemStatement || '', topK);
  }

  // MODEL 1: Get or generate recommendations for a challenge
  @Get('recommendations/:challengeId')
  async recommend(@Param('challengeId') challengeId: string) {
    return this.aiService.recommend(challengeId);
  }

  // MODEL 2: Hybrid Expert Rubric & Objective Readiness Audit
  @Post('audit-evaluation')
  async auditEvaluation(
    @Body()
    body: {
      startupId?: string;
      startupName?: string;
      rubricScores: Record<string, number>;
      startupData?: any;
    }
  ) {
    return this.aiService.auditEvaluation(body);
  }

  // MODEL 3: Pilot KPI Result Evaluation
  @Post('evaluate-pilot')
  async evaluatePilot(
    @Body()
    body: {
      target_leakage_reduction?: number;
      actual_leakage_reduction?: number;
      target_cost_reduction?: number;
      actual_cost_reduction?: number;
      target_performance?: number;
      actual_performance?: number;
    }
  ) {
    return this.aiService.evaluatePilotResults(body);
  }

  // MODEL 3: Live Pilot Recommendation
  @Get('pilot/:pilotId/recommendation')
  async pilotRecommendation(@Param('pilotId') pilotId: string) {
    return this.aiService.pilotRecommendation(pilotId);
  }
}
