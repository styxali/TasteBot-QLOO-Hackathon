import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface VoiceAnalysisResult {
  transcription: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  emotionalTone: string[];
  culturalContext: string[];
  extractedPreferences: string[];
  confidence: number;
}

interface WhisperResponse {
  text: string;
}

@Injectable()
export class VoiceProcessingService {
  private openaiApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('openai.apiKey');
  }

  async processVoiceMessage(audioBuffer: Buffer, mimeType: string): Promise<VoiceAnalysisResult> {
    try {
      // First, transcribe the audio
      const transcription = await this.transcribeAudio(audioBuffer, mimeType);
      
      if (!transcription) {
        return this.getFallbackResult('Could not transcribe audio');
      }

      // Then analyze the transcription for cultural context
      const analysis = await this.analyzeCulturalContent(transcription);
      
      return {
        transcription,
        ...analysis,
      };
    } catch (error) {
      console.error('Voice processing error:', error);
      return this.getFallbackResult('Error processing voice message');
    }
  }

  private async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
    if (!this.openaiApiKey) {
      console.warn('OpenAI API key not configured for voice transcription');
      return 'Voice transcription not available';
    }

    try {
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: mimeType });
      formData.append('file', audioBlob, 'audio.ogg');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const whisperResponse: WhisperResponse = response.data;
      return whisperResponse.text;
    } catch (error) {
      console.error('Whisper transcription error:', error);
      return '';
    }
  }

  private async analyzeCulturalContent(text: string): Promise<Omit<VoiceAnalysisResult, 'transcription'>> {
    try {
      if (!this.openaiApiKey) {
        return this.parseTextForCulturalSignals(text);
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a cultural analysis expert. Analyze the following text for cultural preferences, emotional tone, and taste indicators. Return a JSON object with: sentiment (positive/negative/neutral), emotionalTone (array), culturalContext (array), extractedPreferences (array), confidence (0-1).',
            },
            {
              role: 'user',
              content: text,
            },
          ],
          max_tokens: 300,
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
        return this.parseTextForCulturalSignals(text);
      }
    } catch (error) {
      console.error('Cultural analysis error:', error);
      return this.parseTextForCulturalSignals(text);
    }
  }

  private parseTextForCulturalSignals(text: string): Omit<VoiceAnalysisResult, 'transcription'> {
    const textLower = text.toLowerCase();
    
    // Sentiment analysis
    const positiveWords = ['love', 'like', 'enjoy', 'amazing', 'great', 'awesome', 'fantastic'];
    const negativeWords = ['hate', 'dislike', 'terrible', 'awful', 'bad', 'horrible'];
    
    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    // Emotional tone
    const emotionalTones: string[] = [];
    if (textLower.includes('excited') || textLower.includes('energetic')) emotionalTones.push('excited');
    if (textLower.includes('calm') || textLower.includes('relaxed')) emotionalTones.push('calm');
    if (textLower.includes('romantic') || textLower.includes('intimate')) emotionalTones.push('romantic');
    if (textLower.includes('fun') || textLower.includes('party')) emotionalTones.push('playful');

    // Cultural context
    const culturalContext: string[] = [];
    const culturalKeywords = {
      'indie': ['indie', 'independent', 'alternative'],
      'mainstream': ['popular', 'mainstream', 'trendy'],
      'vintage': ['vintage', 'retro', 'classic', 'old-school'],
      'modern': ['modern', 'contemporary', 'new', 'fresh'],
      'artsy': ['art', 'artistic', 'creative', 'bohemian'],
      'upscale': ['upscale', 'fancy', 'elegant', 'sophisticated'],
      'casual': ['casual', 'laid-back', 'chill', 'relaxed'],
    };

    Object.entries(culturalKeywords).forEach(([context, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        culturalContext.push(context);
      }
    });

    // Extract preferences
    const extractedPreferences: string[] = [];
    const preferenceKeywords = [
      'jazz', 'rock', 'electronic', 'classical', 'hip-hop', 'pop',
      'italian', 'japanese', 'mexican', 'french', 'thai', 'indian',
      'coffee', 'wine', 'cocktails', 'beer', 'tea',
      'art', 'music', 'books', 'movies', 'photography',
      'outdoor', 'indoor', 'quiet', 'loud', 'crowded', 'intimate',
    ];

    preferenceKeywords.forEach(pref => {
      if (textLower.includes(pref)) {
        extractedPreferences.push(pref);
      }
    });

    return {
      sentiment,
      emotionalTone: emotionalTones,
      culturalContext,
      extractedPreferences,
      confidence: 0.6,
    };
  }

  private getFallbackResult(transcription: string): VoiceAnalysisResult {
    return {
      transcription,
      sentiment: 'neutral',
      emotionalTone: [],
      culturalContext: [],
      extractedPreferences: [],
      confidence: 0.3,
    };
  }

  async enhanceTextWithVoiceContext(
    text: string,
    voiceAnalysis: VoiceAnalysisResult
  ): Promise<string> {
    // Combine text with voice analysis context
    let enhancedText = text;
    
    if (voiceAnalysis.emotionalTone.length > 0) {
      enhancedText += ` [Emotional tone: ${voiceAnalysis.emotionalTone.join(', ')}]`;
    }
    
    if (voiceAnalysis.culturalContext.length > 0) {
      enhancedText += ` [Cultural context: ${voiceAnalysis.culturalContext.join(', ')}]`;
    }
    
    if (voiceAnalysis.extractedPreferences.length > 0) {
      enhancedText += ` [Preferences: ${voiceAnalysis.extractedPreferences.join(', ')}]`;
    }
    
    return enhancedText;
  }
}