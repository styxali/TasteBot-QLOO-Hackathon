import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(telegramId: string, phoneNumber?: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        telegramId: BigInt(telegramId),
        credits: 5, // Free credits on signup
      },
    });
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
  }

  async findOrCreate(telegramId: string, phoneNumber?: string): Promise<User> {
    let user = await this.findByTelegramId(telegramId);
    if (user) {
      console.log(`✅ Found existing user ${telegramId} with ${user.credits} credits`);
      return user;
    }
    
    console.log(`🆕 Creating new user ${telegramId} with 5 free credits`);
    user = await this.createUser(telegramId, phoneNumber);
    
    // Initialize empty taste profile
    await this.updateTasteProfile(telegramId, []);
    
    return user;
  }

  async updateUser(telegramId: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { telegramId: BigInt(telegramId) },
      data,
    });
  }

  async deductCredits(telegramId: string, amount: number = 1): Promise<User> {
    return this.prisma.user.update({
      where: { telegramId: BigInt(telegramId) },
      data: {
        credits: {
          decrement: amount,
        },
      },
    });
  }

  async addCredits(telegramId: string, amount: number): Promise<User> {
    return this.prisma.user.update({
      where: { telegramId: BigInt(telegramId) },
      data: {
        credits: {
          increment: amount,
        },
      },
    });
  }

  async checkBalance(telegramId: string): Promise<number> {
    const user = await this.findByTelegramId(telegramId);
    return user?.credits || 0;
  }

  async updateTasteProfile(telegramId: string, tasteProfile: any): Promise<User> {
    // First ensure user exists
    const user = await this.findOrCreate(telegramId);
    
    // Update or create taste profile
    await this.prisma.tasteProfile.upsert({
      where: { userId: user.id },
      update: {
        tasteKeywords: Array.isArray(tasteProfile) ? tasteProfile : [tasteProfile.toString()],
      },
      create: {
        userId: user.id,
        tasteKeywords: Array.isArray(tasteProfile) ? tasteProfile : [tasteProfile.toString()],
      },
    });

    return this.findByTelegramId(telegramId);
  }

  async getTasteProfile(telegramId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: { tasteProfile: true },
    });
    
    return {
      keywords: user?.tasteProfile?.tasteKeywords || [],
      preferences: user?.tasteProfile?.tasteKeywords || [],
    };
  }
}