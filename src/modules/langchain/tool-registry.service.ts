import { Injectable } from '@nestjs/common';
import { TasteBotTool } from '../../common/interfaces/tool.interface';

@Injectable()
export class ToolRegistry {
  private tools = new Map<string, TasteBotTool>();

  registerTool(tool: TasteBotTool): void {
    this.tools.set(tool.name, tool);
    console.log(`🔧 Registered tool: ${tool.name}`);
  }

  getTool(name: string): TasteBotTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): TasteBotTool[] {
    return Array.from(this.tools.values());
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  getToolsForCategory(category: string): TasteBotTool[] {
    return this.getAllTools().filter(tool => 
      tool.name.startsWith(category) || 
      tool.description.toLowerCase().includes(category.toLowerCase())
    );
  }

  searchTools(query: string): TasteBotTool[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTools().filter(tool =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery)
    );
  }
}