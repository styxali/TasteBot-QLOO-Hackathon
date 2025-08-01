import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface GeoapifyPlace {
  place_id: string;
  display_name: string;
  lat: number;
  lon: number;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  category?: string;
  type?: string;
}

@Injectable()
export class GeoapifyService {
  private apiKey: string;
  private baseUrl = 'https://api.geoapify.com/v1';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('geoapify.apiKey');
  }

  async geocode(address: string): Promise<GeoapifyPlace[]> {
    if (!this.apiKey) {
      console.warn('Geoapify API key not configured');
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/search`, {
        params: {
          text: address,
          apiKey: this.apiKey,
          limit: 5,
        },
      });

      return response.data.features.map((feature: any) => ({
        place_id: feature.properties.place_id,
        display_name: feature.properties.formatted,
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        address: {
          house_number: feature.properties.housenumber,
          road: feature.properties.street,
          city: feature.properties.city,
          state: feature.properties.state,
          country: feature.properties.country,
          postcode: feature.properties.postcode,
        },
        category: feature.properties.category,
        type: feature.properties.type,
      }));
    } catch (error) {
      console.error('Geoapify geocoding error:', error);
      return [];
    }
  }

  async reverseGeocode(lat: number, lon: number): Promise<GeoapifyPlace | null> {
    if (!this.apiKey) {
      console.warn('Geoapify API key not configured');
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/reverse`, {
        params: {
          lat,
          lon,
          apiKey: this.apiKey,
        },
      });

      const feature = response.data.features[0];
      if (!feature) return null;

      return {
        place_id: feature.properties.place_id,
        display_name: feature.properties.formatted,
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        address: {
          house_number: feature.properties.housenumber,
          road: feature.properties.street,
          city: feature.properties.city,
          state: feature.properties.state,
          country: feature.properties.country,
          postcode: feature.properties.postcode,
        },
        category: feature.properties.category,
        type: feature.properties.type,
      };
    } catch (error) {
      console.error('Geoapify reverse geocoding error:', error);
      return null;
    }
  }

  async searchPlaces(query: string, lat?: number, lon?: number, radius?: number): Promise<GeoapifyPlace[]> {
    if (!this.apiKey) {
      console.warn('Geoapify API key not configured');
      return [];
    }

    try {
      const params: any = {
        text: query,
        apiKey: this.apiKey,
        limit: 10,
      };

      if (lat && lon) {
        params.bias = `proximity:${lon},${lat}`;
        if (radius) {
          params.filter = `circle:${lon},${lat},${radius}`;
        }
      }

      const response = await axios.get(`${this.baseUrl}/geocode/search`, {
        params,
      });

      return response.data.features.map((feature: any) => ({
        place_id: feature.properties.place_id,
        display_name: feature.properties.formatted,
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        address: {
          house_number: feature.properties.housenumber,
          road: feature.properties.street,
          city: feature.properties.city,
          state: feature.properties.state,
          country: feature.properties.country,
          postcode: feature.properties.postcode,
        },
        category: feature.properties.category,
        type: feature.properties.type,
      }));
    } catch (error) {
      console.error('Geoapify place search error:', error);
      return [];
    }
  }
}