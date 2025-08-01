import { Module } from '@nestjs/common';
import { FoursquareService } from './foursquare.service';
import { GeoapifyService } from './geoapify.service';
import { MapService } from './map.service';
import { LocationService } from './location.service';

@Module({
  providers: [FoursquareService, GeoapifyService, MapService, LocationService],
  exports: [FoursquareService, GeoapifyService, MapService, LocationService],
})
export class LocationModule {}