import { Module } from '@nestjs/common';
import { LangChainOrchestrator } from './langchain-orchestrator.service';
import { ToolRegistry } from './tool-registry.service';

@Module({
  providers: [LangChainOrchestrator, ToolRegistry],
  exports: [LangChainOrchestrator, ToolRegistry],
})
export class LangChainModule {}