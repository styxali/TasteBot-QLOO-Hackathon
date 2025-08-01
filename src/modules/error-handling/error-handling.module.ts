import { Module } from '@nestjs/common';
import { FallbackSystemService } from './fallback-system.service';

@Module({
  providers: [FallbackSystemService],
  exports: [FallbackSystemService],
})
export class ErrorHandlingModule {}