import React from 'react';
import { Sparkles, User, Settings, Globe, Database, Grid, Key } from 'lucide-react';
import { POPULAR_LANGUAGES, AUTO_DETECT_LANGUAGE } from '../constants/languages';
import { Language } from '../types';

interface HeaderBarProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenProfile: () => void;
  onOpenWorkspace: () => void;
  onOpenSettings: () => void;
  onOpenApiKeys?: () => void;
  hasCustomKey?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenProfile,
  onOpenWorkspace,
  onOpenSettings,
  onOpenApiKeys,
  hasCustomKey = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#171717]/90 border-b border-[#2f2f2f] backdrop-blur-md px-3 sm:px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Left: Logo & Brand Title */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#212121] border border-orange-500/40 flex items-center justify-center shadow-inner text-base">
          🚀
        </div>
        <div>
          <h1 className="font-bold text-sm sm:text-base tracking-tight text-[#ECECF1] flex items-center gap-2">
            ClickCraft
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              AI Assistant
            </span>
          </h1>
          <p className="text-[10px] sm:text-xs text-orange-400 font-medium leading-none">
            Boost Your Business Online
          </p>
        </div>
      </div>

      {/* Right: WhatsApp, Phone, Language Selector, API Key Validator, Profile, Settings */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        {/* WhatsApp Direct Chat */}
        <a
          href="https://wa.me/919376124893?text=Hello%20ClickCraft%20Team%2C%20I%20want%20to%20know%20more%20about%20your%20digital%20marketing%20services"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
          title="WhatsApp ClickCraft Team (+919376124893)"
        >
          <span>💬</span>
          <span className="hidden sm:inline">WhatsApp</span>
        </a>

        {/* Call Link */}
        <a
          href="tel:+919376124893"
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
          title="Call ClickCraft (+91 9376124893)"
        >
          <span>📞</span>
          <span>Call</span>
        </a>

        {/* Language Selector */}
        <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#212121] border border-[#2f2f2f] text-xs font-semibold text-[#ECECF1]">
          <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <select
            value={currentLanguage.code}
            onChange={(e) => {
              if (e.target.value === 'auto') {
                onLanguageChange(AUTO_DETECT_LANGUAGE);
              } else {
                const found = POPULAR_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) onLanguageChange(found);
              }
            }}
            aria-label="Select Language"
            className="bg-transparent text-xs font-semibold text-[#ECECF1] focus:outline-none cursor-pointer max-w-[90px] sm:max-w-none"
          >
            <option value="en-US" className="bg-[#212121] text-[#ECECF1]">
              🇺🇸 English (US)
            </option>
            {POPULAR_LANGUAGES.filter((l) => l.code !== 'en-US').map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-[#212121] text-[#ECECF1]">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* API Key Validator Button */}
        {onOpenApiKeys && (
          <button
            onClick={onOpenApiKeys}
            aria-label="API Key Validator"
            className="relative p-2 rounded-xl bg-[#212121] border border-[#2f2f2f] text-[#ECECF1] hover:bg-[#2f2f2f] hover:border-cyan-500/50 transition-all focus:outline-none active:scale-95"
            title="API Key Validator (Gemini / Groq)"
          >
            <Key className="w-4 h-4 text-cyan-400" />
            {hasCustomKey && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#171717] animate-pulse" />
            )}
          </button>
        )}

        {/* Profile Button */}
        <button
          onClick={onOpenProfile}
          aria-label="Profile"
          className="p-2 rounded-xl bg-[#212121] border border-[#2f2f2f] text-[#ECECF1] hover:bg-[#2f2f2f] transition-all focus:outline-none active:scale-95"
          title="User Profile & Cloud SQL Settings"
        >
          <User className="w-4 h-4 text-purple-400" />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="p-2 rounded-xl bg-[#212121] border border-[#2f2f2f] text-[#ECECF1] hover:bg-[#2f2f2f] transition-all focus:outline-none active:scale-95"
          title="Voice & App Settings"
        >
          <Settings className="w-4 h-4 text-purple-400" />
        </button>
      </div>
    </header>
  );
};

