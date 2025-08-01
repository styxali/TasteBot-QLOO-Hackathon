import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ToolRegistry } from './tool-registry.service';
import { OrchestrationResult, UserContext } from '../../common/interfaces/tool.interface';

@Injectable()
export class LangChainOrchestrator {
  constructor(
    private readonly configService: ConfigService,
    private readonly toolRegistry: ToolRegistry,
  ) {}

  async orchestrateTools(query: string, context: UserContext): Promise<OrchestrationResult> {
    const startTime = Date.now();
    
    try {
      // Simple tool selection based on query keywords
      const selectedTool = this.selectTool(query);
      
      if (selectedTool) {
        const params = this.extractParams(query, selectedTool.name);
        const result = await selectedTool.execute(params, context);
        
        if (result.success) {
          return {
            success: true,
            result: this.formatResult(result.data, selectedTool.name),
            response: this.formatResult(result.data, selectedTool.name),
            toolsUsed: [selectedTool.name],
            executionTime: Date.now() - startTime,
            data: result.data,
          };
        }
      }

      return this.getFallbackResponse(query, startTime);
    } catch (error) {
      console.error('Orchestration error:', error);
      return {
        success: false,
        result: 'I encountered an issue processing your request. Please try again.',
        response: 'I encountered an issue processing your request. Please try again.',
        toolsUsed: [],
        executionTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  private selectTool(query: string): any {
    const queryLower = query.toLowerCase();
    const tools = this.toolRegistry.getAllTools();
    
    // Simple keyword-based tool selection
    if (queryLower.includes('venue') || queryLower.includes('restaurant') || queryLower.includes('bar')) {
      return tools.find(t => t.name === 'foursquare_venue');
    }
    if (queryLower.includes('event') || queryLower.includes('happening')) {
      return tools.find(t => t.name === 'serper_events');
    }
    if (queryLower.includes('search') || queryLower.includes('find')) {
      return tools.find(t => t.name === 'tavily_search');
    }
    if (queryLower.includes('taste') || queryLower.includes('recommend')) {
      return tools.find(t => t.name === 'qloo_insights');
    }
    
    // Default to Qloo insights
    return tools.find(t => t.name === 'qloo_insights');
  }

  private extractParams(query: string, toolName: string): any {
    const params: any = {};
    
    switch (toolName) {
      case 'foursquare_venue':
        params.query = query;
        params.location = 'New York'; // Default location
        break;
      case 'serper_events':
        params.location = 'New York';
        break;
      case 'tavily_search':
        params.query = query;
        break;
      case 'qloo_insights':
        params.query = query;
        break;
      default:
        params.query = query;
    }
    
    return params;
  }

  private formatResult(data: any, toolName: string): string {
    if (!data) return 'No results found.';
    
    if (Array.isArray(data)) {
      if (data.length === 0) return 'No results found.';
      
      switch (toolName) {
        case 'foursquare_venue':
          return `Found ${data.length} venues:\n${data.slice(0, 3).map((venue: any) => 
            `• ${venue.name} - ${venue.location?.formatted_address || 'Address not available'}`
          ).join('\n')}`;
        case 'qloo_insights':
          return `Found ${data.length} cultural matches:\n${data.slice(0, 3).map((item: any) => 
            `• ${item.name} (${item.type})`
          ).join('\n')}`;
        default:
          return `Found ${data.length} results.`;
      }
    }
    
    return JSON.stringify(data).substring(0, 500);
  }

  private getFallbackResponse(query: string, startTime: number): OrchestrationResult {
    return {
      success: true,
      result: `I understand you're looking for "${query}". Let me help you find something great!`,
      response: `I understand you're looking for "${query}". Let me help you find something great!`,
      toolsUsed: ['fallback'],
      executionTime: Date.now() - startTime,
      data: { query },
    };
  }
}