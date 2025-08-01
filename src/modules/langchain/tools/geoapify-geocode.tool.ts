import { Injectable } from '@nestjs/common';
import { BaseTool } from '../base-tool';
import { ToolResult, UserContext } from '../../../common/interfaces/tool.interface';
import { GeoapifyService } from '../../location/geoapify.service';

@Injectable()
export class GeoapifyGeocodeTool extends BaseTool {
  name = 'geoapify_geocode';
  description = 'Geocode addresses and resolve location coordinates';
  parameters = {
    type: 'object' as const,
    properties: {
      address: { type: 'string', description: 'Address to geocode' },
      type: { type: 'string', description: 'Geocoding type (forward/reverse)' },
    },
    required: ['address'],
  };

  constructor(private readonly geoapifyService: GeoapifyService) {
    super();
  }

  async execute(
    params: { address: string; type?: string }, 
    context: UserContext
  ): Promise<ToolResult> {
    try {
      if (!this.validateParams(params, ['address'])) {
        return this.createErrorResult('Missing required parameter: address');
      }

      console.log(`🗺️ Geocoding address: ${params.address}`);
      
      const geocodeResult = await this.geoapifyService.geocode(params.address);
      
      const result = this.createSuccessResult(geocodeResult, {
        toolName: 'geoapify_geocode',
        address: params.address,
        type: params.type,
        hasResult: !!geocodeResult,
      });

      this.logExecution(params, result);
      return result;
    } catch (error) {
      const errorResult = this.createErrorResult(`Geoapify geocoding failed: ${error.message}`);
      this.logExecution(params, errorResult);
      return errorResult;
    }
  }
}