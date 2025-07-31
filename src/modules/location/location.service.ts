import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  rating?: number;
}

interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
}

@Injectable()
export class LocationService {
  private foursquareKey: string;
  private geoapifyKey: string;

  constructor(private readonly configService: ConfigService) {
    this.foursquareKey = this.configService.get<string>('location.foursquare.apiKey');
    this.geoapifyKey = this.configService.get<string>('location.geoapify.apiKey');
  }

  async searchVenues(query: string, location: string, limit = 10): Promise<Venue[]> {
    if (!this.foursquareKey) return [];

    try {
      const coords = await this.geocode(location);
      const url = 'https://api.foursquare.com/v3/places/search';
      
      const params = new URLSearchParams({
        query,
        ll: `${coords.lat},${coords.lng}`,
        radius: '5000',
        limit: limit.toString(),
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': this.foursquareKey,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      return data.results?.map((place: any) => ({
        id: place.fsq_id,
        name: place.name,
        address: place.location?.formatted_address || '',
        lat: place.geocodes?.main?.latitude || 0,
        lng: place.geocodes?.main?.longitude || 0,
        category: place.categories?.[0]?.name || 'venue',
        rating: place.rating,
      })) || [];
    } catch (error) {
      console.error('Foursquare search error:', error);
      return [];
    }
  }

  async searchNearby(lat: number, lng: number, category?: string, limit = 10): Promise<Venue[]> {
    if (!this.foursquareKey) return [];

    try {
      const url = 'https://api.foursquare.com/v3/places/nearby';
      
      const params = new URLSearchParams({
        ll: `${lat},${lng}`,
        radius: '2000',
        limit: limit.toString(),
        ...(category && { categories: category }),
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': this.foursquareKey,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      return data.results?.map((place: any) => ({
        id: place.fsq_id,
        name: place.name,
        address: place.location?.formatted_address || '',
        lat: place.geocodes?.main?.latitude || 0,
        lng: place.geocodes?.main?.longitude || 0,
        category: place.categories?.[0]?.name || 'venue',
        rating: place.rating,
      })) || [];
    } catch (error) {
      console.error('Foursquare nearby search error:', error);
      return [];
    }
  }

  async geocode(address: string): Promise<GeocodeResult> {
    if (!this.geoapifyKey) {
      throw new Error('Geoapify API key not configured');
    }

    try {
      const url = 'https://api.geoapify.com/v1/geocode/search';
      
      const params = new URLSearchParams({
        text: address,
        apiKey: this.geoapifyKey,
        limit: '1',
      });

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          address: feature.properties.formatted,
        };
      }

      throw new Error('Location not found');
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback coordinates for common cities
      const fallbacks: Record<string, GeocodeResult> = {
        'lisbon': { lat: 38.7223, lng: -9.1393, address: 'Lisbon, Portugal' },
        'london': { lat: 51.5074, lng: -0.1278, address: 'London, UK' },
        'paris': { lat: 48.8566, lng: 2.3522, address: 'Paris, France' },
        'tokyo': { lat: 35.6762, lng: 139.6503, address: 'Tokyo, Japan' },
      };
      
      const key = address.toLowerCase();
      return fallbacks[key] || { lat: 38.7223, lng: -9.1393, address: 'Lisbon, Portugal' };
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    if (!this.geoapifyKey) return `${lat}, ${lng}`;

    try {
      const url = 'https://api.geoapify.com/v1/geocode/reverse';
      
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        apiKey: this.geoapifyKey,
      });

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        return data.features[0].properties.formatted;
      }

      return `${lat}, ${lng}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat}, ${lng}`;
    }
  }

  filterVenuesByTaste(venues: Venue[], preferences: string[]): Venue[] {
    if (!preferences.length) return venues;

    return venues.filter(venue => {
      const searchText = `${venue.name} ${venue.category}`.toLowerCase();
      return preferences.some(pref => 
        searchText.includes(pref.toLowerCase())
      );
    });
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}