import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PilotsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  private readonly include = {
    challenge: { include: { department: true } },
    startup: true,
    milestones: {
      orderBy: { id: 'asc' as const },
    },
    decision: true,
  } as const;

  private present(pilot: any) {
    return {
      ...pilot,
      departmentName: pilot.challenge?.department?.name || 'Public Works Department',
    };
  }

  async list() {
    const pilots = await this.prisma.pilot.findMany({
      include: this.include,
      orderBy: { startDate: 'desc' },
    });
    return pilots.map((pilot) => this.present(pilot));
  }

  async get(id: string) {
    const pilot = await this.prisma.pilot.findUnique({
      where: { id },
      include: this.include,
    });
    if (!pilot) throw new NotFoundException('Pilot not found');
    return this.present(pilot);
  }

  async create(challengeId: string, startupId: string, applicationId?: string) {
    const id = `pilot-${Date.now()}`;
    const pilot = await this.prisma.pilot.create({
      data: {
        id,
        challengeId,
        startupId,
        applicationId,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 86400000),
        baselineValue: 35,
        targetValue: 20,
        actualValue: 17,
        milestones: {
          create: [
            {
              id: `ms-${Date.now()}-1`,
              title: 'Initial Hardware & Telemetry Setup',
              amount: 250000,
              status: 'COMPLETED',
              completedAt: new Date(),
            },
            {
              id: `ms-${Date.now()}-2`,
              title: 'Field Deployment & Baseline Data Calibration',
              amount: 300000,
              status: 'IN_PROGRESS',
            },
            {
              id: `ms-${Date.now()}-3`,
              title: 'Final Impact Audit & Scale-Up Proposal',
              amount: 250000,
              status: 'PENDING',
            },
          ],
        },
      },
      include: this.include,
    });
    return this.present(pilot);
  }

  async updateMilestone(id: string, status: any) {
    return this.prisma.milestone.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });
  }

  async decision(pilotId: string, outcome: string, recommendedBy?: string) {
    let recommenderId = recommendedBy;
    if (!recommenderId) {
      const firstGov = await this.prisma.user.findFirst({ where: { role: 'GOVERNMENT' } });
      recommenderId = firstGov?.id || 'usr-1';
    } else {
      const exists = await this.prisma.user.findUnique({ where: { id: recommenderId } });
      if (!exists) {
        const firstGov = await this.prisma.user.findFirst({ where: { role: 'GOVERNMENT' } });
        recommenderId = firstGov?.id || 'usr-1';
      }
    }

    return this.prisma.decision.upsert({
      where: { pilotId },
      create: {
        id: `dec-${Date.now()}`,
        pilotId,
        outcome,
        recommendedBy: recommenderId,
        recommendedAt: new Date(),
      },
      update: {
        outcome,
        recommendedBy: recommenderId,
        recommendedAt: new Date(),
      },
    });
  }

  async my(startupId: string) {
    const pilots = await this.prisma.pilot.findMany({
      where: { startupId },
      include: this.include,
      orderBy: { startDate: 'desc' },
    });
    return pilots.map((pilot) => this.present(pilot));
  }
}
