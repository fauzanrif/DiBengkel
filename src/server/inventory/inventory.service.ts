import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string, warehouseId?: string) {
    return this.prisma.inventory.findMany({
      where: {
        ...(branchId ? { branchId } : {}),
        ...(warehouseId ? { warehouseId } : {}),
      },
      include: {
        part: true,
        branch: true,
        warehouse: true,
      },
      orderBy: { quantity: 'asc' } // Show low stock first
    });
  }

  async findOne(id: string) {
    return this.prisma.inventory.findUnique({
      where: { id },
      include: { 
        part: true, 
        branch: true, 
        warehouse: true,
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      },
    });
  }

  async getWarehouses(branchId?: string) {
    return this.prisma.warehouse.findMany({
      where: branchId ? { branchId } : {},
      include: { branch: true }
    });
  }

  async createMovement(dto: {
    inventoryId: string;
    type: string;
    quantity: number;
    referenceId?: string;
    referenceType?: string;
    note?: string;
    userId?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { id: dto.inventoryId }
      });

      if (!inventory) throw new Error('Inventory not found');

      // Update actual quantity
      let newQty = inventory.quantity;
      if (['in', 'release'].includes(dto.type)) {
        newQty += dto.quantity;
      } else if (['out', 'reservation'].includes(dto.type)) {
        newQty -= dto.quantity;
      } else if (dto.type === 'adjustment') {
        newQty = dto.quantity; // In adjustment, quantity provided is the new target
      }

      // If it's a reservation, we don't change 'quantity' (on hand), but we change 'reserved'
      // Actually, standard warehouse logic:
      // On Hand = Physical Stock
      // Reserved = Promised to orders
      // Available = On Hand - Reserved
      
      // Let's refine based on the type
      const updateData: any = {};
      if (dto.type === 'reservation') {
        updateData.reserved = { increment: dto.quantity };
      } else if (dto.type === 'release') {
         updateData.reserved = { decrement: dto.quantity };
      } else if (dto.type === 'in') {
        updateData.quantity = { increment: dto.quantity };
      } else if (dto.type === 'out') {
        updateData.quantity = { decrement: dto.quantity };
      } else if (dto.type === 'adjustment') {
        updateData.quantity = dto.quantity;
      }

      const updatedInventory = await tx.inventory.update({
        where: { id: dto.inventoryId },
        data: updateData,
        include: { part: true, branch: true }
      });

      const movement = await tx.inventoryMovement.create({
        data: dto
      });

      // Check for low stock alert
      const available = updatedInventory.quantity - updatedInventory.reserved;
      if (available <= updatedInventory.minStock) {
        // Only create alert if there's no unread one for this specific item
        const existingUnread = await tx.notification.findFirst({
          where: {
            category: 'inventory',
            referenceId: updatedInventory.id,
            isRead: false
          }
        });

        if (!existingUnread) {
          await tx.notification.create({
            data: {
              title: 'Low Stock Alert',
              message: `Item ${updatedInventory.part.name} (${updatedInventory.part.code}) is below minimum level at ${updatedInventory.branch.name}. Current: ${available}, Min: ${updatedInventory.minStock}`,
              type: 'warning',
              category: 'inventory',
              referenceId: updatedInventory.id
            }
          });
        }
      }

      return movement;
    });
  }

  async getNotifications() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  async markNotificationRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }
}
