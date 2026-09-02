export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  translatedText?: string;
  detectedLanguage?: string;
  phoneticSpelling?: string;
  alternativePhrasing?: string[];
  culturalNotes?: string;
  timestamp: string;
  audioBase64?: string;
  imageBase64?: string;
  sourceLang?: string;
  targetLang?: string;
  isStreaming?: boolean;
  aiUsed?: 'gemini' | 'groq' | 'search' | 'thinking' | string;
}

export interface SessionSummary {
  overview: string;
  keyTopics: string[];
  takeaways: string[];
  sentiment?: string;
  generatedAt?: string;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  sourceLang: string;
  targetLang: string;
  messages: ChatMessage[];
  pinned?: boolean;
  summary?: SessionSummary;
}

export interface AIModelTool {
  id: string;
  name: string;
  provider: string;
  icon: string;
  badge: string;
  description: string;
  status: 'active' | 'available' | 'key_required';
  color: string;
  capabilities: string[];
}

export type VisualizerPreset = 'quantum' | 'liquid' | 'spectrum' | 'particles';

export type VocalFeeling = 'natural' | 'sad' | 'warm' | 'upbeat' | 'calm';
export type ResponseMode = 'quick' | 'balanced' | 'detailed';

export interface VoiceConfig {
  voiceName: string;
  speed: number;
  pitch: number;
  autoSpeak: boolean;
  handsFree: boolean;
  visualizerPreset: VisualizerPreset;
  voiceEngine?: 'instant' | 'cloud' | 'elevenlabs';
  vocalFeeling?: VocalFeeling;
  responseMode?: ResponseMode;
}

export interface OSMPlace {
  id: string;
  osmType: 'node' | 'way' | 'relation';
  osmId: number;
  name: string;
  category: string;
  subCategory?: string;
  lat: number;
  lon: number;
  address: string;
  distanceMeters: number;
  osmUrl: string;
  phone?: string;
  website?: string;
  openingHours?: string;
}

export interface CustomApiKeys {
  gemini?: string;
  groq?: string;
  elevenlabs?: string;
  geminiValidatedAt?: string;
  groqValidatedAt?: string;
  elevenlabsValidatedAt?: string;
  geminiLatency?: number;
  groqLatency?: number;
  elevenlabsLatency?: number;
}

export interface ApiKeyValidationResult {
  valid: boolean;
  provider: 'gemini' | 'groq' | 'elevenlabs';
  latencyMs?: number;
  model?: string;
  message?: string;
  error?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  latencyMs?: number;
  timestamp: number;
}


