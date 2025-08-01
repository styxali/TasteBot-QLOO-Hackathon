import { Injectable } from '@nestjs/common';
import { QlooService } from '../qloo/qloo.service';
import { MemorySystem, TasteProfile } from '../memory/memory-system.service';

interface CulturalPattern {
  id: string;
  name: string;
  entities: string[];
  strength: number;
  evolution: {
    trend: 'growing' | 'stable' | 'declining';
    timeframe: string;
  };
}

interface PersonalityInsight {
  trait: string;
  confidence: number;
  evidence: string[];
  culturalMarkers: string[];
}

interface TasteEvolution {
  timeline: Array<{
    period: string;
    dominantPreferences: string[];
    culturalShifts: string[];
  }>;
  patterns: CulturalPattern[];
  predictions: Array<{
    preference: string;
    likelihood: number;
    reasoning: string;
  }>;
}

@Injectable()
export class CulturalIntelligenceService {
  constructor(
    private readonly qlooService: QlooService,
    private readonly memorySystem: MemorySystem,
  ) {}

  async analyzeCulturalProfile(userId: string): Promise<{
    coreIdentity: string[];
    culturalArchetype: string;
    tasteEvolution: TasteEvolution;
    personalityInsights: PersonalityInsight[];
    culturalConnections: any[];
  }> {
    const tasteProfile = await this.memorySystem.getTasteProfile(userId);
    const conversationHistory = await this.memorySystem.getConversationHistory(userId, 100);

    if (!tasteProfile) {
      return this.getDefaultCulturalProfile();
    }

    const coreIdentity = this.extractCoreIdentity(tasteProfile);
    const culturalArchetype = this.determineCulturalArchetype(tasteProfile, conversationHistory);
    const tasteEvolution = await this.analyzeTasteEvolution(userId, tasteProfile);
    const personalityInsights = this.generatePersonalityInsights(tasteProfile, conversationHistory);
    const culturalConnections = await this.findCulturalConnections(tasteProfile);

    return {
      coreIdentity,
      culturalArchetype,
      tasteEvolution,
      personalityInsights,
      culturalConnections,
    };
  }

  private extractCoreIdentity(tasteProfile: TasteProfile): string[] {
    const allPreferences = Object.values(tasteProfile.corePreferences).flat();
    const identityMarkers: string[] = [];

    // Extract high-frequency preferences
    const preferenceCount = allPreferences.reduce((count, pref) => {
      const key = pref.name || pref.id;
      count[key] = (count[key] || 0) + 1;
      return count;
    }, {} as Record<string, number>);

    // Get top preferences
    const topPreferences = Object.entries(preferenceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([pref]) => pref);

    identityMarkers.push(...topPreferences);

    // Extract cultural themes
    const culturalThemes = this.extractCulturalThemes(allPreferences);
    identityMarkers.push(...culturalThemes);

    return [...new Set(identityMarkers)];
  }

  private extractCulturalThemes(preferences: any[]): string[] {
    const themes: string[] = [];
    
    preferences.forEach(pref => {
      const tags = pref.tags || [];
      const type = pref.type?.toLowerCase() || '';
      
      // Extract themes from tags and types
      if (tags.includes('indie') || type.includes('indie')) themes.push('indie');
      if (tags.includes('vintage') || type.includes('vintage')) themes.push('vintage');
      if (tags.includes('modern') || type.includes('modern')) themes.push('modern');
      if (tags.includes('artisan') || type.includes('artisan')) themes.push('artisan');
      if (tags.includes('underground') || type.includes('underground')) themes.push('underground');
    });

    return [...new Set(themes)];
  }

  private determineCulturalArchetype(tasteProfile: TasteProfile, conversationHistory: any[]): string {
    const preferences = Object.values(tasteProfile.corePreferences).flat();
    const themes = this.extractCulturalThemes(preferences);
    
    // Analyze conversation patterns
    const conversationThemes = conversationHistory
      .map(msg => msg.content.toLowerCase())
      .join(' ');

    // Define archetypes based on cultural patterns
    if (themes.includes('indie') && themes.includes('artisan')) {
      return 'Creative Maverick';
    } else if (themes.includes('vintage') && themes.includes('classic')) {
      return 'Cultural Traditionalist';
    } else if (themes.includes('modern') && conversationThemes.includes('trend')) {
      return 'Contemporary Explorer';
    } else if (themes.includes('underground') && themes.includes('alternative')) {
      return 'Subculture Pioneer';
    } else if (preferences.length > 20) {
      return 'Cultural Omnivore';
    } else if (themes.includes('artisan') || conversationThemes.includes('craft')) {
      return 'Authenticity Seeker';
    } else {
      return 'Curious Explorer';
    }
  }

  private async analyzeTasteEvolution(userId: string, tasteProfile: TasteProfile): Promise<TasteEvolution> {
    // Analyze historical patterns (simplified - would use actual historical data)
    const timeline = this.generateTasteTimeline(tasteProfile);
    const patterns = await this.identifyTastePatterns(tasteProfile);
    const predictions = this.generateTastePredictions(patterns, tasteProfile);

    return {
      timeline,
      patterns,
      predictions,
    };
  }

  private generateTasteTimeline(tasteProfile: TasteProfile): TasteEvolution['timeline'] {
    // Simplified timeline generation
    const now = new Date();
    const periods = [
      {
        period: 'Recent (Last 3 months)',
        dominantPreferences: Object.values(tasteProfile.corePreferences).flat().slice(0, 3).map(p => p.name),
        culturalShifts: ['increased interest in local venues', 'preference for authentic experiences'],
      },
      {
        period: 'Medium-term (3-12 months ago)',
        dominantPreferences: Object.values(tasteProfile.corePreferences).flat().slice(3, 6).map(p => p.name),
        culturalShifts: ['exploration of new cuisines', 'growing appreciation for artisanal products'],
      },
    ];

    return periods;
  }

  private async identifyTastePatterns(tasteProfile: TasteProfile): Promise<CulturalPattern[]> {
    const patterns: CulturalPattern[] = [];
    
    // Analyze music patterns
    const musicPrefs = tasteProfile.corePreferences.music || [];
    if (musicPrefs.length > 0) {
      patterns.push({
        id: 'music_pattern_1',
        name: 'Musical Identity',
        entities: musicPrefs.map(m => m.name).slice(0, 5),
        strength: Math.min(musicPrefs.length / 10, 1),
        evolution: {
          trend: 'growing',
          timeframe: 'last 6 months',
        },
      });
    }

    // Analyze food patterns
    const foodPrefs = tasteProfile.corePreferences.food || [];
    if (foodPrefs.length > 0) {
      patterns.push({
        id: 'food_pattern_1',
        name: 'Culinary Preferences',
        entities: foodPrefs.map(f => f.name).slice(0, 5),
        strength: Math.min(foodPrefs.length / 8, 1),
        evolution: {
          trend: 'stable',
          timeframe: 'consistent over time',
        },
      });
    }

    return patterns;
  }

  private generateTastePredictions(patterns: CulturalPattern[], tasteProfile: TasteProfile): TasteEvolution['predictions'] {
    const predictions: TasteEvolution['predictions'] = [];

    patterns.forEach(pattern => {
      if (pattern.strength > 0.7) {
        predictions.push({
          preference: `Advanced ${pattern.name.toLowerCase()}`,
          likelihood: 0.8,
          reasoning: `Strong existing pattern in ${pattern.name} suggests continued exploration`,
        });
      }
    });

    // Add cross-category predictions
    const musicCount = tasteProfile.corePreferences.music?.length || 0;
    const foodCount = tasteProfile.corePreferences.food?.length || 0;

    if (musicCount > 5 && foodCount > 3) {
      predictions.push({
        preference: 'Music-themed dining experiences',
        likelihood: 0.7,
        reasoning: 'Strong interests in both music and food suggest potential for combined experiences',
      });
    }

    return predictions;
  }

  private generatePersonalityInsights(tasteProfile: TasteProfile, conversationHistory: any[]): PersonalityInsight[] {
    const insights: PersonalityInsight[] = [];
    
    const allPreferences = Object.values(tasteProfile.corePreferences).flat();
    const conversationText = conversationHistory.map(msg => msg.content).join(' ').toLowerCase();

    // Analyze openness to experience
    const diversityScore = new Set(allPreferences.map(p => p.type)).size;
    if (diversityScore > 3) {
      insights.push({
        trait: 'High Openness to Experience',
        confidence: 0.8,
        evidence: [`Diverse preferences across ${diversityScore} categories`],
        culturalMarkers: ['exploration', 'variety-seeking', 'curiosity'],
      });
    }

    // Analyze authenticity preference
    const authenticityKeywords = ['authentic', 'local', 'traditional', 'artisan', 'craft'];
    const authenticityCount = authenticityKeywords.filter(keyword => 
      conversationText.includes(keyword)
    ).length;

    if (authenticityCount > 2) {
      insights.push({
        trait: 'Authenticity Seeker',
        confidence: 0.7,
        evidence: [`Uses authenticity-related terms ${authenticityCount} times`],
        culturalMarkers: ['genuine experiences', 'local culture', 'traditional values'],
      });
    }

    // Analyze social orientation
    const socialKeywords = ['friends', 'group', 'together', 'social', 'party'];
    const socialCount = socialKeywords.filter(keyword => 
      conversationText.includes(keyword)
    ).length;

    if (socialCount > 1) {
      insights.push({
        trait: 'Socially Oriented',
        confidence: 0.6,
        evidence: [`Mentions social activities ${socialCount} times`],
        culturalMarkers: ['group experiences', 'social connection', 'shared activities'],
      });
    }

    return insights;
  }

  private async findCulturalConnections(tasteProfile: TasteProfile): Promise<any[]> {
    const connections: any[] = [];
    
    // Find connections between different preference categories
    const musicPrefs = tasteProfile.corePreferences.music || [];
    const foodPrefs = tasteProfile.corePreferences.food || [];
    
    // Example: Jazz music + Italian food = sophisticated taste
    const hasJazz = musicPrefs.some(m => m.name.toLowerCase().includes('jazz'));
    const hasItalian = foodPrefs.some(f => f.name.toLowerCase().includes('italian'));
    
    if (hasJazz && hasItalian) {
      connections.push({
        type: 'cross-category',
        categories: ['music', 'food'],
        connection: 'Sophisticated Cultural Taste',
        strength: 0.8,
        description: 'Jazz appreciation combined with Italian cuisine suggests refined cultural preferences',
      });
    }

    // Add more connection patterns
    const moviePrefs = tasteProfile.corePreferences.movies || [];
    const hasIndieFilms = moviePrefs.some(m => 
      m.tags?.includes('indie') || m.name.toLowerCase().includes('indie')
    );
    const hasIndieMusic = musicPrefs.some(m => 
      m.tags?.includes('indie') || m.name.toLowerCase().includes('indie')
    );

    if (hasIndieFilms && hasIndieMusic) {
      connections.push({
        type: 'thematic',
        categories: ['movies', 'music'],
        connection: 'Independent Culture Affinity',
        strength: 0.9,
        description: 'Strong preference for independent content across multiple media types',
      });
    }

    return connections;
  }

  private getDefaultCulturalProfile() {
    return {
      coreIdentity: ['curious', 'explorer'],
      culturalArchetype: 'Curious Explorer',
      tasteEvolution: {
        timeline: [],
        patterns: [],
        predictions: [],
      },
      personalityInsights: [],
      culturalConnections: [],
    };
  }

  async generateCulturalRecommendationExplanation(
    userId: string,
    recommendation: any,
    context: string
  ): Promise<string> {
    const culturalProfile = await this.analyzeCulturalProfile(userId);
    
    let explanation = `Based on your ${culturalProfile.culturalArchetype} profile, `;
    
    // Match recommendation to cultural identity
    const matchingIdentities = culturalProfile.coreIdentity.filter(identity =>
      recommendation.name?.toLowerCase().includes(identity.toLowerCase()) ||
      recommendation.tags?.some((tag: string) => tag.toLowerCase().includes(identity.toLowerCase()))
    );

    if (matchingIdentities.length > 0) {
      explanation += `this aligns with your ${matchingIdentities.join(' and ')} preferences. `;
    }

    // Add personality insight context
    const relevantInsights = culturalProfile.personalityInsights.filter(insight =>
      context.toLowerCase().includes(insight.trait.toLowerCase().split(' ')[0])
    );

    if (relevantInsights.length > 0) {
      explanation += `Your ${relevantInsights[0].trait} suggests you'll appreciate ${recommendation.name}. `;
    }

    // Add cultural connection context
    if (culturalProfile.culturalConnections.length > 0) {
      const connection = culturalProfile.culturalConnections[0];
      explanation += `This fits your ${connection.connection} pattern. `;
    }

    return explanation;
  }

  async trackCulturalEvolution(userId: string, newInteraction: {
    preferences: string[];
    context: string;
    feedback: 'positive' | 'negative' | 'neutral';
  }): Promise<void> {
    const currentProfile = await this.memorySystem.getTasteProfile(userId);
    
    if (!currentProfile) return;

    // Update taste evolution timeline
    const evolutionUpdate = {
      timestamp: new Date(),
      preferences: newInteraction.preferences,
      context: newInteraction.context,
      feedback: newInteraction.feedback,
    };

    // Add to taste evolution (simplified)
    if (!currentProfile.tasteEvolution.timeline) {
      currentProfile.tasteEvolution.timeline = [];
    }
    
    currentProfile.tasteEvolution.timeline.push(evolutionUpdate);

    // Keep only recent evolution data (last 50 interactions)
    if (currentProfile.tasteEvolution.timeline.length > 50) {
      currentProfile.tasteEvolution.timeline = currentProfile.tasteEvolution.timeline.slice(-50);
    }

    await this.memorySystem.updateTasteProfile(userId, {
      tasteEvolution: currentProfile.tasteEvolution,
    });
  }
}