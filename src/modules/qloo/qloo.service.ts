import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface QlooEntity {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  tags?: string[];
  metadata?: any;
  properties?: any;
  popularity?: number;
  external?: any;
}

interface QlooInteractionHistory {
  entityId: string;
  choiceType: 'entity' | 'tag' | 'demographic';
  timestamp: Date;
  context?: any;
}

interface QlooInteractiveChoice {
  id: string;
  type: 'entity' | 'tag' | 'demographic';
  label: string;
  value: any;
  metadata?: any;
}

interface QlooInsightsResponse {
  success: boolean;
  results: {
    entities?: QlooEntity[];
    tags?: any[];
    demographics?: any[];
    heatmap?: any[];
  };
  interactiveChoices?: QlooInteractiveChoice[];
  previousChoices?: QlooInteractionHistory[];
  query?: any;
  duration?: number;
}

interface QlooSearchResponse {
  results: QlooEntity[];
  total?: number;
}

interface QlooAnalysisResponse {
  results: {
    tags: any[];
    insights: any[];
  };
}

interface QlooTrendingResponse {
  results: {
    entities: QlooEntity[];
    trending_data: any[];
  };
}

@Injectable()
export class QlooService {
  private apiKey: string;
  private baseUrl: string;
  private interactionHistory: QlooInteractionHistory[] = [];

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('QLOO_API_KEY');
    this.baseUrl = this.configService.get<string>('QLOO_API_URL') || 'https://hackathon.api.qloo.com';
    
    if (!this.apiKey) {
      console.warn('Qloo API key not found in configuration');
      console.debug('Environment variable value:', process.env.QLOO_API_KEY);
      console.debug('Config service value:', this.configService.get('QLOO_API_KEY'));
    } else {
      console.log('Qloo API key configured successfully');
    }
  }

  // ===== INSIGHTS API =====

  /**
   * Core Insights API - Get taste-based recommendations
   */
  async getInsights(params: {
    filterType: string;
    signalInterestsEntities?: string[];
    signalInterestsTags?: string[];
    signalLocation?: string;
    filterLocation?: string;
    filterTags?: string[];
    take?: number;
    page?: number;
    [key: string]: any;
  }): Promise<QlooInsightsResponse> {
    const url = `${this.baseUrl}/v2/insights`;
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('filter.type', params.filterType);
      
      if (params.signalInterestsEntities) {
        queryParams.append('signal.interests.entities', params.signalInterestsEntities.join(','));
      }
      
      if (params.signalInterestsTags) {
        queryParams.append('signal.interests.tags', params.signalInterestsTags.join(','));
      }
      
      if (params.signalLocation) {
        queryParams.append('signal.location', params.signalLocation);
      }
      
      if (params.filterLocation) {
        queryParams.append('filter.location', params.filterLocation);
      }
      
      if (params.filterTags) {
        queryParams.append('filter.tags', params.filterTags.join(','));
      }
      
      if (params.take) {
        queryParams.append('take', params.take.toString());
      }
      
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }

      // Add any additional parameters
      Object.keys(params).forEach(key => {
        if (!['filterType', 'signalInterestsEntities', 'signalInterestsTags', 'signalLocation', 'filterLocation', 'filterTags', 'take', 'page'].includes(key)) {
          queryParams.append(key, params[key]);
        }
      });

      const response = await this.makeRequest(`${url}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Qloo Insights API error:', error);
      return this.getFallbackInsights(params);
    }
  }

  /**
   * Get place recommendations
   */
  async getPlaceRecommendations(params: {
    interests?: string[];
    location?: string;
    tags?: string[];
    priceLevel?: { min?: number; max?: number };
    rating?: { min?: number; max?: number };
    take?: number;
  }): Promise<QlooEntity[]> {
    const insightsParams = {
      filterType: 'urn:entity:place',
      signalInterestsEntities: params.interests,
      signalInterestsTags: params.tags,
      signalLocation: params.location,
      take: params.take || 10,
    };

    if (params.priceLevel?.min) {
      insightsParams['filter.price_level.min'] = params.priceLevel.min;
    }
    if (params.priceLevel?.max) {
      insightsParams['filter.price_level.max'] = params.priceLevel.max;
    }
    if (params.rating?.min) {
      insightsParams['filter.rating.min'] = params.rating.min;
    }
    if (params.rating?.max) {
      insightsParams['filter.rating.max'] = params.rating.max;
    }

    const response = await this.getInsights(insightsParams);
    return response.results.entities || [];
  }

  /**
   * Get movie recommendations
   */
  async getMovieRecommendations(params: {
    interests?: string[];
    tags?: string[];
    releaseYear?: { min?: number; max?: number };
    contentRating?: string[];
    take?: number;
  }): Promise<QlooEntity[]> {
    const insightsParams = {
      filterType: 'urn:entity:movie',
      signalInterestsEntities: params.interests,
      signalInterestsTags: params.tags,
      take: params.take || 10,
    };

    if (params.releaseYear?.min) {
      insightsParams['filter.release_year.min'] = params.releaseYear.min;
    }
    if (params.releaseYear?.max) {
      insightsParams['filter.release_year.max'] = params.releaseYear.max;
    }
    if (params.contentRating) {
      insightsParams['filter.content_rating'] = params.contentRating.join(',');
    }

    const response = await this.getInsights(insightsParams);
    return response.results.entities || [];
  }

  /**
   * Get music/artist recommendations
   */
  async getMusicRecommendations(params: {
    interests?: string[];
    tags?: string[];
    take?: number;
  }): Promise<QlooEntity[]> {
    const insightsParams = {
      filterType: 'urn:entity:artist',
      signalInterestsEntities: params.interests,
      signalInterestsTags: params.tags,
      take: params.take || 10,
    };

    const response = await this.getInsights(insightsParams);
    return response.results.entities || [];
  }

  /**
   * Get demographic insights
   */
  async getDemographicInsights(params: {
    entities?: string[];
    tags?: string[];
  }): Promise<any[]> {
    const insightsParams = {
      filterType: 'urn:demographics',
      signalInterestsEntities: params.entities,
      signalInterestsTags: params.tags,
    };

    const response = await this.getInsights(insightsParams);
    return response.results.demographics || [];
  }

  /**
   * Get heatmap data
   */
  async getHeatmap(params: {
    location: string;
    interests?: string[];
    tags?: string[];
    boundary?: string;
  }): Promise<any[]> {
    const insightsParams = {
      filterType: 'urn:heatmap',
      filterLocation: params.location,
      signalInterestsEntities: params.interests,
      signalInterestsTags: params.tags,
    };

    if (params.boundary) {
      insightsParams['output.heatmap.boundary'] = params.boundary;
    }

    const response = await this.getInsights(insightsParams);
    return response.results.heatmap || [];
  }

  /**
   * Get taste analysis (tags)
   */
  async getTasteAnalysis(params: {
    tagTypes?: string[];
    parentTypes?: string[];
    audiences?: string[];
    entities?: string[];
    tags?: string[];
    location?: string;
  }): Promise<any[]> {
    const insightsParams = {
      filterType: 'urn:tag',
      'filter.tag.types': params.tagTypes?.join(','),
      'filter.parents.types': params.parentTypes?.join(','),
      'signal.demographics.audiences': params.audiences?.join(','),
      signalInterestsEntities: params.entities,
      signalInterestsTags: params.tags,
      signalLocation: params.location,
    };

    const response = await this.getInsights(insightsParams);
    return response.results.tags || [];
  }

  // ===== LOOKUP APIs =====

  /**
   * Search for entities by name
   */
  async searchEntities(params: {
    query: string;
    types?: string[];
    location?: string;
    radius?: number;
    tags?: string[];
    take?: number;
    page?: number;
  }): Promise<QlooEntity[]> {
    const url = '/search';
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('query', params.query);
      
      if (params.types) {
        queryParams.append('types', params.types.join(','));
      }
      if (params.location) {
        queryParams.append('filter.location', params.location);
      }
      if (params.radius) {
        queryParams.append('filter.radius', params.radius.toString());
      }
      if (params.tags) {
        queryParams.append('filter.tags', params.tags.join(','));
      }
      if (params.take) {
        queryParams.append('take', params.take.toString());
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }

      const response = await this.makeRequest(`${url}?${queryParams.toString()}`);
      return response.results || [];
    } catch (error) {
      console.error('Qloo Search API error:', error);
      return this.getFallbackEntities(params.query);
    }
  }

  /**
   * Get entities by IDs
   */
  async getEntitiesByIds(entityIds: string[]): Promise<QlooEntity[]> {
    const url = `${this.baseUrl}/entities`;
    
    try {
      const queryParams = new URLSearchParams();
      entityIds.forEach(id => queryParams.append('entity_ids', id));

      const response = await this.makeRequest(`${url}?${queryParams.toString()}`);
      return response.results || [];
    } catch (error) {
      console.error('Qloo Entities API error:', error);
      return [];
    }
  }

  /**
   * Find audiences
   */
  async findAudiences(params: {
    parentTypes?: string[];
    audienceTypes?: string[];
    popularityMin?: number;
    popularityMax?: number;
    take?: number;
    page?: number;
  }): Promise<any[]> {
    const url = `${this.baseUrl}/v2/audiences`;
    
    try {
      const queryParams = new URLSearchParams();
      
      if (params.parentTypes) {
        queryParams.append('filter.parents.types', params.parentTypes.join(','));
      }
      if (params.audienceTypes) {
        queryParams.append('filter.audience.types', params.audienceTypes.join(','));
      }
      if (params.popularityMin) {
        queryParams.append('filter.popularity.min', params.popularityMin.toString());
      }
      if (params.popularityMax) {
        queryParams.append('filter.popularity.max', params.popularityMax.toString());
      }
      if (params.take) {
        queryParams.append('take', params.take.toString());
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }

      const response = await this.makeRequest(`${url}?${queryParams.toString()}`);
      return response.results || [];
    } catch (error) {
      console.error('Qloo Audiences API error:', error);
      return [];
    }
  }

  /**
   * Get audience types
   */
  async getAudienceTypes(params?: {
    parentTypes?: string[];
    take?: number;
    page?: number;
  }): Promise<any[]> {
    const url = `${this.baseUrl}/v2/audiences/types`;
    
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.parentTypes) {
        queryParams.append('filter.parents.types', params.parentTypes.join(','));
      }
      if (params?.take) {
        queryParams.append('take', params.take.toString());
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }

      const response = await this.makeRequest(`${url}?${queryParams.toString()}`);
      return response.results || [];
    } catch (error) {
      console.error('Qloo Audience Types API error:', error);
      return [];
    }
  }

  /**
   * Search for tags
   */
  async searchTags(params: {
    query?: string;
    tagTypes?: string[];
    parentTypes?: string[];
    popularityMin?: number;
    popularityMax?: number;
    typoTolerance?: boolean;
    take?: number;
    page?: number;
  }): Promise<any[]> {
    const url = `${this.baseUrl}/v2/tags`;
    
    try {
      const queryParams = new URLSearchParams();
      
      if (params.query) {
        queryParams.append('filter.query', params.query);
      }
      if (params.tagTypes) {
        queryParams.append('filter.tag.types', params.tagTypes.join(','));
      }
      if (params.parentTypes) {
        queryParams.append('filter.parents.types', params.parentTypes.join(','));
      }
      if (params.popularityMin) {
        queryParams.append('filter.popularity.min', params.popularityMin.toString());
      }
      if (params.popularityMax) {
        queryParams.append('filter.popularity.max', params.popularityMax.toString());
      }
      if (params.typoTolerance) {
        queryParams.append('feature.typo_tolerance', 'true');
      }
      if (params.take) {
        queryParams.append('take', params.take.toString());
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }

      const response = await this.makeRequest(`${url}?${queryParams.toString()}`);
      return response.results || [];
    } catch (error) {
      console.error('Qloo Tags Search API error:', error);
      return [];
    }
  }

  /**
   * Get tag types
   */
  async getTagTypes(params?: {
    parentTypes?: string[];
    take?: number;
    page?: number;
  }): Promise<any[]> {
    const url = `${this.baseUrl}/v2/tags/types`;
    
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.parentTypes) {
        queryParams.append('filter.parents.types', params.parentTypes.join(','));
      }
      if (params?.take) {
        queryParams.append('take', params.take.toString());
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }

      const response = await this.makeRequest(`${url}?${queryParams.toString()}`);
      return response.results || [];
    } catch (error) {
      console.error('Qloo Tag Types API error:', error);
      return [];
    }
  }

  // ===== ANALYSIS & TRENDS APIs =====

  /**
   * Analyze a group of entities
   */
  async analyzeEntities(params: {
    entityIds: string[];
    filterType?: string[];
    model?: string;
    filterSubtype?: string;
    take?: number;
    page?: number;
  }): Promise<QlooAnalysisResponse> {
    const url = `${this.baseUrl}/analysis`;
    
    try {
      const queryParams = new URLSearchParams();
      params.entityIds.forEach(id => queryParams.append('entity_ids', id));
      
      if (params.filterType) {
        queryParams.append('filter.type', params.filterType.join(','));
      }
      if (params.model) {
        queryParams.append('model', params.model);
      }
      if (params.filterSubtype) {
        queryParams.append('filter.subtype', params.filterSubtype);
      }
      if (params.take) {
        queryParams.append('take', params.take.toString());
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }

      const response = await this.makeRequest(`${url}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Qloo Analysis API error:', error);
      return { results: { tags: [], insights: [] } };
    }
  }

  /**
   * Compare two groups of entities
   */
  async compareEntities(params: {
    groupA: string[];
    groupB: string[];
    filterType?: string[];
    model?: string;
    filterSubtype?: string;
    take?: number;
    page?: number;
  }): Promise<any> {
    const url = `${this.baseUrl}/v2/insights/compare`;
    
    try {
      const queryParams = new URLSearchParams();
      params.groupA.forEach(id => queryParams.append('a.signal.interests.entities', id));
      params.groupB.forEach(id => queryParams.append('b.signal.interests.entities', id));
      
      if (params.filterType) {
        queryParams.append('filter.type', params.filterType.join(','));
      }
      if (params.model) {
        queryParams.append('model', params.model);
      }
      if (params.filterSubtype) {
        queryParams.append('filter.subtype', params.filterSubtype);
      }
      if (params.take) {
        queryParams.append('take', params.take.toString());
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }

      const response = await this.makeRequest(`${url}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Qloo Compare API error:', error);
      return { results: { comparison: [] } };
    }
  }

  /**
   * Get trending data for entities
   */
  async getTrendingData(params: {
    entities: string[];
    filterType: string;
    startDate: string;
    endDate: string;
    take?: number;
    page?: number;
  }): Promise<QlooTrendingResponse> {
    const url = `${this.baseUrl}/v2/trending`;
    
    try {
      const queryParams = new URLSearchParams();
      params.entities.forEach(id => queryParams.append('signal.interests.entities', id));
      queryParams.append('filter.type', params.filterType);
      queryParams.append('filter.start_date', params.startDate);
      queryParams.append('filter.end_date', params.endDate);
      
      if (params.take) {
        queryParams.append('take', params.take.toString());
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }

      const response = await this.makeRequest(`${url}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Qloo Trending API error:', error);
      return { results: { entities: [], trending_data: [] } };
    }
  }

  // ===== UTILITY METHODS =====

  private async makeRequest(url: string, options?: RequestInit): Promise<any> {
    if (!this.apiKey) {
      console.error('Qloo API key is missing');
      throw new Error('Qloo API key is not configured');
    }

    const headers = {
      'X-Api-Key': this.apiKey,
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    try {
      console.debug('Making Qloo API request:', {
        url: this.baseUrl + url,
        method: options?.method || 'GET',
      });

      const response = await fetch(this.baseUrl + url, {
        ...options,
        headers,
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse Qloo API response:', responseText);
        throw new Error('Invalid JSON response from Qloo API');
      }

      if (!response.ok) {
        console.error('Qloo API error:', {
          status: response.status,
          statusText: response.statusText,
          error: responseText,
          url: this.baseUrl + url,
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error('Qloo API key is invalid or unauthorized');
        }
        if (response.status === 429) {
          throw new Error('Qloo API rate limit exceeded');
        }
        throw new Error(`Qloo API error: ${response.status} ${response.statusText}${responseText ? ` - ${responseText}` : ''}`);
      }

      return responseData;
    } catch (error) {
      console.error('Qloo API request error:', error);
      throw error;
    }
  }

  private getFallbackInsights(params: any): QlooInsightsResponse {
    const fallbackEntities = this.getFallbackEntities(params.signalInterestsEntities?.join(' ') || 'general');
    
    return {
      success: true,
      results: {
        entities: fallbackEntities,
      },
      duration: 100,
    };
  }

  private getFallbackEntities(query: string): QlooEntity[] {
    const fallbackData: Record<string, QlooEntity[]> = {
      'hip hop': [
        { 
          id: 'hiphop-venue-1', 
          name: 'Underground Hip Hop Club', 
          type: 'urn:entity:place',
          subtype: 'urn:entity:place:nightclub',
          tags: ['hip-hop', 'urban', 'nightlife'],
          popularity: 0.85,
          properties: {
            price_level: 2,
            rating: 4.2,
            address: '123 Beat Street'
          }
        },
        { 
          id: 'hiphop-venue-2', 
          name: 'Rap Battle Arena', 
          type: 'urn:entity:place',
          subtype: 'urn:entity:place:venue',
          tags: ['hip-hop', 'live', 'energy'],
          popularity: 0.78,
          properties: {
            price_level: 1,
            rating: 4.5,
            address: '456 Rhythm Ave'
          }
        },
      ],
      'steak': [
        { 
          id: 'steak-restaurant-1', 
          name: 'Prime Steakhouse', 
          type: 'urn:entity:place',
          subtype: 'urn:entity:place:restaurant',
          tags: ['steak', 'premium', 'meat'],
          popularity: 0.92,
          properties: {
            price_level: 4,
            rating: 4.7,
            cuisine: 'steakhouse'
          }
        },
        { 
          id: 'steak-restaurant-2', 
          name: 'Urban Grill', 
          type: 'urn:entity:place',
          subtype: 'urn:entity:place:restaurant',
          tags: ['steak', 'modern', 'hip'],
          popularity: 0.76,
          properties: {
            price_level: 3,
            rating: 4.3,
            cuisine: 'american'
          }
        },
      ],
      'jazz': [
        { 
          id: 'jazz-artist-1', 
          name: 'Miles Davis', 
          type: 'urn:entity:artist',
          tags: ['jazz', 'trumpet', 'legendary'],
          popularity: 0.95
        },
        { 
          id: 'jazz-venue-1', 
          name: 'Blue Note Jazz Club', 
          type: 'urn:entity:place',
          subtype: 'urn:entity:place:music_venue',
          tags: ['jazz', 'intimate', 'live_music'],
          popularity: 0.88,
          properties: {
            price_level: 3,
            rating: 4.6
          }
        },
      ],
      'sushi': [
        { 
          id: 'sushi-restaurant-1', 
          name: 'Omakase Sushi Bar', 
          type: 'urn:entity:place',
          subtype: 'urn:entity:place:restaurant',
          tags: ['sushi', 'japanese', 'omakase'],
          popularity: 0.89,
          properties: {
            price_level: 4,
            rating: 4.8,
            cuisine: 'japanese'
          }
        },
        { 
          id: 'sushi-restaurant-2', 
          name: 'Modern Sushi', 
          type: 'urn:entity:place',
          subtype: 'urn:entity:place:restaurant',
          tags: ['sushi', 'contemporary', 'fusion'],
          popularity: 0.72,
          properties: {
            price_level: 3,
            rating: 4.4,
            cuisine: 'japanese_fusion'
          }
        },
      ],
      'coffee': [
        { 
          id: 'coffee-shop-1', 
          name: 'Artisan Coffee Roasters', 
          type: 'urn:entity:place',
          subtype: 'urn:entity:place:cafe',
          tags: ['coffee', 'specialty', 'roastery'],
          popularity: 0.81,
          properties: {
            price_level: 2,
            rating: 4.5
          }
        },
        { 
          id: 'coffee-shop-2', 
          name: 'Cozy Corner Café', 
          type: 'urn:entity:place',
          subtype: 'urn:entity:place:cafe',
          tags: ['coffee', 'cozy', 'wifi'],
          popularity: 0.69,
          properties: {
            price_level: 2,
            rating: 4.2
          }
        },
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
      { 
        id: 'generic-venue-1', 
        name: 'Local Hotspot', 
        type: 'urn:entity:place',
        tags: ['popular', 'trendy'],
        popularity: 0.75,
        properties: {
          price_level: 2,
          rating: 4.0
        }
      },
      { 
        id: 'generic-restaurant-1', 
        name: 'Urban Eatery', 
        type: 'urn:entity:place',
        subtype: 'urn:entity:place:restaurant',
        tags: ['modern', 'casual'],
        popularity: 0.68,
        properties: {
          price_level: 2,
          rating: 4.1
        }
      },
    ];
  }

  /**
   * Build a comprehensive cultural profile from user interactions
   */
  async buildCulturalProfile(userInteractions: any[]): Promise<any> {
    const profile = {
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
        const entities = await this.searchEntities({
          query: interaction.content,
          take: 5
        });
        
        for (const entity of entities) {
          const category = this.categorizeEntity(entity);
          if (category && profile.corePreferences[category]) {
            profile.corePreferences[category].push(entity);
          }
        }
      }
    }

    return profile;
  }

  private categorizeEntity(entity: QlooEntity): string | null {
    const type = entity.type?.toLowerCase();
    const subtype = entity.subtype?.toLowerCase();
    
    if (type?.includes('artist') || subtype?.includes('music')) {
      return 'music';
    }
    if (type?.includes('movie') || type?.includes('film') || subtype?.includes('movie')) {
      return 'movies';
    }
    if (type?.includes('book') || type?.includes('author') || subtype?.includes('book')) {
      return 'books';
    }
    if (type?.includes('place') && (subtype?.includes('restaurant') || entity.tags?.some(tag => tag.includes('food')))) {
      return 'food';
    }
    if (entity.tags?.some(tag => ['aesthetic', 'style', 'design', 'art'].includes(tag))) {
      return 'aesthetics';
    }
    
    return null;
  }
}