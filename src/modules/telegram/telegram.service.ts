import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { PlanService } from '../plan/plan.service';
import { SessionService } from '../session/session.service';
import { NavigationRouter } from '../navigation/navigation-router.service';
import { LangChainOrchestrator } from '../langchain/langchain-orchestrator.service';
import { MemorySystem } from '../memory/memory-system.service';
import { ResponseFormatterService } from './response-formatter.service';
import { ErrorLoggerService } from '../../common/logger/error-logger.service';

@Injectable()
export class TelegramService {
  private botToken: string;
  private userSessions = new Map<string, any>();
  private userSelectionContext = new Map<string, any>();

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly planService: PlanService,
    private readonly sessionService: SessionService,
    private readonly navigationRouter: NavigationRouter,
    private readonly langChainOrchestrator: LangChainOrchestrator,
    private readonly memorySystem: MemorySystem,
    private readonly responseFormatter: ResponseFormatterService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.botToken = this.configService.get<string>('telegram.botToken');
  }

  async processUpdate(update: any): Promise<void> {
    console.log('📥 Received update:', JSON.stringify(update, null, 2));
    
    try {
      if (update.message) {
        console.log('💬 Processing message update');
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
        console.log('🔘 Processing callback query update');
        await this.handleCallbackQuery(update.callback_query);
      } else {
        console.log('❓ Unknown update type:', Object.keys(update));
      }
    } catch (error) {
      this.errorLogger.logError('processUpdate', error, { update });
      const chatId = update.message?.chat.id || update.callback_query?.message.chat.id;
      if (chatId) {
        await this.sendMessage(chatId, '❌ Sorry, I encountered an error. Please try again or type /help for assistance.');
      }
    }
  }

  private async handleMessage(message: any): Promise<void> {
    const telegramId = message.from.id.toString();
    const chatId = message.chat.id;
    
    // Ensure user exists
    const user = await this.userService.findOrCreate(telegramId);
    console.log(`👤 User ${telegramId} - Credits: ${user.credits}`);

    // Handle commands
    if (message.text?.startsWith('/')) {
      await this.handleCommand(message.text, chatId, telegramId);
      return;
    }

    // Handle conversational messages (greetings, simple responses)
    if (this.isConversationalMessage(message.text)) {
      await this.handleConversationalMessage(message.text, chatId, telegramId);
      return;
    }

    // Handle interactive selections (1, 2, 3, etc.)
    const selectionContext = this.userSelectionContext.get(telegramId);
    if (selectionContext && this.isNumericSelection(message.text)) {
      await this.handleInteractiveSelection(message.text, chatId, telegramId, selectionContext);
      return;
    }

    // Store conversation message
    await this.memorySystem.storeConversationMessage({
      id: `${message.message_id}_${Date.now()}`,
      userId: telegramId,
      content: message.text || '[non-text message]',
      type: 'user',
      timestamp: new Date(),
      metadata: {
        messageType: 'text',
        chatId: chatId.toString(),
      },
    });

    // Extract and save taste preferences
    await this.extractAndSaveTasteProfile(telegramId, message.text);

    // Handle regular messages
    if (user.credits > 0) {
      await this.sendMessage(chatId, '🔄 Processing your request...');
      
      try {
        // Get user context
        const userContext = await this.memorySystem.getContextForUser(telegramId);
        
        // Create enhanced context for LangChain
        const enhancedContext = {
          userId: telegramId,
          telegramId,
          conversationHistory: userContext.recentMessages,
          tasteProfile: userContext.tasteProfile,
          sessionData: this.userSessions.get(telegramId) || {},
        };

        // Use LangChain orchestration
        const result = await this.langChainOrchestrator.orchestrateTools(message.text, enhancedContext);
        
        if (result.success) {
          try {
            // Format response based on result type
            const formatted = this.responseFormatter.formatToolResult(result);
            
            // Store context for interactive selections
            interface VenueResult {
              interactive?: boolean;
              venues?: any[];
              query?: string;
            }
            
            let resultData: VenueResult = {};
            
            if (typeof result.result === 'string' && result.result.trim().startsWith('{') && result.result.trim().endsWith('}')) {
              try {
                resultData = JSON.parse(result.result) as VenueResult;
              } catch (parseError) {
                console.warn('Failed to parse result as JSON:', parseError);
              }
            } else if (typeof result.result === 'object') {
              resultData = result.result as VenueResult || {};
            }

            if (resultData?.interactive && resultData?.venues) {
              this.userSelectionContext.set(telegramId, {
                type: 'venue_list',
                venues: resultData.venues,
                query: resultData.query
              });
            }
            
            await this.sendMessage(chatId, formatted.text, formatted.keyboard || this.createNavigationKeyboard());

            // Deduct credit
            await this.userService.deductCredit(telegramId);
            console.log(`💳 Credit deducted for ${telegramId}`);

            // Store bot response
            await this.memorySystem.storeConversationMessage({
              id: `bot_${Date.now()}`,
              userId: telegramId,
              content: result.result,
              type: 'bot',
              timestamp: new Date(),
              metadata: {
                toolsUsed: result.toolsUsed || [],
                executionTime: result.executionTime || 0,
              },
            });
          } catch (error) {
            console.error('Error processing successful result:', error);
            await this.sendMessage(chatId, '❌ I had trouble processing the results. Please try again.');
          }
        } else {
          const errorFormatted = this.responseFormatter.formatError(result.result);
          await this.sendMessage(chatId, errorFormatted.text, this.createNavigationKeyboard());
        }
      } catch (error) {
        this.errorLogger.logError('handleMessage', error, { telegramId, message: message.text });
        await this.sendMessage(chatId, '❌ I had trouble processing your request. Could you try rephrasing it?');
      }
    } else {
      await this.sendOutOfCreditsMessage(chatId);
    }
  }

  private async handleCommand(command: string, chatId: number, telegramId: string): Promise<void> {
    switch (command) {
      case '/start':
        await this.sendWelcomeMessage(chatId);
        break;
      case '/help':
        await this.sendHelpMessage(chatId);
        break;
      case '/explore':
        await this.sendExploreMenu(chatId);
        break;
      case '/nearby':
        await this.sendNearbyOptions(chatId);
        break;
      case '/credits':
        const balance = await this.userService.checkBalance(telegramId);
        await this.sendMessage(chatId, `💳 You have **${balance} credits** remaining.\n\nEach personalized plan costs 1 credit.`);
        break;
      case '/buy':
        await this.sendBuyCreditsMessage(chatId);
        break;
      case '/profile':
        await this.sendProfileInfo(telegramId, chatId);
        break;
      case '/taste':
        await this.sendTasteProfileInfo(telegramId, chatId);
        break;
      case '/demo':
        await this.sendDemoFlow(chatId);
        break;
      default:
        await this.sendMessage(chatId, '❓ Unknown command. Type /help for all available commands.');
    }
  }

  private async handleCallbackQuery(callbackQuery: any): Promise<void> {
    const telegramId = callbackQuery.from.id.toString();
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    console.log('🔘 Callback query received:', data);
    console.log('🔘 From user:', telegramId);
    console.log('🔘 Chat ID:', chatId);

    // Answer the callback query FIRST
    await this.answerCallbackQuery(callbackQuery.id);

    try {
      // Handle navigation callbacks
      if (data.startsWith('nav_')) {
        const nodeId = data.replace('nav_', '');
        console.log('🧭 Navigation to node:', nodeId);
        await this.handleNavigation(nodeId, chatId, telegramId);
        return;
      }

      // Handle execute callbacks (leaf node actions)
      if (data.startsWith('execute_')) {
        const nodeId = data.replace('execute_', '');
        console.log('⚡ Execute node:', nodeId);
        await this.handleNodeExecution(nodeId, chatId, telegramId);
        return;
      }

      // Handle prompt callbacks (input prompts)
      if (data.startsWith('prompt_')) {
        const nodeId = data.replace('prompt_', '');
        console.log('💬 Prompt node:', nodeId);
        await this.handleNodePrompt(nodeId, chatId, telegramId);
        return;
      }

      // Handle other callbacks
      console.log('🎯 Handling standard callback:', data);
      switch (data) {
        case 'test_button':
          // Test navigation system directly
          const testSession = this.navigationRouter.createInitialState();
          const testResult = this.navigationRouter.navigateToNode('explore_location', testSession);
          
          let testMessage = '🧪 **Test Button Works!**\n\n';
          testMessage += `Navigation test result:\n`;
          testMessage += `✅ Success: ${testResult.success}\n`;
          testMessage += `📝 Message: ${testResult.message?.substring(0, 100)}...\n`;
          testMessage += `🔘 Buttons: ${testResult.buttons?.length || 0}\n\n`;
          
          if (testResult.success && testResult.buttons?.length > 0) {
            testMessage += `First button: ${testResult.buttons[0].text} -> ${testResult.buttons[0].callbackData}\n\n`;
          }
          
          testMessage += 'Now let\'s test navigation...';
          
          await this.sendMessage(chatId, testMessage, this.createNavigationKeyboard());
          break;
        case 'get_plan':
          await this.sendMessage(chatId, '🎯 Tell me what you\'re looking for!\n\n**Examples:**\n• "Jazz bars in Lisbon"\n• "Cozy cafes for work"\n• "Cyberpunk night out vibes"\n• "Romantic dinner spots"\n\n💡 What would you like to explore?', this.createNavigationKeyboard());
          break;
        case 'buy_credits':
          await this.sendBuyCreditsMessage(chatId);
          break;
        case 'help':
          await this.sendHelpMessage(chatId);
          break;
        case 'demo':
          await this.sendDemoFlow(chatId);
          break;
        default:
          console.log('❓ Unknown callback data:', data);
          await this.sendMessage(chatId, `I received: "${data}"\n\nSorry, I didn\'t understand that option. Try typing what you\'re looking for!`, this.createNavigationKeyboard());
      }
    } catch (error) {
      console.error('❌ Error in handleCallbackQuery:', error);
      await this.sendMessage(chatId, '❌ Sorry, something went wrong with that button. Please try again.', this.createNavigationKeyboard());
    }
  }

  private async handleNodeExecution(nodeId: string, chatId: number, telegramId: string): Promise<void> {
    const node = this.navigationRouter.getNode(nodeId);
    
    if (!node || !node.toolName) {
      await this.sendMessage(chatId, '❌ Action not available', this.createNavigationKeyboard());
      return;
    }

    const user = await this.userService.findOrCreate(telegramId);
    
    if (user.credits <= 0) {
      await this.sendOutOfCreditsMessage(chatId);
      return;
    }

    await this.sendMessage(chatId, `🔧 Executing ${node.title}...`);

    try {
      // Get user context
      const userContext = await this.memorySystem.getContextForUser(telegramId);
      
      // Create enhanced context for LangChain
      const enhancedContext = {
        userId: telegramId,
        telegramId,
        conversationHistory: userContext.recentMessages,
        tasteProfile: userContext.tasteProfile,
        sessionData: this.userSessions.get(telegramId) || {},
      };

      // Execute the tool associated with this node
      const toolQuery = `Execute ${node.toolName} for ${node.title}`;
      const result = await this.langChainOrchestrator.orchestrateTools(toolQuery, enhancedContext);
      
      if (result.success) {
        const formattedResponse = this.formatResponseWithNavigation(result.result);
        await this.sendMessage(chatId, formattedResponse, this.createNavigationKeyboard());
        
        // Deduct credit
        await this.userService.deductCredit(telegramId);
        console.log(`💳 Credit deducted for ${telegramId}`);
      } else {
        await this.sendMessage(chatId, `❌ ${result.result}`, this.createNavigationKeyboard());
      }
    } catch (error) {
      console.error('❌ Node execution error:', error);
      await this.sendMessage(chatId, '❌ Sorry, I encountered an error executing that action.', this.createNavigationKeyboard());
    }
  }

  private async handleNodePrompt(nodeId: string, chatId: number, telegramId: string): Promise<void> {
    const node = this.navigationRouter.getNode(nodeId);
    
    if (!node || !node.promptText) {
      await this.sendMessage(chatId, '❌ Prompt not available', this.createNavigationKeyboard());
      return;
    }

    const promptMessage = `💬 **${node.title}**\n\n${node.promptText}\n\n**Just type your response and I'll help you!**`;
    
    await this.sendMessage(chatId, promptMessage, this.createNavigationKeyboard());
  }

  private async handleNavigation(nodeId: string, chatId: number, telegramId: string): Promise<void> {
    try {
      console.log(`🧭 Navigating to node: ${nodeId}`);
      
      // Get or create navigation session
      let session = this.userSessions.get(telegramId);
      if (!session) {
        session = this.navigationRouter.createInitialState();
        this.userSessions.set(telegramId, session);
        console.log('🆕 Created new navigation session');
      }

      console.log('📍 Current session state:', session);

      // Navigate to the node
      const navResult = this.navigationRouter.navigateToNode(nodeId, session);
      
      console.log('🎯 Navigation result:', {
        success: navResult.success,
        buttonsCount: navResult.buttons?.length || 0,
        messageLength: navResult.message?.length || 0
      });
      
      if (navResult.success) {
        // Convert navigation buttons to Telegram keyboard format
        const keyboard = this.convertNavigationButtonsToKeyboard(navResult.buttons);
        console.log('⌨️ Generated keyboard:', JSON.stringify(keyboard, null, 2));
        await this.sendMessage(chatId, navResult.message, keyboard);
      } else {
        console.log('❌ Navigation failed for node:', nodeId);
        await this.sendMessage(chatId, `❌ Navigation error for "${nodeId}". Please try again.`, this.createNavigationKeyboard());
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      await this.sendMessage(chatId, '❌ Sorry, I had trouble with navigation. Please try again.', this.createNavigationKeyboard());
    }
  }

  private convertNavigationButtonsToKeyboard(buttons: any[]): any {
    if (!buttons || buttons.length === 0) {
      return this.createNavigationKeyboard();
    }

    // Group buttons into rows (2 buttons per row for better mobile UX)
    const rows = [];
    for (let i = 0; i < buttons.length; i += 2) {
      const row = buttons.slice(i, i + 2).map(button => ({
        text: button.text,
        callback_data: button.callbackData
      }));
      rows.push(row);
    }

    return {
      inline_keyboard: rows
    };
  }

  private async handleVoiceMessage(message: any): Promise<void> {
    const telegramId = message.from.id.toString();
    const chatId = message.chat.id;
    
    try {
      await this.sendMessage(chatId, '🎙️ Voice message received! Processing...');
      
      // For MVP, simulate transcription
      const transcribedText = 'I want a chill plan for tonight with good music and food';
      
      await this.sendMessage(chatId, `🎤 I heard: "${transcribedText}"`);
      
      // Process as regular text message
      const simulatedMessage = {
        ...message,
        text: transcribedText
      };
      
      await this.handleMessage(simulatedMessage);
      
    } catch (error) {
      console.error('❌ Voice processing error:', error);
      await this.sendMessage(chatId, '🎙️ Sorry, I couldn\'t process your voice message. Please try typing instead.');
    }
  }

  private async handlePhotoMessage(message: any): Promise<void> {
    const telegramId = message.from.id.toString();
    const chatId = message.chat.id;
    
    try {
      await this.sendMessage(chatId, '📸 Photo received! Analyzing your aesthetic...');
      
      // For MVP, simulate image analysis
      const aestheticDescription = 'minimalist, modern, urban aesthetic with warm lighting';
      
      await this.sendMessage(chatId, `📸 I can see this has a **${aestheticDescription}** vibe.\n\nLet me find places that match this aesthetic...`);
      
      // Generate plan based on aesthetic
      const user = await this.userService.findOrCreate(telegramId);
      if (user.credits > 0) {
        const prompt = `Create a plan that matches this aesthetic: ${aestheticDescription}`;
        const simulatedMessage = {
          ...message,
          text: prompt
        };
        
        await this.handleMessage(simulatedMessage);
      } else {
        await this.sendOutOfCreditsMessage(chatId);
      }
      
    } catch (error) {
      console.error('❌ Photo processing error:', error);
      await this.sendMessage(chatId, '📸 Sorry, I couldn\'t analyze your photo. Please describe what you\'re looking for instead.');
    }
  }

  private async handleLocationMessage(message: any): Promise<void> {
    const telegramId = message.from.id.toString();
    const chatId = message.chat.id;
    
    try {
      const { latitude, longitude } = message.location;
      
      await this.sendMessage(chatId, '📍 Location received! Finding nearby recommendations...');
      
      // Generate location-based plan
      const user = await this.userService.findOrCreate(telegramId);
      if (user.credits > 0) {
        const prompt = `Find interesting places near my current location (${latitude}, ${longitude})`;
        const simulatedMessage = {
          ...message,
          text: prompt
        };
        
        await this.handleMessage(simulatedMessage);
      } else {
        await this.sendOutOfCreditsMessage(chatId);
      }
      
    } catch (error) {
      console.error('❌ Location processing error:', error);
      await this.sendMessage(chatId, '📍 Sorry, I couldn\'t process your location. Please try typing your location instead.');
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
      console.error('❌ Error saving taste profile:', error);
    }
  }

  private isConversationalMessage(text: string): boolean {
    const conversationalPatterns = [
      /^(hi|hello|hey|hola|bonjour|ciao)$/i,
      /^(how are you|what's up|wassup)$/i,
      /^(good morning|good afternoon|good evening)$/i,
      /^(thanks|thank you|thx)$/i,
      /^(bye|goodbye|see you|cya)$/i,
      /^(yes|no|ok|okay|sure)$/i,
      /^(what|who|when|where|why|how)\?*$/i,
    ];

    return conversationalPatterns.some(pattern => pattern.test(text.trim()));
  }

  private detectActionFromText(text: string): { action: string; params: any } | null {
    const lowerText = text.toLowerCase();
    
    // Venue search patterns
    if (lowerText.includes('find') || lowerText.includes('search') || lowerText.includes('look for')) {
      if (lowerText.includes('restaurant') || lowerText.includes('food') || lowerText.includes('eat')) {
        return { action: 'search_venues', params: { query: 'restaurants', type: 'food' } };
      }
      if (lowerText.includes('bar') || lowerText.includes('drink') || lowerText.includes('cocktail')) {
        return { action: 'search_venues', params: { query: 'bars', type: 'nightlife' } };
      }
      if (lowerText.includes('coffee') || lowerText.includes('cafe')) {
        return { action: 'search_venues', params: { query: 'coffee shops', type: 'cafe' } };
      }
      if (lowerText.includes('music') || lowerText.includes('concert') || lowerText.includes('live')) {
        return { action: 'search_events', params: { query: 'music events', type: 'music' } };
      }
    }

    // Location-based patterns
    if (lowerText.includes('near me') || lowerText.includes('nearby') || lowerText.includes('around here')) {
      return { action: 'search_nearby', params: { query: text } };
    }

    // Taste-based patterns
    if (lowerText.includes('like') && (lowerText.includes('jazz') || lowerText.includes('hip hop') || lowerText.includes('indie'))) {
      return { action: 'taste_recommendations', params: { preferences: this.extractKeywords(text) } };
    }

    return null;
  }

  private async handleConversationalMessage(text: string, chatId: number, telegramId: string): Promise<void> {
    const lowerText = text.toLowerCase().trim();
    
    if (['hi', 'hello', 'hey', 'hola', 'bonjour', 'ciao'].includes(lowerText)) {
      const user = await this.userService.findOrCreate(telegramId);
      const tasteProfile = await this.userService.getTasteProfile(telegramId);
      
      let greeting = `👋 Hey there! I'm TasteBot, your AI concierge for discovering amazing places based on your cultural taste.\n\n`;
      
      if (tasteProfile.keywords && tasteProfile.keywords.length > 0) {
        greeting += `I see you're into **${tasteProfile.keywords.slice(0, 3).join(', ')}**. Nice taste! 🎨\n\n`;
      }
      
      greeting += `💳 You have **${user.credits} credits** to explore.\n\n**What can I help you discover today?**\n\n**Try something like:**\n• "Find jazz bars in Paris"\n• "Cozy coffee shops for work"\n• "Hip hop venues with good food"\n\n**Or explore categories below:**`;
      
      await this.sendMessage(chatId, greeting, this.createNavigationKeyboard());
      
    } else if (['thanks', 'thank you', 'thx'].includes(lowerText)) {
      await this.sendMessage(chatId, `🙏 You're welcome! I'm here whenever you need taste-based recommendations.\n\n**What would you like to explore next?**`, this.createNavigationKeyboard());
      
    } else if (['bye', 'goodbye', 'see you', 'cya'].includes(lowerText)) {
      await this.sendMessage(chatId, `👋 See you later! Come back anytime you want to discover something amazing.\n\n**Quick tip:** Use /start to return to the main menu anytime!`);
      
    } else if (['what', 'who', 'when', 'where', 'why', 'how'].some(q => lowerText.startsWith(q))) {
      await this.sendMessage(chatId, `🤔 Great question! I'm here to help you discover places and experiences based on your cultural taste.\n\n**Here's what I can do:**\n• Find venues matching your vibe\n• Discover events and activities\n• Recommend based on your preferences\n• Provide location-based suggestions\n\n**Try asking me something like:**\n• "Where can I find good jazz in Berlin?"\n• "What are some cozy cafes for work?"\n• "How do I find hip hop venues?"\n\n**Or use the menu below:**`, this.createNavigationKeyboard());
      
    } else {
      await this.sendMessage(chatId, `😊 I understand! Let me help you find something great.\n\n**Tell me what you're looking for, like:**\n• "Jazz bars in your city"\n• "Cozy places to work"\n• "Good food and music"\n\n**Or browse categories:**`, this.createNavigationKeyboard());
    }
  }

  private isNumericSelection(text: string): boolean {
    const num = parseInt(text.trim());
    return !isNaN(num) && num >= 1 && num <= 20; // Support up to 20 selections
  }

  private async handleInteractiveSelection(text: string, chatId: number, telegramId: string, context: any): Promise<void> {
    const selectedIndex = parseInt(text.trim()) - 1; // Convert to 0-based index
    
    try {
      if (context.type === 'venue_list' && context.venues && context.venues[selectedIndex]) {
        const selectedVenue = context.venues[selectedIndex];
        const formatted = this.responseFormatter.formatVenueDetails(selectedVenue);
        
        // Store venue details for further interactions
        this.userSelectionContext.set(telegramId, {
          type: 'venue_details',
          venue: selectedVenue,
          originalList: context.venues
        });
        
        await this.sendMessage(chatId, formatted.text, formatted.keyboard);
      } else {
        await this.sendMessage(chatId, '❌ Invalid selection. Please choose a valid number from the list.', this.createNavigationKeyboard());
        // Clear invalid context
        this.userSelectionContext.delete(telegramId);
      }
    } catch (error) {
      console.error('❌ Error handling interactive selection:', error);
      await this.sendMessage(chatId, '❌ Error processing your selection. Please try again.', this.createNavigationKeyboard());
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

    return [...new Set(keywords)];
  }

  private formatResponseWithNavigation(response: string): string {
    return `${response}\n\n💡 **What's next?**\n• Ask for more details\n• Try a different location\n• Explore other categories\n• Type /help for all options`;
  }

  private createNavigationKeyboard(_currentNode?: any): any {
    return {
      inline_keyboard: [
        [
          { text: '🧪 Test Button', callback_data: 'test_button' },
          { text: '🎯 Get New Plan', callback_data: 'get_plan' },
        ],
        [
          { text: '📍 Explore Location', callback_data: 'nav_explore_location' },
          { text: '🧠 Discover by Taste', callback_data: 'nav_discover_taste' },
        ],
        [
          { text: '�  Music & Audio', callback_data: 'nav_music_audio' },
          { text: '🍽️ Food & Dining', callback_data: 'nav_food_dining' },
        ],
        [
          { text: '❓ Help', callback_data: 'help' },
          { text: '💳 Buy Credits', callback_data: 'buy_credits' },
        ],
      ],
    };
  }

  private async sendWelcomeMessage(chatId: number): Promise<void> {
    const welcomeText = `🎨 **Welcome to TasteBot!**
Your AI concierge for taste-based planning

🎁 You have **5 free credits** to explore. Tell me what you love and I'll create personalized plans!

**Try something like:**
• "I love hip hop and steak in NYC"
• "Find me cozy jazz cafes in Paris"  
• "Cyberpunk vibes for tonight"

**Or use the menu below:**

🧪 **Debug Info:**
• Bot token configured: ${this.botToken ? '✅' : '❌'}
• Navigation router: ${this.navigationRouter ? '✅' : '❌'}
• Test the 🧪 button to verify callbacks work`;

    await this.sendMessage(chatId, welcomeText, this.createNavigationKeyboard());
  }

  private async sendHelpMessage(chatId: number): Promise<void> {
    const helpText = `🤖 **TasteBot Help**

**Commands:**
/start - Welcome message and main menu
/help - Show this help message
/explore - Browse categories
/nearby - Find places near you
/credits - Check your credit balance
/profile - View your profile
/taste - Manage taste preferences
/buy - Purchase more credits
/demo - See example requests

**How to Use:**
Just tell me what you love! I understand:
• Music genres + food + locations
• Aesthetic vibes and moods
• Cultural preferences
• Activity types

**Examples:**
• "Jazz bars with good wine in Berlin"
• "Cozy minimalist cafes for work"
• "Cyberpunk night out vibes"
• "Indie bookstores and coffee"

**Features:**
🎵 Multi-modal input (text, voice, photos)
📍 Location-based recommendations  
🎨 Cultural taste understanding
💳 Credit-based system

**Need help?** Just ask me anything!`;

    await this.sendMessage(chatId, helpText, this.createNavigationKeyboard());
  }

  private async sendExploreMenu(chatId: number): Promise<void> {
    const exploreText = `🗺️ **Explore Categories**

Choose what interests you most:`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📍 Explore by Location', callback_data: 'nav_explore_location' },
          { text: '🧠 Discover by Taste', callback_data: 'nav_discover_taste' },
        ],
        [
          { text: '🧳 Nomad & Remote Life', callback_data: 'nav_nomad_remote' },
          { text: '🛍️ Lifestyle & Shopping', callback_data: 'nav_lifestyle_shopping' },
        ],
        [
          { text: '🎭 For Creatives', callback_data: 'nav_creatives' },
          { text: '🎵 Music & Audio', callback_data: 'nav_music_audio' },
        ],
        [
          { text: '🍽️ Food & Dining', callback_data: 'nav_food_dining' },
          { text: '❓ Help', callback_data: 'help' },
        ],
      ],
    };

    await this.sendMessage(chatId, exploreText, keyboard);
  }

  private async sendNearbyOptions(chatId: number): Promise<void> {
    const nearbyText = `📍 **Find Nearby Places**

Share your location or tell me your city, and I'll find great spots nearby!

**You can also try:**
• "Nearby restaurants"
• "Coffee shops near me"
• "Bars in [your city]"
• "Live music venues nearby"`;

    await this.sendMessage(chatId, nearbyText, this.createNavigationKeyboard());
  }

  private async sendBuyCreditsMessage(chatId: number): Promise<void> {
    const buyText = `💳 **Buy More Credits**

**Current pricing:**
• 50 credits - $5.00
• 100 credits - $9.00 _(Save $1!)_
• 200 credits - $17.00 _(Save $3!)_

Each credit = 1 personalized plan 🎯

**Click below to purchase:**`;

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
        [
          { text: '🏠 Back to Menu', callback_data: 'nav_root' },
        ],
      ],
    };

    await this.sendMessage(chatId, buyText, keyboard);
  }

  private async sendProfileInfo(telegramId: string, chatId: number): Promise<void> {
    const user = await this.userService.findByTelegramId(telegramId);
    const tasteProfile = await this.userService.getTasteProfile(telegramId);

    const profileText = `👤 **Your Profile**

💳 **Credits:** ${user?.credits || 0}
🎯 **Plans Generated:** Available in full version
📅 **Member Since:** ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}

🎨 **Taste Keywords:** ${tasteProfile.keywords?.length > 0 ? tasteProfile.keywords.join(', ') : 'None yet - tell me what you love!'}

**Commands:**
/credits - Check credit balance
/taste - Manage taste profile  
/buy - Purchase more credits`;

    await this.sendMessage(chatId, profileText, this.createNavigationKeyboard());
  }

  private async sendTasteProfileInfo(telegramId: string, chatId: number): Promise<void> {
    const tasteProfile = await this.userService.getTasteProfile(telegramId);

    const tasteText = `🎨 **Your Taste Profile**

**Current Keywords:** ${tasteProfile.keywords?.length > 0 ? tasteProfile.keywords.join(', ') : 'None yet'}

**To add to your taste profile, just tell me what you love:**
• "I love jazz and sushi"
• "I'm into cyberpunk aesthetics"
• "I enjoy cozy coffee shops"

I'll automatically learn your preferences! 🤖

**Want to start fresh?** Type: "Reset my taste profile"`;

    await this.sendMessage(chatId, tasteText, this.createNavigationKeyboard());
  }

  private async sendDemoFlow(chatId: number): Promise<void> {
    const demoText = `🎬 **DEMO MODE**

Here are some examples to try:

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

    await this.sendMessage(chatId, demoText, this.createNavigationKeyboard());
  }

  private async sendOutOfCreditsMessage(chatId: number): Promise<void> {
    const outOfCreditsText = `💳 **You're out of credits!**

You need credits to generate personalized plans. Each plan costs 1 credit.

**Free commands you can still use:**
• /profile - View your profile
• /taste - Manage taste preferences  
• /demo - See examples
• /credits - Check balance

**Ready to get more credits?** 🚀`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '💳 Buy Credits', callback_data: 'buy_credits' }],
        [{ text: '🎬 See Demo', callback_data: 'demo' }],
      ]
    };

    await this.sendMessage(chatId, outOfCreditsText, keyboard);
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
      console.error('❌ Failed to answer callback query:', error);
    }
  }

  private async sendMessage(chatId: number, text: string, replyMarkup?: any): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    
    // Ensure text is not too long (Telegram limit is 4096 characters)
    const truncatedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text;
    
    const payload = {
      chat_id: chatId,
      text: truncatedText,
      parse_mode: 'Markdown',
      ...(replyMarkup && { reply_markup: replyMarkup }),
    };

    try {
      console.log(`📤 Sending message to ${chatId}:`, truncatedText.substring(0, 100) + '...');
      
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
        
        // Fallback without markdown if parsing fails
        if (errorData.description?.includes('parse')) {
          const fallbackPayload = {
            ...payload,
            parse_mode: undefined,
          };
          
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallbackPayload),
          });
        }
      } else {
        console.log('✅ Message sent successfully');
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  }
}