import { Injectable } from '@nestjs/common';

export interface FoursquareVenueEnhanced {
  id: string;
  name: string;
  address: string;
  category: string;
  rating?: number;
  price?: number;
  distance?: number;
  photos: string[];
  hours?: any;
  website?: string;
  phone?: string;
  cultural_vibe: string[];
  ambiance_score: number;
  user_preference_match?: number;
}

export interface FoursquareMappedData {
  venues: FoursquareVenueEnhanced[];
  location_insights: any[];
  category_preferences: any[];
}

@Injectable()
export class FoursquareDataMapper {
  static mapForProfileEnhancement(response: any): FoursquareMappedData {
    const venues = response.results?.map(venue => ({
      id: venue.fsq_id,
      name: venue.name,
      address: venue.location?.formatted_address || '',
      category: venue.categories?.[0]?.name || 'Unknown',
      rating: venue.rating,
      price: venue.price,
      distance: venue.distance,
      photos: venue.photos?.map(photo => `${photo.prefix}300x300${photo.suffix}`) || [],
      hours: venue.hours,
      website: venue.website,
      phone: venue.tel,
      cultural_vibe: this.extractCulturalVibe(venue),
      ambiance_score: this.calculateAmbianceScore(venue),
    })) || [];

    return {
      venues,
      location_insights: this.extractLocationInsights(response),
      category_preferences: this.extractCategoryPreferences(response),
    };
  }

  private static extractCulturalVibe(venue: any): string[] {
    const vibes = [];
    
    // Quality-based vibes
    if (venue.rating > 4.5) vibes.push('high-quality');
    if (venue.rating < 3.5) vibes.push('casual');
    
    // Price-based vibes
    if (venue.price >= 4) vibes.push('luxury');
    if (venue.price >= 3) vibes.push('upscale');
    if (venue.price <= 2) vibes.push('budget-friendly');
    
    // Category-based vibes
    const category = venue.categories?.[0]?.name?.toLowerCase() || '';
    if (category.includes('coffee')) vibes.push('cafe-culture');
    if (category.includes('bar')) vibes.push('nightlife');
    if (category.includes('restaurant')) vibes.push('dining');
    if (category.includes('art')) vibes.push('artistic');
    if (category.includes('music')) vibes.push('musical');
    
    // Features-based vibes
    if (venue.attributes?.groups) {
      const attributes = venue.attributes.groups.flatMap(g => g.items);
      if (attributes.includes('outdoor')) vibes.push('outdoor');
      if (attributes.includes('live music')) vibes.push('live-entertainment');
      if (attributes.includes('rooftop')) vibes.push('rooftop');
    }
    
    return vibes;
  }

  private static calculateAmbianceScore(venue: any): number {
    let score = 0.5; // Base score

    // Rating contribution (max 0.3)
    if (venue.rating) {
      score += ((venue.rating - 3) / 10) * 0.3;
    }

    // Price contribution (max 0.2)
    if (venue.price) {
      score += (venue.price / 20) * 0.2;
    }

    // Popular times contribution (max 0.2)
    if (venue.popular && venue.popular.peak_hours) {
      const isPeakHour = venue.popular.peak_hours.includes(new Date().getHours());
      if (isPeakHour) score += 0.2;
    }

    // Photos contribution (max 0.15)
    if (venue.photos?.length > 0) {
      score += Math.min(venue.photos.length / 20, 1) * 0.15;
    }

    // Attributes contribution (max 0.15)
    if (venue.attributes?.groups) {
      const totalAttributes = venue.attributes.groups.reduce((sum, g) => sum + g.items.length, 0);
      score += Math.min(totalAttributes / 10, 1) * 0.15;
    }

    return Math.max(0, Math.min(1, score));
  }

  private static extractLocationInsights(response: any): any[] {
    const insights = [];

    // Analyze venue distribution
    if (response.results?.length > 0) {
      const locations = response.results.map(venue => ({
        lat: venue.geocodes?.main?.latitude,
        lng: venue.geocodes?.main?.longitude,
        category: venue.categories?.[0]?.name,
        rating: venue.rating,
        price: venue.price
      }));

      insights.push({
        type: 'venue_distribution',
        locations,
        timestamp: new Date().toISOString()
      });
    }

    // Analyze neighborhood characteristics
    const neighborhoods = response.context?.neighborhoods || [];
    if (neighborhoods.length > 0) {
      insights.push({
        type: 'neighborhood_analysis',
        neighborhoods: neighborhoods.map(n => ({
          name: n.name,
          characteristics: n.characteristics || [],
          venue_density: n.venue_count || 0
        }))
      });
    }

    return insights;
  }

  private static extractCategoryPreferences(response: any): any[] {
    const preferences = [];
    const categoryCount = new Map();

    // Count category occurrences
    response.results?.forEach(venue => {
      venue.categories?.forEach(category => {
        const count = categoryCount.get(category.name) || 0;
        categoryCount.set(category.name, count + 1);
      });
    });

    // Calculate category weights
    const total = response.results?.length || 1;
    categoryCount.forEach((count, category) => {
      preferences.push({
        category,
        weight: count / total,
        count,
        examples: response.results
          ?.filter(v => v.categories?.some(c => c.name === category))
          ?.map(v => v.name)
          ?.slice(0, 3)
      });
    });

    return preferences.sort((a, b) => b.weight - a.weight);
  }
}
