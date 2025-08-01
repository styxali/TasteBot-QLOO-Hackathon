import { Injectable } from '@nestjs/common';
import { BaseTool } from '../base-tool';
import { ToolResult, UserContext } from '../../../common/interfaces/tool.interface';
import { QlooService } from '../../qloo/qloo.service';

@Injectable()
export class QlooRecommendationsTool extends BaseTool {
  name = 'qloo_recommendations';
  description = 'Get personalized recommendations based on cultural taste profile';
  parameters = {
    type: 'object' as const,
    properties: {
      entities: { type: 'array', description: 'Array of entity IDs or interest keywords for recommendations' },
      location: { type: 'string', description: 'Location context for recommendations' },
      limit: { type: 'number', description: 'Maximum number of recommendations' },
      type: { type: 'string', description: 'Type of recommendations: place, movie, music, artist, etc.' },
    },
    required: ['entities'],
  };

  constructor(private readonly qlooService: QlooService) {
    super();
  }

  async execute(params: { entities: string[]; location?: string; limit?: number; type?: string }, _context: UserContext): Promise<ToolResult> {
    try {
      if (!this.validateParams(params, ['entities'])) {
        return this.createErrorResult('Missing required parameter: entities');
      }

      console.log(`🎯 Getting Qloo recommendations for entities: ${params.entities.join(', ')}`);

      let recommendations = [];
      const type = params.type || 'place';

      if (type === 'place') {
        recommendations = await this.qlooService.getPlaceRecommendations({
          interests: params.entities,
          location: params.location,
          take: params.limit || 10
        });
      } else if (type === 'movie') {
        recommendations = await this.qlooService.getMovieRecommendations({
          interests: params.entities,
          take: params.limit || 10
        });
      } else if (type === 'music' || type === 'artist') {
        recommendations = await this.qlooService.getMusicRecommendations({
          interests: params.entities,
          take: params.limit || 10
        });
      } else {
        // Use general insights API
        const response = await this.qlooService.getInsights({
          filterType: `urn:entity:${type}`,
          signalInterestsEntities: params.entities,
          signalLocation: params.location,
          take: params.limit || 10
        });
        recommendations = response.results.entities || [];
      }

      const result = this.createSuccessResult(recommendations, {
        toolName: 'qloo_recommendations',
        entities: params.entities,
        location: params.location,
        type: type,
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