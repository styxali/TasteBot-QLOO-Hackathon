import { Module } from '@nestjs/common';
import { QlooDataMapper } from './qloo-data.mapper';
import { FoursquareDataMapper } from './foursquare-data.mapper';

@Module({
  providers: [QlooDataMapper, FoursquareDataMapper],
  exports: [QlooDataMapper, FoursquareDataMapper],
})
export class DataMappingModule {}
