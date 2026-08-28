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
  { label: '🛍️ Services & Pricing', query: 'ClickCraft की सभी सर्विसेज़ और प्राइसिंग लिस्ट बताएं (500 Ads, 5000 Website, 10000 Combo).' },
  { label: '🚀 Ads Package (₹500)', query: '₹500 वाले Advertisement Campaign पैकेज में क्या-क्या मिलता है और इसे कैसे खरीदें?' },
  { label: '💻 Website (₹5,000)', query: '₹5,000 वाले Professional Website Development पैकेज की पूरी जानकारी और फीचर्स बताएं।' },
  { label: '🌟 Premium Offer (₹10,000)', query: '₹10,000 वाले Premium Offer (Website + 1 Week Ads) के बारे में बताएं और इसे कैसे बुक करें?' },
  { label: '🚗 Sell Old Car Ads', query: 'पुरानी कार बेचने के लिए ऐड कैसे बनाएं? Sell Old Car by Ad के बारे में बताएं।' },
  { label: '📞 Contact & WhatsApp', query: 'ClickCraft टीम का WhatsApp नंबर, कॉल नंबर और संपर्क जानकारी क्या है?' },
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

  // Network connection status monitoring
  const { isOnline, justReconnected } = useNetworkStatus();

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
    <div className="w-full max-w-md mx-auto h-[100dvh] sm:h-[94vh] sm:max-h-[890px] bg-[#0E1724] sm:rounded-[30px] sm:border sm:border-[#2D3A4B]/90 flex flex-col overflow-hidden text-white font-sans shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative">
      
      {/* ============================================================
          1. HIGH-GRAPHIC HEADER BAR (Matching screenshot reference)
          - Official Company Logo with golden accent ring
          - "ClickCraft" + "Assistant" + "5.0 ★" gold pill badge
          - "Digital marketing help • 🟢 Online"
          - Right: Services pill + Language selector + Refresh
      ============================================================ */}
      <header className="px-3.5 py-3 bg-[#1A222F]/95 backdrop-blur-md border-b border-[#283648] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          {/* Circular Company Logo with Glowing Gold Ring */}
          <div className="relative shrink-0">
            <div
              id="clickcraft-avatar-icon"
              className={`w-11 h-11 rounded-full overflow-hidden border-2 border-[#E8B923] bg-[#161F33] flex items-center justify-center transition-all ${
                isSpeaking ? 'ring-4 ring-[#E8B923]/40 animate-voice-glow' : 'shadow-md shadow-black/60'
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
                <span className="text-[#E8B923] font-black text-sm">CC</span>
              )}
            </div>

            {/* Live Online / Offline Status Indicator with animated state */}
            <span
              id="network-status-dot"
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1A222F] transition-all duration-300 ${
                !isOnline
                  ? 'bg-rose-500 ring-2 ring-rose-400/40 animate-pulse'
                  : isSpeaking
                  ? 'bg-[#E8B923] animate-ping'
                  : isListening
                  ? 'bg-rose-500 animate-pulse'
                  : 'bg-emerald-400'
              }`}
              title={!isOnline ? 'Offline Mode — No Internet' : 'Online & Connected'}
            />
          </div>

          {/* Assistant Title & Agency Badge */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <h1 className="text-[14.5px] font-bold text-white tracking-tight">
                ClickCraft
              </h1>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 leading-none">
              <span className="text-[13.5px] font-bold text-white tracking-tight">
                Assistant
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-[#141C2B] text-[#E8B923] border border-[#E8B923]/50 flex items-center gap-0.5 shadow-sm">
                <span>5.0</span>
                <span>★</span>
              </span>
            </div>
            <div className="text-[11.5px] font-normal text-[#94A3B8] leading-tight mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Digital marketing help</span>
              <span className="text-[#64748B]">•</span>
              
              {/* Network status text indicator */}
              {!isOnline ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
                  <WifiOff className="w-2.5 h-2.5" />
                  Offline
                </span>
              ) : justReconnected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 animate-fadeIn">
                  <Wifi className="w-2.5 h-2.5" />
                  Back Online
                </span>
              ) : (
                <span className="text-emerald-400 text-[10.5px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Right Controls: Services Pill + Language Selector Pill + Refresh Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Services Pill Button (Matching Plum/Purple Tint in Screenshot) */}
          <button
            id="clickcraft-services-header-btn"
            onClick={() => setIsServicesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#382C4E]/90 hover:bg-[#483764] text-white border border-[#9065E0]/40 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="View Services & Buy Packages (₹500 / ₹5000 / ₹10000)"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-200 shrink-0" />
            <span>Services</span>
          </button>

          {/* Language Selector Pill */}
          <div className="relative flex items-center bg-[#242A3B]/90 rounded-full px-2.5 py-1.5 border border-[#475569]/50 text-xs hover:border-[#E8B923]/60 transition-colors shadow-sm">
            <Globe className="w-3.5 h-3.5 text-slate-300 mr-1 shrink-0" />
            <select
              value={currentLanguage.code}
              onChange={(e) => {
                const found = POPULAR_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) onLanguageChange(found);
              }}
              className="bg-transparent text-white text-[11px] font-medium outline-none cursor-pointer pr-3.5 appearance-none"
              title="Change Language"
            >
              <option value="hi-IN" className="bg-[#1A222F] text-white">हिन्दी</option>
              <option value="en-US" className="bg-[#1A222F] text-white">English</option>
              <option value="bn-IN" className="bg-[#1A222F] text-white">বাংলা</option>
              <option value="mr-IN" className="bg-[#1A222F] text-white">मराठी</option>
              <option value="gu-IN" className="bg-[#1A222F] text-white">ગુજરાતી</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
          </div>

          {/* Refresh / Clear Chat Icon Button */}
          <button
            onClick={onClearHistory}
            className="w-8 h-8 rounded-full bg-[#242A3B]/90 text-[#94A3B8] hover:text-white hover:bg-[#323B52] border border-[#475569]/50 transition-colors flex items-center justify-center shrink-0"
            title="Reset / Clear Conversation"
            aria-label="Clear chat history"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ============================================================
          2. LUXURY MARKETING SHOWCASE BANNER STRIP (Under Header)
          - Geometric Analytics Matrix + "Premium Marketing. Redefined."
          - Real-time Campaign Performance Tablet Mockup
          - ClickCraft Official Medallion Badge
      ============================================================ */}
      <MarketingBannerStrip onBannerClick={() => setIsServicesModalOpen(true)} />

      {/* Subtle Offline Warning Banner */}
      {!isOnline && (
        <div
          id="offline-network-banner"
          className="bg-rose-950/80 border-b border-rose-500/30 px-3.5 py-2 flex items-center justify-between text-xs text-rose-200 animate-fadeIn shrink-0 backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>इंटरनेट डिस्कनेक्ट हो गया है (Offline Mode)</span>
          </div>
          <span className="text-[10px] text-rose-300">लोकल चैट उपलब्ध</span>
        </div>
      )}

      {/* ============================================================
          3. SCROLLABLE CHAT FEED (Rich Slate / Navy Luxury Bubbles)
      ============================================================ */}
      <main className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar bg-[#0E1724]">
        {/* Welcome Hero Content when chat is empty */}
        {messages.length === 0 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Master Welcome Hero Card */}
            <div className="flex flex-col items-start max-w-[95%]">
              <div className="bg-[#18222E] border border-[#273648] text-white p-4 rounded-[22px] rounded-tl-[4px] shadow-xl text-[13.5px] leading-relaxed w-full">
                {/* Hero Header with Logo */}
                <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-[#273648]">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-[#E8B923] bg-[#0B1220] shrink-0">
                    <img
                      src={COMPANY_LOGO_URL}
                      alt="ClickCraft"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white leading-tight">
                      Hello! Welcome to ClickCraft.
                    </h2>
                    <p className="text-[11px] text-[#94A3B8]">
                      How can I assist you with your marketing growth today?
                    </p>
                  </div>
                </div>

                <p className="text-white/95 leading-relaxed text-xs sm:text-[13px] mb-3">
                  We offer digital marketing services to help grow your business online, including:
                </p>

                <div className="space-y-1.5 text-xs sm:text-[12.5px] text-[#CBD5E1] bg-[#121A24] p-3 rounded-xl border border-[#222E3E]">
                  <div className="flex items-start gap-2">
                    <span className="text-[#E8B923] font-bold">•</span>
                    <span><strong className="text-white">Targeted Advertisement Campaigns</strong> starting at <strong className="text-[#E8B923]">₹500</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#E8B923] font-bold">•</span>
                    <span><strong className="text-white">Professional Website Development</strong> for <strong className="text-[#E8B923]">₹5,000</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#E8B923] font-bold">•</span>
                    <span><strong className="text-white">Premium Offer</strong> (Website + 1 Week Ads) for <strong className="text-[#E8B923]">₹10,000</strong></span>
                  </div>
                </div>

                {/* Firebase Synchronization Pill */}
                <div className="flex items-center gap-1.5 text-[10.5px] text-[#8A93A6] mt-3 pt-2 border-t border-[#273648]">
                  <Database className="w-3 h-3 text-[#E8B923]" />
                  <span>Cloud Data Synced • 24/7 Agency AI</span>
                </div>
              </div>
              <span className="text-[10.5px] text-[#8A93A6] mt-1 pl-1">ClickCraft AI • Ready</span>
            </div>

            {/* Official Services & Pricing Showcase with Buy Buttons */}
            <ServicesShowcaseCard
              onBuyService={handleBuyDirect}
              onOpenAllServices={() => setIsServicesModalOpen(true)}
            />

            {/* Quick Prompt Suggestions */}
            <div className="pt-1">
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <Sparkles className="w-3.5 h-3.5 text-[#E8B923]" />
                <p className="text-[11px] font-bold text-[#8A93A6] uppercase tracking-wider">
                  सुझाए गए सवाल (Popular Topics)
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt.query)}
                    className="text-[12px] px-3.5 py-1.5 rounded-full bg-[#18222E] hover:bg-[#223040] text-[#94A3B8] hover:text-[#E8B923] border border-[#273648] hover:border-[#E8B923]/40 transition-all text-left flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <span>{prompt.label}</span>
                    <ArrowRight className="w-3 h-3 opacity-60" />
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
          const cleanText = msg.text.replace(/\[REALTIME_CONSULTATION\]/g, '').trim();

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
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-[#E8B923] bg-[#161F33] shrink-0 mt-1 shadow-sm">
                    <img
                      src={COMPANY_LOGO_URL}
                      alt="ClickCraft AI"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-3.5 sm:p-4 rounded-[22px] text-[13.5px] leading-relaxed shadow-lg relative ${
                    isUser
                      ? 'bg-gradient-to-r from-[#0C3868] to-[#124B8B] border border-[#1E5C9E]/70 text-white rounded-tr-[4px]'
                      : 'bg-[#18222E] border border-[#273648] text-[#E2E8F0] rounded-tl-[4px]'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words font-normal">
                    {cleanText || (msg.isStreaming ? 'Typing response...' : '')}
                  </div>

                  {/* Interactive Buy Buttons Bar (When AI mentions services / pricing) */}
                  {!isUser && (cleanText.includes('500') || cleanText.includes('5000') || cleanText.includes('5,000') || cleanText.includes('10000') || cleanText.includes('10,000') || cleanText.toLowerCase().includes('website') || cleanText.toLowerCase().includes('advertisement') || cleanText.toLowerCase().includes('package') || cleanText.toLowerCase().includes('पैकेज') || cleanText.toLowerCase().includes('प्राइस') || cleanText.toLowerCase().includes('सर्विस')) && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#101824] border border-[#E8B923]/40 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#E8B923]">
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Buy Official Service Packages:</span>
                        </span>
                        <button
                          onClick={() => setIsServicesModalOpen(true)}
                          className="text-[10px] text-[#94A3B8] hover:text-white underline"
                        >
                          View Details
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        <button
                          onClick={() => handleBuyDirect(CLICKCRAFT_SERVICES[0])}
                          className="py-1.5 px-2 rounded-lg bg-[#18222E] hover:bg-[#243345] border border-blue-500/40 text-blue-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Buy Ads (₹500)</span>
                        </button>

                        <button
                          onClick={() => handleBuyDirect(CLICKCRAFT_SERVICES[1])}
                          className="py-1.5 px-2 rounded-lg bg-[#18222E] hover:bg-[#243345] border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Buy Web (₹5,000)</span>
                        </button>

                        <button
                          onClick={() => handleBuyDirect(CLICKCRAFT_SERVICES[2])}
                          className="py-1.5 px-2 rounded-lg bg-gradient-to-r from-[#E8B923] to-[#F5CE42] text-[#0B1220] text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all hover:brightness-105 active:scale-95 shadow-sm"
                        >
                          <Zap className="w-3 h-3 fill-current" />
                          <span>Premium (₹10,000)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Real-time Data Consultation Card */}
                  {hasRealtimeTag && !isUser && (
                    <div className="mt-3 p-3 rounded-[14px] bg-[#101824] border border-[#E8B923]/50 text-white space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#E8B923]">
                        <Database className="w-4 h-4" />
                        <span>Agency Live Consultation Booking</span>
                      </div>
                      <p className="text-[11.5px] text-[#94A3B8] leading-relaxed">
                        Ready to start your targeted campaigns or website development? Reach out directly to ClickCraft experts on WhatsApp:
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href="https://wa.me/919376124893?text=Hello%20ClickCraft%2C%20I%20want%20to%20discuss%20a%20marketing%20campaign"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E8B923] text-[#0B1220] font-bold text-[11.5px] hover:bg-[#d4a81f] transition-all shadow-md active:scale-95"
                        >
                          <span>WhatsApp (+919376124893)</span>
                        </a>
                        <a
                          href="tel:+919376124893"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#18222E] text-white font-semibold text-[11.5px] hover:bg-[#243345] transition-colors border border-[#8A93A6]/30"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#E8B923]" />
                          <span>Call Team</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Assistant Actions: Audio Player with Standard Normal Stop Button + Copy */}
                  {!isUser && cleanText && (
                    <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-white/10 text-[11.5px] text-[#8A93A6]">
                      {/* Audio Playback / Normal Stop Button */}
                      {onPlayAudio && (
                        <div>
                          {isThisMsgPlaying ? (
                            <button
                              id={`stop-msg-audio-${msg.id}`}
                              onClick={() => {
                                if (onStopAudio) onStopAudio();
                              }}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] transition-all active:scale-95 shadow-sm cursor-pointer"
                              title="Stop Voice Playback"
                            >
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop (रोकें)</span>
                            </button>
                          ) : (
                            <button
                              id={`play-msg-audio-${msg.id}`}
                              onClick={() => onPlayAudio(cleanText, msg.id)}
                              className="flex items-center gap-1.5 hover:text-[#E8B923] text-[#94A3B8] transition-colors font-medium cursor-pointer"
                              title="Listen with Natural Female Voice"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-[#E8B923]" />
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
                            <Check className="w-3.5 h-3.5 text-[#E8B923]" />
                            <span className="text-[#E8B923]">Copied</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <span
                className={`text-[10px] mt-1 px-2 ${
                  isUser ? 'text-[#8A93A6]' : 'text-[#8A93A6] pl-9'
                }`}
              >
                {msg.timestamp || 'Just now'}
              </span>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 max-w-[80%] bg-[#18222E] border border-[#273648] text-[#94A3B8] p-3.5 rounded-[22px] rounded-bl-[3px] text-[13px] animate-fadeIn">
            <div className="flex items-center gap-1 px-1">
              <span className="w-2 h-2 rounded-full bg-[#E8B923] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#E8B923] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#E8B923] animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-xs font-medium text-white/90">ClickCraft AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Normal Clear Stop Button Banner when Voice Assistant is Speaking */}
      {isSpeaking && (
        <div className="px-4 py-2 bg-[#131D2A] border-t border-[#E8B923]/40 flex items-center justify-between animate-fadeIn shrink-0 shadow-lg z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8B923] animate-ping" />
            <span className="text-xs font-semibold text-white">आवाज़ चल रही है (Speaking...)</span>
          </div>
          <button
            id="clickcraft-normal-stop-btn"
            type="button"
            onClick={onStopAudio}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            title="Stop Assistant Voice (बोलना बंद करें)"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop (रोकें)</span>
          </button>
        </div>
      )}

      {/* ============================================================
          4. FLOATING GLASS INPUT BAR WITH NEON BLUE GLOW & TEAL SEND
      ============================================================ */}
      <footer className="p-3.5 bg-[#131D2A]/95 border-t border-[#233346] backdrop-blur-md shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputText.trim() && !isStreaming && !isThinking) {
              onSendMessage();
            }
          }}
          className="flex items-center gap-2"
        >
          {/* Floating Pill with Cyan/Blue Neon Rim */}
          <div className="relative flex-1 flex items-center bg-[#172332] border border-[#2B5488] rounded-[24px] p-1 shadow-[0_0_20px_rgba(30,85,150,0.25)] ring-1 ring-[#2B5488]/40">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={!isOnline ? "Offline mode — connect to send..." : "Type your marketing question..."}
              className="w-full bg-transparent text-white placeholder-[#78889E] text-[13.5px] px-3.5 py-2 pr-10 outline-none font-normal"
            />

            {/* Voice Mic Button (Teal-Emerald Glowing Circle) */}
            <button
              type="button"
              onClick={onToggleVoice}
              disabled={!isOnline}
              className={`absolute right-1.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                !isOnline
                  ? 'text-[#475569] cursor-not-allowed bg-transparent'
                  : isListening
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                  : 'bg-[#103D3D] text-[#34D399] border border-[#14B8A6]/40 hover:bg-[#144E4E]'
              }`}
              title={!isOnline ? 'Voice requires network' : isListening ? 'Listening (Click to Stop)' : 'Voice Input (बोलकर पूछें)'}
            >
              {isListening ? (
                <div className="flex items-center gap-0.5">
                  <span className="w-0.5 h-3 bg-white animate-pulse" />
                  <span className="w-0.5 h-4 bg-white animate-pulse [animation-delay:0.2s]" />
                  <span className="w-0.5 h-2 bg-white animate-pulse [animation-delay:0.4s]" />
                </div>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Luxury Circular Teal-Emerald Send Button with Golden Arrow */}
          <button
            id="clickcraft-send-btn"
            type="submit"
            disabled={!inputText.trim() || isStreaming || isThinking || !isOnline}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[#126460] via-[#0E4F4C] to-[#0A3937] border border-[#14B8A6]/60 text-[#E8B923] flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 hover:scale-105 active:scale-95 shadow-lg shadow-[#0E4F4C]/40"
            title={!isOnline ? 'Offline: Internet connection required' : 'Send message'}
            aria-label="Send question"
          >
            <Send className="w-4 h-4 fill-current stroke-current transform translate-x-0.5 -translate-y-0.5" />
          </button>
        </form>
      </footer>

      {/* ============================================================
          5. FOOTER: METALLIC BRONZE-GOLD EMBOSSED SOCIAL ICONS
      ============================================================ */}
      <div className="py-2.5 px-8 bg-[#111A26] border-t border-[#233346]/60 flex items-center justify-center gap-14 shrink-0 shadow-inner">
        {/* WhatsApp */}
        <a
          href="https://wa.me/919376124893?text=Hello%20ClickCraft%20Team%2C%20I%20want%20to%20know%20more%20about%20your%20digital%20marketing%20services"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D4AF37] hover:text-white transition-all transform hover:scale-110 p-1 flex items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
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
          className="text-[#D4AF37] hover:text-white transition-all transform hover:scale-110 p-1 flex items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
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
          className="text-[#D4AF37] hover:text-white transition-all transform hover:scale-110 p-1 flex items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
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
    </div>
  );
};
