import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ConversationMessage {
  id: string;
  userId: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TasteProfile {
  userId: string;
  corePreferences: {
    music: any[];
    movies: any[];
    books: any[];
    food: any[];
    aesthetics: any[];
  };
  culturalConnections: any[];
  tasteEvolution: {
    timeline: any[];
    patterns: any[];
  };
  personalityInsights: any[];
  lastUpdated: Date;
}

export interface SavedPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  venues: any[];
  activities: any[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MemorySystem {
  constructor(private readonly prisma: PrismaService) {}

  async storeConversationMessage(message: ConversationMessage): Promise<void> {
    try {
      await this.prisma.conversationMessage.create({
        data: {
          id: message.id,
          userId: message.userId,
          content: message.content,
          type: message.type,
          timestamp: message.timestamp,
          metadata: message.metadata || {},
        },
      });
    } catch (error) {
      console.error('Failed to store conversation message:', error);
    }
  }

  async getConversationHistory(userId: string, limit: number = 50): Promise<ConversationMessage[]> {
    try {
      const messages = await this.prisma.conversationMessage.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return messages.map(msg => ({
        id: msg.id,
        userId: msg.userId,
        content: msg.content,
        type: msg.type as 'user' | 'bot',
        timestamp: msg.timestamp,
        metadata: msg.metadata as Record<string, any>,
      }));
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      return [];
    }
  }

  async updateTasteProfile(userId: string, profile: Partial<TasteProfile>): Promise<void> {
    try {
      await this.prisma.tasteProfile.upsert({
        where: { userId },
        update: {
          corePreferences: profile.corePreferences || {},
          culturalConnections: profile.culturalConnections || [],
          tasteEvolution: profile.tasteEvolution || { timeline: [], patterns: [] },
          personalityInsights: profile.personalityInsights || [],
          lastUpdated: new Date(),
        },
        create: {
          userId,
          corePreferences: profile.corePreferences || {
            music: [],
            movies: [],
            books: [],
            food: [],
            aesthetics: [],
          },
          culturalConnections: profile.culturalConnections || [],
          tasteEvolution: profile.tasteEvolution || { timeline: [], patterns: [] },
          personalityInsights: profile.personalityInsights || [],
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to update taste profile:', error);
    }
  }

  async getTasteProfile(userId: string): Promise<TasteProfile | null> {
    try {
      const profile = await this.prisma.tasteProfile.findUnique({
        where: { userId },
      });

      if (!profile) return null;

      return {
        userId: profile.userId,
        corePreferences: profile.corePreferences as any,
        culturalConnections: profile.culturalConnections as any[],
        tasteEvolution: profile.tasteEvolution as any,
        personalityInsights: profile.personalityInsights as any[],
        lastUpdated: profile.lastUpdated,
      };
    } catch (error) {
      console.error('Failed to get taste profile:', error);
      return null;
    }
  }

  async savePlan(plan: Omit<SavedPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const savedPlan = await this.prisma.savedPlan.create({
        data: {
          userId: plan.userId,
          title: plan.title,
          description: plan.description,
          venues: plan.venues,
          activities: plan.activities,
          metadata: plan.metadata,
        },
      });

      return savedPlan.id;
    } catch (error) {
      console.error('Failed to save plan:', error);
      throw new Error('Failed to save plan');
    }
  }

  async getUserPlans(userId: string): Promise<SavedPlan[]> {
    try {
      const plans = await this.prisma.savedPlan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return plans.map(plan => ({
        id: plan.id,
        userId: plan.userId,
        title: plan.title,
        description: plan.description,
        venues: plan.venues as any[],
        activities: plan.activities as any[],
        metadata: plan.metadata as Record<string, any>,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      }));
    } catch (error) {
      console.error('Failed to get user plans:', error);
      return [];
    }
  }

  async getPlan(planId: string): Promise<SavedPlan | null> {
    try {
      const plan = await this.prisma.savedPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) return null;

      return {
        id: plan.id,
        userId: plan.userId,
        title: plan.title,
        description: plan.description,
        venues: plan.venues as any[],
        activities: plan.activities as any[],
        metadata: plan.metadata as Record<string, any>,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      };
    } catch (error) {
      console.error('Failed to get plan:', error);
      return null;
    }
  }

  async getContextForUser(userId: string): Promise<{
    recentMessages: ConversationMessage[];
    tasteProfile: TasteProfile | null;
    recentPlans: SavedPlan[];
  }> {
    const [recentMessages, tasteProfile, recentPlans] = await Promise.all([
      this.getConversationHistory(userId, 10),
      this.getTasteProfile(userId),
      this.getUserPlans(userId),
    ]);

    return {
      recentMessages,
      tasteProfile,
      recentPlans: recentPlans.slice(0, 5),
    };
  }

  async learnFromInteraction(userId: string, interaction: {
    query: string;
    response: string;
    entities: any[];
    feedback?: 'positive' | 'negative';
  }): Promise<void> {
    // Store the interaction
    await this.storeConversationMessage({
      id: `${Date.now()}_user`,
      userId,
      content: interaction.query,
      type: 'user',
      timestamp: new Date(),
      metadata: { entities: interaction.entities },
    });

    await this.storeConversationMessage({
      id: `${Date.now()}_bot`,
      userId,
      content: interaction.response,
      type: 'bot',
      timestamp: new Date(),
      metadata: { entities: interaction.entities, feedback: interaction.feedback },
    });

    // Update taste profile based on entities
    if (interaction.entities.length > 0) {
      const currentProfile = await this.getTasteProfile(userId);
      const updatedPreferences = this.updatePreferencesFromEntities(
        currentProfile?.corePreferences || {
          music: [],
          movies: [],
          books: [],
          food: [],
          aesthetics: [],
        },
        interaction.entities
      );

      await this.updateTasteProfile(userId, {
        corePreferences: updatedPreferences,
      });
    }
  }

  private updatePreferencesFromEntities(
    currentPreferences: any,
    entities: any[]
  ): any {
    const preferences = { ...currentPreferences };

    for (const entity of entities) {
      const category = this.categorizeEntity(entity);
      if (category && preferences[category]) {
        // Add entity if not already present
        const exists = preferences[category].some((item: any) => item.id === entity.id);
        if (!exists) {
          preferences[category].push(entity);
        }
      }
    }

    return preferences;
  }

  private categorizeEntity(entity: any): string | null {
    const type = entity.type?.toLowerCase();
    
    if (type?.includes('music') || type?.includes('artist') || type?.includes('song')) {
      return 'music';
    }
    if (type?.includes('movie') || type?.includes('film') || type?.includes('tv')) {
      return 'movies';
    }
    if (type?.includes('book') || type?.includes('author') || type?.includes('literature')) {
      return 'books';
    }
    if (type?.includes('food') || type?.includes('restaurant') || type?.includes('cuisine')) {
      return 'food';
    }
    if (type?.includes('aesthetic') || type?.includes('style') || type?.includes('design')) {
      return 'aesthetics';
    }
    
    return null;
  }
}