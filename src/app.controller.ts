import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'TasteBot API',
    };
  }

  @Post('webhook/test')
  testWebhook(@Body() body: any) {
    console.log('Test webhook received:', body);
    return { status: 'received', data: body };
  }
}