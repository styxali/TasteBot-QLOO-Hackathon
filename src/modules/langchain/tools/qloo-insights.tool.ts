import { Injectable } from '@nestjs/common';
import { BaseTool } from '../base-tool';
import { ToolResult, UserContext } from '../../../common/interfaces/tool.interface';
import { QlooService } from '../../qloo/qloo.service';

@Injectable()
export class QlooInsightsTool extends BaseTool {
  name = 'qloo_insights';
  description = 'Search Qloo cultural intelligence database for entities and insights';
  parameters = {
    type: 'object' as const,
    properties: {
      query: { type: 'string', description: 'Search query for cultural entities' },
      type: { type: 'string', description: 'Entity type filter (music, movies, food, etc.)' },
      location: { type: 'string', description: 'Location context for search' },
      take: { type: 'number', description: 'Maximum number of results' },
    },
    required: ['query'],
  };

  constructor(private readonly qlooService: QlooService) {
    super();
  }

  async execute(params: { query: string; type?: string; location?: string; take?: number }, _context: UserContext): Promise<ToolResult> {
    try {
      if (!this.validateParams(params, ['query'])) {
        return this.createErrorResult('Missing required parameter: query');
      }

      console.log(`🔍 Searching Qloo for: ${params.query}`);
      
      const entities = await this.qlooService.searchEntities({
        query: params.query,
        types: params.type ? [params.type] : undefined,
        location: params.location,
        take: params.take || 10
      });
      
      const result = this.createSuccessResult(entities, {
        toolName: 'qloo_insights',
        query: params.query,
        type: params.type,
        location: params.location,
        resultCount: entities.length,
      });

      this.logExecution(params, result);
      return result;
    } catch (error) {
      const errorResult = this.createErrorResult(`Qloo search failed: ${error.message}`);
      this.logExecution(params, errorResult);
      return errorResult;
    }
  }
}