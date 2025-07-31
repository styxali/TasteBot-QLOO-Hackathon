import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  
  DATABASE_URL: Joi.string().required(),
  
  TELEGRAM_BOT_TOKEN: Joi.string().required(),
  TELEGRAM_WEBHOOK_URL: Joi.string().uri().optional(),
  
  QLOO_API_KEY: Joi.string().required(),
  QLOO_API_URL: Joi.string().uri().default('https://staging.api.qloo.com'),
  
  // LLM Services (at least one required)
  OPENAI_API_KEY: Joi.string().optional(),
  GROQ_API_KEY: Joi.string().optional(),
  GEMINI_API_KEY: Joi.string().optional(),
  DEEPSEEK_API_KEY: Joi.string().optional(),
  CEREBRAS_API_KEY: Joi.string().optional(),
  PERPLEXITY_API_KEY: Joi.string().optional(),
  OPENROUTER_API_KEY: Joi.string().optional(),
  
  // Search Services (optional)
  TAVILY_API_KEY: Joi.string().optional(),
  JINA_API_KEY: Joi.string().optional(),
  SERP_API_KEY: Joi.string().optional(),
  SERPER_API_KEY: Joi.string().optional(),
  APIFY_API_KEY: Joi.string().optional(),
  
  // Location Services (optional)
  GEOAPIFY_API_KEY: Joi.string().optional(),
  FOURSQUARE_API_KEY: Joi.string().optional(),
  
  // Web Scraping (optional)
  FIRECRAWL_API_KEY: Joi.string().optional(),
  
  // Stripe (required for payments)
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_PUBLISHABLE_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
});