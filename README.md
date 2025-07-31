# TasteBot

TasteBot is a conversational AI concierge built for Telegram that provides personalized experience plans based on users' unique cultural tastes. The bot creates curated recommendations for activities like nights out, trips, and experiences by analyzing user preferences in movies, music, and aesthetics.

## Features

- **Personalized Taste Profiles**: Users complete an onboarding quiz to build their cultural preference profile
- **Natural Language Planning**: Users can request plans in conversational language
- **Credit-Based System**: Monetized through Stripe with users receiving 5 free credits on signup
- **Stateful Conversations**: Maintains user context and preferences across sessions
- **External API Integration**: Leverages Qloo for taste data and multiple LLM services

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **External APIs**: Telegram Bot API, Qloo API, OpenAI/Groq/Gemini, Stripe
- **Location Services**: Foursquare, Geoapify

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys for:
- Database connection (PostgreSQL)
- Telegram Bot Token
- Qloo API Key
- LLM Services (OpenAI, Groq, Gemini, etc.)
- Stripe Keys
- Location Services (optional)

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Running the Application

```bash
# Development with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

## Database Management

```bash
# Generate Prisma client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Reset database
npm run prisma:reset
```

## Development

```bash
# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```