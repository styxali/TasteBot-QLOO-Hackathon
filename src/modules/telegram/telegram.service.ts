import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PlanService } from '../plan/plan.service';

@Injectable()
export class TelegramService {
  constructor(
    private readonly userService: UserService,
    private readonly planService: PlanService,
  ) {}

  // Telegram service methods will be implemented in later tasks
}