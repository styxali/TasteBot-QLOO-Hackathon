import { Injectable } from '@nestjs/common';
import { BaseTool } from '../base-tool';
import { ToolResult, UserContext } from '../../../common/interfaces/tool.interface';
import { QlooService } from '../../qloo/qloo.service';

@Injectable()
export class QlooTagsTool extends BaseTool {
  name = 'qloo_tags';
  description = 'Get tags and categories for entities to understand preferences';
  parameters = {
    type: 'object' as const,
    properties: {
      entityId: { type: 'string', description: 'Entity ID to get tags for' },
    },
    required: ['entityId'],
  };

  constructor(private readonly qlooService: QlooService) {
    super();
  }

  async execute(params: { entityId: string }, context: UserContext): Promise<ToolResult> {
    try {
      if (!this.validateParams(params, ['entityId'])) {
        return this.createErrorResult('Missing required parameter: entityId');
      }

      console.log(`🏷️ Getting tags for entity: ${params.entityId}`);
      
      const tags = await this.qlooService.getTags(params.entityId);
      
      const result = this.createSuccessResult(tags, {
        toolName: 'qloo_tags',
        entityId: params.entityId,
        tagCount: tags.length,
      });

      this.logExecution(params, result);
      return result;
    } catch (error) {
      const errorResult = this.createErrorResult(`Qloo tags failed: ${error.message}`);
      this.logExecution(params, errorResult);
      return errorResult;
    }
  }
}