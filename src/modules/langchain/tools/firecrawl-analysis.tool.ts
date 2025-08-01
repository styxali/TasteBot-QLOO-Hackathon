import { Injectable } from '@nestjs/common';
import { BaseTool } from '../base-tool';
import { ToolResult, UserContext } from '../../../common/interfaces/tool.interface';
import { FirecrawlService } from '../../web/firecrawl.service';

@Injectable()
export class FirecrawlAnalysisTool extends BaseTool {
  name = 'firecrawl_analysis';
  description = 'Extract and analyze content from websites for venue insights';
  parameters = {
    url: { type: 'string', required: true, description: 'URL to scrape and analyze' },
    analysisType: { type: 'string', required: false, description: 'Type of analysis (venue/taste/general)' },
  };

  constructor(private readonly firecrawlService: FirecrawlService) {
    super();
  }

  async execute(
    params: { url: string; analysisType?: string }, 
    context: UserContext
  ): Promise<ToolResult> {
    try {
      if (!this.validateParams(params, ['url'])) {
        return this.createErrorResult('Missing required parameter: url');
      }

      console.log(`🕷️ Analyzing website: ${params.url}`);
      
      let analysisResult;
      
      switch (params.analysisType) {
        case 'venue':
          analysisResult = await this.firecrawlService.extractVenueInfo(params.url);
          break;
        case 'taste':
          analysisResult = await this.firecrawlService.analyzeTasteProfile(params.url);
          break;
        default:
          analysisResult = await this.firecrawlService.scrapeUrl(params.url);
          break;
      }
      
      const result = this.createSuccessResult(analysisResult, {
        toolName: 'firecrawl_analysis',
        url: params.url,
        analysisType: params.analysisType || 'general',
        hasContent: !!analysisResult,
      });

      this.logExecution(params, result);
      return result;
    } catch (error) {
      const errorResult = this.createErrorResult(`Firecrawl analysis failed: ${error.message}`);
      this.logExecution(params, errorResult);
      return errorResult;
    }
  }
}