import { Injectable } from '@nestjs/common';

interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoff?: boolean;
}

@Injectable()
export class ErrorHandlerService {
  async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = { maxRetries: 3, delay: 1000 }
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === options.maxRetries) {
          break;
        }
        
        const delay = options.backoff 
          ? options.delay * Math.pow(2, attempt - 1)
          : options.delay;
          
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  async withFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>,
    fallbackMessage?: string
  ): Promise<T> {
    try {
      return await primary();
    } catch (error) {
      console.warn(fallbackMessage || 'Primary operation failed, using fallback:', error.message);
      return await fallback();
    }
  }

  getUserFriendlyMessage(error: Error): string {
    if (error.message.includes('API key')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    
    if (error.message.includes('rate limit')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return 'Connection issue. Please check your internet and try again.';
    }
    
    if (error.message.includes('credits')) {
      return 'You\'re out of credits. Use /buy to get more!';
    }
    
    return 'Something went wrong. Please try again or contact support.';
  }

  logError(service: string, operation: string, error: Error): void {
    console.error(`[${service}] ${operation} failed:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}