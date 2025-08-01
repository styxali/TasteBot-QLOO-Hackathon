import { Module } from '@nestjs/common';
import { ImageAnalysisService } from './image-analysis.service';
import { VoiceProcessingService } from './voice-processing.service';
import { LocationContextService } from './location-context.service';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [LocationModule],
  providers: [ImageAnalysisService, VoiceProcessingService, LocationContextService],
  exports: [ImageAnalysisService, VoiceProcessingService, LocationContextService],
})
export class MultimodalModule {}