import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocationService {
  constructor(private readonly configService: ConfigService) {}

  // Location service methods will be implemented in later tasks
}