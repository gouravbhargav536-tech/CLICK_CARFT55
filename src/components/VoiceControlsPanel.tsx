import React, { useState } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Radio, Sparkles, Zap, Command } from 'lucide-react';

interface VoiceControlsPanelProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmitText: (text: string) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  handsFree: boolean;
  onToggleHandsFree: () => void;
  mode: 'translator' | 'chat';
  onModeChange: (mode: 'translator' | 'chat') => void;
  onOpenVoiceCommands?: () => void;
}

export const VoiceControlsPanel: React.FC<VoiceControlsPanelProps> = ({
  isListening,
  isSpeaking,
  isThinking,
  onStartListening,
  onStopListening,
  onSubmitText,
  autoSpeak,
  onToggleAutoSpeak,
  handsFree,
  onToggleHandsFree,
  mode,
  onModeChange,
  onOpenVoiceCommands,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmitText(inputText.trim());
    setInputText('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2 space-card-glass p-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => onModeChange('translator')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'translator'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-purple-300" />
            <span className="space-text-glow">Real-time Live Translator</span>
          </button>

          <button
            onClick={() => onModeChange('chat')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'chat'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span className="space-text-glow">Conversational Voice AI</span>
          </button>
        </div>

        {/* Quick Toggles: Auto Speak, Hands-Free & Voice Commands */}
        <div className="hidden sm:flex items-center space-x-3 text-xs">
          {onOpenVoiceCommands && (
            <button
              onClick={onOpenVoiceCommands}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border bg-purple-500/15 border-purple-500/40 text-purple-200 hover:text-white hover:bg-purple-500/30 transition-all font-semibold space-text-glow shadow-sm"
              title="View Voice Command Shortcuts"
            >
              <Command className="w-3.5 h-3.5 text-purple-300" />
              <span>Voice Commands</span>
            </button>
          )}

          <button
            onClick={onToggleAutoSpeak}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              autoSpeak
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
                : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-purple-300" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Auto Voice</span>
          </button>

          <button
            onClick={onToggleHandsFree}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              handsFree
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
                : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-300" />
            <span>Hands-Free</span>
          </button>
        </div>
      </div>


      {/* Input Form Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            mode === 'translator'
              ? 'Type or speak anything to translate in real-time...'
              : 'Ask AetherVoice anything or speak your request...'
          }
          className="w-full pl-5 pr-28 py-4 text-sm rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 shadow-2xl transition-all"
        />

        <div className="absolute right-2 flex items-center space-x-2">
          {/* Mic Button */}
          <button
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
            }`}
            title={isListening ? 'Stop Listening' : 'Hold / Click to Talk'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send text button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white disabled:opacity-40 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
