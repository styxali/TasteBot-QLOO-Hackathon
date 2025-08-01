import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FoursquareVenue, FoursquareSearchResponse } from './interfaces/foursquare.interface';

@Injectable()
export class FoursquareService {
  private apiKey: string;
  private baseUrl = 'https://api.foursquare.com/v3';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FOURSQUARE_API_KEY');
    
    if (!this.apiKey) {
      console.warn('Foursquare API key not found in configuration');
      console.debug('Environment variable value:', process.env.FOURSQUARE_API_KEY);
      console.debug('Config service value:', this.configService.get('FOURSQUARE_API_KEY'));
    } else {
      console.log('Foursquare API key configured successfully');
    }
  }

  async searchVenues(
    query: string,
    location: string,
    categories?: string[],
    limit = 10
  ): Promise<FoursquareVenue[]> {
    if (!this.apiKey) {
      console.log(this.apiKey)
      console.warn('Foursquare API key not configured, using fallback data');
      return this.getFallbackVenues(query, location);
    }

    try {
      const params = new URLSearchParams({
        query,
        near: location,
        limit: limit.toString(),
        ...(categories && { categories: categories.join(',') }),
      });

      const response = await axios.get(`${this.baseUrl}/places/search?${params}`, {
        headers: {
          'Authorization': this.apiKey,
          'Accept': 'application/json',
        },
      });

      const data: FoursquareSearchResponse = response.data;
      return data.results || [];
    } catch (error) {
      console.error('Foursquare search error:', error);
      return this.getFallbackVenues(query, location);
    }
  }

  async getVenueDetails(venueId: string): Promise<FoursquareVenue | null> {
    if (!this.apiKey) return null;

    try {
      const response = await axios.get(`${this.baseUrl}/places/${venueId}`, {
        headers: {
          'Authorization': this.apiKey,
          'Accept': 'application/json',
        },
        params: {
          fields: 'fsq_id,name,location,categories,rating,price,photos,hours,description,website,tel',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Foursquare venue details error:', error);
      return null;
    }
  }

  async getVenuePhotos(venueId: string): Promise<any[]> {
    if (!this.apiKey) return [];

    try {
      const response = await axios.get(`${this.baseUrl}/places/${venueId}/photos`, {
        headers: {
          'Authorization': this.apiKey,
          'Accept': 'application/json',
        },
        params: {
          limit: '10',
        },
      });

      return response.data || [];
    } catch (error) {
      console.error('Foursquare photos error:', error);
      return [];
    }
  }

  async searchByCoordinates(
    lat: number,
    lng: number,
    categories?: string[],
    radius = 1000,
    limit = 10
  ): Promise<FoursquareVenue[]> {
    if (!this.apiKey) {
      return this.getFallbackVenues('nearby', `${lat},${lng}`);
    }

    try {
      const params = new URLSearchParams({
        ll: `${lat},${lng}`,
        radius: radius.toString(),
        limit: limit.toString(),
        ...(categories && { categories: categories.join(',') }),
      });

      const response = await axios.get(`${this.baseUrl}/places/search?${params}`, {
        headers: {
          'Authorization': this.apiKey,
          'Accept': 'application/json',
        },
      });

      const data: FoursquareSearchResponse = response.data;
      return data.results || [];
    } catch (error) {
      console.error('Foursquare coordinate search error:', error);
      return this.getFallbackVenues('nearby', `${lat},${lng}`);
    }
  }

  private getFallbackVenues(query: string, location: string): FoursquareVenue[] {
    const fallbackVenues: FoursquareVenue[] = [
      {
        fsq_id: 'fallback-1',
        name: `${query} Spot`,
        location: {
          address: '123 Main St',
          locality: location.split(',')[0] || 'City',
          region: 'State',
          country: 'Country',
          formatted_address: `123 Main St, ${location}`,
        },
        categories: [
          {
            id: 13065,
            name: 'Restaurant',
            icon: {
              prefix: 'https://ss3.4sqi.net/img/categories_v2/food/default_',
              suffix: '.png',
            },
          },
        ],
        distance: 150,
        rating: 4.2,
        price: 2,
      },
      {
        fsq_id: 'fallback-2',
        name: `Local ${query} Place`,
        location: {
          address: '456 Second Ave',
          locality: location.split(',')[0] || 'City',
          region: 'State',
          country: 'Country',
          formatted_address: `456 Second Ave, ${location}`,
        },
        categories: [
          {
            id: 13032,
            name: 'Bar',
            icon: {
              prefix: 'https://ss3.4sqi.net/img/categories_v2/nightlife/pub_',
              suffix: '.png',
            },
          },
        ],
        distance: 300,
        rating: 4.0,
        price: 3,
      },
    ];

    return fallbackVenues;
  }

  getCategoryIds(): Record<string, string> {
    return {
      restaurant: '13065',
      bar: '13003',
      cafe: '13032',
      nightlife: '10032',
      shopping: '17000',
      arts: '10027',
      outdoors: '16000',
      hotel: '19014',
    };
  }
}