import { Injectable } from '@nestjs/common';
import { BaseTool } from '../base-tool';
import { ToolResult, UserContext } from '../../../common/interfaces/tool.interface';
import { QlooService } from '../../qloo/qloo.service';

@Injectable()
export class QlooTagsTool extends BaseTool {
  name = 'qloo_tags';
  description = 'Get tags and categories for entities to understand preferences';
  parameters = {
    type: 'object' as const,
    properties: {
      entityId: { type: 'string', description: 'Entity ID to get tags for' },
      query: { type: 'string', description: 'Search query for tags' },
      tagTypes: { type: 'array', description: 'Array of tag types to filter by' },
      take: { type: 'number', description: 'Maximum number of tags to return' },
    },
    required: [],
  };

  constructor(private readonly qlooService: QlooService) {
    super();
  }

  async execute(params: { entityId?: string; query?: string; tagTypes?: string[]; take?: number }, _context: UserContext): Promise<ToolResult> {
    try {
      console.log(`🏷️ Getting tags with params:`, params);
      
      let tags = [];
      
      if (params.entityId) {
        // Get taste analysis for specific entity
        tags = await this.qlooService.getTasteAnalysis({
          entities: [params.entityId],
          tagTypes: params.tagTypes,
        });
      } else if (params.query) {
        // Search for tags by query
        tags = await this.qlooService.searchTags({
          query: params.query,
          tagTypes: params.tagTypes,
          take: params.take || 10
        });
      } else {
        // Get general tag types
        tags = await this.qlooService.getTagTypes({
          take: params.take || 20
        });
      }
      
      const result = this.createSuccessResult(tags, {
        toolName: 'qloo_tags',
        entityId: params.entityId,
        query: params.query,
        tagCount: tags.length,
      });

      this.logExecution(params, result);
      return result;
    } catch (error) {
      const errorResult = this.createErrorResult(`Qloo tags failed: ${error.message}`);
      this.logExecution(params, errorResult);
      return errorResult;
    }
  }
}