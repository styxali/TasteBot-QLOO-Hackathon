import { Module } from '@nestjs/common';
import { HeatmapVisualizationService } from './heatmap-visualization.service';

@Module({
  providers: [HeatmapVisualizationService],
  exports: [HeatmapVisualizationService],
})
export class HeatmapVisualizationModule {}
