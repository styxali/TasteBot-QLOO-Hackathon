import { Injectable } from '@nestjs/common';
import { BaseTasteBotTool } from '../base-tool';
import { ToolResult, UserContext } from '../../../common/interfaces/tool.interface';
import { QlooService } from '../../qloo/qloo.service';

@Injectable()
export class QlooRecommendationsTool extends BaseTasteBotTool {
  name = 'qloo_recommendations';
  description = 'Get personalized recommendations based on cultural taste profile';
  parameters = {
    entities: { type: 'array', required: true, description: 'Array of entity IDs for recommendations' },
    location: { type: 'string', required: false, description: 'Location context for recommendations' },
    limit: { type: 'number', required: false, description: 'Maximum number of recommendations' },
  };

  constructor(private readonly qlooService: QlooService) {
    super();
  }

  async execute(params: { entities: string[]; location?: string; limit?: number }, context: UserContext): Promise<ToolResult> {
    try {
      if (!this.validateParams(params, ['entities'])) {
        return this.createErrorResult('Missing required parameter: entities');
      }

      console.log(`🎯 Getting Qloo recommendations for entities: ${params.entities.join(', ')}`);
      
      const recommendations = await this.qlooService.getRecommendations(
        params.entities,
        params.location
      );
      
      const result = this.createSuccessResult(recommendations, {
        toolName: 'qloo_recommendations',
        entities: params.entities,
        location: params.location,
        resultCount: recommendations.length,
      });

      this.logExecution(params, result);
      return result;
    } catch (error) {
      const errorResult = this.createErrorResult(`Qloo recommendations failed: ${error.message}`);
      this.logExecution(params, errorResult);
      return errorResult;
    }
  }
}