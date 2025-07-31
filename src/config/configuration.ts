export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL,
  },
  
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  },
  
  qloo: {
    apiKey: process.env.QLOO_API_KEY,
    apiUrl: process.env.QLOO_API_URL || 'https://staging.api.qloo.com',
  },
  
  llm: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY,
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
    },
    cerebras: {
      apiKey: process.env.CEREBRAS_API_KEY,
    },
    perplexity: {
      apiKey: process.env.PERPLEXITY_API_KEY,
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
    },
  },
  
  search: {
    tavily: {
      apiKey: process.env.TAVILY_API_KEY,
    },
    jina: {
      apiKey: process.env.JINA_API_KEY,
    },
    serp: {
      apiKey: process.env.SERP_API_KEY,
    },
    serper: {
      apiKey: process.env.SERPER_API_KEY,
    },
    apify: {
      apiKey: process.env.APIFY_API_KEY,
    },
  },
  
  location: {
    geoapify: {
      apiKey: process.env.GEOAPIFY_API_KEY,
    },
    foursquare: {
      apiKey: process.env.FOURSQUARE_API_KEY,
    },
  },
  
  scraping: {
    firecrawl: {
      apiKey: process.env.FIRECRAWL_API_KEY,
    },
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
});