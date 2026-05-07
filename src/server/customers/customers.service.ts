import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.customer.create({ data });
  }

  async findAll() {
    return this.prisma.customer.findMany({
      include: { vehicles: true },
      orderBy: { name: 'asc' },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.customer.findFirst({ where: { phone } });
  }
}
