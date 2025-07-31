import { Module } from '@nestjs/common';
import { QlooService } from './qloo.service';

@Module({
  providers: [QlooService],
  exports: [QlooService],
})
export class QlooModule {}