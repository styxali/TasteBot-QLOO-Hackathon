import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PlanService } from './plan.service';

@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post('generate')
  async generatePlan(@Body() body: { telegramId: string; message: string }) {
    const plan = await this.planService.generatePlanForUser(body.telegramId, body.message);
    
    if (!plan) {
      return { error: 'Unable to generate plan or insufficient credits' };
    }

    return {
      success: true,
      plan: this.planService.formatPlanForTelegram(plan),
      activities: plan.activities,
    };
  }

  @Get('quick/:telegramId/:type')
  async getQuickPlan(
    @Param('telegramId') telegramId: string,
    @Param('type') type: 'vibe' | 'nearby' | 'random'
  ) {
    const plan = await this.planService.getQuickPlan(telegramId, type);
    
    if (!plan) {
      return { error: 'Unable to generate plan or insufficient credits' };
    }

    return {
      success: true,
      plan: this.planService.formatPlanForTelegram(plan),
      activities: plan.activities,
    };
  }

  @Get('validate-credits/:telegramId')
  async validateCredits(@Param('telegramId') telegramId: string) {
    const hasCredits = await this.planService.validateUserCredits(telegramId);
    return { hasCredits };
  }
}