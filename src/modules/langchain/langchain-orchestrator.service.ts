import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { DynamicTool } from '@langchain/core/tools';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ToolRegistry } from './tool-registry.service';
import { 
  TasteBotTool, 
  UserContext, 
  OrchestrationResult, 
  ChainResult 
} from '../../common/interfaces/tool.interface';

@Injectable()
export class LangChainOrchestrator {
  private llm: ChatOpenAI;
  private agent: AgentExecutor;

  constructor(
    private readonly configService: ConfigService,
    private readonly toolRegistry: ToolRegistry,
  ) {
    this.initializeLLM();
  }

  private initializeLLM(): void {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('llm.openai.apiKey'),
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
    });
  }

  async initializeAgent(): Promise<void> {
    const tools = this.createLangChainTools();
    
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are TasteBot, an AI cultural concierge that helps users discover personalized experiences based on their cultural tastes.

You have access to various tools for:
- Cultural intelligence (Qloo APIs)
- Location services (Foursquare, Geoapify)
- Search capabilities (Tavily, Serper)
- Web analysis (Firecrawl)

Always consider the user's cultural preferences and taste profile when making recommendations.
Be enthusiastic and personalized in your responses.
Use tools strategically to provide the most relevant and interesting recommendations.`],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ]);

    this.agent = await createOpenAIFunctionsAgent({
      llm: this.llm,
      tools,
      prompt,
    });
  }

  private createLangChainTools(): DynamicTool[] {
    const tasteBotTools = this.toolRegistry.getAllTools();
    
    return tasteBotTools.map(tool => new DynamicTool({
      name: tool.name,
      description: tool.description,
      func: async (input: string, context?: any) => {
        try {
          const params = JSON.parse(input);
          const result = await tool.execute(params, context?.userContext);
          return JSON.stringify(result);
        } catch (error) {
          console.error(`Tool ${tool.name} execution error:`, error);
          return JSON.stringify({
            success: false,
            error: error.message,
          });
        }
      },
    }));
  }

  async orchestrateTools(
    query: string, 
    context: UserContext
  ): Promise<OrchestrationResult> {
    try {
      if (!this.agent) {
        await this.initializeAgent();
      }

      const executor = new AgentExecutor({
        agent: this.agent,
        tools: this.createLangChainTools(),
        verbose: true,
        maxIterations: 5,
      });

      console.log(`🤖 Orchestrating tools for query: "${query}"`);
      
      const result = await executor.invoke({
        input: query,
        userContext: context,
      });

      return {
        success: true,
        response: result.output,
        toolsUsed: this.extractToolsUsed(result),
        data: result,
      };
    } catch (error) {
      console.error('LangChain orchestration error:', error);
      return {
        success: false,
        response: 'I encountered an issue processing your request. Please try again.',
        toolsUsed: [],
        error: error.message,
      };
    }
  }

  async executeToolChain(
    tools: TasteBotTool[], 
    context: UserContext
  ): Promise<ChainResult> {
    const startTime = Date.now();
    const results = [];

    for (const tool of tools) {
      try {
        console.log(`🔧 Executing tool: ${tool.name}`);
        const result = await tool.execute({}, context);
        results.push(result);
        
        if (!result.success) {
          console.warn(`Tool ${tool.name} failed:`, result.error);
        }
      } catch (error) {
        console.error(`Tool ${tool.name} execution error:`, error);
        results.push({
          success: false,
          error: error.message,
        });
      }
    }

    const executionTime = Date.now() - startTime;
    const successfulResults = results.filter(r => r.success);
    
    const finalResponse = this.synthesizeChainResponse(successfulResults);

    return {
      results,
      finalResponse,
      executionTime,
    };
  }

  private extractToolsUsed(result: any): string[] {
    // Extract tool names from LangChain execution result
    const toolsUsed = [];
    
    if (result.intermediateSteps) {
      for (const step of result.intermediateSteps) {
        if (step.action && step.action.tool) {
          toolsUsed.push(step.action.tool);
        }
      }
    }
    
    return toolsUsed;
  }

  private synthesizeChainResponse(results: any[]): string {
    if (results.length === 0) {
      return 'No successful tool executions to synthesize.';
    }

    // Simple synthesis - in practice, this would be more sophisticated
    const dataPoints = results.map(r => r.data).filter(Boolean);
    
    if (dataPoints.length === 0) {
      return 'Tools executed successfully but no data was returned.';
    }

    return `I've gathered information from ${results.length} sources to provide you with personalized recommendations.`;
  }

  async selectBestTools(query: string, availableTools: string[]): Promise<string[]> {
    try {
      const toolDescriptions = availableTools.map(toolName => {
        const tool = this.toolRegistry.getTool(toolName);
        return `${toolName}: ${tool?.description || 'No description'}`;
      }).join('\n');

      const selectionPrompt = `Given this user query: "${query}"

Available tools:
${toolDescriptions}

Select the 2-3 most relevant tools to answer this query. Return only the tool names as a JSON array.`;

      const response = await this.llm.invoke(selectionPrompt);
      const selectedTools = JSON.parse(response.content as string);
      
      return Array.isArray(selectedTools) ? selectedTools : [];
    } catch (error) {
      console.error('Tool selection error:', error);
      return availableTools.slice(0, 3); // Fallback to first 3 tools
    }
  }
}