export interface TasteBotTool {
  name: string;
  description: string;
  parameters: ToolParameters;
  execute(params: any, context: UserContext): Promise<ToolResult>;
}

export interface ToolParameters {
  type: 'object';
  properties: Record<string, ParameterDefinition>;
  required: string[];
}

export interface ParameterDefinition {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface UserContext {
  userId: string;
  telegramId: string;
  currentNode?: string;
  conversationHistory: Message[];
  tasteProfile: any;
  sessionData: Record<string, any>;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'bot';
  metadata?: Record<string, any>;
}

export interface OrchestrationResult {
  success: boolean;
  response: string;
  toolsUsed: string[];
  data?: any;
  error?: string;
}

export interface ChainResult {
  results: ToolResult[];
  finalResponse: string;
  executionTime: number;
}