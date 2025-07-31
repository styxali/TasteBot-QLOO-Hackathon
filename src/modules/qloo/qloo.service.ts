import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QlooService {
  constructor(private readonly configService: ConfigService) {}

  // Qloo service methods will be implemented in later tasks
}