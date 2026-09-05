/**
 * Topic Relevance Classifier for ClickCraft Freelance Web Design & Digital Marketing
 * 
 * Strict Fallback & API Usage Rules:
 * STEP 1: Firebase Check (handled in firebaseTrainingService.ts)
 * STEP 2: Topic Relevance Check:
 *   A) Related to digital marketing / website / ads / business growth:
 *      -> Call DeepSeek API (with fallback to Gemini if key absent)
 *      -> Provide user-friendly Hindi / Hinglish response tying to ClickCraft services
 *   B) Unrelated to services (weather, cricket, recipes, movies, general knowledge, etc.):
 *      -> DO NOT call DeepSeek API or any LLM (saves tokens & cost)
 *      -> Politely deflect back to digital marketing expertise
 */

export interface TopicClassification {
  isRelated: boolean;
  deflectionText: string;
  langStyle: 'hindi' | 'hinglish' | 'english';
  detectedCategory?: string;
}

/**
 * Detect language style of the user query
 */
export function detectLanguageStyle(text: string): 'hindi' | 'hinglish' | 'english' {
  if (!text) return 'hinglish';
  // Devanagari range: \u0900-\u097F
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) return 'hindi';

  const lower = text.toLowerCase();
  const commonHinglishTokens = [
    'kya', 'hai', 'hain', 'kaise', 'karo', 'karein', 'karen', 'batao', 'batayein', 'chahiye',
    'mujhe', 'mera', 'meri', 'mere', 'aapka', 'aapki', 'aapke', 'hum', 'hoga', 'hogi', 'kitna',
    'kitne', 'lagta', 'chalana', 'karni', 'banao', 'badhao', 'badhaye', 'bikri', 'dukan', 'grahak'
  ];

  const words = lower.split(/\s+/);
  const isHinglish = words.some((w) => commonHinglishTokens.includes(w));
  return isHinglish ? 'hinglish' : 'english';
}

// Patterns of clearly UNRELATED domains (never call DeepSeek API)
const UNRELATED_PATTERNS = [
  // 1. Weather / मौसम
  {
    category: 'weather',
    regex: /\b(mausam|weather|rain|baarish|barish|monsoon|humidity|temperature|climate|forecast|dhoop|thand|sardi|garmi)\b/i,
  },
  // 2. Cricket / Sports / Scores
  {
    category: 'sports',
    regex: /\b(cricket|match|score|ipl|world cup|football|messi|ronaldo|virat|rohit|dhoni|wicket|run rate|toss|tennis|badminton|hockey|kabaddi|fifa|stadium)\b/i,
  },
  // 3. Cooking / Recipes / Food preparation
  {
    category: 'food_recipe',
    regex: /\b(recipe|khana banana|dish kaise banaye|cooking|paneer|biryani|chai kaise|pizza kaise|burger|cake|roti kaise|sabji|ingredients|breakfast|lunch|dinner|tasty food)\b/i,
  },
  // 4. Movies / Cinema / Songs / Entertainment
  {
    category: 'entertainment',
    regex: /\b(movie|film|cinema|song|gana|gana sunao|actor|actress|hero|heroine|netflix|hotstar|series|bollywood|hollywood|trailer|episode|movie recommend|filme)\b/i,
  },
  // 5. General Knowledge / History / Geography / Science Trivia
  {
    category: 'general_knowledge',
    regex: /\b(prime minister|president|rashtrapati|pradhan mantri|capital of|rajdhani|history|itihas|geography|bhugol|physics|chemistry|biology|homework|algebra|geometry|planet|graha|constitution|sanvidhan)\b/i,
  },
  // 6. Personal Unrelated Advice / Medical / Astrology
  {
    category: 'personal_unrelated',
    regex: /\b(breakup|relationship advice|girlfriend|boyfriend|pyaar|love problem|shadi|marriage|dawa|medicine|doctor|bimari|symptoms|fever|bukhar|rashifal|horoscope|jyotish|kundali)\b/i,
  },
  // 7. Video Games / Cheats
  {
    category: 'gaming',
    regex: /\b(pubg|free fire|bgmi|gta|cheat code|minecraft|gameplay|playstation|xbox)\b/i,
  },
  // 8. Politics & Elections
  {
    category: 'politics',
    regex: /\b(election|chunav|vote kisko de|political party|bjp|congress|aap party|neta|rajneeti)\b/i,
  }
];

// Patterns of business / digital marketing / website / advertising topics
const RELATED_PATTERNS = [
  /\b(website|web|webpage|page|portal|landing page|domain|hosting|ssl|speed|slow|fast|responsive|mobile friendly)\b/i,
  /\b(seo|search engine|google search|ranking|rank|keywords|backlinks|search console|analytics)\b/i,
  /\b(ad|ads|advertisement|advertising|meta ads|facebook ads|fb ads|instagram ads|insta ads|google ads|ppc|cpc|roas|campaign|creative|poster|banner)\b/i,
  /\b(digital marketing|marketing|online marketing|social media|smm|smo|content|reel|reels|whatsapp marketing|bulk message)\b/i,
  /\b(business|startup|dukan|bikri|sales|revenue|profit|leads|lead|customers|grahak|client|clients|grow|scale|online business|ecommerce|store|shop)\b/i,
  /\b(clickcraft|portfolio|sample|pricing|price|cost|charge|charges|fee|500|5000|10000|package|combo|refund|revision|guarantee|review)\b/i,
  /\b(hire|freelancer|agency|service|services|developer|designer|contact|whatsapp|phone|call)\b/i,
  // Hindi script equivalents
  /[\u0900-\u097F]*(वेबसाइट|ऐड्स|विज्ञापन|मार्केटिंग|बिज़नेस|कस्टमर|लीड्स|बिक्री|सर्च इंजन|एसईओ|प्राइस|क्लिकक्राफ्ट|ऑनलाइन)[\u0900-\u097F]*/
];

/**
 * Polite deflection messages when the user asks an unrelated query
 */
export const DEFLECTION_RESPONSES = {
  hindi:
    'यह मेरे expertise से बाहर है 😊 मैं आपकी website, ads और digital marketing से जुड़ी मदद कर सकता हूं। क्या आपके business के लिए कुछ पूछना चाहेंगे?',
  hinglish:
    'यह मेरे expertise से बाहर है 😊 मैं आपकी website, ads और digital marketing से जुड़ी मदद कर सकता हूं। क्या आपके business के लिए कुछ पूछना चाहेंगे?',
  english:
    'This is outside my expertise 😊 I can help you with website, ads, and digital marketing. Would you like to ask something for your business?',
};

/**
 * Classifies whether a user query is related to ClickCraft's services
 * or whether it should be deflected to avoid external API token usage.
 */
export function classifyTopic(userQuery: string): TopicClassification {
  if (!userQuery || typeof userQuery !== 'string') {
    return {
      isRelated: false,
      deflectionText: DEFLECTION_RESPONSES.hinglish,
      langStyle: 'hinglish',
    };
  }

  const query = userQuery.trim();
  const langStyle = detectLanguageStyle(query);
  const lower = query.toLowerCase();

  // 1. Explicitly test for UNRELATED topics (weather, cricket, cooking recipes, movies, etc.)
  for (const item of UNRELATED_PATTERNS) {
    if (item.regex.test(query)) {
      // Double check: if it's explicitly asking about digital marketing or website in conjunction with that word
      const hasDirectMarketingContext = RELATED_PATTERNS.some((rel) => rel.test(query));
      if (!hasDirectMarketingContext) {
        return {
          isRelated: false,
          deflectionText: DEFLECTION_RESPONSES[langStyle],
          langStyle,
          detectedCategory: item.category,
        };
      }
    }
  }

  // 2. Check for RELATED topics (digital marketing, ads, website, business growth, SEO, etc.)
  const isDirectlyRelated = RELATED_PATTERNS.some((rel) => rel.test(query));
  if (isDirectlyRelated) {
    return {
      isRelated: true,
      deflectionText: '',
      langStyle,
      detectedCategory: 'business_digital_marketing',
    };
  }

  // 3. Fallback heuristic: If query is very short generic question or greeting, treat as potentially related or courtesy
  const wordCount = lower.split(/\s+/).length;
  if (wordCount <= 3) {
    // Short greetings or vague requests
    return {
      isRelated: true,
      deflectionText: '',
      langStyle,
      detectedCategory: 'general_inquiry',
    };
  }

  // If query is an off-topic question without any marketing/business context, deflect
  return {
    isRelated: false,
    deflectionText: DEFLECTION_RESPONSES[langStyle],
    langStyle,
    detectedCategory: 'unrelated_other',
  };
}
