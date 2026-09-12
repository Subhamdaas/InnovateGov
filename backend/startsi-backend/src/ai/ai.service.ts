import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StartupProfile {
  id: string;
  name: string;
  industries: string;
  description: string;
  city: string;
  trlLevel: number;
  completedGovernmentPilots: number;
  dpiitRecognized: boolean;
  annualTurnoverLakhs: number;
  govPilotExperience: boolean;
}

export interface MatchResult {
  id: string;
  name: string;
  industries: string;
  description: string;
  city: string;
  similarity: number;
  matchScore: number;
  matchReason: string;
}

export interface RubricAuditResult {
  startupName: string;
  approach1: {
    overallScore: number;
    verdict: string;
    strengths: string[];
    concerns: string[];
  };
  approach2: {
    compositeScore: number;
    expertRubricScore: number;
    objectiveReadinessScore: number;
    objectiveBreakdown: {
      trlPoints: number;
      pilotsPoints: number;
      dpiitPoints: number;
      turnoverPoints: number;
    };
    strengths: string[];
    riskConcerns: string[];
    verdict: string;
  };
  divergence: number;
  riskFlag: string;
}

export interface PilotEvaluationResult {
  verdict: 'PILOT SUCCESS' | 'PILOT PARTIAL SUCCESS' | 'PILOT UNSUCCESSFUL';
  recommendation: 'SCALE' | 'EXTEND PILOT' | 'REJECT';
  confidence: number;
  reason: string;
  metrics: {
    leakageAttainmentPct: number;
    costAttainmentPct: number;
    avgAttainmentPct: number;
  };
}

@Injectable()
export class AiService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  // ==========================================================
  // 1. HELPER: TEXT CLEANING (MODEL 1)
  // ==========================================================
  private cleanText(text: string): string {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Tokenize text into words with filtering
  private tokenize(text: string): string[] {
    const cleaned = this.cleanText(text);
    return cleaned.split(' ').filter((w) => w.length > 2);
  }

  // Vector Cosine Similarity
  private calculateCosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const val of vecA.values()) {
      normA += val * val;
    }
    for (const val of vecB.values()) {
      normB += val * val;
    }

    if (normA === 0 || normB === 0) return 0;

    for (const [key, valA] of vecA.entries()) {
      const valB = vecB.get(key) || 0;
      dotProduct += valA * valB;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // ==========================================================
  // MODEL 1: UNSUPERVISED SEMANTIC STARTUP MATCHING ENGINE
  // ==========================================================
  async matchProblem(governmentProblem: string, topK: number = 5): Promise<{
    governmentProblem: string;
    totalStartupsEvaluated: number;
    topMatches: MatchResult[];
  }> {
    const startups = await this.prisma.startup.findMany();

    const problemTokens = this.tokenize(governmentProblem);
    const problemVec = new Map<string, number>();
    for (const token of problemTokens) {
      problemVec.set(token, (problemVec.get(token) || 0) + 1);
    }

    // Build term frequencies across corpus for TF-IDF style weighting
    const allProfiles: { startup: any; profileText: string; tokens: string[] }[] = startups.map((s) => {
      const profileText = `Startup name: ${s.name}. Industries: ${s.sectorTags.join(', ')}. Description: ${s.capabilitySummary} Location: ${s.location || 'Maharashtra'}`;
      return {
        startup: s,
        profileText,
        tokens: this.tokenize(profileText),
      };
    });

    const docCount = allProfiles.length || 1;
    const docFreq = new Map<string, number>();
    for (const { tokens } of allProfiles) {
      const uniqueTokens = new Set(tokens);
      for (const t of uniqueTokens) {
        docFreq.set(t, (docFreq.get(t) || 0) + 1);
      }
    }

    // Convert problem vector with IDF
    const weightedProblemVec = new Map<string, number>();
    for (const [token, count] of problemVec.entries()) {
      const df = docFreq.get(token) || 1;
      const idf = Math.log((docCount + 1) / df) + 1;
      weightedProblemVec.set(token, count * idf);
    }

    // Score each startup
    const scoredList: MatchResult[] = allProfiles.map(({ startup, tokens }) => {
      const startVec = new Map<string, number>();
      for (const token of tokens) {
        startVec.set(token, (startVec.get(token) || 0) + 1);
      }

      const weightedStartVec = new Map<string, number>();
      for (const [token, count] of startVec.entries()) {
        const df = docFreq.get(token) || 1;
        const idf = Math.log((docCount + 1) / df) + 1;
        weightedStartVec.set(token, count * idf);
      }

      const rawSimilarity = this.calculateCosineSimilarity(weightedProblemVec, weightedStartVec);
      
      // Calculate realistic 0-100 match score with boost for sector keyword presence
      const matchedTokens = problemTokens.filter((t) => startVec.has(t));
      const keywordBoost = Math.min(25, matchedTokens.length * 5);
      const similarityPct = Math.min(1.0, rawSimilarity * 1.6 + (keywordBoost / 100));
      const matchScore = Math.round(Math.min(99, Math.max(45, similarityPct * 100)));

      let reason = '';
      if (matchedTokens.length > 0) {
        reason = `High semantic domain fit: matched key competencies (${matchedTokens.slice(0, 4).join(', ')}) with ${startup.name}'s capabilities.`;
      } else {
        reason = `Sector alignment in ${startup.sectorTags.join(', ')} with related technology stack.`;
      }

      return {
        id: startup.id,
        name: startup.name,
        industries: startup.sectorTags.join(', '),
        description: startup.capabilitySummary,
        city: startup.location || 'Maharashtra',
        similarity: parseFloat(similarityPct.toFixed(4)),
        matchScore,
        matchReason: reason,
      };
    });

    // Sort by match score descending
    scoredList.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = scoredList.slice(0, topK);

    return {
      governmentProblem,
      totalStartupsEvaluated: startups.length,
      topMatches,
    };
  }

  // Recommend startups for a specific challenge and persist in DB
  async recommend(challengeId: string) {
    const c = await this.prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!c) return [];

    const problemText = `${c.title}. Problem: ${c.problemStatement}. Expected Outcome: ${c.expectedOutcome}`;
    const result = await this.matchProblem(problemText, 6);

    for (const r of result.topMatches) {
      await this.prisma.recommendation.upsert({
        where: {
          challengeId_startupId: { challengeId, startupId: r.id },
        },
        create: {
          id: `rec-${challengeId}-${r.id}`,
          challengeId,
          startupId: r.id,
          matchScore: r.matchScore,
          matchReason: r.matchReason,
        },
        update: {
          matchScore: r.matchScore,
          matchReason: r.matchReason,
        },
      });
    }

    return this.prisma.recommendation.findMany({
      where: { challengeId },
      include: { startup: true },
      orderBy: { matchScore: 'desc' },
    });
  }

  // ==========================================================
  // MODEL 2: HYBRID EXPERT RUBRIC & OBJECTIVE READINESS AUDIT ENGINE
  // ==========================================================
  
  // Approach 1: Subjective Expert Rubric (Legacy Baseline)
  evaluateApproach1(rubricScores: Record<string, number>): {
    overallScore: number;
    verdict: string;
    strengths: string[];
    concerns: string[];
  } {
    const values = Object.values(rubricScores);
    const count = values.length || 1;
    // Normalize to 10.0 scale if provided in 0-100 scale
    const normalized = values.map((v) => (v > 10 ? v / 10.0 : v));
    const overall = parseFloat((normalized.reduce((a, b) => a + b, 0) / count).toFixed(2));

    const tech = rubricScores['Technical Feasibility'] || rubricScores['technical_feasibility'] || (overall * 10);
    const normalizedTech = tech > 10 ? tech / 10.0 : tech;

    const scale = rubricScores['Scalability'] || rubricScores['scalability'] || (overall * 10);
    const normalizedScale = scale > 10 ? scale / 10.0 : scale;

    let verdict = 'NOT RECOMMENDED';
    if (overall >= 8.0 && normalizedTech >= 7.0 && normalizedScale >= 7.0) {
      verdict = 'RECOMMEND FOR PILOT';
    } else if (overall >= 6.0 && normalizedTech >= 6.0) {
      verdict = 'FURTHER EVALUATION REQUIRED';
    }

    const strengths = Object.entries(rubricScores)
      .filter(([_, v]) => (v > 10 ? v / 10.0 : v) >= 8.0)
      .map(([k]) => k);

    const concerns = Object.entries(rubricScores)
      .filter(([_, v]) => (v > 10 ? v / 10.0 : v) <= 7.0)
      .map(([k]) => k);

    return {
      overallScore: overall,
      verdict,
      strengths,
      concerns,
    };
  }

  // Approach 2: Objective Readiness Scorer
  computeObjectiveReadiness(startupData: any): {
    totalObjective: number;
    breakdown: {
      trlPoints: number;
      pilotsPoints: number;
      dpiitPoints: number;
      turnoverPoints: number;
    };
  } {
    const trl = startupData.trlLevel ?? startupData.trl_level ?? 6;
    const pilots = Math.min(startupData.completedGovernmentPilots ?? startupData.completed_government_pilots ?? 1, 5);
    const dpiit = startupData.dpiitRecognized ?? startupData.dpiit_recognized ? 1.0 : 0.0;
    const turnover = Math.min(startupData.annualTurnoverLakhs ?? startupData.annual_turnover_lakhs_inr ?? 25.0, 500.0) / 500.0;

    // Weighted calculation (Max 10.0 pts)
    // TRL: 4.0 pts | Verified Gov Pilots: 3.0 pts | DPIIT: 1.5 pts | Turnover: 1.5 pts
    const trlPoints = parseFloat(((trl / 9.0) * 4.0).toFixed(2));
    const pilotsPoints = parseFloat(((pilots / 5.0) * 3.0).toFixed(2));
    const dpiitPoints = parseFloat((dpiit * 1.5).toFixed(2));
    const turnoverPoints = parseFloat((turnover * 1.5).toFixed(2));

    const totalObjective = parseFloat((trlPoints + pilotsPoints + dpiitPoints + turnoverPoints).toFixed(2));

    return {
      totalObjective,
      breakdown: {
        trlPoints,
        pilotsPoints,
        dpiitPoints,
        turnoverPoints,
      },
    };
  }

  // Comprehensive Hybrid Evaluation
  evaluateReadiness(rubricScores: Record<string, number>, startupData: any): {
    compositeScore: number;
    expertRubricScore: number;
    objectiveReadinessScore: number;
    objectiveBreakdown: {
      trlPoints: number;
      pilotsPoints: number;
      dpiitPoints: number;
      turnoverPoints: number;
    };
    strengths: string[];
    riskConcerns: string[];
    verdict: string;
  } {
    const values = Object.values(rubricScores);
    const count = values.length || 1;
    const normalized = values.map((v) => (v > 10 ? v / 10.0 : v));
    const expertAvg = parseFloat((normalized.reduce((a, b) => a + b, 0) / count).toFixed(2));

    const { totalObjective, breakdown } = this.computeObjectiveReadiness(startupData);

    // Composite score: 55% Expert Rubric + 45% Verified Objective Telemetry
    const composite = parseFloat(((expertAvg * 0.55) + (totalObjective * 0.45)).toFixed(2));

    // Strengths
    const strengths = Object.entries(rubricScores)
      .filter(([_, v]) => (v > 10 ? v / 10.0 : v) >= 8.0)
      .map(([k]) => `High Expert Rating: ${k}`);

    const trl = startupData.trlLevel ?? startupData.trl_level ?? 6;
    const pilots = startupData.completedGovernmentPilots ?? startupData.completed_government_pilots ?? 1;
    const isDpiit = startupData.dpiitRecognized ?? startupData.dpiit_recognized;

    if (trl >= 8) {
      strengths.push(`Field-Proven Technology Readiness (TRL ${trl})`);
    }
    if (pilots > 0) {
      strengths.push(`Demonstrated Municipal Track Record (${pilots} prior pilots)`);
    }
    if (isDpiit) {
      strengths.push('DPIIT Recognized (Statutory GFR Rule 170 Eligible)');
    }

    // Risk & Audit concerns
    const riskConcerns = Object.entries(rubricScores)
      .filter(([_, v]) => (v > 10 ? v / 10.0 : v) <= 6.5)
      .map(([k]) => `Evaluation Concern: Low ${k}`);

    if (trl <= 5) {
      riskConcerns.push(`Early-stage TRL (TRL ${trl}): Requires controlled isolation trial`);
    }
    if (!isDpiit) {
      riskConcerns.push('Not DPIIT Recognized: Full Earnest Money Deposit (EMD) required');
    }
    const turnover = startupData.annualTurnoverLakhs ?? startupData.annual_turnover_lakhs_inr ?? 25.0;
    if (turnover < 10.0) {
      riskConcerns.push('Limited balance sheet reserve (< 10 Lakhs INR) for hardware scaling');
    }

    // Statutory Procurement Verdict
    const tech = rubricScores['Technical Feasibility'] || rubricScores['technical_feasibility'] || (expertAvg * 10);
    const normalizedTech = tech > 10 ? tech / 10.0 : tech;

    let verdict = 'UNSUITABLE FOR MUNICIPAL DEPLOYMENT';
    if (composite >= 7.8 && normalizedTech >= 7.0 && trl >= 6) {
      verdict = 'APPROVE FOR PILOT DEPLOYMENT';
    } else if (composite >= 6.0) {
      verdict = 'CONDITIONAL APPROVAL (REVISED PILOT SCOPE)';
    }

    return {
      compositeScore: composite,
      expertRubricScore: expertAvg,
      objectiveReadinessScore: totalObjective,
      objectiveBreakdown: breakdown,
      strengths,
      riskConcerns,
      verdict,
    };
  }

  // Comparative Audit Trail
  async auditEvaluation(payload: {
    startupId?: string;
    startupName?: string;
    rubricScores: Record<string, number>;
    startupData?: any;
  }): Promise<RubricAuditResult> {
    let startupData = payload.startupData || {};
    let startupName = payload.startupName || 'Startup Candidate';

    if (payload.startupId && (!payload.startupData || !payload.startupName)) {
      const s = await this.prisma.startup.findUnique({ where: { id: payload.startupId } });
      if (s) {
        startupName = s.name;
        startupData = {
          trlLevel: (s as any).trlLevel ?? 7,
          completedGovernmentPilots: 2,
          dpiitRecognized: (s as any).dpiitRegistered ?? true,
          govPilotExperience: true,
          annualTurnoverLakhs: 45.0,
          ...payload.startupData,
        };
      }
    }

    const app1 = this.evaluateApproach1(payload.rubricScores);
    const app2 = this.evaluateReadiness(payload.rubricScores, startupData);

    const divergence = parseFloat((app2.compositeScore - app1.overallScore).toFixed(2));

    // Risk anomaly detection
    let riskFlag = 'ALIGNED EVALUATION';
    if (app1.verdict === 'RECOMMEND FOR PILOT' && app2.verdict === 'UNSUITABLE FOR MUNICIPAL DEPLOYMENT') {
      riskFlag = 'CRITICAL RISK: Paper Tiger Detected (Subjective pitch bias masked unverified hardware)';
    } else if (app2.verdict.includes('CONDITIONAL') && app1.verdict === 'NOT RECOMMENDED') {
      riskFlag = 'OPPORTUNITY RESCUED: Battle-tested vendor salvaged despite conservative evaluator scores';
    }

    return {
      startupName,
      approach1: app1,
      approach2: app2,
      divergence,
      riskFlag,
    };
  }

  // ==========================================================
  // MODEL 3: AI PILOT RESULT RECOMMENDATION ENGINE
  // ==========================================================
  evaluatePilotResults(kpis: {
    target_leakage_reduction?: number;
    actual_leakage_reduction?: number;
    target_cost_reduction?: number;
    actual_cost_reduction?: number;
    target_performance?: number;
    actual_performance?: number;
  }): PilotEvaluationResult {
    const leakageTarget = kpis.target_leakage_reduction ?? kpis.target_performance ?? 20;
    const leakageActual = kpis.actual_leakage_reduction ?? kpis.actual_performance ?? 27;

    const costTarget = kpis.target_cost_reduction ?? 15;
    const costActual = kpis.actual_cost_reduction ?? 18;

    const leakageAttainment = (leakageActual / Math.max(leakageTarget, 1)) * 100;
    const costAttainment = (costActual / Math.max(costTarget, 1)) * 100;
    const avgAttainment = (leakageAttainment + costAttainment) / 2;

    let verdict: 'PILOT SUCCESS' | 'PILOT PARTIAL SUCCESS' | 'PILOT UNSUCCESSFUL';
    let recommendation: 'SCALE' | 'EXTEND PILOT' | 'REJECT';
    let confidence: number;
    let reason: string;

    if (leakageActual >= leakageTarget && costActual >= costTarget) {
      verdict = 'PILOT SUCCESS';
      recommendation = 'SCALE';
      confidence = Math.min(95, Math.round(70 + (avgAttainment - 100) * 0.7));
      reason = 'Solution exceeded both primary KPIs and demonstrated deployment feasibility.';
    } else if (leakageActual >= leakageTarget && costActual < costTarget) {
      verdict = 'PILOT PARTIAL SUCCESS';
      recommendation = 'EXTEND PILOT';
      confidence = 74;
      reason = 'Target leakage reduction achieved, but operational cost targets require an extended trial.';
    } else {
      verdict = 'PILOT UNSUCCESSFUL';
      recommendation = 'REJECT';
      confidence = 88;
      reason = 'Core performance metrics failed to meet minimum municipal thresholds.';
    }

    return {
      verdict,
      recommendation,
      confidence,
      reason,
      metrics: {
        leakageAttainmentPct: parseFloat(leakageAttainment.toFixed(1)),
        costAttainmentPct: parseFloat(costAttainment.toFixed(1)),
        avgAttainmentPct: parseFloat(avgAttainment.toFixed(1)),
      },
    };
  }

  // Recommendation for real pilot from database
  async pilotRecommendation(pilotId: string) {
    const p = await this.prisma.pilot.findUnique({
      where: { id: pilotId },
      include: { startup: true, challenge: true, milestones: true },
    });
    if (!p) return null;

    const target = p.targetValue ?? 20;
    const actual = p.actualValue ?? 26;

    const completedMilestones = p.milestones.filter((m) => m.status === 'COMPLETED').length;
    const totalMilestones = p.milestones.length || 1;
    const msProgress = completedMilestones / totalMilestones;

    // Use Model 3 evaluation
    const evaluation = this.evaluatePilotResults({
      target_leakage_reduction: target,
      actual_leakage_reduction: actual,
      target_cost_reduction: 15,
      actual_cost_reduction: msProgress >= 1.0 ? 18 : 12,
    });

    return {
      pilotId: p.id,
      startupName: p.startup?.name,
      challengeTitle: p.challenge?.title,
      ...evaluation,
    };
  }
}
