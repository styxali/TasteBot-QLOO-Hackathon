import { Injectable } from '@nestjs/common';
import { MemorySystem, SavedPlan } from '../memory/memory-system.service';

interface PlanVenue {
  id: string;
  name: string;
  category: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  priceLevel?: number;
  openingHours?: string;
  estimatedDuration?: number; // in minutes
  culturalTags?: string[];
}

interface PlanActivity {
  id: string;
  title: string;
  description: string;
  venue?: PlanVenue;
  startTime?: string;
  duration?: number; // in minutes
  type: 'dining' | 'entertainment' | 'cultural' | 'shopping' | 'outdoor' | 'other';
  culturalRelevance?: number; // 0-1 score
}

interface EnhancedPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  venues: PlanVenue[];
  activities: PlanActivity[];
  timeline: {
    startTime: string;
    endTime: string;
    totalDuration: number;
  };
  culturalProfile: {
    dominantThemes: string[];
    aestheticStyle: string;
    moodTone: string;
  };
  logistics: {
    totalDistance?: number;
    transportationMode?: string;
    estimatedCost?: {
      min: number;
      max: number;
    };
  };
  metadata: {
    createdAt: Date;
    lastModified: Date;
    version: number;
    tags: string[];
    shareableLink?: string;
  };
}

@Injectable()
export class PlanManagementService {
  constructor(private readonly memorySystem: MemorySystem) {}

  async createEnhancedPlan(
    userId: string,
    planData: {
      title: string;
      description: string;
      venues: any[];
      activities: any[];
      culturalContext: string[];
    }
  ): Promise<EnhancedPlan> {
    const enhancedVenues = this.enhanceVenues(planData.venues);
    const enhancedActivities = this.enhanceActivities(planData.activities, enhancedVenues);
    
    const timeline = this.calculateTimeline(enhancedActivities);
    const culturalProfile = this.analyzeCulturalProfile(planData.culturalContext, enhancedVenues);
    const logistics = this.calculateLogistics(enhancedVenues);

    const enhancedPlan: EnhancedPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title: planData.title,
      description: planData.description,
      venues: enhancedVenues,
      activities: enhancedActivities,
      timeline,
      culturalProfile,
      logistics,
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1,
        tags: this.generateTags(culturalProfile, enhancedActivities),
      },
    };

    // Save to memory system
    await this.memorySystem.savePlan({
      userId,
      title: enhancedPlan.title,
      description: enhancedPlan.description,
      venues: enhancedPlan.venues,
      activities: enhancedPlan.activities,
      metadata: enhancedPlan,
    });

    return enhancedPlan;
  }

  private enhanceVenues(venues: any[]): PlanVenue[] {
    return venues.map((venue, index) => ({
      id: venue.fsq_id || venue.id || `venue_${index}`,
      name: venue.name || 'Unknown Venue',
      category: venue.categories?.[0]?.name || 'General',
      address: venue.location?.formatted_address || venue.location?.address || 'Address not available',
      coordinates: venue.geocodes?.main ? {
        lat: venue.geocodes.main.latitude,
        lng: venue.geocodes.main.longitude,
      } : undefined,
      rating: venue.rating,
      priceLevel: venue.price,
      openingHours: venue.hours?.display,
      estimatedDuration: this.estimateVenueDuration(venue.categories?.[0]?.name),
      culturalTags: this.extractCulturalTags(venue),
    }));
  }

  private enhanceActivities(activities: any[], venues: PlanVenue[]): PlanActivity[] {
    return activities.map((activity, index) => {
      const relatedVenue = venues.find(v => 
        activity.venueId === v.id || 
        activity.venueName === v.name
      );

      return {
        id: activity.id || `activity_${index}`,
        title: activity.title || activity.name || 'Activity',
        description: activity.description || 'Experience this location',
        venue: relatedVenue,
        startTime: activity.startTime,
        duration: activity.duration || relatedVenue?.estimatedDuration || 60,
        type: this.categorizeActivity(activity, relatedVenue),
        culturalRelevance: this.calculateCulturalRelevance(activity, relatedVenue),
      };
    });
  }

  private estimateVenueDuration(category?: string): number {
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('restaurant') || categoryLower.includes('dining')) return 90;
    if (categoryLower.includes('bar') || categoryLower.includes('pub')) return 120;
    if (categoryLower.includes('cafe') || categoryLower.includes('coffee')) return 45;
    if (categoryLower.includes('museum') || categoryLower.includes('gallery')) return 120;
    if (categoryLower.includes('shop') || categoryLower.includes('store')) return 60;
    if (categoryLower.includes('park') || categoryLower.includes('outdoor')) return 90;
    
    return 60; // Default 1 hour
  }

  private extractCulturalTags(venue: any): string[] {
    const tags: string[] = [];
    const name = venue.name?.toLowerCase() || '';
    const category = venue.categories?.[0]?.name?.toLowerCase() || '';
    
    // Extract cultural indicators from name and category
    const culturalKeywords = [
      'indie', 'hipster', 'artisan', 'craft', 'local', 'authentic',
      'vintage', 'retro', 'modern', 'contemporary', 'traditional',
      'underground', 'alternative', 'trendy', 'classic', 'bohemian',
    ];

    culturalKeywords.forEach(keyword => {
      if (name.includes(keyword) || category.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return tags;
  }

  private categorizeActivity(activity: any, venue?: PlanVenue): PlanActivity['type'] {
    const activityText = (activity.title || activity.description || '').toLowerCase();
    const venueCategory = venue?.category?.toLowerCase() || '';

    if (activityText.includes('eat') || activityText.includes('dine') || venueCategory.includes('restaurant')) {
      return 'dining';
    }
    if (activityText.includes('drink') || activityText.includes('bar') || venueCategory.includes('bar')) {
      return 'entertainment';
    }
    if (activityText.includes('art') || activityText.includes('museum') || venueCategory.includes('gallery')) {
      return 'cultural';
    }
    if (activityText.includes('shop') || venueCategory.includes('shop')) {
      return 'shopping';
    }
    if (activityText.includes('park') || activityText.includes('outdoor') || venueCategory.includes('outdoor')) {
      return 'outdoor';
    }

    return 'other';
  }

  private calculateCulturalRelevance(activity: any, venue?: PlanVenue): number {
    let relevance = 0.5; // Base relevance

    // Boost based on cultural tags
    if (venue?.culturalTags && venue.culturalTags.length > 0) {
      relevance += venue.culturalTags.length * 0.1;
    }

    // Boost based on venue rating
    if (venue?.rating && venue.rating > 4.0) {
      relevance += 0.2;
    }

    // Boost based on activity type
    if (activity.type === 'cultural') {
      relevance += 0.3;
    }

    return Math.min(relevance, 1.0);
  }

  private calculateTimeline(activities: PlanActivity[]): EnhancedPlan['timeline'] {
    const totalDuration = activities.reduce((sum, activity) => sum + (activity.duration || 60), 0);
    
    // Assume starting at current time or a reasonable default
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + totalDuration * 60 * 1000);

    return {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalDuration,
    };
  }

  private analyzeCulturalProfile(
    culturalContext: string[],
    venues: PlanVenue[]
  ): EnhancedPlan['culturalProfile'] {
    // Extract dominant themes from cultural context and venue tags
    const allTags = [
      ...culturalContext,
      ...venues.flatMap(v => v.culturalTags || []),
    ];

    const tagCounts = allTags.reduce((counts, tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const dominantThemes = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);

    // Determine aesthetic style
    const aestheticStyle = this.determineAestheticStyle(dominantThemes);
    
    // Determine mood tone
    const moodTone = this.determineMoodTone(dominantThemes, venues);

    return {
      dominantThemes,
      aestheticStyle,
      moodTone,
    };
  }

  private determineAestheticStyle(themes: string[]): string {
    if (themes.includes('vintage') || themes.includes('retro')) return 'vintage';
    if (themes.includes('modern') || themes.includes('contemporary')) return 'modern';
    if (themes.includes('indie') || themes.includes('alternative')) return 'indie';
    if (themes.includes('traditional') || themes.includes('classic')) return 'traditional';
    if (themes.includes('artisan') || themes.includes('craft')) return 'artisanal';
    
    return 'eclectic';
  }

  private determineMoodTone(themes: string[], venues: PlanVenue[]): string {
    const venueTypes = venues.map(v => v.category.toLowerCase());
    
    if (venueTypes.some(type => type.includes('bar') || type.includes('nightlife'))) {
      return 'energetic';
    }
    if (venueTypes.some(type => type.includes('cafe') || type.includes('park'))) {
      return 'relaxed';
    }
    if (themes.includes('bohemian') || themes.includes('artisan')) {
      return 'creative';
    }
    if (themes.includes('upscale') || themes.includes('sophisticated')) {
      return 'elegant';
    }
    
    return 'balanced';
  }

  private calculateLogistics(venues: PlanVenue[]): EnhancedPlan['logistics'] {
    // Calculate total distance between venues
    let totalDistance = 0;
    for (let i = 0; i < venues.length - 1; i++) {
      const venue1 = venues[i];
      const venue2 = venues[i + 1];
      
      if (venue1.coordinates && venue2.coordinates) {
        totalDistance += this.calculateDistance(
          venue1.coordinates.lat,
          venue1.coordinates.lng,
          venue2.coordinates.lat,
          venue2.coordinates.lng
        );
      }
    }

    // Estimate transportation mode
    const transportationMode = totalDistance > 5 ? 'car' : totalDistance > 2 ? 'public_transport' : 'walking';

    // Estimate cost range
    const estimatedCost = this.estimatePlanCost(venues);

    return {
      totalDistance: Math.round(totalDistance * 100) / 100,
      transportationMode,
      estimatedCost,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private estimatePlanCost(venues: PlanVenue[]): { min: number; max: number } {
    let minCost = 0;
    let maxCost = 0;

    venues.forEach(venue => {
      const priceLevel = venue.priceLevel || 2;
      const category = venue.category.toLowerCase();

      if (category.includes('restaurant')) {
        minCost += priceLevel * 15;
        maxCost += priceLevel * 35;
      } else if (category.includes('bar')) {
        minCost += priceLevel * 10;
        maxCost += priceLevel * 25;
      } else if (category.includes('cafe')) {
        minCost += priceLevel * 5;
        maxCost += priceLevel * 15;
      } else {
        minCost += priceLevel * 5;
        maxCost += priceLevel * 20;
      }
    });

    return { min: minCost, max: maxCost };
  }

  private generateTags(culturalProfile: EnhancedPlan['culturalProfile'], activities: PlanActivity[]): string[] {
    const tags = [
      ...culturalProfile.dominantThemes,
      culturalProfile.aestheticStyle,
      culturalProfile.moodTone,
      ...activities.map(a => a.type),
    ];

    return [...new Set(tags)];
  }

  async getPlanAnalytics(planId: string): Promise<{
    culturalScore: number;
    diversityScore: number;
    logisticsScore: number;
    overallScore: number;
    recommendations: string[];
  }> {
    const plan = await this.memorySystem.getPlan(planId);
    
    if (!plan) {
      throw new Error('Plan not found');
    }

    const enhancedPlan = plan.metadata as EnhancedPlan;
    
    const culturalScore = this.calculateCulturalScore(enhancedPlan);
    const diversityScore = this.calculateDiversityScore(enhancedPlan);
    const logisticsScore = this.calculateLogisticsScore(enhancedPlan);
    const overallScore = (culturalScore + diversityScore + logisticsScore) / 3;
    
    const recommendations = this.generateRecommendations(enhancedPlan, {
      culturalScore,
      diversityScore,
      logisticsScore,
    });

    return {
      culturalScore,
      diversityScore,
      logisticsScore,
      overallScore,
      recommendations,
    };
  }

  private calculateCulturalScore(plan: EnhancedPlan): number {
    const avgCulturalRelevance = plan.activities.reduce(
      (sum, activity) => sum + (activity.culturalRelevance || 0.5),
      0
    ) / plan.activities.length;

    const themeConsistency = plan.culturalProfile.dominantThemes.length > 0 ? 0.8 : 0.4;
    
    return (avgCulturalRelevance + themeConsistency) / 2;
  }

  private calculateDiversityScore(plan: EnhancedPlan): number {
    const activityTypes = [...new Set(plan.activities.map(a => a.type))];
    const diversityRatio = activityTypes.length / Math.max(plan.activities.length, 1);
    
    return Math.min(diversityRatio * 2, 1.0);
  }

  private calculateLogisticsScore(plan: EnhancedPlan): number {
    let score = 0.5;
    
    // Penalize excessive travel distance
    if (plan.logistics.totalDistance && plan.logistics.totalDistance > 10) {
      score -= 0.3;
    } else if (plan.logistics.totalDistance && plan.logistics.totalDistance < 3) {
      score += 0.2;
    }
    
    // Boost for reasonable duration
    if (plan.timeline.totalDuration > 120 && plan.timeline.totalDuration < 480) {
      score += 0.3;
    }
    
    return Math.max(0, Math.min(score, 1.0));
  }

  private generateRecommendations(
    plan: EnhancedPlan,
    scores: { culturalScore: number; diversityScore: number; logisticsScore: number }
  ): string[] {
    const recommendations: string[] = [];
    
    if (scores.culturalScore < 0.6) {
      recommendations.push('Consider adding more culturally relevant venues that match your taste profile');
    }
    
    if (scores.diversityScore < 0.5) {
      recommendations.push('Add variety by including different types of activities (dining, cultural, entertainment)');
    }
    
    if (scores.logisticsScore < 0.6) {
      if (plan.logistics.totalDistance && plan.logistics.totalDistance > 10) {
        recommendations.push('Consider reducing travel distance between venues for a more relaxed experience');
      }
      if (plan.timeline.totalDuration > 480) {
        recommendations.push('Your plan might be too long - consider splitting into multiple sessions');
      }
    }
    
    if (plan.activities.length < 3) {
      recommendations.push('Add more activities to create a fuller experience');
    }
    
    return recommendations;
  }
}