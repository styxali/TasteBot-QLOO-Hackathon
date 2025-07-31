import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(telegramId: string, phoneNumber?: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        telegramId,
        phoneNumber,
        credits: 5, // Free credits on signup
      },
    });
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { telegramId },
    });
  }

  async findOrCreate(telegramId: string, phoneNumber?: string): Promise<User> {
    const user = await this.findByTelegramId(telegramId);
    if (user) return user;
    return this.createUser(telegramId, phoneNumber);
  }

  async updateUser(telegramId: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { telegramId },
      data,
    });
  }

  async deductCredits(telegramId: string, amount: number = 1): Promise<User> {
    return this.prisma.user.update({
      where: { telegramId },
      data: {
        credits: {
          decrement: amount,
        },
      },
    });
  }

  async addCredits(telegramId: string, amount: number): Promise<User> {
    return this.prisma.user.update({
      where: { telegramId },
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
    return this.prisma.user.update({
      where: { telegramId },
      data: {
        tasteProfile,
      },
    });
  }

  async getTasteProfile(telegramId: string): Promise<any> {
    const user = await this.findByTelegramId(telegramId);
    return user?.tasteProfile || {};
  }
}