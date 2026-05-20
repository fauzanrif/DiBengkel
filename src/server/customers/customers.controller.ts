import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(
    @Inject(CustomersService)
    private readonly customersService: CustomersService
  ) {}

  @Post()
  create(@Body() data: any) {
    return this.customersService.create(data);
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }
}
