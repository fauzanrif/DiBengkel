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
      
      // Enable MEMORY journaling and turn synchronous writing OFF to prevent corruptions and database locks on overlayFS
      try {
        await this.$executeRawUnsafe('PRAGMA journal_mode=MEMORY;');
        await this.$executeRawUnsafe('PRAGMA synchronous=OFF;');
        await this.$executeRawUnsafe('PRAGMA temp_store=MEMORY;');
        await this.$executeRawUnsafe('PRAGMA busy_timeout=15000;');
        console.log('⚡ Successfully configured SQLite MEMORY journaling, synchronous=OFF, and busy_timeout=15000');
      } catch (pragmaErr) {
        console.warn('⚠️ Failed to apply SQLite optimization pragmas:', pragmaErr);
      }
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
