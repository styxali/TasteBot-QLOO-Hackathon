import { Controller, Post, Body, Get } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) { }

  @Post('webhook')
  async handleWebhook(@Body() update: any) {
    console.log('🔥 WEBHOOK RECEIVED:', JSON.stringify(update, null, 2));

    try {
      await this.telegramService.processUpdate(update);
      console.log('✅ Webhook processed successfully');
      return { status: 'ok' };
    } catch (error) {
      console.error('❌ Webhook error:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Add GET method for testing
  @Get('webhook')
  testWebhook() {
    console.log('🧪 GET request to webhook endpoint');
    return { message: 'Webhook endpoint is working! Use POST for actual webhooks.' };
  }
}