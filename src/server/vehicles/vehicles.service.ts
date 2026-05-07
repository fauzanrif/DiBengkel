import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.vehicle.create({ data });
  }

  async findByPlate(plateNumber: string) {
    return this.prisma.vehicle.findUnique({
      where: { plateNumber },
      include: { customer: true },
    });
  }
}
