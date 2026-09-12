import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvaluationsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async list() {
    return this.prisma.evaluation.findMany({
      include: {
        startup: true,
        challenge: {
          include: {
            department: true,
          },
        },
        evaluator: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { challengeId: 'asc' },
    });
  }

  async get(id: string) {
    return this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        startup: true,
        challenge: true,
        evaluator: true,
      },
    });
  }

  async submit(data: {
    challengeId: string;
    startupId: string;
    evaluatorId?: string;
    scores: Record<string, { weight: number; score: number }>;
    totalScore?: number;
    comment?: string;
    status?: 'DRAFT' | 'SUBMITTED';
  }) {
    let evaluatorId = data.evaluatorId;
    if (!evaluatorId) {
      const firstEval = await this.prisma.user.findFirst({ where: { role: 'EVALUATOR' } });
      if (firstEval) {
        evaluatorId = firstEval.id;
      } else {
        const firstUser = await this.prisma.user.findFirst();
        evaluatorId = firstUser?.id || 'usr-3';
      }
    }

    // Calculate total score based on weights
    let totalScore = data.totalScore;
    if (totalScore === undefined && data.scores) {
      let totalWeight = 0;
      let weightedSum = 0;
      for (const item of Object.values(data.scores)) {
        const w = Number(item.weight) || 1;
        const s = Number(item.score) || 0;
        weightedSum += s * (w / 100);
        totalWeight += w;
      }
      totalScore = Number(weightedSum.toFixed(1));
    }

    return this.prisma.evaluation.upsert({
      where: {
        challengeId_startupId: {
          challengeId: data.challengeId,
          startupId: data.startupId,
        },
      },
      create: {
        id: `eval-${Date.now()}`,
        challengeId: data.challengeId,
        startupId: data.startupId,
        evaluatorId: evaluatorId!,
        scores: data.scores as any,
        totalScore: totalScore || 80.0,
        comment: data.comment,
        status: data.status || 'SUBMITTED',
      },
      update: {
        scores: data.scores as any,
        totalScore: totalScore || 80.0,
        comment: data.comment,
        status: data.status || 'SUBMITTED',
        evaluatorId: evaluatorId!,
      },
      include: {
        startup: true,
        challenge: true,
        evaluator: true,
      },
    });
  }
}
