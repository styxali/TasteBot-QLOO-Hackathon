import { Controller, Post, Body, Headers } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature: string,
  ) {
    // Stripe webhook handler will be implemented in later tasks
    return { status: 'ok' };
  }
}