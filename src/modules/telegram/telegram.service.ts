import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { PlanService } from '../plan/plan.service';

@Injectable()
export class TelegramService {
  private botToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly planService: PlanService,
  ) {
    this.botToken = this.configService.get<string>('telegram.botToken');
  }

  async processUpdate(update: any): Promise<void> {
    if (update.message) {
      await this.handleMessage(update.message);
    }
  }

  private async handleMessage(message: any): Promise<void> {
    const telegramId = message.from.id.toString();
    const user = await this.userService.findOrCreate(telegramId);

    if (message.text === '/start') {
      await this.sendWelcomeMessage(message.chat.id);
      return;
    }

    if (message.text === '/credits') {
      const balance = await this.userService.checkBalance(telegramId);
      await this.sendMessage(message.chat.id, `You have ${balance} credits remaining.`);
      return;
    }

    // Handle regular messages
    if (user.credits > 0) {
      await this.userService.deductCredits(telegramId);
      await this.sendMessage(message.chat.id, `Processing your request... (${user.credits - 1} credits remaining)`);
    } else {
      await this.sendMessage(message.chat.id, 'You\'re out of credits. Use /buy to get more!');
    }
  }

  private async sendWelcomeMessage(chatId: number): Promise<void> {
    const welcomeText = `👋 Welcome to TasteBot! Your AI concierge for taste-based planning 🎨🗺️

🧪 You have 5 free credits to explore. Type something like:
"I love Euphoria, jazz, and sushi in Lisbon."

📍 Or try these quick-start options:`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔮 Get a vibe plan', callback_data: 'vibe_plan' },
          { text: '📸 Send a photo', callback_data: 'photo_input' },
        ],
        [
          { text: '🎙️ Voice input', callback_data: 'voice_input' },
          { text: '💳 Buy credits', callback_data: 'buy_credits' },
        ],
      ],
    };

    await this.sendMessage(chatId, welcomeText, keyboard);
  }

  private async sendMessage(chatId: number, text: string, replyMarkup?: any): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...(replyMarkup && { reply_markup: replyMarkup }),
    };

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  formatPlanResponse(plan: any): string {
    if (!plan || !plan.activities) return 'No plan generated.';

    let response = `🎯 Here's your personalized plan:\n\n`;
    
    plan.activities.forEach((activity: any, index: number) => {
      response += `${index + 1}. ${activity.emoji || '📍'} ${activity.name}\n`;
      if (activity.description) {
        response += `   ${activity.description}\n`;
      }
      response += '\n';
    });

    return response;
  }

  createQuickStartKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🔮 Another plan', callback_data: 'new_plan' },
          { text: '📍 Nearby options', callback_data: 'nearby' },
        ],
        [
          { text: '💳 Buy credits', callback_data: 'buy_credits' },
        ],
      ],
    };
  }
}