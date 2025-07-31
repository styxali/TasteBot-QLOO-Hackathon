import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface QlooEntity {
  id: string;
  name: string;
  type: string;
  tags?: string[];
}

interface QlooInsightsResponse {
  results: QlooEntity[];
  metadata?: any;
}

@Injectable()
export class QlooService {
  private apiKey: string;
  private apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('qloo.apiKey');
    this.apiUrl = this.configService.get<string>('qloo.apiUrl');
  }

  async searchEntities(query: string, type?: string): Promise<QlooEntity[]> {
    const url = `${this.apiUrl}/v1/insights/search`;
    
    const params = new URLSearchParams({
      q: query,
      ...(type && { type }),
      limit: '10',
    });

    try {
      return await this.retryOperation(async () => {
        const response = await fetch(`${url}?${params}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded');
          }
          throw new Error(`Qloo API error: ${response.status}`);
        }

        const data: QlooInsightsResponse = await response.json();
        return data.results || [];
      });
    } catch (error) {
      console.error('Qloo search error:', error);
      // Return fallback data for common queries
      return this.getFallbackEntities(query);
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries && error.message.includes('Rate limit')) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        } else if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw lastError;
  }

  private getFallbackEntities(query: string): QlooEntity[] {
    const fallbackData: Record<string, QlooEntity[]> = {
      'jazz': [
        { id: 'jazz-1', name: 'Blue Note', type: 'music', tags: ['jazz', 'smooth'] },
        { id: 'jazz-2', name: 'Jazz Café', type: 'venue', tags: ['jazz', 'intimate'] },
      ],
      'sushi': [
        { id: 'sushi-1', name: 'Sushi Bar', type: 'restaurant', tags: ['sushi', 'japanese'] },
        { id: 'sushi-2', name: 'Omakase', type: 'restaurant', tags: ['sushi', 'premium'] },
      ],
      'coffee': [
        { id: 'coffee-1', name: 'Artisan Coffee', type: 'cafe', tags: ['coffee', 'specialty'] },
        { id: 'coffee-2', name: 'Roastery', type: 'cafe', tags: ['coffee', 'local'] },
      ],
    };

    const key = Object.keys(fallbackData).find(k => 
      query.toLowerCase().includes(k)
    );
    
    return fallbackData[key] || [];
  }

  async getRecommendations(entities: string[], location?: string): Promise<QlooEntity[]> {
    const url = `${this.apiUrl}/v1/insights/recommendations`;
    
    const payload = {
      entities,
      ...(location && { location }),
      limit: 10,
      types: ['restaurant', 'bar', 'venue', 'activity'],
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Qloo API error: ${response.status}`);
      }

      const data: QlooInsightsResponse = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Qloo recommendations error:', error);
      return [];
    }
  }

  async getTags(entityId: string): Promise<string[]> {
    const url = `${this.apiUrl}/v1/insights/entities/${entityId}/tags`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Qloo API error: ${response.status}`);
      }

      const data = await response.json();
      return data.tags || [];
    } catch (error) {
      console.error('Qloo tags error:', error);
      return [];
    }
  }

  buildQueryFromTasteProfile(tasteProfile: any): string[] {
    const queries = [];
    
    if (tasteProfile.movies) {
      queries.push(...tasteProfile.movies);
    }
    
    if (tasteProfile.music) {
      queries.push(...tasteProfile.music);
    }
    
    if (tasteProfile.books) {
      queries.push(...tasteProfile.books);
    }
    
    if (tasteProfile.aesthetics) {
      queries.push(...tasteProfile.aesthetics);
    }

    return queries;
  }

  async findSimilarEntities(entityId: string, type?: string): Promise<QlooEntity[]> {
    const url = `${this.apiUrl}/v1/insights/entities/${entityId}/similar`;
    
    const params = new URLSearchParams({
      ...(type && { type }),
      limit: '5',
    });

    try {
      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Qloo API error: ${response.status}`);
      }

      const data: QlooInsightsResponse = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Qloo similar entities error:', error);
      return [];
    }
  }
}