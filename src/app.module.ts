import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';

// Feature modules
import { UserModule } from './modules/user/user.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { PlanModule } from './modules/plan/plan.module';
import { QlooModule } from './modules/qloo/qloo.module';
import { LlmModule } from './modules/llm/llm.module';
import { LocationModule } from './modules/location/location.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { SessionModule } from './modules/session/session.module';
import { LangChainModule } from './modules/langchain/langchain.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { MemoryModule } from './modules/memory/memory.module';
import { MultimodalModule } from './modules/multimodal/multimodal.module';
import { WebModule } from './modules/web/web.module';
import { SearchModule } from './modules/search/search.module';
import { CulturalModule } from './modules/cultural/cultural.module';
import { ErrorHandlingModule } from './modules/error-handling/error-handling.module';

@Module({
  imports: [
    // Global modules
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    PrismaModule,
    
    // Feature modules
    UserModule,
    TelegramModule,
    PlanModule,
    QlooModule,
    LlmModule,
    LocationModule,
    StripeModule,
    SessionModule,
    LangChainModule,
    NavigationModule,
    MemoryModule,
    MultimodalModule,
    WebModule,
    SearchModule,
    CulturalModule,
    ErrorHandlingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
