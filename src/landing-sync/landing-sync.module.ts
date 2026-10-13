import { Module } from '@nestjs/common';
import { LandingSyncService } from './landing-sync.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LandingSyncService],
  exports: [LandingSyncService],
})
export class LandingSyncModule {}
