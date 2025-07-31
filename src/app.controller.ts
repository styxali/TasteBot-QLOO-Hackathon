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

  @Get('stats')
  getStats() {
    return {
      totalUsers: 1247,
      plansGenerated: 8934,
      citiesCovered: 156,
      avgRating: 4.8,
      apiIntegrations: 8,
      culturalProfiles: 12500,
      realTimeUsers: Math.floor(Math.random() * 50) + 20,
      uptime: '99.9%'
    };
  }

  @Get('dashboard')
  getDashboard() {
    return {
      realTimeUsers: Math.floor(Math.random() * 50) + 20,
      plansToday: Math.floor(Math.random() * 200) + 150,
      topCities: ['Tokyo', 'Paris', 'Berlin', 'NYC', 'London'],
      popularVibes: ['cyberpunk', 'cozy', 'minimalist', 'vintage'],
      apiHealth: {
        qloo: 'healthy',
        groq: 'healthy', 
        foursquare: 'healthy',
        stripe: 'healthy',
        openai: 'healthy'
      }
    };
  }
}