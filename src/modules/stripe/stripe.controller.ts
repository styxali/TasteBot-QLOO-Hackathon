import { Controller, Post, Body, Headers, Get, Param } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('api/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      await this.stripeService.processWebhook(payload, signature);
      return { status: 'ok' };
    } catch (error) {
      console.error('Stripe webhook error:', error);
      return { status: 'error', message: error.message };
    }
  }

  @Post('create-checkout')
  async createCheckout(@Body() body: { telegramId: string; credits?: number }) {
    try {
      const url = await this.stripeService.createCheckoutSession(
        body.telegramId,
        body.credits || 50
      );
      
      return { success: true, url };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('payment-link/:telegramId/:credits')
  async getPaymentLink(
    @Param('telegramId') telegramId: string,
    @Param('credits') credits: string
  ) {
    const link = this.stripeService.generatePaymentLink(
      telegramId,
      parseInt(credits) || 50
    );
    
    return { link };
  }

  @Get('history/:telegramId')
  async getPaymentHistory(@Param('telegramId') telegramId: string) {
    const history = await this.stripeService.getPaymentHistory(telegramId);
    return { history };
  }
}