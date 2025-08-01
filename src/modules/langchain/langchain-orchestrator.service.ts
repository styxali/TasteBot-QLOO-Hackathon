import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ToolRegistry } from './tool-registry.service';
import { OrchestrationResult, UserContext } from '../../common/interfaces/tool.interface';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains';

@Injectable()
export class LangChainOrchestrator {
  private readonly llm: ChatOpenAI;
  private readonly formatPrompt: PromptTemplate;

  constructor(
    private readonly configService: ConfigService,
    private readonly toolRegistry: ToolRegistry,
  ) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      temperature: 0.7,
      modelName: 'gpt-4',
    });

    this.formatPrompt = PromptTemplate.fromTemplate(`
Format the following data into a clear, engaging Telegram message. 
Use Markdown formatting and emojis appropriately.
For venues/places: Include name, rating, location, price, and other key details in a readable way.
For search results: Present key information clearly with proper sections and highlights.
Use bullet points and sections to organize information.
Keep it concise but informative.

Data to format:
{data}

Tool used: {toolName}

Use this format for venues:
✨ *Venue Name*
📍 Location
⭐️ Rating (if available)
💰 Price (if available)
🕒 Hours (if available)
📝 Description (if available)

For lists, number the items and keep each entry concise.
`);
  }

  async orchestrateTools(query: string, context: UserContext): Promise<OrchestrationResult> {
    const startTime = Date.now();
    
    try {
      const selectedTool = this.selectTool(query);
      
      if (selectedTool) {
        const params = this.extractParams(query, selectedTool.name);
        
        try {
          const result = await selectedTool.execute(params, context);
          
          if (result.success) {
            let formattedResult;
            if (typeof result.data === 'string' && result.data.includes('API key is invalid')) {
              formattedResult = '⚠️ Sorry, there seems to be an issue with the API connection. Please try again later or contact support if this persists.';
            } else {
              formattedResult = await this.formatResult(result.data, selectedTool.name);
            }
            
            return {
              success: true,
              result: formattedResult,
              response: formattedResult,
              toolsUsed: [selectedTool.name],
              executionTime: Date.now() - startTime,
              data: result.data,
            };
          }
        } catch (toolError) {
          console.error(`Tool execution error (${selectedTool.name}):`, toolError);
          return {
            success: false,
            result: '⚠️ Sorry, I encountered an error while fetching the data. Please try again or rephrase your request.',
            response: '⚠️ Sorry, I encountered an error while fetching the data. Please try again or rephrase your request.',
            toolsUsed: [selectedTool.name],
            executionTime: Date.now() - startTime,
            error: toolError.message,
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

  private async formatResult(data: any, toolName: string): Promise<string> {
    if (!data) return 'No results found.';

    try {
      // Handle error messages or invalid data
      if (typeof data === 'string') {
        if (data.includes('error') || data.includes('invalid')) {
          return `⚠️ ${data}`;
        }
        try {
          data = JSON.parse(data);
        } catch {
          return data;
        }
      }

      // Use LangChain to format the result
      const chain = new LLMChain({ llm: this.llm, prompt: this.formatPrompt });
      const response = await chain.call({
        data: JSON.stringify(data, null, 2),
        toolName,
      });

      const formattedText = response.text || this.fallbackFormat(data);
      
      // Ensure the response is not JSON
      if (formattedText.trim().startsWith('{') || formattedText.trim().startsWith('[')) {
        return this.fallbackFormat(data);
      }

      return formattedText;
    } catch (error) {
      console.error('Error formatting result with LLM:', error);
      // Fallback to basic formatting if LLM fails
      return this.fallbackFormat(data);
    }
  }

  private getFallbackResponse(query: string, startTime: number): OrchestrationResult {
    return {
      success: false,
      result: 'I couldn\'t find what you\'re looking for. Please try a different query.',
      response: 'I couldn\'t find what you\'re looking for. Please try a different query.',
      toolsUsed: [],
      executionTime: Date.now() - startTime,
    };
  }

  private fallbackFormat(data: any): string {
    if (!data) return 'No results found.';
    
    if (Array.isArray(data)) {
      if (data.length === 0) return 'No results found.';
      
      // Format array of venues or search results
      return data.map((item, index) => {
        if (item.name) {
          // Venue formatting
          const parts = [];
          parts.push(`${index + 1}. *${item.name}*`);
          if (item.rating) parts.push(`⭐️ ${item.rating}`);
          if (item.address) parts.push(`📍 ${item.address}`);
          if (item.price) parts.push(`💰 ${item.price}`);
          return parts.join('\n');
        } else {
          // Generic result formatting with emojis for key fields
          return this.formatGenericResult(item, index + 1);
        }
      }).join('\n\n');
    }
    
    // Single venue or result
    if (typeof data === 'object') {
      if (data.name) {
        // Format venue
        const parts = [];
        parts.push(`✨ *${data.name}*`);
        if (data.rating) parts.push(`⭐️ Rating: ${data.rating}`);
        if (data.address) parts.push(`📍 ${data.address}`);
        if (data.price) parts.push(`💰 ${data.price}`);
        if (data.hours) parts.push(`🕒 ${data.hours}`);
        if (data.description) parts.push(`\n📝 ${data.description}`);
        return parts.join('\n');
      }
      
      // Generic object formatting
      return this.formatGenericResult(data);
    }
    
    return String(data);
  }

  private formatGenericResult(data: any, index?: number): string {
    try {
      const prefix = index ? `${index}. ` : '';
      return prefix + JSON.stringify(data, null, 2)
        .replace(/"name":/g, '🏷️ "name":')
        .replace(/"rating":/g, '⭐️ "rating":')
        .replace(/"address":/g, '📍 "address":')
        .replace(/"price":/g, '💰 "price":')
        .replace(/"description":/g, '📝 "description":')
        .replace(/"hours":/g, '🕒 "hours":')
        .replace(/"website":/g, '🌐 "website":')
        .replace(/"phone":/g, '📞 "phone":');
    } catch (e) {
      return String(data);
    }
  }
}
