import { Module } from '@nestjs/common';
import { LangChainOrchestrator } from './langchain-orchestrator.service';
import { ToolRegistry } from './tool-registry.service';
import { QlooModule } from '../qloo/qloo.module';
import { QlooInsightsTool } from './tools/qloo-insights.tool';
import { QlooRecommendationsTool } from './tools/qloo-recommendations.tool';
import { QlooSimilarTool } from './tools/qloo-similar.tool';
import { QlooTagsTool } from './tools/qloo-tags.tool';

@Module({
  imports: [QlooModule],
  providers: [
    LangChainOrchestrator,
    ToolRegistry,
    QlooInsightsTool,
    QlooRecommendationsTool,
    QlooSimilarTool,
    QlooTagsTool,
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
  ) {
    // Register all Qloo tools
    this.toolRegistry.registerTool(this.qlooInsightsTool);
    this.toolRegistry.registerTool(this.qlooRecommendationsTool);
    this.toolRegistry.registerTool(this.qlooSimilarTool);
    this.toolRegistry.registerTool(this.qlooTagsTool);
  }
}