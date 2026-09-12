import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}
  list() { return this.prisma.challenge.findMany({ orderBy: { createdAt: 'desc' } }); }
  async get(id: string) { const c = await this.prisma.challenge.findUnique({ where: { id } }); if (!c) throw new NotFoundException('Challenge not found'); return c; }
  create(data: { departmentId: string; title: string; problemStatement: string; expectedOutcome: string; status?: any; createdById: string }) { return this.prisma.challenge.create({ data: { ...data, status: data.status ?? 'DRAFT' } }); }
  async recommendations(id: string) {
    await this.get(id);
    return this.prisma.recommendation.findMany({ where: { challengeId: id }, include: { startup: true }, orderBy: { matchScore: 'desc' } });
  }
  async dashboardSummary() {
    const [totalChallenges, applications, activePilots, pendingEvaluations] = await Promise.all([
      this.prisma.challenge.count(), this.prisma.application.count(), this.prisma.pilot.count({ where: { status: 'ACTIVE' } }), this.prisma.evaluation.count({ where: { status: 'DRAFT' } })
    ]);
    const scaleUpCandidates = await this.prisma.decision.count({ where: { outcome: 'SCALE' } });
    const recentChallenges = await this.prisma.challenge.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
    return { totalChallenges, applications, activePilots, pendingEvaluations, scaleUpCandidates, recentChallenges };
  }
}
