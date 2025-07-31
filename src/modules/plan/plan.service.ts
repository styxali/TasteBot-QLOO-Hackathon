import { Injectable } from '@nestjs/common';
import { QlooService } from '../qloo/qloo.service';
import { LlmService } from '../llm/llm.service';
import { LocationService } from '../location/location.service';
import { UserService } from '../user/user.service';

export interface PlanActivity {
  name: string;
  description: string;
  address: string;
  category: string;
  emoji: string;
  rating?: number;
}

export interface GeneratedPlan {
  activities: PlanActivity[];
  summary: string;
  location: string;
  creditsUsed: number;
}

@Injectable()
export class PlanService {
  constructor(
    private readonly qlooService: QlooService,
    private readonly llmService: LlmService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
  ) {}

  async generatePlanForUser(telegramId: string, userMessage: string): Promise<GeneratedPlan | null> {
    // Check user credits
    const user = await this.userService.findByTelegramId(telegramId);
    if (!user || user.credits < 1) {
      return null;
    }

    try {
      console.log(`🎯 Generating plan for: "${userMessage}"`);
      
      // Get user taste profile
      const tasteProfile = await this.userService.getTasteProfile(telegramId);
      console.log('👤 User taste profile:', tasteProfile);

      // Create enhanced prompt with user preferences
      const enhancedPrompt = `Create a personalized experience plan based on this request: "${userMessage}"

User's taste profile: ${tasteProfile.keywords?.join(', ') || 'No specific preferences yet'}

Generate a plan with 3-4 specific recommendations including:
- Venue names (can be creative/realistic)
- Brief descriptions
- Addresses or areas
- Why it matches their taste

Format as a numbered list with emojis. Be enthusiastic and specific!

Example format:
1. 🎵 Blue Note Jazz Club - Intimate jazz venue with craft cocktails, perfect for hip hop fans who appreciate musical artistry
2. 🥩 Urban Steakhouse - Modern steakhouse with hip hop playlist and urban atmosphere
3. 🍸 Rooftop Lounge - Trendy spot with city views and DJ sets

Make it feel personal and exciting!`;

      // Generate plan using LLM
      const llmResponse = await this.llmService.generateResponse(enhancedPrompt);
      console.log('🤖 LLM Response:', llmResponse.content);

      if (!llmResponse.content || llmResponse.content.includes('trouble connecting')) {
        console.error('LLM failed to generate proper response');
        return null;
      }

      // Parse activities from plan
      const activities = this.extractActivitiesFromPlan(llmResponse.content, []);

      // If no activities extracted, create some based on the message
      if (activities.length === 0) {
        activities.push(...this.createFallbackActivities(userMessage, tasteProfile));
      }

      // Deduct credit ONLY after successful generation
      await this.userService.deductCredits(telegramId, 1);
      console.log(`💳 Deducted 1 credit from user ${telegramId}`);

      return {
        activities,
        summary: llmResponse.content,
        location: this.extractLocationFromMessage(userMessage) || 'Your area',
        creditsUsed: 1,
      };

    } catch (error) {
      console.error('Plan generation error:', error);
      return null;
    }
  }

  private extractLocationFromMessage(message: string): string | null {
    const locationPattern = /\b(in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/i;
    const match = message.match(locationPattern);
    return match ? match[2] : null;
  }

  private createFallbackActivities(userMessage: string, tasteProfile: any): PlanActivity[] {
    const keywords = tasteProfile.keywords || [];
    const messageWords = userMessage.toLowerCase();
    
    const activities: PlanActivity[] = [];
    
    // Create activities based on keywords
    if (keywords.includes('hip hop') || messageWords.includes('hip hop')) {
      activities.push({
        name: 'Underground Hip Hop Lounge',
        description: 'Authentic hip hop venue with live DJ sets and urban atmosphere',
        address: 'Downtown Arts District',
        category: 'nightlife',
        emoji: '🎤',
        rating: 4.5
      });
    }
    
    if (keywords.includes('steak') || messageWords.includes('steak')) {
      activities.push({
        name: 'Prime Cut Steakhouse',
        description: 'Premium steakhouse with modern ambiance and craft cocktails',
        address: 'Uptown District',
        category: 'restaurant',
        emoji: '🥩',
        rating: 4.7
      });
    }
    
    // Add a generic third option
    activities.push({
      name: 'Rooftop Social',
      description: 'Trendy rooftop bar with city views and eclectic music',
      address: 'City Center',
      category: 'bar',
      emoji: '🌃',
      rating: 4.3
    });
    
    return activities;
  }

  private extractActivitiesFromPlan(planText: string, venues: any[]): PlanActivity[] {
    const activities: PlanActivity[] = [];
    
    // Look for numbered items (with or without emojis)
    const lines = planText.split('\n');
    
    for (const line of lines) {
      // Match patterns like "1. Blue Note Jazz Club - Description" or "1. Name"
      const match = line.match(/^\d+\.\s*(.+?)(?:\s*-\s*(.+))?$/);
      
      if (match) {
        let name = match[1].trim();
        const description = match[2] || `Great ${name.toLowerCase()} experience`;
        
        // Remove any emojis from name
        name = name.replace(/[^\x20-\x7E]/g, '').trim();
        
        if (name.length > 0) {
          activities.push({
            name,
            description: description.replace(/[^\x20-\x7E]/g, '').trim(),
            address: this.extractAddressFromDescription(description),
            category: this.getCategoryFromName(name),
            emoji: '', // No emojis for now
            rating: 4.0 + Math.random() * 1, // Random rating between 4.0-5.0
          });
        }
      }
    }

    console.log(`📋 Extracted ${activities.length} activities from plan`);
    return activities;
  }

  private getCategoryFromName(name: string): string {
    const nameWords = name.toLowerCase();
    
    if (nameWords.includes('club') || nameWords.includes('bar') || nameWords.includes('lounge')) {
      return 'nightlife';
    }
    if (nameWords.includes('restaurant') || nameWords.includes('steakhouse') || nameWords.includes('grill')) {
      return 'restaurant';
    }
    if (nameWords.includes('cafe') || nameWords.includes('coffee')) {
      return 'cafe';
    }
    if (nameWords.includes('gallery') || nameWords.includes('museum') || nameWords.includes('art')) {
      return 'culture';
    }
    
    return 'venue';
  }

  private extractAddressFromDescription(description: string): string {
    // Look for location indicators
    const locationWords = ['downtown', 'uptown', 'district', 'street', 'avenue', 'center', 'area'];
    const words = description.toLowerCase().split(' ');
    
    for (let i = 0; i < words.length; i++) {
      if (locationWords.some(loc => words[i].includes(loc))) {
        return words.slice(i, i + 2).join(' ');
      }
    }
    
    return 'City Center';
  }

  private getCategoryFromEmoji(emoji: string): string {
    const emojiMap: Record<string, string> = {
      '🎵': 'music',
      '🥩': 'restaurant',
      '🍸': 'bar',
      '🌃': 'nightlife',
      '☕': 'cafe',
      '🎨': 'art',
      '🎬': 'cinema',
      '🎭': 'theater',
      '🏛️': 'museum',
    };
    
    return emojiMap[emoji] || 'venue';
  }

  private getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      'restaurant': '🍽️',
      'bar': '🍷',
      'cafe': '☕',
      'music': '🎵',
      'art': '🎨',
      'cinema': '🎬',
      'club': '🕺',
      'venue': '📍',
    };

    const key = Object.keys(emojiMap).find(k => 
      category.toLowerCase().includes(k)
    );
    
    return emojiMap[key] || '📍';
  }

  async validateUserCredits(telegramId: string): Promise<boolean> {
    const balance = await this.userService.checkBalance(telegramId);
    return balance > 0;
  }

  formatPlanForTelegram(plan: GeneratedPlan): string {
    if (!plan.activities || plan.activities.length === 0) {
      return `🎯 Your Personalized Plan for ${plan.location}\n\n${this.cleanText(plan.summary)}\n\n💳 Credits used: ${plan.creditsUsed}`;
    }

    let message = `🎯 Your Personalized Plan for ${plan.location}\n\n`;
    
    plan.activities.forEach((activity, index) => {
      message += `${index + 1}. ${this.cleanText(activity.name)}\n`;
      if (activity.description && activity.description !== activity.name) {
        message += `   ${this.cleanText(activity.description)}\n`;
      }
      if (activity.address) {
        message += `   📍 ${this.cleanText(activity.address)}\n`;
      }
      if (activity.rating) {
        message += `   ⭐ ${activity.rating.toFixed(1)}/5\n`;
      }
      message += '\n';
    });

    message += `💳 Credits used: ${plan.creditsUsed}`;
    
    return message;
  }

  private cleanText(text: string): string {
    return text
      .replace(/[^\x20-\x7E\u00A0-\u00FF\u2600-\u26FF\u2700-\u27BF\uFE0F]/g, '') // Keep ASCII + basic emojis
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  async getQuickPlan(telegramId: string, type: 'vibe' | 'nearby' | 'random'): Promise<GeneratedPlan | null> {
    const quickPrompts = {
      vibe: 'Give me a cool vibe plan for tonight',
      nearby: 'Show me interesting places nearby',
      random: 'Surprise me with something unique',
    };

    return this.generatePlanForUser(telegramId, quickPrompts[type]);
  }
}