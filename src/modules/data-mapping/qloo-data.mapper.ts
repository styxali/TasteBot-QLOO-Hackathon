import { Injectable } from '@nestjs/common';

export interface QlooEntityEnhanced {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  popularity: number;
  tags: string[];
  properties: any;
  cultural_significance: number;
  taste_profile_weight: number;
  user_affinity_score?: number;
}

export interface TasteBotHeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
  intensity: number;
  category: string;
  type: string;
  name?: string;
  geocode?: {
    city?: string;
    admin1_region?: string; // state/province
    admin2_region?: string; // county/borough
    country_code?: string;
    name?: string;
  };
  properties?: {
    cultural_affinity?: number;
    exploration_index?: number;
    price_sensitivity?: number;
    rating?: number;
    price_level?: number;
    popularity?: number;
  };
}

export interface QlooMappedData {
  entities: QlooEntityEnhanced[];
  cultural_insights: {
    type: 'demographics' | 'trends' | 'cultural_context';
    data: any;
    confidence?: number;
    relevance?: number;
    timestamp?: string;
  }[];
  taste_connections: {
    type: 'tag_relationships' | 'entity_relationships';
    data: Array<{
      id?: string;
      name?: string;
      type?: string;
      weight?: number;
      strength?: number;
      related_tags?: string[];
      path?: string[];
    }>;
  }[];
  heatmap?: TasteBotHeatmapPoint[];
}

@Injectable()
export class QlooDataMapper {
  mapForProfileEnhancement(response: any): QlooMappedData {
    const entities = response.results?.entities?.map(entity => ({
      id: entity.entity_id,
      name: entity.name,
      type: entity.type,
      subtype: entity.subtype,
      popularity: entity.popularity || 0,
      tags: entity.tags?.map(tag => tag.name) || [],
      properties: entity.properties || {},
      cultural_significance: this.calculateCulturalSignificance(entity),
      taste_profile_weight: this.calculateTasteWeight(entity),
      user_affinity_score: entity.user_affinity_score
    })) || [];

    const heatmap = response.results?.heatmap?.map(point => ({
      latitude: point.latitude || point.lat,
      longitude: point.longitude || point.lon,
      weight: point.weight || point.score || 0,
      intensity: point.intensity || point.weight || point.score || 0,
      category: point.category || point.type || 'general',
      type: point.type || 'cultural_affinity',
      name: point.name,
      geocode: {
        city: point.properties?.geocode?.city,
        admin1_region: point.properties?.geocode?.admin1_region,
        admin2_region: point.properties?.geocode?.admin2_region,
        country_code: point.properties?.geocode?.country_code,
        name: point.properties?.geocode?.name
      },
      properties: {
        cultural_affinity: point.properties?.cultural_affinity,
        exploration_index: point.properties?.exploration_index,
        price_sensitivity: point.properties?.price_sensitivity,
        rating: point.properties?.rating,
        price_level: point.properties?.price_level,
        popularity: point.properties?.popularity
      }
    }));

    return {
      entities,
      cultural_insights: this.extractCulturalInsights(response),
      taste_connections: this.extractTasteConnections(response),
      heatmap
    };
  }

  private calculateCulturalSignificance(entity: any): number {
    let score = entity.popularity || 0;
    if (entity.tags?.length > 5) score += 0.1;
    if (entity.properties?.rating > 4) score += 0.1;
    if (entity.properties?.cultural_weight) score += entity.properties.cultural_weight;
    return Math.min(score, 1);
  }

  private calculateTasteWeight(entity: any): number {
    const culturalTags = [
      'jazz', 'hip-hop', 'indie', 'vintage', 'modern',
      'traditional', 'fusion', 'experimental', 'classic',
      'contemporary', 'underground', 'mainstream'
    ];

    const matchingTags = entity.tags?.filter(tag => 
      culturalTags.some(cultural => tag.name?.toLowerCase().includes(cultural))
    ).length || 0;

    let weight = matchingTags / culturalTags.length;
    
    // Boost weight based on entity properties
    if (entity.properties?.is_trending) weight += 0.2;
    if (entity.properties?.is_local_favorite) weight += 0.1;
    if (entity.properties?.awards?.length) weight += 0.1;

    return Math.min(weight, 1);
  }

  private extractCulturalInsights(response: any): any[] {
    const insights = [];

    // Extract demographic data
    if (response.results?.demographics) {
      insights.push({
        type: 'demographics',
        data: response.results.demographics,
        confidence: response.results.demographic_confidence || 0.5,
        relevance: response.results.demographic_relevance || 0.5,
        timestamp: new Date().toISOString()
      });
    }

    // Extract trending data with week-over-week data if available
    if (response.results?.trending) {
      insights.push({
        type: 'trends',
        data: {
          current: response.results.trending,
          weekOverWeek: response.results.trending_week_over_week,
          trendStrength: response.results.trend_strength
        },
        confidence: response.results.trend_confidence || 0.5,
        timestamp: new Date().toISOString()
      });
    }

    // Extract cultural context with geographical and temporal factors
    if (response.results?.cultural_context) {
      insights.push({
        type: 'cultural_context',
        data: {
          context: response.results.cultural_context,
          localFactors: response.results.local_cultural_factors,
          temporalTrends: response.results.temporal_cultural_trends
        },
        relevance: response.results.context_relevance || 0.5,
        confidence: response.results.context_confidence || 0.5,
        timestamp: new Date().toISOString()
      });
    }

    return insights;
  }

  private extractTasteConnections(response: any): any[] {
    const connections = [];

    // Extract tag relationships with enhanced metadata
    if (response.results?.tags) {
      connections.push({
        type: 'tag_relationships',
        data: response.results.tags.map(tag => ({
          name: tag.name,
          type: tag.type || 'general',
          weight: tag.weight || 1,
          related_tags: tag.related || [],
          category: tag.category,
          parent_types: tag.parent_types || [],
          popularity: tag.popularity,
          cultural_relevance: tag.cultural_relevance || 0.5
        }))
      });
    }

    // Extract entity relationships with enhanced connection data
    if (response.results?.related_entities) {
      connections.push({
        type: 'entity_relationships',
        data: response.results.related_entities.map(entity => ({
          id: entity.id,
          name: entity.name,
          type: entity.type,
          strength: entity.connection_strength || 0.5,
          path: entity.connection_path || [],
          affinity_score: entity.affinity_score,
          connection_type: entity.connection_type || 'general',
          shared_attributes: entity.shared_attributes || [],
          temporal_relevance: entity.temporal_relevance || 1
        }))
      });
    }

    return connections;
  }
}
