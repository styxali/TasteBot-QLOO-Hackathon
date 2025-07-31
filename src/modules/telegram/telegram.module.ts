import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { UserModule } from '../user/user.module';
import { PlanModule } from '../plan/plan.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [UserModule, PlanModule, SessionModule],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}