import { Module } from '@nestjs/common';
import { TavilyService } from './tavily.service';
import { SerperService } from './serper.service';
import { JinaService } from './jina.service';

@Module({
  providers: [TavilyService, SerperService, JinaService],
  exports: [TavilyService, SerperService, JinaService],
})
export class SearchModule {}