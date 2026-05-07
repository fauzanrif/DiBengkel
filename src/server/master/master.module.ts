import { Module } from '@nestjs/common';
import { MasterController } from './master.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MasterController],
})
export class MasterModule {}
