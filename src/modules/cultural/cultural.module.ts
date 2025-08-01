import { Module } from '@nestjs/common';
import { CulturalIntelligenceService } from './cultural-intelligence.service';
import { QlooModule } from '../qloo/qloo.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [QlooModule, MemoryModule],
  providers: [CulturalIntelligenceService],
  exports: [CulturalIntelligenceService],
})
export class CulturalModule {}