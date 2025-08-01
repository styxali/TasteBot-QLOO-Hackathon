import { NavigationNode } from './navigation-node.interface';

export const NAVIGATION_TREE: NavigationNode = {
  id: 'root',
  title: 'TasteBot Main Menu',
  description: 'Your AI concierge for taste-based planning',
  emoji: '🎨',
  children: [
    {
      id: 'explore_location',
      title: 'Explore by Location',
      description: 'Find cafés/food/events near you',
      emoji: '📍',
      parentId: 'root',
      isLeaf: false,
      children: [
        {
          id: 'nearby_venues',
          title: 'Nearby Venues',
          description: 'Discover venues matching your vibe',
          emoji: '🏪',
          parentId: 'explore_location',
          isLeaf: true,
          actionType: 'tool_execution',
          toolName: 'foursquare_venue',
          children: []
        },
        {
          id: 'local_events',
          title: 'Local Events',
          description: 'Find events happening around you',
          emoji: '🎪',
          parentId: 'explore_location',
          isLeaf: true,
          actionType: 'tool_execution',
          toolName: 'serper_events',
          children: []
        }
      ]
    },
    {
      id: 'discover_taste',
      title: 'Discover by Taste',
      description: 'Personalized recommendations based on your preferences',
      emoji: '🧠',
      parentId: 'root',
      isLeaf: false,
      children: [
        {
          id: 'day_night_plans',
          title: 'Day/Night Plans',
          description: 'Get curated plans for your day or evening',
          emoji: '🌅',
          parentId: 'discover_taste',
          isLeaf: true,
          actionType: 'input_prompt',
          promptText: 'Tell me about your vibe today (e.g., "Tarantino + jazz + sushi")',
          children: []
        },
        {
          id: 'taste_exploration',
          title: 'Taste Exploration',
          description: 'Discover new things based on what you love',
          emoji: '🔍',
          parentId: 'discover_taste',
          isLeaf: true,
          actionType: 'tool_execution',
          toolName: 'qloo_similar',
          children: []
        }
      ]
    },
    {
      id: 'nomad_remote',
      title: 'Nomad & Remote Life',
      description: 'Perfect for digital nomads and remote workers',
      emoji: '🧳',
      parentId: 'root',
      isLeaf: false,
      children: [
        {
          id: 'coworking_cafes',
          title: 'Coworking + Cafés',
          description: 'Find the perfect work-friendly spots',
          emoji: '☕',
          parentId: 'nomad_remote',
          isLeaf: true,
          actionType: 'input_prompt',
          promptText: 'What kind of work vibe are you looking for?',
          children: []
        },
        {
          id: 'group_meetups',
          title: 'Group Meetups',
          description: 'Plan meetups with multiple taste inputs',
          emoji: '👥',
          parentId: 'nomad_remote',
          isLeaf: true,
          actionType: 'input_prompt',
          promptText: 'Tell me about your group\'s collective tastes',
          children: []
        }
      ]
    },
    {
      id: 'lifestyle_shopping',
      title: 'Lifestyle & Shopping',
      description: 'Cultural commerce and brand matching',
      emoji: '🛍️',
      parentId: 'root',
      isLeaf: false,
      children: [
        {
          id: 'brand_matching',
          title: 'Brand Matching',
          description: 'Find brands that match your cultural vibe',
          emoji: '🏷️',
          parentId: 'lifestyle_shopping',
          isLeaf: true,
          actionType: 'tool_execution',
          toolName: 'qloo_recommendations',
          children: []
        },
        {
          id: 'visual_suggestions',
          title: 'Visual Suggestions',
          description: 'Upload a photo for matching recommendations',
          emoji: '📸',
          parentId: 'lifestyle_shopping',
          isLeaf: true,
          actionType: 'input_prompt',
          promptText: 'Send me a photo and I\'ll find matching experiences',
          children: []
        }
      ]
    },
    {
      id: 'creatives',
      title: 'For Creatives',
      description: 'Aesthetic inspiration and creative planning',
      emoji: '🎭',
      parentId: 'root',
      isLeaf: false,
      children: [
        {
          id: 'aesthetic_recommender',
          title: 'Aesthetic Recommender',
          description: 'Get cultural inspiration for your projects',
          emoji: '🎨',
          parentId: 'creatives',
          isLeaf: true,
          actionType: 'tool_execution',
          toolName: 'qloo_insights',
          children: []
        },
        {
          id: 'venue_matching',
          title: 'Event Venue Matching',
          description: 'Find venues that match your creative style',
          emoji: '🏛️',
          parentId: 'creatives',
          isLeaf: true,
          actionType: 'input_prompt',
          promptText: 'Describe the vibe for your event or project',
          children: []
        }
      ]
    },
    {
      id: 'music_audio',
      title: 'Music & Audio',
      description: 'Concert, festival, and music discovery',
      emoji: '🎵',
      parentId: 'root',
      isLeaf: false,
      children: [
        {
          id: 'concerts_festivals',
          title: 'Concerts & Festivals',
          description: 'Find live music events matching your taste',
          emoji: '🎤',
          parentId: 'music_audio',
          isLeaf: true,
          actionType: 'tool_execution',
          toolName: 'serper_events',
          children: []
        },
        {
          id: 'playlist_generation',
          title: 'Playlist Generation',
          description: 'Create playlists for activities and moods',
          emoji: '🎧',
          parentId: 'music_audio',
          isLeaf: true,
          actionType: 'input_prompt',
          promptText: 'What activity or mood should this playlist match?',
          children: []
        }
      ]
    },
    {
      id: 'food_dining',
      title: 'Food & Dining',
      description: 'Restaurant discovery by cultural vibe',
      emoji: '🍽️',
      parentId: 'root',
      isLeaf: false,
      children: [
        {
          id: 'restaurant_discovery',
          title: 'Restaurant Discovery',
          description: 'Find restaurants matching your cultural taste',
          emoji: '🍴',
          parentId: 'food_dining',
          isLeaf: true,
          actionType: 'tool_execution',
          toolName: 'foursquare_venue',
          children: []
        },
        {
          id: 'culinary_experiences',
          title: 'Culinary Experiences',
          description: 'Plan food-focused cultural experiences',
          emoji: '👨‍🍳',
          parentId: 'food_dining',
          isLeaf: true,
          actionType: 'input_prompt',
          promptText: 'What kind of culinary adventure are you craving?',
          children: []
        }
      ]
    }
  ],
  isLeaf: false
};