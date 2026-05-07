import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { InventoryModule } from './inventory/inventory.module';
import { PrismaModule } from './prisma/prisma.module';
import { CustomersModule } from './customers/customers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { MasterModule } from './master/master.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    PrismaModule,
    OrdersModule,
    InventoryModule,
    CustomersModule,
    VehiclesModule,
    MasterModule,
    BillingModule,
  ],
})
export class AppModule {}
