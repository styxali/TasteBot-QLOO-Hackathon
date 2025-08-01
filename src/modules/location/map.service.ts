import { Injectable } from '@nestjs/common';

interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  address?: string;
}

interface TelegramMap {
  latitude: number;
  longitude: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
}

@Injectable()
export class MapService {
  generateTelegramMap(location: MapLocation): TelegramMap {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      live_period: 86400, // 24 hours
    };
  }

  generateVenueMap(venues: any[]): MapLocation[] {
    return venues.map(venue => ({
      latitude: venue.geocodes?.main?.latitude || 0,
      longitude: venue.geocodes?.main?.longitude || 0,
      title: venue.name,
      address: venue.location?.formatted_address,
    }));
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  findNearbyVenues(
    userLat: number,
    userLon: number,
    venues: any[],
    radiusKm = 5
  ): any[] {
    return venues.filter(venue => {
      const venueLat = venue.geocodes?.main?.latitude;
      const venueLon = venue.geocodes?.main?.longitude;
      
      if (!venueLat || !venueLon) return false;
      
      const distance = this.calculateDistance(userLat, userLon, venueLat, venueLon);
      return distance <= radiusKm;
    });
  }

  generateMapUrl(latitude: number, longitude: number, zoom = 15): string {
    return `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}`;
  }

  generateDirectionsUrl(
    fromLat: number,
    fromLon: number,
    toLat: number,
    toLon: number
  ): string {
    return `https://maps.google.com/maps/dir/${fromLat},${fromLon}/${toLat},${toLon}`;
  }
}