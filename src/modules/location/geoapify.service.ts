import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface GeoapifyPlace {
  place_id: string;
  name: string;
  formatted: string;
  display_name: string;
  address: {
    city?: string;
    country?: string;
    state?: string;
    postcode?: string;
    street?: string;
    house_number?: string;
  };
  address_line1?: string;
  address_line2?: string;
  categories?: string[];
  category?: string;
  type?: string;
  lat: number;
  lon: number;
  distance?: number;
  website?: string;
  opening_hours?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  facilities?: {
    internet_access?: boolean;
    wheelchair?: boolean;
    outdoor_seating?: boolean;
    takeaway?: boolean;
    delivery?: boolean;
    air_conditioning?: boolean;
    smoking?: boolean;
  };
  catering?: {
    cuisine?: string;
    capacity?: number;
    diet?: {
      vegan?: boolean;
    };
  };
  payment_options?: {
    cash?: boolean;
    debit_cards?: boolean;
    credit_cards?: boolean;
  };
  brand?: string;
  brand_details?: {
    wikidata?: string;
  };
  wiki_and_media?: {
    wikidata?: string;
    wikipedia?: string;
  };
  cultural_significance?: number;
  ambiance_score?: number;
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
        name: feature.properties.name || '',
        formatted: feature.properties.formatted,
        display_name: feature.properties.formatted,
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        address: {
          house_number: feature.properties.housenumber,
          street: feature.properties.street,
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