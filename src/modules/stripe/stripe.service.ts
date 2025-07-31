import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class StripeService {
  private secretKey: string;
  private webhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.secretKey = this.configService.get<string>('stripe.secretKey');
    this.webhookSecret = this.configService.get<string>('stripe.webhookSecret');
  }

  async createCheckoutSession(telegramId: string, credits: number = 50): Promise<string> {
    const price = this.calculatePrice(credits);
    
    try {
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'payment_method_types[]': 'card',
          'line_items[0][price_data][currency]': 'usd',
          'line_items[0][price_data][product_data][name]': `${credits} TasteBot Credits`,
          'line_items[0][price_data][unit_amount]': (price * 100).toString(),
          'line_items[0][quantity]': '1',
          'mode': 'payment',
          'success_url': 'https://t.me/TasteBotBot?start=payment_success',
          'cancel_url': 'https://t.me/TasteBotBot?start=payment_cancelled',
          'metadata[telegram_id]': telegramId,
          'metadata[credits]': credits.toString(),
        }),
      });

      const session = await response.json();
      
      if (session.error) {
        throw new Error(session.error.message);
      }

      return session.url;
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async processWebhook(payload: any, signature: string): Promise<void> {
    try {
      // In a real implementation, you'd verify the webhook signature
      // For MVP, we'll skip signature verification
      
      if (payload.type === 'checkout.session.completed') {
        const session = payload.data.object;
        const telegramId = session.metadata.telegram_id;
        const credits = parseInt(session.metadata.credits);

        if (telegramId && credits) {
          await this.userService.addCredits(telegramId, credits);
          console.log(`Added ${credits} credits to user ${telegramId}`);
        }
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  private calculatePrice(credits: number): number {
    // Simple pricing: $5 for 50 credits, $10 for 100 credits
    const priceMap: Record<number, number> = {
      50: 5,
      100: 10,
      200: 18,
    };

    return priceMap[credits] || Math.ceil(credits * 0.1);
  }

  async getPaymentHistory(telegramId: string): Promise<any[]> {
    // Placeholder for payment history
    // Would query Stripe API for customer payments
    return [];
  }

  generatePaymentLink(telegramId: string, credits: number = 50): string {
    // For MVP, return a simple payment link
    // In production, this would create a proper Stripe checkout session
    return `https://buy.stripe.com/test_payment?telegram_id=${telegramId}&credits=${credits}`;
  }

  async refundPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.stripe.com/v1/refunds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'payment_intent': paymentIntentId,
        }),
      });

      const refund = await response.json();
      return refund.status === 'succeeded';
    } catch (error) {
      console.error('Refund error:', error);
      return false;
    }
  }
}