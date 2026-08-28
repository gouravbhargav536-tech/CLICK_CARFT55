import React from 'react';
import { POPULAR_LANGUAGES, AUTO_DETECT_LANGUAGE } from '../constants/languages';
import { POPULAR_AI_TOOLS } from '../constants/models';
import { Language, AIModelTool } from '../types';
import { Sparkles, Key, Settings, Globe, ArrowRightLeft, Menu, Activity, ShieldCheck, Download, FileText } from 'lucide-react';

interface HeaderDesktopBarProps {
  selectedModel: AIModelTool;
  onSelectModel: (model: AIModelTool) => void;
  sourceLang: Language;
  onSourceLangChange: (lang: Language) => void;
  targetLang: Language;
  onTargetLangChange: (lang: Language) => void;
  onSwapLanguages: () => void;
  onOpenApiKeyModal: () => void;
  onToggleSidebar: () => void;
  onExportHistory: () => void;
  onExportPdf: () => void;
  geminiActive: boolean;
}

export const HeaderDesktopBar: React.FC<HeaderDesktopBarProps> = ({
  selectedModel,
  onSelectModel,
  sourceLang,
  onSourceLangChange,
  targetLang,
  onTargetLangChange,
  onSwapLanguages,
  onOpenApiKeyModal,
  onToggleSidebar,
  onExportHistory,
  onExportPdf,
  geminiActive,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-lg">
      {/* Left section: Sidebar toggle & Logo */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors focus:outline-none"
          title="Toggle History Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AetherVoice
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PRO AI STREAM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center section: Language Route Selectors */}
      <div className="hidden md:flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-inner">
        {/* Source Language */}
        <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={sourceLang.code}
            onChange={(e) => {
              if (e.target.value === 'auto') onSourceLangChange(AUTO_DETECT_LANGUAGE);
              else {
                const found = POPULAR_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) onSourceLangChange(found);
              }
            }}
            className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="auto" className="bg-slate-900 text-slate-200">
              🌐 Auto Detect
            </option>
            {POPULAR_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <button
          onClick={onSwapLanguages}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all active:scale-95"
          title="Swap Languages"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* Target Language */}
        <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={targetLang.code}
            onChange={(e) => {
              const found = POPULAR_LANGUAGES.find((l) => l.code === e.target.value);
              if (found) onTargetLangChange(found);
            }}
            className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
          >
            {POPULAR_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right section: AI Model Engine & Popular AI Tools / API Keys */}
      <div className="flex items-center space-x-2">
        {/* Gemini Active Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300">
          <Activity className={`w-3.5 h-3.5 ${geminiActive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
          <span>{geminiActive ? 'Gemini 3.6 Connected' : 'Local Fallback'}</span>
        </div>

        {/* Popular AI Models Selector */}
        <div className="relative">
          <select
            value={selectedModel.id}
            onChange={(e) => {
              const found = POPULAR_AI_TOOLS.find((m) => m.id === e.target.value);
              if (found) onSelectModel(found);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 focus:outline-none cursor-pointer hover:border-slate-700 transition-colors"
          >
            {POPULAR_AI_TOOLS.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                ⚡ {m.name} ({m.provider})
              </option>
            ))}
          </select>
        </div>

        {/* API Keys & Tools Modal Toggle */}
        <button
          onClick={onOpenApiKeyModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-400 hover:text-white hover:bg-blue-600/30 text-xs font-semibold transition-all shadow-md"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Keys & Ecosystem</span>
        </button>

        {/* Export PDF Report button */}
        <button
          onClick={onExportPdf}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition-all"
          title="Export Active Session PDF Report"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Export PDF</span>
        </button>

        {/* Export JSON backup button */}
        <button
          onClick={onExportHistory}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Backup Conversation History (JSON)"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
