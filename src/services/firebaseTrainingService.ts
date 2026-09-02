import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import Fuse from 'fuse.js';
import firebaseConfig from '../../firebase-applet-config.json';
import rawFaqsData from '../data/firestoreFaqs.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export interface FAQItem {
  id?: string | number;
  question_en?: string;
  question_hi?: string;
  answer_en?: string;
  answer_hi?: string;
  keywords?: string[];
  // Legacy fields fallback compatibility
  question?: string;
  answer?: string;
}

// 90 Complete FAQs Dataset imported from firestoreFaqs.json
export const CLICKCRAFT_FIREBASE_FAQS: FAQItem[] = rawFaqsData as FAQItem[];

// Training Dataset for ClickCraft
export const CLICKCRAFT_MASTER_TRAINING_DATA = [
  {
    id: 'official_services_pricing',
    category: 'pricing_packages',
    title: 'ClickCraft Official Services, Packages & Pricing',
    content: `ClickCraft Official Services & Pricing:
1. Buy Ads – ₹500 (targeted ad campaign on Meta/Instagram/Google, custom graphic design, local audience targeting, direct WhatsApp leads)
2. Buy Web – ₹5,000 (5-page professional website, mobile-responsive, fast loading speed, SEO optimization, WhatsApp chat integration)
3. Premium Package – ₹10,000 (full website + ads + branding + dedicated support)

Contact & WhatsApp: +91 9376124893`,
    keywords: 'price, pricing, cost, services, buy, packages, 500 advertisement, 5000 website, 10000 premium package, discount, rates',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'agency_overview',
    category: 'company_profile',
    title: 'ClickCraft Official Company Profile & Mission',
    content: `ClickCraft is a friendly, trustworthy, and knowledgeable freelance web design and digital advertising business.
Official Contact:
- WhatsApp / Phone: +91 9376124893
- Email: info@clickcraft.com
- Services: Buy Ads (₹500), Buy Web (₹5,000), Premium Package (₹10,000)`,
    keywords: 'about, company, profile, rating, contact, whatsapp, phone, email, clickcraft',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'greeting_casual_chat_policy',
    category: 'conversation_policy',
    title: 'Greeting & Casual Chat Rules',
    content: `GREETING & CASUAL CHAT RULES:
1. If user just greets (hi, hello, hey, namaste, kaise ho, good morning), DO NOT pitch services immediately.
2. Reply warmly and politely in their language:
   - Hindi: "नमस्ते! ClickCraft Assistant में आपका स्वागत है 😊 आज मैं आपकी किस तरह मदद कर सकता हूँ?"
   - Hinglish: "Namaste! ClickCraft Assistant me aapka swagat hai 😊 Aaj main aapki kis tarah help kar sakta hu?"
   - English: "Hello! Welcome to ClickCraft Assistant 😊 How can I help you today?"
3. If user says "kaise ho" / "how are you": "Main badhiya hu! Aap kaise hain? Aaj kis cheez me madad chahiye?"
4. Only discuss services/pricing when the user explicitly asks.
5. If user says "thanks", "ok", "theek hai", "acha", give a short, warm polite acknowledgement, never re-send service lists.`,
    keywords: 'greeting, hello, hi, namaste, kaise ho, thanks, ok, theek hai, rules, behavior',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Fuse.js configuration for fuzzy search matching across Hindi, English, Hinglish, and keywords
 */
const fuseOptions = {
  includeScore: true,
  threshold: 0.45, // allows typos and variations
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'keywords', weight: 0.5 },
    { name: 'question_en', weight: 0.3 },
    { name: 'question_hi', weight: 0.3 },
    { name: 'question', weight: 0.3 },
  ],
};

let liveFirestoreFAQs: FAQItem[] = [...CLICKCRAFT_FIREBASE_FAQS];
let fuseInstance: Fuse<FAQItem> = new Fuse(liveFirestoreFAQs, fuseOptions);
let hasInitializedRealtimeListener = false;

function updateFuseIndex(faqs: FAQItem[]) {
  liveFirestoreFAQs = faqs;
  fuseInstance = new Fuse(faqs, fuseOptions);
}

/**
 * Automatically seeds 90 ClickCraft FAQ documents and company data to Firebase Firestore
 */
export async function seedTrainingDataToFirestore(): Promise<{ success: boolean; count: number }> {
  try {
    let seededCount = 0;

    // 1. Seed master company profile
    const profileRef = doc(db, 'company_profile', 'clickcraft_master');
    await setDoc(profileRef, {
      companyName: 'ClickCraft',
      tagline: 'Friendly & Knowledgeable Web Design & Digital Advertising',
      description:
        'ClickCraft offers Buy Ads (₹500), Buy Web (₹5,000), and Premium Package (₹10,000).',
      whatsapp: '+919376124893',
      phone: '+91 9376124893',
      email: 'info@clickcraft.com',
      services: [
        { name: 'Buy Ads', price: '₹500', desc: 'Targeted ad campaign' },
        { name: 'Buy Web', price: '₹5,000', desc: '5-page professional website' },
        { name: 'Premium Package', price: '₹10,000', desc: 'Full website + ads + branding' },
      ],
      updatedAt: new Date().toISOString(),
    });

    // 2. Seed official FAQs collection (90 documents)
    for (const faq of CLICKCRAFT_FIREBASE_FAQS) {
      const faqId = `faq_${faq.id}`;
      const faqRef = doc(db, 'faqs', faqId);
      await setDoc(faqRef, {
        id: faq.id,
        question_en: faq.question_en || faq.question || '',
        question_hi: faq.question_hi || '',
        answer_en: faq.answer_en || faq.answer || '',
        answer_hi: faq.answer_hi || '',
        keywords: faq.keywords || [],
      });
      seededCount++;
    }

    console.log(`[Firebase] Successfully synchronized ${seededCount} ClickCraft FAQ records to Firestore!`);
    return { success: true, count: seededCount };
  } catch (error) {
    console.warn('[Firebase] Training & FAQ data sync notice:', error);
    return { success: false, count: 0 };
  }
}

/**
 * Initializes real-time listener for Firestore FAQs collection
 */
export function initLiveFirestoreFAQsListener(): () => void {
  if (hasInitializedRealtimeListener || typeof window === 'undefined') {
    return () => {};
  }
  try {
    hasInitializedRealtimeListener = true;
    const faqsCol = collection(db, 'faqs');
    const unsub = onSnapshot(
      faqsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const updated: FAQItem[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id || d.id,
              question_en: data.question_en || data.question || '',
              question_hi: data.question_hi || '',
              answer_en: data.answer_en || data.answer || '',
              answer_hi: data.answer_hi || '',
              keywords: Array.isArray(data.keywords) ? data.keywords : [],
              question: data.question || data.question_en || '',
              answer: data.answer || data.answer_hi || data.answer_en || '',
            };
          });
          if (updated.length > 0) {
            updateFuseIndex(updated);
            console.log(`[Firebase Live] Loaded ${updated.length} live FAQ documents from Firestore into Fuse index.`);
          }
        }
      },
      (error) => {
        console.warn('[Firebase Live] FAQ listener notification:', error);
      }
    );
    return unsub;
  } catch (err) {
    console.warn('[Firebase Live] Failed to attach FAQ listener:', err);
    return () => {};
  }
}

/**
 * Returns current live FAQs fetched from Firestore
 */
export function getLiveFirebaseFAQs(): FAQItem[] {
  return liveFirestoreFAQs && liveFirestoreFAQs.length > 0
    ? liveFirestoreFAQs
    : CLICKCRAFT_FIREBASE_FAQS;
}

/**
 * Fetches all FAQ items directly from the 'faqs' collection in Firestore
 */
export async function fetchFAQsFromFirestore(): Promise<FAQItem[]> {
  try {
    const faqsCol = collection(db, 'faqs');
    const q = query(faqsCol, limit(150));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docs: FAQItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id || d.id,
          question_en: data.question_en || data.question || '',
          question_hi: data.question_hi || '',
          answer_en: data.answer_en || data.answer || '',
          answer_hi: data.answer_hi || '',
          keywords: Array.isArray(data.keywords) ? data.keywords : [],
          question: data.question || data.question_en || '',
          answer: data.answer || data.answer_hi || data.answer_en || '',
        };
      });
      if (docs.length > 0) {
        updateFuseIndex(docs);
        return docs;
      }
    }
  } catch (err) {
    console.warn('[Firebase FAQ] Notice fetching FAQs:', err);
  }
  return liveFirestoreFAQs;
}

/**
 * Detect language style of user query:
 * 'hindi' (Devanagari script)
 * 'english' (pure English words)
 * 'hinglish' (Hindi words in English alphabet like 'kya', 'kaise', 'batao', etc.)
 */
export function detectLanguageStyle(text: string): 'hindi' | 'hinglish' | 'english' {
  if (!text) return 'english';
  // Check for Devanagari script (Hindi)
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hindi';
  }

  const lower = text.toLowerCase();
  const hinglishTokens = [
    'kya', 'hai', 'hain', 'kaise', 'kese', 'kitna', 'kitne', 'hoga', 'hogi', 'kare', 'karega',
    'karna', 'chahiye', 'batao', 'mujhe', 'mere', 'meri', 'mera', 'aap', 'tum', 'bhai', 'sir',
    'kharcha', 'paisa', 'paise', 'kimat', 'dukaan', 'gadi', 'purani', 'pehle', 'fayda', 'sahi',
    'badhegi', 'badhega', 'chota', 'chote', 'milta', 'milega', 'rakhne', 'sasta', 'mehenga', 'le',
    'sakte', 'dhundenge', 'banaye', 'banau', 'kaam', 'accha', 'achha', 'nahi', 'nhi', 'matlab'
  ];

  const words = lower.split(/[^a-z0-9]+/);
  const hasHinglish = words.some(w => hinglishTokens.includes(w));
  if (hasHinglish) {
    return 'hinglish';
  }

  return 'english';
}

/**
 * Checks for pure greetings or casual acknowledgements to avoid pushy sales responses
 */
export function matchGreetingOrCasualChat(userQuery: string): string | null {
  if (!userQuery) return null;
  const trimmed = userQuery.trim().toLowerCase();
  const langStyle = detectLanguageStyle(userQuery);

  // Pure greetings
  const isPureGreeting = /^(hi|hello|hey|heyy|namaste|namaskar|pranam|ram ram|radhe radhe|good morning|good evening|good afternoon|hlo|hii|namastey)[!.,? ]*$/i.test(trimmed);
  if (isPureGreeting) {
    if (langStyle === 'hindi') {
      return "नमस्ते! ClickCraft Assistant में आपका स्वागत है 😊 आज मैं आपकी किस तरह मदद कर सकता हूँ?";
    } else if (langStyle === 'hinglish') {
      return "Namaste! ClickCraft Assistant me aapka swagat hai 😊 Aaj main aapki kis tarah help kar sakta hu?";
    } else {
      return "Hello! Welcome to ClickCraft Assistant 😊 How can I help you today?";
    }
  }

  // "How are you" / "Kaise ho"
  const isHowAreYou = /^(kaise ho|kese ho|aap kaise ho|aap kese ho|how are you|how r u|kya haal hai|kya hal h)[!.,? ]*$/i.test(trimmed);
  if (isHowAreYou) {
    if (langStyle === 'hindi') {
      return "मैं बिल्कुल बढ़िया हूँ, पूछने के लिए धन्यवाद! 😊 आप कैसे हैं? बताइए आज आपके बिज़नेस या वेबसाइट के लिए किस तरह मदद करूँ?";
    } else if (langStyle === 'hinglish') {
      return "Main badhiya hu, poochhne ke liye shukriya! 😊 Aap kaise hain? Batayiye aaj aapki kis tarah help kar sakta hu?";
    } else {
      return "I'm doing great, thank you for asking! 😊 How are you? How can I assist you with your business or website today?";
    }
  }

  // Casual acknowledgements: thanks, ok, theek hai, acha
  const isAcknowledgement = /^(thanks|thank you|dhanyawad|shukriya|ok|okay|theek hai|thik hai|acha|achha|theek h|thik h|got it|samajh gaya|samajh aa gaya)[!.,? ]*$/i.test(trimmed);
  if (isAcknowledgement) {
    if (langStyle === 'hindi') {
      return "आपका बहुत-बहुत स्वागत है! 😊 अगर आपके मन में कोई और सवाल हो या किसी भी चीज़ में मदद चाहिए, तो कभी भी पूछ सकते हैं।";
    } else if (langStyle === 'hinglish') {
      return "Aapka swagat hai! 😊 Agar koi aur sawal ho ya kisi cheez me help chahiye, to bilkul batayiye.";
    } else {
      return "You're most welcome! 😊 Feel free to ask if you need help with anything else.";
    }
  }

  return null;
}

/**
 * Checks if the user's question closely matches any question or keywords stored in the "faqs" collection in Firebase
 * using Fuse.js fuzzy search (supports typos, Hindi, English, and Hinglish keywords).
 * Returns the matching answer in the appropriate language style or null if outside knowledge base.
 */
export function matchFAQFromFirebase(userQuery: string, faqsList?: FAQItem[]): string | null {
  if (!userQuery || typeof userQuery !== 'string') return null;

  // 1. Check for greeting or casual interaction first
  const greetingResponse = matchGreetingOrCasualChat(userQuery);
  if (greetingResponse) {
    return greetingResponse;
  }

  const listToSearch = faqsList || getLiveFirebaseFAQs();
  const langStyle = detectLanguageStyle(userQuery);

  // If specific list passed or fuseInstance needs update
  const searcher = faqsList ? new Fuse(listToSearch, fuseOptions) : fuseInstance;
  const results = searcher.search(userQuery);

  if (results && results.length > 0 && results[0].score !== undefined && results[0].score <= 0.48) {
    const matchedFaq = results[0].item;
    if (langStyle === 'hindi') {
      return matchedFaq.answer_hi || matchedFaq.answer || matchedFaq.answer_en || '';
    } else if (langStyle === 'hinglish') {
      // In Hinglish, return answer_hi or answer_en naturally
      return matchedFaq.answer_hi || matchedFaq.answer_en || matchedFaq.answer || '';
    } else {
      return matchedFaq.answer_en || matchedFaq.answer || matchedFaq.answer_hi || '';
    }
  }

  return null;
}

/**
 * Finds direct/fuzzy answer or returns null
 */
export function findInstantFirebaseAnswer(rawQuery: string, _lang?: string): string | null {
  return matchFAQFromFirebase(rawQuery);
}

/**
 * Logs user questions and AI answers to Firestore /chat_logs for ongoing model training
 */
export async function logConversationToFirebase(
  userPrompt: string,
  aiResponse: string,
  language = 'Hindi'
): Promise<void> {
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logRef = doc(db, 'chat_logs', logId);

    await setDoc(logRef, {
      id: logId,
      userPrompt: userPrompt.substring(0, 4000),
      aiResponse: aiResponse.substring(0, 15000),
      language,
      timestamp: new Date().toISOString(),
      trainingApproved: true,
    });
  } catch (error) {
    console.warn('[Firebase Log] Chat training log catch:', error);
  }
}
