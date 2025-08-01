import { Injectable } from '@nestjs/common';
import { GeoapifyService } from '../location/geoapify.service';
import { FoursquareService } from '../location/foursquare.service';

interface LocationContext {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    formatted: string;
    city: string;
    country: string;
    neighborhood?: string;
  };
  nearbyVenues: any[];
  culturalArea: {
    type: string;
    characteristics: string[];
  };
  timeContext: {
    timezone: string;
    localTime: string;
    dayOfWeek: string;
  };
}

@Injectable()
export class LocationContextService {
  constructor(
    private readonly geoapifyService: GeoapifyService,
    private readonly foursquareService: FoursquareService,
  ) {}

  async enrichLocationContext(
    latitude: number,
    longitude: number
  ): Promise<LocationContext> {
    try {
      // Get address information
      const addressInfo = await this.geoapifyService.reverseGeocode(latitude, longitude);
      
      // Get nearby venues
      const nearbyVenues = await this.foursquareService.searchByCoordinates(
        latitude,
        longitude,
        undefined,
        1000,
        10
      );

      // Analyze cultural area
      const culturalArea = this.analyzeCulturalArea(nearbyVenues, addressInfo);

      // Get time context
      const timeContext = this.getTimeContext(latitude, longitude);

      return {
        coordinates: { latitude, longitude },
        address: {
          formatted: addressInfo?.display_name || 'Unknown location',
          city: addressInfo?.address?.city || 'Unknown city',
          country: addressInfo?.address?.country || 'Unknown country',
          neighborhood: this.extractNeighborhood(addressInfo),
        },
        nearbyVenues,
        culturalArea,
        timeContext,
      };
    } catch (error) {
      console.error('Location context enrichment error:', error);
      return this.getFallbackLocationContext(latitude, longitude);
    }
  }

  private analyzeCulturalArea(venues: any[], addressInfo: any): {
    type: string;
    characteristics: string[];
  } {
    const venueTypes = venues.map(venue => 
      venue.categories?.[0]?.name?.toLowerCase() || 'unknown'
    );

    const characteristics: string[] = [];
    let areaType = 'mixed';

    // Analyze venue density and types
    const restaurantCount = venueTypes.filter(type => 
      type.includes('restaurant') || type.includes('food')
    ).length;
    
    const barCount = venueTypes.filter(type => 
      type.includes('bar') || type.includes('nightlife')
    ).length;
    
    const artCount = venueTypes.filter(type => 
      type.includes('art') || type.includes('gallery') || type.includes('museum')
    ).length;

    const shoppingCount = venueTypes.filter(type => 
      type.includes('shop') || type.includes('store')
    ).length;

    // Determine area characteristics
    if (restaurantCount > 5) characteristics.push('dining-focused');
    if (barCount > 3) characteristics.push('nightlife');
    if (artCount > 2) characteristics.push('cultural');
    if (shoppingCount > 4) characteristics.push('commercial');

    // Determine area type
    if (artCount > 2 && restaurantCount > 3) {
      areaType = 'cultural-district';
    } else if (barCount > 3 && restaurantCount > 4) {
      areaType = 'entertainment-district';
    } else if (shoppingCount > 5) {
      areaType = 'shopping-district';
    } else if (restaurantCount > 6) {
      areaType = 'food-district';
    }

    // Add density characteristic
    if (venues.length > 15) {
      characteristics.push('high-density');
    } else if (venues.length > 8) {
      characteristics.push('medium-density');
    } else {
      characteristics.push('low-density');
    }

    return { type: areaType, characteristics };
  }

  private extractNeighborhood(addressInfo: any): string | undefined {
    return addressInfo?.address?.neighbourhood || 
           addressInfo?.address?.suburb || 
           addressInfo?.address?.district;
  }

  private getTimeContext(latitude: number, longitude: number): {
    timezone: string;
    localTime: string;
    dayOfWeek: string;
  } {
    // Simple timezone estimation based on longitude
    const timezoneOffset = Math.round(longitude / 15);
    const now = new Date();
    const localTime = new Date(now.getTime() + (timezoneOffset * 60 * 60 * 1000));
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      timezone: `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`,
      localTime: localTime.toLocaleTimeString(),
      dayOfWeek: days[localTime.getDay()],
    };
  }

  private getFallbackLocationContext(latitude: number, longitude: number): LocationContext {
    return {
      coordinates: { latitude, longitude },
      address: {
        formatted: 'Location provided',
        city: 'Unknown city',
        country: 'Unknown country',
      },
      nearbyVenues: [],
      culturalArea: {
        type: 'mixed',
        characteristics: ['unknown-density'],
      },
      timeContext: {
        timezone: 'UTC+0',
        localTime: new Date().toLocaleTimeString(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      },
    };
  }

  async getLocationRecommendations(
    context: LocationContext,
    userPreferences: string[]
  ): Promise<{
    venues: any[];
    activities: string[];
    culturalFit: number;
  }> {
    // Filter venues based on user preferences and location context
    const relevantVenues = context.nearbyVenues.filter(venue => {
      const venueName = venue.name?.toLowerCase() || '';
      const venueCategory = venue.categories?.[0]?.name?.toLowerCase() || '';
      
      return userPreferences.some(pref => 
        venueName.includes(pref.toLowerCase()) || 
        venueCategory.includes(pref.toLowerCase())
      );
    });

    // Generate activity suggestions based on area type and time
    const activities = this.generateActivitySuggestions(context);

    // Calculate cultural fit score
    const culturalFit = this.calculateCulturalFit(context, userPreferences);

    return {
      venues: relevantVenues.slice(0, 5),
      activities,
      culturalFit,
    };
  }

  private generateActivitySuggestions(context: LocationContext): string[] {
    const activities: string[] = [];
    const { type, characteristics } = context.culturalArea;
    const hour = new Date().getHours();

    // Time-based suggestions
    if (hour < 12) {
      activities.push('morning coffee', 'breakfast spot');
    } else if (hour < 17) {
      activities.push('lunch', 'afternoon exploration');
    } else {
      activities.push('dinner', 'evening entertainment');
    }

    // Area-based suggestions
    if (type === 'cultural-district') {
      activities.push('gallery hopping', 'museum visit', 'cultural event');
    } else if (type === 'entertainment-district') {
      activities.push('bar crawl', 'live music', 'nightlife');
    } else if (type === 'food-district') {
      activities.push('food tour', 'restaurant hopping', 'culinary experience');
    }

    // Density-based suggestions
    if (characteristics.includes('high-density')) {
      activities.push('walking tour', 'people watching');
    } else if (characteristics.includes('low-density')) {
      activities.push('peaceful stroll', 'quiet exploration');
    }

    return activities;
  }

  private calculateCulturalFit(context: LocationContext, userPreferences: string[]): number {
    let score = 0.5; // Base score

    // Boost score based on venue matches
    const venueMatches = context.nearbyVenues.filter(venue => {
      const venueName = venue.name?.toLowerCase() || '';
      const venueCategory = venue.categories?.[0]?.name?.toLowerCase() || '';
      
      return userPreferences.some(pref => 
        venueName.includes(pref.toLowerCase()) || 
        venueCategory.includes(pref.toLowerCase())
      );
    }).length;

    score += (venueMatches / Math.max(context.nearbyVenues.length, 1)) * 0.3;

    // Boost score based on area characteristics
    const { characteristics } = context.culturalArea;
    if (userPreferences.includes('art') && characteristics.includes('cultural')) {
      score += 0.2;
    }
    if (userPreferences.includes('nightlife') && characteristics.includes('nightlife')) {
      score += 0.2;
    }
    if (userPreferences.includes('food') && characteristics.includes('dining-focused')) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }
}