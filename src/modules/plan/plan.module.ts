import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { QlooModule } from '../qloo/qloo.module';
import { LlmModule } from '../llm/llm.module';
import { LocationModule } from '../location/location.module';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [QlooModule, LlmModule, LocationModule, UserModule, SessionModule],
  controllers: [PlanController],
  providers: [PlanService],
  exports: [PlanService],
})
export class PlanModule {}