import React, { useState } from 'react';
import { POPULAR_LANGUAGES } from '../constants/languages';
import { Language } from '../types';
import { ArrowRightLeft, Sparkles, Volume2, Copy, Check, Globe } from 'lucide-react';

interface QuickTranslationWidgetProps {
  onTranslateText: (text: string, sourceLang: string, targetLang: string) => Promise<any>;
  onPlaySpeech: (text: string, langCode?: string) => void;
}

export const QuickTranslationWidget: React.FC<QuickTranslationWidgetProps> = ({
  onTranslateText,
  onPlaySpeech,
}) => {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('es');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleQuickTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const srcName = sourceLang === 'auto' ? 'Auto Detect' : POPULAR_LANGUAGES.find((l) => l.code === sourceLang)?.name || 'English';
      const tgtName = POPULAR_LANGUAGES.find((l) => l.code === targetLang)?.name || 'Spanish';

      const res = await onTranslateText(text.trim(), srcName, tgtName);
      if (res && res.data) {
        setResult(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.translatedText) {
      navigator.clipboard.writeText(result.translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-5 rounded-3xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Quick Text & Voice Translator</span>
        </div>

        {/* Quick Language Selectors */}
        <div className="flex items-center space-x-2 text-xs">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none"
          >
            <option value="auto">🌐 Auto Detect</option>
            {POPULAR_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>

          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none"
          >
            {POPULAR_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter word, sentence or phrase for instant AI translation..."
          onKeyDown={(e) => e.key === 'Enter' && handleQuickTranslate()}
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />

        <button
          onClick={handleQuickTranslate}
          disabled={loading || !text.trim()}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-semibold text-xs disabled:opacity-40 shadow-md flex items-center space-x-1"
        >
          {loading ? (
            <span className="animate-spin">⌛</span>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Translate</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Result Output */}
      {result && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400">
              {result.detectedLanguage ? `Detected: ${result.detectedLanguage}` : 'Result'}
            </span>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => onPlaySpeech(result.translatedText, targetLang)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                title="Listen to translation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title="Copy text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-base font-bold text-white">{result.translatedText}</p>

          {result.phoneticSpelling && (
            <p className="text-xs font-mono text-amber-400">Phonetic: {result.phoneticSpelling}</p>
          )}
        </div>
      )}
    </div>
  );
};
