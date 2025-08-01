import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { PlanManagementService } from './plan-management.service';
import { QlooModule } from '../qloo/qloo.module';
import { LlmModule } from '../llm/llm.module';
import { LocationModule } from '../location/location.module';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [QlooModule, LlmModule, LocationModule, UserModule, SessionModule, MemoryModule],
  controllers: [PlanController],
  providers: [PlanService, PlanManagementService],
  exports: [PlanService, PlanManagementService],
})
export class PlanModule {}