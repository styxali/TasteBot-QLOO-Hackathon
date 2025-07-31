# TasteBot - AI Cultural Concierge

TasteBot is a conversational AI concierge built for Telegram that provides personalized experience plans based on users' unique cultural tastes.

## Features

- 🎨 **Personalized Taste Profiles**: Cultural preference analysis
- 🤖 **Multi-Modal Input**: Text, voice, images, and location
- 🌍 **Location-Based Recommendations**: Foursquare & Geoapify integration
- 🧠 **AI-Powered Planning**: Multiple LLM providers (Groq, OpenAI, Gemini)
- 💳 **Credit System**: Stripe payment integration
- 📱 **Telegram Native**: Full bot integration with webhooks

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- API keys for external services

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run database migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

### Environment Variables

Required API keys in `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tastebot"

# Telegram
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
TELEGRAM_WEBHOOK_URL="https://your-domain.com/api/telegram/webhook"

# Qloo (Cultural Intelligence)
QLOO_API_KEY="your_qloo_api_key"

# LLM Providers (at least one required)
GROQ_API_KEY="your_groq_api_key"
OPENAI_API_KEY="your_openai_api_key"
GEMINI_API_KEY="your_gemini_api_key"

# Location Services
FOURSQUARE_API_KEY="your_foursquare_api_key"
GEOAPIFY_API_KEY="your_geoapify_api_key"

# Stripe Payments
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Telegram Integration
- `POST /api/telegram/webhook` - Telegram bot webhook

### Stripe Payments
- `POST /api/stripe/webhook` - Stripe payment webhook
- `POST /api/stripe/create-checkout` - Create payment session

### Plan Generation
- `POST /api/plans/generate` - Generate personalized plan
- `GET /api/plans/quick/:telegramId/:type` - Quick plan generation

### User Management
- `GET /api/users/:telegramId` - Get user profile
- `GET /api/users/:telegramId/credits` - Check credit balance

## Architecture

### Core Modules

- **UserModule**: User management and credit system
- **TelegramModule**: Bot integration and message handling
- **PlanModule**: Plan generation orchestration
- **QlooModule**: Cultural intelligence API integration
- **LlmModule**: Multi-provider AI text generation
- **LocationModule**: Venue search and geocoding
- **StripeModule**: Payment processing
- **SessionModule**: Conversation context management

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id VARCHAR UNIQUE NOT NULL,
  phone_number VARCHAR,
  credits INTEGER DEFAULT 5,
  taste_profile JSONB,
  last_location VARCHAR,
  current_mood VARCHAR,
  last_preferences TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Development

### Available Scripts

```bash
# Development
npm run start:dev      # Start with hot reload
npm run start:debug    # Start in debug mode

# Production
npm run build          # Build for production
npm run start:prod     # Start production server

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format with Prettier

# Database
npx prisma migrate dev # Run migrations
npx prisma studio      # Open database GUI
```

### Testing the Bot

1. Start the development server:
   ```bash
   npm run start:dev
   ```

2. Set up ngrok for webhook testing:
   ```bash
   ngrok http 3000
   ```

3. Set your Telegram webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://your-ngrok-url.ngrok.io/api/telegram/webhook"}'
   ```

4. Message your bot on Telegram!

## Deployment

### Environment Setup

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Set up webhook URLs for Telegram and Stripe

### Production Considerations

- Use Redis for session storage in production
- Implement proper logging and monitoring
- Set up SSL certificates for webhook endpoints
- Configure rate limiting and security headers

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/new-feature`
3. Commit changes: `git commit -m "feat: add new feature"`
4. Push to branch: `git push origin feat/new-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@tastebot.ai or join our Telegram community.