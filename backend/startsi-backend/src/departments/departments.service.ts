import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async list() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async get(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: {
        challenges: true,
      },
    });
  }
}
