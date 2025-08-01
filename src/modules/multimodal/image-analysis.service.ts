import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ImageAnalysisResult {
  aestheticElements: string[];
  culturalSignals: string[];
  moodIndicators: string[];
  colorPalette: string[];
  styleClassification: string;
  confidence: number;
}

interface VisionAPIResponse {
  responses: Array<{
    labelAnnotations?: Array<{
      description: string;
      score: number;
    }>;
    textAnnotations?: Array<{
      description: string;
    }>;
    imagePropertiesAnnotation?: {
      dominantColors: {
        colors: Array<{
          color: {
            red: number;
            green: number;
            blue: number;
          };
          score: number;
        }>;
      };
    };
  }>;
}

@Injectable()
export class ImageAnalysisService {
  private openaiApiKey: string;
  private googleVisionApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('openai.apiKey');
    this.googleVisionApiKey = this.configService.get<string>('googleVision.apiKey');
  }

  async analyzeImageForTaste(imageUrl: string): Promise<ImageAnalysisResult> {
    try {
      // Try OpenAI Vision first
      if (this.openaiApiKey) {
        return await this.analyzeWithOpenAI(imageUrl);
      }
      
      // Fallback to Google Vision
      if (this.googleVisionApiKey) {
        return await this.analyzeWithGoogleVision(imageUrl);
      }

      // Fallback analysis
      return this.getFallbackAnalysis();
    } catch (error) {
      console.error('Image analysis error:', error);
      return this.getFallbackAnalysis();
    }
  }

  private async analyzeWithOpenAI(imageUrl: string): Promise<ImageAnalysisResult> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for cultural and aesthetic elements. Return a JSON object with: aestheticElements (array), culturalSignals (array), moodIndicators (array), colorPalette (array), styleClassification (string), confidence (number 0-1).',
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return this.parseOpenAIResponse(content);
    }
  }

  private async analyzeWithGoogleVision(imageUrl: string): Promise<ImageAnalysisResult> {
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${this.googleVisionApiKey}`,
      {
        requests: [
          {
            image: { source: { imageUri: imageUrl } },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'TEXT_DETECTION' },
              { type: 'IMAGE_PROPERTIES' },
            ],
          },
        ],
      }
    );

    const visionData: VisionAPIResponse = response.data;
    return this.parseGoogleVisionResponse(visionData);
  }

  private parseOpenAIResponse(content: string): ImageAnalysisResult {
    // Extract information from OpenAI text response
    const aestheticKeywords = ['modern', 'vintage', 'minimalist', 'rustic', 'elegant', 'casual', 'artistic', 'industrial'];
    const culturalKeywords = ['hipster', 'mainstream', 'alternative', 'traditional', 'contemporary', 'indie', 'classic'];
    const moodKeywords = ['cozy', 'energetic', 'calm', 'vibrant', 'dark', 'bright', 'warm', 'cool'];

    const contentLower = content.toLowerCase();

    return {
      aestheticElements: aestheticKeywords.filter(keyword => contentLower.includes(keyword)),
      culturalSignals: culturalKeywords.filter(keyword => contentLower.includes(keyword)),
      moodIndicators: moodKeywords.filter(keyword => contentLower.includes(keyword)),
      colorPalette: this.extractColors(content),
      styleClassification: this.classifyStyle(content),
      confidence: 0.7,
    };
  }

  private parseGoogleVisionResponse(visionData: VisionAPIResponse): ImageAnalysisResult {
    const response = visionData.responses[0];
    const labels = response.labelAnnotations || [];
    const colors = response.imagePropertiesAnnotation?.dominantColors?.colors || [];

    const aestheticElements: string[] = [];
    const culturalSignals: string[] = [];
    const moodIndicators: string[] = [];

    labels.forEach(label => {
      const desc = label.description.toLowerCase();
      
      if (['art', 'design', 'architecture', 'fashion'].some(term => desc.includes(term))) {
        aestheticElements.push(desc);
      }
      
      if (['vintage', 'modern', 'traditional', 'contemporary'].some(term => desc.includes(term))) {
        culturalSignals.push(desc);
      }
      
      if (['cozy', 'bright', 'dark', 'colorful'].some(term => desc.includes(term))) {
        moodIndicators.push(desc);
      }
    });

    const colorPalette = colors.slice(0, 5).map(color => 
      `rgb(${color.color.red || 0}, ${color.color.green || 0}, ${color.color.blue || 0})`
    );

    return {
      aestheticElements: aestheticElements.slice(0, 5),
      culturalSignals: culturalSignals.slice(0, 5),
      moodIndicators: moodIndicators.slice(0, 5),
      colorPalette,
      styleClassification: this.classifyStyleFromLabels(labels.map(l => l.description)),
      confidence: 0.8,
    };
  }

  private extractColors(content: string): string[] {
    const colorKeywords = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'gray', 'brown'];
    return colorKeywords.filter(color => content.toLowerCase().includes(color));
  }

  private classifyStyle(content: string): string {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('minimalist') || contentLower.includes('clean')) return 'minimalist';
    if (contentLower.includes('vintage') || contentLower.includes('retro')) return 'vintage';
    if (contentLower.includes('modern') || contentLower.includes('contemporary')) return 'modern';
    if (contentLower.includes('rustic') || contentLower.includes('natural')) return 'rustic';
    if (contentLower.includes('elegant') || contentLower.includes('sophisticated')) return 'elegant';
    
    return 'eclectic';
  }

  private classifyStyleFromLabels(labels: string[]): string {
    const labelStr = labels.join(' ').toLowerCase();
    return this.classifyStyle(labelStr);
  }

  private getFallbackAnalysis(): ImageAnalysisResult {
    return {
      aestheticElements: ['modern', 'casual'],
      culturalSignals: ['contemporary'],
      moodIndicators: ['bright', 'welcoming'],
      colorPalette: ['#ffffff', '#000000', '#cccccc'],
      styleClassification: 'modern',
      confidence: 0.5,
    };
  }

  async analyzeUserPhoto(imageUrl: string): Promise<{
    personalStyle: string[];
    aestheticPreferences: string[];
    culturalIndicators: string[];
    recommendedVenues: string[];
  }> {
    const analysis = await this.analyzeImageForTaste(imageUrl);
    
    return {
      personalStyle: analysis.aestheticElements,
      aestheticPreferences: analysis.moodIndicators,
      culturalIndicators: analysis.culturalSignals,
      recommendedVenues: this.mapToVenueTypes(analysis),
    };
  }

  private mapToVenueTypes(analysis: ImageAnalysisResult): string[] {
    const venues: string[] = [];
    
    if (analysis.styleClassification === 'minimalist') {
      venues.push('modern cafe', 'art gallery', 'contemporary restaurant');
    } else if (analysis.styleClassification === 'vintage') {
      venues.push('vintage bar', 'antique shop', 'retro diner');
    } else if (analysis.styleClassification === 'rustic') {
      venues.push('farm-to-table restaurant', 'craft brewery', 'outdoor venue');
    } else {
      venues.push('trendy restaurant', 'cocktail bar', 'cultural venue');
    }
    
    return venues;
  }
}