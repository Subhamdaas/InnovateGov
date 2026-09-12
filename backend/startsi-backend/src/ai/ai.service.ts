import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async recommend(challengeId: string) {
    const c = await this.prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!c) return [];

    const words = new Set(
      `${c.title} ${c.problemStatement} ${c.expectedOutcome}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 2)
    );

    const startups = await this.prisma.startup.findMany();
    const scored = startups
      .map((s) => {
        const text = `${s.name} ${s.sectorTags.join(' ')} ${s.capabilitySummary}`.toLowerCase();
        const matchedWords = [...words].filter((w) => text.includes(w));
        const hits = matchedWords.length;
        const score = Math.min(
          98,
          Math.max(48, 56 + Math.round((hits / Math.max(words.size, 1)) * 50))
        );
        const reason =
          hits > 0
            ? `High domain fit: matched ${hits} relevant capabilities (${matchedWords.slice(0, 3).join(', ')}) with ${s.name} core competencies.`
            : `General domain alignment based on startup profile in ${s.sectorTags.join(', ')}.`;
        return {
          startupId: s.id,
          matchScore: score,
          matchReason: reason,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    for (const r of scored) {
      await this.prisma.recommendation.upsert({
        where: {
          challengeId_startupId: { challengeId, startupId: r.startupId },
        },
        create: {
          id: `rec-${challengeId}-${r.startupId}`,
          challengeId,
          ...r,
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

  async pilotRecommendation(pilotId: string) {
    const p = await this.prisma.pilot.findUnique({ where: { id: pilotId } });
    if (!p) return null;
    const target = p.targetValue ?? 0;
    const actual = p.actualValue ?? 0;
    const success = target === 0 ? true : actual <= target;
    return {
      pilotId,
      outcome: success ? 'SCALE' : 'EXTEND',
      confidence: success ? 91 : 65,
      reason: success
        ? 'Pilot actual telemetry met the KPI performance threshold. Scale-up recommended.'
        : 'Pilot telemetry requires additional validation before state-wide deployment.',
    };
  }
}
