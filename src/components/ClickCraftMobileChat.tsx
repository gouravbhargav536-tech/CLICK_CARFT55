import React, { useRef, useEffect, useState } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Sparkles,
  Phone,
  ArrowRight,
  Database,
  Wifi,
  WifiOff,
  ShoppingBag,
  CreditCard,
  Zap,
  ChevronDown,
  Square,
  ExternalLink,
  Maximize2,
  Eye,
  X,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { POPULAR_LANGUAGES } from '../constants/languages';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { ServicesModal, CLICKCRAFT_SERVICES, ServicePackage } from './ServicesModal';
import { ServicesShowcaseCard } from './ServicesShowcaseCard';
import { MarketingBannerStrip } from './MarketingBannerStrip';

const COMPANY_LOGO_URL = 'https://i.postimg.cc/MHZXGDHF/596701082-122110771671083682-4894056021958296740-n.jpg';

interface ClickCraftMobileChatProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  activeSpeakingId?: string | null;
  inputText: string;
  onInputChange: (text: string) => void;
  onSendMessage: (text?: string) => void;
  onToggleVoice: () => void;
  onPlayAudio?: (text: string, msgId?: string) => void;
  onStopAudio?: () => void;
  onClearHistory: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

// Quick Suggestion Topics for ClickCraft
const QUICK_PROMPTS = [
  { label: '🔹 Website Sample', query: 'Website Design Sample दिखाओ' },
  { label: '🔹 Ad Sample', query: 'Ad Design Sample दिखाओ' },
  { label: '🔹 Portfolio', query: 'Portfolio और पिछला काम दिखाओ' },
  { label: '🔹 Before/After', query: 'Before/After Result दिखाओ' },
  { label: '🛍️ Services & Pricing', query: 'अपनी सभी सर्विसेज़ और प्राइसिंग (₹500 Ads, ₹5,000 Web, ₹10,000 Combo) के बारे में बताएं।' },
  { label: '📞 Contact Owner', query: 'ClickCraft के owner से सीधे कैसे संपर्क करें?' },
];

export const ClickCraftMobileChat: React.FC<ClickCraftMobileChatProps> = ({
  messages,
  isStreaming,
  isListening,
  isThinking,
  isSpeaking,
  activeSpeakingId,
  inputText,
  onInputChange,
  onSendMessage,
  onToggleVoice,
  onPlayAudio,
  onStopAudio,
  onClearHistory,
  currentLanguage,
  onLanguageChange,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(true);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Network connection status monitoring
  const { isOnline, justReconnected } = useNetworkStatus();

  const extractImageUrls = (text: string) => {
    // Check for [SAMPLE_IMAGE: url] tag first
    const tagMatch = text.match(/\[SAMPLE_IMAGE:\s*(https?:\/\/[^\s\]]+)\]/i);
    if (tagMatch && tagMatch[1]) {
      return [tagMatch[1]];
    }

    const urlRegex = /(https?:\/\/[^\s\)\<\>\"\'\]]+\.(?:jpg|jpeg|png|webp|gif))/gi;
    const matches = text.match(urlRegex);
    // Guarantee only the single most relevant requested image is shown (dont give all images)
    return matches && matches.length > 0 ? [matches[0]] : [];
  };

  const getImageMeta = (url: string) => {
    if (url.includes('web-design-transformation')) {
      return {
        title: 'Professional Website Design Sample',
        category: 'Buy Web (₹5,000)',
        badge: 'Website Transformation',
        desc: 'आधुनिक मोबाइल-रिस्पॉन्सिव लेआउट, फ़ास्ट लोडिंग स्पीड, इन-बिल्ट SEO, और WhatsApp चैट बटन के साथ बिज़नेस वेबसाइट।',
        features: ['100% Mobile Responsive', 'Fast Page Load', 'SEO & WhatsApp Ready', 'SSL Secure'],
      };
    }
    if (url.includes('image-c8a91ffd')) {
      return {
        title: 'Targeted Ad Creative Sample',
        category: 'Buy Ads (₹500)',
        badge: 'Social Media Ad',
        desc: 'Instagram/Facebook के लिए हाई-ROI ऐड डिज़ाइन्स, बोल्ड टाइपोग्राफी, आकर्षक ऑफ़र और सीधे WhatsApp पर आने वाली कस्टमर लीड्स।',
        features: ['High-Converting Creative', 'Meta & Google Ads', 'Local Audience Targeting', 'Direct WhatsApp Leads'],
      };
    }
    if (url.includes('Screenshot-2026-09-01-204720')) {
      return {
        title: 'ClickCraft Live Client Portfolio',
        category: 'Portfolio Showcase',
        badge: 'Client Results',
        desc: '500+ संतुष्ट क्लाइंट्स के लिए बनाए गए लाइव प्रोजेक्ट्स, प्रीमियम ब्रांडिंग और रिजल्ट-ओरिएंटेड हाई-कन्वर्टिंग डिज़ाइन्स।',
        features: ['500+ Happy Clients', '1,200+ Campaigns Run', 'Proven 5-Star Track Record', 'Custom UI/UX'],
      };
    }
    return {
      title: 'ClickCraft Design Sample',
      category: 'Design Showcase',
      badge: 'Official Sample',
      desc: 'प्रोफेशनल डिजिटल मार्केटिंग व वेबसाइट डिज़ाइन सैंपल।',
      features: ['Custom Graphic Design', 'Optimized for Conversion'],
    };
  };

  // Auto-typing animation for "Type something to start..." and business questions
  const TYPING_PHRASES = [
    "Type something to start...",
    "How ClickCraft can help grow your business?",
    "Ask about ₹500 Ads or ₹5,000 Websites...",
    "Type something to start your campaign...",
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const [isTypingForward, setIsTypingForward] = useState(true);

  useEffect(() => {
    if (inputText) return;
    let timeout: NodeJS.Timeout;
    const currentTarget = TYPING_PHRASES[phraseIndex % TYPING_PHRASES.length];

    if (isTypingForward) {
      if (typedPlaceholder.length < currentTarget.length) {
        timeout = setTimeout(() => {
          setTypedPlaceholder(currentTarget.slice(0, typedPlaceholder.length + 1));
        }, 55);
      } else {
        timeout = setTimeout(() => {
          setIsTypingForward(false);
        }, 2000);
      }
    } else {
      if (typedPlaceholder.length > 0) {
        timeout = setTimeout(() => {
          setTypedPlaceholder(currentTarget.slice(0, typedPlaceholder.length - 1));
        }, 25);
      } else {
        timeout = setTimeout(() => {
          setPhraseIndex((prev) => (prev + 1) % TYPING_PHRASES.length);
          setIsTypingForward(true);
        }, 400);
      }
    }

    return () => clearTimeout(timeout);
  }, [typedPlaceholder, isTypingForward, inputText, phraseIndex]);

  const handleBuyDirect = (service: ServicePackage) => {
    setIsServicesModalOpen(true);
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, isThinking, isSpeaking]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isStreaming && !isThinking) {
        onSendMessage();
      }
    }
  };

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] sm:h-[94vh] sm:max-h-[890px] bg-[#111418] sm:rounded-[24px] sm:border sm:border-[#242A32] flex flex-col overflow-hidden text-white font-sans shadow-2xl relative">
      
      {/* ============================================================
          1. MINIMAL PROFESSIONAL HEADER BAR
          - Official Company Logo with gold accent ring (#D4A017)
          - "ClickCraft" + "Assistant" + "5.0 ★" gold rating badge
          - "Digital marketing help • Online" status dot
          - Right: Services pill + Language selector + Refresh
      ============================================================ */}
      <header className="px-4 py-3 bg-[#111418] border-b border-[#242A32] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          {/* Circular Company Logo with Gold Accent Ring */}
          <div className="relative shrink-0">
            <div
              id="clickcraft-avatar-icon"
              className={`w-11 h-11 rounded-full overflow-hidden border-2 border-[#D4A017] bg-[#181C22] flex items-center justify-center transition-all ${
                isSpeaking ? 'ring-2 ring-[#D4A017]/40 shadow-[0_0_12px_rgba(212,160,23,0.3)]' : 'shadow-md'
              }`}
              title="ClickCraft Official Logo"
            >
              {logoLoaded ? (
                <img
                  src={COMPANY_LOGO_URL}
                  alt="ClickCraft Logo"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoLoaded(false)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#D4A017] font-black text-sm">CC</span>
              )}
            </div>

            {/* Live Online Status Dot */}
            <span
              id="network-status-dot"
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111418] transition-all duration-300 ${
                !isOnline
                  ? 'bg-rose-500'
                  : 'bg-emerald-400'
              }`}
              title={!isOnline ? 'Offline Mode — No Internet' : 'Online & Connected'}
            />
          </div>

          {/* Assistant Title & Status */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <h1 className="text-[17px] sm:text-[18px] font-bold font-script-headline text-white text-luminous-white tracking-wide">
                ClickCraft
              </h1>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 leading-none">
              <span className="text-[14px] font-bold font-script-bold text-white text-bright-white tracking-wide">
                Assistant
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-[#181C22] text-[#D4A017] border border-[#D4A017]/40 flex items-center gap-0.5">
                <span>5.0</span>
                <span>★</span>
              </span>
            </div>
            <div className="text-[11.5px] font-normal text-[#B0B0B0] leading-tight mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Digital marketing help</span>
              <span className="text-[#606060]">•</span>
              
              {!isOnline ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-400">
                  <WifiOff className="w-2.5 h-2.5" />
                  Offline
                </span>
              ) : (
                <span className="text-emerald-400 text-[10.5px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Right Controls: Services + Language + Refresh */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Services Pill Button with thin gold border */}
          <button
            id="clickcraft-services-header-btn"
            onClick={() => setIsServicesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181C22] hover:bg-[#202630] text-white border border-[#D4A017]/50 hover:border-[#D4A017] text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="View Services & Buy Packages (₹500 / ₹5000 / ₹10000)"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
            <span>Services</span>
          </button>

          {/* Language Selector Pill */}
          <div className="relative flex items-center bg-[#181C22] rounded-full px-2.5 py-1.5 border border-[#242A32] text-xs hover:border-[#D4A017]/40 transition-colors shadow-sm">
            <Globe className="w-3.5 h-3.5 text-[#B0B0B0] mr-1 shrink-0" />
            <select
              value={currentLanguage.code}
              onChange={(e) => {
                const found = POPULAR_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) onLanguageChange(found);
              }}
              className="bg-transparent text-white text-[11px] font-medium outline-none cursor-pointer pr-3.5 appearance-none"
              title="Change Language"
            >
              <option value="hi-IN" className="bg-[#111418] text-white">हिन्दी</option>
              <option value="en-US" className="bg-[#111418] text-white">English</option>
              <option value="bn-IN" className="bg-[#111418] text-white">বাংলা</option>
              <option value="mr-IN" className="bg-[#111418] text-white">मराठी</option>
              <option value="gu-IN" className="bg-[#111418] text-white">ગુજરાતી</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#B0B0B0] absolute right-1.5 pointer-events-none" />
          </div>

          {/* Refresh / Clear Chat Icon Button */}
          <button
            onClick={onClearHistory}
            className="w-8 h-8 rounded-full bg-[#181C22] text-[#B0B0B0] hover:text-white hover:border-[#D4A017]/40 border border-[#242A32] transition-colors flex items-center justify-center shrink-0"
            title="Reset / Clear Conversation"
            aria-label="Clear chat history"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ============================================================
          2. MINIMAL GOLD STRIP (Single Line Text in Gold Color)
      ============================================================ */}
      <MarketingBannerStrip onBannerClick={() => setIsServicesModalOpen(true)} />

      {/* Subtle Offline Warning Banner */}
      {!isOnline && (
        <div
          id="offline-network-banner"
          className="bg-[#181C22] border-b border-rose-500/30 px-3.5 py-2 flex items-center justify-between text-xs text-rose-200 shrink-0"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            <span>इंटरनेट डिस्कनेक्ट हो गया है (Offline Mode)</span>
          </div>
          <span className="text-[10px] text-[#B0B0B0]">लोकल चैट उपलब्ध</span>
        </div>
      )}

      {/* ============================================================
          3. SCROLLABLE CHAT FEED (Dark Charcoal #111418 + Spacing)
      ============================================================ */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar bg-[#111418]">
        {/* Welcome Hero Content when chat is empty */}
        {messages.length === 0 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Master Welcome Hero Card */}
            <div className="flex flex-col items-start max-w-[96%]">
              <div className="bg-[#181C22] border border-[#242A32] text-[#B0B0B0] p-4 sm:p-5 rounded-[20px] rounded-tl-[4px] shadow-lg text-[13.5px] leading-relaxed sm:leading-7 w-full">
                {/* Hero Header with Logo */}
                <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#242A32]">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D4A017] bg-[#111418] shrink-0">
                    <img
                      src={COMPANY_LOGO_URL}
                      alt="ClickCraft"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-[17px] sm:text-[18px] font-bold font-script-headline text-white text-luminous-white leading-tight">
                      Hello! Welcome to ClickCraft.
                    </h2>
                    <p className="text-[12.5px] font-medium font-script-bold text-white/90 text-bright-white mt-0.5">
                      How can I assist you with your marketing growth today?
                    </p>
                  </div>
                </div>

                <p className="text-white/90 leading-relaxed text-xs sm:text-[13px] mb-3 font-medium">
                  We offer digital marketing services to help grow your business online, including:
                </p>

                <div className="space-y-2 text-xs sm:text-[12.5px] text-white bg-[#111418] p-3.5 rounded-xl border border-[#242A32] font-medium">
                  <div className="flex items-start gap-2">
                    <span className="text-[#D4A017] font-bold">•</span>
                    <span><strong className="text-white font-bold">Targeted Advertisement Campaigns</strong> starting at <strong className="text-[#D4A017] font-bold">₹500</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#D4A017] font-bold">•</span>
                    <span><strong className="text-white font-bold">Professional Website Development</strong> for <strong className="text-[#D4A017] font-bold">₹5,000</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#D4A017] font-bold">•</span>
                    <span><strong className="text-white font-bold">Premium Offer</strong> (Website + 1 Week Ads) for <strong className="text-[#D4A017] font-bold">₹10,000</strong></span>
                  </div>
                </div>

                {/* Data Synchronization Pill */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#A0A0A0] mt-3 pt-2.5 border-t border-[#242A32] font-medium">
                  <Database className="w-3 h-3 text-[#D4A017]" />
                  <span>Cloud Data Synced • 24/7 Agency AI</span>
                </div>
              </div>
              <span className="text-[11px] text-[#A0A0A0] mt-1 pl-1 font-semibold">ClickCraft AI • Ready</span>
            </div>

            {/* Official Services & Pricing Showcase with Buy Buttons */}
            <ServicesShowcaseCard
              onBuyService={handleBuyDirect}
              onOpenAllServices={() => setIsServicesModalOpen(true)}
            />

            {/* Quick Prompt Suggestions with Auto-Typing Featured Card */}
            <div className="pt-1 space-y-2.5">
              {/* Live Auto-Typing Prompt Card */}
              <button
                id="clickcraft-auto-typing-featured-card"
                onClick={() => onSendMessage(typedPlaceholder || TYPING_PHRASES[0])}
                className="w-full p-3 rounded-xl bg-[#111418] hover:bg-[#181C22] border border-[#D4A017]/80 hover:border-[#D4A017] transition-all flex items-center justify-between text-left group shadow-[0_0_14px_rgba(212,160,23,0.18)] active:scale-[0.99] cursor-pointer"
                title="Click to ask this question"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-6 h-6 rounded-lg bg-[#181C22] border border-[#D4A017]/60 flex items-center justify-center text-[#D4A017] shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center text-[15px] sm:text-[16px] font-bold font-script-bold text-white text-luminous-white truncate">
                    <span className="truncate">{typedPlaceholder || TYPING_PHRASES[0]}</span>
                    <span className="inline-block w-1.5 h-4 bg-[#D4A017] ml-0.5 animate-pulse shrink-0" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#D4A017] px-2.5 py-0.5 rounded-full bg-[#181C22] border border-[#D4A017]/40 shrink-0 group-hover:bg-[#D4A017] group-hover:text-[#111418] transition-colors">
                  Ask AI →
                </span>
              </button>

              <div className="flex items-center gap-1.5 px-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
                <p className="text-[11px] font-extrabold text-white uppercase tracking-wider">
                  सुझाए गए सवाल (Popular Topics)
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt.query)}
                    className="text-[12px] font-semibold px-3.5 py-1.5 rounded-full bg-[#181C22] hover:bg-[#202630] text-white hover:text-[#D4A017] border border-[#2E3642] hover:border-[#D4A017]/60 transition-all text-left flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <span>{prompt.label}</span>
                    <ArrowRight className="w-3 h-3 text-[#D4A017] opacity-80" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isThisMsgPlaying = isSpeaking && activeSpeakingId === msg.id;
          const hasRealtimeTag = msg.text.includes('[REALTIME_CONSULTATION]');
          
          // Extract single relevant image requested
          const extractedImages = !isUser ? extractImageUrls(msg.text) : [];

          // Clean text for speech and display: strip raw URLs, image tags, and link brackets
          const cleanText = msg.text
            .replace(/\[SAMPLE_IMAGE:\s*https?:\/\/[^\s\]]+\]/gi, '')
            .replace(/👉\s*यहाँ अपना[^\n\r]*👈/gi, '')
            .replace(/https?:\/\/[^\s\)\<\>\"\'\]]+\.(?:jpg|jpeg|png|webp|gif)/gi, '')
            .replace(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/gi, '')
            .replace(/\[REALTIME_CONSULTATION\]/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isUser ? 'items-end' : 'items-start'
              } animate-fadeIn`}
            >
              <div
                className={`flex gap-2.5 max-w-[92%] ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Assistant Circular Avatar */}
                {!isUser && (
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D4A017] bg-[#181C22] shrink-0 mt-1 shadow-sm">
                    <img
                      src={COMPANY_LOGO_URL}
                      alt="ClickCraft AI"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Message Bubble with High Readability Spacing & Pure White High Contrast Text */}
                <div
                  className={`p-4 sm:p-5 rounded-[20px] text-[14px] sm:text-[14.5px] leading-relaxed sm:leading-7 shadow-md relative ${
                    isUser
                      ? 'bg-[#181C22] border border-[#D4A017]/60 text-white font-semibold rounded-tr-[4px]'
                      : 'bg-[#181C22] border border-[#242A32] text-white font-medium rounded-tl-[4px]'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words font-medium text-white tracking-wide text-[14px] sm:text-[14.5px]">
                    {cleanText || (msg.isStreaming ? 'Typing response...' : '')}
                  </div>

                  {/* Render Single Requested Visual Sample Image Card with Rich Description */}
                  {extractedImages.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {extractedImages.map((imgUrl, imgIdx) => {
                        const meta = getImageMeta(imgUrl);
                        return (
                          <div
                            key={imgIdx}
                            className="rounded-2xl overflow-hidden border border-[#D4A017]/80 bg-[#111418] shadow-2xl group hover:border-[#D4A017] transition-all"
                          >
                            {/* Card Header with Category & Badge */}
                            <div className="p-3 bg-[#181C22] border-b border-[#242A32] flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-lg bg-[#D4A017]/20 border border-[#D4A017]/60 flex items-center justify-center text-[#D4A017] shrink-0">
                                  <ImageIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold text-white truncate">{meta.title}</span>
                              </div>
                              <span className="text-[10px] font-bold text-[#D4A017] px-2.5 py-0.5 rounded-full bg-[#111418] border border-[#D4A017]/50 shadow-inner">
                                {meta.category}
                              </span>
                            </div>
                            
                            {/* Clickable High-Res Image Container */}
                            <div
                              onClick={() => setActiveLightboxImage({ url: imgUrl, title: meta.title })}
                              className="relative cursor-pointer overflow-hidden bg-black/80 aspect-[16/10] flex items-center justify-center group/img"
                            >
                              <img
                                src={imgUrl}
                                alt={meta.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <span className="px-3.5 py-1.5 rounded-xl bg-[#111418]/95 text-white text-xs font-bold flex items-center gap-2 border border-[#D4A017] shadow-lg backdrop-blur-sm">
                                  <Eye className="w-3.5 h-3.5 text-[#D4A017]" />
                                  <span>View Full Image</span>
                                </span>
                              </div>
                            </div>

                            {/* Informative Description & Value Highlights in Crisp White */}
                            <div className="p-3.5 bg-[#14181E] border-t border-[#242A32] space-y-2.5">
                              <p className="text-[12.5px] font-medium text-white leading-relaxed">
                                {meta.desc}
                              </p>

                              {/* Feature tags */}
                              {meta.features && meta.features.length > 0 && (
                                <div className="grid grid-cols-2 gap-1.5 pt-1">
                                  {meta.features.map((feat, fIdx) => (
                                    <div
                                      key={fIdx}
                                      className="flex items-center gap-1.5 text-[11.5px] font-bold text-white bg-[#181C22] px-2.5 py-1.5 rounded-lg border border-[#2E3642]"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                                      <span className="truncate">{feat}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Action Footer */}
                              <div className="pt-2 flex items-center justify-between border-t border-[#242A32]">
                                <button
                                  onClick={() => setActiveLightboxImage({ url: imgUrl, title: meta.title })}
                                  className="text-[12px] text-[#D4A017] hover:underline flex items-center gap-1.5 font-bold"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                  <span>Zoom Preview</span>
                                </button>
                                <button
                                  onClick={() => setIsServicesModalOpen(true)}
                                  className="px-3.5 py-1.5 rounded-lg bg-[#D4A017] hover:bg-[#E5B228] text-[#111418] text-[12px] font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                                >
                                  <span>Order Package</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Interactive Buy Buttons Bar (When AI mentions services / pricing) */}
                  {!isUser && (cleanText.includes('500') || cleanText.includes('5000') || cleanText.includes('5,000') || cleanText.includes('10000') || cleanText.includes('10,000') || cleanText.toLowerCase().includes('website') || cleanText.toLowerCase().includes('advertisement') || cleanText.toLowerCase().includes('package') || cleanText.toLowerCase().includes('पैकेज') || cleanText.toLowerCase().includes('प्राइस') || cleanText.toLowerCase().includes('सर्विस')) && (
                    <div className="mt-3.5 p-3 rounded-xl bg-[#111418] border border-[#242A32] space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#D4A017]">
                        <span className="flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Buy Official Service Packages:</span>
                        </span>
                        <button
                          onClick={() => setIsServicesModalOpen(true)}
                          className="text-[10px] text-[#B0B0B0] hover:text-[#D4A017] underline"
                        >
                          View Details
                        </button>
                      </div>

                      {/* 3 Buttons: Same shape, size, dark background, thin gold border, Premium with subtle gold glow & Best Value badge */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => handleBuyDirect(CLICKCRAFT_SERVICES[0])}
                          className="py-2.5 px-3 rounded-xl bg-[#181C22] hover:bg-[#202630] border border-[#D4A017]/50 hover:border-[#D4A017] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-[#D4A017]" />
                          <span>Buy Ads (₹500)</span>
                        </button>

                        <button
                          onClick={() => handleBuyDirect(CLICKCRAFT_SERVICES[1])}
                          className="py-2.5 px-3 rounded-xl bg-[#181C22] hover:bg-[#202630] border border-[#D4A017]/50 hover:border-[#D4A017] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-[#D4A017]" />
                          <span>Buy Web (₹5,000)</span>
                        </button>

                        <button
                          onClick={() => handleBuyDirect(CLICKCRAFT_SERVICES[2])}
                          className="py-2.5 px-3 rounded-xl bg-[#181C22] hover:bg-[#202630] border border-[#D4A017] shadow-[0_0_12px_rgba(212,160,23,0.25)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 relative"
                        >
                          <Zap className="w-3.5 h-3.5 text-[#D4A017]" />
                          <span>Premium (₹10,000)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Real-time Data Consultation Card */}
                  {hasRealtimeTag && !isUser && (
                    <div className="mt-3.5 p-3.5 rounded-xl bg-[#111418] border border-[#D4A017]/40 text-[#B0B0B0] space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#D4A017]">
                        <Database className="w-4 h-4" />
                        <span>Agency Live Consultation Booking</span>
                      </div>
                      <p className="text-[11.5px] text-[#B0B0B0] leading-relaxed">
                        Ready to start your targeted campaigns or website development? Reach out directly to ClickCraft experts on WhatsApp:
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href="https://wa.me/919376124893?text=Hello%20ClickCraft%2C%20I%20want%20to%20discuss%20a%20marketing%20campaign"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181C22] text-[#D4A017] border border-[#D4A017]/60 hover:bg-[#D4A017] hover:text-[#111418] font-bold text-xs transition-all active:scale-95"
                        >
                          <span>WhatsApp (+919376124893)</span>
                        </a>
                        <a
                          href="tel:+919376124893"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181C22] text-white font-semibold text-xs hover:border-[#D4A017]/50 border border-[#242A32] transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#D4A017]" />
                          <span>Call Team</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Assistant Actions: Audio Player + Copy */}
                  {!isUser && cleanText && (
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#242A32] text-[11.5px] text-[#B0B0B0]">
                      {/* Audio Playback / Normal Stop Button */}
                      {onPlayAudio && (
                        <div>
                          {isThisMsgPlaying ? (
                            <button
                              id={`stop-msg-audio-${msg.id}`}
                              onClick={() => {
                                if (onStopAudio) onStopAudio();
                              }}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181C22] border border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017] hover:text-[#111418] font-semibold text-[11px] transition-all active:scale-95 cursor-pointer"
                              title="Stop Voice Playback"
                            >
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop (रोकें)</span>
                            </button>
                          ) : (
                            <button
                              id={`play-msg-audio-${msg.id}`}
                              onClick={() => onPlayAudio(cleanText, msg.id)}
                              className="flex items-center gap-1.5 hover:text-[#D4A017] text-[#B0B0B0] transition-colors font-medium cursor-pointer"
                              title="Listen with Voice"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-[#D4A017]" />
                              <span>Listen (आवाज़ सुनें)</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Copy Action */}
                      <button
                        onClick={() => handleCopy(msg.id, cleanText)}
                        className="hover:text-white transition-colors flex items-center gap-1 ml-auto"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#D4A017]" />
                            <span className="text-[#D4A017]">Copied</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#B0B0B0]" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <span
                className={`text-[10px] mt-1 px-2 ${
                  isUser ? 'text-[#707070]' : 'text-[#707070] pl-9'
                }`}
              >
                {msg.timestamp || 'Just now'}
              </span>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 max-w-[80%] bg-[#181C22] border border-[#242A32] text-[#B0B0B0] p-3.5 rounded-[20px] rounded-bl-[3px] text-[13px] animate-fadeIn">
            <div className="flex items-center gap-1 px-1">
              <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-xs font-medium text-white">ClickCraft AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Voice Assistant Speaking Banner */}
      {isSpeaking && (
        <div className="px-4 py-2 bg-[#181C22] border-t border-[#D4A017]/40 flex items-center justify-between animate-fadeIn shrink-0 shadow-lg z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4A017] animate-ping" />
            <span className="text-xs font-semibold text-white">आवाज़ चल रही है (Speaking...)</span>
          </div>
          <button
            id="clickcraft-normal-stop-btn"
            type="button"
            onClick={onStopAudio}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111418] border border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017] hover:text-[#111418] text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="Stop Assistant Voice (बोलना बंद करें)"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop (रोकें)</span>
          </button>
        </div>
      )}

      {/* ============================================================
          4. CLEAN MINIMAL CHAT INPUT BAR
      ============================================================ */}
      <footer className="p-3.5 bg-[#111418] border-t border-[#242A32] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputText.trim() && !isStreaming && !isThinking) {
              onSendMessage();
            }
          }}
          className="flex items-center gap-2"
        >
          {/* Pill Input Container */}
          <div className="relative flex-1 flex items-center bg-[#181C22] border border-[#242A32] focus-within:border-[#D4A017]/60 rounded-full p-1 transition-colors">
            {/* Auto-typing placeholder overlay when empty */}
            {inputText === '' && isOnline && (
              <div
                onClick={() => inputRef.current?.focus()}
                className="absolute left-4.5 pointer-events-none text-[15.5px] sm:text-[16px] font-bold font-script-bold text-white text-luminous-white flex items-center select-none overflow-hidden text-ellipsis whitespace-nowrap max-w-[calc(100%-60px)]"
              >
                <span>{typedPlaceholder || TYPING_PHRASES[0]}</span>
                <span className="inline-block w-1.5 h-4 bg-[#D4A017] ml-0.5 animate-pulse shrink-0" />
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={!isOnline ? "Offline mode — connect to send..." : ""}
              className="w-full bg-transparent text-white placeholder-[#707070] text-[13.5px] px-3.5 py-2 pr-10 outline-none font-normal relative z-10"
            />

            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={onToggleVoice}
              disabled={!isOnline}
              className={`absolute right-1.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                !isOnline
                  ? 'text-[#606060] cursor-not-allowed bg-transparent'
                  : isListening
                  ? 'bg-[#D4A017] text-[#111418] animate-pulse ring-2 ring-[#D4A017]/40'
                  : 'bg-[#111418] text-[#D4A017] border border-[#D4A017]/30 hover:border-[#D4A017]'
              }`}
              title={!isOnline ? 'Voice requires network' : isListening ? 'Listening (Click to Stop)' : 'Voice Input (बोलकर पूछें)'}
            >
              {isListening ? (
                <div className="flex items-center gap-0.5">
                  <span className="w-0.5 h-3 bg-[#111418] animate-pulse" />
                  <span className="w-0.5 h-4 bg-[#111418] animate-pulse [animation-delay:0.2s]" />
                  <span className="w-0.5 h-2 bg-[#111418] animate-pulse [animation-delay:0.4s]" />
                </div>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Gold Send Button */}
          <button
            id="clickcraft-send-btn"
            type="submit"
            disabled={!inputText.trim() || isStreaming || isThinking || !isOnline}
            className="w-11 h-11 rounded-full bg-[#D4A017] text-[#111418] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 hover:bg-[#c29214] hover:scale-105 active:scale-95 shadow-md font-bold"
            title={!isOnline ? 'Offline: Internet connection required' : 'Send message'}
            aria-label="Send question"
          >
            <Send className="w-4 h-4 fill-current stroke-current transform translate-x-0.5 -translate-y-0.5" />
          </button>
        </form>
      </footer>

      {/* ============================================================
          5. FOOTER: MINIMAL GOLD SOCIAL ICONS
      ============================================================ */}
      <div className="py-2.5 px-8 bg-[#111418] border-t border-[#242A32] flex items-center justify-center gap-12 shrink-0">
        {/* WhatsApp */}
        <a
          href="https://wa.me/919376124893?text=Hello%20ClickCraft%20Team%2C%20I%20want%20to%20know%20more%20about%20your%20digital%20marketing%20services"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D4A017] hover:text-white transition-all transform hover:scale-110 p-1 flex items-center justify-center"
          title="WhatsApp ClickCraft Team (+919376124893)"
          aria-label="WhatsApp"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.075-1.135-.065-.279-.088-.636-.214-1.096-.412-1.933-.833-3.197-2.784-3.294-2.913-.098-.129-.785-1.043-.785-1.989 0-.947.496-1.412.673-1.605.176-.193.385-.242.513-.242.129 0 .257.002.368.007.119.006.279-.045.437.335.163.392.557 1.356.606 1.455.049.099.082.215.016.345-.065.13-.098.212-.196.326-.098.115-.207.256-.296.344-.099.098-.202.204-.087.401.115.197.511.844 1.096 1.365.753.67 1.388.877 1.585.975.197.098.312.082.427-.049.115-.131.492-.573.623-.769.131-.196.262-.164.443-.098.181.066 1.147.541 1.344.64.197.098.328.147.377.229.049.083.049.48-.095.885zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.66 1.448 5.174L2 22l4.961-1.398A9.948 9.948 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.154c-1.636 0-3.161-.489-4.444-1.328l-.319-.208-2.946.83.826-2.868-.224-.338A8.118 8.118 0 013.846 12c0-4.496 3.658-8.154 8.154-8.154 4.496 0 8.154 3.658 8.154 8.154 0 4.496-3.658 8.154-8.154 8.154z" />
          </svg>
        </a>

        {/* Instagram */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D4A017] hover:text-white transition-all transform hover:scale-110 p-1 flex items-center justify-center"
          title="Instagram"
          aria-label="Instagram"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>

        {/* Facebook */}
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D4A017] hover:text-white transition-all transform hover:scale-110 p-1 flex items-center justify-center"
          title="Facebook"
          aria-label="Facebook"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
          </svg>
        </a>
      </div>

      {/* ============================================================
          6. OFFICIAL SERVICES & PACKAGES MODAL WITH BUY / CHECKOUT
      ============================================================ */}
      <ServicesModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
      />

      {/* ============================================================
          7. IMAGE SAMPLE LIGHTBOX MODAL
      ============================================================ */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] bg-[#111418] border border-[#D4A017] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-[#181C22] border-b border-[#242A32] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#D4A017]/20 border border-[#D4A017] flex items-center justify-center text-[#D4A017]">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white truncate">{activeLightboxImage.title}</h3>
                  <p className="text-[11px] text-[#A0A0A0]">ClickCraft Official Design Sample</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveLightboxImage(null)}
                  className="p-2 rounded-xl bg-[#181C22] hover:bg-[#202630] text-white hover:text-[#D4A017] border border-[#242A32] hover:border-[#D4A017]/50 transition-colors"
                  aria-label="Close image preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Preview Container */}
            <div className="p-3 bg-black flex items-center justify-center overflow-auto max-h-[70vh]">
              <img
                src={activeLightboxImage.url}
                alt={activeLightboxImage.title}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>

            {/* Footer Action */}
            <div className="p-3.5 bg-[#181C22] border-t border-[#242A32] flex items-center justify-between text-xs">
              <span className="text-white font-medium">Like this design? We can build this for your brand!</span>
              <button
                onClick={() => {
                  setActiveLightboxImage(null);
                  setIsServicesModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#D4A017] hover:bg-[#E5B228] text-[#111418] font-bold transition-all shadow-md active:scale-95"
              >
                Order This Package →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
