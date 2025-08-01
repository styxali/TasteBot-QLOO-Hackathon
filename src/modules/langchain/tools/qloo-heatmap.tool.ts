import { Injectable } from '@nestjs/common';
import { BaseTool } from '../base-tool';
import { ToolResult, UserContext } from '../../../common/interfaces/tool.interface';
import { QlooService } from '../../qloo/qloo.service';

@Injectable()
export class QlooHeatmapTool extends BaseTool {
  name = 'qloo_heatmap';
  description = 'Generate cultural heatmaps showing taste-based geographic data';
  parameters = {
    type: 'object' as const,
    properties: {
      location: { type: 'string', description: 'Location for heatmap generation' },
      interests: { type: 'array', description: 'Cultural interests for heatmap' },
      tags: { type: 'array', description: 'Tags for cultural filtering' },
      boundary: { type: 'string', description: 'Boundary type: geohashes, city, or neighborhood' },
    },
    required: ['location'],
  };

  constructor(private readonly qlooService: QlooService) {
    super();
  }

  async execute(params: { 
    location: string; 
    interests?: string[]; 
    tags?: string[];
    boundary?: string;
  }, _context: UserContext): Promise<ToolResult> {
    try {
      if (!this.validateParams(params, ['location'])) {
        return this.createErrorResult('Missing required parameter: location');
      }

      console.log(`🗺️ Generating Qloo heatmap for: ${params.location}`);
      
      const heatmapData = await this.qlooService.getHeatmap({
        location: params.location,
        interests: params.interests,
        tags: params.tags,
        boundary: params.boundary || 'geohashes'
      });

      // Format heatmap data for interactive display
      const formattedData = {
        heatmap: heatmapData,
        location: params.location,
        interests: params.interests,
        total_points: heatmapData.length,
        type: 'heatmap',
        interactive: true
      };

      const result = this.createSuccessResult(formattedData, {
        toolName: 'qloo_heatmap',
        location: params.location,
        interests: params.interests,
        resultCount: heatmapData.length,
      });

      this.logExecution(params, result);
      return result;
    } catch (error) {
      console.error('❌ Qloo heatmap generation error:', error);
      const errorResult = this.createErrorResult(`Heatmap generation failed: ${error.message}`);
      this.logExecution(params, errorResult);
      return errorResult;
    }
  }
}