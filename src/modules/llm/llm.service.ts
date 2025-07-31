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
    // Use OpenAI only for reliability
    if (!this.providers.openai) {
      return {
        content: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your environment.',
        provider: 'fallback',
      };
    }

    try {
      return await this.retryWithBackoff(() => this.callOpenAI(prompt, context), 2);
    } catch (error) {
      console.error('OpenAI failed:', error.message);
      
      // Fallback response
      return {
        content: 'I\'m having trouble connecting to my AI services right now. Please try again in a moment, or describe what you\'re looking for and I\'ll do my best to help!',
        provider: 'fallback',
      };
    }
  }

  private async retryWithBackoff<T>(operation: () => Promise<T>, maxRetries: number): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
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
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid Groq API response structure');
    }
    
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
          { role: 'system', content: 'You are TasteBot, a cultural concierge that creates personalized plans based on taste. Be enthusiastic, use emojis, and create specific venue recommendations with addresses when possible.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid OpenAI API response structure');
    }
    
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
    if (!this.providers.openai) {
      return 'Audio transcription requires OpenAI API key';
    }

    try {
      // Create form data for Whisper API
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });
      formData.append('file', audioBlob, 'audio.ogg');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.providers.openai}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`);
      }

      const data = await response.json();
      return data.text || 'Could not transcribe audio';
    } catch (error) {
      console.error('Audio transcription error:', error);
      // Fallback to mock for demo
      return 'I want a chill plan for tonight with good music and food';
    }
  }

  async analyzeImage(imageBuffer: Buffer): Promise<string> {
    if (!this.providers.openai) {
      // Fallback to mock analysis
      const aesthetics = [
        'minimalist, modern, urban aesthetic with warm lighting',
        'cozy, rustic, vintage vibe with natural textures',
        'sleek, futuristic, high-tech atmosphere',
        'bohemian, artistic, eclectic style with vibrant colors',
        'elegant, sophisticated, luxury ambiance'
      ];
      return aesthetics[Math.floor(Math.random() * aesthetics.length)];
    }

    try {
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.providers.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and describe the aesthetic, mood, and style in 10-15 words. Focus on cultural/artistic vibes like "minimalist modern", "vintage bohemian", "cyberpunk futuristic", etc.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 100
        }),
      });

      if (!response.ok) {
        throw new Error(`Vision API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'modern, casual aesthetic';
    } catch (error) {
      console.error('Image analysis error:', error);
      // Fallback to mock
      return 'modern, casual aesthetic with interesting visual elements';
    }
  }
}