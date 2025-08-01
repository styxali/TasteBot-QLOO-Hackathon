import { Injectable } from '@nestjs/common';
import { BaseTool } from '../base-tool';
import { ToolResult, UserContext } from '../../../common/interfaces/tool.interface';
import { FoursquareService } from '../../location/foursquare.service';

@Injectable()
export class FoursquareVenueTool extends BaseTool {
  name = 'foursquare_venue';
  description = 'Search for venues and locations using Foursquare API';
  parameters = {
    type: 'object' as const,
    properties: {
      query: { type: 'string', description: 'Search query for venues' },
      location: { type: 'string', description: 'Location to search in' },
      categories: { type: 'array', description: 'Category filters for venues' },
      limit: { type: 'number', description: 'Maximum number of venues to return' },
    },
    required: ['query', 'location'],
  };

  constructor(private readonly foursquareService: FoursquareService) {
    super();
  }

  async execute(
    params: { 
      query: string; 
      location: string; 
      categories?: string[]; 
      limit?: number 
    }, 
    context: UserContext
  ): Promise<ToolResult> {
    try {
      if (!this.validateParams(params, ['query', 'location'])) {
        return this.createErrorResult('Missing required parameters: query, location');
      }

      console.log(`🏢 Searching Foursquare venues: ${params.query} in ${params.location}`);
      
      const venues = await this.foursquareService.searchVenues(
        params.query,
        params.location,
        params.categories,
        params.limit || 10
      );
      
      const result = this.createSuccessResult(venues, {
        toolName: 'foursquare_venue',
        query: params.query,
        location: params.location,
        categories: params.categories,
        resultCount: venues.length,
      });

      this.logExecution(params, result);
      return result;
    } catch (error) {
      const errorResult = this.createErrorResult(`Foursquare venue search failed: ${error.message}`);
      this.logExecution(params, errorResult);
      return errorResult;
    }
  }
}