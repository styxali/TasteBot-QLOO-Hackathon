import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { ResponseFormatterService } from './response-formatter.service';
import { ErrorLoggerService } from '../../common/logger/error-logger.service';
import { UserModule } from '../user/user.module';
import { PlanModule } from '../plan/plan.module';
import { SessionModule } from '../session/session.module';
import { NavigationModule } from '../navigation/navigation.module';
import { LangChainModule } from '../langchain/langchain.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [
    UserModule,
    PlanModule,
    SessionModule,
    NavigationModule,
    LangChainModule,
    MemoryModule
  ],
  controllers: [TelegramController],
  providers: [TelegramService, ResponseFormatterService, ErrorLoggerService],
  exports: [TelegramService],
})
export class TelegramModule { }