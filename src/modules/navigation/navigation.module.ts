import { Module } from '@nestjs/common';
import { NavigationRouter } from './navigation-router.service';

@Module({
  providers: [NavigationRouter],
  exports: [NavigationRouter],
})
export class NavigationModule {}