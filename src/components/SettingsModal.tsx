import React from 'react';
import { VoiceConfig } from '../types';
import { X, Settings as SettingsIcon, Volume2, Mic, Lock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceConfig: VoiceConfig;
  onSaveVoiceConfig: (cfg: VoiceConfig) => void;
  onOpenApiKeys?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  voiceConfig,
  onSaveVoiceConfig,
  onOpenApiKeys,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#212121] border border-[#2f2f2f] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2f2f2f] flex items-center justify-between bg-[#171717]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#10A37F]/20 flex items-center justify-center text-[#10A37F]">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#ECECF1]">AetherVoice Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9B9B9B] hover:text-[#ECECF1] hover:bg-[#2f2f2f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-[#ECECF1] bg-[#171717]">
          {/* Voice Engine Mode */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#ECECF1]">Speech Engine Mode</label>
            <div className="w-full p-2.5 rounded-xl bg-[#212121] border border-purple-500/40 text-xs font-semibold text-purple-200 flex items-center justify-between">
              <span>🎙️ ElevenLabs Multilingual v2 (Exclusive Hindi Speaker)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">Active</span>
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#ECECF1]">Gemini Prebuilt Voice</label>
            <select
              value={voiceConfig.voiceName}
              onChange={(e) => onSaveVoiceConfig({ ...voiceConfig, voiceName: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#212121] border border-[#2f2f2f] text-xs font-medium text-[#ECECF1] focus:outline-none focus:border-[#10A37F]"
            >
              <option value="Aoede">Aoede (Warm, Conversational Natural Female)</option>
              <option value="Kore">Kore (Balanced, Professional Female)</option>
              <option value="Zephyr">Zephyr (Warm, Natural Expressive Male)</option>
              <option value="Puck">Puck (Energetic, Lively Natural Male)</option>
              <option value="Fenrir">Fenrir (Deep, Resonant Male)</option>
              <option value="Charon">Charon (Rich, Calm Deep Male)</option>
            </select>
          </div>

          {/* Auto Speak Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#212121] border border-[#2f2f2f]">
            <div>
              <p className="font-bold text-[#ECECF1]">Auto-Speak AI Responses</p>
              <p className="text-[10px] text-[#9B9B9B]">Automatically speak text replies upon generation</p>
            </div>
            <button
              onClick={() => onSaveVoiceConfig({ ...voiceConfig, autoSpeak: !voiceConfig.autoSpeak })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                voiceConfig.autoSpeak ? 'bg-[#10A37F]' : 'bg-[#2f2f2f]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  voiceConfig.autoSpeak ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Hands-Free Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#212121] border border-[#2f2f2f]">
            <div>
              <p className="font-bold text-[#ECECF1]">Hands-Free Continuous Listening</p>
              <p className="text-[10px] text-[#9B9B9B]">Auto-restart microphone after AI completes speech</p>
            </div>
            <button
              onClick={() => onSaveVoiceConfig({ ...voiceConfig, handsFree: !voiceConfig.handsFree })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                voiceConfig.handsFree ? 'bg-[#10A37F]' : 'bg-[#2f2f2f]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  voiceConfig.handsFree ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Vocal Feeling & Emotional Expression */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#ECECF1]">Vocal Feeling & Expression</label>
            <select
              value={voiceConfig.vocalFeeling || 'natural'}
              onChange={(e) =>
                onSaveVoiceConfig({ ...voiceConfig, vocalFeeling: e.target.value as any })
              }
              className="w-full p-2.5 rounded-xl bg-[#212121] border border-[#2f2f2f] text-xs font-medium text-[#ECECF1] focus:outline-none focus:border-[#10A37F]"
            >
              <option value="natural">🗣️ Natural & Conversational (Friendly Human)</option>
              <option value="sad">😔 Sad, Somber & Slow Deep Voice (Charon/Fenrir Resonant Pitch)</option>
              <option value="warm">💙 Warm & Gentle (Soft, Compassionate & Reassuring)</option>
              <option value="upbeat">⚡ Upbeat & Lively (Dynamic & Energetic)</option>
              <option value="calm">🧘 Calm & Meditative (Relaxed & Slow Cadence)</option>
            </select>
          </div>

          {/* Response Speed Mode */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#ECECF1]">Response Speed Mode</label>
            <select
              value={voiceConfig.responseMode || 'balanced'}
              onChange={(e) =>
                onSaveVoiceConfig({ ...voiceConfig, responseMode: e.target.value as any })
              }
              className="w-full p-2.5 rounded-xl bg-[#212121] border border-[#2f2f2f] text-xs font-medium text-[#ECECF1] focus:outline-none focus:border-[#10A37F]"
            >
              <option value="quick">⚡ Quick (1–2 short direct sentences for minimal latency)</option>
              <option value="balanced">⚖️ Balanced (Standard natural conversational answer)</option>
              <option value="detailed">📖 Detailed (Comprehensive, structured explanation)</option>
            </select>
          </div>

          {/* Speech Speed Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-bold text-[#ECECF1]">Speech Speed</label>
              <span className="font-mono text-[#10A37F]">{voiceConfig.speed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={voiceConfig.speed}
              onChange={(e) =>
                onSaveVoiceConfig({ ...voiceConfig, speed: parseFloat(e.target.value) })
              }
              className="w-full accent-[#10A37F]"
            />
          </div>

          {/* Voice Pitch & Depth Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-bold text-[#ECECF1]">Voice Pitch & Depth</label>
              <span className="font-mono text-[#10A37F]">{voiceConfig.pitch || 1.0}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={voiceConfig.pitch || 1.0}
              onChange={(e) =>
                onSaveVoiceConfig({ ...voiceConfig, pitch: parseFloat(e.target.value) })
              }
              className="w-full accent-[#10A37F]"
            />
          </div>

          {/* API Key Validator Quick Link */}
          {onOpenApiKeys && (
            <div className="pt-2 border-t border-[#2f2f2f]">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenApiKeys();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-950/70 via-cyan-950/70 to-blue-950/70 border border-purple-500/30 hover:border-purple-400/60 text-purple-200 text-xs font-bold flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <span>🔑</span>
                  <span>API Keys (ElevenLabs Voice / Gemini / Groq)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                  Manage Keys
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2f2f2f] bg-[#171717]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#10A37F] hover:bg-[#0d8a6c] text-white font-bold text-xs shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
