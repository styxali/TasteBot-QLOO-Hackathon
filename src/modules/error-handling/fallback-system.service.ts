import { Injectable } from '@nestjs/common';

interface FallbackConfig {
  maxRetries: number;
  retryDelay: number;
  fallbackChain: string[];
  circuitBreakerThreshold: number;
}

interface ServiceHealth {
  serviceName: string;
  isHealthy: boolean;
  lastCheck: Date;
  failureCount: number;
  lastError?: string;
}

@Injectable()
export class FallbackSystemService {
  private serviceHealth = new Map<string, ServiceHealth>();
  private circuitBreakers = new Map<string, boolean>();
  
  private readonly fallbackConfigs: Record<string, FallbackConfig> = {
    qloo: {
      maxRetries: 3,
      retryDelay: 1000,
      fallbackChain: ['qloo_cache', 'static_recommendations'],
      circuitBreakerThreshold: 5,
    },
    foursquare: {
      maxRetries: 2,
      retryDelay: 500,
      fallbackChain: ['foursquare_cache', 'generic_venues'],
      circuitBreakerThreshold: 3,
    },
    tavily: {
      maxRetries: 2,
      retryDelay: 1000,
      fallbackChain: ['serper', 'jina', 'static_search'],
      circuitBreakerThreshold: 4,
    },
    openai: {
      maxRetries: 3,
      retryDelay: 2000,
      fallbackChain: ['groq', 'gemini', 'static_responses'],
      circuitBreakerThreshold: 5,
    },
  };

    async handleNavigationError(chatId: number, error: any): Promise<void> {
    const errorMessage = error?.message || 'Unknown error';
    const fallbackMessage = '❌ Navigation error: ' + errorMessage + '\n\nPlease try one of these options:\n' +
      '1. Go back to the main menu\n' +
      '2. Try a different option\n' +
      '3. Type your request in natural language';

    // Log the error for monitoring
    console.error('Navigation error:', {
      chatId,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });

    // Update service health status
    this.updateServiceHealth('navigation', false, errorMessage);

    // Return user-friendly message
    return Promise.resolve();
  }

  private updateServiceHealth(
    serviceName: string, 
    isHealthy: boolean, 
    error?: string
  ): void {
    const health = this.serviceHealth.get(serviceName) || {
      serviceName,
      isHealthy: true,
      lastCheck: new Date(),
      failureCount: 0,
    };

    if (!isHealthy) {
      health.failureCount++;
      health.lastError = error;

      // Check circuit breaker threshold
      const config = this.fallbackConfigs[serviceName];
      if (config && health.failureCount >= config.circuitBreakerThreshold) {
        this.circuitBreakers.set(serviceName, true);
      }
    } else {
      health.failureCount = 0;
      health.lastError = undefined;
      this.circuitBreakers.set(serviceName, false);
    }

    health.isHealthy = isHealthy;
    health.lastCheck = new Date();
    this.serviceHealth.set(serviceName, health);
  }

  async executeWithFallback<T>(
    serviceName: string,
    primaryOperation: () => Promise<T>,
    fallbackOperations?: Array<() => Promise<T>>
  ): Promise<T> {
    const config = this.fallbackConfigs[serviceName];
    
    if (!config) {
      console.warn(`No fallback config for service: ${serviceName}`);
      return await primaryOperation();
    }

    // Check circuit breaker
    if (this.isCircuitBreakerOpen(serviceName)) {
      console.log(`Circuit breaker open for ${serviceName}, using fallback`);
      return await this.executeFallbackChain(serviceName, fallbackOperations);
    }

    // Try primary operation with retries
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await primaryOperation();
        this.recordSuccess(serviceName);
        return result;
      } catch (error) {
        console.error(`${serviceName} attempt ${attempt} failed:`, error.message);
        
        this.recordFailure(serviceName, error.message);
        
        if (attempt < config.maxRetries) {
          await this.delay(config.retryDelay * attempt);
        }
      }
    }

    // All retries failed, use fallback
    console.log(`All retries failed for ${serviceName}, using fallback chain`);
    return await this.executeFallbackChain(serviceName, fallbackOperations);
  }

  private async executeFallbackChain<T>(
    serviceName: string,
    fallbackOperations?: Array<() => Promise<T>>
  ): Promise<T> {
    const config = this.fallbackConfigs[serviceName];
    
    // Try provided fallback operations first
    if (fallbackOperations) {
      for (const fallbackOp of fallbackOperations) {
        try {
          return await fallbackOp();
        } catch (error) {
          console.error('Fallback operation failed:', error.message);
        }
      }
    }

    // Try built-in fallback chain
    for (const fallbackService of config.fallbackChain) {
      try {
        const result = await this.getStaticFallback(serviceName, fallbackService);
        if (result) return result as T;
      } catch (error) {
        console.error(`Fallback ${fallbackService} failed:`, error.message);
      }
    }

    throw new Error(`All fallback options exhausted for ${serviceName}`);
  }

  private async getStaticFallback<T>(serviceName: string, fallbackType: string): Promise<T> {
    const fallbackData = this.getStaticFallbackData(serviceName, fallbackType);
    
    if (!fallbackData) {
      throw new Error(`No static fallback data for ${serviceName}:${fallbackType}`);
    }

    return fallbackData as T;
  }

  private getStaticFallbackData(serviceName: string, fallbackType: string): any {
    const fallbackDatabase: Record<string, Record<string, any>> = {
      qloo: {
        static_recommendations: [
          { id: 'fallback-1', name: 'Local Hotspot', type: 'venue', tags: ['popular', 'trendy'] },
          { id: 'fallback-2', name: 'Cultural Center', type: 'venue', tags: ['art', 'culture'] },
        ],
      },
      foursquare: {
        generic_venues: [
          {
            fsq_id: 'fallback-venue-1',
            name: 'Popular Local Spot',
            location: { formatted_address: 'City Center' },
            categories: [{ name: 'Restaurant' }],
            rating: 4.0,
          },
        ],
      },
      tavily: {
        static_search: {
          query: 'fallback search',
          results: [
            {
              title: 'Local Guide',
              url: 'https://example.com',
              content: 'General local information and recommendations.',
              score: 0.5,
            },
          ],
          answer: 'Here are some general recommendations for your area.',
          response_time: 0.1,
        },
      },
      openai: {
        static_responses: {
          choices: [
            {
              message: {
                content: 'I understand you\'re looking for recommendations. Let me help you find something great in your area.',
              },
            },
          ],
        },
      },
    };

    return fallbackDatabase[serviceName]?.[fallbackType];
  }

  private recordSuccess(serviceName: string): void {
    const health = this.getServiceHealth(serviceName);
    health.isHealthy = true;
    health.failureCount = 0;
    health.lastCheck = new Date();
    
    // Close circuit breaker if it was open
    this.circuitBreakers.set(serviceName, false);
  }

  private recordFailure(serviceName: string, error: string): void {
    const health = this.getServiceHealth(serviceName);
    health.isHealthy = false;
    health.failureCount += 1;
    health.lastCheck = new Date();
    health.lastError = error;

    const config = this.fallbackConfigs[serviceName];
    if (health.failureCount >= config.circuitBreakerThreshold) {
      console.log(`Opening circuit breaker for ${serviceName}`);
      this.circuitBreakers.set(serviceName, true);
      
      // Auto-close circuit breaker after 5 minutes
      setTimeout(() => {
        console.log(`Auto-closing circuit breaker for ${serviceName}`);
        this.circuitBreakers.set(serviceName, false);
        health.failureCount = 0;
      }, 5 * 60 * 1000);
    }
  }

  private getServiceHealth(serviceName: string): ServiceHealth {
    if (!this.serviceHealth.has(serviceName)) {
      this.serviceHealth.set(serviceName, {
        serviceName,
        isHealthy: true,
        lastCheck: new Date(),
        failureCount: 0,
      });
    }
    return this.serviceHealth.get(serviceName)!;
  }

  private isCircuitBreakerOpen(serviceName: string): boolean {
    return this.circuitBreakers.get(serviceName) || false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSystemHealth(): Record<string, ServiceHealth> {
    const health: Record<string, ServiceHealth> = {};
    
    for (const [serviceName, serviceHealth] of this.serviceHealth.entries()) {
      health[serviceName] = { ...serviceHealth };
    }
    
    return health;
  }

  async performHealthCheck(serviceName: string, healthCheckFn: () => Promise<boolean>): Promise<boolean> {
    try {
      const isHealthy = await healthCheckFn();
      
      if (isHealthy) {
        this.recordSuccess(serviceName);
      } else {
        this.recordFailure(serviceName, 'Health check failed');
      }
      
      return isHealthy;
    } catch (error) {
      this.recordFailure(serviceName, error.message);
      return false;
    }
  }

  createRateLimiter(requestsPerMinute: number) {
    const requests: number[] = [];
    
    return async <T>(operation: () => Promise<T>): Promise<T> => {
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      
      // Remove old requests
      while (requests.length > 0 && requests[0] < oneMinuteAgo) {
        requests.shift();
      }
      
      if (requests.length >= requestsPerMinute) {
        const waitTime = requests[0] + 60 * 1000 - now;
        console.log(`Rate limit reached, waiting ${waitTime}ms`);
        await this.delay(waitTime);
        return this.createRateLimiter(requestsPerMinute)(operation);
      }
      
      requests.push(now);
      return await operation();
    };
  }

  async gracefulDegradation<T>(
    operations: Array<{
      name: string;
      operation: () => Promise<T>;
      priority: number;
    }>,
    timeoutMs: number = 5000
  ): Promise<T[]> {
    const results: T[] = [];
    
    // Sort by priority (higher number = higher priority)
    const sortedOps = operations.sort((a, b) => b.priority - a.priority);
    
    const promises = sortedOps.map(async ({ name, operation }) => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`${name} timeout`)), timeoutMs)
        );
        
        const result = await Promise.race([operation(), timeoutPromise]);
        return { name, result, success: true };
      } catch (error) {
        console.error(`Operation ${name} failed:`, error.message);
        return { name, result: null, success: false };
      }
    });
    
    const settled = await Promise.allSettled(promises);
    
    settled.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        results.push(result.value.result);
      }
    });
    
    return results;
  }
}