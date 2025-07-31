import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class StripeService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  // Stripe service methods will be implemented in later tasks
}