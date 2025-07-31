import { TasteBotTool, ToolResult, UserContext } from '../../common/interfaces/tool.interface';

export abstract class BaseTool implements TasteBotTool {
  abstract name: string;
  abstract description: string;
  abstract parameters: any;

  abstract execute(params: any, context: UserContext): Promise<ToolResult>;

  protected createSuccessResult(data: any, metadata?: Record<string, any>): ToolResult {
    return {
      success: true,
      data,
      metadata,
    };
  }

  protected createErrorResult(error: string, metadata?: Record<string, any>): ToolResult {
    return {
      success: false,
      error,
      metadata,
    };
  }

  protected validateParams(params: any, required: string[]): boolean {
    for (const field of required) {
      if (!params[field]) {
        return false;
      }
    }
    return true;
  }

  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  protected logExecution(params: any, result: ToolResult): void {
    console.log(`🔧 Tool ${this.name} executed:`, {
      params: JSON.stringify(params).substring(0, 100),
      success: result.success,
      error: result.error,
    });
  }
}