import { Controller, Get, Param, Query, Post, Body, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(
    @Query('branchId') branchId?: string,
    @Query('warehouseId') warehouseId?: string
  ) {
    return this.inventoryService.findAll(branchId, warehouseId);
  }

  @Get('warehouses')
  getWarehouses(@Query('branchId') branchId?: string) {
    return this.inventoryService.getWarehouses(branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post('movements')
  createMovement(@Body() dto: any) {
    return this.inventoryService.createMovement(dto);
  }

  @Get('notifications')
  getNotifications() {
    return this.inventoryService.getNotifications();
  }

  @Patch('notifications/:id/read')
  markRead(@Param('id') id: string) {
    return this.inventoryService.markNotificationRead(id);
  }
}
