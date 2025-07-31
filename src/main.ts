import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;

  // Enable CORS for development
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api', {
    exclude: ['health', '/'],
  });

  console.log(`🚀 TasteBot API starting on port ${port}`);
  console.log(`📱 Telegram webhook: http://localhost:${port}/api/telegram/webhook`);
  console.log(`💳 Stripe webhook: http://localhost:${port}/api/stripe/webhook`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`🔧 Environment: ${configService.get('nodeEnv')}`);
  console.log(`🤖 Bot token configured: ${!!configService.get('telegram.botToken')}`);
  
  // Log all incoming requests for debugging
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
  });

  await app.listen(port);
}

bootstrap().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});