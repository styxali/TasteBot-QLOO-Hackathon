import { Injectable } from '@nestjs/common';
import { BaseTool } from '../base-tool';
import { ToolResult, UserContext } from '../../../common/interfaces/tool.interface';
import { SerperService } from '../../search/serper.service';

@Injectable()
export class SerperEventsTool extends BaseTool {
  name = 'serper_events';
  description = 'Search for local events and happenings using Google search';
  parameters = {
    location: { type: 'string', required: true, description: 'Location to search for events' },
    eventType: { type: 'string', required: false, description: 'Type of events to search for' },
  };

  constructor(private readonly serperService: SerperService) {
    super();
  }

  async execute(
    params: { location: string; eventType?: string }, 
    context: UserContext
  ): Promise<ToolResult> {
    try {
      if (!this.validateParams(params, ['location'])) {
        return this.createErrorResult('Missing required parameter: location');
      }

      console.log(`🎭 Searching events in ${params.location}${params.eventType ? ` (${params.eventType})` : ''}`);
      
      const events = await this.serperService.searchEvents(params.location, params.eventType);
      
      const result = this.createSuccessResult(events, {
        toolName: 'serper_events',
        location: params.location,
        eventType: params.eventType,
        resultCount: events.length,
      });

      this.logExecution(params, result);
      return result;
    } catch (error) {
      const errorResult = this.createErrorResult(`Serper events search failed: ${error.message}`);
      this.logExecution(params, errorResult);
      return errorResult;
    }
  }
}