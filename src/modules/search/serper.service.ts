import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface SerperSearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  position: number;
}

interface SerperEvent {
  title: string;
  date: {
    start_date: string;
    when: string;
  };
  address: string[];
  link: string;
  venue: {
    name: string;
    link?: string;
  };
  thumbnail?: string;
  ticket_info?: Array<{
    source: string;
    link: string;
    link_type: string;
  }>;
}

interface SerperResponse {
  searchParameters: {
    q: string;
    type: string;
    engine: string;
  };
  organic?: SerperSearchResult[];
  events?: SerperEvent[];
  answerBox?: {
    answer: string;
    title: string;
    link: string;
  };
}

@Injectable()
export class SerperService {
  private apiKey: string;
  private baseUrl = 'https://google.serper.dev';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('serper.apiKey');
  }

  async search(query: string, type: 'search' | 'events' = 'search'): Promise<SerperResponse> {
    if (!this.apiKey) {
      console.warn('Serper API key not configured, using fallback data');
      return this.getFallbackResults(query, type);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${type}`,
        { q: query },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Serper search error:', error);
      return this.getFallbackResults(query, type);
    }
  }

  async searchEvents(location: string, eventType?: string): Promise<SerperEvent[]> {
    const query = eventType 
      ? `${eventType} events in ${location}`
      : `events in ${location}`;

    const response = await this.search(query, 'events');
    return response.events || [];
  }

  async searchVenueReviews(venueName: string, location: string): Promise<SerperSearchResult[]> {
    const query = `${venueName} ${location} reviews`;
    const response = await this.search(query, 'search');
    return response.organic || [];
  }

  async searchLocalInfo(query: string, location: string): Promise<SerperResponse> {
    const searchQuery = `${query} in ${location}`;
    return this.search(searchQuery, 'search');
  }

  private getFallbackResults(query: string, type: string): SerperResponse {
    const baseResponse = {
      searchParameters: {
        q: query,
        type,
        engine: 'google',
      },
    };

    if (type === 'events') {
      return {
        ...baseResponse,
        events: [
          {
            title: `Local Event: ${query}`,
            date: {
              start_date: new Date().toISOString(),
              when: 'This weekend',
            },
            address: ['Local Venue', 'City Center'],
            link: 'https://example.com/event',
            venue: {
              name: 'Local Venue',
            },
          },
        ],
      };
    }

    return {
      ...baseResponse,
      organic: [
        {
          title: `${query} - Local Guide`,
          link: 'https://example.com/guide',
          snippet: `Find the best options for ${query} with local recommendations and reviews.`,
          position: 1,
        },
      ],
    };
  }
}