import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(@Body() data: any) {
    return this.vehiclesService.create(data);
  }

  @Get('search')
  search(@Query('plate') plate: string) {
    return this.vehiclesService.findByPlate(plate);
  }
}
