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
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  keywords?: string[];
}

// Master ClickCraft FAQs Collection Dataset stored in Firebase
export const CLICKCRAFT_FIREBASE_FAQS: FAQItem[] = [
  // Document 1 (Greetings: hi, hii, hiii, hey)
  {
    id: 'faq_greeting_hi',
    question: 'hi',
    keywords: ['hi', 'hii', 'hiii', 'hey', 'hey there', 'hi clickcraft'],
    answer: 'नमस्ते! मैं ClickCraft Assistant हूं, आपकी digital marketing में मदद के लिए। आप Ads, Website या Premium package के बारे में पूछ सकते हैं।',
  },
  // Document 2 (Greetings: hello, helo, hllo)
  {
    id: 'faq_greeting_hello',
    question: 'hello',
    keywords: ['hello', 'helo', 'hllo', 'hello assistant', 'hello clickcraft'],
    answer: 'हेलो! ClickCraft में आपका स्वागत है। बताइए, मैं आपकी क्या मदद कर सकता हूं?',
  },
  // Document 3 (Status: how are you, kaise ho, kese ho)
  {
    id: 'faq_greeting_how_are_you',
    question: 'how are you',
    keywords: ['how are you', 'kaise ho', 'kese ho', 'how r u', 'kese ho aap', 'kaise ho aap', 'kaise ho bhai', 'kese ho bhai', 'how are you doing'],
    answer: 'मैं बढ़िया हूं! आप बताइए, आपको website चाहिए, ads चाहिए, या marketing में कोई मदद चाहिए?',
  },
  {
    id: 'faq_ad_price_en',
    question: 'What is the price of an advertisement campaign?',
    keywords: ['ad price', 'advertisement cost', 'price of ad', '500 ad', 'ad package price'],
    answer: 'ClickCraft provides targeted advertisement campaigns starting at ₹500. This includes 1 complete targeted ad campaign on Meta (Instagram/Facebook) or Google, custom graphic design, local audience targeting, and direct customer leads sent to your WhatsApp (+91 9376124893).',
  },
  {
    id: 'faq_ad_price_hi',
    question: 'विज्ञापन कैंपेन (Ad Campaign) की कीमत क्या है?',
    answer: 'ClickCraft का विज्ञापन कैंपेन पैकेज मात्र ₹500 में उपलब्ध है। इसमें Meta (Instagram/Facebook) या Google पर 1 टारगेटेड ऐड कैंपेन, कस्टम ग्राफिक डिज़ाइन, लोकल ऑडियंस टारगेटिंग और डायरेक्ट आपके WhatsApp (+91 9376124893) पर कस्टमर लीड्स शामिल हैं।',
  },
  {
    id: 'faq_website_price_en',
    question: 'How much does a professional website cost?',
    answer: 'A professional business website by ClickCraft costs ₹5,000. It includes a custom mobile-responsive layout, high loading speed, SEO optimization, direct WhatsApp chat integration, contact lead forms, and SSL security.',
  },
  {
    id: 'faq_website_price_hi',
    question: 'वेबसाइट बनवाने का कितना खर्च आता है?',
    answer: 'ClickCraft से प्रोफ़ेशनल बिज़नेस वेबसाइट बनवाने का खर्च मात्र ₹5,000 है। इसमें मोबाइल-रिस्पॉन्सिव डिज़ाइन, तेज़ स्पीड, SEO ऑप्टिमाइज़ेशन, WhatsApp चैट इंटीग्रेशन, कॉन्टैक्ट फ़ॉर्म और SSL सिक्योरिटी शामिल है।',
  },
  {
    id: 'faq_combo_price_en',
    question: 'What is included in the ₹10,000 Premium Combo Offer?',
    answer: 'The ₹10,000 Premium Combo Offer includes a complete custom business website (worth ₹5,000) plus 1 full week (7 days) of managed high-ROI targeted ad campaigns with video reels, motion graphics, continuous audience optimization, and a dedicated campaign manager.',
  },
  {
    id: 'faq_combo_price_hi',
    question: '₹10,000 वाले प्रीमियम कॉम्बो ऑफर में क्या मिलता है?',
    answer: '₹10,000 के प्रीमियम कॉम्बो ऑफर में पूरी प्रोफ़ेशनल वेबसाइट (वैल्यू ₹5,000) के साथ पूरे 7 दिन (1 हफ़्ता) का लाइव टारगेटेड ऐड कैंपेन, वीडियो रील्स, मोशन ग्राफिक्स, रोज़ाना बजट ऑप्टिमाइज़ेशन और डेडिकेटेड कैंपेन मैनेजर मिलता है।',
  },
  {
    id: 'faq_services_all_en',
    question: 'What services does ClickCraft provide?',
    answer: 'ClickCraft provides targeted digital advertisement campaigns (Meta, Instagram, Google Ads), custom responsive website development (₹5,000), the specialized "Sell Old Car by Ad" service, and high-converting creative marketing strategies.',
  },
  {
    id: 'faq_services_all_hi',
    question: 'ClickCraft क्या-क्या सर्विसेज़ प्रदान करता है?',
    answer: 'ClickCraft टारगेटेड डिजिटल विज्ञापन कैंपेन (₹500), प्रोफ़ेशनल मोबाइल-रिस्पॉन्सिव वेबसाइट डेवलपमेंट (₹5,000), प्रीमियम कॉम्बो ऑफर (₹10,000), Sell Old Car by Ad सर्विस और हाई-कन्वर्टिंग क्रिएटिव मार्केटिंग स्ट्रैटेजी प्रदान करता है।',
  },
  {
    id: 'faq_sell_old_car_en',
    question: 'What is the Sell Old Car by Ad service?',
    answer: 'Sell Old Car by Ad is ClickCraft\'s specialized service that helps you sell your pre-owned vehicle directly to verified local buyers via targeted video and photo ads on social media, eliminating dealer commissions.',
  },
  {
    id: 'faq_sell_old_car_hi',
    question: 'Sell Old Car by Ad सर्विस क्या है?',
    answer: 'Sell Old Car by Ad सर्विस के ज़रिए बिना किसी डीलर कमीशन के आपकी पुरानी गाड़ी के वीडियो व फ़ोटो ऐड्स बनाकर सीधे लोकल खरीदारों तक पहुँचाया जाता है, जिससे गाड़ी जल्दी और सही कीमत पर बिकती है।',
  },
  {
    id: 'faq_contact_en',
    question: 'How can I contact ClickCraft?',
    answer: 'You can reach ClickCraft directly via WhatsApp or phone at +91 9376124893, or by email at info@clickcraft.com. Our team is available 24/7 to assist with your web design and marketing campaigns.',
  },
  {
    id: 'faq_contact_hi',
    question: 'ClickCraft से कैसे संपर्क करें?',
    answer: 'आप ClickCraft से सीधे WhatsApp या कॉल पर +91 9376124893 पर संपर्क कर सकते हैं, या info@clickcraft.com पर ईमेल भेज सकते हैं। हमारी टीम आपकी सहायता के लिए सदैव उपलब्ध है।',
  },
  {
    id: 'faq_website_time_en',
    question: 'How long does it take to build a website?',
    answer: 'A standard professional business website is designed, developed, and launched within 3 to 5 business days after receiving your business details and content requirements.',
  },
  {
    id: 'faq_website_time_hi',
    question: 'वेबसाइट बनने में कितना समय लगता है?',
    answer: 'सामान्यतः आपकी ज़रूरी जानकारी और कंटेंट प्राप्त होने के बाद 3 से 5 कार्य दिवसों (business days) में पूरी वेबसाइट तैयार करके लाइव कर दी जाती है।',
  },
  {
    id: 'faq_leads_delivery_en',
    question: 'How do customer leads reach me from advertisements?',
    answer: 'All customer leads and inquiries generated from your ad campaigns are delivered instantly and directly to your WhatsApp number (+91 9376124893) and phone.',
  },
  {
    id: 'faq_leads_delivery_hi',
    question: 'ऐड्स से आने वाली लीड्स मुझ तक कैसे पहुँचेंगी?',
    answer: 'आपके विज्ञापन कैंपेन से आने वाले सभी ग्राहकों के संदेश और लीड्स तुरंत रियल-टाइम में सीधे आपके WhatsApp और फ़ोन नंबर पर डिलीवर होते हैं।',
  },
  {
    id: 'faq_seo_included_en',
    question: 'Is SEO included with website development?',
    answer: 'Yes, every business website developed by ClickCraft includes foundational on-page SEO optimization, meta tags, and fast page loading architecture to help your business rank on search engines.',
  },
  {
    id: 'faq_seo_included_hi',
    question: 'क्या वेबसाइट के साथ SEO भी मिलता है?',
    answer: 'हाँ, ClickCraft द्वारा बनाई जाने वाली हर वेबसाइट में बेसिक ऑन-पेज SEO ऑप्टिमाइज़ेशन, मेटा टैग्स और तेज़ स्पीड शामिल होती है ताकि आपकी वेबसाइट गूगल सर्च में रैंक कर सके।',
  },
  {
    id: 'faq_platforms_en',
    question: 'Which platforms do you run advertisements on?',
    answer: 'We run targeted campaigns on Meta (Facebook & Instagram), Google Ads (Search and Display networks), YouTube, and local digital audience channels.',
  },
  {
    id: 'faq_platforms_hi',
    question: 'आप किन-किन प्लेटफॉर्म्स पर विज्ञापन चलाते हैं?',
    answer: 'हम Meta (Facebook और Instagram), Google Ads (सर्च व डिस्प्ले नेटवर्क), YouTube और लोकल डिजिटल ऑडियंस चैनल्स पर हाई-कन्वर्टिंग विज्ञापन चलाते हैं।',
  },
  {
    id: 'faq_why_choose_en',
    question: 'Why should I choose ClickCraft?',
    answer: 'ClickCraft is a 5-star rated agency with over 500 happy clients and 1,200+ successful campaigns. We provide transparent pricing, high-converting creative design, zero ad spend wastage, and dedicated campaign support.',
  },
  {
    id: 'faq_why_choose_hi',
    question: 'मुझे ClickCraft को क्यों चुनना चाहिए?',
    answer: 'ClickCraft 500+ संतुष्ट क्लाइंट्स और 1,200+ सफल कैंपेन के साथ 5-स्टार रेटेड एजेंसी है। हम पारदर्शी दरें, हाई-कन्वर्टिंग डिज़ाइन और बिना किसी बजट बर्बादी के सटीक लोकल टारगेटिंग प्रदान करते हैं।',
  },
];

// ClickCraft Comprehensive Training Dataset
export const CLICKCRAFT_MASTER_TRAINING_DATA = [
  {
    id: 'official_services_pricing',
    category: 'pricing_packages',
    title: 'ClickCraft Official Services, Packages & Pricing',
    content: `ClickCraft Official Services & Pricing List:
1. Advertisement Campaign — Price: ₹500
   - 1 High-converting targeted ad campaign (Meta / Instagram / Google).
   - Custom high-engagement ad graphic & persuasive Hindi/English copy.
   - Local audience & radius geo-targeting to generate real customer leads.
   - Direct lead delivery directly to client WhatsApp/phone.
   - Fast launch within 24-48 hours.

2. Professional Website — Price: ₹5,000
   - Custom modern responsive business website (mobile & desktop).
   - High-speed loading, SEO-friendly architecture, and SSL security.
   - Direct WhatsApp chat integration & lead capture contact forms.
   - Google Maps location embedding & business profile showcase.
   - 100% ownership with fast turnaround.

3. Premium Offer (Website + 1 Week Advertisement) — Price: ₹10,000 (BEST VALUE)
   - Complete Professional Website (Worth ₹5,000) included.
   - Full 1 Week (7 Days) High-ROI Targeted Advertisement Campaign.
   - Custom video reels & motion graphic ad creatives produced by ClickCraft.
   - Daily budget optimization, audience A/B split-testing, and conversion tracking.
   - Real-time transparent analytics & ROI reporting.
   - Dedicated Campaign Manager & priority WhatsApp support (+91 9376124893).`,
    keywords: 'price, pricing, cost, services, buy, packages, 500 advertisement, 5000 website, 10000 premium offer, discount, rates',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'package_advertisement_500',
    category: 'pricing_packages',
    title: 'Advertisement Campaign Package (₹500)',
    content: `Advertisement Campaign by ClickCraft:
Price: ₹500 (One-Time)
What is included:
- Full setup of 1 targeted ad campaign on Instagram, Facebook, or Google.
- Creative design (banner/graphic) and high-converting ad copy.
- Targeting precise buyers in your local city or audience demographic.
- Direct customer inquiries to your WhatsApp (+91 9376124893).
- Ideal for small shops, local services, car sellers, and new brands.`,
    keywords: 'advertisement, ads, 500, ad price, fb ads, insta ads, 500 ad',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'package_website_5000',
    category: 'pricing_packages',
    title: 'Professional Website Development Package (₹5,000)',
    content: `Professional Website Development by ClickCraft:
Price: ₹5,000 (One-Time)
What is included:
- Complete mobile-responsive business website.
- Fast loading speed, modern clean layout, and SEO optimization.
- Interactive WhatsApp chat integration, contact forms, and Google Maps.
- Free domain connection guidance & SSL security setup.
- Perfect for businesses looking to establish credibility and get direct orders online.`,
    keywords: 'website, web development, 5000, website price, business website, design',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'package_premium_10000',
    category: 'pricing_packages',
    title: 'Premium Combo Offer: Website + 1 Week Ads (₹10,000)',
    content: `Premium Offer by ClickCraft (Website + 1 Week Advertisement):
Price: ₹10,000 (Best Value)
What is included:
- Complete Custom Website Development (Value ₹5,000).
- 1 Full Week (7 Days) of Managed High-ROI Targeted Ad Campaigns.
- High-converting video reels, motion graphics, and ad copywriting.
- Continuous audience testing, daily optimization, and transparent analytics.
- Direct lead delivery to WhatsApp and phone.
- Dedicated Campaign Manager for full 7 days.`,
    keywords: 'premium offer, 10000, website plus ads, combo, best offer, 1 week ad, agency deal',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'agency_overview',
    category: 'company_profile',
    title: 'ClickCraft Official Company Profile & Mission',
    content: `ClickCraft is a premier digital marketing agency with a verified track record of 500+ happy clients and 1200+ successful ad campaigns.
We specialize in high-ROI targeted ads, creative storytelling strategy, full-funnel digital marketing, and the specialized 'Sell Old Car by Ad' service.
Official Contact:
- Phone & WhatsApp: +91 9376124893 (wa.me/919376124893)
- Email: info@clickcraft.com
- Rating: 5-Star Rated Agency
- Tagline: Boost Your Business Online`,
    keywords: 'about, company, profile, rating, contact, whatsapp, phone, email, clickcraft',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'service_targeted_ads',
    category: 'services',
    title: 'Targeted Ads & Precision Audience Reach',
    content: `Targeted Ads by ClickCraft:
We build hyper-targeted ad campaigns on Facebook, Instagram, Google Ads, and YouTube.
Features:
- Demographic, psychographic, and behavioral audience segmentation.
- Geo-targeting and local radius ads for local businesses and regional brands.
- Retargeting visitors who previously engaged with your brand.
- Zero ad spend wastage: every rupee is optimized for conversion and measurable ROI.`,
    keywords: 'targeted ads, facebook ads, instagram ads, google ads, audience, roi, spend',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'service_sell_old_car',
    category: 'services',
    title: 'Sell Old Car by Ad (ClickCraft Signature Service)',
    content: `Sell Old Car by Ad:
ClickCraft's signature, high-impact ad service specifically engineered to sell pre-owned vehicles quickly to verified, genuine buyers without relying on costly middleman dealer commissions.
Key Benefits:
- Custom visual video creatives and multi-angle photo highlights of the car.
- Local buyer targeting within specific city and budget brackets.
- Direct lead delivery directly to the vehicle owner's WhatsApp and phone.
- Faster sale turnaround at true market value.`,
    keywords: 'sell old car, car ads, used cars, vehicle marketing, second hand car, automotive ads',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'service_creative_strategy',
    category: 'services',
    title: 'Creative Strategy: Turning Browsers into Buyers',
    content: `Creative Strategy by ClickCraft:
Our in-house design and copywriting strategists combine striking visuals, scroll-stopping hooks, and persuasive copywriting to transform passive casual viewers into active paying customers.
Deliverables:
- High-converting ad banners, motion graphics, and video reels.
- Emotional and psychological value propositions customized to your niche.
- Multi-variant A/B testing of headlines, creatives, and calls-to-action.`,
    keywords: 'creative strategy, ad design, copywriting, banners, reels, conversion, hooks',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'service_business_growth_analytics',
    category: 'services',
    title: 'Business Analytics & Transparent ROI Tracking',
    content: `Business Analytics & Reporting:
We provide 100% transparent analytics dashboard reporting for every campaign.
Features:
- Real-time conversion tracking and cost-per-acquisition (CPA) metrics.
- Return on Ad Spend (ROAS) optimization.
- Comprehensive weekly and monthly performance reports with actionable insights.
- No vanity metrics: we focus strictly on revenue, leads, and sales growth.`,
    keywords: 'analytics, roi, roas, cpa, conversion tracking, reporting, business growth',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'campaign_process',
    category: 'process',
    title: 'ClickCraft 5-Step Campaign Launch Methodology',
    content: `ClickCraft 5-Step Process:
1. Discovery & Business Goal Alignment: Understanding client objectives, target market, and unit economics.
2. Audience & Platform Selection: Pinpointing the ideal channels (Meta, Google, YouTube, LinkedIn).
3. Creative & Copy Production: Designing high-converting visuals and compelling Hindi/English ad copy.
4. Launch & Continuous Optimization: Real-time budget allocation and A/B split-testing.
5. Reporting & Scaling: Transparent ROI reviews and scaling winning ad sets for maximum profit.`,
    keywords: 'process, 5-step, methodology, how it works, campaign launch, strategy',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'why_choose_clickcraft',
    category: 'trust',
    title: 'Why Choose ClickCraft (Credentials & Achievements)',
    content: `Why Businesses Choose ClickCraft:
- 500+ Satisfied Clients across e-commerce, local businesses, real estate, and automotive.
- 1,200+ High-Performance Campaigns Delivered.
- 5.0 Star Client Rating with proven case studies.
- Transparent Pricing & Dedicated Campaign Managers.
- Real-Time Consultation via WhatsApp (+919376124893) and direct phone support.`,
    keywords: 'why choose, credentials, clients, rating, reviews, portfolio, trust',
    language: 'all',
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Automatically seeds ClickCraft training data and FAQs to Firebase Firestore
 */
export async function seedTrainingDataToFirestore(): Promise<{ success: boolean; count: number }> {
  try {
    let seededCount = 0;

    // 1. Seed master company profile
    const profileRef = doc(db, 'company_profile', 'clickcraft_master');
    await setDoc(profileRef, {
      companyName: 'ClickCraft',
      tagline: 'Boost Your Business Online',
      description:
        'ClickCraft creates targeted digital ads and websites that reach real customers and drive measurable business growth. From selling pre-owned cars to scaling local brands, ClickCraft delivers high-converting campaigns.',
      whatsapp: '+919376124893',
      phone: '+91 9376124893',
      email: 'info@clickcraft.com',
      happyClients: '500+',
      campaignsDelivered: '1200+',
      logoUrl: 'https://i.postimg.cc/MHZXGDHF/596701082-122110771671083682-4894056021958296740-n.jpg',
      updatedAt: new Date().toISOString(),
    });

    // 2. Seed official FAQs collection (Collection: faqs, Fields: question, answer, keywords)
    for (const faq of CLICKCRAFT_FIREBASE_FAQS) {
      const faqId = faq.id || `faq_${Math.abs(faq.question.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0))}`;
      const faqRef = doc(db, 'faqs', faqId);
      await setDoc(faqRef, {
        question: faq.question,
        answer: faq.answer,
        ...(faq.keywords ? { keywords: faq.keywords } : {}),
      });
      seededCount++;
    }

    // 3. Seed individual training data documents
    for (const item of CLICKCRAFT_MASTER_TRAINING_DATA) {
      const docRef = doc(db, 'training_data', item.id);
      await setDoc(docRef, item);
      seededCount++;
    }

    console.log(`[Firebase] Successfully synchronized ${seededCount} ClickCraft training & FAQ records to Firestore!`);
    return { success: true, count: seededCount };
  } catch (error) {
    console.warn('[Firebase] Training & FAQ data sync notice:', error);
    return { success: false, count: 0 };
  }
}

/**
 * Real-time dynamic FAQs cache synced with Firebase Firestore
 */
let liveFirestoreFAQs: FAQItem[] = [...CLICKCRAFT_FIREBASE_FAQS];
let hasInitializedRealtimeListener = false;

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
          const updated = snapshot.docs.map((d) => ({
            id: d.id,
            question: (d.data().question as string) || '',
            answer: (d.data().answer as string) || '',
            keywords: Array.isArray(d.data().keywords) ? (d.data().keywords as string[]) : undefined,
          })).filter(f => f.question && f.answer);
          if (updated.length > 0) {
            liveFirestoreFAQs = updated;
            console.log(`[Firebase Live] Loaded ${updated.length} live FAQ documents from Firestore.`);
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
    const q = query(faqsCol, limit(100));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        question: d.data().question as string,
        answer: d.data().answer as string,
        keywords: Array.isArray(d.data().keywords) ? (d.data().keywords as string[]) : undefined,
      })).filter(f => f.question && f.answer);
      if (docs.length > 0) {
        liveFirestoreFAQs = docs;
        return docs;
      }
    }
  } catch (err) {
    console.warn('[Firebase FAQ] Notice fetching FAQs:', err);
  }
  return liveFirestoreFAQs;
}

/**
 * Checks if the user's question closely matches any question or keywords stored in the "faqs" collection in Firebase.
 * If a match is found by meaning/intent/keywords, returns ONLY that stored answer exactly as written in Firebase without calling external API keys.
 */
export function matchFAQFromFirebase(userQuery: string, faqsList?: FAQItem[]): string | null {
  if (!userQuery || typeof userQuery !== 'string') return null;
  const listToSearch = faqsList || getLiveFirebaseFAQs();
  const rawQ = userQuery.trim().toLowerCase();
  
  // Strip common punctuation
  const cleanQ = rawQ.replace(/[?!.,;:()'"`~@#$%^&*_+=[\]{}|\\/<>]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanQ) return null;
  const qTokens = cleanQ.split(' ').filter(Boolean);

  // 1. Direct Keyword / Question exact match (Highest Priority)
  for (const faq of listToSearch) {
    const faqQ = faq.question.toLowerCase().replace(/[?!.,;:()'"`~@#$%^&*_+=[\]{}|\\/<>]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Exact question match
    if (cleanQ === faqQ) {
      return faq.answer;
    }

    // Check keyword entries
    if (faq.keywords && Array.isArray(faq.keywords)) {
      for (const kw of faq.keywords) {
        const cleanKw = kw.toLowerCase().replace(/[?!.,;:()'"`~@#$%^&*_+=[\]{}|\\/<>]/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleanQ === cleanKw) {
          return faq.answer;
        }

        // Single word greeting (e.g. 'hi', 'hello', 'hey', 'hii') in short queries
        const kwParts = cleanKw.split(' ').filter(Boolean);
        if (kwParts.length === 1 && qTokens.includes(cleanKw)) {
          if (qTokens.length <= 4) {
            return faq.answer;
          }
        }

        // Multi-word phrase keyword match (e.g. 'how are you', 'kaise ho', 'kese ho')
        if (kwParts.length > 1 && (cleanQ.includes(cleanKw) || cleanKw.includes(cleanQ))) {
          return faq.answer;
        }
      }
    }
  }

  // 2. Substring & Semantic Intent Matching
  let bestMatch: FAQItem | null = null;
  let highestScore = 0;

  for (const faq of listToSearch) {
    const faqQ = faq.question.toLowerCase().replace(/[?!.,;:()'"`~@#$%^&*_+=[\]{}|\\/<>]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Substring match for detailed questions (e.g. "price of website", "ad campaign price")
    if (faqQ.length > 5 && (cleanQ.includes(faqQ) || faqQ.includes(cleanQ))) {
      return faq.answer;
    }

    // Token overlap & semantic intent calculation
    const faqTokens = faqQ.split(/\s+/).filter(Boolean);
    let matchingTokens = 0;
    for (const token of qTokens) {
      if (token.length > 2 && faqTokens.some(ft => ft.includes(token) || token.includes(ft))) {
        matchingTokens++;
      }
    }

    const similarity = matchingTokens / Math.max(qTokens.length, faqTokens.length);
    if (similarity > highestScore) {
      highestScore = similarity;
      bestMatch = faq;
    }
  }

  // If close match found by meaning/intent
  if (bestMatch && highestScore >= 0.40) {
    return bestMatch.answer;
  }

  return null;
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
    // Non-blocking log catch
    console.warn('[Firebase Log] Chat training log catch:', error);
  }
}

/**
 * Fetches training documents from Firestore to ground the AI with latest knowledge
 */
export async function fetchTrainingDocsFromFirestore(): Promise<any[]> {
  try {
    const trainingCol = collection(db, 'training_data');
    const q = query(trainingCol, limit(10));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((d) => d.data());
    return docs.length > 0 ? docs : CLICKCRAFT_MASTER_TRAINING_DATA;
  } catch (err) {
    return CLICKCRAFT_MASTER_TRAINING_DATA;
  }
}

/**
 * Fast direct response generator adhering to ClickCraft Behavior Rules (Firebase FAQs first)
 */
export function findInstantFirebaseAnswer(rawQuery: string, lang = 'hi-IN'): string | null {
  if (!rawQuery || typeof rawQuery !== 'string') return null;
  
  // Rule 1 & 2: First check if user's question closely matches any question stored in "faqs" collection
  const exactFaqMatch = matchFAQFromFirebase(rawQuery);
  if (exactFaqMatch) {
    return exactFaqMatch;
  }

  const q = rawQuery.toLowerCase().trim();
  const isHindi = lang.startsWith('hi') || /[\u0900-\u097F]/.test(rawQuery) || q.includes('kya') || q.includes('batao') || q.includes('kaise') || q.includes('kimat') || q.includes('paisa');

  // 1. ₹500 Ads Package
  if (
    q.includes('500') ||
    q.includes('500 ad') ||
    q.includes('500 wala') ||
    q.includes('ads package') ||
    q.includes('advertisement package') ||
    (q.includes('ad') && (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('प्राइस') || q.includes('रेट')))
  ) {
    if (isHindi) {
      return `ClickCraft का Advertisement Campaign पैकेज सिर्फ ₹500 में उपलब्ध है:\n\n• इसमें Meta (Facebook & Instagram) या Google पर 1 टारगेटेड ऐड कैंपेन बनाया जाता है।\n• हाई-कन्वर्टिंग ग्राफिक डिज़ाइन और हिंदी/इंग्लिश ऐड कॉपी मिलती है।\n• आपके शहर और लोकल ऑडियंस को टारगेट किया जाता है ताकि असली ग्राहक मिलें।\n• सभी ग्राहक इंक्वायरी सीधे आपके WhatsApp (+91 9376124893) पर आती हैं।\n\nइसे शुरू करने के लिए आप Services बटन पर क्लिक करके डायरेक्ट ऑर्डर कर सकते हैं या WhatsApp पर संपर्क कर सकते हैं!`;
    }
    return `ClickCraft's Targeted Advertisement Campaign is available for just ₹500:\n\n• 1 targeted ad campaign on Meta (Instagram/Facebook) or Google.\n• Custom high-converting ad creative banner and persuasive copy.\n• Precise local audience and radius geo-targeting.\n• Direct customer leads delivered to your WhatsApp (+91 9376124893).\n• Fast launch in 24-48 hours.`;
  }

  // 2. ₹5,000 Website Package
  if (
    q.includes('5000') ||
    q.includes('5,000') ||
    q.includes('website package') ||
    q.includes('वेबसाइट') ||
    (q.includes('website') && (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('प्राइस') || q.includes('बनाना')))
  ) {
    if (isHindi) {
      return `ClickCraft का Professional Website Development पैकेज ₹5,000 में उपलब्ध है:\n\n• मोबाइल और कंप्यूटर दोनों के लिए पूरी तरह रिस्पॉन्सिव बिज़नेस वेबसाइट।\n• फ़ास्ट लोडिंग स्पीड, आधुनिक डिज़ाइन और SEO ऑप्टिमाइज़ेशन।\n• डायरेक्ट WhatsApp चैट बटन, कॉन्टैक्ट फ़ॉर्म और Google Maps लोकेशन।\n• SSL सिक्योरिटी और डोमेन सेटअप सपोर्ट।\n\nवेबसाइट बुक करने के लिए Services सेक्शन में जाएं या WhatsApp (+91 9376124893) पर संपर्क करें!`;
    }
    return `ClickCraft's Professional Website Development package is priced at ₹5,000:\n\n• Fully responsive, mobile-first modern business website.\n• High loading speed, clean design, and SEO-friendly architecture.\n• Direct WhatsApp integration, lead capture forms, and Google Maps.\n• Free SSL security & domain connection guidance.\n• Reach us at WhatsApp: +91 9376124893 to start!`;
  }

  // 3. ₹10,000 Premium Combo Offer
  if (
    q.includes('10000') ||
    q.includes('10,000') ||
    q.includes('premium offer') ||
    q.includes('combo') ||
    q.includes('प्रिमियम') ||
    (q.includes('offer') && q.includes('10'))
  ) {
    if (isHindi) {
      return `ClickCraft का Premium Combo Offer सिर्फ ₹10,000 में सबसे बेहतरीन वैल्यू है:\n\n• पूरी Professional Website (जिसकी कीमत ₹5,000 है) बिल्कुल शामिल है।\n• पूरे 7 दिन (1 हफ़्ता) का हाई-ROI टारगेटेड ऐड कैंपेन।\n• कस्टम वीडियो रील्स और मोशन ग्राफिक्स ऐड डिज़ाइन।\n• रोज़ाना ऑडियंस टेस्टिंग और बजट ऑप्टिमाइज़ेशन।\n• 7 दिनों के लिए डेडिकेटेड कैंपेन मैनेजर और WhatsApp सपोर्ट (+91 9376124893)।`;
    }
    return `ClickCraft's Premium Combo Offer is ₹10,000 (Best Value):\n\n• Complete Professional Business Website (Worth ₹5,000) included.\n• 1 Full Week (7 Days) of high-ROI targeted ad campaigns.\n• Video reels, motion graphics & conversion copywriting.\n• Continuous daily budget optimization and conversion tracking.\n• Dedicated Campaign Manager and direct WhatsApp support (+91 9376124893).`;
  }

  // 4. All Services & Pricing overview
  if (
    q.includes('service') ||
    q.includes('pricing') ||
    q.includes('price list') ||
    q.includes('package') ||
    q.includes('सर्विस') ||
    q.includes('प्राइस') ||
    q.includes('रेट लिस्ट')
  ) {
    if (isHindi) {
      return `ClickCraft की प्रमुख सर्विसेज़ और प्राइसिंग लिस्ट:\n\n1. 🚀 Advertisement Campaign: ₹500 (1 टारगेटेड ऐड, ग्राफिक डिज़ाइन, लोकल ऑडियंस रीच)\n2. 💻 Professional Website: ₹5,000 (रिस्पॉन्सिव बिज़नेस वेबसाइट, SEO, WhatsApp इंटीग्रेशन)\n3. 🌟 Premium Offer: ₹10,000 (वेबसाइट + 1 हफ़्ते का पूरा ऐड कैंपेन + वीडियो रील्स)\n4. 🚗 Sell Old Car by Ad: पुरानी गाड़ी बेचने के लिए स्पेशल वीडियो ऐड और बायर लीड्स।\n\nअधिक जानकारी या बुकिंग के लिए ऊपर 'Services' बटन दबाएं या WhatsApp (+91 9376124893) करें!`;
    }
    return `ClickCraft Official Services & Pricing:\n\n1. 🚀 Targeted Ads Campaign — ₹500 (1 complete campaign, custom graphic, targeted reach)\n2. 💻 Professional Website — ₹5,000 (Mobile responsive, SEO, WhatsApp chat, SSL)\n3. 🌟 Premium Offer — ₹10,000 (Complete Website + 1 Week Ads + Video Reels)\n4. 🚗 Sell Old Car by Ad — Fast buyer leads for pre-owned cars.\n\nContact us on WhatsApp: +91 9376124893!`;
  }

  // 5. Sell Old Car
  if (
    q.includes('car') ||
    q.includes('गाड़ी') ||
    q.includes('कार') ||
    q.includes('sell old car') ||
    q.includes('second hand') ||
    q.includes('purani gadi')
  ) {
    if (isHindi) {
      return `ClickCraft का 'Sell Old Car by Ad' सर्विस पुरानी गाड़ियों को जल्दी और सही कीमत पर बेचने का सबसे असरदार तरीका है:\n\n• बिना किसी डीलर या भारी कमीशन के सीधे असली खरीदारों तक पहुँच।\n• गाड़ी की फ़ोटो व वीडियो के साथ आकर्षक सोशल मीडिया ऐड।\n• आपके शहर और बजट के अनुसार खरीदारों को टारगेट किया जाता है।\n• सभी इंक्वायरी सीधे आपके फ़ोन और WhatsApp पर आती हैं।\n\nऐड बनवाने के लिए हमसे WhatsApp पर संपर्क करें: +91 9376124893।`;
    }
    return `ClickCraft's 'Sell Old Car by Ad' helps you sell your pre-owned vehicle directly to genuine buyers without middleman commissions:\n\n• Video/photo ads targeted to verified buyers in your city.\n• Zero commission fees.\n• Direct buyer phone calls and WhatsApp messages.\n• Contact WhatsApp +91 9376124893 to get started!`;
  }

  // 6. Contact & WhatsApp
  if (
    q.includes('contact') ||
    q.includes('whatsapp') ||
    q.includes('phone') ||
    q.includes('number') ||
    q.includes('संपर्क') ||
    q.includes('नंबर') ||
    q.includes('फोन') ||
    q.includes('कॉल')
  ) {
    if (isHindi) {
      return `ClickCraft से संपर्क करने की जानकारी:\n\n• WhatsApp: +91 9376124893 (wa.me/919376124893)\n• कॉल सपोर्ट: +91 9376124893\n• ईमेल: info@clickcraft.com\n• रेटिंग: 5.0 ★ (500+ संतुष्ट क्लाइंट्स)\n\nहमसे अभी WhatsApp पर जुड़कर अपने बिज़नेस की ग्रोथ शुरू करें! [REALTIME_CONSULTATION]`;
    }
    return `ClickCraft Official Contact Information:\n\n• WhatsApp: +91 9376124893 (wa.me/919376124893)\n• Phone Support: +91 9376124893\n• Email: info@clickcraft.com\n• Client Rating: 5.0 ★ (500+ Happy Clients)\n\nChat with our campaign experts today! [REALTIME_CONSULTATION]`;
  }

  // 7. About ClickCraft / Why Choose
  if (
    q.includes('about') ||
    q.includes('who are you') ||
    q.includes('clickcraft kya hai') ||
    q.includes('कौन हो') ||
    q.includes('कंपनी') ||
    q.includes('agency')
  ) {
    if (isHindi) {
      return `ClickCraft एक 5-स्टार रेटेड प्रीमियर डिजिटल मार्केटिंग एजेंसी है:\n\n• 500+ संतुष्ट क्लाइंट्स और 1,200+ सफल ऐड कैंपेन का अनुभव।\n• हम बिज़नेस के लिए टारगेटेड सोशल मीडिया ऐड्स (Meta, Google, YouTube), प्रोफेशनल वेबसाइट्स और क्रिएटिव स्ट्रैटेजी बनाते हैं।\n• पारदर्शी प्राइसिंग: ₹500 ऐड्स, ₹5,000 वेबसाइट, ₹10,000 कॉम्बो ऑफर।\n• संपर्क: +91 9376124893 (WhatsApp/Call)।`;
    }
    return `ClickCraft is a premier 5-star rated digital marketing agency:\n\n• 500+ happy clients and 1,200+ high-performing campaigns delivered.\n• Specialized in targeted Meta/Google ads, custom website development, and creative marketing funnels.\n• Transparent pricing: ₹500 Ads, ₹5,000 Website, ₹10,000 Premium Combo.\n• WhatsApp: +91 9376124893.`;
  }

  return null;
}
