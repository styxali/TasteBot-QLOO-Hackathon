import { Module } from '@nestjs/common';
import { FoursquareService } from './foursquare.service';
import { GeoapifyService } from './geoapify.service';
import { MapService } from './map.service';

@Module({
  providers: [FoursquareService, GeoapifyService, MapService],
  exports: [FoursquareService, GeoapifyService, MapService],
})
export class LocationModule {}