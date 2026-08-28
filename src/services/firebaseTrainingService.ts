import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

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
 * Automatically seeds ClickCraft training data to Firebase Firestore
 */
export async function seedTrainingDataToFirestore(): Promise<{ success: boolean; count: number }> {
  try {
    let seededCount = 0;

    // Seed master company profile
    const profileRef = doc(db, 'company_profile', 'clickcraft_master');
    await setDoc(profileRef, {
      companyName: 'ClickCraft',
      tagline: 'Boost Your Business Online',
      description:
        'ClickCraft creates targeted digital ads that reach real customers and drive measurable business growth. From selling pre-owned cars to scaling local brands, ClickCraft delivers high-converting campaigns.',
      whatsapp: '+919376124893',
      phone: '+91 9376124893',
      email: 'info@clickcraft.com',
      happyClients: '500+',
      campaignsDelivered: '1200+',
      logoUrl: 'https://i.postimg.cc/MHZXGDHF/596701082-122110771671083682-4894056021958296740-n.jpg',
      updatedAt: new Date().toISOString(),
    });

    // Seed individual training data documents
    for (const item of CLICKCRAFT_MASTER_TRAINING_DATA) {
      const docRef = doc(db, 'training_data', item.id);
      await setDoc(docRef, item);
      seededCount++;
    }

    console.log(`[Firebase] Successfully synchronized ${seededCount} ClickCraft training records to Firestore!`);
    return { success: true, count: seededCount };
  } catch (error) {
    console.warn('[Firebase] Training data sync notice:', error);
    return { success: false, count: 0 };
  }
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
 * Fast direct response generator directly from Firebase Knowledge Base (No API key needed)
 */
export function findInstantFirebaseAnswer(rawQuery: string, lang = 'hi-IN'): string | null {
  if (!rawQuery || typeof rawQuery !== 'string') return null;
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
