import { Module } from '@nestjs/common';
import { ProfileEnhancementService } from './profile-enhancement.service';
import { MemoryModule } from '../memory/memory.module';
import { DataMappingModule } from '../data-mapping/data-mapping.module';

@Module({
  imports: [MemoryModule, DataMappingModule],
  providers: [ProfileEnhancementService],
  exports: [ProfileEnhancementService],
})
export class ProfileEnhancementModule {}
