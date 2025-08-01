import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface FirecrawlResponse {
  success: boolean;
  data: {
    content: string;
    markdown: string;
    html: string;
    metadata: {
      title: string;
      description: string;
      language: string;
      sourceURL: string;
      statusCode: number;
    };
    llm_extraction?: any;
  };
}

interface FirecrawlScrapeOptions {
  formats?: string[];
  includeTags?: string[];
  excludeTags?: string[];
  onlyMainContent?: boolean;
  waitFor?: number;
}

@Injectable()
export class FirecrawlService {
  private apiKey: string;
  private baseUrl = 'https://api.firecrawl.dev/v0';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('firecrawl.apiKey');
  }

  async scrapeUrl(url: string, options?: FirecrawlScrapeOptions): Promise<FirecrawlResponse> {
    if (!this.apiKey) {
      console.warn('Firecrawl API key not configured, using fallback data');
      return this.getFallbackResponse(url);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/scrape`,
        {
          url,
          formats: options?.formats || ['markdown', 'html'],
          includeTags: options?.includeTags,
          excludeTags: options?.excludeTags,
          onlyMainContent: options?.onlyMainContent ?? true,
          waitFor: options?.waitFor || 0,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Firecrawl scraping error:', error);
      return this.getFallbackResponse(url);
    }
  }

  async extractVenueInfo(url: string): Promise<any> {
    const scrapeResult = await this.scrapeUrl(url, {
      formats: ['markdown'],
      onlyMainContent: true,
      excludeTags: ['nav', 'footer', 'aside'],
    });

    if (!scrapeResult.success) {
      return null;
    }

    // Extract key venue information from content
    const content = scrapeResult.data.content;
    const metadata = scrapeResult.data.metadata;

    return {
      title: metadata.title,
      description: metadata.description,
      content: content.substring(0, 2000), // Limit content length
      url: metadata.sourceURL,
      extractedInfo: this.parseVenueContent(content),
    };
  }

  async analyzeTasteProfile(url: string): Promise<any> {
    const scrapeResult = await this.scrapeUrl(url, {
      formats: ['markdown'],
      onlyMainContent: true,
    });

    if (!scrapeResult.success) {
      return null;
    }

    const content = scrapeResult.data.content;
    
    return {
      url: scrapeResult.data.metadata.sourceURL,
      title: scrapeResult.data.metadata.title,
      culturalSignals: this.extractCulturalSignals(content),
      tasteIndicators: this.extractTasteIndicators(content),
      aestheticElements: this.extractAestheticElements(content),
    };
  }

  private parseVenueContent(content: string): any {
    const info: any = {};

    // Extract hours
    const hoursMatch = content.match(/hours?:?\s*([^\n]+)/i);
    if (hoursMatch) {
      info.hours = hoursMatch[1].trim();
    }

    // Extract phone
    const phoneMatch = content.match(/(\+?[\d\s\-\(\)]{10,})/);
    if (phoneMatch) {
      info.phone = phoneMatch[1].trim();
    }

    // Extract address
    const addressMatch = content.match(/address:?\s*([^\n]+)/i);
    if (addressMatch) {
      info.address = addressMatch[1].trim();
    }

    // Extract price range
    const priceMatch = content.match(/\$+|\bprice\b.*?(\$+)/i);
    if (priceMatch) {
      info.priceRange = priceMatch[1] || priceMatch[0];
    }

    return info;
  }

  private extractCulturalSignals(content: string): string[] {
    const signals: string[] = [];
    const culturalKeywords = [
      'indie', 'hipster', 'artisan', 'craft', 'local', 'authentic',
      'vintage', 'retro', 'modern', 'contemporary', 'traditional',
      'underground', 'alternative', 'mainstream', 'trendy', 'classic',
      'bohemian', 'minimalist', 'eclectic', 'sophisticated', 'casual',
    ];

    const contentLower = content.toLowerCase();
    culturalKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        signals.push(keyword);
      }
    });

    return [...new Set(signals)];
  }

  private extractTasteIndicators(content: string): string[] {
    const indicators: string[] = [];
    const tasteKeywords = [
      'jazz', 'rock', 'electronic', 'classical', 'hip-hop', 'folk',
      'italian', 'japanese', 'mexican', 'french', 'thai', 'indian',
      'coffee', 'wine', 'cocktails', 'beer', 'tea', 'spirits',
      'art', 'music', 'books', 'film', 'photography', 'design',
    ];

    const contentLower = content.toLowerCase();
    tasteKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        indicators.push(keyword);
      }
    });

    return [...new Set(indicators)];
  }

  private extractAestheticElements(content: string): string[] {
    const elements: string[] = [];
    const aestheticKeywords = [
      'cozy', 'bright', 'dark', 'warm', 'cool', 'spacious', 'intimate',
      'rustic', 'sleek', 'elegant', 'casual', 'formal', 'colorful',
      'monochrome', 'natural', 'industrial', 'romantic', 'energetic',
    ];

    const contentLower = content.toLowerCase();
    aestheticKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        elements.push(keyword);
      }
    });

    return [...new Set(elements)];
  }

  private getFallbackResponse(url: string): FirecrawlResponse {
    return {
      success: true,
      data: {
        content: `This is fallback content for ${url}. The website contains information about a local venue with good reviews and recommendations.`,
        markdown: `# Venue Information\n\nThis venue appears to be a popular local spot with positive reviews.`,
        html: '<h1>Venue Information</h1><p>This venue appears to be a popular local spot with positive reviews.</p>',
        metadata: {
          title: 'Local Venue',
          description: 'A popular local venue',
          language: 'en',
          sourceURL: url,
          statusCode: 200,
        },
      },
    };
  }
}