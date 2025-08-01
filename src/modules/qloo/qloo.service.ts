import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface QlooEntity {
  id: string;
  name: string;
  type: string;
  tags?: string[];
  metadata?: any;
}

interface QlooInsightsResponse {
  results: QlooEntity[];
  metadata?: any;
}

interface QlooRelationship {
  target: QlooEntity;
  type: string;
  strength?: number;
}

interface QlooExplanation {
  reasoning: string;
  factors: string[];
  confidence: number;
}

interface CulturalProfile {
  corePreferences: {
    music: QlooEntity[];
    movies: QlooEntity[];
    books: QlooEntity[];
    food: QlooEntity[];
    aesthetics: QlooEntity[];
  };
  culturalConnections: CulturalConnection[];
  tasteEvolution: {
    timeline: any[];
    patterns: any[];
  };
  personalityInsights: any[];
}

interface CulturalConnection {
  sourceEntity: QlooEntity;
  targetEntity: QlooEntity;
  relationshipType: string;
  strength: number;
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
    if (!this.apiKey) {
      console.warn('Qloo API key not configured, using fallback data');
      return this.getFallbackEntities(query);
    }

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
          if (response.status === 401) {
            throw new Error('Qloo API key is invalid');
          }
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
      'hip hop': [
        { id: 'hiphop-1', name: 'Underground Hip Hop Club', type: 'venue', tags: ['hip-hop', 'urban', 'nightlife'] },
        { id: 'hiphop-2', name: 'Rap Battle Arena', type: 'venue', tags: ['hip-hop', 'live', 'energy'] },
      ],
      'steak': [
        { id: 'steak-1', name: 'Prime Steakhouse', type: 'restaurant', tags: ['steak', 'premium', 'meat'] },
        { id: 'steak-2', name: 'Urban Grill', type: 'restaurant', tags: ['steak', 'modern', 'hip'] },
      ],
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

    // Check for multiple keywords
    const matchedEntities: QlooEntity[] = [];
    Object.keys(fallbackData).forEach(key => {
      if (query.toLowerCase().includes(key)) {
        matchedEntities.push(...fallbackData[key]);
      }
    });
    
    return matchedEntities.length > 0 ? matchedEntities : [
      { id: 'generic-1', name: 'Local Hotspot', type: 'venue', tags: ['popular', 'trendy'] },
      { id: 'generic-2', name: 'Urban Eatery', type: 'restaurant', tags: ['modern', 'casual'] },
    ];
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

  async getEntityDetails(entityId: string): Promise<QlooEntity | null> {
    if (!this.apiKey) return null;

    const url = `${this.apiUrl}/v1/insights/entities/${entityId}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return null;
      
      const data = await response.json();
      return data.entity || null;
    } catch (error) {
      console.error('Qloo entity details error:', error);
      return null;
    }
  }

  async getEntityRelationships(entityId: string): Promise<QlooRelationship[]> {
    if (!this.apiKey) return [];

    const url = `${this.apiUrl}/v1/insights/entities/${entityId}/relationships`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return [];
      
      const data = await response.json();
      return data.relationships || [];
    } catch (error) {
      console.error('Qloo relationships error:', error);
      return [];
    }
  }

  async getRecommendationExplanation(recommendationId: string): Promise<QlooExplanation | null> {
    if (!this.apiKey) return null;

    const url = `${this.apiUrl}/v1/insights/recommendations/${recommendationId}/explanation`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return null;
      
      const data = await response.json();
      return data.explanation || null;
    } catch (error) {
      console.error('Qloo explanation error:', error);
      return null;
    }
  }

  async buildCulturalProfile(userInteractions: any[]): Promise<CulturalProfile> {
    const profile: CulturalProfile = {
      corePreferences: {
        music: [],
        movies: [],
        books: [],
        food: [],
        aesthetics: [],
      },
      culturalConnections: [],
      tasteEvolution: {
        timeline: [],
        patterns: [],
      },
      personalityInsights: [],
    };

    // Analyze user interactions to build profile
    for (const interaction of userInteractions) {
      if (interaction.type === 'preference') {
        const entities = await this.searchEntities(interaction.content);
        
        for (const entity of entities) {
          const category = this.categorizeEntity(entity);
          if (category && profile.corePreferences[category]) {
            profile.corePreferences[category].push(entity);
          }
        }
      }
    }

    // Find cultural connections
    profile.culturalConnections = await this.findCulturalConnections(profile.corePreferences);

    return profile;
  }

  private categorizeEntity(entity: QlooEntity): keyof CulturalProfile['corePreferences'] | null {
    const type = entity.type?.toLowerCase();
    
    if (type?.includes('music') || type?.includes('artist') || type?.includes('song')) {
      return 'music';
    }
    if (type?.includes('movie') || type?.includes('film') || type?.includes('tv')) {
      return 'movies';
    }
    if (type?.includes('book') || type?.includes('author') || type?.includes('literature')) {
      return 'books';
    }
    if (type?.includes('food') || type?.includes('restaurant') || type?.includes('cuisine')) {
      return 'food';
    }
    if (type?.includes('aesthetic') || type?.includes('style') || type?.includes('design')) {
      return 'aesthetics';
    }
    
    return null;
  }

  private async findCulturalConnections(preferences: CulturalProfile['corePreferences']): Promise<CulturalConnection[]> {
    const connections: CulturalConnection[] = [];
    
    // Find connections between different preference categories
    const allEntities = Object.values(preferences).flat();
    
    for (const entity of allEntities) {
      const relationships = await this.getEntityRelationships(entity.id);
      
      for (const relationship of relationships) {
        connections.push({
          sourceEntity: entity,
          targetEntity: relationship.target,
          relationshipType: relationship.type,
          strength: relationship.strength || 0.5,
        });
      }
    }
    
    return connections;
  }
}