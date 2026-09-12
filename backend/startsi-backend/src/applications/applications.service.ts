import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  private readonly include = {
    challenge: true,
    startup: true,
    recommendation: true,
    pilot: { include: { milestones: true, decision: true } },
  } as const;

  private async present(application: any) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: {
        challengeId_startupId: {
          challengeId: application.challengeId,
          startupId: application.startupId,
        },
      },
      include: { evaluator: true },
    });

    return {
      ...application,
      evaluation,
      status: application.pilot
        ? 'SELECTED'
        : evaluation?.status === 'SUBMITTED'
          ? 'EVALUATED'
          : 'UNDER_REVIEW',
    };
  }

  async list() {
    const applications = await this.prisma.application.findMany({
      include: this.include,
      orderBy: { submittedAt: 'desc' },
    });
    return Promise.all(applications.map((application) => this.present(application)));
  }

  async get(id: string) {
    const application = await this.prisma.application.findFirst({
      where: { OR: [{ id }, { shortId: { equals: id, mode: 'insensitive' } }] },
      include: this.include,
    });
    if (!application) throw new NotFoundException('Application not found');
    return this.present(application);
  }

  async byStartup(startupId: string) {
    const applications = await this.prisma.application.findMany({
      where: { startupId },
      include: this.include,
      orderBy: { submittedAt: 'desc' },
    });
    return Promise.all(applications.map((application) => this.present(application)));
  }

  async openChallenges(startupId: string) {
    const [applications, challenges] = await Promise.all([
      this.prisma.application.findMany({ where: { startupId }, select: { challengeId: true } }),
      this.prisma.challenge.findMany({
        where: { status: 'ACTIVE' },
        include: { department: true, _count: { select: { applications: true } } },
      }),
    ]);
    const applied = new Set(applications.map((application) => application.challengeId));

    return challenges.map(({ _count, department, ...challenge }) => ({
      ...challenge,
      hasApplied: applied.has(challenge.id),
      departmentName: department.name,
      applicantCount: _count.applications,
    }));
  }

  async submit(startupId: string, challengeId: string, proposal: any) {
    const [startup, challenge, existing] = await Promise.all([
      this.prisma.startup.findUnique({ where: { id: startupId } }),
      this.prisma.challenge.findUnique({ where: { id: challengeId } }),
      this.prisma.application.findFirst({ where: { startupId, challengeId } }),
    ]);
    if (!startup) throw new NotFoundException('Startup not found');
    if (!challenge) throw new NotFoundException('Challenge not found');
    if (existing) throw new ConflictException('Already applied');

    const sectorTags = proposal?.sector && !startup.sectorTags.includes(proposal.sector)
      ? [proposal.sector, ...startup.sectorTags]
      : startup.sectorTags;
    await this.prisma.startup.update({
      where: { id: startupId },
      data: {
        capabilitySummary: proposal?.capabilitySummary ?? startup.capabilitySummary,
        teamSize: proposal?.teamSize ?? startup.teamSize,
        location: proposal?.location ?? startup.location,
        sectorTags,
      },
    });

    let recommendation = await this.prisma.recommendation.findFirst({ where: { startupId, challengeId } });
    if (!recommendation) {
      recommendation = await this.prisma.recommendation.create({
        data: {
          id: `rec-${Date.now()}`,
          challengeId,
          startupId,
          matchScore: 88,
          matchReason: proposal?.capabilitySummary || 'Direct startup application',
        },
      });
    }

    const count = await this.prisma.application.count();
    const application = await this.prisma.application.create({
      data: {
        id: `app-${Date.now()}`,
        shortId: `APP-${count + 101}`,
        challengeId,
        startupId,
        recommendationId: recommendation.id,
        submittedAt: new Date(),
      },
      include: this.include,
    });
    return this.present(application);
  }
}
