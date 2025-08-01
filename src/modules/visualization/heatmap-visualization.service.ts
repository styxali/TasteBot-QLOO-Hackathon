import { Injectable } from '@nestjs/common';
import { TasteBotHeatmapPoint } from '../data-mapping/qloo-data.mapper';

export interface HeatmapVisualization {
  heatmapData: any[];
  center: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  style: string;
}

@Injectable()
export class HeatmapVisualizationService {
  async generateCulturalHeatmap(
    points: TasteBotHeatmapPoint[],
    centerLat: number,
    centerLon: number
  ): Promise<HeatmapVisualization> {
    const heatmapData = this.processHeatmapPoints(points);
    const zoom = this.calculateOptimalZoom(points);

    return {
      heatmapData,
      center: {
        latitude: centerLat,
        longitude: centerLon
      },
      zoom,
      style: 'mapbox://styles/mapbox/dark-v10' // Dark theme for better visualization
    };
  }

  private processHeatmapPoints(points: TasteBotHeatmapPoint[]): any[] {
    return points.map(point => ({
      location: [point.longitude, point.latitude],
      weight: point.intensity,
      radius: this.calculatePointRadius(point),
      color: this.getCategoryColor(point.category)
    }));
  }

  private calculatePointRadius(point: TasteBotHeatmapPoint): number {
    // Base radius between 10 and 30 pixels based on intensity
    return 10 + (point.intensity * 20);
  }

  private getCategoryColor(category: string): string {
    // Color mapping for different venue categories
    const colorMap: { [key: string]: string } = {
      music: '#FF0000',     // Red for music venues
      food: '#00FF00',      // Green for food
      culture: '#0000FF',   // Blue for cultural venues
      nightlife: '#FF00FF', // Purple for nightlife
      shopping: '#FFFF00',  // Yellow for shopping
      outdoor: '#00FFFF',   // Cyan for outdoor activities
    };

    return colorMap[category.toLowerCase()] || '#FFFFFF';
  }

  private calculateOptimalZoom(points: TasteBotHeatmapPoint[]): number {
    if (points.length === 0) return 13; // Default city-level zoom

    // Calculate bounding box
    const lats = points.map(p => p.latitude);
    const lons = points.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    // Calculate the span
    const latSpan = maxLat - minLat;
    const lonSpan = maxLon - minLon;
    const maxSpan = Math.max(latSpan, lonSpan);

    // Calculate zoom level based on span
    // Smaller span = higher zoom level
    if (maxSpan < 0.01) return 15;      // Very close (street level)
    if (maxSpan < 0.05) return 14;      // Neighborhood
    if (maxSpan < 0.1) return 13;       // Small city
    if (maxSpan < 0.5) return 12;       // Large city
    if (maxSpan < 2) return 10;         // Metropolitan area
    return 8;                           // Region
  }

  async generateTimeBasedHeatmap(
    points: TasteBotHeatmapPoint[],
    hour: number
  ): Promise<TasteBotHeatmapPoint[]> {
    // Adjust intensities based on time of day
    return points.map(point => {
      let timeMultiplier = 1;

      // Example time-based adjustments
      if (point.category === 'nightlife') {
        timeMultiplier = (hour >= 20 || hour < 4) ? 1.5 : 0.5;
      } else if (point.category === 'food') {
        timeMultiplier = (hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 21) ? 1.5 : 0.8;
      } else if (point.category === 'culture') {
        timeMultiplier = (hour >= 10 && hour <= 18) ? 1.3 : 0.7;
      }

      return {
        ...point,
        intensity: point.intensity * timeMultiplier
      };
    });
  }

  async mergeHeatmaps(
    heatmaps: HeatmapVisualization[]
  ): Promise<HeatmapVisualization> {
    // Combine multiple heatmap layers
    const allPoints = heatmaps.flatMap(h => h.heatmapData);
    
    // Calculate weighted center
    const center = this.calculateWeightedCenter(allPoints);
    
    // Find optimal zoom that shows all points
    const zoom = Math.min(...heatmaps.map(h => h.zoom));

    return {
      heatmapData: allPoints,
      center,
      zoom,
      style: 'mapbox://styles/mapbox/dark-v10'
    };
  }

  private calculateWeightedCenter(points: any[]): { latitude: number; longitude: number } {
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLon = 0;

    points.forEach(point => {
      const weight = point.weight || 1;
      totalWeight += weight;
      weightedLat += point.location[1] * weight;
      weightedLon += point.location[0] * weight;
    });

    return {
      latitude: weightedLat / totalWeight,
      longitude: weightedLon / totalWeight
    };
  }
}
