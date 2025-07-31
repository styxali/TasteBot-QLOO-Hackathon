import { Injectable } from '@nestjs/common';
import { QlooService } from '../qloo/qloo.service';
import { LlmService } from '../llm/llm.service';
import { LocationService } from '../location/location.service';
import { UserService } from '../user/user.service';

interface PlanActivity {
  name: string;
  description: string;
  address: string;
  category: string;
  emoji: string;
  rating?: number;
}

interface GeneratedPlan {
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
      // Parse user intent
      const intent = await this.llmService.parseIntent(userMessage);
      
      // Get user taste profile
      const tasteProfile = await this.userService.getTasteProfile(telegramId);
      
      // Build query from taste profile and intent
      const queries = this.qlooService.buildQueryFromTasteProfile(tasteProfile);
      if (intent.preferences) {
        queries.push(...intent.preferences);
      }

      // Get Qloo recommendations
      let qlooData = [];
      if (queries.length > 0) {
        for (const query of queries.slice(0, 3)) { // Limit API calls
          const results = await this.qlooService.searchEntities(query);
          qlooData.push(...results);
        }
      }

      // Get location-based venues
      let venues = [];
      if (intent.location) {
        venues = await this.locationService.searchVenues(
          intent.preferences?.join(' ') || 'restaurant bar cafe',
          intent.location,
          5
        );
      }

      // Combine data sources
      const combinedData = [...qlooData, ...venues];

      // Generate plan using LLM
      const planText = await this.llmService.synthesizePlan(combinedData, intent);

      // Parse activities from plan
      const activities = this.extractActivitiesFromPlan(planText, venues);

      // Deduct credit
      await this.userService.deductCredits(telegramId, 1);

      return {
        activities,
        summary: planText,
        location: intent.location || 'Your area',
        creditsUsed: 1,
      };

    } catch (error) {
      console.error('Plan generation error:', error);
      return null;
    }
  }

  private extractActivitiesFromPlan(planText: string, venues: any[]): PlanActivity[] {
    const activities: PlanActivity[] = [];
    
    // Simple extraction - look for numbered items
    const lines = planText.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*([🎯🍜🕶️🎥📍🎵🍷🎨🏛️🌟✨🎭🎪🎨🎬🎤🎸🎹🎺🥁🎻🎪🎭🎨🎬🎤🎸🎹🎺🥁🎻]?)\s*(.+)/);
      
      if (match) {
        const emoji = match[1] || '📍';
        const text = match[2];
        
        // Try to match with actual venues
        const matchedVenue = venues.find(v => 
          text.toLowerCase().includes(v.name.toLowerCase())
        );

        activities.push({
          name: matchedVenue?.name || text.split('(')[0].trim(),
          description: text,
          address: matchedVenue?.address || '',
          category: matchedVenue?.category || 'venue',
          emoji,
          rating: matchedVenue?.rating,
        });
      }
    }

    // Fallback if no activities extracted
    if (activities.length === 0 && venues.length > 0) {
      activities.push(...venues.slice(0, 3).map(venue => ({
        name: venue.name,
        description: `${venue.category} in ${venue.address}`,
        address: venue.address,
        category: venue.category,
        emoji: this.getCategoryEmoji(venue.category),
        rating: venue.rating,
      })));
    }

    return activities;
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
    let message = `🎯 Here's your personalized plan for ${plan.location}:\n\n`;
    
    plan.activities.forEach((activity, index) => {
      message += `${index + 1}. ${activity.emoji} ${activity.name}\n`;
      if (activity.description && activity.description !== activity.name) {
        message += `   ${activity.description}\n`;
      }
      if (activity.address) {
        message += `   📍 ${activity.address}\n`;
      }
      message += '\n';
    });

    const remainingCredits = plan.creditsUsed; // This would be calculated differently
    message += `\n💳 Credits used: ${plan.creditsUsed}`;
    
    return message;
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