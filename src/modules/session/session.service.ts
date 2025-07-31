import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface SessionContext {
  telegramId: string;
  lastLocation?: string;
  currentMood?: string;
  lastPreferences?: string[];
  conversationHistory?: string[];
  lastPlanGenerated?: any;
  contextTimestamp: Date;
}

@Injectable()
export class SessionService {
  private sessions = new Map<string, SessionContext>();

  constructor(private prisma: PrismaService) {}

  async getSession(telegramId: string): Promise<SessionContext> {
    let session = this.sessions.get(telegramId);
    
    if (!session) {
      // Try to load from database
      const user = await this.prisma.user.findUnique({
        where: { telegramId },
      });

      session = {
        telegramId,
        lastLocation: user?.lastLocation || undefined,
        currentMood: user?.currentMood || undefined,
        lastPreferences: user?.lastPreferences || [],
        conversationHistory: [],
        contextTimestamp: new Date(),
      };

      this.sessions.set(telegramId, session);
    }

    return session;
  }

  async updateSession(telegramId: string, updates: Partial<SessionContext>): Promise<void> {
    const session = await this.getSession(telegramId);
    
    Object.assign(session, {
      ...updates,
      contextTimestamp: new Date(),
    });

    this.sessions.set(telegramId, session);

    // Persist key data to database
    await this.prisma.user.update({
      where: { telegramId },
      data: {
        lastLocation: session.lastLocation,
        currentMood: session.currentMood,
        lastPreferences: session.lastPreferences,
      },
    });
  }

  async addToConversationHistory(telegramId: string, message: string): Promise<void> {
    const session = await this.getSession(telegramId);
    
    if (!session.conversationHistory) {
      session.conversationHistory = [];
    }

    session.conversationHistory.push(message);
    
    // Keep only last 10 messages
    if (session.conversationHistory.length > 10) {
      session.conversationHistory = session.conversationHistory.slice(-10);
    }

    this.sessions.set(telegramId, session);
  }

  async updateMood(telegramId: string, mood: string): Promise<void> {
    await this.updateSession(telegramId, { currentMood: mood });
  }

  async updatePreferences(telegramId: string, preferences: string[]): Promise<void> {
    await this.updateSession(telegramId, { lastPreferences: preferences });
  }

  async updateLocation(telegramId: string, location: string): Promise<void> {
    await this.updateSession(telegramId, { lastLocation: location });
  }

  async getConversationContext(telegramId: string): Promise<string> {
    const session = await this.getSession(telegramId);
    
    let context = '';
    
    if (session.currentMood) {
      context += `Current mood: ${session.currentMood}. `;
    }
    
    if (session.lastLocation) {
      context += `Last location: ${session.lastLocation}. `;
    }
    
    if (session.lastPreferences?.length) {
      context += `Recent preferences: ${session.lastPreferences.join(', ')}. `;
    }
    
    if (session.conversationHistory?.length) {
      context += `Recent conversation: ${session.conversationHistory.slice(-3).join(' -> ')}`;
    }

    return context;
  }

  async clearSession(telegramId: string): Promise<void> {
    this.sessions.delete(telegramId);
  }

  async isFollowUpMessage(telegramId: string, message: string): Promise<boolean> {
    const session = await this.getSession(telegramId);
    
    // Check if message is a follow-up based on context
    const followUpKeywords = [
      'another', 'different', 'more', 'nearby', 'similar', 
      'change', 'instead', 'also', 'what about', 'how about'
    ];

    const isFollowUp = followUpKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    // Also check if we have recent context
    const hasRecentContext = session.lastPlanGenerated && 
      (Date.now() - session.contextTimestamp.getTime()) < 300000; // 5 minutes

    return isFollowUp || hasRecentContext;
  }

  async savePlanToContext(telegramId: string, plan: any): Promise<void> {
    await this.updateSession(telegramId, { lastPlanGenerated: plan });
  }

  async getLastPlan(telegramId: string): Promise<any> {
    const session = await this.getSession(telegramId);
    return session.lastPlanGenerated;
  }
}