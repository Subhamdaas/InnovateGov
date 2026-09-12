import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StartupsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async list() {
    return this.prisma.startup.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async get(id: string) {
    const s = await this.prisma.startup.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            challenge: true,
          },
        },
        pilots: true,
      },
    });
    if (!s) throw new NotFoundException('Startup not found');
    return s;
  }

  async compare(ids: string[]) {
    return this.prisma.startup.findMany({
      where: { id: { in: ids } },
    });
  }
}
