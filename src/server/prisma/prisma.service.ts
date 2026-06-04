import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    console.log('🏗️ PrismaService instance created');
  }

  async onModuleInit() {
    console.log('🔄 Initializing Prisma connection with DATABASE_URL:', process.env.DATABASE_URL);
    let isConnected = false;
    let isMalformed = false;

    try {
      await this.$connect();
      console.log('✅ Connected to SQLite database');
      
      // Perform a real query to check if database file is corrupt/malformed
      await this.$queryRawUnsafe('SELECT 1;');
      // Also try to query a common table
      await this.$queryRawUnsafe('SELECT COUNT(*) FROM "Branch";');
      
      isConnected = true;
    } catch (err: any) {
      console.error('❌ Failed to connect or verify query in SQLite:', err);
      const errMsg = String(err.message || err).toLowerCase();
      if (errMsg.includes('malformed') || errMsg.includes('corrupt') || errMsg.includes('sqlite_corrupt') || errMsg.includes('extended_code: 11')) {
        isMalformed = true;
      }
    }

    if (isMalformed || !isConnected) {
      console.log('🚨 SQLite database is malformed, corrupt, or unreachable. Triggering self-healing...');
      try {
        await this.$disconnect();
      } catch (disError) {
        console.warn('⚠️ Disconnection warning:', disError);
      }

      const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
      const journalPath = dbPath + '-journal';
      const walPath = dbPath + '-wal';
      const shmPath = dbPath + '-shm';

      const filesToDelete = [dbPath, journalPath, walPath, shmPath];
      for (const file of filesToDelete) {
        if (fs.existsSync(file)) {
          try {
            fs.unlinkSync(file);
            console.log(`🗑️ Successfully deleted bad SQLite file: ${file}`);
          } catch (delError) {
            console.error(`⚠️ Failed to delete ${file}:`, delError);
          }
        }
      }

      console.log('🔨 Re-pushing Prisma schema to restore database...');
      try {
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        console.log('🌱 Re-seeding database...');
        execSync('npx prisma db seed', { stdio: 'inherit' });
        
        console.log('🔄 Re-connecting to newly restored SQLite database...');
        await this.$connect();
        console.log('✅ Successfully connected and restored client!');
        isConnected = true;
      } catch (restoreError) {
        console.error('❌ Critical failure during database self-healing:', restoreError);
      }
    }

    if (isConnected) {
      // Configure SQLite settings if connected successfully
      try {
        await this.$executeRawUnsafe('PRAGMA journal_mode=DELETE;');
        await this.$executeRawUnsafe('PRAGMA synchronous=FULL;');
        await this.$executeRawUnsafe('PRAGMA busy_timeout=15000;');
        console.log('⚡ Successfully configured SQLite DELETE journaling, synchronous=FULL, and busy_timeout=15000');
      } catch (pragmaErr) {
        console.warn('⚠️ Failed to apply SQLite optimization pragmas (this is fine if database was not initialized):', pragmaErr);
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
