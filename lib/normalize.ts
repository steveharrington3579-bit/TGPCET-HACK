import { Merchant } from '@/types';

// List of suffixes to remove during normalization
const SUFFIXES_TO_REMOVE = [
  'ltd', 'limited', 'inc', 'incorporated', 'corp', 'corporation',
  'llc', 'co', 'company', 'billing', 'payment', 'online', 'digital',
  'services', 'service', 'store', 'shop', 'market', 'india', 'us', 'uk',
  'usa', 'united states', 'gb', 'ca', 'au', 'de', 'fr', 'jp'
];

// Common patterns to replace with more recognizable names
const PATTERN_REPLACEMENTS: [RegExp, string][] = [
  [/nflx/i, 'netflix'],
  [/spotify/i, 'spotify'],
  [/amazon.*web.*services|aws/i, 'aws'],
  [/openai/i, 'openai'],
  [/gym|fitness|la\s*fitness|planet\s*fitness/i, 'gym'],
  [/youtube/i, 'youtube'],
  [/disney\s*\+|disneyplus|disney\+/i, 'disney'],
  [/hulu/i, 'hulu'],
  [/apple\s*tv/i, 'apple tv'],
  [/github/i, 'github'],
  [/notion/i, 'notion'],
  [/figma/i, 'figma'],
  [/adobe/i, 'adobe'],
  [/yoga/i, 'yoga'],
  [/headspace/i, 'headspace'],
  [/calm/i, 'calm'],
  [/fitbit/i, 'fitbit'],
  [/electricity|power|energy/i, 'electricity'],
  [/internet|broadband|wifi/i, 'internet'],
  [/mobile|cell|phone/i, 'mobile'],
  [/swiggy/i, 'swiggy'],
  [/zomato/i, 'zomato'],
  [/uber\s*eats/i, 'uber eats'],
  [/doordash/i, 'doordash'],
  [/grubhub/i, 'grubhub'],
  [/netflix/i, 'netflix'],
  [/prime\s*video|amazon\s*prime/i, 'amazon prime'],
  [/hbo\s*max|hbo/i, 'hbo'],
  [/paramount/i, 'paramount'],
  [/peacock/i, 'peacock'],
  [/crunchyroll/i, 'crunchyroll'],
  [/dropbox/i, 'dropbox'],
  [/google\s*drive/i, 'google drive'],
  [/onedrive/i, 'onedrive'],
  [/icloud/i, 'icloud'],
  [/microsoft\s*365|m365/i, 'microsoft 365'],
  [/office\s*365/i, 'office 365'],
  [/slack/i, 'slack'],
  [/zoom/i, 'zoom'],
  [/teams/i, 'teams'],
  [/discord/i, 'discord'],
  [/twitch/i, 'twitch'],
  [/patreon/i, 'patreon'],
  [/onlyfans/i, 'onlyfans'],
  [/cashapp|cash\s*app/i, 'cash app'],
  [/paypal/i, 'paypal'],
  [/venmo/i, 'venmo']
];

// Merchant map for canonical display names
export const MERCHANT_MAP: Record<string, string> = {
  'netflix': 'Netflix',
  'spotify': 'Spotify',
  'aws': 'Amazon Web Services',
  'openai': 'OpenAI',
  'gym': 'Gym Membership',
  'youtube': 'YouTube Premium',
  'disney': 'Disney+',
  'hulu': 'Hulu',
  'apple tv': 'Apple TV+',
  'github': 'GitHub',
  'notion': 'Notion',
  'figma': 'Figma',
  'adobe': 'Adobe Creative Cloud',
  'yoga': 'Yoga Studio',
  'headspace': 'Headspace',
  'calm': 'Calm',
  'fitbit': 'Fitbit Premium',
  'electricity': 'Electricity Bill',
  'internet': 'Internet Service',
  'mobile': 'Mobile Phone Bill',
  'swiggy': 'Swiggy',
  'zomato': 'Zomato',
  'uber eats': 'Uber Eats',
  'doordash': 'DoorDash',
  'grubhub': 'Grubhub',
  'amazon prime': 'Amazon Prime',
  'hbo': 'HBO Max',
  'paramount': 'Paramount+',
  'peacock': 'Peacock',
  'crunchyroll': 'Crunchyroll',
  'dropbox': 'Dropbox Plus',
  'google drive': 'Google Drive',
  'onedrive': 'OneDrive',
  'icloud': 'iCloud+',
  'microsoft 365': 'Microsoft 365',
  'office 365': 'Office 365',
  'slack': 'Slack',
  'zoom': 'Zoom',
  'teams': 'Microsoft Teams',
  'discord': 'Discord Nitro',
  'twitch': 'Twitch Turbo',
  'patreon': 'Patreon',
  'onlyfans': 'OnlyFans',
  'cash app': 'Cash App',
  'paypal': 'PayPal',
  'venmo': 'Venmo'
};

// Category mapping based on normalized merchant names
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'entertainment': [
    'netflix', 'spotify', 'youtube', 'disney', 'hulu', 'apple tv',
    'amazon prime', 'hbo', 'paramount', 'peacock', 'crunchyroll',
    'twitch', 'discord'
  ],
  'software': [
    'aws', 'github', 'notion', 'figma', 'openai', 'adobe', 'dropbox',
    'google drive', 'onedrive', 'icloud', 'microsoft 365', 'office 365',
    'slack', 'zoom', 'teams', 'patreon', 'onlyfans'
  ],
  'health': [
    'gym', 'yoga', 'headspace', 'calm', 'fitbit'
  ],
  'utilities': [
    'electricity', 'internet', 'mobile'
  ],
  'food': [
    'swiggy', 'zomato', 'uber eats', 'doordash', 'grubhub'
  ],
  'finance': [
    'cash app', 'paypal', 'venmo'
  ]
};

/**
 * Normalizes a raw merchant name to a standardized format
 * @param raw - The raw merchant name from transaction data
 * @returns Normalized merchant name in lowercase without special characters or suffixes
 */
export function normalizeMerchant(raw: string): string {
  if (!raw || typeof raw !== 'string') {
    return '';
  }

  let normalized = raw.toLowerCase().trim();

  // Apply pattern replacements first
  for (const [pattern, replacement] of PATTERN_REPLACEMENTS) {
    if (pattern.test(normalized)) {
      normalized = replacement;
      break; // Use the first match found
    }
  }

  // Remove special characters except spaces and letters/numbers
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');

  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // Remove numeric suffixes at the end
  normalized = normalized.replace(/\s+\d+$/, '');

  // Remove common suffixes
  const words = normalized.split(' ');
  const filteredWords = words.filter(word => !SUFFIXES_TO_REMOVE.includes(word));

  normalized = filteredWords.join(' ').trim();

  // Final cleanup of special characters and extra spaces
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  return normalized || raw.toLowerCase().trim();
}

/**
 * Categorizes a normalized merchant name based on keyword matching
 * @param normalizedName - The normalized merchant name
 * @returns Category name or 'Other' if no match found
 */
export function categorizeMerchant(normalizedName: string): string {
  if (!normalizedName) {
    return 'Other';
  }

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => normalizedName.includes(keyword))) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }

  return 'Other';
}

/**
 * Gets complete merchant information including normalized name, canonical name, and category
 * @param raw - The raw merchant name from transaction data
 * @returns Merchant object with all information
 */
export function getMerchantInfo(raw: string): Merchant {
  const normalizedName = normalizeMerchant(raw);
  const canonicalName = MERCHANT_MAP[normalizedName] ||
                       MERCHANT_MAP[Object.keys(MERCHANT_MAP).find(key =>
                         normalizedName.includes(key) || key.includes(normalizedName)
                       )!] ||
                       raw;

  const category = categorizeMerchant(normalizedName);

  return {
    originalName: raw,
    normalizedName,
    category
  };
}