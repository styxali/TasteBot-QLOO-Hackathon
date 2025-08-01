import { Injectable } from '@nestjs/common';
import { BaseTool } from '../base-tool';
import { ToolResult, UserContext } from '../../../common/interfaces/tool.interface';
import { TavilyService } from '../../search/tavily.service';

@Injectable()
export class TavilySearchTool extends BaseTool {
  name = 'tavily_search';
  description = 'AI-powered search for real-time information and insights';
  parameters = {
    query: { type: 'string', required: true, description: 'Search query' },
    searchDepth: { type: 'string', required: false, description: 'Search depth (basic/advanced)' },
    includeImages: { type: 'boolean', required: false, description: 'Include images in results' },
    maxResults: { type: 'number', required: false, description: 'Maximum number of results' },
  };

  constructor(private readonly tavilyService: TavilyService) {
    super();
  }

  async execute(
    params: { 
      query: string; 
      searchDepth?: 'basic' | 'advanced'; 
      includeImages?: boolean; 
      maxResults?: number 
    }, 
    context: UserContext
  ): Promise<ToolResult> {
    try {
      if (!this.validateParams(params, ['query'])) {
        return this.createErrorResult('Missing required parameter: query');
      }

      console.log(`🔍 Tavily search: ${params.query}`);
      
      const searchResults = await this.tavilyService.search(
        params.query,
        params.searchDepth || 'basic',
        params.includeImages || false,
        true,
        params.maxResults || 5
      );
      
      const result = this.createSuccessResult(searchResults, {
        toolName: 'tavily_search',
        query: params.query,
        searchDepth: params.searchDepth,
        resultCount: searchResults.results.length,
        responseTime: searchResults.response_time,
      });

      this.logExecution(params, result);
      return result;
    } catch (error) {
      const errorResult = this.createErrorResult(`Tavily search failed: ${error.message}`);
      this.logExecution(params, errorResult);
      return errorResult;
    }
  }
}