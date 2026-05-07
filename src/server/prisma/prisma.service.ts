import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    console.log('🏗️ PrismaService instance created');
  }

  async onModuleInit() {
    console.log('🔄 Initializing Prisma connection with DATABASE_URL:', process.env.DATABASE_URL);
    try {
      await this.$connect();
      console.log('✅ Connected to SQLite database');
    } catch (err) {
      console.error('❌ Failed to connect to SQLite:', err);
      // Don't throw here to allow the app to boot and show errors if needed, 
      // but usually NestJS will fail if a provider's onModuleInit fails if it's not caught.
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
