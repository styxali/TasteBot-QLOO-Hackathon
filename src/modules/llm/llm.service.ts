import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmService {
  constructor(private readonly configService: ConfigService) {}

  // LLM service methods will be implemented in later tasks
}