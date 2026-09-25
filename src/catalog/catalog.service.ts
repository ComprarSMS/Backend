import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listServices() {
    return this.prisma.service.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  listNumbers() {
    return this.prisma.virtualNumber.findMany({
      orderBy: [{ countryName: 'asc' }, { display: 'asc' }],
    });
  }
}
