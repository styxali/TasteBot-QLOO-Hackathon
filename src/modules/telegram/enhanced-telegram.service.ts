import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NavigationRouter } from '../navigation/navigation-router.service';
import { NavigationState } from '../navigation/navigation-node.interface';
import { LangChainOrchestrator } from '../langchain/langchain-orchestrator.service';
import { MemorySystem } from '../memory/memory-system.service';
import { ImageAnalysisService } from '../multimodal/image-analysis.service';
import { VoiceProcessingService } from '../multimodal/voice-processing.service';
import { LocationContextService } from '../multimodal/location-context.service';
import { CulturalIntelligenceService } from '../cultural/cultural-intelligence.service';
import { FallbackSystemService } from '../error-handling/fallback-system.service';

interface TelegramMessage {
    message_id: number;
    from: {
        id: number;
        first_name: string;
        username?: string;
    };
    chat: {
        id: number;
        type: string;
    };
    text?: string;
    voice?: {
        file_id: string;
        duration: number;
    };
    photo?: Array<{
        file_id: string;
        width: number;
        height: number;
    }>;
    location?: {
        latitude: number;
        longitude: number;
    };
}

interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
    callback_query?: {
        id: string;
        from: {
            id: number;
            first_name: string;
        };
        message: TelegramMessage;
        data: string;
    };
}

@Injectable()
export class EnhancedTelegramService {
    private botToken: string;
    private userSessions = new Map<number, NavigationState>();

    constructor(
        private readonly configService: ConfigService,
        private readonly navigationRouter: NavigationRouter,
        private readonly langChainOrchestrator: LangChainOrchestrator,
        private readonly memorySystem: MemorySystem,
        private readonly imageAnalysisService: ImageAnalysisService,
        private readonly voiceProcessingService: VoiceProcessingService,
        private readonly locationContextService: LocationContextService,
        private readonly culturalIntelligenceService: CulturalIntelligenceService,
        private readonly fallbackSystemService: FallbackSystemService,
    ) {
        this.botToken = this.configService.get<string>('telegram.botToken');
    }

    async handleUpdate(update: TelegramUpdate): Promise<void> {
        try {
            if (update.message) {
                await this.handleMessage(update.message);
            } else if (update.callback_query) {
                await this.handleCallbackQuery(update.callback_query);
            }
        } catch (error) {
            console.error('Error handling Telegram update:', error);

            const chatId = update.message?.chat.id || update.callback_query?.message.chat.id;
            if (chatId) {
                await this.sendMessage(chatId, '❌ Sorry, I encountered an error. Please try again.');
            }
        }
    }

    private async handleMessage(message: TelegramMessage): Promise<void> {
        const userId = message.from.id.toString();
        const chatId = message.chat.id;

        // Get or create user session
        let session = this.userSessions.get(message.from.id);
        if (!session) {
            session = this.navigationRouter.createInitialState();
            this.userSessions.set(message.from.id, session);
        }

        // Store conversation message
        await this.memorySystem.storeConversationMessage({
            id: `${message.message_id}_${Date.now()}`,
            userId,
            content: message.text || '[non-text message]',
            type: 'user',
            timestamp: new Date(),
            metadata: {
                messageType: this.getMessageType(message),
                chatId: chatId.toString(),
            },
        });

        // Handle different message types
        if (message.text) {
            await this.handleTextMessage(message, session);
        } else if (message.voice) {
            await this.handleVoiceMessage(message, session);
        } else if (message.photo) {
            await this.handlePhotoMessage(message, session);
        } else if (message.location) {
            await this.handleLocationMessage(message, session);
        }
    }

    private async handleTextMessage(message: TelegramMessage, session: NavigationState): Promise<void> {
        const userId = message.from.id.toString();
        const chatId = message.chat.id;
        const text = message.text!;

        // Check if it's a navigation command or natural language
        if (text.startsWith('/')) {
            await this.handleCommand(text, chatId, session);
            return;
        }

        // Try to infer navigation intent
        const inferredNodeId = this.navigationRouter.inferNodeFromNaturalLanguage(text);

        if (inferredNodeId) {
            // Navigate to inferred node
            const navResult = this.navigationRouter.navigateToNode(inferredNodeId, session);
            await this.sendNavigationResponse(chatId, navResult);
        } else {
            // Use LangChain orchestration for complex queries
            await this.handleComplexQuery(text, userId, chatId, session);
        }
    }

    private async handleComplexQuery(
        query: string,
        userId: string,
        chatId: number,
        session: NavigationState
    ): Promise<void> {
        try {
            // Get user context
            const userContext = await this.memorySystem.getContextForUser(userId);

            // Create enhanced context for LangChain
            const enhancedContext = {
                userId,
                telegramId: userId,
                currentNode: session.currentNodeId,
                conversationHistory: userContext.recentMessages,
                tasteProfile: userContext.tasteProfile,
                sessionData: session.sessionData,
            };

            // Execute with fallback
            const orchestrationResult = await this.fallbackSystemService.executeWithFallback(
                'langchain_orchestration',
                () => this.langChainOrchestrator.orchestrateTools(query, enhancedContext),
                [
                    () => this.getSimpleResponse(query, userContext.tasteProfile),
                ]
            );

            if (orchestrationResult.success) {
                // Generate cultural explanation
                const culturalExplanation = await this.culturalIntelligenceService
                    .generateCulturalRecommendationExplanation(userId, orchestrationResult.result, query);

                const response = `${orchestrationResult.result}\n\n💡 ${culturalExplanation}`;

                await this.sendMessage(chatId, response);

                // Learn from interaction
                await this.culturalIntelligenceService.trackCulturalEvolution(userId, {
                    preferences: this.extractPreferences(query),
                    context: query,
                    feedback: 'neutral', // Would be updated based on user reaction
                });
            } else {
                await this.sendMessage(chatId, orchestrationResult.result);
            }

            // Store bot response
            await this.memorySystem.storeConversationMessage({
                id: `bot_${Date.now()}`,
                userId,
                content: orchestrationResult.result,
                type: 'bot',
                timestamp: new Date(),
                metadata: {
                    toolsUsed: orchestrationResult.toolsUsed,
                    executionTime: orchestrationResult.executionTime,
                },
            });

        } catch (error) {
            console.error('Complex query handling error:', error);
            await this.sendMessage(chatId, 'I had trouble processing your request. Could you try rephrasing it?');
        }
    }

    private async handleVoiceMessage(message: TelegramMessage, session: NavigationState): Promise<void> {
        const userId = message.from.id.toString();
        const chatId = message.chat.id;

        try {
            // Download voice file (simplified - would need actual Telegram file download)
            const audioBuffer = Buffer.from(''); // Placeholder
            const voiceAnalysis = await this.voiceProcessingService.processVoiceMessage(
                audioBuffer,
                'audio/ogg'
            );

            // Enhance text with voice context
            const enhancedText = await this.voiceProcessingService.enhanceTextWithVoiceContext(
                voiceAnalysis.transcription,
                voiceAnalysis
            );

            // Process as enhanced text message
            await this.handleComplexQuery(enhancedText, userId, chatId, session);

            // Send transcription confirmation
            await this.sendMessage(chatId, `🎤 I heard: "${voiceAnalysis.transcription}"`);

        } catch (error) {
            console.error('Voice processing error:', error);
            await this.sendMessage(chatId, '🎤 Sorry, I had trouble processing your voice message. Could you try typing instead?');
        }
    }

    private async handlePhotoMessage(message: TelegramMessage, session: NavigationState): Promise<void> {
        const userId = message.from.id.toString();
        const chatId = message.chat.id;

        try {
            // Get largest photo
            const photo = message.photo![message.photo!.length - 1];

            // Download photo (simplified - would need actual Telegram file download)
            const photoUrl = `https://api.telegram.org/file/bot${this.botToken}/${photo.file_id}`;

            const imageAnalysis = await this.imageAnalysisService.analyzeImageForTaste(photoUrl);
            const userPhotoAnalysis = await this.imageAnalysisService.analyzeUserPhoto(photoUrl);

            const response = `📸 I can see this has a ${imageAnalysis.styleClassification} style with ${imageAnalysis.moodIndicators.join(', ')} vibes.\n\n` +
                `Based on your photo, I'd recommend: ${userPhotoAnalysis.recommendedVenues.join(', ')}`;

            await this.sendMessage(chatId, response);

            // Update user taste profile with visual preferences
            await this.memorySystem.updateTasteProfile(userId, {
                corePreferences: {
                    aesthetics: [
                        {
                            id: `visual_${Date.now()}`,
                            name: imageAnalysis.styleClassification,
                            type: 'aesthetic',
                            tags: imageAnalysis.aestheticElements,
                        },
                    ],
                },
            });

        } catch (error) {
            console.error('Photo processing error:', error);
            await this.sendMessage(chatId, '📸 I had trouble analyzing your photo. Could you describe what you\'re looking for instead?');
        }
    }

    private async handleLocationMessage(message: TelegramMessage, session: NavigationState): Promise<void> {
        const userId = message.from.id.toString();
        const chatId = message.chat.id;
        const location = message.location!;

        try {
            const locationContext = await this.locationContextService.enrichLocationContext(
                location.latitude,
                location.longitude
            );

            // Get user preferences for location-based recommendations
            const userContext = await this.memorySystem.getContextForUser(userId);
            const preferences = userContext.tasteProfile?.corePreferences
                ? Object.values(userContext.tasteProfile.corePreferences).flat().map(p => p.name)
                : [];

            const recommendations = await this.locationContextService.getLocationRecommendations(
                locationContext,
                preferences
            );

            const response = `📍 You're in ${locationContext.address.formatted}\n\n` +
                `This is a ${locationContext.culturalArea.type} with ${locationContext.culturalArea.characteristics.join(', ')} characteristics.\n\n` +
                `Here are some recommendations:\n${recommendations.venues.map(v => `• ${v.name}`).join('\n')}\n\n` +
                `Cultural fit: ${Math.round(recommendations.culturalFit * 100)}%`;

            await this.sendMessage(chatId, response);

            // Store location context in session
            session.sessionData.location = locationContext;

        } catch (error) {
            console.error('Location processing error:', error);
            await this.sendMessage(chatId, '📍 I had trouble processing your location. Could you tell me where you are instead?');
        }
    }

    private async handleCallbackQuery(callbackQuery: any): Promise<void> {
        const userId = callbackQuery.from.id.toString();
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;

        let session = this.userSessions.get(callbackQuery.from.id);
        if (!session) {
            session = this.navigationRouter.createInitialState();
            this.userSessions.set(callbackQuery.from.id, session);
        }

        // Handle navigation callbacks
        if (data.startsWith('nav_')) {
            const nodeId = data.replace('nav_', '');
            const navResult = this.navigationRouter.navigateToNode(nodeId, session);
            await this.sendNavigationResponse(chatId, navResult);
        } else if (data.startsWith('execute_')) {
            const nodeId = data.replace('execute_', '');
            await this.executeNodeAction(nodeId, userId, chatId, session);
        }

        // Answer callback query
        await this.answerCallbackQuery(callbackQuery.id);
    }

    private async executeNodeAction(
        nodeId: string,
        userId: string,
        chatId: number,
        session: NavigationState
    ): Promise<void> {
        const node = this.navigationRouter.getNode(nodeId);

        if (!node || !node.toolName) {
            await this.sendMessage(chatId, '❌ Action not available');
            return;
        }

        await this.sendMessage(chatId, '🔄 Processing your request...');

        // Execute the tool associated with this node
        const userContext = await this.memorySystem.getContextForUser(userId);
        const enhancedContext = {
            userId,
            telegramId: userId,
            currentNode: nodeId,
            conversationHistory: userContext.recentMessages,
            tasteProfile: userContext.tasteProfile,
            sessionData: session.sessionData,
        };

        try {
            const result = await this.langChainOrchestrator.orchestrateTools(
                `Execute ${node.toolName} for ${node.title}`,
                enhancedContext
            );

            if (result.success) {
                await this.sendMessage(chatId, result.result);
            } else {
                await this.sendMessage(chatId, '❌ ' + result.result);
            }
        } catch (error) {
            console.error('Node action execution error:', error);
            await this.sendMessage(chatId, '❌ Sorry, I encountered an error executing that action.');
        }
    }

    private async sendNavigationResponse(chatId: number, navResult: any): Promise<void> {
        const keyboard = {
            inline_keyboard: navResult.buttons.map((button: any) => [{
                text: button.text,
                callback_data: button.callbackData,
            }]),
        };

        await this.sendMessage(chatId, navResult.message, keyboard);
    }

    private async sendMessage(chatId: number, text: string, replyMarkup?: any): Promise<void> {
        const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

        const payload: any = {
            chat_id: chatId,
            text: text.substring(0, 4096), // Telegram message limit
            parse_mode: 'Markdown',
        };

        if (replyMarkup) {
            payload.reply_markup = replyMarkup;
        }

        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error('Failed to send Telegram message:', error);
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

    private getMessageType(message: TelegramMessage): string {
        if (message.text) return 'text';
        if (message.voice) return 'voice';
        if (message.photo) return 'photo';
        if (message.location) return 'location';
        return 'other';
    }

    private async handleCommand(command: string, chatId: number, session: NavigationState): Promise<void> {
        switch (command) {
            case '/start':
                const welcomeResult = this.navigationRouter.navigateToNode('root', session);
                await this.sendNavigationResponse(chatId, welcomeResult);
                break;
            case '/help':
                await this.sendMessage(chatId, '🤖 I\'m TasteBot! I help you discover amazing places based on your cultural taste. Send me a message about what you\'re looking for, or use the menu below.');
                break;
            case '/home':
                const homeResult = this.navigationRouter.goHome(session);
                await this.sendNavigationResponse(chatId, homeResult);
                break;
            default:
                await this.sendMessage(chatId, '❓ Unknown command. Type /help for assistance.');
        }
    }

    private async getSimpleResponse(query: string, tasteProfile: any): Promise<any> {
        return {
            success: true,
            result: `I understand you're looking for "${query}". Let me help you find something that matches your taste!`,
            toolsUsed: ['fallback'],
            executionTime: 100,
        };
    }

    private extractPreferences(query: string): string[] {
        const preferences: string[] = [];
        const queryLower = query.toLowerCase();

        const keywords = ['jazz', 'rock', 'indie', 'coffee', 'wine', 'art', 'food', 'music', 'bar', 'restaurant'];
        keywords.forEach(keyword => {
            if (queryLower.includes(keyword)) {
                preferences.push(keyword);
            }
        });

        return preferences;
    }
}