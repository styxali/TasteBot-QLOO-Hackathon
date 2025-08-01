import { Injectable } from '@nestjs/common';
import { QlooDataMapper, QlooEntityEnhanced } from '../data-mapping/qloo-data.mapper';
import { FoursquareDataMapper, FoursquareVenueEnhanced } from '../data-mapping/foursquare-data.mapper';
import { MemorySystem } from '../memory/memory-system.service';

// Base interfaces
export interface PreferenceItem {
  id: string;
  name: string;
  weight: number;
  lastUpdated: string;
  source: string;
  confidence: number;
}

export interface WorkingPreferences {
  music: PreferenceItem[];
  food: PreferenceItem[];
  location: PreferenceItem[];
  aesthetic: PreferenceItem[];
  activities: PreferenceItem[];
}

export interface StoredPreferences {
  music: PreferenceItem[];
  movies: PreferenceItem[];
  books: PreferenceItem[];
  food: PreferenceItem[];
  aesthetics: PreferenceItem[];
}

export interface CulturalConnections {
  cultural_affinity: number;
  exploration_index: number;
  price_sensitivity: number;
  location_patterns: any[];
}

export interface PersonalityInsights {
  openness: number;
  adventurousness: number;
  cultural_curiosity: number;
}

export interface TasteEvent {
  timestamp: string;
  changes: Array<{
    type: string;
    strength: number;
  }>;
}

export interface Interaction {
  timestamp: string;
  type: string;
  data: any;
}

export interface CategoryPreference {
  category: string;
  weight: number;
  count: number;
}

export interface CulturalInsight {
  type: 'demographics' | 'trends';
  confidence: number;
  data: any;
  personality_indicators?: {
    openness?: number;
    adventurousness?: number;
    cultural_curiosity?: number;
  };
}

export interface TasteProfile {
  userId: string;
  corePreferences: {
    music: any[];
    movies: any[];
    books: any[];
    food: any[];
    aesthetics: any[];
  };
  culturalConnections: any[];
  tasteEvolution: {
    timeline: any[];
    patterns: any[];
  };
  personalityInsights: any[];
  lastUpdated: Date;
}

export interface WorkingProfile {
  userId: string;
  corePreferences: WorkingPreferences;
  culturalConnections: any[];
  tasteEvolution: {
    timeline: any[];
    patterns: any[];
  };
  personalityInsights: any[];
  lastUpdated: Date;
  recentInteractions?: Interaction[];
}

@Injectable()
export class ProfileEnhancementService {
  constructor(
    private readonly memorySystem: MemorySystem,
    private readonly qlooMapper: QlooDataMapper,
    private readonly foursquareMapper: FoursquareDataMapper
  ) {}

  async getOrCreateProfile(userId: string): Promise<TasteProfile> {
    const existingProfile = await this.memorySystem.getTasteProfile(userId);
    
    if (!existingProfile) {
      return {
        userId,
        corePreferences: {
          music: [],
          movies: [],
          books: [],
          food: [],
          aesthetics: []
        },
        culturalConnections: [],
        tasteEvolution: {
          timeline: [],
          patterns: []
        },
        personalityInsights: [],
        lastUpdated: new Date()
      };
    }

    return {
      userId: existingProfile.userId,
      corePreferences: {
        music: Array.isArray(existingProfile.corePreferences?.music) ? existingProfile.corePreferences.music : [],
        movies: Array.isArray(existingProfile.corePreferences?.movies) ? existingProfile.corePreferences.movies : [],
        books: Array.isArray(existingProfile.corePreferences?.books) ? existingProfile.corePreferences.books : [],
        food: Array.isArray(existingProfile.corePreferences?.food) ? existingProfile.corePreferences.food : [],
        aesthetics: Array.isArray(existingProfile.corePreferences?.aesthetics) ? existingProfile.corePreferences.aesthetics : []
      },
      culturalConnections: [],
      tasteEvolution: {
        timeline: existingProfile.tasteEvolution?.timeline || [],
        patterns: []
      },
      personalityInsights: [],
      lastUpdated: new Date()
    };
  }

  async enhanceProfile(userId: string, venues: FoursquareVenueEnhanced[], qlooData: QlooEntityEnhanced[]): Promise<void> {
    const baseProfile = await this.getOrCreateProfile(userId);
    const workingProfile = this.convertToWorkingProfile(baseProfile);
    
    if (venues.length > 0) {
      this.updateLocationPreferences(workingProfile, venues);
    }
    
    if (qlooData && qlooData.length > 0) {
      this.processQlooData(workingProfile, qlooData);
    }
    
    const updatedBaseProfile = this.convertToBaseProfile(workingProfile);
    await this.memorySystem.updateTasteProfile(userId, {
      ...updatedBaseProfile,
      culturalConnections: [],
      tasteEvolution: {
        timeline: Array.isArray(updatedBaseProfile.tasteEvolution?.timeline) 
          ? updatedBaseProfile.tasteEvolution.timeline 
          : [],
        patterns: []
      },
      personalityInsights: [],
      lastUpdated: new Date()
    });
  }

  private convertToWorkingProfile(base: TasteProfile): WorkingProfile {
    return {
      userId: base.userId,
      corePreferences: {
        music: Array.isArray(base.corePreferences?.music) ? base.corePreferences.music : [],
        food: Array.isArray(base.corePreferences?.food) ? base.corePreferences.food : [],
        location: [],
        aesthetic: Array.isArray(base.corePreferences?.aesthetics) ? base.corePreferences.aesthetics : [],
        activities: []
      },
      culturalConnections: [],
      tasteEvolution: base.tasteEvolution || { timeline: [], patterns: [] },
      personalityInsights: [],
      lastUpdated: base.lastUpdated instanceof Date ? base.lastUpdated : new Date(),
      recentInteractions: []
    };
  }

  private convertToBaseProfile(working: WorkingProfile): Partial<TasteProfile> {
    return {
      userId: working.userId,
      corePreferences: {
        music: working.corePreferences.music || [],
        movies: [],
        books: [],
        food: working.corePreferences.food || [],
        aesthetics: working.corePreferences.aesthetic || []
      },
      culturalConnections: [],
      tasteEvolution: working.tasteEvolution || { timeline: [], patterns: [] },
      personalityInsights: [],
      lastUpdated: new Date()
    };
  }
  private processQlooData(profile: WorkingProfile, qlooData: QlooEntityEnhanced[]): void {
    const categoryPreferences = this.extractCategoryPreferences(qlooData);
    this.updateCategoryPreferences(profile, categoryPreferences);

    const culturalInsights = this.extractCulturalInsights(qlooData);
    this.updateCulturalInsights(profile, culturalInsights);
  }

  private extractCategoryPreferences(data: QlooEntityEnhanced[]): CategoryPreference[] {
    return data.map(item => ({
      category: (item as any).category || 'unknown',
      weight: (item as any).weight || 0.5,
      count: (item as any).count || 1
    }));
  }

  private extractCulturalInsights(data: QlooEntityEnhanced[]): CulturalInsight[] {
    return data.map(item => ({
      type: (item as any).type as 'demographics' | 'trends',
      confidence: (item as any).confidence || 0.5,
      data: (item as any).data || {},
      personality_indicators: (item as any).personality_indicators || []
    }));
  }

  private ensurePreferenceList(preferences: WorkingPreferences, key: keyof WorkingPreferences): void {
    if (!preferences[key]) {
      preferences[key] = [];
    }
  }

  private updateCategoryPreferences(profile: WorkingProfile, preferences: CategoryPreference[]): void {
    preferences.forEach(category => {
      if (!category.category) return;

      const preference: PreferenceItem = {
        id: `category_${category.category}`,
        name: category.category,
        weight: category.weight || 0.5,
        lastUpdated: new Date().toISOString(),
        source: 'category',
        confidence: category.count > 5 ? 0.8 : 0.6
      };

      const listKey = this.determineCategoryType(category.category);
      this.ensurePreferenceList(profile.corePreferences, listKey);
      this.updatePreferenceList(profile.corePreferences[listKey], preference);
    });
  }

  private updateCulturalInsights(profile: WorkingProfile, insights: CulturalInsight[]): void {
    this.ensureProfileConnections(profile);

    insights.forEach(insight => {
      switch (insight.type) {
        case 'demographics':
          this.updateDemographicInsights(profile, insight);
          break;
        case 'trends':
          this.updateTrendInsights(profile, insight);
          break;
      }

      if (insight.personality_indicators) {
        this.updatePersonalityInsights(profile, insight.personality_indicators);
      }
    });
  }

  private ensureProfileConnections(profile: WorkingProfile): void {
    if (!Array.isArray(profile.culturalConnections)) {
      profile.culturalConnections = [];
    }
  }

  private updateDemographicInsights(profile: WorkingProfile, insight: CulturalInsight): void {
    profile.culturalConnections.push({
      type: 'demographics',
      confidence: insight.confidence,
      data: {
        affinity: insight.confidence || 0.5,
        sensitivity: insight.confidence || 0.5
      }
    });
  }

  private updateTrendInsights(profile: WorkingProfile, insight: CulturalInsight): void {
    profile.culturalConnections.push({
      type: 'trends',
      confidence: insight.confidence,
      data: {
        exploration: insight.confidence || 0.5
      }
    });
  }

  private updatePersonalityInsights(profile: WorkingProfile, insights: any): void {
    profile.personalityInsights.push({
      timestamp: new Date().toISOString(),
      metrics: {
        openness: insights.openness || 0.5,
        adventurousness: insights.adventurousness || 0.5,
        cultural_curiosity: insights.cultural_curiosity || 0.5
      }
    });
  }

 

  private updateLocationPreferences(profile: WorkingProfile, venues: FoursquareVenueEnhanced[]): void {
    this.ensurePreferenceList(profile.corePreferences, 'location');
    
    venues.forEach(venue => {
      if (!venue.id || !venue.name) return;

      const preference: PreferenceItem = {
        id: venue.id,
        name: venue.name,
        weight: (venue as any).score || 0.5,
        lastUpdated: new Date().toISOString(),
        source: 'foursquare',
        confidence: venue.rating ? venue.rating / 10 : 0.5
      };

      this.updatePreferenceList(profile.corePreferences.location, preference);
    });
  }

  private createNewProfile(userId: string): TasteProfile {
    return {
      userId,
      corePreferences: {
        music: [],
        movies: [],
        books: [],
        food: [],
        aesthetics: []
      },
      culturalConnections: [],
      tasteEvolution: {
        timeline: [],
        patterns: []
      },
      personalityInsights: [],
      lastUpdated: new Date()
    };
  }

  private sanitizeProfile(profile: Partial<TasteProfile>): TasteProfile {
    return {
      userId: profile.userId!,
      corePreferences: {
        music: Array.isArray(profile.corePreferences?.music) ? profile.corePreferences.music : [],
        movies: Array.isArray(profile.corePreferences?.movies) ? profile.corePreferences.movies : [],
        books: Array.isArray(profile.corePreferences?.books) ? profile.corePreferences.books : [],
        food: Array.isArray(profile.corePreferences?.food) ? profile.corePreferences.food : [],
        aesthetics: Array.isArray(profile.corePreferences?.aesthetics) ? profile.corePreferences.aesthetics : []
      },
      culturalConnections: [],
      tasteEvolution: {
        timeline: Array.isArray(profile.tasteEvolution?.timeline) ? profile.tasteEvolution.timeline : [],
        patterns: []
      },
      personalityInsights: [],
      lastUpdated: new Date()
    };
  }

  

  private determineCategoryType(category: string): keyof WorkingPreferences {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('restaurant') || 
        lowerCategory.includes('cafe') || 
        lowerCategory.includes('food')) {
      return 'food';
    }
    return 'activities';
  }

  private updatePreferenceList(list: PreferenceItem[], newItem: PreferenceItem): void {
    const existingIndex = list.findIndex(item => item.id === newItem.id);
    
    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      const timeDiff = new Date().getTime() - new Date(existing.lastUpdated).getTime();
      const daysSinceUpdate = timeDiff / (1000 * 60 * 60 * 24);
      const decayFactor = Math.exp(-daysSinceUpdate / 30); // 30-day half-life

      list[existingIndex] = {
        ...existing,
        weight: (existing.weight * decayFactor * 0.7) + (newItem.weight * 0.3),
        confidence: Math.min((existing.confidence * 0.7) + (newItem.confidence * 0.3), 1),
        lastUpdated: newItem.lastUpdated
      };
    } else {
      list.push(newItem);
    }

    // Keep only top 50 items sorted by weight
    list.sort((a, b) => b.weight - a.weight);
    if (list.length > 50) {
      list.length = 50;
    }
  }

  private async saveProfile(profile: TasteProfile): Promise<void> {
    await this.memorySystem.updateTasteProfile(profile.userId, {
      corePreferences: {
        music: profile.corePreferences.music || [],
        movies: profile.corePreferences.movies || [],
        books: profile.corePreferences.books || [],
        food: profile.corePreferences.food || [],
        aesthetics: profile.corePreferences.aesthetics || []
      },
      culturalConnections: [],
      tasteEvolution: {
        timeline: profile.tasteEvolution.timeline || [],
        patterns: []
      },
      personalityInsights: [],
      lastUpdated: new Date()
    });
  }
}
