import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  query: string;
  follow_up_questions?: string[];
  answer: string;
  images?: string[];
  results: TavilySearchResult[];
  response_time: number;
}

@Injectable()
export class TavilyService {
  private apiKey: string;
  private baseUrl = 'https://api.tavily.com';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('tavily.apiKey');
  }

  async search(
    query: string,
    searchDepth: 'basic' | 'advanced' = 'basic',
    includeImages = false,
    includeAnswer = true,
    maxResults = 5
  ): Promise<TavilyResponse> {
    if (!this.apiKey) {
      console.warn('Tavily API key not configured, using fallback data');
      return this.getFallbackResults(query);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/search`,
        {
          api_key: this.apiKey,
          query,
          search_depth: searchDepth,
          include_images: includeImages,
          include_answer: includeAnswer,
          max_results: maxResults,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Tavily search error:', error);
      return this.getFallbackResults(query);
    }
  }

  async searchEvents(location: string, eventType?: string): Promise<TavilyResponse> {
    const query = eventType 
      ? `${eventType} events in ${location} today tonight this weekend`
      : `events happening in ${location} today tonight this weekend`;

    return this.search(query, 'advanced', false, true, 10);
  }

  async searchVenueInfo(venueName: string, location: string): Promise<TavilyResponse> {
    const query = `${venueName} ${location} hours menu reviews what to expect`;
    return this.search(query, 'basic', false, true, 5);
  }

  async searchCulturalEvents(
    location: string,
    culturalInterests: string[]
  ): Promise<TavilyResponse> {
    const interests = culturalInterests.join(' ');
    const query = `${interests} cultural events activities ${location} happening now this week`;
    return this.search(query, 'advanced', false, true, 8);
  }

  private getFallbackResults(query: string): TavilyResponse {
    return {
      query,
      answer: `Here are some general results for "${query}". For more specific information, please try a more detailed search.`,
      results: [
        {
          title: `Local Guide: ${query}`,
          url: 'https://example.com/local-guide',
          content: `Discover the best options for ${query} in your area. Check local listings and reviews for the most up-to-date information.`,
          score: 0.8,
          published_date: new Date().toISOString(),
        },
        {
          title: `${query} - What You Need to Know`,
          url: 'https://example.com/guide',
          content: `Everything you need to know about ${query}, including tips, recommendations, and local insights.`,
          score: 0.7,
          published_date: new Date().toISOString(),
        },
      ],
      response_time: 0.5,
    };
  }
}