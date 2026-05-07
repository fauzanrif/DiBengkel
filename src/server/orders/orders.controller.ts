import { Controller, Get, Post, Body, Param, Put, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new SPK (Digital Work Order)' })
  create(@Body() createOrderDto: any) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active orders' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update work order status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Get('spare-parts/requests')
  @ApiOperation({ summary: 'Get all spare part requests' })
  findAllPartRequests() {
    return this.ordersService.findAllPartRequests();
  }

  @Post(':id/spare-parts/request')
  @ApiOperation({ summary: 'Create a new spare part request from mechanic' })
  createPartRequest(@Param('id') id: string, @Body('items') items: any[]) {
    return this.ordersService.createPartRequest(id, items);
  }

  @Patch('spare-parts/requests/:id')
  @ApiOperation({ summary: 'Approve or reject a spare part request' })
  updatePartRequestStatus(@Param('id') id: string, @Body('status') status: 'approved' | 'rejected') {
    return this.ordersService.updatePartRequestStatus(id, status);
  }
}
