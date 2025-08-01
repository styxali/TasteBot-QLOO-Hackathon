import { Module } from '@nestjs/common';
import { LangChainOrchestrator } from './langchain-orchestrator.service';
import { ToolRegistry } from './tool-registry.service';
import { QlooModule } from '../qloo/qloo.module';
import { LocationModule } from '../location/location.module';
import { SearchModule } from '../search/search.module';
import { WebModule } from '../web/web.module';
import { QlooInsightsTool } from './tools/qloo-insights.tool';
import { QlooRecommendationsTool } from './tools/qloo-recommendations.tool';
import { QlooSimilarTool } from './tools/qloo-similar.tool';
import { QlooTagsTool } from './tools/qloo-tags.tool';
import { FoursquareVenueTool } from './tools/foursquare-venue.tool';
import { GeoapifyGeocodeTool } from './tools/geoapify-geocode.tool';
import { TavilySearchTool } from './tools/tavily-search.tool';
import { SerperEventsTool } from './tools/serper-events.tool';
import { FirecrawlAnalysisTool } from './tools/firecrawl-analysis.tool';

@Module({
  imports: [QlooModule, LocationModule, SearchModule, WebModule],
  providers: [
    LangChainOrchestrator,
    ToolRegistry,
    QlooInsightsTool,
    QlooRecommendationsTool,
    QlooSimilarTool,
    QlooTagsTool,
    FoursquareVenueTool,
    GeoapifyGeocodeTool,
    TavilySearchTool,
    SerperEventsTool,
    FirecrawlAnalysisTool,
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
    private readonly tavilySearchTool: TavilySearchTool,
    private readonly serperEventsTool: SerperEventsTool,
    private readonly firecrawlAnalysisTool: FirecrawlAnalysisTool,
  ) {
    // Register all tools
    this.toolRegistry.registerTool(this.qlooInsightsTool);
    this.toolRegistry.registerTool(this.qlooRecommendationsTool);
    this.toolRegistry.registerTool(this.qlooSimilarTool);
    this.toolRegistry.registerTool(this.qlooTagsTool);
    this.toolRegistry.registerTool(this.foursquareVenueTool);
    this.toolRegistry.registerTool(this.geoapifyGeocodeTool);
    this.toolRegistry.registerTool(this.tavilySearchTool);
    this.toolRegistry.registerTool(this.serperEventsTool);
    this.toolRegistry.registerTool(this.firecrawlAnalysisTool);
  }
}