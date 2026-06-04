import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional, IsNumber, IsBoolean, IsInt } from 'class-validator';
import * as fs from 'fs';
import * as path from 'path';

const suppliersPath = path.join(process.cwd(), 'prisma', 'suppliers.json');

// DTO Declarations for clean Global validation-pipe whitelist compliance

class CreateBranchDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

class UpdateBranchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

class CreateSparePartDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  unit: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  basePrice: number;

  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @IsBoolean()
  @IsOptional()
  isConsignment?: boolean;

  @IsString()
  @IsOptional()
  searchKey?: string;

  @IsString()
  @IsOptional()
  productCategory?: string;

  @IsString()
  @IsOptional()
  productType?: string;

  @IsString()
  @IsOptional()
  uom?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  flagPurchase?: boolean;

  @IsBoolean()
  @IsOptional()
  flagSale?: boolean;

  @IsBoolean()
  @IsOptional()
  flagStocked?: boolean;

  @IsBoolean()
  @IsOptional()
  flagActive?: boolean;

  @IsString()
  @IsOptional()
  typeSeries?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  quality?: string;

  @IsString()
  @IsOptional()
  partCode?: string;

  @IsInt()
  @IsOptional()
  lifetimeKm?: number;

  @IsInt()
  @IsOptional()
  lifetimeMonth?: number;
}

class UpdateSparePartDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  basePrice?: number;

  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @IsBoolean()
  @IsOptional()
  isConsignment?: boolean;

  @IsString()
  @IsOptional()
  searchKey?: string;

  @IsString()
  @IsOptional()
  productCategory?: string;

  @IsString()
  @IsOptional()
  productType?: string;

  @IsString()
  @IsOptional()
  uom?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  flagPurchase?: boolean;

  @IsBoolean()
  @IsOptional()
  flagSale?: boolean;

  @IsBoolean()
  @IsOptional()
  flagStocked?: boolean;

  @IsBoolean()
  @IsOptional()
  flagActive?: boolean;

  @IsString()
  @IsOptional()
  typeSeries?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  quality?: string;

  @IsString()
  @IsOptional()
  partCode?: string;

  @IsInt()
  @IsOptional()
  lifetimeKm?: number;

  @IsInt()
  @IsOptional()
  lifetimeMonth?: number;
}

class CreateSupplierDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  paymentTerm?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  paymentTerm?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

class CreateCustomerDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsInt()
  @IsOptional()
  termsDays?: number;

  @IsString()
  @IsOptional()
  searchKey?: string;

  @IsString()
  @IsOptional()
  commercialName?: string;

  @IsString()
  @IsOptional()
  bpCategory?: string;

  @IsString()
  @IsOptional()
  bpType?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  entityProfile?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  fiscalName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  referenceNo?: string;

  @IsInt()
  @IsOptional()
  consumptionDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  summaryLevel?: boolean;

  @IsBoolean()
  @IsOptional()
  isCustomer?: boolean;

  @IsString()
  @IsOptional()
  financialAccount?: string;

  @IsString()
  @IsOptional()
  priceList?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsString()
  @IsOptional()
  invoiceTerms?: string;

  @IsString()
  @IsOptional()
  salesRep?: string;

  @IsBoolean()
  @IsOptional()
  taxExempt?: boolean;

  @IsBoolean()
  @IsOptional()
  onHold?: boolean;
}

class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsInt()
  @IsOptional()
  termsDays?: number;

  @IsString()
  @IsOptional()
  searchKey?: string;

  @IsString()
  @IsOptional()
  commercialName?: string;

  @IsString()
  @IsOptional()
  bpCategory?: string;

  @IsString()
  @IsOptional()
  bpType?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  entityProfile?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  fiscalName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  referenceNo?: string;

  @IsInt()
  @IsOptional()
  consumptionDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  summaryLevel?: boolean;

  @IsBoolean()
  @IsOptional()
  isCustomer?: boolean;

  @IsString()
  @IsOptional()
  financialAccount?: string;

  @IsString()
  @IsOptional()
  priceList?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsString()
  @IsOptional()
  invoiceTerms?: string;

  @IsString()
  @IsOptional()
  salesRep?: string;

  @IsBoolean()
  @IsOptional()
  taxExempt?: boolean;

  @IsBoolean()
  @IsOptional()
  onHold?: boolean;
}

class CreateVehicleDto {
  @IsString()
  plateNumber: string;

  @IsString()
  @IsOptional()
  chassisNumber?: string;

  @IsString()
  @IsOptional()
  engineNumber?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  customerId: string;
}

class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  plateNumber?: string;

  @IsString()
  @IsOptional()
  chassisNumber?: string;

  @IsString()
  @IsOptional()
  engineNumber?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  customerId?: string;
}

class CreateTaskDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  standardPrice: number;
}

class UpdateTaskDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  standardPrice?: number;
}

@Controller('master')
export class MasterController {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  // Local helper for files-backed Supplier Master records persistence
  private getSuppliersList(): any[] {
    try {
      if (fs.existsSync(suppliersPath)) {
        return JSON.parse(fs.readFileSync(suppliersPath, 'utf-8'));
      }
    } catch (e) {
      console.error('Error reading suppliers JSON:', e);
    }
    return [];
  }

  private saveSuppliersList(data: any[]) {
    try {
      fs.writeFileSync(suppliersPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving suppliers JSON:', e);
    }
  }

  // ==================== WORKSHOPS & BRANCHES ====================

  @Get('workshops')
  async getWorkshops() {
    return this.prisma.branch.findMany({
      orderBy: { name: 'asc' }
    });
  }

  @Post('workshops')
  async createWorkshop(@Body() body: CreateBranchDto) {
    return this.prisma.branch.create({
      data: body
    });
  }

  @Put('workshops/:id')
  async updateWorkshop(@Param('id') id: string, @Body() body: UpdateBranchDto) {
    return this.prisma.branch.update({
      where: { id },
      data: body
    });
  }

  @Delete('workshops/:id')
  async deleteWorkshop(@Param('id') id: string) {
    return this.prisma.branch.delete({
      where: { id }
    });
  }

  // ==================== VEHICLE MODELS ====================

  @Get('vehicle-models')
  async getVehicleModels() {
    return this.prisma.vehicleModel.findMany({
      orderBy: { name: 'asc' }
    });
  }

  // ==================== SERVICE TYPES / TASKS ====================

  @Get('tasks')
  async getTasks() {
    return this.prisma.taskMaster.findMany({
      orderBy: { name: 'asc' }
    });
  }

  @Post('tasks')
  async createTask(@Body() body: CreateTaskDto) {
    return this.prisma.taskMaster.create({
      data: {
        name: body.name,
        category: body.category,
        standardPrice: body.standardPrice
      }
    });
  }

  @Put('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() body: UpdateTaskDto) {
    return this.prisma.taskMaster.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        standardPrice: body.standardPrice
      }
    });
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    return this.prisma.taskMaster.delete({
      where: { id }
    });
  }

  // ==================== SPARE PARTS ====================

  @Get('spare-parts')
  async getSpareParts() {
    return this.prisma.sparePart.findMany({
      orderBy: { name: 'asc' }
    });
  }

  @Post('spare-parts')
  async createSparePart(@Body() body: CreateSparePartDto) {
    return this.prisma.sparePart.create({
      data: {
        name: body.name,
        code: body.code,
        unit: body.unit,
        category: body.category,
        basePrice: body.basePrice,
        purchasePrice: body.purchasePrice ?? 0,
        isConsignment: body.isConsignment ?? false,
        searchKey: body.searchKey,
        productCategory: body.productCategory,
        productType: body.productType,
        uom: body.uom,
        description: body.description,
        flagPurchase: body.flagPurchase ?? true,
        flagSale: body.flagSale ?? true,
        flagStocked: body.flagStocked ?? true,
        flagActive: body.flagActive ?? true,
        typeSeries: body.typeSeries,
        brand: body.brand,
        quality: body.quality,
        partCode: body.partCode,
        lifetimeKm: body.lifetimeKm ?? 0,
        lifetimeMonth: body.lifetimeMonth ?? 0
      }
    });
  }

  @Put('spare-parts/:id')
  async updateSparePart(@Param('id') id: string, @Body() body: UpdateSparePartDto) {
    return this.prisma.sparePart.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code,
        unit: body.unit,
        category: body.category,
        basePrice: body.basePrice,
        purchasePrice: body.purchasePrice,
        isConsignment: body.isConsignment,
        searchKey: body.searchKey,
        productCategory: body.productCategory,
        productType: body.productType,
        uom: body.uom,
        description: body.description,
        flagPurchase: body.flagPurchase,
        flagSale: body.flagSale,
        flagStocked: body.flagStocked,
        flagActive: body.flagActive,
        typeSeries: body.typeSeries,
        brand: body.brand,
        quality: body.quality,
        partCode: body.partCode,
        lifetimeKm: body.lifetimeKm,
        lifetimeMonth: body.lifetimeMonth
      }
    });
  }

  @Delete('spare-parts/:id')
  async deleteSparePart(@Param('id') id: string) {
    return this.prisma.sparePart.delete({
      where: { id }
    });
  }

  // ==================== MECHANICS ====================

  @Get('mechanics')
  async getMechanics() {
    return this.prisma.user.findMany({
      where: { role: 'mechanic' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
  }

  // ==================== EXPOSED SUPPLIERS ====================

  @Get('suppliers')
  async getSuppliers() {
    return this.getSuppliersList();
  }

  @Post('suppliers')
  async createSupplier(@Body() body: CreateSupplierDto) {
    const list = this.getSuppliersList();
    const newItem = {
      id: 'sup-' + Date.now(),
      ...body
    };
    list.push(newItem);
    this.saveSuppliersList(list);
    return newItem;
  }

  @Put('suppliers/:id')
  async updateSupplier(@Param('id') id: string, @Body() body: UpdateSupplierDto) {
    const list = this.getSuppliersList();
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...body };
      this.saveSuppliersList(list);
      return list[index];
    }
    return null;
  }

  @Delete('suppliers/:id')
  async deleteSupplier(@Param('id') id: string) {
    let list = this.getSuppliersList();
    const removed = list.find(item => item.id === id);
    list = list.filter(item => item.id !== id);
    this.saveSuppliersList(list);
    return removed;
  }

  // ==================== EXPOSED CUSTOMERS ====================

  @Get('customers')
  async getCustomers() {
    return this.prisma.customer.findMany({
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

  @Post('customers')
  async createCustomer(@Body() body: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: body
    });
  }

  @Put('customers/:id')
  async updateCustomer(@Param('id') id: string, @Body() body: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id },
      data: body
    });
  }

  @Delete('customers/:id')
  async deleteCustomer(@Param('id') id: string) {
    return this.prisma.customer.delete({
      where: { id }
    });
  }

  // ==================== EXPOSED VEHICLES ====================

  @Get('vehicles')
  async getVehicles() {
    return this.prisma.vehicle.findMany({
      include: { customer: true },
      orderBy: { plateNumber: 'asc' }
    });
  }

  @Post('vehicles')
  async createVehicle(@Body() body: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: body,
      include: { customer: true }
    });
  }

  @Put('vehicles/:id')
  async updateVehicle(@Param('id') id: string, @Body() body: UpdateVehicleDto) {
    return this.prisma.vehicle.update({
      where: { id },
      data: body,
      include: { customer: true }
    });
  }

  @Delete('vehicles/:id')
  async deleteVehicle(@Param('id') id: string) {
    return this.prisma.vehicle.delete({
      where: { id }
    });
  }
}

