/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from './utils/api';
import {
  ConversationSession,
  ChatMessage,
  Language,
  VoiceConfig,
  ToastMessage,
  CustomApiKeys,
} from './types';
import { POPULAR_LANGUAGES, AUTO_DETECT_LANGUAGE, DEFAULT_LANGUAGE } from './constants/languages';
import {
  getSavedSessions,
  saveSession,
  deleteSession,
  clearAllSessions,
  getVoiceConfig,
  saveVoiceConfig,
  exportHistoryJSON,
  getCustomApiKeys,
} from './utils/storage';
import { exportSessionPDF } from './utils/pdfExport';
import {
  createSpeechRecognizer,
  speakHindi,
  stopSpeech,
  playTextToSpeech,
  playBase64Audio,
  playStreamedAudio,
  SentenceSpeechQueue,
  StreamAudioPlayerControls,
} from './utils/speech';

import { HeaderBar } from './components/HeaderBar';
import { VoiceOrb } from './components/VoiceOrb';
import { LiveTranscriptView } from './components/LiveTranscriptView';
import { ToolsMenu } from './components/ToolsMenu';
import { TextInputBar } from './components/TextInputBar';

import { CalculatorModal } from './components/CalculatorModal';
import { ImageAnalysisModal } from './components/ImageAnalysisModal';
import { FullConversationModal } from './components/FullConversationModal';
import { ProfileModal } from './components/ProfileModal';
import { UserProfileModal } from './components/UserProfileModal';
import { WorkspacePanel } from './components/WorkspacePanel';
import { SpaceBackground } from './components/SpaceBackground';
import { SettingsModal } from './components/SettingsModal';
import { TranslatorModal } from './components/TranslatorModal';
import { PlacesModal } from './components/PlacesModal';
import { ClickCraftMobileChat } from './components/ClickCraftMobileChat';
import { ToastContainer } from './components/Toast';
import { isLocationSearchQuery } from './services/osmPlaces';
import { getStoredGoogleAccessToken } from './services/calendarService';
import {
  seedTrainingDataToFirestore,
  logConversationToFirebase,
  findInstantFirebaseAnswer,
  matchFAQFromFirebase,
  initLiveFirestoreFAQsListener,
  fetchFAQsFromFirestore,
} from './services/firebaseTrainingService';

export default function App() {
  // State: Sessions & Active Session
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [activeSession, setActiveSession] = useState<ConversationSession | null>(null);

  // State: Text Input
  const [inputText, setInputText] = useState('');

  // State: Languages (Default: Hindi हिन्दी)
  const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [sourceLang, setSourceLang] = useState<Language>(DEFAULT_LANGUAGE);
  const [targetLang, setTargetLang] = useState<Language>(POPULAR_LANGUAGES[1]); // English

  // State: Voice Animation States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [liveSpeechText, setLiveSpeechText] = useState('');

  // State: Tool Modes & Modals
  const [modelMode, setModelMode] = useState<'auto' | 'search' | 'low-latency' | 'thinking'>('auto');
  const [isWebSearchActive, setIsWebSearchActive] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isImageAnalysisOpen, setIsImageAnalysisOpen] = useState(false);
  const [isFullConversationOpen, setIsFullConversationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const [spaceTheme, setSpaceTheme] = useState('google-gradient');

  // State: Toasts & Custom API Keys
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [customKeys, setCustomKeys] = useState<CustomApiKeys>(() => getCustomApiKeys());
  const [geminiConfigured] = useState(true);

  const addToast = (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id, timestamp: Date.now() }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // State: Credits & Premium
  const [creditsUsed, setCreditsUsed] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('creditsUsed') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isPremium') === 'true';
    } catch {
      return false;
    }
  });
  const [isCreditsOverlayOpen, setIsCreditsOverlayOpen] = useState(false);

  const hasCreditsLeft = () => isPremiumUser || creditsUsed < 10;

  // Voice Config
  const [voiceConfig, setVoiceConfigState] = useState<VoiceConfig>(getVoiceConfig());

  // Refs
  const recognizerRef = useRef<any>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const activeStreamPlayerRef = useRef<StreamAudioPlayerControls | null>(null);
  const speechQueueRef = useRef<SentenceSpeechQueue | null>(null);

  // Mount setup: load saved sessions & sync Firebase training dataset
  useEffect(() => {
    const saved = getSavedSessions();
    setSessions(saved);

    if (saved.length > 0) {
      setActiveSession(saved[0]);
    } else {
      createNewSession();
    }

    // Auto-seed and listen to ClickCraft live knowledge base & FAQs from Firebase Firestore
    seedTrainingDataToFirestore();
    fetchFAQsFromFirestore();
    const unsubFaqs = initLiveFirestoreFAQsListener();

    return () => {
      stopListeningProcess();
      unsubFaqs();
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const updateCurrentSession = (updatedSession: ConversationSession) => {
    setActiveSession(updatedSession);
    saveSession(updatedSession);
    setSessions(getSavedSessions());
  };

  const createNewSession = () => {
    const newSess: ConversationSession = {
      id: `sess_${Date.now()}`,
      title: `Voice Session ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceLang: currentLanguage.name,
      targetLang: targetLang.name,
      messages: [],
    };
    saveSession(newSess);
    setActiveSession(newSess);
    setSessions(getSavedSessions());
  };

  // Microphone listening handler
  const startListeningProcess = async () => {
    if (!hasCreditsLeft()) {
      setIsCreditsOverlayOpen(true);
      setErrorMessage('आज के Free credits खत्म हो गए हैं। कृपया Premium Unlock करें।');
      return;
    }

    if (isListening) return;

    setHasError(false);
    setErrorMessage('');
    setIsListening(true);
    setLiveSpeechText('');

    stopSpeaking();

    // Initialize Web Speech Recognizer
    const recognizer = createSpeechRecognizer(
      currentLanguage.speechCode || 'hi-IN',
      (result) => {
        setLiveSpeechText(result.transcript);
        if (result.isFinal && result.transcript.trim()) {
          stopListeningProcess();
          handleProcessUserPrompt(result.transcript.trim());
        }
      },
      (errorMsg) => {
        if (errorMsg === 'no-speech') {
          // Ignore no-speech errors to allow user to think
          return;
        }
        setHasError(true);
        setErrorMessage(errorMsg || 'Microphone connection failed.');
        stopListeningProcess();
      },
      () => {
        // Only turn off if we didn't just get an error that we ignored
        setIsListening(false);
      },
      () => {
        // Instant Barge-In: stop AI speech playback as soon as user speaks
        stopSpeaking();
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
      } catch (e: any) {
        console.warn('Recognizer start notice:', e);
        setHasError(true);
        setErrorMessage(e?.message || 'Failed to start microphone.');
        setIsListening(false);
      }
    }
  };

  const stopListeningProcess = () => {
    setIsListening(false);
    if (recognizerRef.current) {
      try {
        recognizerRef.current.abort ? recognizerRef.current.abort() : recognizerRef.current.stop();
      } catch {}
      recognizerRef.current = null;
    }
  };

  const toggleListening = () => {
    if (!hasCreditsLeft()) {
      setIsCreditsOverlayOpen(true);
      return;
    }

    // Unlock Web Speech API on mobile devices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const dummy = new SpeechSynthesisUtterance('');
      dummy.volume = 0;
      window.speechSynthesis.speak(dummy);
    }

    if (isSpeaking) {
      stopSpeaking();
    }
    if (isListening) {
      stopListeningProcess();
    } else {
      startListeningProcess();
    }
  };

  const stopSpeaking = () => {
    if (speechQueueRef.current) {
      speechQueueRef.current.clear();
      speechQueueRef.current = null;
    }
    if (activeStreamPlayerRef.current) {
      activeStreamPlayerRef.current.stop();
      activeStreamPlayerRef.current = null;
    }
    stopSpeech();
    setIsSpeaking(false);
  };

  // Main Prompt Processing with Server-Side Gemini API
  const handleProcessUserPrompt = async (promptText: string, attachedImage?: string) => {
    if (!activeSession) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setHasError(true);
      setErrorMessage('You are currently offline. Please reconnect to the internet to chat with ClickCraft.');
      addToast({
        type: 'error',
        title: 'Offline Mode',
        description: 'Internet connection is required to send messages.',
      });
      return;
    }

    if (!hasCreditsLeft()) {
      setIsCreditsOverlayOpen(true);
      return;
    }

    setHasError(false);
    stopSpeaking();

    // Unlock Web Speech API on mobile devices by playing a silent utterance immediately
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const dummy = new SpeechSynthesisUtterance('');
      dummy.volume = 0;
      window.speechSynthesis.speak(dummy);
    }

    const isSearchActive = isWebSearchActive || modelMode === 'search';
    const isThinkingActive = modelMode === 'thinking';
    const isLowLatencyActive = modelMode === 'low-latency';

    const aiUsedType: 'gemini' | 'groq' | 'search' | 'thinking' = isLowLatencyActive
      ? 'groq'
      : isSearchActive
      ? 'search'
      : isThinkingActive
      ? 'thinking'
      : 'gemini';

    const userMessage: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      text: promptText,
      imageBase64: attachedImage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceLang: currentLanguage.name,
      targetLang: targetLang.name,
    };

    const assistantMsgId = `msg_a_${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceLang: currentLanguage.name,
      targetLang: targetLang.name,
      isStreaming: true,
      aiUsed: aiUsedType,
    };

    const updatedMessages = [...activeSession.messages, userMessage, initialAssistantMessage];
    const sessionWithUser = {
      ...activeSession,
      title: activeSession.messages.length === 0 ? promptText.slice(0, 30) : activeSession.title,
      messages: updatedMessages,
    };

    updateCurrentSession(sessionWithUser);
    setIsThinking(true);

    // Behavior Rules 1 & 2:
    // 1. Check if user's question closely matches any question stored in "faqs" collection in Firebase.
    // 2. If a close match is found, return ONLY that stored answer exactly as written in Firebase.
    const directFaqAnswer = matchFAQFromFirebase(promptText);
    if (directFaqAnswer) {
      setIsThinking(false);

      setActiveSession((curr) => {
        if (!curr) return null;
        const finalMsgs = curr.messages.map((m) => {
          if (m.id === assistantMsgId) {
            return {
              ...m,
              text: directFaqAnswer,
              isStreaming: false,
              aiUsed: 'firebase',
            };
          }
          return m;
        });
        const updated = { ...curr, messages: finalMsgs };
        saveSession(updated);
        return updated;
      });

      if (voiceConfig.autoSpeak) {
        handlePlaySpeech(directFaqAnswer, currentLanguage.speechCode, assistantMsgId);
      }

      logConversationToFirebase(
        promptText,
        directFaqAnswer,
        currentLanguage.label || currentLanguage.name
      );
      return;
    }

    try {
      const promptToSend = isSearchActive
        ? `[Search Grounding Enabled] ${promptText}`
        : isThinkingActive
        ? `[Thinking Mode] ${promptText}`
        : promptText;

      const response = await apiRequest('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          image: attachedImage,
          mode: 'chat',
          modelMode,
          isThinkingMode: isThinkingActive,
          isLowLatency: isLowLatencyActive,
          useSearchGrounding: isSearchActive,
          sourceLang: currentLanguage.name,
          targetLang: targetLang.name,
          responseMode: voiceConfig.responseMode || 'balanced',
          vocalFeeling: voiceConfig.vocalFeeling || 'natural',
          history: activeSession.messages,
          accessToken: getStoredGoogleAccessToken() || undefined,
          customGeminiKey: getCustomApiKeys().gemini || undefined,
        }),
      });

      if (!response.body) {
        throw new Error('ReadableStream not supported.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let streamedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const rawPart of parts) {
          const lines = rawPart.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;

            if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.replace('data: ', '').trim();
              if (jsonStr === '[DONE]') break;

              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.text) {
                  streamedText += parsed.text;

                  setSessions((prevSessions) => {
                    return prevSessions.map((s) => {
                      if (s.id === activeSession.id) {
                        const msgs = s.messages.map((m) => {
                          if (m.id === assistantMsgId) {
                            return { ...m, text: streamedText, aiUsed: aiUsedType };
                          }
                          return m;
                        });
                        return { ...s, messages: msgs };
                      }
                      return s;
                    });
                  });
                }
              } catch {}
            }
          }
        }
      }

      setIsThinking(false);

      const fallbackIfEmpty = findInstantFirebaseAnswer(promptText, currentLanguage.code || 'hi-IN') || 'ClickCraft डिजिटल मार्केटिंग: हमारी सर्विसेज़ (₹500 Ads, ₹5000 Website, ₹10000 Combo) और बिज़नेस ग्रोथ के लिए WhatsApp (+91 9376124893) पर संपर्क करें।';
      const finalAssistantMsgText = streamedText.trim() || fallbackIfEmpty;

      // Deduct/Track free credits
      if (!isPremiumUser) {
        const updatedCredits = creditsUsed + 1;
        setCreditsUsed(updatedCredits);
        try {
          localStorage.setItem('creditsUsed', String(updatedCredits));
        } catch {}
        if (updatedCredits >= 10) {
          setIsCreditsOverlayOpen(true);
        }
      }

      // Log conversation to Firebase Firestore for continuous AI training
      logConversationToFirebase(
        promptText,
        finalAssistantMsgText,
        currentLanguage.label || currentLanguage.name
      );

      setActiveSession((curr) => {
        if (!curr) return null;
        const finalMsgs = curr.messages.map((m) => {
          if (m.id === assistantMsgId) {
            return {
              ...m,
              text: finalAssistantMsgText,
              isStreaming: false,
              aiUsed: aiUsedType,
            };
          }
          return m;
        });
        const updated = { ...curr, messages: finalMsgs };
        saveSession(updated);
        return updated;
      });

      // Automatic ElevenLabs speech playback trigger
      if (voiceConfig.autoSpeak && finalAssistantMsgText) {
        handlePlaySpeech(finalAssistantMsgText, currentLanguage.speechCode, assistantMsgId);
      }
    } catch (error: any) {
      console.error('Processing error:', error);
      
      // Check if we can answer immediately from Firebase Knowledge Base
      const firebaseDirectAnswer = findInstantFirebaseAnswer(promptText, currentLanguage.code || 'hi-IN');
      const fallbackMsg = firebaseDirectAnswer || 'ClickCraft डिजिटल मार्केटिंग असिस्टेंट: हमारी सर्विसेज़ (₹500 Ads, ₹5000 Website, ₹10000 Combo) और अन्य सहायता के लिए WhatsApp (+91 9376124893) पर संपर्क करें।';

      setIsThinking(false);

      setActiveSession((curr) => {
        if (!curr) return null;
        const finalMsgs = curr.messages.map((m) => {
          if (m.id === assistantMsgId) {
            return {
              ...m,
              text: fallbackMsg,
              isStreaming: false,
              aiUsed: 'firebase',
            };
          }
          return m;
        });
        const updated = { ...curr, messages: finalMsgs };
        saveSession(updated);
        return updated;
      });

      if (voiceConfig.autoSpeak) {
        handlePlaySpeech(fallbackMsg, currentLanguage.speechCode, assistantMsgId);
      }
    }
  };

  // Stop audio playback
  const handleStopAudio = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setActiveSpeakingId(null);
    if (activeStreamPlayerRef.current) {
      activeStreamPlayerRef.current.stop();
      activeStreamPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  };

  // Play Speech Output with natural Hindi voice selection or Google Cloud TTS
  const handlePlaySpeech = async (text: string, langCode = 'hi-IN', msgId?: string) => {
    handleStopAudio();
    setIsSpeaking(true);
    if (msgId) setActiveSpeakingId(msgId);

    // Sanitize any bracket tags like [REALTIME_DATA_NEEDED] for smooth spoken voice
    const cleanSpokenText = text
      .replace(/\[REALTIME_DATA_NEEDED\]/g, '')
      .replace(/[*#_~`>]/g, '')
      .trim();

    if (!cleanSpokenText) {
      setIsSpeaking(false);
      setActiveSpeakingId(null);
      return;
    }

    const onPlaybackEnd = () => {
      setIsSpeaking(false);
      setActiveSpeakingId(null);
      activeStreamPlayerRef.current = null;
      if (voiceConfig.handsFree) {
        startListeningProcess();
      }
    };

    speakHindi(
      cleanSpokenText,
      () => {
        setIsSpeaking(true);
        if (msgId) setActiveSpeakingId(msgId);
      },
      onPlaybackEnd,
      (err) => {
        console.warn('Speech playback error:', err);
        onPlaybackEnd();
      }
    );
  };

  const handleQuickTranslateApi = async (text: string, sourceLangName: string, targetLangName: string) => {
    const res = await apiRequest('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLang: sourceLangName, targetLang: targetLangName }),
    });
    return await res.json();
  };

  const handleSaveVoiceConfig = (newCfg: VoiceConfig) => {
    setVoiceConfigState(newCfg);
    saveVoiceConfig(newCfg);
  };

  const handleClearHistory = () => {
    if (activeSession) {
      const cleared = { ...activeSession, messages: [] };
      updateCurrentSession(cleared);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isThinking) return;
    setInputText('');
    handleProcessUserPrompt(query.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#082E32] via-[#051E21] to-[#041618] text-white flex flex-col justify-center items-center font-sans antialiased overflow-x-hidden p-0 sm:p-4">
      {/* Mobile Chat Interface Container (High-graphic, dark slate/teal & Gold #E8B923) */}
      <ClickCraftMobileChat
        messages={activeSession?.messages || []}
        isStreaming={isSpeaking || isThinking}
        isListening={isListening}
        isThinking={isThinking}
        isSpeaking={isSpeaking}
        activeSpeakingId={activeSpeakingId}
        inputText={inputText}
        onInputChange={setInputText}
        onSendMessage={handleSendMessage}
        onToggleVoice={toggleListening}
        onPlayAudio={(text, msgId) => handlePlaySpeech(text, currentLanguage.speechCode, msgId)}
        onStopAudio={handleStopAudio}
        onClearHistory={handleClearHistory}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      {/* Tool & Settings Modals */}
      <ImageAnalysisModal
        isOpen={isImageAnalysisOpen}
        onClose={() => setIsImageAnalysisOpen(false)}
        onSubmitImageAnalysis={(prompt, image) => handleProcessUserPrompt(prompt, image)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voiceConfig={voiceConfig}
        onSaveVoiceConfig={handleSaveVoiceConfig}
        onOpenApiKeys={() => {}}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Free Credits Finished / Upgrade Overlay Modal */}
      {isCreditsOverlayOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#161F33] text-white rounded-[20px] p-6 max-w-sm w-full text-center border border-[#E8B923]/40">
            <div className="text-4xl mb-2 text-[#E8B923]">⭐</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Free Messages Exhausted
            </h2>
            <p className="text-xs text-[#8A93A6] mb-4 leading-relaxed">
              ClickCraft Assistant allows free questions daily. Upgrade to Premium for unlimited campaign consultations and instant priority responses.
            </p>
            <div className="text-2xl font-black text-[#E8B923] mb-4">
              ₹99 <span className="text-xs font-normal text-[#8A93A6]">/month</span>
            </div>
            <button
              onClick={() => {
                setIsPremiumUser(true);
                try {
                  localStorage.setItem('isPremium', 'true');
                } catch {}
                setIsCreditsOverlayOpen(false);
              }}
              className="w-full py-3 px-4 rounded-full font-bold text-sm text-[#0B1220] bg-[#E8B923] hover:bg-[#d4a81f] transition-all mb-2.5 active:scale-95"
            >
              Unlock Premium
            </button>
            <button
              onClick={() => {
                setCreditsUsed(0);
                try {
                  localStorage.setItem('creditsUsed', '0');
                } catch {}
                setIsCreditsOverlayOpen(false);
              }}
              className="w-full py-2 text-xs text-[#8A93A6] hover:text-white font-medium transition-colors border border-[#161F33] rounded-full hover:bg-[#161F33]"
            >
              Add 10 Free Credits
            </button>
            <button
              onClick={() => setIsCreditsOverlayOpen(false)}
              className="mt-3 text-[11px] text-[#8A93A6] hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
