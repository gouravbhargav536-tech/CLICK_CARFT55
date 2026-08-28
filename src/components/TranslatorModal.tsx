import React, { useState } from 'react';
import { X, Languages, ArrowRightLeft, Sparkles, Volume2 } from 'lucide-react';
import { POPULAR_LANGUAGES, AUTO_DETECT_LANGUAGE } from '../constants/languages';
import { Language } from '../types';

interface TranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceLang: Language;
  onSourceLangChange: (lang: Language) => void;
  targetLang: Language;
  onTargetLangChange: (lang: Language) => void;
  onTranslateText: (text: string, source: string, target: string) => Promise<any>;
  onPlaySpeech: (text: string, langCode?: string) => void;
}

export const TranslatorModal: React.FC<TranslatorModalProps> = ({
  isOpen,
  onClose,
  sourceLang,
  onSourceLangChange,
  targetLang,
  onTargetLangChange,
  onTranslateText,
  onPlaySpeech,
}) => {
  const [inputText, setInputText] = useState('');
  const [translationResult, setTranslationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const res = await onTranslateText(inputText.trim(), sourceLang.name, targetLang.name);
      if (res && res.data) {
        setTranslationResult(res.data);
      }
    } catch (err) {
      console.error('Translation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    if (sourceLang.code === 'auto') {
      onSourceLangChange(targetLang);
      onTargetLangChange(POPULAR_LANGUAGES[0]);
    } else {
      const temp = sourceLang;
      onSourceLangChange(targetLang);
      onTargetLangChange(temp);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#212121] border border-[#2f2f2f] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2f2f2f] flex items-center justify-between bg-[#171717]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#10A37F]/20 flex items-center justify-center text-[#10A37F]">
              <Languages className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#ECECF1]">AetherVoice Real-time Translator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9B9B9B] hover:text-[#ECECF1] hover:bg-[#2f2f2f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Selectors */}
        <div className="p-4 border-b border-[#2f2f2f] bg-[#171717] flex items-center justify-between gap-2">
          <select
            value={sourceLang.code}
            onChange={(e) => {
              if (e.target.value === 'auto') onSourceLangChange(AUTO_DETECT_LANGUAGE);
              else {
                const found = POPULAR_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) onSourceLangChange(found);
              }
            }}
            className="flex-1 p-2 rounded-xl bg-[#212121] border border-[#2f2f2f] text-xs font-semibold text-[#ECECF1] focus:outline-none"
          >
            <option value="auto">🌐 Auto Detect</option>
            {POPULAR_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSwap}
            className="p-2 rounded-xl bg-[#212121] border border-[#2f2f2f] text-[#10A37F] hover:bg-[#2f2f2f]"
            title="Swap Languages"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <select
            value={targetLang.code}
            onChange={(e) => {
              const found = POPULAR_LANGUAGES.find((l) => l.code === e.target.value);
              if (found) onTargetLangChange(found);
            }}
            className="flex-1 p-2 rounded-xl bg-[#212121] border border-[#2f2f2f] text-xs font-semibold text-[#ECECF1] focus:outline-none"
          >
            {POPULAR_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Input & Output */}
        <div className="p-5 space-y-4 bg-[#171717]">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            placeholder="Type or paste text to translate..."
            className="w-full p-3 rounded-2xl bg-[#212121] border border-[#2f2f2f] text-xs font-medium text-[#ECECF1] placeholder-[#9B9B9B] focus:outline-none focus:border-[#10A37F]"
          />

          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-2.5 rounded-xl bg-[#10A37F] hover:bg-[#0d8a6c] disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Translating...' : 'Translate Instantly'}</span>
          </button>

          {translationResult && (
            <div className="p-4 rounded-2xl bg-[#10A37F]/10 border border-[#10A37F]/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#10A37F]">Translation ({targetLang.name})</span>
                <button
                  onClick={() => onPlaySpeech(translationResult.translatedText, targetLang.speechCode)}
                  className="p-1 rounded-lg bg-[#10A37F]/20 text-[#10A37F] hover:bg-[#10A37F]/30 flex items-center space-x-1 px-2"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Listen</span>
                </button>
              </div>

              <p className="text-sm font-semibold text-[#ECECF1]">
                {translationResult.translatedText}
              </p>

              {translationResult.phoneticSpelling && (
                <p className="text-[11px] text-[#9B9B9B] italic">
                  Pronunciation: {translationResult.phoneticSpelling}
                </p>
              )}

              {translationResult.culturalNotes && (
                <p className="text-[10px] text-[#10A37F]/80 pt-1 border-t border-[#10A37F]/20">
                  Note: {translationResult.culturalNotes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
