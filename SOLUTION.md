

1. Project Overview
TasteBot is a conversational AI concierge on Telegram. It provides personalized experience plans (e.g., for a night out, a trip) based on a user's unique cultural tastes (movies, music, aesthetics). The bot is stateful, manages user profiles, and operates on a credit-based system monetized via Stripe.
2. Core User Experience Flow
Onboarding: A new user starts the bot and is offered a quick conversational quiz to build their initial Taste Profile. They are gifted 5 free credits.
Planning: The user requests a plan by describing their desired vibe, location, and time in natural language (e.g., "A cyberpunk night out in Tokyo").
Generation: The backend uses the user's Taste Profile and the specific request to call external APIs (Qloo for taste data, an LLM for synthesis) to generate a curated plan.
Interaction: The user receives the plan, which costs 1 credit. They can ask natural language follow-up questions.
Monetization: When credits run out, the user is prompted to buy more via a Stripe checkout link. A webhook confirms the purchase and refills the user's credits.
3. Technical Stack
Backend Framework: NestJS
Database ORM: Prisma
Database: PostgreSQL
External APIs:
Telegram: For bot interaction (receiving messages, sending replies).
Qloo: For cultural taste data and recommendations.
LLM (Groq/OpenAI): For natural language understanding, synthesis, and response generation.
Stripe: For processing payments.
FierceCrawl (Optional/Future): For importing taste profiles from URLs.
4. Prisma Database Schema (schema.prisma)
Generated prisma
// This is your Prisma schema file.
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              Int           @id @default(autoincrement())
  telegramId      BigInt        @unique // Use BigInt for Telegram IDs
  firstName       String?
  lastName        String?
  username        String?
  credits         Int           @default(5)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  tasteProfile    TasteProfile?
  plans           Plan[]
  lastLocationLat Float?
  lastLocationLon Float?
}

model TasteProfile {
  id        Int      @id @default(autocrement())
  userId    Int      @unique
  user      User     @relation(fields: [userId], references: [id])
  
  // A string array to hold keywords, entities, and vibes.
  // e.g., ["Blade Runner", "lofi hip hop", "cozy minimalism"]
  tasteKeywords String[]
  
  updatedAt DateTime @updatedAt
}

model Plan {
  id        Int      @id @default(autocrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  
  // The final, formatted text of the plan sent to the user.
  content   String
  
  createdAt DateTime @default(now())
}
Use code with caution.
Prisma
5. NestJS Backend Architecture
AppModule (Root): Imports all other modules.
ConfigModule: Manages environment variables (.env).
PrismaModule: A global module to provide the Prisma Client service to all other modules.
TelegramModule: The main entry point. Handles the webhook from Telegram.
UserModule: Manages user creation, profiles, and credit balances.
PlanModule: Orchestrates the core logic of generating a plan.
QlooModule: A dedicated service to encapsulate all API calls to Qloo.
LlmModule: A dedicated service to encapsulate all API calls to the LLM (Groq/OpenAI).
StripeModule: Handles Stripe checkout session creation and webhook processing.
TelegramController (/api/telegram/webhook)
POST /: Receives all updates from the Telegram webhook.
Validates the update using a TelegramUpdateDto.
Delegates the parsed message/command to the TelegramService.
StripeController (/api/stripe/webhook)
POST /: Receives webhook events from Stripe after a successful payment.
Validates the event signature.
Delegates the event to the StripeService.
TelegramService:
processUpdate(update: TelegramUpdateDto): The main router. Parses the message text to identify commands (/start, /plan) or natural language input.
Handles the logic for the onboarding quiz.
Calls UserService to manage user state.
Calls PlanService to generate plans.
Formats and sends all reply messages back to the user via the Telegram Bot API.
UserService:
findOrCreateUser(telegramId: BigInt, details: ...): Gets a user from the DB or creates a new one with 5 credits.
getUserCredits(telegramId: BigInt): Returns the user's credit balance.
deductCredits(telegramId: BigInt, amount: number): Decrements credits. Throws an error if insufficient funds.
addCredits(telegramId: BigInt, amount: number): Adds credits after a successful purchase.
updateTasteProfile(telegramId: BigInt, keywords: string[]): Updates the user's taste profile keywords in the DB.
PlanService:
generatePlanForUser(telegramId: BigInt, prompt: string): The core orchestration method.
Checks if the user has enough credits via UserService.
Retrieves the user's TasteProfile from the DB.
Calls LlmService to parse the user's prompt and extract key intents (location, time, vibe).
Calls QlooService with the user's profile tastes and prompt intents as seeds.
Receives recommendation data from Qloo.
Calls LlmService again to synthesize the Qloo data and the original request into a final, human-readable plan.
Deducts credits via UserService.
Returns the final formatted plan string.
QlooService & LlmService:
These services act as SDKs or wrappers. They handle the raw axios or fetch calls, authentication headers, and error handling for their respective external APIs. They keep the core business logic in PlanService clean.
StripeService:
createCheckoutSession(telegramId: BigInt): Creates a Stripe Checkout session, embedding the telegramId in the metadata. Returns the checkout URL.
handleWebhook(payload, signature): Verifies the webhook signature. On a checkout.session.completed event, it parses the telegramId from the metadata and calls UserService.addCredits().
TasteBot: Use Case & Interaction Tree

This tree outlines all user interactions, from initial contact to advanced features. Each branch represents a user journey or a specific command.
▶️ /start - Core Onboarding & Main Menu
Trigger: New user starts the bot for the first time or an existing user types /start.
Use Case: User Onboarding & Navigation.
Flow:
Check User Existence:
New User: Create a User entry in the database with default credits (e.g., 5). Initiate the Taste Profile Onboarding.
Existing User: Greet them and display the Main Menu.
Taste Profile Onboarding (New User Only):
Use Case: Personalized Cold Start.
Bot sends a welcome message and offers to build a Taste Profile.
➡️ [🚀 Let's Go] -> Triggers the Conversational Quiz flow.
➡️ [Skip for now] -> Skips quiz and goes to Main Menu.
Display Main Menu:
A persistent menu with primary actions.
➡️ [🗓️ Plan a Moment]
➡️ [🎯 Surprise Me]
➡️ [🎛️ My Vibe]
➡️ [💳 My Credits]
➡️ [⚙️ Settings]
▶️ [🗓️ Plan a Moment] - Thematic Plan Generation
Trigger: User clicks the "Plan a Moment" button.
Use Case: Guided, intent-driven planning for common social scenarios.
Flow:
Bot presents a menu of common themes.
User selects a theme:
➡️ [💘 A Romantic Date]
➡️ [🌆 A Night Out]
➡️ [🧘 Solo Self-Care Day]
➡️ [🤝 Group Meetup]
... (etc.)
After selection, the bot initiates the Core Plan Generation flow, using the chosen theme as a primary seed for the LLM.
▶️ [🎯 Surprise Me] - Instant Recommendation
Trigger: User clicks the "Surprise Me" button.
Use Case: Low-effort discovery and "wow" factor.
Flow:
Bot initiates the Core Plan Generation flow.
It uses the user's existing Taste Profile and current context (e.g., time of day, location if available) as seeds, without asking for additional input.
▶️ (Natural Language Text) - Conversational Planning
Trigger: User types any free-form text that is not a recognized command.
Use Case: The most flexible and powerful way to plan.
Flow:
The text is passed directly into the Core Plan Generation flow as the main prompt.
Example: "Find a quiet cafe near me that feels like a Wes Anderson film."
▶️ [🎛️ My Vibe] - Session-wide Context Setting
Trigger: User clicks the "My Vibe" button.
Use Case: Setting a temporary mood that influences all subsequent recommendations.
Flow:
Bot presents a menu of vibes (e.g., [🔥 Hype & Loud], [🌧️ Rainy & Cozy]).
User selects a vibe.
The bot saves this vibe to the user's session state (e.g., in a Redis cache or a temporary field in the DB).
The bot confirms the vibe is set and explains that it will now influence all plans.
▶️ [💳 My Credits] - Monetization & Account Status
Trigger: User clicks the "My Credits" button or types /credits.
Use Case: Account management and monetization funnel.
Flow:
Bot fetches the user's credit balance from the database.
Displays the message: "You have X credits left."
Presents action buttons:
➡️ [💵 Buy Credits] -> Triggers the Stripe Purchase flow.
➡️ [🤝 Refer a Friend] -> (Future Use Case) Generates a referral link.
▶️ [⚙️ Settings] - Profile & Data Management
Trigger: User clicks the "Settings" button.
Use Case: Giving the user control over their data and profile.
Flow:
Bot displays a settings menu.
➡️ [👤 Update My Taste Profile] -> Re-runs the Conversational Quiz or offers the URL Import flow.
➡️ [🔁 Reset Current Vibe] -> Clears the session-wide vibe set via [🎛️ My Vibe].
➡️ [🗑️ Start Over / Clear History] -> (Future Use Case) Wipes conversation history or taste data.
Sub-Flows (Called by Main Use Cases)
This is the central logic function of the entire backend.
Input: User ID, a main text prompt, and optional context (theme, vibe).
Steps:
Check user credits.
Fetch user's Taste Profile.
LLM (Parse): Parse the prompt and context to identify intents (activity, location, time, specific keywords).
Qloo API: Call Qloo with keywords from the Taste Profile and parsed intents as seeds to get recommendation data.
LLM (Synthesize): Feed the structured Qloo data and the original prompt to the LLM to generate a human-readable, engaging plan.
Deduct credits.
Return the final formatted text.
Input: User ID.
Steps:
Ask a series of 2-3 open-ended questions about tastes (movies, music, aesthetics).
Collect user's free-text answers.
LLM (Extract): Feed the answers to the LLM to extract key entities and keywords.
Save the extracted keywords to the user's TasteProfile in the database.
Input: User ID.
Steps:
Stripe API: Create a Checkout Session, embedding the user's telegramId in the metadata.
Send the checkout URL to the user in a button.
(Webhook) When payment is confirmed, the Stripe webhook handler receives the event, verifies it, extracts the telegramId, and updates the corresponding user's credit balance in the database.
Send a confirmation message to the user.