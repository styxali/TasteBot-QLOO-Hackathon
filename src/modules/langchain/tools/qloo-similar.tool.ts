import { Injectable } from '@nestjs/common';
import { BaseTool } from '../base-tool';
import { ToolResult, UserContext } from '../../../common/interfaces/tool.interface';
import { QlooService } from '../../qloo/qloo.service';

@Injectable()
export class QlooSimilarTool extends BaseTool {
  name = 'qloo_similar';
  description = 'Find similar entities for taste expansion and discovery';
  parameters = {
    type: 'object' as const,
    properties: {
      entityId: { type: 'string', description: 'Entity ID to find similar items for' },
      type: { type: 'string', description: 'Type filter for similar entities' },
      limit: { type: 'number', description: 'Maximum number of similar entities' },
    },
    required: ['entityId'],
  };

  constructor(private readonly qlooService: QlooService) {
    super();
  }

  async execute(params: { entityId: string; type?: string; limit?: number }, _context: UserContext): Promise<ToolResult> {
    try {
      if (!this.validateParams(params, ['entityId'])) {
        return this.createErrorResult('Missing required parameter: entityId');
      }

      console.log(`🔗 Finding similar entities for: ${params.entityId}`);
      
      // Use the insights API to find similar entities
      const response = await this.qlooService.getInsights({
        filterType: params.type ? `urn:entity:${params.type}` : 'urn:entity:place',
        signalInterestsEntities: [params.entityId],
        take: params.limit || 5
      });
      
      const similarEntities = response.results.entities || [];
      
      const result = this.createSuccessResult(similarEntities, {
        toolName: 'qloo_similar',
        entityId: params.entityId,
        type: params.type,
        resultCount: similarEntities.length,
      });

      this.logExecution(params, result);
      return result;
    } catch (error) {
      const errorResult = this.createErrorResult(`Qloo similar search failed: ${error.message}`);
      this.logExecution(params, errorResult);
      return errorResult;
    }
  }
}