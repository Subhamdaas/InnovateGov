import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChallengesService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async list() {
    return this.prisma.challenge.findMany({
      include: {
        department: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { applications: true, recommendations: true, pilots: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const c = await this.prisma.challenge.findUnique({
      where: { id },
      include: {
        department: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        applications: {
          include: {
            startup: true,
          },
        },
        recommendations: {
          include: {
            startup: true,
          },
          orderBy: { matchScore: 'desc' },
        },
      },
    });
    if (!c) throw new NotFoundException('Challenge not found');
    return c;
  }

  async create(data: {
    departmentId: string;
    title: string;
    problemStatement: string;
    expectedOutcome: string;
    status?: any;
    createdById: string;
  }) {
    // If createdById doesn't exist, find first government user or fallback
    let creatorId = data.createdById;
    const existingUser = await this.prisma.user.findUnique({ where: { id: creatorId } });
    if (!existingUser) {
      const firstGov = await this.prisma.user.findFirst({ where: { role: 'GOVERNMENT' } });
      if (firstGov) creatorId = firstGov.id;
    }

    // Ensure department exists or fallback
    let deptId = data.departmentId;
    const existingDept = await this.prisma.department.findUnique({ where: { id: deptId } });
    if (!existingDept) {
      const firstDept = await this.prisma.department.findFirst();
      if (firstDept) deptId = firstDept.id;
    }

    return this.prisma.challenge.create({
      data: {
        departmentId: deptId,
        title: data.title,
        problemStatement: data.problemStatement,
        expectedOutcome: data.expectedOutcome,
        status: data.status ?? 'ACTIVE',
        createdById: creatorId,
      },
      include: {
        department: true,
      },
    });
  }

  async recommendations(id: string) {
    await this.get(id);
    return this.prisma.recommendation.findMany({
      where: { challengeId: id },
      include: { startup: true },
      orderBy: { matchScore: 'desc' },
    });
  }

  async dashboardSummary() {
    const [totalChallenges, applications, activePilots, pendingEvaluations] = await Promise.all([
      this.prisma.challenge.count(),
      this.prisma.application.count(),
      this.prisma.pilot.count({ where: { status: 'ACTIVE' } }),
      this.prisma.evaluation.count({ where: { status: 'DRAFT' } }),
    ]);
    const scaleUpCandidates = await this.prisma.decision.count();
    const recentChallenges = await this.prisma.challenge.findMany({
      take: 5,
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });
    return {
      totalChallenges,
      applications,
      activePilots,
      pendingEvaluations,
      scaleUpCandidates,
      recentChallenges,
    };
  }
}
