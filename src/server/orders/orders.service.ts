import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Find or Create Customer
      let customer;
      if (dto.customerType === 'corporate' && dto.customerId) {
        customer = await tx.customer.findUnique({ where: { id: dto.customerId } });
        if (!customer) throw new BadRequestException('Corporate customer not found');
      } else {
        customer = await tx.customer.findFirst({
          where: { phone: dto.phone },
        });

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: dto.customerName,
              phone: dto.phone,
              type: 'individual',
            },
          });
        }
      }

      // 2. Find or Create Vehicle
      let vehicle = await tx.vehicle.findUnique({
        where: { plateNumber: dto.plateNumber.toUpperCase() },
      });

      if (!vehicle) {
        vehicle = await tx.vehicle.create({
          data: {
            plateNumber: dto.plateNumber.toUpperCase(),
            modelId: dto.vehicleModelId,
            customerId: customer.id,
          },
        });
      }

      // 3. Generate SPK Number
      const spkNumber = `SPK-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

      // 4. Create Order
      const order = await tx.order.create({
        data: {
          spkNumber,
          referenceNumber: dto.referenceNumber,
          branchId: dto.workshopId || 'cakung',
          customerId: customer.id,
          vehicleId: vehicle.id,
          complaint: dto.complaint,
          analysis: dto.analysis,
          serviceType: dto.serviceMethod || 'walk-in',
          odometer: parseInt(dto.odometer) || 0,
          status: dto.status || 'draft',
          estimatedTotal: 0, // Will update after items
        },
      });

      // 5. Create Order Items (Tasks and Parts)
      let total = 0;

      if (dto.tasks && Array.isArray(dto.tasks)) {
        for (const t of dto.tasks) {
          const taskMaster = await tx.taskMaster.findUnique({ where: { id: t.taskId } });
          if (!taskMaster) continue;
          
          const price = Number(taskMaster.standardPrice);
          const discount = Number(t.discount || 0);
          const subtotal = (price * (t.quantity || 1)) - discount;
          total += subtotal;

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              taskId: t.taskId,
              quantity: t.quantity || 1,
              price: taskMaster.standardPrice,
              discount,
              isService: true,
            }
          });
        }
      }

      if (dto.parts && Array.isArray(dto.parts)) {
        for (const p of dto.parts) {
          const partMaster = await tx.sparePart.findUnique({ where: { id: p.partId } });
          if (!partMaster) continue;

          const price = Number(partMaster.basePrice);
          const discount = Number(p.discount || 0);
          const subtotal = (price * p.quantity) - discount;
          total += subtotal;

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              partId: p.partId,
              quantity: p.quantity,
              price: partMaster.basePrice,
              discount,
              isService: false,
            }
          });
        }
      }

      // 6. Assign Mechanic
      if (dto.mechanicId) {
        await tx.orderAssignment.create({
          data: {
            orderId: order.id,
            mechanicId: dto.mechanicId,
          }
        });
      }

      // 7. Reserve Stock if status is approved during creation
      if (dto.status === 'approved') {
        const items = await tx.orderItem.findMany({
          where: { orderId: order.id, isService: false },
        });

        for (const item of items) {
          if (!item.partId) continue;
          
          // Find the primary inventory for this branch
          const inv = await tx.inventory.findFirst({
            where: { branchId: order.branchId, partId: item.partId }
          });

          if (inv) {
            await tx.inventory.update({
              where: { id: inv.id },
              data: { reserved: { increment: item.quantity } },
            });
            
            await tx.inventoryMovement.create({
              data: {
                inventoryId: inv.id,
                type: 'reservation',
                quantity: item.quantity,
                referenceId: order.id,
                referenceType: 'order',
                note: `Reservation for SPK: ${order.spkNumber}`
              }
            });
          }
        }
      }

      // 8. Update Total
      return tx.order.update({
        where: { id: order.id },
        data: { estimatedTotal: total },
        include: {
          customer: true,
          vehicle: { include: { vehicleModel: true } },
          items: { include: { task: true, part: true } },
          mechanics: { include: { mechanic: true } }
        }
      });
    });
  }

  async findAll() {
    console.log('📦 Fetching all orders from database...');
    try {
      const results = await this.prisma.order.findMany({
        include: {
          branch: true,
          customer: true,
          vehicle: { include: { vehicleModel: true } },
          items: { include: { task: true, part: true } },
          mechanics: { include: { mechanic: true } }
        },
        orderBy: { createdAt: 'desc' },
      });
      console.log(`✅ Found ${results.length} orders`);
      return results;
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      throw err;
    }
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        branch: true,
        customer: true,
        vehicle: true,
        items: true,
        mechanics: { include: { mechanic: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: string) {
    const order = await this.findOne(id);
    const data: any = { status };

    // 1. Generate WO number when approved if not already present
    // Mapping user strings to schema values if needed, but I'll stick to 'approved' for logic trigger
    if (status === 'approved' && !order.woNumber) {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      data.woNumber = `WO-${year}${rand}`;
    }

    // 2. Business Logic: Reserve stock when approved
    if (status === 'approved' && order.status !== 'approved') {
      await this.reserveInventory(id);
    }

    // 3. Deduction logic when transitioning to closed or done
    if (status === 'closed' || status === 'done') {
       if (order.status !== 'closed' && order.status !== 'done') {
         await this.deductInventory(id);
       }
    }

    return this.prisma.order.update({
      where: { id },
      data,
      include: {
        branch: true,
        customer: true,
        vehicle: { include: { vehicleModel: true } },
        items: { include: { task: true, part: true } },
        mechanics: { include: { mechanic: true } }
      }
    });
  }

  // Spare Part Request Methods
  async createPartRequest(orderId: string, items: any[]) {
    return this.prisma.sparePartRequest.create({
      data: {
        orderId,
        status: 'pending',
        items: {
          create: items.map(item => ({
            partId: item.partId,
            quantity: item.quantity
          }))
        }
      },
      include: { items: { include: { part: true } } }
    });
  }

  async findAllPartRequests() {
    return this.prisma.sparePartRequest.findMany({
      include: {
        order: { include: { vehicle: true, customer: true } },
        items: { include: { part: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updatePartRequestStatus(requestId: string, status: 'approved' | 'rejected') {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.sparePartRequest.update({
        where: { id: requestId },
        data: { status },
        include: { items: true, order: true }
      });

      if (status === 'approved') {
        // Add to order items and reserve inventory
        for (const reqItem of request.items) {
          const part = await tx.sparePart.findUnique({ where: { id: reqItem.partId } });
          if (!part) continue;

          // Add to OrderItem (so it shows up in final invoice)
          await tx.orderItem.create({
            data: {
              orderId: request.orderId,
              partId: reqItem.partId,
              quantity: reqItem.quantity,
              price: part.basePrice,
              isService: false
            }
          });

          // Reserve inventory
          const inv = await tx.inventory.findFirst({
            where: { branchId: request.order.branchId, partId: reqItem.partId }
          });

          if (inv) {
            await tx.inventory.update({
              where: { id: inv.id },
              data: { reserved: { increment: reqItem.quantity } }
            });

            await tx.inventoryMovement.create({
              data: {
                inventoryId: inv.id,
                type: 'reservation',
                quantity: reqItem.quantity,
                referenceId: request.orderId,
                referenceType: 'order',
                note: `Sparepart request approved for WO: ${request.order.woNumber}`
              }
            });
          }
        }

        // Recalculate estimated total
        const allItems = await tx.orderItem.findMany({ where: { orderId: request.orderId } });
        const newTotal = allItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity) - Number(item.discount), 0);
        
        await tx.order.update({
          where: { id: request.orderId },
          data: { estimatedTotal: newTotal }
        });
      }

      return request;
    });
  }

  private async reserveInventory(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) return;

      const items = await tx.orderItem.findMany({
        where: { orderId, isService: false },
      });

      for (const item of items) {
        if (!item.partId) continue;
        
        const inv = await tx.inventory.findFirst({
            where: { branchId: order.branchId, partId: item.partId }
        });

        if (inv) {
            await tx.inventory.update({
                where: { id: inv.id },
                data: { reserved: { increment: item.quantity } }
            });

            await tx.inventoryMovement.create({
                data: {
                    inventoryId: inv.id,
                    type: 'reservation',
                    quantity: item.quantity,
                    referenceId: orderId,
                    referenceType: 'order',
                    note: `Reservation for WO: ${order.woNumber}`
                }
            });
        }
      }
    });
  }

  private async deductInventory(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) return;

      const items = await tx.orderItem.findMany({
        where: { orderId, isService: false },
      });

      for (const item of items) {
        if (!item.partId) continue;
        
        const inv = await tx.inventory.findFirst({
            where: { branchId: order.branchId, partId: item.partId }
        });

        if (inv) {
            await tx.inventory.update({
                where: { id: inv.id },
                data: { 
                    quantity: { decrement: item.quantity },
                    reserved: { decrement: item.quantity }
                }
            });

            await tx.inventoryMovement.create({
                data: {
                    inventoryId: inv.id,
                    type: 'out',
                    quantity: -item.quantity,
                    referenceId: orderId,
                    referenceType: 'order',
                    note: `Inventory deduction for WO: ${order.woNumber}`
                }
            });
        }
      }
    });
  }
}
