import { Module } from '@nestjs/common';
import { FirecrawlService } from './firecrawl.service';
import { ApifyService } from './apify.service';

@Module({
  providers: [FirecrawlService, ApifyService],
  exports: [FirecrawlService, ApifyService],
})
export class WebModule {}