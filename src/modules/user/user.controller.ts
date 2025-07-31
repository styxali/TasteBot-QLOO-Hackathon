import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':telegramId')
  async getUser(@Param('telegramId') telegramId: string) {
    return this.userService.findByTelegramId(telegramId);
  }

  @Get(':telegramId/credits')
  async getCredits(@Param('telegramId') telegramId: string) {
    const balance = await this.userService.checkBalance(telegramId);
    return { credits: balance };
  }

  @Post(':telegramId/credits/add')
  async addCredits(
    @Param('telegramId') telegramId: string,
    @Body() body: { amount: number },
  ) {
    return this.userService.addCredits(telegramId, body.amount);
  }

  @Post(':telegramId/taste-profile')
  async updateTasteProfile(
    @Param('telegramId') telegramId: string,
    @Body() tasteProfile: any,
  ) {
    return this.userService.updateTasteProfile(telegramId, tasteProfile);
  }
}