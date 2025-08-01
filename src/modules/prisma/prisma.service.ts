import { Injectable } from '@nestjs/common';

// Mock Prisma service for development
@Injectable()
export class PrismaService {
  conversationMessage = {
    create: async (data: any) => ({ id: 'mock-id', ...data.data }),
    findMany: async (query: any) => [],
  };

  tasteProfile = {
    upsert: async (data: any) => ({ id: 'mock-id', ...data.create }),
    findUnique: async (query: any) => null,
  };

  savedPlan = {
    create: async (data: any) => ({ id: 'mock-id', ...data.data }),
    findMany: async (query: any) => [],
    findUnique: async (query: any) => null,
  };

  async $connect() {
    console.log('Mock Prisma connected');
  }

  async $disconnect() {
    console.log('Mock Prisma disconnected');
  }
}