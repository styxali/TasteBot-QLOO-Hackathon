import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LLMResponse {
  content: string;
  provider: string;
}

interface UserIntent {
  type: 'plan_request' | 'question' | 'taste_update' | 'location_query';
  location?: string;
  preferences?: string[];
  mood?: string;
  timeframe?: string;
}

@Injectable()
export class LlmService {
  private providers: any;

  constructor(private readonly configService: ConfigService) {
    this.providers = {
      groq: this.configService.get<string>('llm.groq.apiKey'),
      openai: this.configService.get<string>('llm.openai.apiKey'),
      gemini: this.configService.get<string>('llm.gemini.apiKey'),
    };
  }

  async generateResponse(prompt: string, context?: any): Promise<LLMResponse> {
    // Try Groq first (primary)
    if (this.providers.groq) {
      try {
        return await this.callGroq(prompt, context);
      } catch (error) {
        console.error('Groq failed, trying fallback:', error);
      }
    }

    // Fallback to OpenAI
    if (this.providers.openai) {
      try {
        return await this.callOpenAI(prompt, context);
      } catch (error) {
        console.error('OpenAI failed, trying Gemini:', error);
      }
    }

    // Final fallback to Gemini
    if (this.providers.gemini) {
      return await this.callGemini(prompt, context);
    }

    throw new Error('No LLM providers available');
  }

  async parseIntent(userMessage: string): Promise<UserIntent> {
    const prompt = `Analyze this user message and extract intent:
    
Message: "${userMessage}"

Return JSON with:
- type: plan_request|question|taste_update|location_query
- location: extracted location if any
- preferences: array of cultural preferences mentioned
- mood: extracted mood/vibe if any
- timeframe: when they want to do this

Example: {"type": "plan_request", "location": "Lisbon", "preferences": ["jazz", "sushi"], "mood": "chill", "timeframe": "tonight"}`;

    try {
      const response = await this.generateResponse(prompt);
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback intent parsing
      return {
        type: 'plan_request',
        preferences: this.extractPreferences(userMessage),
        location: this.extractLocation(userMessage),
      };
    }
  }

  async synthesizePlan(qlooData: any[], userIntent: UserIntent): Promise<string> {
    const prompt = `Create a personalized plan based on:

User Intent: ${JSON.stringify(userIntent)}
Qloo Recommendations: ${JSON.stringify(qlooData)}

Generate a friendly, engaging response with:
1. Brief intro acknowledging their taste
2. 3-5 specific recommendations with emojis
3. Brief description for each
4. Encouraging closing

Keep it conversational and exciting!`;

    const response = await this.generateResponse(prompt);
    return response.content;
  }

  private async callGroq(prompt: string, context?: any): Promise<LLMResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.providers.groq}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: 'You are TasteBot, a cultural concierge that creates personalized plans based on taste.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      provider: 'groq',
    };
  }

  private async callOpenAI(prompt: string, context?: any): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.providers.openai}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are TasteBot, a cultural concierge that creates personalized plans based on taste.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      provider: 'openai',
    };
  }

  private async callGemini(prompt: string, context?: any): Promise<LLMResponse> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.providers.gemini}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      provider: 'gemini',
    };
  }

  private extractPreferences(text: string): string[] {
    const preferences = [];
    const culturalTerms = ['jazz', 'techno', 'indie', 'sushi', 'ramen', 'coffee', 'wine', 'art', 'cinema', 'books'];
    
    culturalTerms.forEach(term => {
      if (text.toLowerCase().includes(term)) {
        preferences.push(term);
      }
    });

    return preferences;
  }

  private extractLocation(text: string): string | undefined {
    const locationPattern = /\b(in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/i;
    const match = text.match(locationPattern);
    return match ? match[2] : undefined;
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    // Placeholder for audio transcription
    // Would integrate with Whisper API or similar
    return 'Audio transcription not implemented yet';
  }

  async analyzeImage(imageBuffer: Buffer): Promise<string> {
    // Placeholder for image analysis
    // Would integrate with vision models
    return 'Image analysis not implemented yet';
  }
}