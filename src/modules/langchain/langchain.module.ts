import { Module } from '@nestjs/common';
import { LangChainOrchestrator } from './langchain-orchestrator.service';
import { ToolRegistry } from './tool-registry.service';
import { QlooModule } from '../qloo/qloo.module';
import { LocationModule } from '../location/location.module';
import { QlooInsightsTool } from './tools/qloo-insights.tool';
import { QlooRecommendationsTool } from './tools/qloo-recommendations.tool';
import { QlooSimilarTool } from './tools/qloo-similar.tool';
import { QlooTagsTool } from './tools/qloo-tags.tool';
import { FoursquareVenueTool } from './tools/foursquare-venue.tool';
import { GeoapifyGeocodeTool } from './tools/geoapify-geocode.tool';

@Module({
  imports: [QlooModule, LocationModule],
  providers: [
    LangChainOrchestrator,
    ToolRegistry,
    QlooInsightsTool,
    QlooRecommendationsTool,
    QlooSimilarTool,
    QlooTagsTool,
    FoursquareVenueTool,
    GeoapifyGeocodeTool,
  ],
  exports: [LangChainOrchestrator, ToolRegistry],
})
export class LangChainModule {
  constructor(
    private readonly toolRegistry: ToolRegistry,
    private readonly qlooInsightsTool: QlooInsightsTool,
    private readonly qlooRecommendationsTool: QlooRecommendationsTool,
    private readonly qlooSimilarTool: QlooSimilarTool,
    private readonly qlooTagsTool: QlooTagsTool,
    private readonly foursquareVenueTool: FoursquareVenueTool,
    private readonly geoapifyGeocodeTool: GeoapifyGeocodeTool,
  ) {
    // Register all tools
    this.toolRegistry.registerTool(this.qlooInsightsTool);
    this.toolRegistry.registerTool(this.qlooRecommendationsTool);
    this.toolRegistry.registerTool(this.qlooSimilarTool);
    this.toolRegistry.registerTool(this.qlooTagsTool);
    this.toolRegistry.registerTool(this.foursquareVenueTool);
    this.toolRegistry.registerTool(this.geoapifyGeocodeTool);
  }
}