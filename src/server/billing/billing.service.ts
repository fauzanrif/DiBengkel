import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(
    @Inject(PrismaService)
    private prisma: PrismaService
  ) {}

  async getPendingInvoices() {
    // Orders that are 'done' but have no invoice linked
    return this.prisma.order.findMany({
      where: {
        status: 'done',
        invoice: null,
      },
      include: {
        customer: true,
        vehicle: { include: { vehicleModel: true } },
        items: { include: { task: true, part: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getAllInvoices() {
    return this.prisma.invoice.findMany({
      include: {
        order: {
          include: {
            customer: true,
            vehicle: true,
            branch: true,
            items: {
              include: {
                task: true,
                part: true,
              },
            },
          },
        },
        payments: {
          include: { account: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoice(orderId: string, discountType?: string, discountValue?: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, customer: true },
    });

    if (!order) throw new Error('Order not found');
    if (order.status !== 'done') throw new Error('Order must be in status DONE to invoice');

    // Calculate subtotal from items (price * qty - item_discount)
    const subtotal = order.items.reduce((sum, item) => {
      const price = Number(item.price);
      const qty = Number(item.quantity);
      const itemDiscount = Number(item.discount || 0);
      return sum + (price * qty - itemDiscount);
    }, 0);

    let totalAmount = subtotal;
    if (discountType === 'percentage' && discountValue) {
      totalAmount = subtotal - (subtotal * (discountValue / 100));
    } else if (discountType === 'flat' && discountValue) {
      totalAmount = subtotal - discountValue;
    }

    if (totalAmount < 0) totalAmount = 0;

    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${year}${rand}`;

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          orderId: order.id,
          number: invoiceNumber,
          subtotal: subtotal,
          discountType: discountType || null,
          discountValue: discountValue || 0,
          totalAmount: totalAmount,
          status: 'draft',
          dueDate: null, // Set during delivery
        },
      });

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'closed' },
      });

      return invoice;
    });
  }

  async updateInvoiceStatus(invoiceId: string, status: string) {
    const data: any = { status };
    
    if (status === 'delivered') {
      const inv = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { order: { include: { customer: true } } }
      });
      data.deliveryDate = new Date();
      // Calculate due date based on TOP
      const terms = inv.order.customer.termsDays || 0;
      data.dueDate = new Date(Date.now() + terms * 86400000);
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data
    });
  }

  async getAccounts() {
    const accounts = await this.prisma.financialAccount.findMany();
    if (accounts.length === 0) {
      // Seed default accounts
      await this.prisma.financialAccount.createMany({
        data: [
          { name: 'Bank Mandiri 123-xxx', type: 'bank', balance: 0 },
          { name: 'Cash Workshop (IDR)', type: 'cash', balance: 0 },
        ]
      });
      return this.prisma.financialAccount.findMany();
    }
    return accounts;
  }

  async addPayment(invoiceId: string, amount: number, method: string, accountId: string, reference?: string) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          method,
          accountId,
          reference,
        },
      });

      // Update account balance
      await tx.financialAccount.update({
        where: { id: accountId },
        data: { balance: { increment: amount } }
      });

      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
      });

      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      
      let status = 'partially_paid';
      if (totalPaid >= Number(invoice.totalAmount)) {
        status = 'paid';
      }

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status },
      });

      return payment;
    });
  }

  async seedDummy() {
    const branches = await this.prisma.branch.findMany();
    const customers = await this.prisma.customer.findMany();
    const vehicles = await this.prisma.vehicle.findMany();
    const tracks = await this.prisma.taskMaster.findMany();
    const parts = await this.prisma.sparePart.findMany();

    if (!branches.length || !customers.length || !vehicles.length) {
      throw new Error('Please run main seeder first to have base master data');
    }

    const year = new Date().getFullYear();

    return this.prisma.$transaction(async (tx) => {
      // 1. Order in 'done' status (Shows in Pending Billing)
      const order1 = await tx.order.create({
        data: {
          spkNumber: `SPK-DUM-DONE-${Math.floor(Math.random() * 1000)}`,
          woNumber: `WO-${year}${Math.floor(Math.random() * 9000)}`,
          branchId: branches[0].id,
          customerId: customers[0].id,
          vehicleId: vehicles[0].id,
          status: 'done',
          serviceType: 'walk-in',
          odometer: 10000,
          complaint: 'Routine checkup - Done',
          estimatedTotal: 850000,
          items: {
            create: [
              { quantity: 1, price: 150000, isService: true, taskId: (tracks[0]?.id || '') },
              { quantity: 4, price: 175000, isService: false, partId: (parts[0]?.id || '') }
            ]
          }
        }
      });

      // 2. Draft Invoice
      const order2 = await tx.order.create({
        data: {
          spkNumber: `SPK-DUM-INV1-${Math.floor(Math.random() * 1000)}`,
          woNumber: `WO-${year}${Math.floor(Math.random() * 9000)}`,
          branchId: branches[0].id,
          customerId: customers[1].id,
          vehicleId: vehicles[1].id,
          status: 'closed',
          serviceType: 'walk-in',
          odometer: 22000,
          complaint: 'Brake service',
          estimatedTotal: 1200000,
        }
      });
      await tx.invoice.create({
        data: {
          orderId: order2.id,
          number: `INV-DUM-DRAFT-${Math.floor(Math.random() * 1000)}`,
          subtotal: 1200000,
          totalAmount: 1200000,
          status: 'draft',
        }
      });

      // 3. Paid Invoice
      const order3 = await tx.order.create({
        data: {
          spkNumber: `SPK-DUM-PAID-${Math.floor(Math.random() * 1000)}`,
          woNumber: `WO-${year}${Math.floor(Math.random() * 9000)}`,
          branchId: branches[0].id,
          customerId: (customers[2]?.id || customers[0].id),
          vehicleId: (vehicles[2]?.id || vehicles[0].id),
          status: 'closed',
          serviceType: 'walk-in',
          odometer: 45000,
          complaint: 'Engine tuning',
          estimatedTotal: 3500000,
        }
      });
      const invoicePaid = await tx.invoice.create({
        data: {
          orderId: order3.id,
          number: `INV-DUM-PAID-${Math.floor(Math.random() * 1000)}`,
          subtotal: 3500000,
          totalAmount: 3500000,
          status: 'paid',
          deliveryDate: new Date(Date.now() - 7 * 86400000),
          dueDate: new Date(Date.now() + 7 * 86400000),
        }
      });

      // Add account if not exists and payment
      const accounts = await tx.financialAccount.findMany();
      let accountId = accounts[0]?.id;
      if (!accountId) {
          const acc = await tx.financialAccount.create({
              data: { name: 'Bank Mandiri (IDR)', type: 'bank', balance: 0 }
          });
          accountId = acc.id;
      }

      await tx.payment.create({
        data: {
          invoiceId: invoicePaid.id,
          amount: 3500000,
          method: 'bank_transfer',
          accountId: accountId,
          reference: 'TRX-DUM-12345'
        }
      });

      await tx.financialAccount.update({
        where: { id: accountId },
        data: { balance: { increment: 3500000 } }
      });

      return { message: 'Dummy billing data created successfully' };
    });
  }
}
