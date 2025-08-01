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
    _context: UserContext
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

      // Format venues for interactive selection
      const formattedVenues = venues.map((venue, index) => ({
        number: index + 1,
        fsq_id: venue.fsq_id,
        name: venue.name,
        address: venue.location?.formatted_address || venue.location?.address || 'Address not available',
        category: venue.categories?.[0]?.name || 'Venue',
        rating: venue.rating?.toString() || 'No rating',
        price: venue.price ? '💰'.repeat(venue.price) : 'Price not available',
        distance: venue.distance ? `${(venue.distance / 1000).toFixed(1)} km` : '',
        hours: venue.hours?.display || 'Hours not available',
        tel: venue.tel || '',
        website: venue.website || '',
        description: venue.description || '',
        photos: venue.photos?.map(p => p.prefix + 'original' + p.suffix) || []
      }));

      const result = this.createSuccessResult({
        venues: formattedVenues,
        total: venues.length,
        query: params.query,
        location: params.location,
        interactive: true,
        type: 'venue_list'
      }, {
        toolName: 'foursquare_venue',
        query: params.query,
        location: params.location,
        categories: params.categories,
        resultCount: venues.length,
      });

      this.logExecution(params, result);
      return result;
    } catch (error) {
      console.error('❌ Foursquare venue search error:', error);
      const errorResult = this.createErrorResult(`Foursquare venue search failed: ${error.message}`);
      this.logExecution(params, errorResult);
      return errorResult;
    }
  }
}