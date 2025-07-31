import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('api/telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  async handleWebhook(@Body() update: any) {
    try {
      await this.telegramService.processUpdate(update);
      return { status: 'ok' };
    } catch (error) {
      console.error('Webhook error:', error);
      return { status: 'error', message: error.message };
    }
  }
}