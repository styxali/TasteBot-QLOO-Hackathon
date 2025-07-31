import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { PlanService } from '../plan/plan.service';
import { SessionService } from '../session/session.service';
import { text } from 'express';
import { string } from 'joi';
import { any } from 'joi';
import { string } from 'joi';
import { string } from 'joi';
import { text } from 'express';
import { string } from 'joi';
import { string } from 'joi';
import { text } from 'express';
import { string } from 'joi';
import { string } from 'joi';
import { text } from 'express';
import { string } from 'joi';
import { string } from 'joi';
import { text } from 'express';
import { string } from 'joi';
import { text } from 'express';
import { string } from 'joi';
import { text } from 'express';

@Injectable()
export class TelegramService {
  private botToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly planService: PlanService,
    private readonly sessionService: SessionService,
  ) {
    this.botToken = this.configService.get<string>('telegram.botToken');
  }

  async processUpdate(update: any): Promise<void> {
    if (update.message) {
      if (update.message.voice) {
        await this.handleVoiceMessage(update.message);
      } else if (update.message.photo) {
        await this.handlePhotoMessage(update.message);
      } else if (update.message.location) {
        await this.handleLocationMessage(update.message);
      } else {
        await this.handleMessage(update.message);
      }
    } else if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
    }
  }

  private async handleMessage(message: any): Promise<void> {
    const telegramId = message.from.id.toString();
    
    // ALWAYS ensure user exists first with proper profile
    const user = await this.userService.findOrCreate(telegramId);
    console.log(`👤 User ${telegramId} - Credits: ${user.credits}`);

    // Skip conversation history for now

    if (message.text === '/start') {
      await this.sendWelcomeMessage(message.chat.id);
      return;
    }

    if (message.text === '/credits') {
      const balance = await this.userService.checkBalance(telegramId);
      await this.sendMessage(message.chat.id, `You have ${balance} credits remaining.`);
      return;
    }

    if (message.text === '/mood') {
      await this.sendMessage(message.chat.id, 'What\'s your current mood? (e.g., chill, energetic, romantic, adventurous)');
      return;
    }

    if (message.text === '/demo') {
      await this.sendDemoFlow(message.chat.id);
      return;
    }

    if (message.text === '/buy') {
      await this.sendBuyCreditsMessage(message.chat.id);
      return;
    }

    if (message.text === '/profile') {
      await this.sendProfileInfo(telegramId, message.chat.id);
      return;
    }

    if (message.text === '/taste') {
      await this.sendTasteProfileInfo(telegramId, message.chat.id);
      return;
    }

    if (message.text === '/help') {
      await this.sendHelpMessage(message.chat.id);
      return;
    }

    // Check for taste profile reset
    if (message.text.toLowerCase().includes('reset my taste profile')) {
      await this.userService.updateTasteProfile(telegramId, []);
      await this.sendMessage(message.chat.id, '🔄 Your taste profile has been reset! Tell me what you love and I\'ll start learning your preferences again.');
      return;
    }

    // Check if it's a mood update
    if (await this.isMoodUpdate(message.text)) {
      await this.sessionService.updateMood(telegramId, message.text);
      await this.sendMessage(message.chat.id, `Got it! Your mood is now set to "${message.text}". This will help me give you better recommendations.`);
      return;
    }

    // Extract and save taste preferences from message
    await this.extractAndSaveTasteProfile(telegramId, message.text);

    // Handle regular messages
    if (user.credits > 0) {
      // Send processing message
      await this.sendMessage(message.chat.id, 'Processing your request...');
      
      const isFollowUp = await this.sessionService.isFollowUpMessage(telegramId, message.text);
      
      if (isFollowUp) {
        const context = await this.sessionService.getConversationContext(telegramId);
        const enhancedMessage = `${context} User says: ${message.text}`;
        
        const plan = await this.planService.generatePlanForUser(telegramId, enhancedMessage);
        if (plan) {
          await this.sessionService.savePlanToContext(telegramId, plan);
          const formattedPlan = this.planService.formatPlanForTelegram(plan);
          await this.sendMessage(message.chat.id, formattedPlan, this.createQuickStartKeyboard());
        }
      } else {
        // Check if user has enough profile info
        const tasteProfile = await this.userService.getTasteProfile(telegramId);
        const needsMoreInfo = await this.checkIfNeedsMoreProfileInfo(telegramId, message.text, tasteProfile);
        
        if (needsMoreInfo) {
          await this.sendMessage(message.chat.id, needsMoreInfo);
          return;
        }

        const plan = await this.planService.generatePlanForUser(telegramId, message.text);
        console.log('📋 Generated plan:', plan ? 'SUCCESS' : 'FAILED');
        
        if (plan) {
          await this.sessionService.savePlanToContext(telegramId, plan);
          const formattedPlan = this.planService.formatPlanForTelegram(plan);
          console.log('📝 Formatted plan length:', formattedPlan.length);
          console.log('📝 Formatted plan preview:', formattedPlan.substring(0, 200));
          
          await this.sendMessage(message.chat.id, formattedPlan, this.createQuickStartKeyboard());
        } else {
          const keywords = this.extractKeywords(message.text);
          const helpText = this.getContextualHelp(keywords, message.text);
          await this.sendMessage(message.chat.id, helpText);
        }
      }
    } else {
      await this.sendMessage(message.chat.id, `💳 You're out of credits! 

You need credits to generate personalized plans. Each plan costs 1 credit.

Use /buy to purchase more credits, or try these free commands:
• /profile - View your profile
• /taste - Manage taste preferences  
• /demo - See examples
• /credits - Check balance

Ready to get more credits? 🚀`, {
        inline_keyboard: [
          [{ text: '💳 Buy Credits', callback_data: 'buy_credits' }]
        ]
      });
    }
  }

  private async extractAndSaveTasteProfile(telegramId: string, message: string): Promise<void> {
    try {
      const keywords = this.extractKeywords(message);
      if (keywords.length > 0) {
        await this.userService.updateTasteProfile(telegramId, keywords);
        console.log(`💾 Saved taste profile for ${telegramId}:`, keywords);
      }
    } catch (error) {
      console.error('Error saving taste profile:', error);
    }
  }

  private extractKeywords(text: string): string[] {
    const keywords = [];
    const culturalTerms = [
      'hip hop', 'jazz', 'techno', 'indie', 'rock', 'pop', 'classical', 'blues', 'reggae',
      'sushi', 'ramen', 'steak', 'pizza', 'tacos', 'burgers', 'pasta', 'seafood', 'vegan',
      'coffee', 'wine', 'beer', 'cocktails', 'tea',
      'art', 'cinema', 'books', 'photography', 'design', 'fashion',
      'cyberpunk', 'vintage', 'modern', 'minimalist', 'bohemian', 'urban', 'cozy'
    ];
    
    const lowerText = text.toLowerCase();
    culturalTerms.forEach(term => {
      if (lowerText.includes(term)) {
        keywords.push(term);
      }
    });

    return [...new Set(keywords)]; // Remove duplicates
  }

  private async checkIfNeedsMoreProfileInfo(telegramId: string, message: string, tasteProfile: any): Promise<string | null> {
    const keywords = tasteProfile.keywords || [];
    const messageKeywords = this.extractKeywords(message);
    
    // If user has very few preferences, ask for more
    if (keywords.length < 3) {
      const missingCategories = [];
      
      const hasMusic = keywords.some(k => ['hip hop', 'jazz', 'techno', 'indie', 'rock', 'pop', 'classical', 'blues', 'reggae'].includes(k));
      const hasFood = keywords.some(k => ['sushi', 'ramen', 'steak', 'pizza', 'tacos', 'burgers', 'pasta', 'seafood', 'vegan'].includes(k));
      const hasVibe = keywords.some(k => ['cyberpunk', 'vintage', 'modern', 'minimalist', 'bohemian', 'urban', 'cozy'].includes(k));
      
      if (!hasMusic) missingCategories.push('music genre');
      if (!hasFood) missingCategories.push('food preference');
      if (!hasVibe) missingCategories.push('aesthetic vibe');
      
      if (missingCategories.length > 0 && messageKeywords.length === 0) {
        return `🤖 I'd love to give you better recommendations! 

Your current taste profile: ${keywords.length > 0 ? keywords.join(', ') : 'Empty'}

To improve your plans, tell me about your:
${missingCategories.map(cat => `• ${cat.charAt(0).toUpperCase() + cat.slice(1)}`).join('\n')}

Example: "I love jazz music, sushi, and cozy minimalist vibes"

Then ask me again for recommendations! 🎯`;
      }
    }
    
    return null;
  }

  private async isMoodUpdate(text: string): Promise<boolean> {
    const moodKeywords = [
      'chill', 'relaxed', 'calm', 'peaceful',
      'energetic', 'hyper', 'active', 'pumped',
      'romantic', 'intimate', 'cozy', 'loving',
      'adventurous', 'exciting', 'wild', 'crazy',
      'creative', 'artistic', 'inspired',
      'social', 'party', 'fun', 'outgoing',
      'introspective', 'thoughtful', 'quiet'
    ];

    return moodKeywords.some(mood => text.toLowerCase().includes(mood));
  }

  private async handleVoiceMessage(message: any): Promise<void> {
    const telegramId = message.from.id.toString();
    
    try {
      // Get voice file info
      const fileId = message.voice.file_id;
      const fileInfo = await this.getFileInfo(fileId);
      
      if (fileInfo && fileInfo.file_path) {
        // Download voice file
        const audioBuffer = await this.downloadFile(fileInfo.file_path);
        
        // Transcribe using LLM service (placeholder)
        await this.sendMessage(message.chat.id, '🎙️ Voice message received! Processing...');
        
        // For MVP, we'll simulate transcription
        const transcribedText = 'I want a chill plan for tonight with good music and food';
        
        await this.sessionService.addToConversationHistory(telegramId, `[Voice]: ${transcribedText}`);
        
        // Process as regular text message
        const user = await this.userService.findOrCreate(telegramId);
        if (user.credits > 0) {
          const plan = await this.planService.generatePlanForUser(telegramId, transcribedText);
          if (plan) {
            await this.sessionService.savePlanToContext(telegramId, plan);
            const formattedPlan = this.planService.formatPlanForTelegram(plan);
            await this.sendMessage(message.chat.id, formattedPlan, this.createQuickStartKeyboard());
          }
        } else {
          await this.sendMessage(message.chat.id, 'You\'re out of credits. Use /buy to get more!');
        }
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      await this.sendMessage(message.chat.id, 'Sorry, I couldn\'t process your voice message. Please try typing instead.');
    }
  }

  private async handlePhotoMessage(message: any): Promise<void> {
    const telegramId = message.from.id.toString();
    
    try {
      // Get largest photo
      const photo = message.photo[message.photo.length - 1];
      const fileInfo = await this.getFileInfo(photo.file_id);
      
      if (fileInfo && fileInfo.file_path) {
        await this.sendMessage(message.chat.id, '📸 Photo received! Analyzing your aesthetic...');
        
        // Download image
        const imageBuffer = await this.downloadFile(fileInfo.file_path);
        
        // For MVP, simulate image analysis
        const aestheticDescription = 'minimalist, modern, urban aesthetic with warm lighting';
        
        await this.sessionService.addToConversationHistory(telegramId, `[Photo]: ${aestheticDescription}`);
        
        // Generate plan based on aesthetic
        const user = await this.userService.findOrCreate(telegramId);
        if (user.credits > 0) {
          const prompt = `Create a plan that matches this aesthetic: ${aestheticDescription}`;
          const plan = await this.planService.generatePlanForUser(telegramId, prompt);
          
          if (plan) {
            await this.sessionService.savePlanToContext(telegramId, plan);
            const formattedPlan = this.planService.formatPlanForTelegram(plan);
            await this.sendMessage(message.chat.id, `Based on your photo's ${aestheticDescription} vibe:\n\n${formattedPlan}`, this.createQuickStartKeyboard());
          }
        } else {
          await this.sendMessage(message.chat.id, 'You\'re out of credits. Use /buy to get more!');
        }
      }
    } catch (error) {
      console.error('Photo processing error:', error);
      await this.sendMessage(message.chat.id, 'Sorry, I couldn\'t analyze your photo. Please try describing what you\'re looking for instead.');
    }
  }

  private async handleLocationMessage(message: any): Promise<void> {
    const telegramId = message.from.id.toString();
    
    try {
      const { latitude, longitude } = message.location;
      
      await this.sendMessage(message.chat.id, '📍 Location received! Finding nearby recommendations...');
      
      // Update session with location
      await this.sessionService.updateLocation(telegramId, `${latitude},${longitude}`);
      
      // Generate location-based plan
      const user = await this.userService.findOrCreate(telegramId);
      if (user.credits > 0) {
        const prompt = `Find interesting places near my current location (${latitude}, ${longitude})`;
        const plan = await this.planService.generatePlanForUser(telegramId, prompt);
        
        if (plan) {
          await this.sessionService.savePlanToContext(telegramId, plan);
          const formattedPlan = this.planService.formatPlanForTelegram(plan);
          await this.sendMessage(message.chat.id, formattedPlan, this.createQuickStartKeyboard());
        }
      } else {
        await this.sendMessage(message.chat.id, 'You\'re out of credits. Use /buy to get more!');
      }
    } catch (error) {
      console.error('Location processing error:', error);
      await this.sendMessage(message.chat.id, 'Sorry, I couldn\'t process your location. Please try typing your location instead.');
    }
  }

  private async getFileInfo(fileId: string): Promise<any> {
    const url = `https://api.telegram.org/bot${this.botToken}/getFile?file_id=${fileId}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.ok ? data.result : null;
    } catch (error) {
      console.error('Get file info error:', error);
      return null;
    }
  }

  private async downloadFile(filePath: string): Promise<Buffer> {
    const url = `https://api.telegram.org/file/bot${this.botToken}/${filePath}`;
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Download file error:', error);
      throw error;
    }
  }

  private async sendDemoFlow(chatId: number): Promise<void> {
    const demoText = `🎬 DEMO MODE: Here are some examples to try:

🎯 **Text Examples:**
• "I love Blade Runner and jazz in Tokyo"
• "Cozy coffee shop vibes in Paris" 
• "Cyberpunk night out in Berlin"
• "Minimalist aesthetic with good wine"

📸 **Multi-Modal:**
• Send a photo of your aesthetic
• Record a voice message with your preferences
• Share your location for nearby spots

Each shows different AI capabilities! 🤖

Try any of these to see TasteBot's cultural intelligence in action.`;

    await this.sendMessage(chatId, demoText);
  }

  private async handleCallbackQuery(callbackQuery: any): Promise<void> {
    const telegramId = callbackQuery.from.id.toString();
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    // Answer the callback query to remove loading state
    await this.answerCallbackQuery(callbackQuery.id);

    // Check credits for plan generation buttons
    const user = await this.userService.findByTelegramId(telegramId);
    const needsCredits = ['another_plan', 'nearby_options', 'music_food_plan', 'music_food', 'night_out', 'chill_day', 'cultural'].includes(data);
    
    if (needsCredits && (!user || user.credits < 1)) {
      await this.sendMessage(chatId, '💳 You need credits to generate plans! Use /buy to get more credits.');
      return;
    }

    switch (data) {
      case 'another_plan':
        await this.sendMessage(chatId, '🔮 Generating another plan based on your preferences...');
        await this.generatePlanFromProfile(telegramId, chatId);
        break;
        
      case 'nearby_options':
        await this.sendMessage(chatId, '📍 Finding nearby options based on your taste...');
        await this.generateNearbyPlan(telegramId, chatId);
        break;
        
      case 'music_food_plan':
      case 'music_food':
        await this.sendMessage(chatId, '🎵🍽️ Creating a music + food experience...');
        await this.generateMusicFoodPlan(telegramId, chatId);
        break;
        
      case 'night_out':
        await this.sendMessage(chatId, '🌃 Planning your perfect night out...');
        await this.generateNightOutPlan(telegramId, chatId);
        break;
        
      case 'chill_day':
        await this.sendMessage(chatId, '☕ Creating a chill day plan...');
        await this.generateChillPlan(telegramId, chatId);
        break;
        
      case 'cultural':
        await this.sendMessage(chatId, '🎨 Finding cultural experiences...');
        await this.generateCulturalPlan(telegramId, chatId);
        break;
        
      case 'location':
        await this.sendMessage(chatId, '📍 Please share your location and I\'ll find great spots nearby!');
        break;
        
      case 'buy_credits':
        await this.sendBuyCreditsMessage(chatId);
        break;
        
      default:
        await this.sendMessage(chatId, 'Sorry, I didn\'t understand that option. Try typing what you\'re looking for!');
    }
  }

  private async generatePlanFromProfile(telegramId: string, chatId: number): Promise<void> {
    const tasteProfile = await this.userService.getTasteProfile(telegramId);
    const preferences = tasteProfile.keywords?.join(' and ') || 'trendy spots';
    
    const plan = await this.planService.generatePlanForUser(telegramId, `I want recommendations based on my taste for ${preferences}`);
    
    if (plan) {
      await this.sessionService.savePlanToContext(telegramId, plan);
      const formattedPlan = this.planService.formatPlanForTelegram(plan);
      await this.sendMessage(chatId, formattedPlan, this.createQuickStartKeyboard());
    } else {
      await this.sendMessage(chatId, 'Sorry, I couldn\'t generate a plan right now. Please try again!');
    }
  }

  private async generateNearbyPlan(telegramId: string, chatId: number): Promise<void> {
    const plan = await this.planService.generatePlanForUser(telegramId, 'Find me great nearby spots that match my taste');
    
    if (plan) {
      await this.sessionService.savePlanToContext(telegramId, plan);
      const formattedPlan = this.planService.formatPlanForTelegram(plan);
      await this.sendMessage(chatId, formattedPlan, this.createQuickStartKeyboard());
    } else {
      await this.sendMessage(chatId, 'Sorry, I couldn\'t find nearby options right now. Try sharing your location or being more specific!');
    }
  }

  private async generateMusicFoodPlan(telegramId: string, chatId: number): Promise<void> {
    const plan = await this.planService.generatePlanForUser(telegramId, 'Create a plan combining great music venues and delicious food');
    
    if (plan) {
      await this.sessionService.savePlanToContext(telegramId, plan);
      const formattedPlan = this.planService.formatPlanForTelegram(plan);
      await this.sendMessage(chatId, formattedPlan, this.createQuickStartKeyboard());
    } else {
      await this.sendMessage(chatId, 'Tell me your favorite music genre and food type for better recommendations!');
    }
  }

  private async generateNightOutPlan(telegramId: string, chatId: number): Promise<void> {
    const plan = await this.planService.generatePlanForUser(telegramId, 'Plan an exciting night out with bars, clubs, and entertainment');
    
    if (plan) {
      await this.sessionService.savePlanToContext(telegramId, plan);
      const formattedPlan = this.planService.formatPlanForTelegram(plan);
      await this.sendMessage(chatId, formattedPlan, this.createQuickStartKeyboard());
    } else {
      await this.sendMessage(chatId, 'What kind of night out vibe are you feeling? Tell me more about your preferences!');
    }
  }

  private async generateChillPlan(telegramId: string, chatId: number): Promise<void> {
    const plan = await this.planService.generatePlanForUser(telegramId, 'Create a relaxing chill day with cozy cafes, peaceful spots, and good vibes');
    
    if (plan) {
      await this.sessionService.savePlanToContext(telegramId, plan);
      const formattedPlan = this.planService.formatPlanForTelegram(plan);
      await this.sendMessage(chatId, formattedPlan, this.createQuickStartKeyboard());
    } else {
      await this.sendMessage(chatId, 'What makes you feel chill? Coffee shops, parks, bookstores? Tell me more!');
    }
  }

  private async generateCulturalPlan(telegramId: string, chatId: number): Promise<void> {
    const plan = await this.planService.generatePlanForUser(telegramId, 'Find cultural experiences like art galleries, museums, theaters, and cultural venues');
    
    if (plan) {
      await this.sessionService.savePlanToContext(telegramId, plan);
      const formattedPlan = this.planService.formatPlanForTelegram(plan);
      await this.sendMessage(chatId, formattedPlan, this.createQuickStartKeyboard());
    } else {
      await this.sendMessage(chatId, 'What cultural experiences interest you? Art, music, theater, history? Let me know!');
    }
  }

  private async answerCallbackQuery(callbackQueryId: string): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`;
    
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQueryId }),
      });
    } catch (error) {
      console.error('Failed to answer callback query:', error);
    }
  }

  private async sendBuyCreditsMessage(chatId: number): Promise<void> {
    const buyText = `💳 *Buy More Credits*

*Current pricing:*
• 50 credits \\- $5\\.00
• 100 credits \\- $9\\.00 \\(_Save $1\\!_\\)
• 200 credits \\- $17\\.00 \\(_Save $3\\!_\\)

Each credit = 1 personalized plan 🎯

*Click below to purchase:*`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💳 Buy 50 Credits ($5)', url: 'https://buy.stripe.com/test_50credits' },
        ],
        [
          { text: '💎 Buy 100 Credits ($9)', url: 'https://buy.stripe.com/test_100credits' },
        ],
        [
          { text: '🚀 Buy 200 Credits ($17)', url: 'https://buy.stripe.com/test_200credits' },
        ],
      ],
    };

    await this.sendMessage(chatId, buyText, keyboard);
  }

  private async sendProfileInfo(telegramId: string, chatId: number): Promise<void> {
    const user = await this.userService.findByTelegramId(telegramId);
    const tasteProfile = await this.userService.getTasteProfile(telegramId);

    const profileText = `👤 *Your Profile*

💳 *Credits:* ${user?.credits || 0}
🎯 *Plans Generated:* Available in full version
📅 *Member Since:* ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}

🎨 *Taste Keywords:* ${tasteProfile.keywords?.length > 0 ? this.escapeMarkdownV2(tasteProfile.keywords.join(', ')) : 'None yet \\- tell me what you love\\!'}

*Commands:*
/credits \\- Check credit balance
/taste \\- Manage taste profile  
/buy \\- Purchase more credits`;

    await this.sendMessage(chatId, profileText);
  }

  private async sendTasteProfileInfo(telegramId: string, chatId: number): Promise<void> {
    const tasteProfile = await this.userService.getTasteProfile(telegramId);

    const tasteText = `🎨 Your Taste Profile

Current Keywords: ${tasteProfile.keywords?.length > 0 ? tasteProfile.keywords.join(', ') : 'None yet'}

To add to your taste profile, just tell me what you love:
• "I love jazz and sushi"
• "I'm into cyberpunk aesthetics"
• "I enjoy cozy coffee shops"

I'll automatically learn your preferences! 🤖

Want to start fresh? Type: "Reset my taste profile"`;

    await this.sendMessage(chatId, tasteText);
  }

  private async sendHelpMessage(chatId: number): Promise<void> {
    const helpText = `🤖 *TasteBot Commands*

*Basic Commands:*
/start \\- Welcome message and quick options
/help \\- Show this help message
/credits \\- Check your credit balance
/profile \\- View your complete profile
/taste \\- Manage your taste preferences
/buy \\- Purchase more credits
/demo \\- See example requests

*How to Use:*
Just tell me what you love\\! Examples:
• "I love hip hop and steak in NYC"
• "Find cozy jazz cafes in Paris"
• "Cyberpunk night out vibes"
• "Chill day with good coffee"

*Features:*
🎵 Multi\\-modal input \\(text, voice, photos\\)
📍 Location\\-based recommendations  
🎨 Cultural taste understanding
💳 Credit\\-based system \\(5 free credits\\)

*Need more help?* Just ask me anything\\!`;

    await this.sendMessage(chatId, helpText);
  }

  private getContextualHelp(keywords: string[], originalMessage: string): string {
    if (keywords.length === 0) {
      return `I'd love to help you find something great! 

Try being more specific:
• "I love [music genre] and [food type] in [city]"
• "Find me [vibe] places for [activity]"
• "I want [mood] vibes tonight"

Examples:
• "Hip hop clubs with good food in NYC"
• "Cozy jazz cafes in Paris"
• "Cyberpunk aesthetic bars"

Type /help for all commands!`;
    }

    let helpText = `I see you're interested in ${keywords.join(', ')}! 

To get better recommendations, try:
`;

    if (!originalMessage.toLowerCase().includes('in ') && !originalMessage.toLowerCase().includes('near')) {
      helpText += `• Add a location: "${originalMessage} in [your city]"\n`;
    }

    if (keywords.some(k => ['hip hop', 'jazz', 'techno', 'indie'].includes(k))) {
      helpText += `• Combine with food: "${originalMessage} with great food"\n`;
      helpText += `• Add venue type: "${originalMessage} clubs" or "bars"\n`;
    }

    if (keywords.some(k => ['steak', 'sushi', 'pizza'].includes(k))) {
      helpText += `• Add atmosphere: "${originalMessage} with live music"\n`;
      helpText += `• Specify vibe: "upscale ${originalMessage}" or "casual ${originalMessage}"\n`;
    }

    helpText += `
Or try these commands:
/help - All commands
/demo - See examples
/profile - Your info`;

    return helpText;
  }

  private async sendWelcomeMessage(chatId: number): Promise<void> {
    const welcomeText = `👋 Welcome to TasteBot!
Your AI concierge for taste-based planning

🎁 You have 5 free credits to explore. Tell me what you love and I'll create personalized plans!

Try something like:
• "I love hip hop and steak in NYC"
• "Find me cozy jazz cafes in Paris"  
• "Cyberpunk vibes for tonight"

Or use these quick options:`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🎵 Music + Food Plan', callback_data: 'music_food' },
          { text: '🌃 Night Out Vibe', callback_data: 'night_out' },
        ],
        [
          { text: '☕ Chill Day Plan', callback_data: 'chill_day' },
          { text: '🎨 Cultural Experience', callback_data: 'cultural' },
        ],
        [
          { text: '📍 Use My Location', callback_data: 'location' },
          { text: '💳 Buy More Credits', callback_data: 'buy_credits' },
        ],
      ],
    };

    await this.sendMessage(chatId, welcomeText, keyboard);
  }

  private async sendMessage(chatId: number, text: string, replyMarkup?: any): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    
    // Ensure text is not too long (Telegram limit is 4096 characters)
    const truncatedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text;
    
    // Clean text and send without complex formatting
    const cleanText = this.cleanTextForTelegram(truncatedText);
    
    const payload = {
      chat_id: chatId,
      text: cleanText,
      ...(replyMarkup && { reply_markup: replyMarkup }),
    };

    try {
      console.log(`📤 Sending message to ${chatId}:`, cleanText.substring(0, 100) + '...');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Telegram API error:', errorData);
      } else {
        console.log('✅ Message sent successfully');
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  }

  private cleanTextForTelegram(text: string): string {
    return text
      .replace(/[^\x20-\x7E\u00A0-\u00FF\u2600-\u26FF\u2700-\u27BF\uFE0F]/g, '') // Keep ASCII + basic emojis
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\\/g, '') // Remove escape characters
      .trim();
  }
  }

  private convertToMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '*$1*') // Convert **bold** to *bold*
      .replace(/__(.*?)__/g, '_$1_'); // Convert __italic__ to _italic_
  }

  private stripFormatting(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/__(.*?)__/g, '$1') // Remove __italic__
      .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
      .replace(/_(.*?)_/g, '$1') // Remove _italic_
      .replace(/\\/g, ''); // Remove escape characters
  }

  private escapeMarkdownV2(text: string): string {
    // Escape ALL MarkdownV2 special characters
    return text.replace(/([_*\[\]()~`>#+=|{}.!-\\])/g, '\\$1');
  }

  formatPlanResponse(plan: any): string {
    if (!plan || !plan.activities) return 'No plan generated.';

    let response = `🎯 Here's your personalized plan:\n\n`;
    
    plan.activities.forEach((activity: any, index: number) => {
      response += `${index + 1}. ${activity.emoji || '📍'} ${activity.name}\n`;
      if (activity.description) {
        response += `   ${activity.description}\n`;
      }
      response += '\n';
    });

    return response;
  }

  createQuickStartKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🔮 Another plan', callback_data: 'another_plan' },
          { text: '📍 Nearby options', callback_data: 'nearby_options' },
        ],
        [
          { text: '🎵 Music + Food', callback_data: 'music_food_plan' },
          { text: '💳 Buy credits', callback_data: 'buy_credits' },
        ],
      ],
    };
  }
}