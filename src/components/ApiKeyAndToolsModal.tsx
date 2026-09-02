import React, { useState, useEffect } from 'react';
import { POPULAR_AI_TOOLS } from '../constants/models';
import { VoiceConfig, CustomApiKeys, ToastMessage } from '../types';
import {
  getCustomApiKeys,
  saveCustomApiKey,
  removeCustomApiKey,
  validateApiKey,
} from '../utils/storage';
import {
  X,
  Key,
  Check,
  ShieldCheck,
  Sparkles,
  Cpu,
  Bot,
  Volume2,
  Lock,
  ExternalLink,
  Zap,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Copy,
} from 'lucide-react';

interface ApiKeyAndToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceConfig: VoiceConfig;
  onSaveVoiceConfig: (config: VoiceConfig) => void;
  geminiConfigured: boolean;
  onShowToast?: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
}

export const ApiKeyAndToolsModal: React.FC<ApiKeyAndToolsModalProps> = ({
  isOpen,
  onClose,
  voiceConfig,
  onSaveVoiceConfig,
  geminiConfigured,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'validator' | 'tools' | 'settings'>('validator');
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'groq'>('gemini');
  
  // Custom API key states
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  
  // Validation progress & result states
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    provider: 'gemini' | 'groq';
    valid: boolean;
    latencyMs?: number;
    message?: string;
    error?: string;
  } | null>(null);

  const [savedKeys, setSavedKeys] = useState<CustomApiKeys>({});

  useEffect(() => {
    if (isOpen) {
      const keys = getCustomApiKeys();
      setSavedKeys(keys);
      if (keys.gemini) setGeminiKeyInput(keys.gemini);
      if (keys.groq) setGroqKeyInput(keys.groq);
      setValidationResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentInputKey = selectedProvider === 'gemini' ? geminiKeyInput : groqKeyInput;
  const currentSavedKey = selectedProvider === 'gemini' ? savedKeys.gemini : savedKeys.groq;
  const currentValidatedAt =
    selectedProvider === 'gemini' ? savedKeys.geminiValidatedAt : savedKeys.groqValidatedAt;
  const currentLatency =
    selectedProvider === 'gemini' ? savedKeys.geminiLatency : savedKeys.groqLatency;

  const handleValidateAndSave = async () => {
    const keyToTest = currentInputKey.trim();
    if (!keyToTest) {
      const msg = `Please enter a valid ${selectedProvider === 'gemini' ? 'Gemini' : 'Groq'} API key before testing.`;
      setValidationResult({
        provider: selectedProvider,
        valid: false,
        error: msg,
      });
      if (onShowToast) {
        onShowToast({
          type: 'warning',
          title: 'Empty API Key',
          description: msg,
        });
      }
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateApiKey(selectedProvider, keyToTest);
      setValidationResult({
        provider: selectedProvider,
        valid: result.valid,
        latencyMs: result.latencyMs,
        message: result.message,
        error: result.error,
      });

      if (result.valid) {
        // Save the verified key locally
        const updated = saveCustomApiKey(selectedProvider, keyToTest, result.latencyMs);
        setSavedKeys(updated);

        if (onShowToast) {
          onShowToast({
            type: 'success',
            title: `${selectedProvider === 'gemini' ? 'Gemini' : 'Groq'} Key Verified & Saved!`,
            description: result.message || `API key tested successfully with ${result.latencyMs}ms response time.`,
            latencyMs: result.latencyMs,
          });
        }
      } else {
        if (onShowToast) {
          onShowToast({
            type: 'error',
            title: `${selectedProvider === 'gemini' ? 'Gemini' : 'Groq'} Validation Failed`,
            description: result.error || 'Authentication error. Key was not saved.',
            latencyMs: result.latencyMs,
          });
        }
      }
    } catch (err: any) {
      const errorStr = err?.message || 'Failed to complete validation test.';
      setValidationResult({
        provider: selectedProvider,
        valid: false,
        error: errorStr,
      });
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Validation Network Error',
          description: errorStr,
        });
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveKey = (provider: 'gemini' | 'groq') => {
    const updated = removeCustomApiKey(provider);
    setSavedKeys(updated);
    if (provider === 'gemini') setGeminiKeyInput('');
    if (provider === 'groq') setGroqKeyInput('');
    setValidationResult(null);

    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: `${provider === 'gemini' ? 'Gemini' : 'Groq'} Custom Key Removed`,
        description: 'Reverted to standard system environment configuration.',
      });
    }
  };

  const handlePasteKey = async (provider: 'gemini' | 'groq') => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          if (provider === 'gemini') setGeminiKeyInput(text.trim());
          if (provider === 'groq') setGroqKeyInput(text.trim());
        }
      }
    } catch {
      // Clipboard permissions denied
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">API Key Validator & AI Engines</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                  Live Tester
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Low-Latency Validation & Key Management for Gemini and Groq AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 sm:px-5 pt-2 gap-1 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('validator')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'validator'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>API Key Validator</span>
            {(savedKeys.gemini || savedKeys.groq) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tools'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Ecosystem ({POPULAR_AI_TOOLS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'settings'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice Controls</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {activeTab === 'validator' && (
            <div className="space-y-4 text-xs">
              {/* Provider Selection Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProvider('gemini');
                    setValidationResult(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold transition-all ${
                    selectedProvider === 'gemini'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="text-base">⚡</span>
                  <div className="text-left">
                    <div className="text-xs">Google Gemini</div>
                    <div className="text-[10px] opacity-75 font-normal">gemini-2.5-flash / 3.6</div>
                  </div>
                  {savedKeys.gemini && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-auto" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedProvider('groq');
                    setValidationResult(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold transition-all ${
                    selectedProvider === 'groq'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="text-base">🚀</span>
                  <div className="text-left">
                    <div className="text-xs">Groq Cloud AI</div>
                    <div className="text-[10px] opacity-75 font-normal">Llama 3.3 / Ultra-Fast</div>
                  </div>
                  {savedKeys.groq && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-auto" />
                  )}
                </button>
              </div>

              {/* Status Header for Selected Provider */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        currentSavedKey
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                          : selectedProvider === 'gemini' && geminiConfigured
                          ? 'bg-blue-400'
                          : 'bg-zinc-600'
                      }`}
                    />
                    <span className="font-bold text-slate-200">
                      {selectedProvider === 'gemini' ? 'Gemini Provider Status' : 'Groq Provider Status'}:
                    </span>
                    <span
                      className={`font-semibold ${
                        currentSavedKey
                          ? 'text-emerald-400'
                          : selectedProvider === 'gemini' && geminiConfigured
                          ? 'text-blue-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {currentSavedKey
                        ? 'Custom Key Verified & Active'
                        : selectedProvider === 'gemini' && geminiConfigured
                        ? 'Server Environment Active'
                        : 'Default Server Key'}
                    </span>
                  </div>

                  {currentLatency !== undefined && (
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Zap className="w-3 h-3" />
                      <span>{currentLatency}ms</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {selectedProvider === 'gemini'
                    ? 'Enter your personal Gemini API key from Google AI Studio to route requests directly or verify your credentials.'
                    : 'Enter your Groq API key (gsk_...) to unlock ultra-fast Llama 3.3 and sub-100ms inference.'}
                </p>
              </div>

              {/* API Key Input Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300">
                    {selectedProvider === 'gemini' ? 'Gemini API Key' : 'Groq API Key'}
                  </label>
                  <button
                    type="button"
                    onClick={() => handlePasteKey(selectedProvider)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Paste from clipboard</span>
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={
                      (selectedProvider === 'gemini' ? showGeminiKey : showGroqKey)
                        ? 'text'
                        : 'password'
                    }
                    value={selectedProvider === 'gemini' ? geminiKeyInput : groqKeyInput}
                    onChange={(e) => {
                      if (selectedProvider === 'gemini') setGeminiKeyInput(e.target.value);
                      if (selectedProvider === 'groq') setGroqKeyInput(e.target.value);
                    }}
                    placeholder={
                      selectedProvider === 'gemini'
                        ? 'AIzaSy...'
                        : 'gsk_...'
                    }
                    className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedProvider === 'gemini') setShowGeminiKey(!showGeminiKey);
                        if (selectedProvider === 'groq') setShowGroqKey(!showGroqKey);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                      title={
                        (selectedProvider === 'gemini' ? showGeminiKey : showGroqKey)
                          ? 'Hide Key'
                          : 'Show Key'
                      }
                    >
                      {(selectedProvider === 'gemini' ? showGeminiKey : showGroqKey) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isValidating || !currentInputKey.trim()}
                  onClick={handleValidateAndSave}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all active:scale-95 ${
                    isValidating
                      ? 'bg-cyan-600 opacity-75 cursor-not-allowed'
                      : !currentInputKey.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : selectedProvider === 'gemini'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-95 shadow-cyan-500/20'
                      : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-95 shadow-orange-500/20'
                  }`}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Testing Key (Low-Latency Call)...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Validate & Save {selectedProvider === 'gemini' ? 'Gemini' : 'Groq'} Key</span>
                    </>
                  )}
                </button>

                {currentSavedKey && (
                  <button
                    type="button"
                    onClick={() => handleRemoveKey(selectedProvider)}
                    className="flex items-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 font-bold transition-all"
                    title="Remove custom key and reset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Live Inline Validation Result Box */}
              {validationResult && (
                <div
                  className={`p-3.5 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-2 ${
                    validationResult.valid
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {validationResult.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs">
                          {validationResult.valid
                            ? '✅ Key Successfully Verified & Stored'
                            : '❌ Validation Failed'}
                        </span>
                        {validationResult.latencyMs !== undefined && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                            Latency: {validationResult.latencyMs}ms
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">
                        {validationResult.message || validationResult.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Links to Get Free API Keys */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 text-[11px]">Need an API Key?</span>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <span>Google AI Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-600">•</span>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <span>Groq Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Both Google AI Studio and Groq provide generous free tier quotas for real-time speech and lightning fast completions.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-4">
              {/* Server Key Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-300">Google Gemini Connected</p>
                  <p className="text-emerald-400/80 mt-0.5 text-[11px]">
                    Server environment secrets securely power live voice streaming and search grounding.
                  </p>
                </div>
              </div>

              {/* Grid of Flagship AI Tool Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {POPULAR_AI_TOOLS.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center text-white`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{tool.name}</h4>
                          <span className="text-[10px] text-slate-400">{tool.provider}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          tool.status === 'active'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {tool.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">{tool.description}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {tool.capabilities.map((cap, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[9px] rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4 text-xs text-slate-200">
              {/* Voice Speed */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-300">Speech Output Speed</label>
                  <span className="text-cyan-400 font-mono font-bold">{voiceConfig.speed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={voiceConfig.speed}
                  onChange={(e) =>
                    onSaveVoiceConfig({ ...voiceConfig, speed: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Voice Pitch */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-300">Voice Pitch</label>
                  <span className="text-indigo-400 font-mono font-bold">{voiceConfig.pitch}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={voiceConfig.pitch}
                  onChange={(e) =>
                    onSaveVoiceConfig({ ...voiceConfig, pitch: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-400"
                />
              </div>

              {/* Default Voice */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">Neural Voice Profile</label>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    HD Studio
                  </span>
                </div>
                <select
                  value={voiceConfig.voiceName}
                  onChange={(e) => onSaveVoiceConfig({ ...voiceConfig, voiceName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                >
                  <optgroup label="Google Neural2 Voices (Ultra-Natural Hindi)">
                    <option value="hi-IN-Neural2-A">Google Neural2-A (Female - Clear Studio Pro)</option>
                    <option value="hi-IN-Neural2-D">Google Neural2-D (Female - Warm Conversational)</option>
                    <option value="hi-IN-Neural2-B">Google Neural2-B (Male - Confident Professional)</option>
                    <option value="hi-IN-Neural2-C">Google Neural2-C (Male - Natural Deep)</option>
                  </optgroup>
                  <optgroup label="Gemini AI Studio Voices">
                    <option value="Aoede">Aoede (Warm Conversational Female)</option>
                    <option value="Kore">Kore (Balanced Expressive Female)</option>
                    <option value="Zephyr">Zephyr (Warm Natural Expressive Male)</option>
                    <option value="Puck">Puck (Energetic Clear Lively Male)</option>
                    <option value="Fenrir">Fenrir (Deep Resonant Male)</option>
                    <option value="Charon">Charon (Rich Calm Deep Male)</option>
                  </optgroup>
                  <optgroup label="Edge Neural (Free Fallback)">
                    <option value="hi-IN-SwaraNeural">Swara Neural (Female - Natural Hindi)</option>
                    <option value="hi-IN-MadhurNeural">Madhur Neural (Male - Smooth Hindi)</option>
                  </optgroup>
                </select>
                <p className="text-[10.5px] text-slate-400">
                  Your Gemini / Google API Key unlocks Google Cloud Neural2 and Gemini Flash AI speech synthesis.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Local Credentials</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
