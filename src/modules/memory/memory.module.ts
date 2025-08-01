import { Module } from '@nestjs/common';
import { MemorySystem } from './memory-system.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MemorySystem],
  exports: [MemorySystem],
})
export class MemoryModule {}