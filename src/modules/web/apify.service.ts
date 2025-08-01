import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ApifyRunInput {
  startUrls: Array<{ url: string }>;
  maxRequestsPerCrawl?: number;
  maxConcurrency?: number;
  requestTimeoutSecs?: number;
}

interface ApifyDatasetItem {
  url: string;
  title: string;
  text: string;
  html: string;
  metadata: Record<string, any>;
}

@Injectable()
export class ApifyService {
  private apiToken: string;
  private baseUrl = 'https://api.apify.com/v2';

  constructor(private readonly configService: ConfigService) {
    this.apiToken = this.configService.get<string>('apify.apiToken');
  }

  async scrapeWebsite(
    urls: string[],
    actorId = 'apify/web-scraper'
  ): Promise<ApifyDatasetItem[]> {
    if (!this.apiToken) {
      console.warn('Apify API token not configured, using fallback data');
      return this.getFallbackData(urls);
    }

    try {
      const runInput: ApifyRunInput = {
        startUrls: urls.map(url => ({ url })),
        maxRequestsPerCrawl: 10,
        maxConcurrency: 2,
        requestTimeoutSecs: 30,
      };

      // Start the actor run
      const runResponse = await axios.post(
        `${this.baseUrl}/acts/${actorId}/runs`,
        runInput,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const runId = runResponse.data.data.id;

      // Wait for completion (simplified - in production, use webhooks)
      await this.waitForRunCompletion(runId);

      // Get dataset items
      const datasetResponse = await axios.get(
        `${this.baseUrl}/acts/${actorId}/runs/${runId}/dataset/items`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        }
      );

      return datasetResponse.data;
    } catch (error) {
      console.error('Apify scraping error:', error);
      return this.getFallbackData(urls);
    }
  }

  async scrapeVenueReviews(venueUrl: string): Promise<any[]> {
    const results = await this.scrapeWebsite([venueUrl]);
    
    if (results.length === 0) return [];

    const content = results[0].text;
    return this.extractReviews(content);
  }

  async scrapeEventListings(eventSiteUrl: string): Promise<any[]> {
    const results = await this.scrapeWebsite([eventSiteUrl]);
    
    if (results.length === 0) return [];

    const content = results[0].text;
    return this.extractEvents(content);
  }

  async scrapeSocialMedia(profileUrl: string): Promise<any> {
    const results = await this.scrapeWebsite([profileUrl]);
    
    if (results.length === 0) return null;

    const content = results[0].text;
    return this.extractSocialContent(content);
  }

  private async waitForRunCompletion(runId: string, maxWaitTime = 60000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const statusResponse = await axios.get(
          `${this.baseUrl}/actor-runs/${runId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiToken}`,
            },
          }
        );

        const status = statusResponse.data.data.status;
        
        if (status === 'SUCCEEDED' || status === 'FAILED') {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error checking run status:', error);
        break;
      }
    }
  }

  private extractReviews(content: string): any[] {
    const reviews: any[] = [];
    
    // Simple review extraction (can be enhanced with more sophisticated parsing)
    const reviewPatterns = [
      /review[:\s]*([^\.]+\.[^\.]+\.)/gi,
      /rating[:\s]*(\d+(?:\.\d+)?)/gi,
      /\d+\s*stars?[:\s]*([^\.]+\.)/gi,
    ];

    reviewPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          reviews.push({
            text: match.trim(),
            source: 'scraped',
            timestamp: new Date().toISOString(),
          });
        });
      }
    });

    return reviews.slice(0, 10); // Limit to 10 reviews
  }

  private extractEvents(content: string): any[] {
    const events: any[] = [];
    
    // Simple event extraction
    const eventPatterns = [
      /event[:\s]*([^\.]+)/gi,
      /\d{1,2}\/\d{1,2}\/\d{4}[:\s]*([^\.]+)/gi,
      /\d{1,2}:\d{2}\s*(?:AM|PM)[:\s]*([^\.]+)/gi,
    ];

    eventPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          events.push({
            title: match.trim(),
            source: 'scraped',
            extractedAt: new Date().toISOString(),
          });
        });
      }
    });

    return events.slice(0, 10); // Limit to 10 events
  }

  private extractSocialContent(content: string): any {
    return {
      posts: content.split('\n').filter(line => line.trim().length > 20).slice(0, 5),
      hashtags: this.extractHashtags(content),
      mentions: this.extractMentions(content),
      extractedAt: new Date().toISOString(),
    };
  }

  private extractHashtags(content: string): string[] {
    const hashtagPattern = /#\w+/g;
    const matches = content.match(hashtagPattern);
    return matches ? [...new Set(matches)] : [];
  }

  private extractMentions(content: string): string[] {
    const mentionPattern = /@\w+/g;
    const matches = content.match(mentionPattern);
    return matches ? [...new Set(matches)] : [];
  }

  private getFallbackData(urls: string[]): ApifyDatasetItem[] {
    return urls.map(url => ({
      url,
      title: 'Scraped Content',
      text: `This is fallback content for ${url}. Contains general information about the website.`,
      html: '<div>Fallback HTML content</div>',
      metadata: {
        scrapedAt: new Date().toISOString(),
        source: 'fallback',
      },
    }));
  }
}