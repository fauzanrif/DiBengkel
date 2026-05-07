import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('master')
export class MasterController {
  constructor(private prisma: PrismaService) {}

  @Get('workshops')
  async getWorkshops() {
    return this.prisma.branch.findMany({
      orderBy: { name: 'asc' }
    });
  }

  @Get('vehicle-models')
  async getVehicleModels() {
    return this.prisma.vehicleModel.findMany({
      orderBy: { name: 'asc' }
    });
  }

  @Get('tasks')
  async getTasks() {
    return this.prisma.taskMaster.findMany({
      orderBy: { name: 'asc' }
    });
  }

  @Get('spare-parts')
  async getSpareParts() {
    return this.prisma.sparePart.findMany({
      orderBy: { name: 'asc' }
    });
  }

  @Get('mechanics')
  async getMechanics() {
    return this.prisma.user.findMany({
      where: { role: 'mechanic' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
  }

  @Get('customers/corporate')
  async getCorporateCustomers() {
    return this.prisma.customer.findMany({
      where: { type: 'corporate' },
      orderBy: { name: 'asc' }
    });
  }
}
