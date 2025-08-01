import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface JinaSearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  metadata?: {
    description?: string;
    keywords?: string[];
    author?: string;
    published_date?: string;
  };
}

interface JinaResponse {
  query: string;
  results: JinaSearchResult[];
  total: number;
  took: number;
}

@Injectable()
export class JinaService {
  private apiKey: string;
  private baseUrl = 'https://api.jina.ai/v1';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('jina.apiKey');
  }

  async search(
    query: string,
    limit = 10,
    offset = 0
  ): Promise<JinaResponse> {
    if (!this.apiKey) {
      console.warn('Jina API key not configured, using fallback data');
      return this.getFallbackResults(query);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/search`,
        {
          query,
          limit,
          offset,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Jina search error:', error);
      return this.getFallbackResults(query);
    }
  }

  async searchSimilarContent(
    content: string,
    contentType: 'text' | 'url' = 'text'
  ): Promise<JinaResponse> {
    const query = contentType === 'url' 
      ? `similar content to ${content}`
      : `content similar to: ${content}`;

    return this.search(query, 5);
  }

  async enhancedVenueSearch(
    venueName: string,
    location: string,
    context: string[]
  ): Promise<JinaResponse> {
    const contextStr = context.join(' ');
    const query = `${venueName} ${location} ${contextStr} experience atmosphere reviews`;
    return this.search(query, 8);
  }

  private getFallbackResults(query: string): JinaResponse {
    return {
      query,
      results: [
        {
          title: `Enhanced Search: ${query}`,
          url: 'https://example.com/enhanced-search',
          content: `Comprehensive information about ${query} with detailed insights and recommendations.`,
          score: 0.9,
          metadata: {
            description: `Detailed guide for ${query}`,
            keywords: query.split(' '),
            published_date: new Date().toISOString(),
          },
        },
        {
          title: `${query} - Deep Dive`,
          url: 'https://example.com/deep-dive',
          content: `In-depth analysis and recommendations for ${query} based on current trends and user preferences.`,
          score: 0.8,
          metadata: {
            description: `Analysis of ${query}`,
            keywords: query.split(' '),
            published_date: new Date().toISOString(),
          },
        },
      ],
      total: 2,
      took: 0.3,
    };
  }
}