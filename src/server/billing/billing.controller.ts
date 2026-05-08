import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { BillingService } from './billing.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get orders ready for invoicing' })
  getPending() {
    return this.billingService.getPendingInvoices();
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get all generated invoices' })
  getAll() {
    return this.billingService.getAllInvoices();
  }

  @Post('invoices')
  @ApiOperation({ summary: 'Generate invoice from an order' })
  createInvoice(
    @Body('orderId') orderId: string,
    @Body('discountType') discountType?: string,
    @Body('discountValue') discountValue?: number,
  ) {
    return this.billingService.createInvoice(orderId, discountType, discountValue);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get financial accounts' })
  getAccounts() {
    return this.billingService.getAccounts();
  }

  @Patch('invoices/:id/status')
  @ApiOperation({ summary: 'Update invoice workflow status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.billingService.updateInvoiceStatus(id, status);
  }

  @Post('seed-dummy')
  @ApiOperation({ summary: 'Create dummy billing data' })
  seedDummy() {
    return this.billingService.seedDummy();
  }

  @Post('invoices/:id/payments')
  @ApiOperation({ summary: 'Register a payment for an invoice' })
  addPayment(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('method') method: string,
    @Body('accountId') accountId: string,
    @Body('reference') reference?: string,
  ) {
    return this.billingService.addPayment(id, amount, method, accountId, reference);
  }
}
